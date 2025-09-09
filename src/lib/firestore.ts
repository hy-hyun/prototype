import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection,
  getDocs, // getDocs 추가
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { UserDocument, CartItem, Application, Lecture, BettingPointsData } from './types'; // BettingPointsData 타입 추가
import { dashboardData } from './mock/dashboardData';

// 🔥 사용자 문서 Firestore 관리 함수들

/**
 * 사용자 문서 조회
 */
export async function getUserDocument(studentId: string): Promise<UserDocument | null> {
  try {
    console.log('🔍 사용자 문서 조회:', studentId);
    
    const userRef = doc(db, 'users', studentId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      console.log('✅ 사용자 문서 발견:', data.profile?.name);
      
      // Firestore Timestamp를 Date로 변환
      return {
        ...data,
        profile: {
          ...data.profile,
          createdAt: data.profile?.createdAt?.toDate() || new Date(),
          lastLoginAt: data.profile?.lastLoginAt?.toDate() || new Date(),
        }
      } as UserDocument;
    } else {
      console.log('❌ 사용자 문서 없음:', studentId);
      return null;
    }
  } catch (error) {
    console.error('❌ 사용자 문서 조회 실패:', error);
    throw error;
  }
}

/**
 * 새 사용자 문서 생성 (기본 데이터 사용)
 */
export async function createUserDocument(studentId: string): Promise<UserDocument> {
  try {
    console.log('🆕 새 사용자 문서 생성:', studentId);
    
    const now = new Date();
    
    // dashboardData를 기반으로 새 사용자 문서 생성
    const newUserDocument: UserDocument = {
      profile: {
        name: `학생${studentId.slice(-4)}`, // 마지막 4자리로 이름 생성
        studentId: studentId,
        currentSemester: dashboardData.userInfo.currentSemester,
        totalCredits: 0, // 신규 사용자는 0학점부터 시작
        requiredCredits: dashboardData.userInfo.requiredCredits,
        email: `${studentId}@hanyang.ac.kr`,
        createdAt: now,
        lastLoginAt: now,
      },
      dashboard: {
        userInfo: {
          name: `학생${studentId.slice(-4)}`,
          studentId: studentId,
          currentSemester: dashboardData.userInfo.currentSemester,
          totalCredits: 0,
          requiredCredits: dashboardData.userInfo.requiredCredits,
        },
        majors: dashboardData.majors.map(major => ({
          ...major,
          requirements: {
            ...major.requirements,
            // 신규 사용자는 모든 학점을 0으로 초기화
            majorRequired: { ...major.requirements.majorRequired, completed: 0 },
            majorElective: { ...major.requirements.majorElective, completed: 0 },
            total: { ...major.requirements.total, completed: 0 },
          }
        })),
        generalEducation: {
          ...dashboardData.generalEducation,
          required: {
            ...dashboardData.generalEducation.required,
            completed: 0,
            bySemester: Object.fromEntries(
              Object.entries(dashboardData.generalEducation.required.bySemester).map(([key, value]) => [
                key,
                {
                  ...value,
                  completed: 0,
                  subjects: value.subjects.map(subject => ({
                    ...subject,
                    completed: 0,
                    status: 'not_started'
                  }))
                }
              ])
            )
          },
          core: {
            ...dashboardData.generalEducation.core,
            completed: 0,
            areas: dashboardData.generalEducation.core.areas.map(area => ({
              ...area,
              completed: 0
            }))
          },
          general: {
            ...dashboardData.generalEducation.general,
            completed: 0
          }
        },
        learningJourney: [
          {
            semester: dashboardData.userInfo.currentSemester,
            credits: 0,
            cumulative: 0,
            milestone: '신규 등록',
            isFuture: false
          }
        ],
        recommendedCourses: ((dashboardData.baseRecommendationsBySemester as any)[dashboardData.userInfo.currentSemester] || []).map((course: any) => ({
          id: course.id,
          title: course.title,
          dept: course.dept,
          credits: course.credits,
          status: 'available',
          type: 'recommended',
          reason: course.reason // 추천 이유 유지
        })),
        basicCourses: dashboardData.basicCourses.map(course => ({
          id: course.id,
          title: course.title,
          dept: course.dept,
          credits: course.credits,
          status: 'available',
          type: 'basic'
        })),
        teachingCourses: dashboardData.teachingCourses,
      },
      enrollment: {
        cart: [],
        applications: [],
        favorites: [],
        timetableCourses: [], // 시간표에 추가된 과목들
        credits: {
          basicCredits: 9, // 기본 수업 학점
          maxCredits: 24, // 최대 학점
          totalBettingPoints: 150, // 총 베팅 포인트 (24-9) * 10
        },
      },
      settings: {
        theme: 'light',
        notifications: true,
      }
    };
    
    const userRef = doc(db, 'users', studentId);
    await setDoc(userRef, {
      ...newUserDocument,
      profile: {
        ...newUserDocument.profile,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      }
    });
    
    console.log('✅ 새 사용자 문서 생성 완료:', newUserDocument.profile.name);
    return newUserDocument;
    
  } catch (error) {
    console.error('❌ 사용자 문서 생성 실패:', error);
    throw error;
  }
}

