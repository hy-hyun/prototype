# 🎨 hy-path 프로젝트 코딩 스타일 가이드

## 🚀 Svelte 5 룬모드 (Runes Mode) 필수 준수

### 📌 기본 원칙
- **Svelte 5 룬모드를 반드시 사용**할 것
- 기존 Svelte 4 방식의 `let`, `$:` 등은 사용 금지
- 모든 상태 관리는 룬(runes)을 통해서만 진행

## 🔧 Svelte 5 룬모드 사용법

### 1️⃣ 상태 관리 (State Management)
```svelte
<script>
  // ✅ 올바른 방법 - $state 룬 사용
  let count = $state(0);
  let user = $state({ name: '', email: '' });
  let items = $state([]);

  // ❌ 잘못된 방법 - 기존 Svelte 4 방식
  // let count = 0;
  // export let user;
</script>
```

### 2️⃣ 계산된 값 (Derived Values)
```svelte
<script>
  let firstName = $state('');
  let lastName = $state('');
  
  // ✅ 올바른 방법 - $derived 룬 사용
  let fullName = $derived(`${firstName} ${lastName}`);
  let isValid = $derived(firstName.length > 0 && lastName.length > 0);

  // ❌ 잘못된 방법 - 기존 반응형 구문
  // $: fullName = `${firstName} ${lastName}`;
</script>
```

### 3️⃣ 부작용 처리 (Side Effects)
```svelte
<script>
  let data = $state([]);
  let loading = $state(false);

  // ✅ 올바른 방법 - $effect 룬 사용
  $effect(() => {
    console.log('데이터가 변경됨:', data);
  });

  // 조건부 효과
  $effect(() => {
    if (loading) {
      console.log('로딩 중...');
    }
  });

  // ❌ 잘못된 방법 - 기존 반응형 구문
  // $: console.log('데이터가 변경됨:', data);
</script>
```

### 4️⃣ Props 처리
```svelte
<script>
  // ✅ 올바른 방법 - $props 룬 사용
  let { title, items = [], onSelect } = $props();

  // ❌ 잘못된 방법 - 기존 export 방식
  // export let title;
  // export let items = [];
  // export let onSelect;
</script>
```

## 📝 일반 코딩 스타일 규칙

### 🎯 네이밍 컨벤션
```svelte
<script>
  // 변수명: camelCase
  let userName = $state('');
  let courseList = $state([]);
  
  // 상수: UPPER_SNAKE_CASE
  const MAX_CREDITS = 21;
  const API_BASE_URL = 'https://api.example.com';
  
  // 컴포넌트명: PascalCase
  import LoginModal from '$lib/components/LoginModal.svelte';
  import CourseCard from '$lib/components/CourseCard.svelte';
  
  // 함수명: camelCase
  function handleSubmit() { }
  function validateForm() { }
</script>
```

### 🏗️ 파일 구조 및 import 순서
```svelte
<script>
  // 1. 외부 라이브러리 import
  import { writable } from 'svelte/store';
  import { toast } from '$lib/toast';
  
  // 2. 내부 컴포넌트 import
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  
  // 3. 타입 import (TypeScript 사용 시)
  import type { Course, User } from '$lib/types';
  
  // 4. Props 정의
  let { user, courses = [] } = $props();
  
  // 5. 상태 변수
  let loading = $state(false);
  let selectedCourse = $state(null);
  
  // 6. 파생 상태
  let filteredCourses = $derived(
    courses.filter(course => course.available)
  );
  
  // 7. 함수 정의
  function handleCourseSelect(course) {
    selectedCourse = course;
  }
  
  // 8. 효과 (Effects)
  $effect(() => {
    if (selectedCourse) {
      console.log('선택된 과목:', selectedCourse.name);
    }
  });
</script>
```

