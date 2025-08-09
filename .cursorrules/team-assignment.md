# 👥 팀별 세부 작업 분배 - GitHub 충돌 최소화

## 🎯 기본 원칙
- **파일 단위 분리**: 각자 담당 파일을 명확히 구분
- **브랜치 전략**: feature/담당자명/기능명 형태로 브랜치 생성
- **공통 파일 최소화**: 여러 명이 동시 수정하는 파일 최소화
- **순차적 통합**: 핵심 공통 파일은 순서를 정해 통합

---

## 👨‍💻 현준 (Frontend UI/UX 전문)

### 🎨 담당 영역: 사용자 인터페이스 및 시각적 요소

#### 📁 전담 파일 및 폴더
```
src/lib/components/
├── Header.svelte           # 상단 네비게이션 바
├── Footer.svelte           # 하단 푸터
├── CourseCard.svelte       # 강의 카드 컴포넌트
├── CourseList.svelte       # 강의 목록 컴포넌트  
├── SearchFilter.svelte     # 검색 필터 컴포넌트
├── Timetable.svelte        # 시간표 그리드 컴포넌트
├── TimetableCell.svelte    # 시간표 셀 컴포넌트
├── NoticeCard.svelte       # 공지사항 카드
└── LoadingSpinner.svelte   # 로딩 스피너

src/routes/
├── +layout.svelte          # 전체 레이아웃
├── +page.svelte            # 메인 페이지
├── search/
│   └── +page.svelte        # 강의검색 페이지
├── timetable/
│   └── +page.svelte        # 시간표 페이지
└── notices/
    └── +page.svelte        # 공지사항 페이지

src/
└── app.css                 # 전역 스타일시트
```

#### ✅ 세부 작업 목록

##### 🏗️ Week 1-2: 기본 레이아웃 및 공통 컴포넌트
- [ ] **Header.svelte** 개발
  - [ ] 로고 및 네비게이션 메뉴
  - [ ] 반응형 모바일 햄버거 메뉴
  - [ ] 로그인 상태 표시 영역
- [ ] **Footer.svelte** 개발
- [ ] **+layout.svelte** 개발
  - [ ] 전체 페이지 구조
  - [ ] 헤더/푸터 배치
  - [ ] 모바일 반응형 레이아웃
- [ ] **app.css** 전역 스타일 정의
  - [ ] CSS 변수 정의
  - [ ] 기본 타이포그래피
  - [ ] 버튼 스타일
  - [ ] 카드 스타일

##### 🏠 Week 3: 메인 페이지
- [ ] **+page.svelte (메인)** 개발
  - [ ] 수강신청 일정 캘린더 섹션
  - [ ] 최신 공지사항 섹션
  - [ ] 빠른 바로가기 버튼들
- [ ] **NoticeCard.svelte** 개발
  - [ ] 공지사항 카드 디자인
  - [ ] 중요 공지 하이라이트
- [ ] **LoadingSpinner.svelte** 개발

##### 🔍 Week 4-5: 강의검색 페이지
- [ ] **search/+page.svelte** 개발
  - [ ] 검색 페이지 레이아웃
  - [ ] 필터와 목록 배치
- [ ] **SearchFilter.svelte** 개발
  - [ ] 학기/학년/조직 드롭다운
  - [ ] 시간대 필터
  - [ ] 이수구분 필터
- [ ] **CourseCard.svelte** 개발
  - [ ] 강의 정보 카드 디자인
  - [ ] 별점 표시
  - [ ] 장바구니/신청 버튼
- [ ] **CourseList.svelte** 개발
  - [ ] 강의 목록 컨테이너
  - [ ] 페이지네이션
  - [ ] 정렬 옵션

##### 📅 Week 6: 시간표 페이지
- [ ] **timetable/+page.svelte** 개발
  - [ ] 시간표 페이지 레이아웃
  - [ ] 사이드바 장바구니 영역
- [ ] **Timetable.svelte** 개발
  - [ ] 7x15 시간표 그리드
  - [ ] 드래그 앤 드롭 지원
  - [ ] 에브리타임 스타일 UI
- [ ] **TimetableCell.svelte** 개발
  - [ ] 개별 시간표 셀
  - [ ] 강의 블록 표시
  - [ ] 겹침 경고 표시

##### 📢 Week 7: 공지사항 페이지  
- [ ] **notices/+page.svelte** 개발
  - [ ] 공지사항 목록 페이지
  - [ ] 검색 및 필터링
  - [ ] 페이지네이션

---

## 👨‍💻 성민 (Backend Logic & Data 전문)

### ⚙️ 담당 영역: 데이터 관리 및 비즈니스 로직

