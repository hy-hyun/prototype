import { writable, derived, get } from "svelte/store";
import type { Application, CartItem, Lecture, Notice, ToastMessage, Gap, TravelInfo, RiskLevel } from "$lib/types";
import { MOCK_NOTICES, SCHEDULE_EVENTS } from "$lib/mock/data";
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { db } from '$lib/firebase';
import { LocalStorageCache, CACHE_KEYS } from '$lib/utils';

// 로딩 상태 관리
export const isLoading = writable(false);
export const loadingText = writable('로딩 중...');
export const coursesLoading = writable(false);
export const coursesError = writable<string | null>(null);
export const userDataLoading = writable(false);

// 전역 로딩 상태 (coursesLoading 또는 userDataLoading이 true이면 true)
export const globalLoading = derived(
  [coursesLoading, userDataLoading],
  ([$coursesLoading, $userDataLoading]) => $coursesLoading || $userDataLoading
);

let isUserDataLoaded = false; // 사용자 데이터 로딩 상태 플래그

// 사용자 데이터는 로컬 캐시만 사용 (Firebase 읽기/쓰기 금지)
export async function loadUserData(userId: string) {
  if (isUserDataLoaded) return; // 이미 로드되었으면 중복 실행 방지
  
  // 캐시에서만 확인 (Firebase 접근 금지)
  const cacheKey = CACHE_KEYS.USER_DATA(userId);
  const cachedData = LocalStorageCache.get<{ cart: CartItem[], applications: Application[] }>(cacheKey);
  
  if (cachedData) {
    cart.set(cachedData.cart || []);
    applications.set(cachedData.applications || []);
  } else {
    // 캐시가 없으면 빈 데이터로 초기화
    cart.set([]);
    applications.set([]);
  }
  
  isUserDataLoaded = true;
}

// 사용자 데이터는 로컬 캐시에만 저장 (Firebase 쓰기 금지)
async function saveUserData(userId: string, data: { cart?: CartItem[], applications?: Application[] }) {
  if (!userId) return;
  
  // Firebase 쓰기 작업 제거 - 로컬 캐시에만 저장
  const cacheKey = CACHE_KEYS.USER_DATA(userId);
  const cachedData = LocalStorageCache.get<{ cart: CartItem[], applications: Application[] }>(cacheKey);
  
  if (cachedData) {
    const updatedData = { ...cachedData, ...data };
    LocalStorageCache.set(cacheKey, updatedData, LocalStorageCache.EXPIRY_TIMES.SHORT);
  } else {
    // 새로운 캐시 생성
    const newData = { cart: [], applications: [], ...data };
    LocalStorageCache.set(cacheKey, newData, LocalStorageCache.EXPIRY_TIMES.SHORT);
  }
}

export const courses = writable<Lecture[]>([]);
export const filterOptions = writable({
  categories: [] as { value: string; label: string }[],
  departments: [] as { value: string; label: string }[],
  liberalArtsAreas: [] as { value: string; label: string }[],
  courseTypes: [] as { value: string; label: string }[],
  instructors: [] as { value: string; label: string }[],
  courseLevels: [] as { value: string; label: string }[]
});

