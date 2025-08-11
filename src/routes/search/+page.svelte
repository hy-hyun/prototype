<script lang="ts">
  import type { Lecture } from "$lib/types";
  import { courses, addToCart, applyFcfs, applyBid, loadCourses, filterOptions } from "$lib/stores";
  import { showToast } from "$lib/toast";
  import { STATIC_FILTER_OPTIONS } from "$lib/mock/data";
  import { testFirebaseConnection } from "$lib/firebase-test";
  import { get } from "svelte/store";
  import { onMount } from "svelte";

  let keyword = "";
  let filters = { 
    term: "", 
    grade: "", 
    dept: "", 
    category: "", 
    liberalArtsArea: "", 
    courseType: "",
    instructor: "",
    courseLevel: "",
    creditHours: ""
  };
  let results: Lecture[] = [];
  let selectedLecture: Lecture | null = null;
  let showDetail = false;

  function search() {
    console.log('🔍 검색 실행:', { keyword, filters });
    
    const kw = keyword.trim().toLowerCase();
    const hasTag = kw.startsWith("#") ? kw.slice(1) : "";
    const data = get(courses);
    
    console.log('🔍 검색 데이터:', { keyword: kw, hasTag, dataLength: data.length });
    
    results = data.filter((l) => {
      // 텍스트 매칭
      const textMatch = !kw || l.title.toLowerCase().includes(kw) || 
                       l.instructor.toLowerCase().includes(kw);
      
      // 키워드 태그 매칭  
      const tagMatch = !hasTag || l.keywords?.some((k) => k.toLowerCase().includes(hasTag));
      
      // 필터 적용
      const termMatch = !filters.term || true; // 학기는 현재 모든 데이터가 동일하다고 가정
      const gradeMatch = !filters.grade || true; // 학년별 필터는 추후 구현
      const deptMatch = !filters.dept || l.dept === filters.dept;
      const categoryMatch = !filters.category || l.category === filters.category;
      const liberalArtsAreaMatch = !filters.liberalArtsArea || l.area === filters.liberalArtsArea;
      const instructorMatch = !filters.instructor || l.instructor === filters.instructor;
      const creditHoursMatch = !filters.creditHours || l.credits.lecture.toString() === filters.creditHours;
      
      return (textMatch || tagMatch) && termMatch && gradeMatch && deptMatch && categoryMatch && liberalArtsAreaMatch && instructorMatch && creditHoursMatch;
    });
    
    console.log('🔍 검색 결과:', results.length, '개');
  }

  // 실시간 검색 함수
  function performRealTimeSearch() {
    if (keyword.length >= 1 || Object.values(filters).some(f => f !== "")) {
      search();
    } else {
      // 검색어와 필터가 모두 비어있으면 전체 목록 표시
      results = $courses;
    }
  }

  // 엔터키 검색 핸들러
  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      search();
    }
  }

  function resetFilters() {
    keyword = "";
    filters = { 
      term: "", 
      grade: "", 
      dept: "", 
      category: "", 
      liberalArtsArea: "", 
      courseType: "",
      instructor: "",
      courseLevel: "",
      creditHours: ""
    };
    // 필터 초기화 후 전체 목록 표시
    results = $courses;
    console.log('🔍 필터 초기화, 전체 목록 표시:', results.length, '개');
  }

  function onAddToCart(l: Lecture) {
    addToCart({ courseId: l.courseId, classId: l.classId, method: l.method ?? "FCFS" });
    showToast("장바구니에 담았습니다", "success");
  }

  function onApply(l: Lecture) {
    if ((l.method ?? "FCFS") === "FCFS") applyFcfs(l.courseId, l.classId);
    else applyBid(l.courseId, l.classId, 10);
    showToast("신청을 진행했습니다", "info");
  }

  function showLectureDetail(lecture: Lecture) {
    selectedLecture = lecture;
    showDetail = true;
  }

  function formatSchedule(schedule: any[]) {
    const days = ["", "월", "화", "수", "목", "금", "토", "일"];
    return schedule
      .map((s) => {
        const location = [s.building, s.room].filter(Boolean).join(" ");
        return `${days[s.day]} ${s.start}~${s.end}시${location ? ` ${location}` : ""}`;
      })
      .join(", ");
  }

  // 컴포넌트 마운트 시 더 이상 여기서 데이터를 로드하지 않습니다.
  // 데이터 로딩은 src/routes/+layout.ts에서 전역으로 처리됩니다.
  
  // 강의 데이터가 로드되면 초기 검색 실행
  $: if ($courses.length > 0 && results.length === 0) {
    console.log('🔍 초기 데이터 로드 완료, 검색 실행');
    results = $courses; // 초기에는 전체 목록을 보여주도록 변경
    performRealTimeSearch();
  }
</script>

<h2 class="text-lg font-semibold mb-4">강의 검색</h2>