/**
 * 사용자 로그인 시간 업데이트
 */
export async function updateLastLogin(studentId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', studentId);
    await updateDoc(userRef, {
      'profile.lastLoginAt': serverTimestamp()
    });
    console.log('✅ 로그인 시간 업데이트:', studentId);
  } catch (error) {
    console.error('❌ 로그인 시간 업데이트 실패:', error);
  }
}

/**
 * 장바구니 업데이트
 */
export async function updateUserCart(studentId: string, cart: CartItem[]): Promise<void> {
  try {
    const userRef = doc(db, 'users', studentId);
    await updateDoc(userRef, {
      'enrollment.cart': cart
    });
    console.log('✅ 장바구니 업데이트:', cart.length, '개 항목');
  } catch (error) {
    console.error('❌ 장바구니 업데이트 실패:', error);
    throw error;
  }
}

/**
 * 신청내역 업데이트
 */
export async function updateUserApplications(studentId: string, applications: Application[]): Promise<void> {
  try {
    const userRef = doc(db, 'users', studentId);
    await updateDoc(userRef, {
      'enrollment.applications': applications
    });
    console.log('✅ 신청내역 업데이트:', applications.length, '개 항목');
  } catch (error) {
    console.error('❌ 신청내역 업데이트 실패:', error);
    throw error;
  }
}

/**
 * 찜한 과목 업데이트
 */
export async function updateUserFavorites(studentId: string, favorites: string[]): Promise<void> {
  try {
    const userRef = doc(db, 'users', studentId);
    await updateDoc(userRef, {
      'enrollment.favorites': favorites
    });
    console.log('✅ 찜한 과목 업데이트:', favorites.length, '개 항목');
  } catch (error) {
    console.error('❌ 찜한 과목 업데이트 실패:', error);
    throw error;
  }
}

/**
 * 사용자 프로필 업데이트
 */
export async function updateUserProfile(studentId: string, updates: Partial<UserDocument['profile']>): Promise<void> {
  try {
    const userRef = doc(db, 'users', studentId);
    const updateData: Record<string, any> = {};
    
    // 프로필 필드들을 Firestore 경로로 변환
    Object.entries(updates).forEach(([key, value]) => {
      updateData[`profile.${key}`] = value;
    });
    
    await updateDoc(userRef, updateData);
    console.log('✅ 사용자 프로필 업데이트:', Object.keys(updates));
  } catch (error) {
    console.error('❌ 사용자 프로필 업데이트 실패:', error);
    throw error;
  }
}

/**
 * 사용자 문서 전체 업데이트 (대시보드 데이터 등)
 */
export async function updateUserDocument(studentId: string, updates: Partial<UserDocument>): Promise<void> {
  try {
    const userRef = doc(db, 'users', studentId);
    await updateDoc(userRef, updates);
    console.log('✅ 사용자 문서 업데이트 완료');
  } catch (error) {
    console.error('❌ 사용자 문서 업데이트 실패:', error);
    throw error;
  }
}

/**
 * 김민우 학생 데이터를 Firestore에 마이그레이션 (개발용)
 */
