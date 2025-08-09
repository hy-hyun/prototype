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
  { id: "n1", title: "수강신청 일정 안내", content: "8월 둘째 주 시작", pinned: true, createdAt: "2025-08-01" },
  { id: "n2", title: "시스템 점검", content: "8/10 02:00-04:00", pinned: true, createdAt: "2025-08-03" },
  { id: "n3", title: "신규 과목 안내", content: "데이터리터러시 개설", createdAt: "2025-08-05" }
];


