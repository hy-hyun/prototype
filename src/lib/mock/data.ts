import type { Lecture, Notice } from "$lib/types";



export const MOCK_NOTICES: Notice[] = [
  { id: "n1", title: "2025-2학기 수강신청 일정 안내", content: "8월 12일(월) 09:00 ~ 8월 16일(금) 18:00", pinned: true, createdAt: "2025-08-01" },
  { id: "n2", title: "시스템 점검 안내", content: "8/10 02:00-04:00 서비스 일시 중단", pinned: true, createdAt: "2025-08-03" },
  { id: "n3", title: "신규 과목 개설 안내", content: "AI와 데이터리터러시 과목 신규 개설", createdAt: "2025-08-05" },
  { id: "n4", title: "수강신청 가이드북 배포", content: "신입생 및 편입생 대상 가이드북 배포", createdAt: "2025-08-04" },
  { id: "n5", title: "베팅제 도입 안내", content: "핵심교양 과목 베팅제 시범 운영", createdAt: "2025-08-03" },
  { id: "n6", title: "2025-1학기 성적 공개", content: "7월 30일부터 포털에서 성적 조회 가능", createdAt: "2025-07-28" },
  { id: "n7", title: "여름계절학기 종료 안내", content: "8월 2일 여름계절학기 수업 종료 및 시험 일정", createdAt: "2025-07-25" },
  { id: "n8", title: "장학금 신청 마감 연장", content: "성적우수 장학금 신청 기간 8월 5일까지 연장", createdAt: "2025-07-22" },
  { id: "n9", title: "도서관 여름방학 운영시간", content: "8월 중 도서관 운영시간: 평일 09:00-18:00", createdAt: "2025-07-20" },
  { id: "n10", title: "기숙사 입사 신청 안내", content: "2학기 기숙사 입사 신청 7월 15일부터 시작", createdAt: "2025-07-12" },
  { id: "n11", title: "2025-1학기 재수강 결과", content: "재수강 성적 처리 완료, 포털에서 확인 가능", createdAt: "2025-07-10" },
  { id: "n12", title: "학과별 전공설명회 개최", content: "신입생 대상 전공설명회 7월 8일-12일 진행", createdAt: "2025-07-05" },
  { id: "n13", title: "여름휴가 중 학사일정", content: "7월-8월 학사일정 및 업무시간 안내", createdAt: "2025-06-28" },
  { id: "n14", title: "2025-2학기 등록금 납부", content: "등록금 납부 기간: 8월 20일-30일", createdAt: "2025-06-25" },
  { id: "n15", title: "1학기 기말고사 종료", content: "6월 21일 기말고사 종료, 성적 입력 기간 안내", createdAt: "2025-06-20" },
  { id: "n16", title: "하계 인턴십 프로그램", content: "기업 연계 하계 인턴십 프로그램 참가자 발표", createdAt: "2025-06-15" },
  { id: "n17", title: "캠퍼스 시설 보수공사", content: "여름방학 중 학생회관 리모델링 공사 진행", createdAt: "2025-06-10" },

];

export const SCHEDULE_EVENTS = [
  { date: "2025-08-12", title: "1차 수강신청", desc: "4학년 우선 신청", type: "primary" },
  { date: "2025-08-13", title: "2차 수강신청", desc: "3학년 신청 시작", type: "secondary" },
  { date: "2025-08-14", title: "3차 수강신청", desc: "2학년 신청 시작", type: "secondary" },
  { date: "2025-08-15", title: "4차 수강신청", desc: "1학년 신청 시작", type: "secondary" },
  { date: "2025-08-16", title: "수강신청 마감", desc: "18:00 최종 마감", type: "danger" }
];

// 기본 필터 옵션 (학기, 학년은 고정)
export const STATIC_FILTER_OPTIONS = {
  terms: [
    { value: "2025-2", label: "2025-2학기" },
    { value: "2025-1", label: "2025-1학기" },
    { value: "2024-2", label: "2024-2학기" }
  ],
  grades: [
    { value: "1", label: "1학년" },
    { value: "2", label: "2학년" },
    { value: "3", label: "3학년" },
    { value: "4", label: "4학년" }
  ],
  courseLevels: [
    { value: "100", label: "100단계 (1학년)" },
    { value: "200", label: "200단계 (2학년)" },
    { value: "300", label: "300단계 (3학년)" },
    { value: "400", label: "400단계 (4학년)" }
  ],
  creditHours: [
    { value: "1", label: "1학점" },
    { value: "2", label: "2학점" },
    { value: "3", label: "3학점" },
    { value: "4", label: "4학점" }
  ]
};