<!-- 검색 필터 섹션 -->
<div class="bg-gray-50 p-4 rounded-lg mb-6">
  <form class="grid gap-3 mb-4" on:submit|preventDefault={search}>
    <!-- 첫 번째 행: 학기, 학년, 검색어 -->
    <div class="grid gap-3 md:grid-cols-3">
      <select class="border rounded p-2 bg-white" bind:value={filters.term}>
        <option value="">전체 학기</option>
        {#each STATIC_FILTER_OPTIONS.terms as term}
          <option value={term.value}>{term.label}</option>
        {/each}
      </select>
      
      <select class="border rounded p-2 bg-white" bind:value={filters.grade}>
        <option value="">전체 학년</option>
        {#each STATIC_FILTER_OPTIONS.grades as grade}
          <option value={grade.value}>{grade.label}</option>
        {/each}
      </select>
      
      <div class="flex gap-2">
        <input 
          class="border rounded p-2 flex-1" 
          placeholder="강의명, 교수명 또는 #키워드 (실시간 검색)" 
          bind:value={keyword}
          on:input={performRealTimeSearch}
          on:keypress={handleKeyPress}
        />
        <button type="submit" class="bg-blue-500 text-white rounded px-4 py-2 whitespace-nowrap hover:bg-blue-600">
          검색
        </button>
      </div>
    </div>
    
    <!-- 두 번째 행: 동적 필터들 -->
    <div class="grid gap-3 md:grid-cols-4">
      <select class="border rounded p-2 bg-white" bind:value={filters.category} on:change={performRealTimeSearch}>
        <option value="">전체 구분</option>
        {#each $filterOptions.categories as category}
          <option value={category.value}>{category.label}</option>
        {/each}
      </select>
      
      <select class="border rounded p-2 bg-white" bind:value={filters.dept} on:change={performRealTimeSearch}>
        <option value="">전체 학과</option>
        {#each $filterOptions.departments as dept}
          <option value={dept.value}>{dept.label}</option>
        {/each}
      </select>
      
      <select class="border rounded p-2 bg-white" bind:value={filters.liberalArtsArea} on:change={performRealTimeSearch}>
        <option value="">전체 교양영역</option>
        {#each $filterOptions.liberalArtsAreas as area}
          <option value={area.value}>{area.label}</option>
        {/each}
      </select>
      
      <select class="border rounded p-2 bg-white" bind:value={filters.instructor} on:change={performRealTimeSearch}>
        <option value="">전체 교수</option>
        {#each $filterOptions.instructors as instructor}
          <option value={instructor.value}>{instructor.label}</option>
        {/each}
      </select>
    </div>
    
    <!-- 세 번째 행: 추가 필터들 -->
    <div class="grid gap-3 md:grid-cols-3">
      <select class="border rounded p-2 bg-white" bind:value={filters.creditHours} on:change={performRealTimeSearch}>
        <option value="">전체 학점</option>
        {#each STATIC_FILTER_OPTIONS.creditHours as credit}
          <option value={credit.value}>{credit.label}</option>
        {/each}
      </select>
      
      <select class="border rounded p-2 bg-white" bind:value={filters.courseLevel} on:change={performRealTimeSearch}>
        <option value="">전체 단계</option>
        {#each $filterOptions.courseLevels as level}
          <option value={level.value}>{level.label}</option>
        {/each}
      </select>
      
      <select class="border rounded p-2 bg-white" bind:value={filters.courseType} on:change={performRealTimeSearch}>
        <option value="">전체 유형</option>
        {#each $filterOptions.courseTypes as type}
          <option value={type.value}>{type.label}</option>
        {/each}
      </select>
    </div>
  </form>
  
  <!-- 필터 초기화 버튼 -->
  <div class="flex justify-between items-center">
    <p class="text-sm text-gray-600">
      검색 결과: <span class="font-semibold text-blue-600">{results.length}</span>개
    </p>
    <button 
      type="button"
      class="text-sm text-gray-500 hover:text-gray-700"
      on:click={resetFilters}
    >
      필터 초기화
    </button>
  </div>
</div>

<!-- 강의 목록 섹션 -->
<section class="grid gap-4">
  {#if results.length === 0}
    <div class="text-center py-12">
      <div class="text-gray-400 text-5xl mb-4">📚</div>
      <p class="text-gray-500 text-lg">검색 결과가 없습니다</p>
      <p class="text-gray-400 text-sm mt-2">다른 키워드로 검색해보세요</p>
    </div>
  {:else}
    {#each results as l}
      <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <!-- 강의 제목 및 기본 정보 -->
            <div class="flex items-start gap-3 mb-2">
              <div class="flex-1">
                <h3 class="font-semibold text-lg text-gray-900 mb-1">{l.title}</h3>
                <div class="flex items-center gap-2 text-sm text-gray-600 mb-2 flex-wrap">
                  <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {l.category}
                  </span>
                  <span class="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                    {l.credits.lecture}학점
                  </span>
                  <span class="text-sm">{l.dept}</span>
                  <span>•</span>
                  <span class="text-sm font-medium">{l.instructor}</span>
                </div>
              </div>
            </div>
            
            <!-- 상세 정보 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
              <div class="flex items-center gap-2">
                <span class="font-medium">학점:</span>
                <span>{l.credits.lecture}학점</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-medium">정원:</span>
                <span>{l.capacity}명</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-medium">교양영역:</span>
                <span class="text-xs">{l.area || "-"}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-medium">과목코드:</span>
                <span class="text-xs">{l.courseId}</span>
              </div>
              <div class="flex items-center gap-2 md:col-span-2">
                <span class="font-medium">시간:</span>
                <span class="text-xs">{formatSchedule(l.schedule)}</span>
              </div>
            </div>
            
            <!-- 키워드 태그 -->
            {#if l.keywords && l.keywords.length > 0}
              <div class="flex gap-1 mt-3">
                {#each l.keywords as keyword}
                  <span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                    {keyword}
                  </span>
                {/each}
              </div>
            {/if}
          </div>
          
          <!-- 액션 버튼들 -->
          <div class="flex flex-col gap-2 ml-4">
            <button 
              class="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded px-3 py-1 text-sm transition-colors"
              on:click={() => showLectureDetail(l)}
            >
              상세보기
            </button>
            <button 
              class="border border-blue-500 text-blue-500 hover:bg-blue-50 rounded px-3 py-1 text-sm transition-colors"
              on:click={() => onAddToCart(l)}
            >
              장바구니
            </button>
            <button 
              class="bg-blue-500 hover:bg-blue-600 text-white rounded px-3 py-1 text-sm transition-colors"
              on:click={() => onApply(l)}
            >
              강의신청
            </button>
          </div>
        </div>
      </div>
    {/each}
  {/if}
</section>

<!-- 강의 상세 모달 -->
{#if showDetail && selectedLecture}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <!-- 모달 헤더 -->
        <div class="flex justify-between items-start mb-4">
          <div>
            <h2 class="text-xl font-bold text-gray-900">{selectedLecture.title}</h2>
            <p class="text-gray-600">{selectedLecture.dept} • {selectedLecture.instructor}</p>
          </div>
          <button 
            class="text-gray-400 hover:text-gray-600"
            on:click={() => showDetail = false}
            aria-label="모달 닫기"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- 모달 내용 -->
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="font-medium text-gray-700">학수번호:</span>
              <span class="ml-2">{selectedLecture.courseId}-{selectedLecture.classId}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700">이수구분:</span>
              <span class="ml-2">{selectedLecture.category}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700">학점:</span>
              <span class="ml-2">{selectedLecture.credits.lecture}학점</span>
            </div>
            <div>
              <span class="font-medium text-gray-700">수강정원:</span>
              <span class="ml-2">{selectedLecture.capacity}명</span>
            </div>
            <div>
              <span class="font-medium text-gray-700">과목코드:</span>
              <span class="ml-2">{selectedLecture.courseId}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700">교양영역:</span>
              <span class="ml-2">{selectedLecture.area || "-"}</span>
            </div>
          </div>
          
          <div>
            <h3 class="font-medium text-gray-700 mb-2">강의시간</h3>
            <p class="text-sm text-gray-600">{formatSchedule(selectedLecture.schedule)}</p>
          </div>
          
          {#if selectedLecture.keywords && selectedLecture.keywords.length > 0}
            <div>
              <h3 class="font-medium text-gray-700 mb-2">키워드</h3>
              <div class="flex gap-1 flex-wrap">
                {#each selectedLecture.keywords as keyword}
                  <span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                    {keyword}
                  </span>
                {/each}
              </div>
            </div>
          {/if}
          
          <!-- 강의계획서 (더미 데이터) -->
          <div>
            <h3 class="font-medium text-gray-700 mb-2">강의계획서</h3>
            <div class="bg-gray-50 p-3 rounded text-sm text-gray-600">
              <p><strong>강의목표:</strong> 본 강의는 {selectedLecture.title}의 기초 개념을 학습하고 실무 능력을 기르는 것을 목표로 합니다.</p>
              <p class="mt-2"><strong>평가방법:</strong> 중간고사 30%, 기말고사 30%, 과제 20%, 출석 20%</p>
              <p class="mt-2"><strong>교재:</strong> 강의 중 별도 공지</p>
            </div>
          </div>
        </div>
        
        <!-- 모달 푸터 -->
        <div class="flex gap-3 mt-6 pt-4 border-t">
          <button 
            class="flex-1 border border-blue-500 text-blue-500 hover:bg-blue-50 rounded py-2 transition-colors"
            on:click={() => selectedLecture && onAddToCart(selectedLecture)}
          >
            장바구니 담기
          </button>
          <button 
            class="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded py-2 transition-colors"
            on:click={() => selectedLecture && onApply(selectedLecture)}
          >
            강의신청
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}