// Firebase에서 강의 데이터 로드 (캐싱 적용)
export async function loadCourses(limitCount: number = 1000, forceRefresh: boolean = false) {
  coursesError.set(null);
  
  // forceRefresh가 true이면 캐시를 무시하고 새로 로드
  if (!forceRefresh) {
    // 캐시에서 먼저 확인
    const cachedCourses = LocalStorageCache.get<Lecture[]>(CACHE_KEYS.COURSES);
    const cachedFilterOptions = LocalStorageCache.get<{
      categories: { value: string; label: string }[];
      departments: { value: string; label: string }[];
      liberalArtsAreas: { value: string; label: string }[];
      courseTypes: { value: string; label: string }[];
      instructors: { value: string; label: string }[];
      courseLevels: { value: string; label: string }[];
    }>(CACHE_KEYS.FILTER_OPTIONS);
    
    if (cachedCourses && cachedFilterOptions) {
      console.log('📚 캐시된 강의 데이터 사용 중 (개수:', cachedCourses.length, ')');
      courses.set(cachedCourses);
      filterOptions.set(cachedFilterOptions);
      return;
    }
  } else {
    console.log('🔄 강제 새로고침 - 캐시 무시하고 Firebase에서 새로 로드');
  }

  coursesLoading.set(true);
  loadingText.set('강의 데이터 로딩 중...');

  try {
    console.log('🔥 Firebase 연결 시작...');
    
    // 쿼리 최적화: limit과 orderBy 적용
    const coursesRef = collection(db, 'courses');
    console.log('📚 courses 컬렉션 참조 생성 완료');
    
    const coursesQuery = query(
      coursesRef,
      orderBy('subjectName') // 과목명으로 정렬
      // limit 제거 - 모든 데이터 로드
    );
    console.log('🔍 쿼리 생성 완료');

    const querySnapshot = await getDocs(coursesQuery);
    console.log(`📊 Firebase에서 ${querySnapshot.size}개 문서 로딩 완료`);

    const rawCourseData: any[] = [];
    const lectureData: Lecture[] = [];

    let index = 0;
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // 원본 데이터 저장 (필터 생성용)
      rawCourseData.push(data);

      // 처음 10개 문서의 데이터 구조를 자세히 로깅 (디버깅용)
      if (index < 10) {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`🔍 Firebase 문서 ${index + 1} (ID: ${doc.id})`);
        console.log(`📄 전체 원본 데이터:`, JSON.stringify(data, null, 2));
        
        console.log(`\n📋 필드 분석:`);
        console.log(`  강의명: "${data.subjectName || data.courseName || data.title || 'N/A'}"`);
        console.log(`  문서 ID: ${doc.id}`);
        console.log(`  전체 키 목록: [${Object.keys(data).join(', ')}]`);
        
        console.log(`\n⏰ 시간 관련 필드들:`);
        Object.keys(data).forEach(key => {
          if (key.toLowerCase().includes('time') || key.toLowerCase().includes('schedule') || 
              key.toLowerCase().includes('class') || key.toLowerCase().includes('meeting')) {
            console.log(`    ${key}: ${JSON.stringify(data[key])}`);
          }
        });
        
        console.log(`\n🏢 장소 관련 필드들:`);
        Object.keys(data).forEach(key => {
          if (key.toLowerCase().includes('location') || key.toLowerCase().includes('room') || 
              key.toLowerCase().includes('building') || key.toLowerCase().includes('classroom') ||
              key.toLowerCase().includes('venue') || key.toLowerCase().includes('place') ||
              key.toLowerCase().includes('facility')) {
            console.log(`    ${key}: ${JSON.stringify(data[key])}`);
          }
        });
        
        console.log(`\n🔍 기타 중요 필드들:`);
        ['instructor', 'department', 'offeringDepartment', 'courseNumber', 'subjectCode', 'courseId'].forEach(key => {
          if (data[key] !== undefined) {
            console.log(`    ${key}: ${JSON.stringify(data[key])}`);
          }
        });
        
        console.log(`${'='.repeat(80)}\n`);
      }

      // Firebase 데이터 구조에 맞춰 매핑
      const mappedLecture = {
        courseId: data.courseNumber || data.subjectCode || data.courseId || '',
        classId: data.class || data.classNumber || '01',
        title: data.subjectName || data.courseName || data.title || '',
        category: data.category || data.courseType || '교양',
        dept: data.offeringDepartment || data.department || '',
        instructor: typeof data.instructor === 'object' ? data.instructor.name : data.instructor || '',
        credits: {
          lecture: data.creditHours || data.credits || 3,
          lab: 0
        },
        schedule: parseSchedule(
          data.schedule || 
          data.timeTable || 
          data.classTime || 
          data.meetingTimes || 
          data.times || 
          data.classSchedule ||
          data.lectureSchedule ||
          data.courseSchedule ||
          data.weeklySchedule ||
          data.lectureTimes ||
          data.classHours ||
          data.timeSlots ||
          data.periods ||
          data.sessions,
          data.location // 최상위 레벨의 location 정보도 전달
        ),
        capacity: calculateCapacity(data.enrollmentCapByYear || data.capacity),
        area: data.liberalArtsArea || data.area || data.category || '',
        limit: data.restrictions || data.prerequisites || '',
        keywords: data.keywords || [],
        method: (data.registrationMethod === '베팅' ? 'BID' : 'FCFS') as 'FCFS' | 'BID',
        courseLevel: data.courseLevel ? data.courseLevel.toString() : undefined
      };
      
      // 처음 5개 강의의 매핑 결과 로깅 - 장소 정보 포함
      if (index < 5) {
        console.log(`\n📚 === 강의 ${index + 1} 최종 매핑 결과 ===`);
        console.log(`  강의명: "${mappedLecture.title}"`);
        console.log(`  원본 스케줄 데이터:`, data.schedule || data.timeTable || data.classTime || data.meetingTimes);
        console.log(`  매핑된 스케줄:`, mappedLecture.schedule);
        
        if (mappedLecture.schedule && mappedLecture.schedule.length > 0) {
          console.log(`  📍 스케줄별 장소 정보:`);
          mappedLecture.schedule.forEach((s, idx) => {
            console.log(`    세션 ${idx + 1}: ${['', '월', '화', '수', '목', '금', '토', '일'][s.day]} ${Math.floor(s.start/2)+9}:${(s.start%2)*30}~${Math.floor(s.end/2)+9}:${(s.end%2)*30} | 건물: "${s.building}" | 강의실: "${s.room}"`);
          });
        } else {
          console.log(`  ❌ 스케줄 정보 없음`);
        }
        console.log(`=================================\n`);
      }
      
      lectureData.push(mappedLecture);
      index++;
    });

    // 스토어에 데이터를 설정하기 전에 중복을 제거합니다.
    const uniqueLectures = Array.from(new Map(lectureData.map(l => [`${l.courseId}-${l.classId}`, l])).values());
    
    courses.set(uniqueLectures);
    coursesError.set(null);

    // 원본 Firebase 데이터에서 필터 옵션 동적 생성
    generateFilterOptions(rawCourseData);
    
    // 캐시에 저장 (긴 만료 시간 - 강의 데이터는 안정적)
    LocalStorageCache.set(CACHE_KEYS.COURSES, uniqueLectures, LocalStorageCache.EXPIRY_TIMES.LONG);
    
    // 필터 옵션도 캐시에 저장 (긴 만료 시간)
    const currentFilterOptions = {
      categories: Array.from(new Set(rawCourseData.map(c => c.category).filter(Boolean))).sort().map(cat => ({ value: cat, label: cat })),
      departments: Array.from(new Set(rawCourseData.map(c => c.offeringDepartment).filter(Boolean))).sort().map(dept => ({ value: dept, label: dept })),
      liberalArtsAreas: Array.from(new Set(rawCourseData.map(c => c.liberalArtsArea).filter(Boolean))).sort().map(area => ({ value: area, label: area })),
      courseTypes: Array.from(new Set(rawCourseData.map(c => c.registrationMethod).filter(Boolean))).sort().map(type => ({ value: type, label: type })),
      instructors: Array.from(new Set(rawCourseData.map(c => typeof c.instructor === 'object' ? c.instructor.name : c.instructor).filter(Boolean))).sort().map(instructor => ({ value: instructor, label: instructor })),
      courseLevels: Array.from(new Set(rawCourseData.map(c => c.courseLevel ? Math.floor(c.courseLevel / 100) * 100 : null).filter((level): level is number => level !== null))).sort().map(level => ({ value: level.toString(), label: `${level}단계` }))
    };
    LocalStorageCache.set(CACHE_KEYS.FILTER_OPTIONS, currentFilterOptions, LocalStorageCache.EXPIRY_TIMES.LONG);

  } catch (error: any) {
    // 에러 로깅은 개발 환경에서만
    if (process.env.NODE_ENV === 'development') {
      console.error('Firebase 연결 실패:', error?.message || error);
    }

    // Firebase 연결 실패 시 빈 배열로 설정 (더미데이터 사용 안함)
    courses.set([]);
    const message =
      error?.code === 'permission-denied'
        ? 'Firestore 권한 오류: 읽기 권한이 없습니다. Firestore Rules를 확인하세요.'
        : error?.message || 'Firebase 연결에 실패했습니다.';
    coursesError.set(message);
    filterOptions.set({
      categories: [],
      departments: [],
      liberalArtsAreas: [],
      courseTypes: [],
      instructors: [],
      courseLevels: []
    });
  } finally {
    coursesLoading.set(false);
  }
}

