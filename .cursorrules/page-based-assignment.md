# 📄 페이지별 세부 작업 분배 - 독립 개발 가능

## 🎯 페이지별 완전 분리 원칙
- **각 페이지는 독립적으로 개발 가능**
- **페이지 간 의존성 최소화**
- **공통 컴포넌트는 단계적으로 통합**

---

## 🏠 **메인 페이지** - 현준 담당

### 📁 담당 파일
```
src/routes/+page.svelte                    # 메인 페이지
src/lib/components/MainCalendar.svelte     # 수강신청 일정 캘린더
src/lib/components/NoticePreview.svelte    # 공지사항 미리보기
src/lib/components/QuickActions.svelte     # 빠른 바로가기 버튼
src/lib/components/WelcomeSection.svelte   # 환영 섹션
```

### ✅ 세부 작업 목록
- [ ] **메인 페이지 레이아웃 (`+page.svelte`)**
  - [ ] 전체 페이지 구조 설계
  - [ ] 3단 구조 (환영/일정/공지) 배치
  - [ ] 반응형 그리드 레이아웃
  - [ ] 로딩 상태 처리

- [ ] **환영 섹션 (`WelcomeSection.svelte`)**
  - [ ] 사용자 환영 메시지
  - [ ] 현재 학기 정보 표시
  - [ ] 간단한 통계 (신청 과목 수, 남은 학점 등)

- [ ] **수강신청 일정 캘린더 (`MainCalendar.svelte`)**
  - [ ] 월별 캘린더 뷰
  - [ ] 학년별 수강신청 일정 표시
  - [ ] 중요 일정 하이라이트
  - [ ] 오늘 날짜 강조
  - [ ] 카드 뉴스 형태 디자인

- [ ] **공지사항 미리보기 (`NoticePreview.svelte`)**
  - [ ] 최신 공지사항 5개 표시
  - [ ] 중요 공지 상단 고정
  - [ ] "더 보기" 버튼
  - [ ] 공지사항 카테고리 표시

- [ ] **빠른 바로가기 (`QuickActions.svelte`)**
  - [ ] 주요 기능 바로가기 버튼
  - [ ] 아이콘 + 텍스트 버튼 디자인
  - [ ] 호버 효과 및 애니메이션

### 🔗 Mock 데이터 (독립 개발용)
```typescript
// src/lib/mock/mainPageData.ts - 현준이 작성
export const mockNotices = [...];
export const mockSchedule = [...];
export const mockUserStats = {...};
```

---

## 🔍 **강의검색 페이지** - 현준 담당

### 📁 담당 파일
```
src/routes/search/+page.svelte             # 강의검색 메인 페이지
src/lib/components/SearchHeader.svelte     # 검색 헤더 (필터 + 검색창)
src/lib/components/FilterPanel.svelte      # 필터 패널
src/lib/components/SearchInput.svelte      # 검색 입력창
src/lib/components/CourseGrid.svelte       # 강의 목록 그리드
src/lib/components/CourseCard.svelte       # 개별 강의 카드
src/lib/components/CourseDetail.svelte     # 강의 상세 모달
src/lib/components/Pagination.svelte       # 페이지네이션
```

### ✅ 세부 작업 목록
- [ ] **검색 페이지 메인 (`+page.svelte`)**
  - [ ] 검색 페이지 전체 레이아웃
  - [ ] 필터 + 목록 2단 구조
  - [ ] 검색 상태 관리 (로딩, 결과 없음 등)
  - [ ] URL 쿼리 파라미터 처리

- [ ] **검색 헤더 (`SearchHeader.svelte`)**
  - [ ] 검색창 + 필터 버튼 배치
  - [ ] 검색 결과 개수 표시
  - [ ] 정렬 옵션 (인기순, 학점순 등)

- [ ] **필터 패널 (`FilterPanel.svelte`)**
  - [ ] 학기/학년 선택 드롭다운
  - [ ] 조직(학과) 선택 트리
  - [ ] 이수구분 체크박스 (전공/교양/교직)
  - [ ] 시간대 선택 그리드
  - [ ] 학점 범위 슬라이더
  - [ ] 필터 초기화 버튼

