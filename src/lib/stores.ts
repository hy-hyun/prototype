import { writable, derived } from "svelte/store";
import type { Application, CartItem, Lecture, Notice } from "$lib/types";
import { MOCK_NOTICES, SCHEDULE_EVENTS } from "$lib/mock/data";
import { collection, getDocs, doc, getDoc, setDoc, query, limit, orderBy } from 'firebase/firestore';
import { db } from '$lib/firebase';
import { LocalStorageCache, CACHE_KEYS } from '$lib/utils';

// 로딩 상태 관리
export const isLoading = writable(false);
export const loadingText = writable('로딩 중...');
export const coursesLoading = writable(false);
export const userDataLoading = writable(false);

// 전역 로딩 상태 (coursesLoading 또는 userDataLoading이 true이면 true)
export const globalLoading = derived(
  [coursesLoading, userDataLoading],
  ([$coursesLoading, $userDataLoading]) => $coursesLoading || $userDataLoading
);

let isUserDataLoaded = false; // 사용자 데이터 로딩 상태 플래그

// Firestore에서 사용자 데이터를 로드하는 함수 (캐싱 적용)
export async function loadUserData(userId: string) {
  if (isUserDataLoaded) return; // 이미 로드되었으면 중복 실행 방지
  
  // 캐시에서 먼저 확인
  const cacheKey = CACHE_KEYS.USER_DATA(userId);
  const cachedData = LocalStorageCache.get<{ cart: CartItem[], applications: Application[] }>(cacheKey);
  
  if (cachedData) {
    console.log(`👤 ${userId} 사용자 데이터 캐시에서 로드`);
    cart.set(cachedData.cart || []);
    applications.set(cachedData.applications || []);
    isUserDataLoaded = true;
    return;
  }
  
  userDataLoading.set(true);
  loadingText.set('사용자 데이터 로딩 중...');
  console.log(`👤 ${userId} 사용자 데이터 Firebase에서 로딩 시작...`);

  try {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);

    let userData: { cart: CartItem[], applications: Application[] };

    if (userDocSnap.exists()) {
      userData = userDocSnap.data() as { cart: CartItem[], applications: Application[] };
      console.log('👤 사용자 데이터 발견:', userData);
    } else {
      console.log('👤 새 사용자, 기본 데이터로 초기화합니다.');
      userData = { cart: [], applications: [] };
      // 새 사용자인 경우, Firestore에 기본 문서 구조를 만들어줍니다.
      await setDoc(userDocRef, userData);
    }

    // 데이터를 스토어에 설정
    cart.set(userData.cart || []);
    applications.set(userData.applications || []);
    
    // 캐시에 저장 (짧은 만료 시간 - 사용자 데이터는 자주 변경될 수 있음)
    LocalStorageCache.set(cacheKey, userData, LocalStorageCache.EXPIRY_TIMES.SHORT);
    
    isUserDataLoaded = true; // 로딩 완료 플래그 설정
  } catch (error) {
    console.error('👤 사용자 데이터 로딩 실패:', error);
  } finally {
    userDataLoading.set(false);
  }
}