// Firebase 데이터에서 필터 옵션 동적 생성
function generateFilterOptions(courseData: any[]) {
  const categories = new Set<string>();
  const departments = new Set<string>();
  const liberalArtsAreas = new Set<string>();
  const courseTypes = new Set<string>();
  const instructors = new Set<string>();
  const courseLevels = new Set<string>();

  courseData.forEach(course => {
    // 원본 Firebase 데이터 기준으로 필터 생성
    if (course.category) categories.add(course.category);
    if (course.offeringDepartment) departments.add(course.offeringDepartment);
    if (course.liberalArtsArea) liberalArtsAreas.add(course.liberalArtsArea);
    if (course.registrationMethod) courseTypes.add(course.registrationMethod);
    if (course.instructor) {
      if (typeof course.instructor === 'object' && course.instructor.name) {
        instructors.add(course.instructor.name);
      } else if (typeof course.instructor === 'string') {
        instructors.add(course.instructor);
      }
    }
    if (course.courseLevel) {
      const level = Math.floor(course.courseLevel / 100) * 100;
      courseLevels.add(level.toString());
    }
  });

  filterOptions.set({
    categories: Array.from(categories).sort().map(cat => ({ value: cat, label: cat })),
    departments: Array.from(departments).sort().map(dept => ({ value: dept, label: dept })),
    liberalArtsAreas: Array.from(liberalArtsAreas).sort().map(area => ({ value: area, label: area })),
    courseTypes: Array.from(courseTypes).sort().map(type => ({ value: type, label: type })),
    instructors: Array.from(instructors).sort().map(instructor => ({ value: instructor, label: instructor })),
    courseLevels: Array.from(courseLevels).sort().map(level => ({
      value: level,
      label: `${level}단계`
    }))
  });
}