- [ ] **검색 입력창 (`SearchInput.svelte`)**
  - [ ] 강의명 검색 입력
  - [ ] 키워드 검색 (#키워드)
  - [ ] 자동완성 드롭다운
  - [ ] 최근 검색어 기능

- [ ] **강의 목록 그리드 (`CourseGrid.svelte`)**
  - [ ] 반응형 그리드 레이아웃
  - [ ] 무한 스크롤 또는 페이지네이션
  - [ ] 검색 결과 정렬 기능
  - [ ] 빈 결과 상태 처리

- [ ] **강의 카드 (`CourseCard.svelte`)**
  - [ ] 강의 기본 정보 (제목, 교수, 시간, 학점)
  - [ ] 이수구분 + 신청방식 태그
  - [ ] 별점 평가 표시
  - [ ] 장바구니 추가 버튼
  - [ ] 바로 신청 버튼
  - [ ] 호버 효과 및 애니메이션

- [ ] **강의 상세 모달 (`CourseDetail.svelte`)**
  - [ ] 모달 팝업 구조
  - [ ] 강의 상세 정보 표시
  - [ ] 강의계획서 탭
  - [ ] 수강평 탭 (별점 + 텍스트)
  - [ ] 전년도 베팅 금액 (해당시)
  - [ ] OT 영상 링크 (선택사항)

- [ ] **페이지네이션 (`Pagination.svelte`)**
  - [ ] 페이지 번호 표시
  - [ ] 이전/다음 버튼
  - [ ] 페이지 점프 기능

### 🔗 Mock 데이터 (독립 개발용)
```typescript
// src/lib/mock/coursesData.ts - 현준이 작성
export const mockCourses = [...]; // 100개 강의 데이터
export const mockFilters = {...};
export const mockReviews = [...];
```

---

## 🛒 **수강신청 페이지** - 성민 담당

### 📁 담당 파일
```
src/routes/enroll/+page.svelte             # 수강신청 메인 페이지
src/lib/components/EnrollTabs.svelte       # 장바구니/신청내역 탭
src/lib/components/CreditInfo.svelte       # 학점 정보 표시
src/lib/components/CartSection.svelte      # 장바구니 섹션
src/lib/components/EnrollSection.svelte    # 신청내역 섹션
src/lib/components/BettingPanel.svelte     # 베팅 패널
src/lib/components/EnrollButton.svelte     # 신청/베팅 버튼
```

### ✅ 세부 작업 목록
- [ ] **수강신청 메인 페이지 (`+page.svelte`)**
  - [ ] 수강신청 페이지 전체 레이아웃
  - [ ] 탭 + 사이드바 구조
  - [ ] 실시간 업데이트 처리
  - [ ] 수강신청 시간 체크

- [ ] **탭 네비게이션 (`EnrollTabs.svelte`)**
  - [ ] 장바구니/신청내역 탭 전환
  - [ ] 선착순/베팅 서브탭
  - [ ] 탭별 개수 표시
  - [ ] 활성 탭 하이라이트

- [ ] **학점 정보 (`CreditInfo.svelte`)**
  - [ ] 현재 신청 학점 표시
  - [ ] 최소/최대 학점 표시
  - [ ] 잔여 베팅 금액 표시
  - [ ] 진행률 바 표시

- [ ] **장바구니 섹션 (`CartSection.svelte`)**
  - [ ] 장바구니 과목 목록
  - [ ] 우선순위 드래그 정렬
  - [ ] 과목 삭제 기능
  - [ ] 전체 선택/해제
  - [ ] 시간 충돌 경고

- [ ] **신청내역 섹션 (`EnrollSection.svelte`)**
  - [ ] 신청 완료 과목 목록
  - [ ] 신청 상태 표시 (대기/확정/실패)
  - [ ] 수강 취소 버튼
  - [ ] 베팅 결과 표시

- [ ] **베팅 패널 (`BettingPanel.svelte`)**
  - [ ] 베팅 금액 입력
  - [ ] 전년도 베팅 금액 참고
  - [ ] 베팅 금액 유효성 검사
  - [ ] 베팅 현황 표시
  - [ ] 남은 베팅 시간 표시

- [ ] **신청/베팅 버튼 (`EnrollButton.svelte`)**
  - [ ] 선착순 신청 버튼
  - [ ] 베팅 신청 버튼
  - [ ] 버튼 상태 관리 (활성/비활성/로딩)
  - [ ] 신청 결과 알림

### 🔗 Mock 데이터 및 API (독립 개발용)
```typescript
// src/lib/mock/enrollData.ts - 성민이 작성
export const mockCart = [...];
export const mockEnrolled = [...];
export const mockBettingHistory = [...];

// src/lib/api/enrollAPI.ts - 성민이 작성
export const enrollCourse = () => {...};
export const placeBet = () => {...};
export const cancelEnrollment = () => {...};
```

---

## 📅 **시간표 페이지** - 현준 담당

### 📁 담당 파일
```
src/routes/timetable/+page.svelte          # 시간표 메인 페이지
src/lib/components/TimetableGrid.svelte    # 시간표 그리드
src/lib/components/TimetableCell.svelte    # 시간표 셀
src/lib/components/CourseBlock.svelte      # 강의 블록
src/lib/components/TimetableSidebar.svelte # 사이드바 (장바구니)
src/lib/components/TimetableHeader.svelte  # 시간표 헤더
src/lib/components/ConflictWarning.svelte  # 충돌 경고
```

### ✅ 세부 작업 목록
- [ ] **시간표 메인 페이지 (`+page.svelte`)**
  - [ ] 시간표 + 사이드바 레이아웃
  - [ ] 학기 선택 기능
  - [ ] 시간표 데이터 로딩
  - [ ] 드래그 앤 드롭 상태 관리

- [ ] **시간표 헤더 (`TimetableHeader.svelte`)**
  - [ ] 학기 선택 드롭다운
  - [ ] 총 학점 표시
  - [ ] PNG 다운로드 버튼
  - [ ] 시간표 공유 버튼

- [ ] **시간표 그리드 (`TimetableGrid.svelte`)**
  - [ ] 7x15 시간표 그리드 생성
  - [ ] 요일 헤더 (월~일)
  - [ ] 시간 사이드바 (9시~21시)
  - [ ] 에브리타임 스타일 디자인
  - [ ] 반응형 그리드 크기 조정

- [ ] **시간표 셀 (`TimetableCell.svelte`)**
  - [ ] 개별 시간 셀
  - [ ] 드롭 존 처리
  - [ ] 셀 호버 효과
  - [ ] 시간 표시

- [ ] **강의 블록 (`CourseBlock.svelte`)**
  - [ ] 강의 정보 블록 표시
  - [ ] 드래그 가능한 블록
  - [ ] 강의명/강의실 표시
  - [ ] 블록 크기 자동 조정
  - [ ] 삭제 버튼

- [ ] **사이드바 (`TimetableSidebar.svelte`)**
  - [ ] 장바구니 과목 목록
  - [ ] 요일별 과목 구분
  - [ ] 시간표에 추가 버튼
  - [ ] 학점 계산 표시

- [ ] **충돌 경고 (`ConflictWarning.svelte`)**
  - [ ] 시간 겹침 경고 모달
  - [ ] 연강 이동시간 경고
  - [ ] 경고 메시지 표시
  - [ ] 대체 과목 제안

### 🔗 Mock 데이터 (독립 개발용)
```typescript
// src/lib/mock/timetableData.ts - 현준이 작성
export const mockTimetable = [...];
export const mockTimeSlots = [...];
export const mockConflicts = [...];
```

---

## 📊 **대시보드 페이지** - 해린 담당

### 📁 담당 파일
```
src/routes/dashboard/+page.svelte          # 대시보드 메인 페이지
src/lib/components/GraduationStatus.svelte # 졸업 사정 현황
src/lib/components/RequiredCourses.svelte  # 필수 과목 섹션
src/lib/components/RecommendedSection.svelte # 추천 강의 섹션
src/lib/components/ProgressChart.svelte    # 진행률 차트
src/lib/components/MajorTabs.svelte        # 다중전공 탭
src/lib/components/AIRecommendation.svelte # AI 추천 컴포넌트
```

### ✅ 세부 작업 목록
- [ ] **대시보드 메인 페이지 (`+page.svelte`)**
  - [ ] 대시보드 3단 레이아웃
  - [ ] 졸업사정/필수과목/추천강의 섹션
  - [ ] 데이터 로딩 상태 관리
  - [ ] 새로고침 기능

- [ ] **졸업 사정 현황 (`GraduationStatus.svelte`)**
  - [ ] 전체 졸업 요건 진행률
  - [ ] 영역별 이수 현황 (전공/교양/기타)
  - [ ] 부족 학점 계산 및 표시
  - [ ] 졸업 가능 학기 예측

- [ ] **다중전공 탭 (`MajorTabs.svelte`)**
  - [ ] 주전공/복수전공/부전공 탭
  - [ ] 탭별 졸업 요건 분리 표시
  - [ ] 전공별 진행률 비교

- [ ] **진행률 차트 (`ProgressChart.svelte`)**
  - [ ] 원형/막대 진행률 차트
  - [ ] 영역별 색상 구분
  - [ ] 애니메이션 효과
  - [ ] 차트 호버 정보

- [ ] **필수 과목 섹션 (`RequiredCourses.svelte`)**
  - [ ] 전공 필수 과목 목록
  - [ ] 교양 필수 과목 목록
  - [ ] 이수 완료/미완료 표시
  - [ ] 바로 담기/신청 버튼

- [ ] **추천 강의 섹션 (`RecommendedSection.svelte`)**
  - [ ] 요건별 추천 강의
  - [ ] 개인 취향 기반 추천
  - [ ] 추천 이유 표시
  - [ ] 추천 강의 액션 버튼

- [ ] **AI 추천 컴포넌트 (`AIRecommendation.svelte`)**
  - [ ] AI 추천 결과 카드
  - [ ] 추천 점수 시각화
  - [ ] 추천 상세 정보
  - [ ] 피드백 버튼 (좋아요/싫어요)

### 🔗 Mock 데이터 및 AI (독립 개발용)
```typescript
// src/lib/mock/dashboardData.ts - 해린이 작성
export const mockGraduationStatus = {...};
export const mockRequiredCourses = [...];
export const mockRecommendations = [...];

// src/lib/ai/mockAI.ts - 해린이 작성 (실제 AI 전 Mock)
export const getMockRecommendations = () => {...};
```

---

## 📢 **공지사항 페이지** - 현준 담당

### 📁 담당 파일
```
src/routes/notices/+page.svelte            # 공지사항 메인 페이지
src/lib/components/NoticeList.svelte       # 공지사항 목록
src/lib/components/NoticeItem.svelte       # 공지사항 항목
src/lib/components/NoticeDetail.svelte     # 공지사항 상세 모달
src/lib/components/NoticeSearch.svelte     # 공지사항 검색
src/lib/components/CategoryFilter.svelte   # 카테고리 필터
```

### ✅ 세부 작업 목록
- [ ] **공지사항 메인 페이지 (`+page.svelte`)**
  - [ ] 공지사항 페이지 레이아웃
  - [ ] 검색 + 필터 + 목록 구조
  - [ ] 페이지네이션 처리

- [ ] **공지사항 검색 (`NoticeSearch.svelte`)**
  - [ ] 제목/내용 검색
  - [ ] 날짜 범위 검색
  - [ ] 검색 결과 하이라이트

- [ ] **카테고리 필터 (`CategoryFilter.svelte`)**
  - [ ] 공지 카테고리 필터 (학사/장학/취업 등)
  - [ ] 중요도 필터 (일반/중요/긴급)
  - [ ] 필터 초기화 기능

- [ ] **공지사항 목록 (`NoticeList.svelte`)**
  - [ ] 공지사항 리스트 표시
  - [ ] 중요 공지 상단 고정
  - [ ] 무한 스크롤 또는 페이지네이션
  - [ ] 읽음/안읽음 표시

- [ ] **공지사항 항목 (`NoticeItem.svelte`)**
  - [ ] 개별 공지사항 카드
  - [ ] 제목/작성자/날짜 표시
  - [ ] 카테고리 태그
  - [ ] 첨부파일 아이콘

- [ ] **공지사항 상세 (`NoticeDetail.svelte`)**
  - [ ] 상세 내용 모달 팝업
  - [ ] 첨부파일 다운로드
  - [ ] 이전/다음 공지 이동
  - [ ] 공지사항 공유 기능

### 🔗 Mock 데이터 (독립 개발용)
```typescript
// src/lib/mock/noticesData.ts - 현준이 작성
export const mockNotices = [...]; // 50개 공지사항
export const mockCategories = [...];
export const mockAttachments = [...];
```

---

## 🔐 **로그인 시스템** - 해린 담당

### 📁 담당 파일
```
src/lib/components/LoginModal.svelte       # 로그인 모달 (기존)
src/lib/components/AuthForm.svelte         # 인증 폼
src/lib/components/UserProfile.svelte      # 사용자 프로필
src/lib/stores/authStore.ts                # 인증 상태 스토어
src/lib/api/authAPI.ts                     # 인증 API
```

### ✅ 세부 작업 목록
- [ ] **로그인 모달 (`LoginModal.svelte`)**
  - [ ] 모달 팝업 구조
  - [ ] 로그인 폼 UI
  - [ ] 유효성 검증 메시지
  - [ ] 로딩 상태 표시

- [ ] **인증 폼 (`AuthForm.svelte`)**
  - [ ] 아이디/비밀번호 입력
  - [ ] 아이디 저장 체크박스
  - [ ] 로그인 버튼
  - [ ] 비밀번호 찾기 링크 (UI만)

- [ ] **사용자 프로필 (`UserProfile.svelte`)**
  - [ ] 사용자 정보 표시
  - [ ] 로그아웃 버튼
  - [ ] 프로필 드롭다운

- [ ] **인증 상태 스토어 (`authStore.ts`)**
  - [ ] 로그인 상태 관리
  - [ ] 사용자 정보 저장
  - [ ] 자동 로그인 처리
  - [ ] 토큰 관리

- [ ] **인증 API (`authAPI.ts`)**
  - [ ] 로그인 API (Mock)
  - [ ] 로그아웃 API
  - [ ] 사용자 정보 조회
  - [ ] 토큰 갱신

### 🔗 Mock 데이터 (독립 개발용)
```typescript
// src/lib/mock/authData.ts - 해린이 작성
export const mockUsers = [...];
export const mockLoginResponse = {...};
```

---

## 🔄 페이지별 개발 순서

### Phase 1 (Week 1-2): 기본 페이지
1. **메인 페이지** (현준) - 다른 페이지 개발 기준점
2. **로그인 시스템** (해린) - 모든 페이지에서 필요

### Phase 2 (Week 3-4): 핵심 기능 페이지
3. **강의검색 페이지** (현준) - UI 복잡도 높음
4. **수강신청 페이지** (성민) - 로직 복잡도 높음

### Phase 3 (Week 5-6): 부가 기능 페이지
5. **시간표 페이지** (현준) - 강의검색 데이터 활용
6. **대시보드 페이지** (해린) - 수강신청 데이터 활용

### Phase 4 (Week 7): 완성 및 통합
7. **공지사항 페이지** (현준) - 상대적으로 단순

---

## 🚫 페이지 간 의존성 최소화

### 독립 개발을 위한 Mock 데이터
각 페이지별로 독립적인 Mock 데이터를 준비하여 다른 페이지 완성을 기다리지 않고 개발 가능

### 공통 컴포넌트 분리
```typescript
// 공통 컴포넌트는 별도 개발 후 각 페이지에 적용
src/lib/components/common/
├── Button.svelte          # 공통 버튼
├── Modal.svelte           # 공통 모달
├── Loading.svelte         # 공통 로딩
└── Toast.svelte           # 공통 알림
```

### API 인터페이스 통일
```typescript
// src/lib/types/api.ts - 해린이 관리
export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
```

---

## 📋 페이지별 완성도 체크리스트

### 각 페이지 완성 기준
- [ ] 기본 UI 구현 완료
- [ ] Mock 데이터 연동 완료
- [ ] 반응형 디자인 적용
- [ ] 로딩/에러 상태 처리
- [ ] 기본 인터랙션 동작
- [ ] 다른 페이지로 네비게이션

### 통합 준비 완료 기준
- [ ] 실제 API 연동 준비
- [ ] 공통 컴포넌트 적용
- [ ] 상태 관리 통합
- [ ] 라우팅 연결
- [ ] 데이터 흐름 확인

---

**💡 페이지별 독립 개발의 장점**
- 각자 속도에 맞춰 개발 가능
- 다른 팀원 작업 완료 대기 불필요
- 페이지별 완성도 확인 용이
- 통합 시점에서 충돌 최소화

**🚀 체계적인 페이지별 개발로 효율성 극대화!**