export async function migrateKimMinwooData(): Promise<void> {
  try {
    console.log('🔄 김민우 학생 데이터 마이그레이션 시작...');
    
    const kimMinwooId = '2021075178';
    const now = new Date();
    
    const kimMinwooDocument: UserDocument = {
      profile: {
        name: dashboardData.userInfo.name,
        studentId: kimMinwooId,
        currentSemester: dashboardData.userInfo.currentSemester,
        totalCredits: dashboardData.userInfo.totalCredits,
        requiredCredits: dashboardData.userInfo.requiredCredits,
        email: `mw111402@hanyang.ac.kr`,
        createdAt: now,
        lastLoginAt: now,
      },
      dashboard: {
        userInfo: {
          name: dashboardData.userInfo.name,
          studentId: kimMinwooId,
          currentSemester: dashboardData.userInfo.currentSemester,
          totalCredits: dashboardData.userInfo.totalCredits,
          requiredCredits: dashboardData.userInfo.requiredCredits,
        },
        majors: dashboardData.majors,
        generalEducation: dashboardData.generalEducation,
        learningJourney: dashboardData.learningJourney,
        recommendedCourses: ((dashboardData.baseRecommendationsBySemester as any)[dashboardData.userInfo.currentSemester] || []).map((course: any) => ({
          id: course.id,
          title: course.title,
          dept: course.dept,
          credits: course.credits,
          status: 'available',
          type: 'recommended',
          reason: course.reason // 추천 이유 유지
        })),
        basicCourses: dashboardData.basicCourses.map(course => ({
          id: course.id,
          title: course.title,
          dept: course.dept,
          credits: course.credits,
          status: 'available',
          type: 'basic'
        })),
        teachingCourses: dashboardData.teachingCourses,
      },
      enrollment: {
        cart: [],
        applications: [],
        favorites: [],
        timetableCourses: [], // 시간표에 추가된 과목들
        credits: {
          basicCredits: 9, // 기본 수업 학점
          maxCredits: 24, // 최대 학점
          totalBettingPoints: 150, // 총 베팅 포인트 (24-9) * 10
        },
      },
      settings: {
        theme: 'light',
        notifications: true,
      }
    };
    
    const userRef = doc(db, 'users', kimMinwooId);
    await setDoc(userRef, {
      ...kimMinwooDocument,
      profile: {
        ...kimMinwooDocument.profile,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      }
    });
    
    console.log('✅ 김민우 학생 데이터 마이그레이션 완료!');
    
  } catch (error) {
    console.error('❌ 김민우 학생 데이터 마이그레이션 실패:', error);
    throw error;
  }
}

/**
 * 기존 잘못된 학번 데이터 삭제 (개발용)
 */
export async function deleteOldStudentData(studentId: string): Promise<void> {
  try {
    console.log('🗑️ 기존 학번 데이터 삭제:', studentId);
    
    const userRef = doc(db, 'users', studentId);
    await deleteDoc(userRef);
    
    console.log('✅ 기존 학번 데이터 삭제 완료:', studentId);
    
  } catch (error) {
    console.error('❌ 기존 학번 데이터 삭제 실패:', error);
    throw error;
  }
}

/**
 * 모든 강의 목록 조회 (AI 추천용)
 */
export async function getAllCourses(): Promise<Lecture[]> {
  try {
    const coursesCollectionRef = collection(db, 'courses');
    const querySnapshot = await getDocs(coursesCollectionRef);
    
    const courses: Lecture[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

 
      // 데이터 검증 강화: 어떤 필드가 누락되었는지 상세히 로그로 남깁니다.
      const requiredFields = ['subjectCode', 'subjectName', 'category', 'offeringDepartment', 'courseNumber', 'creditHours'];
      const missingFields = requiredFields.filter(field => data[field] === undefined || data[field] === null);

      if (missingFields.length > 0) {
        console.warn(
          `[데이터 무결성 경고] 문서 '${doc.id}' 건너뜀. 누락된 필드: ${missingFields.join(', ')}`
        );
        return; // forEach의 다음 순회로 넘어감
      }

      // credits 필드를 유연하게 처리 (숫자, 문자열, 객체)
      let lectureCredits = 0;
      let labCredits = 0;
      const firestoreCredits = data.creditHours; // 'credits'가 아닌 'creditHours' 필드 사용

      if (typeof firestoreCredits === 'number') {
        lectureCredits = firestoreCredits;
      } else if (typeof firestoreCredits === 'string') {
        const parsed = parseFloat(firestoreCredits);
        if (!isNaN(parsed)) {
          lectureCredits = parsed;
        }
      } else if (typeof firestoreCredits === 'object' && firestoreCredits !== null) {
        lectureCredits = typeof firestoreCredits.lecture === 'number' ? firestoreCredits.lecture : 0;
        labCredits = typeof firestoreCredits.lab === 'number' ? firestoreCredits.lab : 0;
      }

      // schedule 필드가 배열인 경우에만 map을 실행하도록 안전장치 추가
      const schedule = Array.isArray(data.schedule) 
        ? data.schedule.map((s: any) => ({
            ...s,
            start: s.start,
            end: s.end,
          }))
        : [];
      
      const courseData: Lecture = {
        courseId: data.subjectCode, // Firestore의 'subjectCode'를 'courseId'로 매핑
        classId: data.courseNumber, // Firestore의 'courseNumber'를 'classId'로 매핑
        title: data.subjectName, // Firestore의 'subjectName'을 'title'로 매핑
        category: data.category,
        dept: data.offeringDepartment, // Firestore의 'offeringDepartment'를 'dept'로 매핑
        instructor: data.instructor || '미지정', // 강사 정보가 없을 경우 기본값
        credits: { lecture: lectureCredits, lab: labCredits },
        schedule: schedule,
        building: schedule.length > 0 ? schedule[0].building : undefined,
        capacity: data.capacity || 0, // 수강 정원이 없을 경우 기본값
        // ... 기타 Lecture 타입에 맞는 필드들
      };
      courses.push(courseData);
    });
    
    console.log(`✅ ${courses.length}개의 유효한 강의 목록을 Firestore에서 가져왔습니다.`);
    return courses;
    
  } catch (error) {
    console.error('❌ Firestore에서 강의 목록을 가져오는 데 실패했습니다:', error);
    throw error;
  }
}