#### 📁 전담 파일 및 폴더
```
src/lib/
├── stores.ts               # Svelte 스토어 (전역 상태)
├── api/
│   ├── auth.ts            # 인증 관련 API
│   ├── courses.ts         # 강의 관련 API  
│   ├── enrollment.ts      # 수강신청 관련 API
│   ├── betting.ts         # 베팅 시스템 API
│   └── notices.ts         # 공지사항 API
├── utils/
│   ├── validation.ts      # 입력값 검증 유틸
│   ├── dateUtils.ts       # 날짜 처리 유틸
│   ├── creditUtils.ts     # 학점 계산 유틸
│   └── conflictChecker.ts # 시간표 충돌 검사
├── services/
│   ├── firebase.ts        # Firebase 설정
│   ├── geminiAI.ts        # Gemini AI 서비스
│   └── kakaoMap.ts        # 카카오맵 서비스
└── mock/
    └── data.ts            # Mock 데이터 (기존)

src/routes/enroll/
└── +page.svelte           # 수강신청 페이지

firebase/
├── firestore.rules        # Firestore 보안 규칙
└── firebase.json          # Firebase 설정
```

#### ✅ 세부 작업 목록

##### 🔧 Week 1: 개발 환경 및 Firebase 설정
- [ ] **Firebase 프로젝트 설정**
  - [ ] Firebase 프로젝트 생성
  - [ ] 환경 변수 설정 (.env)
  - [ ] Firebase SDK 설치 및 설정
- [ ] **services/firebase.ts** 개발
  - [ ] Firebase 초기화
  - [ ] Firestore 연결 설정
  - [ ] Authentication 설정
- [ ] **firestore.rules** 작성
  - [ ] 사용자 데이터 보안 규칙
  - [ ] 강의 데이터 읽기 권한
  - [ ] 수강신청 데이터 규칙

##### 📊 Week 2: 데이터 모델 및 Mock 데이터
- [ ] **mock/data.ts** 확장
  - [ ] 강의 데이터 100개 이상
  - [ ] 교수진 정보
  - [ ] 건물/강의실 정보  
  - [ ] 학과/전공 정보
  - [ ] 졸업 요건 데이터
- [ ] **utils/validation.ts** 개발
  - [ ] 입력값 검증 함수들
  - [ ] 이메일/비밀번호 검증
  - [ ] 학점 범위 검증
- [ ] **utils/dateUtils.ts** 개발
  - [ ] 날짜 포맷팅 함수
  - [ ] 학기 계산 함수
  - [ ] 수강신청 기간 체크

##### 🔐 Week 3: 인증 시스템
- [ ] **api/auth.ts** 개발
  - [ ] 로그인/로그아웃 함수
  - [ ] 회원가입 함수
  - [ ] 사용자 정보 조회
  - [ ] 토큰 관리
- [ ] **stores.ts** 개발 (인증 부분)
  - [ ] 사용자 상태 스토어
  - [ ] 로그인 상태 관리
  - [ ] 자동 로그인 처리

##### 📚 Week 4: 강의 관련 API
- [ ] **api/courses.ts** 개발
  - [ ] 강의 목록 조회 API
  - [ ] 강의 검색 API
  - [ ] 강의 필터링 API
  - [ ] 강의 상세 정보 API
- [ ] **utils/conflictChecker.ts** 개발
  - [ ] 시간표 겹침 검사
  - [ ] 학점 한도 검사
  - [ ] 선수과목 검사

##### 🛒 Week 5-6: 수강신청 시스템
- [ ] **enroll/+page.svelte** 개발
  - [ ] 수강신청 페이지 레이아웃
  - [ ] 장바구니/신청내역 탭
  - [ ] 학점 정보 표시
- [ ] **api/enrollment.ts** 개발
  - [ ] 장바구니 CRUD API
  - [ ] 선착순 신청 API
  - [ ] 신청 취소 API
  - [ ] 신청 내역 조회 API
- [ ] **api/betting.ts** 개발
  - [ ] 베팅 신청 API
  - [ ] 베팅 금액 관리
  - [ ] 낙찰 처리 로직
  - [ ] 베팅 현황 조회
- [ ] **utils/creditUtils.ts** 개발
  - [ ] 학점 계산 함수
  - [ ] 베팅 크레딧 관리
  - [ ] 졸업 요건 계산

##### 📢 Week 7: 공지사항 및 최적화
- [ ] **api/notices.ts** 개발
  - [ ] 공지사항 목록 API
  - [ ] 공지사항 상세 API
  - [ ] 중요 공지 관리
- [ ] **성능 최적화**
  - [ ] API 캐싱 구현
  - [ ] 데이터 로딩 최적화
  - [ ] 에러 핸들링 강화

---

## 👩‍💻 해린 (AI & Integration 전문)

### 🤖 담당 영역: AI 기능 및 시스템 통합

