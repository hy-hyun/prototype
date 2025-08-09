import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Firebase 설정 검증
const firebaseConfig = {
  apiKey: "AIzaSyBVDytX4ZTbBt1y8STt9vVdfF7_cmw7Gk0",
  authDomain: "gen-lang-client-0705810476.firebaseapp.com", 
  projectId: "gen-lang-client-0705810476",
  storageBucket: "gen-lang-client-0705810476.firebasestorage.app",
  messagingSenderId: "1012745348076",
  appId: "1:1012745348076:web:dd2d93317dca103b3496c9",
  measurementId: "G-SJY7VH7L2Z"
};

// 설정 검증
console.log('🔥 Firebase 설정 검증:');
console.log('- API Key 존재:', !!firebaseConfig.apiKey);
console.log('- Project ID:', firebaseConfig.projectId);
console.log('- Auth Domain:', firebaseConfig.authDomain);

// Firebase 앱 초기화
console.log('🔥 Firebase 설정:', firebaseConfig);
export const app = initializeApp(firebaseConfig);
console.log('🔥 Firebase 앱 초기화 완료');

// Firestore 데이터베이스 인스턴스
export const db = getFirestore(app);
console.log('🔥 Firestore 인스턴스 생성 완료');

// Firebase Auth 인스턴스
export const auth = getAuth(app);

// Firebase Analytics 인스턴스 (브라우저에서만 사용)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