### 🎨 HTML 템플릿 스타일
```svelte
<!-- 조건부 렌더링 -->
{#if loading}
  <div class="loading">로딩 중...</div>
{:else if courses.length === 0}
  <div class="empty">등록된 과목이 없습니다.</div>
{:else}
  <!-- 반복 렌더링 -->
  {#each courses as course (course.id)}
    <div 
      class="course-card"
      class:selected={selectedCourse?.id === course.id}
      onclick={() => handleCourseSelect(course)}
    >
      <h3>{course.name}</h3>
      <p>{course.professor}</p>
    </div>
  {/each}
{/if}

<!-- 이벤트 핸들러는 화살표 함수 사용 -->
<button onclick={() => handleSubmit()}>
  제출
</button>

<!-- 양방향 바인딩 -->
<input bind:value={searchQuery} placeholder="과목명 검색" />
```

### 💅 CSS 스타일 규칙
```svelte
<style>
  /* 컴포넌트 스코프 스타일 사용 */
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  /* BEM 방식 클래스명 권장 */
  .course-card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .course-card:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
  }
  
  .course-card--selected {
    border-color: #3b82f6;
    background-color: #eff6ff;
  }
  
  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .container {
      padding: 0.5rem;
    }
  }
</style>
```

## 🔍 TypeScript 사용 규칙

### 📋 타입 정의
```typescript
// src/lib/types.ts
export interface User {
  id: string;
  name: string;
  email: string;
  studentId: string;
}

export interface Course {
  id: string;
  name: string;
  professor: string;
  credits: number;
  schedule: Schedule[];
  maxStudents: number;
  enrolledStudents: number;
}

export interface Schedule {
  day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI';
  startTime: string;
  endTime: string;
  room: string;
}
```

### 🎯 컴포넌트에서 타입 사용
```svelte
<script lang="ts">
  import type { Course, User } from '$lib/types';
  
  // Props 타입 지정
  let { 
    user, 
    courses = [], 
    onCourseSelect 
  }: {
    user: User;
    courses?: Course[];
    onCourseSelect?: (course: Course) => void;
  } = $props();
  
  let selectedCourse = $state<Course | null>(null);
  
  function handleSelect(course: Course): void {
    selectedCourse = course;
    onCourseSelect?.(course);
  }
</script>
```

## 🚫 금지 사항

### ❌ 사용하지 말아야 할 것들
```svelte
<script>
  // ❌ Svelte 4 방식의 상태 관리
  let count = 0;
  export let props;
  
  // ❌ 기존 반응형 구문
  $: doubled = count * 2;
  $: if (count > 10) console.log('큰 수');
  
  // ❌ 기존 생명주기 함수
  import { onMount, beforeUpdate } from 'svelte';
  onMount(() => {});
  
  // ❌ 인라인 스타일 (특별한 경우 제외)
  // <div style="color: red;">
  
  // ❌ 긴 인라인 이벤트 핸들러
  // <button onclick="console.log('clicked'); doSomething(); updateState();">
</script>
```

## ✅ 체크리스트

개발 전 반드시 확인하세요:

- [ ] Svelte 5 룬모드 사용 (`$state`, `$derived`, `$effect`, `$props`)
- [ ] 기존 Svelte 4 방식 제거 (`let`, `export`, `$:`)
- [ ] 적절한 네이밍 컨벤션 적용
- [ ] TypeScript 타입 정의 및 사용
- [ ] 컴포넌트 스코프 CSS 사용
- [ ] 반응형 디자인 고려
- [ ] 접근성(a11y) 고려

## 🛠️ 개발 도구 설정

### VSCode 확장 프로그램
- Svelte for VS Code
- Prettier - Code formatter
- ESLint
- TypeScript Importer

### Prettier 설정 (.prettierrc)
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "svelteSortOrder": "options-scripts-markup-styles",
  "svelteStrictMode": false,
  "plugins": ["prettier-plugin-svelte"]
}
```

---

**💡 중요**: Svelte 5 룬모드는 새로운 패러다임입니다. 기존 Svelte 4 방식과 절대 혼용하지 마세요! 🚨