/**
 * 사용자 시간표 과목 업데이트
 */
export async function updateUserTimetable(studentId: string, timetableCourses: string[]): Promise<void> {
  try {
    console.log('📅 시간표 과목 업데이트:', studentId, timetableCourses.length, '개');
    
    const userRef = doc(db, 'users', studentId);
    await updateDoc(userRef, {
      'enrollment.timetableCourses': timetableCourses
    });
    
    console.log('✅ 시간표 과목 Firestore 업데이트 완료');
  } catch (error) {
    console.error('❌ 시간표 과목 Firestore 업데이트 실패:', error);
    throw error;
  }
}

/**
 * 베팅 포인트 데이터 조회 (과목명 기반)
 */
export async function getBettingPointsData(): Promise<BettingPointsData> {
  try {
    console.log('🎯 베팅 포인트 데이터 조회 시작...');
    
    // courses 컬렉션에서 베팅 정보가 포함된 문서들을 조회
    const coursesRef = collection(db, 'courses');
    const querySnapshot = await getDocs(coursesRef);
    
    console.log(`📊 Firebase courses 컬렉션 쿼리 결과: ${querySnapshot.size}개 문서 발견`);
    
    const bettingPointsData: BettingPointsData = {};
    let bettingCourseCount = 0;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // bettingPoints 필드가 있는 문서만 처리
      if (data.bettingPoints && typeof data.bettingPoints === 'object') {
        const bettingInfo = data.bettingPoints;
        
        // courseId와 classId 생성 (실제 데이터 구조에 맞춰)
        const courseId = data.subjectCode || data.courseId || doc.id;  // 학수번호 (예: DET3014)
        const classId = data.courseNumber || data.class || '1';        // 수업번호가 실제 classId (예: 11453)
        const courseKey = `${courseId}-${classId}`;
        
        console.log(`🔍 베팅 과목 발견 - 키: "${courseKey}" (${data.subjectName || data.courseName || data.title})`);
        console.log(`  원본 데이터:`, {
          subjectCode: data.subjectCode,
          courseNumber: data.courseNumber,
          class: data.class,
          bettingPoints: bettingInfo
        });
        
        // 베팅 정보 필수 필드 검증
        if (bettingInfo.hasOwnProperty('currentActual') && 
            bettingInfo.hasOwnProperty('lastYear25th') && 
            bettingInfo.hasOwnProperty('lastYear75th') && 
            bettingInfo.hasOwnProperty('lastYearMin')) {
          
          bettingPointsData[courseKey] = {
            currentActual: Number(bettingInfo.currentActual) || 0,
            currentBet: Number(bettingInfo.currentBet) || 0,
            lastYear25th: Number(bettingInfo.lastYear25th) || 0,
            lastYear75th: Number(bettingInfo.lastYear75th) || 0,
            lastYearMin: Number(bettingInfo.lastYearMin) || 0
          };
          
          bettingCourseCount++;
          console.log(`✅ 베팅 데이터 추가: ${courseKey}`, bettingPointsData[courseKey]);
        } else {
          console.warn(`[베팅 데이터 경고] 과목 '${courseKey}' 베팅 정보 필수 필드 누락.`, bettingInfo);
        }
      }
    });
    
    console.log(`\n📈 최종 결과: ${bettingCourseCount}개 베팅 과목에서 ${Object.keys(bettingPointsData).length}개의 베팅 포인트 데이터를 가져왔습니다.`);
    console.log(`🔑 베팅 데이터 키 목록: [${Object.keys(bettingPointsData).join(', ')}]`);
    
    return bettingPointsData;
    
  } catch (error) {
    console.error('❌ 베팅 포인트 데이터 조회 실패:', error);
    throw error;
  }
}