// Firestore에 사용자 데이터를 저장하는 함수 (캐싱 업데이트 포함)
async function saveUserData(userId: string, data: { cart?: CartItem[], applications?: Application[] }) {
  if (!userId) return;
  console.log(`💾 ${userId} 사용자 데이터 저장...`, data);
  try {
    const userDocRef = doc(db, 'users', userId);
    // setDoc에 merge: true 옵션을 주어 기존 문서를 덮어쓰지 않고 병합합니다.
    await setDoc(userDocRef, data, { merge: true });
    
    // 캐시도 업데이트
    const cacheKey = CACHE_KEYS.USER_DATA(userId);
    const cachedData = LocalStorageCache.get<{ cart: CartItem[], applications: Application[] }>(cacheKey);
    if (cachedData) {
      const updatedData = { ...cachedData, ...data };
      LocalStorageCache.set(cacheKey, updatedData, LocalStorageCache.EXPIRY_TIMES.SHORT);
      console.log(`💾 ${userId} 캐시 업데이트 완료`);
    }
  } catch (error) {
    console.error('💾 사용자 데이터 저장 실패:', error);
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
export async function loadCourses(limitCount: number = 100) {
  // 캐시에서 먼저 확인
  const cachedCourses = LocalStorageCache.get<Lecture[]>(CACHE_KEYS.COURSES);
  const cachedFilterOptions = LocalStorageCache.get<typeof filterOptions>(CACHE_KEYS.FILTER_OPTIONS);
  
  if (cachedCourses && cachedFilterOptions) {
    console.log('🔥 강의 데이터 캐시에서 로드 (개수:', cachedCourses.length, ')');
    courses.set(cachedCourses);
    filterOptions.set(cachedFilterOptions);
    return;
  }

  coursesLoading.set(true);
  loadingText.set('강의 데이터 로딩 중...');
  console.log('🔥 Firebase에서 강의 데이터 로딩 시작...');
  console.log('🔥 DB 인스턴스:', db);

  try {
    // 쿼리 최적화: limit과 orderBy 적용
    const coursesRef = collection(db, 'courses');
    const coursesQuery = query(
      coursesRef,
      orderBy('subjectName'), // 과목명으로 정렬
      limit(limitCount) // 제한된 개수만 로드
    );
    console.log('🔥 Firestore 컬렉션 참조 생성 완료 (limit:', limitCount, ')');

    const querySnapshot = await getDocs(coursesQuery);
    console.log('🔥 Firestore 쿼리 실행 완료, 문서 개수:', querySnapshot.size);

    const rawCourseData: any[] = [];
    const lectureData: Lecture[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('🔥 문서 데이터:', doc.id, data);

      // 원본 데이터 저장 (필터 생성용)
      rawCourseData.push(data);

      // Firebase 데이터 구조에 맞춰 매핑
      lectureData.push({
        courseId: data.courseNumber || data.subjectCode || '',
        classId: data.class || '01',
        title: data.subjectName || '',
        category: data.category || '교양',
        dept: data.offeringDepartment || '',
        instructor: typeof data.instructor === 'object' ? data.instructor.name : data.instructor || '',
        credits: {
          lecture: data.creditHours || 3,
          lab: 0
        },
        schedule: parseSchedule(data.schedule || ''),
        capacity: calculateCapacity(data.enrollmentCapByYear),
        area: data.liberalArtsArea || data.category || '',
        limit: data.enrollmentRestriction || '',
        keywords: data.keywords || [],
        method: 'FCFS' // Firebase 데이터에는 신청방식이 없으므로 기본값
      });
    });

    console.log('🔥 로드된 강의 데이터:', lectureData);
    console.log('🔥 강의 데이터 개수:', lectureData.length);
    
    // 스토어에 데이터를 설정하기 전에 중복을 제거합니다.
    const uniqueLectures = Array.from(new Map(lectureData.map(l => [`${l.courseId}-${l.classId}`, l])).values());
    
    courses.set(uniqueLectures);
    console.log('🔥 중복 제거 후 최종 강의 데이터 개수:', uniqueLectures.length);

    // 원본 Firebase 데이터에서 필터 옵션 동적 생성
    generateFilterOptions(rawCourseData);
    
    // 캐시에 저장 (긴 만료 시간 - 강의 데이터는 안정적)
    LocalStorageCache.set(CACHE_KEYS.COURSES, uniqueLectures, LocalStorageCache.EXPIRY_TIMES.LONG);
    
    // 필터 옵션도 캐시에 저장 (긴 만료 시간)
    filterOptions.subscribe(($filterOptions) => {
      LocalStorageCache.set(CACHE_KEYS.FILTER_OPTIONS, $filterOptions, LocalStorageCache.EXPIRY_TIMES.LONG);
    });
    
    console.log('🔥 강의 데이터 로딩 및 캐싱 완료');

  } catch (error: any) {
    console.error('🔥 Firebase 연결 실패:', error);
    console.error('🔥 오류 상세:', error?.message);
    console.error('🔥 오류 코드:', error?.code);
    console.error('🔥 오류 타입:', typeof error);
    console.error('🔥 전체 오류 객체:', error);

    // 구체적인 오류 메시지 표시
    if (error?.code === 'permission-denied') {
      console.error('🚨 Firestore 보안 규칙 문제: 읽기 권한이 없습니다.');
      console.error('🚨 Firebase Console → Firestore Database → Rules에서 읽기 권한을 허용해주세요.');
    } else if (error?.code === 'unavailable') {
      console.error('🚨 네트워크 연결 문제: Firebase 서버에 연결할 수 없습니다.');
    } else if (error?.message?.includes('fetch')) {
      console.error('🚨 네트워크 오류: 인터넷 연결을 확인해주세요.');
    }

    // Firebase 연결 실패 시 빈 배열로 설정 (더미데이터 사용 안함)
    courses.set([]);
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
    if (course.courseType) courseTypes.add(course.courseType);
    if (course.instructor?.name) instructors.add(course.instructor.name);
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

// 스케줄 문자열을 파싱하는 함수
function parseSchedule(scheduleStr: string) {
  if (!scheduleStr) return [];

  const dayMap: { [key: string]: number } = {
    '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6, '일': 7
  };

  try {
    // "월 10:00-11:30, 수 10:00-11:30" 형태를 파싱
    const sessions = scheduleStr.split(',').map(s => s.trim());
    return sessions.map(session => {
      const parts = session.split(' ');
      if (parts.length >= 2) {
        const day = dayMap[parts[0]] || 1;
        const timeRange = parts[1];
        const [startTime, endTime] = timeRange.split('-');
        const start = parseTimeToSlot(startTime);
        const end = parseTimeToSlot(endTime);
        
        return {
          day,
          start,
          end,
          building: '',
          room: ''
        };
      }
      return { day: 1, start: 0, end: 1, building: '', room: '' };
    });
  } catch (error) {
    console.warn('스케줄 파싱 오류:', scheduleStr, error);
    return [{ day: 1, start: 0, end: 1, building: '', room: '' }];
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

export const metrics = derived(cart, ($c) => {
  const min = 12;
  const max = 21;
  const current = 0; // 강의 크레딧 합산은 추후 구현
  const budget = 100; // 베팅 예산 더미
  return { min, max, current, budget };
});

export function addToCart(item: CartItem) {
  cart.update((c) => {
    const exists = c.find((x) => x.courseId === item.courseId && x.classId === item.classId);
    if (!exists) c.push(item);
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
    return [{ courseId, classId, status: "PENDING" }, ...a];
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
    return [{ courseId, classId, status: "PENDING" }, ...a];
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
  return loadCourses(); // 새로 로드
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


