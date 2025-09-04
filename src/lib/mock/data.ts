import type { Lecture, Notice } from "$lib/types";



export const MOCK_NOTICES: Notice[] = [
  {
    id: "notice-mock-enrollment-2025-2",
    title: "2025학년도 2학기 모의수강신청 안내",
    author: "학사팀",
    createdAt: "2025-07-20",
    views: 3102,
    pinned: true,
    category: "학사",
    content: `<h3 style='font-size: 1.25rem; font-weight: bold;'>■ 모의수강신청기간</h3><p style='margin-top: 1rem; line-height: 1.6;'>2025학년도 2학기 사전 수강신청 체험기간을 진행합니다. 전체 학부 재학생은 실제 수강신청기간 중 당황하지 않도록 모의수강신청기간 세부일정을 확인한 뒤 해당시간에 필히 참여하여야 합니다. 단, 복학희망자는 복학신청 및 결재 이후 참여할 수 있습니다.</p><p style='margin-top: 1rem; line-height: 1.6;'>이번학기 <strong style='border-bottom: 1px dotted #d9534f;'>포인트 베팅제</strong> 도입으로 인하여 수강신청 방식이 크게 변경되었습니다. 자세한 사항은 공지사항의 '포인트 베팅제 안내' 페이지를 참고바랍니다. 감사합니다.</p><table style='width:100%; border-collapse: collapse; margin-top: 1.5rem; font-size: 0.95rem;'><thead style='background-color: #003366; color: white;'><tr style='text-align: center;'><th style='padding: 10px; border: 1px solid #ccc; width: 15%;'>구 분</th><th style='padding: 10px; border: 1px solid #ccc; width: 25%;'>학 년</th><th style='padding: 10px; border: 1px solid #ccc; width: 40%;'>모의 수강 신청 일자</th><th style='padding: 10px; border: 1px solid #ccc; width: 20%;'>비 고</th></tr></thead><tbody><tr><td rowspan='6' style='padding: 10px; border: 1px solid #ccc; text-align: center; vertical-align: middle;'>모의수강신청<br>및 베팅</td><td style='padding: 10px; border: 1px solid #ccc; text-align: center;'>1학년</td><td style='padding: 10px; border: 1px solid #ccc; text-align: center;'><strong>7. 28. (월)</strong> 11:00 – 15:00</td><td rowspan='6' style='padding: 10px; border: 1px solid #ccc; vertical-align: middle; text-align:left;'><ul style='list-style-type: square; padding-left: 20px; margin: 0;'><li>모의수강신청기간 중 진행된 수강신청 내역은 기간 종료 이후 모두 삭제됨</li></ul></td></tr><tr><td style='padding: 10px; border: 1px solid #ccc; text-align: center;'>2학년</td><td style='padding: 10px; border: 1px solid #ccc; text-align: center;'><strong>7. 28. (월)</strong> 15:00 – 24:00</td></tr><tr><td style='padding: 10px; border: 1px solid #ccc; text-align: center;'>3학년</td><td style='padding: 10px; border: 1px solid #ccc; text-align: center;'><strong>7. 29. (화)</strong> 11:00 – 15:00</td></tr><tr><td style='padding: 10px; border: 1px solid #ccc; text-align: center;'>4,5학년</td><td style='padding: 10px; border: 1px solid #ccc; text-align: center;'><strong>7. 29. (화)</strong> 15:00 – 24:00</td></tr><tr><td style='padding: 10px; border: 1px solid #ccc; text-align: center;'><span style='border-bottom: 1px dotted #d9534f;'>다전공</span></td><td style='padding: 10px; border: 1px solid #ccc; text-align: center;'><strong>7. 30. (수)</strong> 11:00 – 14:00</td></tr><tr><td style='padding: 10px; border: 1px solid #ccc; text-align: center;'><span style='border-bottom: 1px dotted #d9534f;'>전체학년</span></td><td style='padding: 10px; border: 1px solid #ccc; text-align: center;'><strong>7. 30. (수)</strong> 16:00 – 24:00</td></tr></tbody></table>`
  },
  {
    "id": "notice-enrollment-schedule-2025-2",
    "title": "학년별 수강신청 및 개강 전 전체 학년 수강정정 일정",
    "author": "학사팀",
    "createdAt": "2025-07-20",
    "views": 4512,
    "pinned": true,
    "category": "학사",
    "content": "<h3 style='font-size: 1.25rem; font-weight: bold;'>■ 학년별 수강신청 및 개강 전 전체 학년 수강정정 일정</h3><table style='width:100%; border-collapse: collapse; margin-top: 1.5rem; font-size: 0.95rem; text-align: center;'><thead style='background-color: #003366; color: white;'><tr style='text-align: center;'><th style='padding: 10px; border: 1px solid #ccc; width: 30%;'>구 분</th><th style='padding: 10px; border: 1px solid #ccc; width: 15%;'>학 년</th><th style='padding: 10px; border: 1px solid #ccc; width: 35%;'>신 청 일 자</th><th style='padding: 10px; border: 1px solid #ccc; width: 20%;'>비 고</th></tr></thead><tbody><tr><td rowspan='5' style='padding: 10px; border: 1px solid #ccc; vertical-align: middle;'>기본 과목 선착순 신청</td><td style='padding: 10px; border: 1px solid #ccc;'>교환학생</td><td style='padding: 10px; border: 1px solid #ccc;'><strong>8. 6. (수)</strong> 11:00 – 24:00</td><td rowspan='5' style='padding: 10px; border: 1px solid #ccc; vertical-align: middle;'>온라인 선착순 수강신청</td></tr><tr><td style='padding: 10px; border: 1px solid #ccc;'>1학년</td><td style='padding: 10px; border: 1px solid #ccc;'><strong>8. 6. (수)</strong> 13:00 – 24:00</td></tr><tr><td style='padding: 10px; border: 1px solid #ccc;'>2학년</td><td style='padding: 10px; border: 1px solid #ccc;'><strong>8. 6. (수)</strong> 15:00 – 24:00</td></tr><tr><td style='padding: 10px; border: 1px solid #ccc;'>3학년</td><td style='padding: 10px; border: 1px solid #ccc;'><strong>8. 7. (목)</strong> 11:00 – 24:00</td></tr><tr><td style='padding: 10px; border: 1px solid #ccc;'>4,5학년</td><td style='padding: 10px; border: 1px solid #ccc;'><strong>8. 7. (목)</strong> 13:00 – 24:00</td></tr><tr><td style='padding: 10px; border: 1px solid #ccc;'>베팅 1R 포인트 입력</td><td rowspan='5' style='padding: 10px; border: 1px solid #ccc; vertical-align: middle;'><span style='border-bottom: 1px dotted #d9534f;'>전체학년</span></td><td style='padding: 10px; border: 1px solid #ccc;'><strong>8. 8. (금)</strong> 09:00<br>~<br><strong>8. 11. (월)</strong> 14:00</td><td style='padding: 10px; border: 1px solid #ccc;'></td></tr><tr><td style='padding: 10px; border: 1px solid #ccc;'>베팅 1R 결과 열람</td><td style='padding: 10px; border: 1px solid #ccc;'><strong>8. 11. (월)</strong> 15:00</td><td style='padding: 10px; border: 1px solid #ccc;'></td></tr><tr><td style='padding: 10px; border: 1px solid #ccc;'>베팅 2R 포인트 입력 마감</td><td style='padding: 10px; border: 1px solid #ccc;'><strong>8. 12. (화)</strong> 09:00<br>~<br><strong>8. 13. (수)</strong> 14:00</td><td style='padding: 10px; border: 1px solid #ccc;'></td></tr><tr><td style='padding: 10px; border: 1px solid #ccc;'>베팅 2R 결과 열람</td><td style='padding: 10px; border: 1px solid #ccc;'><strong>8. 13. (수)</strong> 15:00</td><td style='padding: 10px; border: 1px solid #ccc;'></td></tr><tr><td style='padding: 10px; border: 1px solid #ccc;'>개강 전 정정</td><td style='padding: 10px; border: 1px solid #ccc;'><strong>8. 14. (목)</strong> 11:00 – 24:00</td><td style='padding: 10px; border: 1px solid #ccc;'>0~11시 수강정정 불가</td></tr></tbody></table>"
  },
  { 
    id: "n3", 
    title: "신규 과목 개설 안내", 
    content: `🆕 2025-2학기 신규 개설 과목

💻 AI 관련 과목:
- AI와 데이터리터러시 (교양)
- 머신러닝 기초 (전공)
- 딥러닝 응용 (전공심화)

🌍 글로벌 과목:
- 국제개발협력의 이해 (교양)
- 글로벌 비즈니스 영어 (교양)

🎨 융합 과목:
- 디자인씽킹과 창업 (교양)
- 예술과 기술의 만남 (교양)

각 과목의 상세 정보는 수강신청 시스템에서 확인하실 수 있습니다.`, 
    createdAt: "2025-08-05",
    author: "최**", 
    views: 892
  },
  { 
    id: "n4", 
    title: "수강신청 가이드북 배포", 
    content: `📚 2025-2학기 수강신청 가이드북 배포

🎯 대상: 신입생, 편입생, 복학생
📍 배포 장소: 
- 학생회관 1층 안내데스크
- 각 단과대학 행정사무실
- 온라인 다운로드 (학사포털)

📖 주요 내용:
- 졸업 요건 및 필수 이수 과목
- 전공 선택 가이드
- 교양 과목 이수 체계
- 베팅제 시스템 이용 방법
- 수강신청 팁 & 노하우

🕐 배포 기간: 8월 5일 ~ 8월 30일
궁금한 사항은 학사지원팀(02-2220-1234)으로 문의하세요.`, 
    createdAt: "2025-08-04",
    author: "정**", 
    views: 1567
  },
  { 
    id: "n5", 
    title: "베팅제 도입 안내", 
    content: `🎯 핵심교양 과목 베팅제 시범 운영

📋 적용 과목:
- 철학의 이해
- 경제학원론
- 심리학개론
- 사회학개론
- 한국사의 이해

💰 베팅 시스템:
- 기본 지급 포인트: 1,000점
- 최소 베팅: 100점
- 최대 베팅: 500점

🏆 선발 방식:
1. 베팅 점수 높은 순으로 선발
2. 동점시 학번 순으로 결정
3. 실패시 베팅 점수 환불

⚠️ 주의사항:
베팅 점수는 학기말까지 이월되지 않으니 신중하게 사용하세요.`, 
    createdAt: "2025-08-03",
    author: "김**", 
    views: 2341
  },
  { id: "n6", title: "2025-1학기 성적 공개", content: "7월 30일부터 포털에서 성적 조회 가능", createdAt: "2025-07-28", author: "강**", views: 3456 },
  { id: "n7", title: "여름계절학기 종료 안내", content: "8월 2일 여름계절학기 수업 종료 및 시험 일정", createdAt: "2025-07-25", author: "조**", views: 1234 },
  { id: "n8", title: "장학금 신청 마감 연장", content: "성적우수 장학금 신청 기간 8월 5일까지 연장", createdAt: "2025-07-22", author: "윤**", views: 2789 },
  { id: "n9", title: "도서관 여름방학 운영시간", content: "8월 중 도서관 운영시간: 평일 09:00-18:00", createdAt: "2025-07-20", author: "장**", views: 567 },
  { id: "n10", title: "기숙사 입사 신청 안내", content: "2학기 기숙사 입사 신청 7월 15일부터 시작", createdAt: "2025-07-12", author: "임**", views: 1892 },
  { id: "n11", title: "2025-1학기 재수강 결과", content: "재수강 성적 처리 완료, 포털에서 확인 가능", createdAt: "2025-07-10", author: "한**", views: 1456 },
  { id: "n12", title: "학과별 전공설명회 개최", content: "신입생 대상 전공설명회 7월 8일-12일 진행", createdAt: "2025-07-05", author: "서**", views: 2345 },
  { id: "n13", title: "여름휴가 중 학사일정", content: "7월-8월 학사일정 및 업무시간 안내", createdAt: "2025-06-28", author: "신**", views: 789 },
  { id: "n14", title: "2025-2학기 등록금 납부", content: "등록금 납부 기간: 8월 20일-30일", createdAt: "2025-06-25", author: "오**", views: 4123 },
  { id: "n15", title: "1학기 기말고사 종료", content: "6월 21일 기말고사 종료, 성적 입력 기간 안내", createdAt: "2025-06-20", author: "유**", views: 1678 },
  { id: "n16", title: "하계 인턴십 프로그램", content: "기업 연계 하계 인턴십 프로그램 참가자 발표", createdAt: "2025-06-15", author: "남**", views: 2987 },
  { id: "n17", title: "캠퍼스 시설 보수공사", content: "여름방학 중 학생회관 리모델링 공사 진행", createdAt: "2025-06-10", author: "문**", views: 945 },

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


