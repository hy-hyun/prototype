// 브라우저에서 Firebase 연결 테스트용 유틸리티
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export async function testFirebaseConnection() {
  console.log('🔥 Firebase 연결 테스트 시작');
  
  try {
    // 단순히 courses 컬렉션 접근 테스트
    const coursesRef = collection(db, 'courses');
    console.log('🔥 컬렉션 참조 생성:', coursesRef);
    
    const snapshot = await getDocs(coursesRef);
    console.log('🔥 쿼리 성공, 문서 개수:', snapshot.size);
    
    snapshot.forEach((doc) => {
      console.log('🔥 문서 ID:', doc.id);
      console.log('🔥 문서 데이터:', doc.data());
    });
    
    return true;
  } catch (error) {
    console.error('🔥 Firebase 연결 테스트 실패:', error);
    return false;
  }
}
