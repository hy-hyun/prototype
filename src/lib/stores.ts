import { writable, derived } from "svelte/store";
import type { Application, CartItem, Lecture, Notice } from "$lib/types";
import { MOCK_NOTICES, SCHEDULE_EVENTS } from "$lib/mock/data";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '$lib/firebase';

export const courses = writable<Lecture[]>([]);
export const filterOptions = writable({
  categories: [] as { value: string; label: string }[],
  departments: [] as { value: string; label: string }[],
  liberalArtsAreas: [] as { value: string; label: string }[],
  courseTypes: [] as { value: string; label: string }[],
  instructors: [] as { value: string; label: string }[],
  courseLevels: [] as { value: string; label: string }[]
});

// Firebase에서 강의 데이터 로드
export async function loadCourses() {
  console.log('🔥 Firebase에서 강의 데이터 로딩 시작...');
  console.log('🔥 DB 인스턴스:', db);
  
  try {
    const coursesRef = collection(db, 'courses');
    console.log('🔥 Firestore 컬렉션 참조 생성 완료:', coursesRef);
    
    const querySnapshot = await getDocs(coursesRef);
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
    courses.set(lectureData);
    
    // 원본 Firebase 데이터에서 필터 옵션 동적 생성
    generateFilterOptions(rawCourseData);
    console.log('🔥 강의 데이터 로딩 완료');
    
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
      return { day: 1, start: 1, end: 2, building: '', room: '' };
    });
  } catch (error) {
    console.warn('스케줄 파싱 오류:', scheduleStr, error);
    return [{ day: 1, start: 1, end: 2, building: '', room: '' }];
  }
}

// 시간을 교시로 변환하는 함수
function parseTimeToSlot(timeStr: string): number {
  try {
    const [hour, minute] = timeStr.split(':').map(Number);
    // 9시를 1교시로 가정하고 계산
    return Math.max(1, hour - 8);
  } catch {
    return 1;
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
export const notices = writable<Notice[]>(MOCK_NOTICES);
export const scheduleEvents = writable(SCHEDULE_EVENTS);
export const isLoggedIn = writable(false);
export const currentUser = writable<{ id: string; name: string } | null>(null);

export const cart = writable<CartItem[]>([
  { courseId: "CSE101", classId: "01", method: "FCFS" },
  { courseId: "CSE102", classId: "01", method: "FCFS" },
  { courseId: "MAT101", classId: "01", method: "FCFS" }
]);
export const applications = writable<Application[]>([]);

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
  applications.update((a) => [{ courseId, classId, status: "PENDING" }, ...a]);
}

export function applyBid(courseId: string, classId: string, bidAmount: number) {
  cart.update((c) =>
    c.map((x) => (x.courseId === courseId && x.classId === classId ? { ...x, bidAmount } : x))
  );
  applications.update((a) => [{ courseId, classId, status: "PENDING" }, ...a]);
}


