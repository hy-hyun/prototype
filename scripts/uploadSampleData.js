// Firebase에 샘플 강의 데이터를 업로드하는 스크립트
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyBVDytX4ZTbBt1y8STt9vVdfF7_cmw7Gk0",
  authDomain: "gen-lang-client-0705810476.firebaseapp.com",
  projectId: "gen-lang-client-0705810476",
  storageBucket: "gen-lang-client-0705810476.firebasestorage.app",
  messagingSenderId: "1012745348076",
  appId: "1:1012745348076:web:dd2d93317dca103b3496c9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 샘플 강의 데이터
const sampleLectures = [
  {
    courseId: "CSE101",
    classId: "01",
    title: "컴퓨터개론",
    category: "전공",
    dept: "컴퓨터공학과",
    instructor: "김교수",
    credits: { lecture: 2, lab: 1 },
    schedule: [
      { day: 1, start: 2, end: 3, building: "IT", room: "101" },
      { day: 3, start: 2, end: 3, building: "IT", room: "101" }
    ],
    capacity: 60,
    area: "전공핵심",
    keywords: ["#기초", "#프로그래밍"],
    method: "FCFS"
  },
  {
    courseId: "GEN201",
    classId: "02",
    title: "인공지능의 이해",
    category: "교양",
    dept: "교양학부",
    instructor: "이교수",
    credits: { lecture: 3, lab: 0 },
    schedule: [{ day: 2, start: 4, end: 6, building: "ENG", room: "201" }],
    capacity: 80,
    area: "핵심교양",
    keywords: ["#AI", "#기초"],
    method: "BID"
  },
  {
    courseId: "CSE201",
    classId: "01",
    title: "자료구조",
    category: "전공",
    dept: "컴퓨터공학과",
    instructor: "박교수",
    credits: { lecture: 3, lab: 0 },
    schedule: [
      { day: 1, start: 4, end: 5, building: "IT", room: "201" },
      { day: 3, start: 4, end: 5, building: "IT", room: "201" }
    ],
    capacity: 50,
    area: "전공핵심",
    keywords: ["#알고리즘", "#프로그래밍"],
    method: "FCFS"
  },
  {
    courseId: "MAT101",
    classId: "01", 
    title: "미적분학",
    category: "전공",
    dept: "수학과",
    instructor: "최교수",
    credits: { lecture: 3, lab: 0 },
    schedule: [
      { day: 2, start: 1, end: 2, building: "SCI", room: "301" },
      { day: 4, start: 1, end: 2, building: "SCI", room: "301" }
    ],
    capacity: 40,
    area: "전공기초",
    keywords: ["#수학", "#기초"],
    method: "FCFS"
  },
  {
    courseId: "ENG101",
    classId: "01",
    title: "대학영어",
    category: "교양",
    dept: "교양학부",
    instructor: "Smith",
    credits: { lecture: 3, lab: 0 },
    schedule: [{ day: 5, start: 2, end: 4, building: "HUM", room: "101" }],
    capacity: 25,
    area: "핵심교양",
    keywords: ["#영어", "#의사소통"],
    method: "FCFS"
  }
];

// 데이터 업로드 함수
async function uploadSampleData() {
  try {
    console.log('샘플 데이터 업로드 시작...');
    
    for (const lecture of sampleLectures) {
      const docRef = await addDoc(collection(db, 'courses'), lecture);
      console.log(`강의 "${lecture.title}" 업로드 완료. ID: ${docRef.id}`);
    }
    
    console.log('모든 샘플 데이터 업로드 완료!');
  } catch (error) {
    console.error('데이터 업로드 중 오류 발생:', error);
  }
}

// 스크립트 실행
uploadSampleData();
