# 🔄 페이지 병합 체크리스트

## 📋 병합 전 준비사항
- [ ] 각 팀원의 작업 브랜치 확인
- [ ] 현재 main/master 브랜치 백업
- [ ] 병합용 새 브랜치 생성 (`merge-integration`)

## 🎯 병합 우선순위 및 체크리스트

### Phase 1: 기반 코드 통합
- [ ] **`src/lib/stores.ts`** 
  - [ ] 새로 추가된 store 함수 확인
  - [ ] 중복된 store 제거
  - [ ] 타입 일치 여부 확인
- [ ] **`src/lib/types.ts`**
  - [ ] 새로 추가된 타입 확인
  - [ ] 기존 타입과 충돌 여부 확인
- [ ] **`src/lib/mock/data.ts`**
  - [ ] Mock 데이터 중복 확인
  - [ ] 데이터 구조 일치 여부 확인

### Phase 2: 공통 컴포넌트 통합
- [ ] **`src/lib/components/`**
  - [ ] 중복된 컴포넌트 식별
  - [ ] 기능이 다른 동명 컴포넌트 처리
  - [ ] Import 경로 통일

### Phase 3: 레이아웃 및 네비게이션
- [ ] **`src/routes/+layout.svelte`**
  - [ ] 네비게이션 메뉴 통합
  - [ ] CSS 스타일 충돌 해결
  - [ ] 반응형 디자인 일관성

### Phase 4: 페이지별 통합
- [ ] **메인 페이지** (`src/routes/+page.svelte`)
  - [ ] 컴포넌트 구조 확인
  - [ ] Store 사용 방식 통일
  - [ ] CSS 클래스 정리
- [ ] **강의검색** (`src/routes/search/+page.svelte`)
  - [ ] 검색 로직 충돌 확인
  - [ ] 필터 옵션 통합
  - [ ] UI 컴포넌트 일관성
- [ ] **수강신청** (`src/routes/enroll/+page.svelte`)
  - [ ] 장바구니 로직 통합
  - [ ] 신청 프로세스 일치
  - [ ] 상태 관리 통일
- [ ] **시간표** (`src/routes/timetable/+page.svelte`)
  - [ ] 시간표 렌더링 로직
  - [ ] 데이터 구조 일치
  - [ ] 시각적 표현 통일
- [ ] **대시보드** (`src/routes/dashboard/+page.svelte`)
  - [ ] 졸업사정 로직
  - [ ] 차트 라이브러리 통합
  - [ ] 데이터 연동 확인

## ⚠️ 주요 충돌 해결 가이드

### 1. Store 충돌 해결
```typescript
// 충돌 발생 시 해결 방법
// 1. 기능이 동일한 경우: 하나로 통합
// 2. 기능이 다른 경우: 네임스페이스 분리
export const searchStore = writable(...);
export const enrollStore = writable(...);
```

### 2. 컴포넌트 충돌 해결
```svelte
<!-- 동일한 기능의 컴포넌트가 여러 개인 경우 -->
<!-- 1. 가장 완성도 높은 것 선택 -->
<!-- 2. 기능 통합하여 새로 작성 -->
<!-- 3. 페이지별로 다른 이름 사용 -->
```

### 3. CSS 충돌 해결
- Tailwind CSS 우선 사용
- 커스텀 CSS는 `app.css`에 통합
- BEM 방법론 적용 (필요시)

### 4. Import 경로 통일
```typescript
// ✅ 권장: 절대 경로 사용
import { component } from '$lib/components/Component.svelte'
import { store } from '$lib/stores'
import { type } from '$lib/types'

// ❌ 피해야 할: 상대 경로
import { component } from './Component.svelte'
import { store } from '../stores'
```

## 🧪 병합 후 테스트 체크리스트
- [ ] 모든 페이지 정상 렌더링 확인
- [ ] 네비게이션 동작 확인
- [ ] Store 상태 관리 정상 동작
- [ ] Firebase 연동 정상 동작
- [ ] 반응형 디자인 확인
- [ ] 브라우저 콘솔 에러 없음
- [ ] 빌드 에러 없음 (`npm run build`)

## 🚨 긴급 상황 대응
### 심각한 충돌 발생 시
1. 현재 작업 중단
2. 백업 브랜치로 복원
3. 충돌 원인 분석
4. 단계적 통합으로 재시도

### 롤백 명령어
```bash
git checkout backup-before-merge
git branch -D merge-integration
```

## 📞 팀원 간 소통
- 병합 중 발견된 이슈는 즉시 공유
- 각자의 의도와 구현 방식 설명
- 최종 결정은 팀 전체 합의로