// 스케줄 데이터를 파싱하는 함수 - Firebase 실제 데이터 구조에 맞춰 수정
function parseSchedule(scheduleData: any, topLevelLocation?: any) {
  if (!scheduleData) return [];

  const dayMap: { [key: string]: number } = {
    '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6, '일': 7,
    'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 'friday': 5, 'saturday': 6, 'sunday': 7,
    'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5, 'sat': 6, 'sun': 7,
    '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7
  };



  try {
    console.log('\n🔍 parseSchedule 함수 호출됨:');
    console.log('  📥 입력 데이터:', JSON.stringify(scheduleData, null, 2));
    console.log('  📊 데이터 타입:', typeof scheduleData);
    console.log('  📋 배열 여부:', Array.isArray(scheduleData));
    console.log('  🔢 데이터 존재:', !!scheduleData);

    // Firebase 데이터가 배열인지 문자열인지 확인
    if (Array.isArray(scheduleData)) {
      console.log('📅 배열 형태 스케줄 처리 중...');
      return scheduleData.map((item, index) => {
        console.log(`📅 배열 아이템 ${index}:`, item);
        
        // 요일 처리
        let day = 1; // 기본값: 월요일
        if (item.dayOfWeek !== undefined) day = typeof item.dayOfWeek === 'string' ? (dayMap[item.dayOfWeek.toLowerCase()] ?? 1) : item.dayOfWeek;
        else if (item.day !== undefined) day = typeof item.day === 'string' ? (dayMap[item.day.toLowerCase()] ?? 1) : item.day;
        else if (item.weekday !== undefined) day = typeof item.weekday === 'string' ? (dayMap[item.weekday.toLowerCase()] ?? 1) : item.weekday;

        // 시간 처리 - 다양한 필드명 지원
        const startTime = item.startTime || item.start || item.beginTime || item.from || '09:00';
        const endTime = item.endTime || item.end || item.finishTime || item.to || '10:30';

        // 장소 처리 - 다양한 필드명과 구조 지원
        let building = '';
        let room = '';

        console.log(`    🏢 아이템 ${index} 장소 정보 추출 시작:`, {
          location: item.location,
          building: item.building,
          buildingName: item.buildingName,
          room: item.room,
          roomNumber: item.roomNumber,
          classroom: item.classroom,
          classRoom: item.classRoom,
          lectureRoom: item.lectureRoom,
          venue: item.venue
        });

        if (item.location) {
          console.log(`      📍 location 필드 존재:`, item.location);
          if (typeof item.location === 'string') {
            // "IT관 101호" 형태 파싱
            const locationParts = item.location.split(' ');
            building = locationParts[0] || '';
            room = locationParts[1] || '';
            console.log(`      📝 문자열 location 파싱: building="${building}", room="${room}"`);
          } else if (typeof item.location === 'object') {
            building = item.location.building || item.location.buildingName || '';
            room = item.location.room || item.location.roomNumber || item.location.classroom || '';
            console.log(`      📦 객체 location 파싱: building="${building}", room="${room}"`);
          }
        } else {
          console.log(`      🔍 개별 필드에서 장소 정보 추출 중...`);
          // 개별 필드에서 추출 - 더 많은 필드명 지원
          building = item.building || item.buildingName || item.classroom?.building || 
                    item.classRoom?.building || item.lectureRoom?.building || 
                    item.venue?.building || item.place?.building || 
                    item.facility?.building || '';
          room = item.room || item.roomNumber || item.classroom?.room || 
                item.classroomNumber || item.classroom?.roomNumber ||
                item.classRoom?.room || item.classRoom?.roomNumber ||
                item.lectureRoom?.room || item.lectureRoom?.roomNumber ||
                item.venue?.room || item.venue?.roomNumber ||
                item.place?.room || item.place?.roomNumber ||
                item.facility?.room || item.facility?.roomNumber || '';
          console.log(`      📝 개별 필드 추출 결과: building="${building}", room="${room}"`);
        }

        // Firebase 데이터에 없으면 미정으로 표시
        const originalBuilding = building;
        const originalRoom = room;
        
        if (!building) {
          building = '미정';
        }
        if (!room) {
          room = '미정';
        }

        console.log(`    ✅ 아이템 ${index} 장소 처리 완료:`, {
          원본건물: originalBuilding,
          원본강의실: originalRoom,
          최종건물: building,
          최종강의실: room
        });

        const result = {
          day,
          start: parseTimeToSlot(startTime),
          end: parseTimeToSlot(endTime),
          building,
          room
        };

        console.log(`📅 배열 아이템 ${index} 매핑 결과:`, result);
        return result;
      });
    } else if (typeof scheduleData === 'object' && scheduleData !== null) {
      console.log('📅 객체 형태 스케줄 처리 중...', scheduleData);
      
      // 요일 처리
      let day = 1;
      if (scheduleData.dayOfWeek !== undefined) day = typeof scheduleData.dayOfWeek === 'string' ? (dayMap[scheduleData.dayOfWeek.toLowerCase()] ?? 1) : scheduleData.dayOfWeek;
      else if (scheduleData.day !== undefined) day = typeof scheduleData.day === 'string' ? (dayMap[scheduleData.day.toLowerCase()] ?? 1) : scheduleData.day;
      else if (scheduleData.weekday !== undefined) day = typeof scheduleData.weekday === 'string' ? (dayMap[scheduleData.weekday.toLowerCase()] ?? 1) : scheduleData.weekday;

      // 시간 처리
      const startTime = scheduleData.startTime || scheduleData.start || scheduleData.beginTime || scheduleData.from || '09:00';
      const endTime = scheduleData.endTime || scheduleData.end || scheduleData.finishTime || scheduleData.to || '10:30';

      // 장소 처리
      let building = '';
      let room = '';

      if (scheduleData.location) {
        if (typeof scheduleData.location === 'string') {
          const locationParts = scheduleData.location.split(' ');
          building = locationParts[0] || '';
          room = locationParts[1] || '';
        } else if (typeof scheduleData.location === 'object') {
          building = scheduleData.location.building || scheduleData.location.buildingName || '';
          room = scheduleData.location.room || scheduleData.location.roomNumber || scheduleData.location.classroom || '';
        }
      } else {
        // 개별 필드에서 추출 - 더 많은 필드명 지원
        building = scheduleData.building || scheduleData.buildingName || 
                  scheduleData.classroom?.building || scheduleData.classRoom?.building ||
                  scheduleData.lectureRoom?.building || scheduleData.venue?.building ||
                  scheduleData.place?.building || scheduleData.facility?.building || '';
        room = scheduleData.room || scheduleData.roomNumber || 
              scheduleData.classroom?.room || scheduleData.classroomNumber ||
              scheduleData.classroom?.roomNumber || scheduleData.classRoom?.room ||
              scheduleData.classRoom?.roomNumber || scheduleData.lectureRoom?.room ||
              scheduleData.lectureRoom?.roomNumber || scheduleData.venue?.room ||
              scheduleData.venue?.roomNumber || scheduleData.place?.room ||
              scheduleData.place?.roomNumber || scheduleData.facility?.room ||
              scheduleData.facility?.roomNumber || '';
      }

      // Firebase 데이터에 없으면 미정으로 표시
      if (!building) {
        building = '미정';
      }
      if (!room) {
        room = '미정';
      }

      const result = [{
        day,
        start: parseTimeToSlot(startTime),
        end: parseTimeToSlot(endTime),
        building,
        room
      }];

      console.log('📅 객체 스케줄 매핑 결과:', result);
      return result;
    } else if (typeof scheduleData === 'string') {
      console.log('📅 문자열 형태 스케줄 처리 중...', scheduleData);
      console.log('📍 최상위 레벨 location 정보:', topLevelLocation);
      
      // 문자열 형태의 스케줄 데이터 처리 (Firebase 실제 구조에 맞춤)
      const sessions = scheduleData.split(/[,;]/).map(s => s.trim()).filter(s => s.length > 0);
      return sessions.map((session, index) => {
        console.log(`📅 문자열 세션 ${index}: "${session}"`);
        
        // "월 15:00-18:00" 형태 파싱 (Firebase 실제 데이터 형태)
        const parts = session.split(' ').filter(p => p.length > 0);
        if (parts.length >= 2) {
          const dayStr = parts[0];
          const timeRange = parts[1];
          const day = dayMap[dayStr] || 1;
          
          let startTime = '09:00', endTime = '10:30';
          if (timeRange.includes('-')) {
            [startTime, endTime] = timeRange.split('-');
          } else if (timeRange.includes('~')) {
            [startTime, endTime] = timeRange.split('~');
          }
          
          // 장소 정보는 최상위 레벨 location에서 가져오기
          let building = '';
          let room = '';
          
          if (topLevelLocation && typeof topLevelLocation === 'object') {
            building = topLevelLocation.building || '';
            room = topLevelLocation.room || '';
            console.log(`📍 최상위 location에서 추출: building="${building}", room="${room}"`);
          } else {
            // 문자열에 포함된 장소 정보도 확인 (백업)
            building = parts[2] || '';
            room = parts[3] || '';
            console.log(`📍 문자열에서 추출: building="${building}", room="${room}"`);
          }
          
          // Firebase 데이터에 없으면 미정으로 표시
          if (!building) {
            building = '미정';
          }
          if (!room) {
            room = '미정';
          }
          
          const result = {
            day,
            start: parseTimeToSlot(startTime),
            end: parseTimeToSlot(endTime),
            building,
            room
          };

          console.log(`📅 문자열 세션 ${index} 최종 결과:`, result);
          return result;
        }
        
        // 파싱 실패 시에도 최상위 location 정보 사용
        let building = '';
        let room = '';
        
        if (topLevelLocation && typeof topLevelLocation === 'object') {
          building = topLevelLocation.building || '미정';
          room = topLevelLocation.room || '미정';
        } else {
          building = '미정';
          room = '미정';
        }
        
        return { 
          day: 1, 
          start: 0, 
          end: 2, 
          building, 
          room 
        };
      });
    }
    
    console.log('📅 스케줄 데이터 처리 불가 - 빈 배열 반환');
    return [];
  } catch (error) {
    console.error('❌ 스케줄 파싱 오류:', { scheduleData, topLevelLocation, error });
    
    // 에러 시에도 기본 스케줄 제공 (최상위 location 정보 활용)
    let building = '미정';
    let room = '미정';
    
    if (topLevelLocation && typeof topLevelLocation === 'object') {
      building = topLevelLocation.building || '미정';
      room = topLevelLocation.room || '미정';
      console.log('📍 에러 시 최상위 location 사용:', { building, room });
    }
    
    return [{ 
      day: 1, 
      start: 0, 
      end: 2, 
      building, 
      room 
    }];
  }
}

