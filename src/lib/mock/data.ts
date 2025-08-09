import type { Lecture, Notice } from "$lib/types";

export const MOCK_LECTURES: Lecture[] = [
  {
    courseId: "CSE101",
    classId: "01",
    title: "컴퓨터개론",
    category: "전공",
    dept: "컴퓨터공학",
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
  }
];

export const MOCK_NOTICES: Notice[] = [
  { id: "n1", title: "🔥 2025-2학기 수강신청 일정 안내", content: "8월 12일(월) 09:00 ~ 8월 16일(금) 18:00", pinned: true, createdAt: "2025-08-01" },
  { id: "n2", title: "⚠️ 시스템 점검 안내", content: "8/10 02:00-04:00 서비스 일시 중단", pinned: true, createdAt: "2025-08-03" },
  { id: "n3", title: "신규 과목 개설 안내", content: "AI와 데이터리터러시 과목 신규 개설", createdAt: "2025-08-05" },
  { id: "n4", title: "수강신청 가이드북 배포", content: "신입생 및 편입생 대상 가이드북 배포", createdAt: "2025-08-04" },
  { id: "n5", title: "베팅제 도입 안내", content: "핵심교양 과목 베팅제 시범 운영", createdAt: "2025-08-03" }
];

export const SCHEDULE_EVENTS = [
  { date: "2025-08-12", title: "1차 수강신청", desc: "4학년 우선 신청", type: "primary" },
  { date: "2025-08-13", title: "2차 수강신청", desc: "3학년 신청 시작", type: "secondary" },
  { date: "2025-08-14", title: "3차 수강신청", desc: "2학년 신청 시작", type: "secondary" },
  { date: "2025-08-15", title: "4차 수강신청", desc: "1학년 신청 시작", type: "secondary" },
  { date: "2025-08-16", title: "수강신청 마감", desc: "18:00 최종 마감", type: "danger" }
];