#### 📁 전담 파일 및 폴더
```
src/lib/components/
├── LoginModal.svelte       # 로그인 모달 (기존)
├── AIRecommendation.svelte # AI 추천 컴포넌트
├── ChatBot.svelte          # AI 챗봇 인터페이스
├── DashboardCard.svelte    # 대시보드 카드
├── GraduationProgress.svelte # 졸업 사정 진행률
├── RecommendedCourses.svelte # 추천 강의 목록
└── MapRoute.svelte         # 경로 안내 컴포넌트

src/routes/dashboard/
└── +page.svelte            # 대시보드 페이지

src/lib/
├── ai/
│   ├── promptTemplates.ts  # AI 프롬프트 템플릿
│   ├── recommendationEngine.ts # 추천 엔진 로직
│   └── chatProcessor.ts    # 챗봇 처리 로직
├── map/
│   ├── buildingData.ts     # 건물 위치 데이터
│   ├── routeCalculator.ts  # 경로 계산 로직
│   └── pathfinder.ts       # 최적 경로 알고리즘
└── integration/
    ├── stateManager.ts     # 전역 상태 관리
    ├── eventBus.ts         # 컴포넌트 간 통신
    └── dataSync.ts         # 데이터 동기화
```

#### ✅ 세부 작업 목록

##### 🔐 Week 1: 로그인 시스템 완성
- [ ] **LoginModal.svelte** 개발 (기존 파일 개선)
  - [ ] 로그인 폼 UI 완성
  - [ ] 유효성 검증 UI
  - [ ] 아이디 저장 기능
  - [ ] 로딩 상태 표시
- [ ] **integration/stateManager.ts** 개발
  - [ ] 전역 상태 관리 로직
  - [ ] 로그인 상태 동기화
  - [ ] 세션 관리
- [ ] **integration/eventBus.ts** 개발
  - [ ] 컴포넌트 간 이벤트 통신
  - [ ] 알림 시스템 구축

##### 🏗️ Week 2: 대시보드 기반 구조
- [ ] **dashboard/+page.svelte** 개발
  - [ ] 대시보드 메인 레이아웃
  - [ ] 3단 구조 (졸업사정/기본수업/추천강의)
- [ ] **DashboardCard.svelte** 개발
  - [ ] 재사용 가능한 카드 컴포넌트
  - [ ] 다양한 카드 타입 지원
- [ ] **GraduationProgress.svelte** 개발
  - [ ] 졸업 요건 진행률 시각화
  - [ ] 원형/막대 그래프
  - [ ] 다중전공 지원

##### 🤖 Week 3-4: AI 추천 시스템 구축
- [ ] **services/geminiAI.ts** 개발 (성민과 협업)
  - [ ] Gemini AI API 연동
  - [ ] API 키 관리
  - [ ] 요청/응답 처리
- [ ] **ai/promptTemplates.ts** 개발
  - [ ] 강의 추천용 프롬프트
  - [ ] 학업 계획 프롬프트
  - [ ] 시간표 최적화 프롬프트
- [ ] **ai/recommendationEngine.ts** 개발
  - [ ] 추천 알고리즘 로직
  - [ ] 가중치 계산
  - [ ] 사용자 커스터마이징
- [ ] **AIRecommendation.svelte** 개발
  - [ ] AI 추천 결과 표시
  - [ ] 추천 이유 설명
  - [ ] 추천 강의 액션 버튼

##### 💬 Week 5: AI 챗봇 인터페이스
- [ ] **ChatBot.svelte** 개발
  - [ ] 채팅 인터페이스 UI
  - [ ] 메시지 입력/전송
  - [ ] 대화 히스토리
  - [ ] 팝업/고정 모드 지원
- [ ] **ai/chatProcessor.ts** 개발
  - [ ] 자연어 처리 로직
  - [ ] 의도 분석 (강의검색/추천/문의)
  - [ ] 응답 생성 및 포맷팅
- [ ] **RecommendedCourses.svelte** 개발
  - [ ] 추천 강의 목록 표시
  - [ ] 추천 점수 시각화
  - [ ] 바로 담기 기능

##### 🗺️ Week 6: 캠퍼스 이동 최적화
- [ ] **services/kakaoMap.ts** 개발 (성민과 협업)
  - [ ] 카카오맵 API 연동
  - [ ] 경로 검색 API 호출
- [ ] **map/buildingData.ts** 개발
  - [ ] 캠퍼스 건물 좌표 데이터
  - [ ] 건물 간 연결 정보
  - [ ] 배리어프리 경로 정보
- [ ] **map/routeCalculator.ts** 개발
  - [ ] 건물 간 이동시간 계산
  - [ ] 최단 경로 알고리즘
  - [ ] 휠체어 경로 계산