// 시간을 30분 단위 슬롯 인덱스로 변환하는 함수 (9시 = 0)
function parseTimeToSlot(timeStr: string): number {
  try {
    const [hour, minute] = timeStr.split(':').map(Number);
    // 9시를 기준으로 30분 간격의 인덱스를 계산합니다.
    return (hour - 9) * 2 + Math.floor(minute / 30);
  } catch {
    return 0; // 9시
  }
}

// 학년별 정원을 합산하는 함수
function calculateCapacity(enrollmentCapByYear: any): number {
  if (!enrollmentCapByYear) return 30;

  try {
    return Object.values(enrollmentCapByYear).reduce((sum: number, cap: any) =>
      sum + (Number(cap) || 0), 0
    ) || 30;
  } catch {
    return 30;
  }
}
// 공지사항과 일정 데이터 (캐싱 적용)
function initializeNoticesWithCache() {
  const cachedNotices = LocalStorageCache.get<Notice[]>(CACHE_KEYS.NOTICES);
  if (cachedNotices) {
    console.log('📢 공지사항 캐시에서 로드 (개수:', cachedNotices.length, ')');
    return cachedNotices;
  }
  
  // 캐시에 저장 (중간 만료 시간)
  LocalStorageCache.set(CACHE_KEYS.NOTICES, MOCK_NOTICES, LocalStorageCache.EXPIRY_TIMES.MEDIUM);
  console.log('📢 공지사항 캐시에 저장');
  return MOCK_NOTICES;
}

function initializeScheduleEventsWithCache() {
  const cachedEvents = LocalStorageCache.get<typeof SCHEDULE_EVENTS>(CACHE_KEYS.SCHEDULE_EVENTS);
  if (cachedEvents) {
    console.log('📅 일정 데이터 캐시에서 로드');
    return cachedEvents;
  }
  
  // 캐시에 저장 (매우 긴 만료 시간 - 일정은 거의 변경되지 않음)
  LocalStorageCache.set(CACHE_KEYS.SCHEDULE_EVENTS, SCHEDULE_EVENTS, LocalStorageCache.EXPIRY_TIMES.VERY_LONG);
  console.log('📅 일정 데이터 캐시에 저장');
  return SCHEDULE_EVENTS;
}

export const notices = writable<Notice[]>(initializeNoticesWithCache());
export const scheduleEvents = writable(initializeScheduleEventsWithCache());
export const isLoggedIn = writable(false);
export const currentUser = writable<{ id: string; name: string } | null>(null);

export const cart = writable<CartItem[]>([]);
export const applications = writable<Application[]>([]);

// Toast 관련 store
export const toastMessages = writable<ToastMessage[]>([]);

