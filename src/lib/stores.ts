import { writable, derived, get } from "svelte/store";
import type { Application, CartItem, Lecture, Notice, ToastMessage, Gap, TravelInfo, RiskLevel } from "$lib/types";
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
  const cachedFilterOptions = LocalStorageCache.get<any>(CACHE_KEYS.FILTER_OPTIONS);
  
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
      orderBy('subjectName') // 과목명으로 정렬
      // limit 제거 - 모든 데이터 로드
    );
    console.log('🔥 Firestore 컬렉션 참조 생성 완료 (모든 데이터 로드)');

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
        schedule: (() => {
          console.log(`📋 "${data.subjectName}" 원시 스케줄:`, data.schedule);
          const parsed = parseSchedule(data.schedule || '');
          console.log(`📋 "${data.subjectName}" 파싱된 스케줄:`, parsed);
          return parsed;
        })(),
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
    '월': 0, '화': 1, '수': 2, '목': 3, '금': 4, '토': 5, '일': 6
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
        
        // 테스트용 건물 정보 할당 (courseId 기반으로 고정)
        const testBuildings = ['IT관', '공학관', '인문관', '자연관'];
        const buildingIndex = parseInt(session.slice(-1)) % testBuildings.length; // 세션 문자열 마지막 문자 기반
        const fixedBuilding = testBuildings[buildingIndex];
        
        return {
          day,
          start,
          end,
          building: fixedBuilding,
          room: `${100 + buildingIndex * 10}호`
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