- [ ] **MapRoute.svelte** 개발
  - [ ] 경로 안내 컴포넌트
  - [ ] 지도 표시 (선택사항)
  - [ ] 이동시간 경고

##### 🔄 Week 7: 시스템 통합 및 최적화
- [ ] **integration/dataSync.ts** 개발
  - [ ] 실시간 데이터 동기화
  - [ ] 오프라인 상태 처리
  - [ ] 충돌 해결 로직
- [ ] **전체 시스템 통합**
  - [ ] 컴포넌트 간 데이터 흐름 최적화
  - [ ] 성능 모니터링 및 개선
  - [ ] 에러 핸들링 통합
- [ ] **접근성 개선**
  - [ ] 스크린 리더 지원
  - [ ] 키보드 네비게이션
  - [ ] 색상 대비 개선

---

## 🔄 협업 워크플로우

### 🌿 브랜치 전략
```
main
├── develop
├── feature/hyunjun/header-component
├── feature/hyunjun/search-page  
├── feature/sungmin/auth-system
├── feature/sungmin/enrollment-api
├── feature/haerin/ai-recommendation
└── feature/haerin/dashboard-page
```

### 📋 작업 순서 및 의존성

#### Week 1: 기반 작업 (병렬 진행 가능)
- **현준**: Header, Footer, Layout 컴포넌트
- **성민**: Firebase 설정, 기본 API 구조
- **해린**: LoginModal, 전역 상태 관리

#### Week 2: 데이터 및 스타일 (병렬 진행 가능)
- **현준**: 전역 스타일, 기본 컴포넌트
- **성민**: Mock 데이터, 유틸리티 함수
- **해린**: 대시보드 기본 구조

#### Week 3: 페이지별 개발 (의존성 주의)
- **현준**: 메인 페이지 (성민의 공지사항 API 필요)
- **성민**: 인증 API (해린의 LoginModal과 통합)
- **해린**: AI 시스템 구축

#### Week 4-7: 핵심 기능 개발 (순차적 통합)
- 각자 담당 영역 개발 후 순차적으로 통합
- 매주 금요일 통합 테스트 및 충돌 해결

### 🚫 충돌 방지 규칙

#### 1. 공통 파일 수정 금지
- `package.json`: 팀 리더(해린)만 수정
- `svelte.config.js`: 팀 리더(해린)만 수정  
- `vite.config.ts`: 팀 리더(해린)만 수정
- `app.html`: 현준만 수정

#### 2. 공유 타입 정의
```typescript
// src/lib/types.ts - 해린이 관리, 다른 팀원은 사용만
export interface User { ... }
export interface Course { ... }
// 타입 추가 요청은 슬랙/디스코드로 해린에게 요청
```

#### 3. 스토어 분리
```typescript
// src/lib/stores.ts - 성민이 관리
export const userStore = writable(null);      // 성민 담당
export const coursesStore = writable([]);     // 성민 담당  
export const aiStore = writable(null);        // 해린 담당
export const uiStore = writable({});          // 현준 담당
```

### 📅 주간 일정

#### 매주 월요일 오전 10시: 주간 계획 회의
- 이번 주 목표 확인
- 의존성 있는 작업 조율
- 블로커 사항 공유

#### 매주 금요일 오후 5시: 통합 및 리뷰
- 개발 완료 기능 데모
- 코드 리뷰 및 머지
- 다음 주 계획 수립

### 🛠️ 개발 도구 설정

#### VSCode 확장 프로그램 (공통 설치)
```json
{
  "recommendations": [
    "svelte.svelte-vscode",
    "bradlc.vscode-tailwindcss", 
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "GitLens.gitlens"
  ]
}
```

#### Prettier 설정 (.prettierrc) - 해린이 관리
```json
{
  "semi": true,
  "trailingComma": "es5", 
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

---

## 🚨 충돌 발생 시 해결 절차

### 1단계: 로컬에서 해결
```bash
git fetch origin
git rebase origin/develop
# 충돌 해결 후
git add .
git rebase --continue
```

### 2단계: 팀원과 상의
- 슬랙/디스코드에서 충돌 상황 공유
- 필요시 화면 공유로 함께 해결

### 3단계: 마지막 수단
- 해린이 최종 중재 및 해결
- 팀 회의를 통한 작업 범위 재조정

---

**💡 성공적인 협업을 위한 팁**
- 매일 오전 각자 진행 상황 슬랙에 공유
- 막히는 부분은 혼자 고민하지 말고 바로 공유
- 코드 리뷰는 비판이 아닌 함께 성장하는 과정
- 서로의 코딩 스타일을 존중하되 일관성 유지

**화이팅! 🚀 좋은 결과 만들어봅시다!**