// 현재 사용자 ID가 변경될 때마다 데이터를 저장합니다.
let currentUid: string | null = null;
currentUser.subscribe($user => {
  currentUid = $user ? $user.id : null;
  isUserDataLoaded = false; // 사용자가 바뀌면 데이터 로딩 플래그 초기화
});

cart.subscribe($cart => {
  if (currentUid && isUserDataLoaded) { // 데이터가 완전히 로드된 후에만 저장 로직 작동
    saveUserData(currentUid, { cart: $cart });
  }
});

applications.subscribe($applications => {
  if (currentUid && isUserDataLoaded) {
    saveUserData(currentUid, { applications: $applications });
  }
});

export const metrics = derived([cart, applications], ([$cart, $applications]) => {
  const basicCredits = 6; // 기본 수업 학점
  const maxCredits = 21; // 최대 학점
  const enrolledCourses = 0; // 신청 과목 수 (추후 구현)
  
  // 총 베팅 포인트 = (최대 학점 - 기본 수업 학점) * 10
  const totalBettingPoints = (maxCredits - basicCredits) * 10;
  
  // 사용된 베팅 포인트 계산 (당첨된 베팅의 포인트만)
  const usedBettingPoints = $applications
    .filter(a => a.method === 'BID' && a.bidResult === 'WON')
    .reduce((sum, a) => sum + (a.bidAmount || 0), 0);
  
  // 잔여 베팅 포인트 = 총 포인트 - 사용된 포인트
  const remainingBettingPoints = totalBettingPoints - usedBettingPoints;
  
  return { 
    basicCredits, 
    maxCredits, 
    enrolledCourses, 
    remainingBettingPoints,
    totalBettingPoints,
    usedBettingPoints
  };
});

export function addToCart(item: CartItem) {
  cart.update((c) => {
    const exists = c.find((x) => x.courseId === item.courseId && x.classId === item.classId);
    if (!exists) {
      // 같은 method의 아이템들 중 가장 큰 order 값을 찾아서 +1
      const sameMethodItems = c.filter(x => x.method === item.method);
      const maxOrder = sameMethodItems.length > 0 
        ? Math.max(...sameMethodItems.map(x => x.order || 0))
        : 0;
      
      c.push({ ...item, order: maxOrder + 1 });
    }
    return [...c];
  });
}

export function applyFcfs(courseId: string, classId: string) {
  applications.update((a) => {
    // 중복 신청 방지
    const exists = a.find((x) => x.courseId === courseId && x.classId === classId);
    if (exists) {
      console.warn(`이미 신청된 강의입니다: ${courseId}-${classId}`);
      return a;
    }
    return [{ courseId, classId, status: "CONFIRMED", method: "FCFS" }, ...a];
  });
}

export function applyBid(courseId: string, classId: string, bidAmount: number) {
  cart.update((c) =>
    c.map((x) => (x.courseId === courseId && x.classId === classId ? { ...x, bidAmount } : x))
  );
  applications.update((a) => {
    // 중복 신청 방지
    const exists = a.find((x) => x.courseId === courseId && x.classId === classId);
    if (exists) {
      console.warn(`이미 신청된 강의입니다: ${courseId}-${classId}`);
      return a;
    }
    
    // 전년도 최저값 계산 (getBidStats와 동일한 로직)
    function hashString(input: string): number {
      let hash = 0;
      for (let i = 0; i < input.length; i++) {
        hash = (hash * 31 + input.charCodeAt(i)) | 0;
      }
      return Math.abs(hash);
    }
    
    function seededInt(seed: string, min: number, max: number): number {
      const base = hashString(seed) % 10000;
      const r = base / 10000;
      return Math.floor(min + r * (max - min + 1));
    }
    
    const key = `${courseId}-${classId}`;
    const minWin = seededInt(key + ":min", 15, 25);
    
    // 베팅 결과 결정: 최저값-1까지 당첨, 최저값-2부터 탈락
    let bidResult: "WAITING" | "WON" | "LOST";
    if (bidAmount >= minWin - 1) {
      bidResult = "WON";
    } else {
      bidResult = "LOST";
    }
    
    return [{ 
      courseId, 
      classId, 
      status: bidResult === "WON" ? "CONFIRMED" : "FAILED", 
      method: "BID", 
      bidAmount, 
      bidResult
    }, ...a];
  });
}

// 캐시 관리 함수들
export function clearAllCache() {
  LocalStorageCache.clear();
  console.log('💾 모든 캐시 삭제 완료');
}

export function clearUserCache(userId: string) {
  LocalStorageCache.remove(CACHE_KEYS.USER_DATA(userId));
  console.log(`💾 ${userId} 사용자 캐시 삭제 완료`);
}

export function refreshCourseData() {
  LocalStorageCache.remove(CACHE_KEYS.COURSES);
  LocalStorageCache.remove(CACHE_KEYS.FILTER_OPTIONS);
  console.log('💾 강의 데이터 캐시 삭제 완료');
  return loadCourses(1000, true); // 강제 새로고침으로 새로 로드
}

export function refreshNotices() {
  LocalStorageCache.remove(CACHE_KEYS.NOTICES);
  notices.set(MOCK_NOTICES);
  LocalStorageCache.set(CACHE_KEYS.NOTICES, MOCK_NOTICES, LocalStorageCache.EXPIRY_TIMES.MEDIUM);
  console.log('💾 공지사항 캐시 갱신 완료');
}

