import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Firebase 설정 (환경변수에서 로드)
const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
  measurementId: import.meta.env.PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// 설정 검증
console.log('🔥 Firebase 설정 검증:');
console.log('- API Key 존재:', !!firebaseConfig.apiKey);
console.log('- Project ID:', firebaseConfig.projectId);
console.log('- Auth Domain:', firebaseConfig.authDomain);

// Firebase 앱 초기화
export const app = initializeApp(firebaseConfig);
console.log('🔥 Firebase 앱 초기화 완료');

// Firestore 데이터베이스 인스턴스
export const db = getFirestore(app);
console.log('🔥 Firestore 인스턴스 생성 완료');

// Firebase Auth 인스턴스
export const auth = getAuth(app);

// Firebase Analytics 인스턴스 (브라우저에서만 사용)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
