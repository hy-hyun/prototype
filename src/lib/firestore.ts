import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { UserDocument, CartItem, Application } from './types';
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
        recommendedCourses: dashboardData.recommendedCourses.map(course => ({
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
        recommendedCourses: dashboardData.recommendedCourses.map(course => ({
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