export function getCacheInfo() {
  return {
    courses: LocalStorageCache.getInfo(CACHE_KEYS.COURSES),
    filterOptions: LocalStorageCache.getInfo(CACHE_KEYS.FILTER_OPTIONS),
    notices: LocalStorageCache.getInfo(CACHE_KEYS.NOTICES),
    scheduleEvents: LocalStorageCache.getInfo(CACHE_KEYS.SCHEDULE_EVENTS),
  };
}

export function getCacheStats() {
  return LocalStorageCache.getStats();
}

export function cleanupExpiredCache() {
  LocalStorageCache.cleanupExpired();
}

// 앱 시작 시 만료된 캐시 자동 정리
if (typeof window !== 'undefined') {
  // 페이지 로드 시 만료된 캐시 정리
  LocalStorageCache.cleanupExpired();
  
  // 10분마다 만료된 캐시 정리
  setInterval(() => {
    LocalStorageCache.cleanupExpired();
  }, 10 * 60 * 1000);
}

// === Toast 시스템 함수들 ===
export function showToast(type: 'success' | 'error', message: string, duration: number = 3000) {
  const id = Date.now().toString() + Math.random().toString(36).substring(2);
  const toast: ToastMessage = { id, type, message, duration };
  
  toastMessages.update(messages => [...messages, toast]);
  
  if (duration > 0) {
    setTimeout(() => removeToast(id), duration);
  }
}

export function showReplaceToast(existingLecture: Lecture, newLecture: Lecture) {
  const id = Date.now().toString() + Math.random().toString(36).substring(2);
  
  // 강의 위치 정보 포맷팅
  const existingLocation = formatLectureLocation(existingLecture);
  const newLocation = formatLectureLocation(newLecture);
  
  const toast: ToastMessage = {
    id,
    type: 'replace',
    message: `"${existingLecture.title}"을(를) "${newLecture.title}"로(으) 교체하시겠습니까?`,
    duration: 0,
    existingLecture,
    newLecture
  };
  
  toastMessages.update(messages => [...messages, toast]);
}

export function removeToast(id: string) {
  toastMessages.update(messages => messages.filter(toast => toast.id !== id));
}

export function confirmReplace(toastId: string, existingLecture: Lecture, newLecture: Lecture) {
  // 기존 강의를 장바구니에서 제거
  cart.update(items => items.filter(item => 
    !(item.courseId === existingLecture.courseId && item.classId === existingLecture.classId)
  ));
  
  // 새 강의를 장바구니에 추가
  cart.update(items => [...items, { 
    courseId: newLecture.courseId, 
    classId: newLecture.classId, 
    method: newLecture.method || "FCFS" 
  }]);
  
  removeToast(toastId);
  showToast('success', `"${existingLecture.title}"이(가) "${newLecture.title}"로(으) 교체되었습니다!`);
}

// 강의 중복 검사 함수
export function hasTimeConflict(lecture1: Lecture, lecture2: Lecture): boolean {
  if (!lecture1.schedule || !lecture2.schedule) return false;
  
  for (const meeting1 of lecture1.schedule) {
    for (const meeting2 of lecture2.schedule) {
      // 같은 요일인지 확인
      if (meeting1.day === meeting2.day) {
        // 시간 겹침 확인
        const conflict = (
          (meeting2.start >= meeting1.start && meeting2.start < meeting1.end) ||
          (meeting2.end > meeting1.start && meeting2.end <= meeting1.end) ||
          (meeting2.start <= meeting1.start && meeting2.end >= meeting1.end)
        );
        
        if (conflict) return true;
      }
    }
  }
  
  return false;
}

// 시간 중복 검사를 포함한 강의 추가 함수
export function addLectureToCart(lecture: Lecture) {
  const cartItems = get(cart);
  const allCourses = get(courses);
  
  // 이미 장바구니에 있는지 확인
  const isAlreadyInCart = cartItems.some(item => 
    item.courseId === lecture.courseId && item.classId === lecture.classId
  );
  
  if (isAlreadyInCart) {
    showToast('error', '이미 장바구니에 있는 강의입니다.');
    return;
  }
  
  // 시간 중복 강의 찾기
  for (const cartItem of cartItems) {
    const existingLecture = allCourses.find(course => 
      course.courseId === cartItem.courseId && course.classId === cartItem.classId
    );
    
    if (existingLecture && hasTimeConflict(existingLecture, lecture)) {
      // 교체 Toast 표시
      showReplaceToast(existingLecture, lecture);
      return;
    }
  }
  
  // 정상 추가
  const newItem: CartItem = {
    courseId: lecture.courseId,
    classId: lecture.classId,
    method: lecture.method || "FCFS"
  };
  
  cart.update(items => [...items, newItem]);
  showToast('success', `"${lecture.title}" 강의가 추가되었습니다!`);
}

// 강의 위치 정보 포맷팅 함수
function formatLectureLocation(lecture: Lecture): string {
  if (!lecture.schedule || lecture.schedule.length === 0) return '위치 정보 없음';
  
  const locations = lecture.schedule
    .map(meeting => `${meeting.building || ''} ${meeting.room || ''}`.trim())
    .filter((v, i, a) => v && a.indexOf(v) === i);
    
  return locations.join(', ') || '위치 정보 없음';
}

// === 연강 경고 시스템 ===

// 건물 간 이동시간 데이터 (테스트용)
const TRAVEL_TIME_DATA: Record<string, TravelInfo> = {
  "IT관-공학관": { time: 5, risk: 'safe', reason: '가까워요' },
  "IT관-인문관": { time: 8, risk: 'warning', reason: '보통 거리' },
  "IT관-자연관": { time: 12, risk: 'danger', reason: '멀어요' },
  "공학관-인문관": { time: 6, risk: 'safe', reason: '가까워요' },
  "공학관-자연관": { time: 10, risk: 'warning', reason: '보통 거리' },
  "인문관-자연관": { time: 15, risk: 'danger', reason: '매우 멀어요' }
};

// 위험도별 색상
const RISK_COLORS: Record<RiskLevel, string> = {
  safe: '#22c55e',
  warning: '#eab308', 
  danger: '#ef4444'
};

// 건물명 추출 함수
function extractBuildingName(lecture: Lecture): string {
  if (!lecture.schedule || lecture.schedule.length === 0) return '';
  return lecture.schedule[0]?.building || '';
}

// 이동시간 정보 조회
function getTravelInfo(fromBuilding: string, toBuilding: string): TravelInfo | null {
  if (!fromBuilding || !toBuilding || fromBuilding === toBuilding) return null;
  
  const travelKey = `${fromBuilding}-${toBuilding}`;
  const reverseTravelKey = `${toBuilding}-${fromBuilding}`;
  
  return TRAVEL_TIME_DATA[travelKey] || TRAVEL_TIME_DATA[reverseTravelKey] || null;
}

// 연강 간격 찾기 함수
export function findLectureGaps(cartLectures: Lecture[]): Gap[] {
  console.log('🔍 연강 감지 시작 - 장바구니 강의 수:', cartLectures.length);
  console.log('🔍 장바구니 강의들:', cartLectures.map(l => ({ 
    title: l.title, 
    schedule: l.schedule?.map(s => ({ 
      day: s.day, 
      start: s.start, 
      end: s.end, 
      building: s.building, 
      room: s.room 
    })) 
  })));
  
  const gaps: Gap[] = [];
  const days = ['월', '화', '수', '목', '금'];
  
      days.forEach((dayName, dayIndex) => {
    console.log(`🔍 ${dayName}요일 (index: ${dayIndex}) 강의 체크 중...`);
    
    // 해당 요일의 모든 강의 시간을 평면화
    const dayMeetings: Array<{
      lecture: Lecture;
      start: number;
      end: number;
      building: string;
    }> = [];
    
    cartLectures.forEach(lecture => {
      if (lecture.schedule) {
        const dayMeetingsForLecture = lecture.schedule.filter(meeting => meeting.day === dayIndex);
        console.log(`🔍 "${lecture.title}" - ${dayName}요일 미팅:`, dayMeetingsForLecture);
        
        dayMeetingsForLecture.forEach(meeting => {
          dayMeetings.push({
            lecture,
            start: meeting.start,
            end: meeting.end,
            building: meeting.building || ''
          });
          console.log(`📅 추가된 미팅: ${lecture.title} ${meeting.start}-${meeting.end} (${meeting.building})`);
        });
      }
    });
    
    console.log(`🔍 ${dayName}요일 총 미팅 수:`, dayMeetings.length);
    
    // 시간 순으로 정렬
    dayMeetings.sort((a, b) => a.start - b.start);
    
    // 연속된 강의 간격 체크
    for (let i = 0; i < dayMeetings.length - 1; i++) {
      const current = dayMeetings[i];
      const next = dayMeetings[i + 1];
      const timeDiffSlots = next.start - current.end;
      
      // 연강 또는 1시간(2슬롯) 이내 간격만 체크
      if (timeDiffSlots <= 2) {
        const travelInfo = getTravelInfo(current.building, next.building);
        
        if (travelInfo && current.building !== next.building) {
          const gapMinutes = timeDiffSlots * 30; // 슬롯을 분으로 변환
          let adjustedRisk: RiskLevel = travelInfo.risk;
          let warningMessage = '';
          
          if (timeDiffSlots === 0) {
            warningMessage = '연강';
          } else if (gapMinutes < travelInfo.time) {
            adjustedRisk = 'danger';
            warningMessage = '시간부족';
          } else if (gapMinutes - travelInfo.time < 5) {
            adjustedRisk = 'warning'; 
            warningMessage = '촉박';
          } else {
            warningMessage = '여유';
          }
          
          const gap = {
            id: `gap-${dayName}-${current.end}-${next.start}`,
            day: dayName,
            timeSlot: timeDiffSlots === 0 ? current.end : current.end + 0.5,
            from: current.building,
            to: next.building,
            fromLecture: current.lecture.title,
            toLecture: next.lecture.title,
            risk: adjustedRisk,
            requiredTime: travelInfo.time,
            gapMinutes,
            warningMessage
          };
          
          console.log('⚠️ 연강 경고 생성:', gap);
          gaps.push(gap);
        }
      }
    }
  });
  
  console.log('🔍 연강 감지 완료 - 경고 개수:', gaps.length);
  return gaps;
}

// 위험도별 아이콘
export function getRiskIcon(risk: RiskLevel): string {
  return { safe: '✅', warning: '▲', danger: '▲' }[risk] || '▲';
}

// 간격 블록 스타일
export function getGapStyle(gap: Gap): string {
  const DAY_TO_COLUMN: Record<string, number> = {
    '월': 2, '화': 3, '수': 4, '목': 5, '금': 6
  };
  
  // 시간표 그리드: 9:00부터 시작, 30분 단위
  // timeSlot 5 = 11:30 = 9:00 + 2.5시간 = 6번째 grid-row (헤더 포함)
  const gridRow = gap.timeSlot + 2; // 헤더(1) + 시간표 시작(1) = +2
  
  return `
    grid-column: ${DAY_TO_COLUMN[gap.day]};
    grid-row: ${gridRow};
    background-color: ${RISK_COLORS[gap.risk]};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    height: 20px;
    margin: 2px;
    border-radius: 4px;
    cursor: pointer;
    z-index: 10;
  `;
}

