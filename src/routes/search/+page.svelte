<script lang="ts">
  import type { Lecture } from "$lib/types";
  import { courses, addToCart, applyFcfs, applyBid, loadCourses, filterOptions, coursesLoading, coursesError, refreshCourseData } from "$lib/stores";
  import { showToast } from "$lib/toast";
  import Loading from "$lib/components/Loading.svelte";
  import Skeleton from "$lib/components/Skeleton.svelte";
  import { Input } from "$lib/components/ui/input";
  import { STATIC_FILTER_OPTIONS } from "$lib/mock/data";
  // Svelte 5 룬모드 상태 변수들
  let keyword = $state("");
  let filters = $state({ 
    term: "", 
    grade: "", 
    dept: "",
    category: "",
    liberalArtsArea: "",
    instructor: "",
    courseLevel: "",
    creditHours: ""
  });
  let results = $state<Lecture[]>([]);
  let selectedLecture = $state<Lecture | null>(null);
  let showDetail = $state(false);

  function search() {
    const searchTerm = keyword.trim().toLowerCase();
    const allCourses = $courses;
    
    if (allCourses.length === 0) {
      results = [];
      return;
    }
    
    // 검색어가 없으면 전체 강의 표시
    if (!searchTerm) {
      results = allCourses;
      return;
    }
    
    // 검색 실행: 과목명 또는 키워드에서 찾기
    results = allCourses.filter((course) => {
      // 과목명에서 검색
      const titleMatch = course.title.toLowerCase().includes(searchTerm);
      
      // 키워드에서 검색 (# 태그 검색)
      let keywordMatch = false;
      if (searchTerm.startsWith('#')) {
        const tag = searchTerm.slice(1); // # 제거
        keywordMatch = !!(course.keywords && course.keywords.some(k => k.toLowerCase().includes(tag)));
      } else {
        // 일반 검색에서도 키워드 배열 확인
        keywordMatch = !!(course.keywords && course.keywords.some(k => k.toLowerCase().includes(searchTerm)));
      }
      
      return titleMatch || keywordMatch;
    });
  }

  // 실시간 검색 함수
  function performRealTimeSearch() {
    search();
  }

  // 엔터키 검색 핸들러 (컴포넌트 재디스패치 이벤트 호환)
  function handleKeyPress(event: any) {
    const e: KeyboardEvent = event?.key ? event : event?.detail;
    if (e?.key === 'Enter') {
      e.preventDefault();
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
      instructor: "",
      courseLevel: "",
      creditHours: ""
    };
    search(); // 검색 함수 호출로 전체 목록 표시
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
  $effect(() => {
    if ($courses.length > 0 && results.length === 0 && !keyword) {
      console.log('🔍 초기 데이터 로드 완료 - 전체 목록 표시');
      results = $courses; // 직접 할당으로 무한 루프 방지
    }
  });
</script>

<h2 class="text-lg font-semibold mb-4">강의 검색</h2>

<!-- 검색 필터 섹션 -->
<div class="bg-gray-50 p-4 rounded-lg mb-6">
  <form class="grid gap-3 mb-4" onsubmit={(e) => { e.preventDefault(); search(); }}>
    <!-- 첫 번째 행: 검색어 입력 (풀폭) -->
    <div class="flex gap-2">
      <input 
        class="flex-1 border rounded p-2 bg-white"
        type="search"
        placeholder="강의명 또는 #키워드" 
        enterkeyhint="search"
        bind:value={keyword}
        oninput={() => performRealTimeSearch()}
        onkeydown={(e) => handleKeyPress(e)}
      />
      <button type="submit" class="bg-blue-500 text-white rounded px-4 py-2 whitespace-nowrap hover:bg-blue-600">
        검색
      </button>
    </div>
    
    <!-- 첫 번째 필터 행: 학기, 학년, 이수구분, 학과 -->
    <div class="grid gap-3 md:grid-cols-4">
      <div>
        <p class="text-xs text-gray-500 mb-2">학기</p>
        <select class="border rounded p-2 bg-white w-full" bind:value={filters.term} onchange={() => performRealTimeSearch()}>
          <option value="">전체 학기</option>
          {#each STATIC_FILTER_OPTIONS.terms as term}
            <option value={term.value}>{term.label}</option>
          {/each}
        </select>
      </div>

      <div>
        <p class="text-xs text-gray-500 mb-2">학년</p>
        <select class="border rounded p-2 bg-white w-full" bind:value={filters.grade} onchange={() => performRealTimeSearch()}>
          <option value="">전체 학년</option>
          {#each STATIC_FILTER_OPTIONS.grades as grade}
            <option value={grade.value}>{grade.label}</option>
          {/each}
        </select>
      </div>

      <div>
        <p class="text-xs text-gray-500 mb-2">이수구분</p>
        <select class="border rounded p-2 bg-white w-full" bind:value={filters.category} onchange={() => performRealTimeSearch()}>
          <option value="">전체 구분</option>
          {#each $filterOptions.categories as category}
            <option value={category.value}>{category.label}</option>
          {/each}
        </select>
      </div>

      <div>
        <p class="text-xs text-gray-500 mb-2">학과</p>
        <select class="border rounded p-2 bg-white w-full" bind:value={filters.dept} onchange={() => performRealTimeSearch()}>
          <option value="">전체 학과</option>
          {#each $filterOptions.departments as dept}
            <option value={dept.value}>{dept.label}</option>
          {/each}
        </select>
      </div>
    </div>

    <!-- 두 번째 필터 행: 교양영역, 교수, 학점, 단계 -->
    <div class="grid gap-3 md:grid-cols-4">
      <div>
        <p class="text-xs text-gray-500 mb-2">교양영역</p>
        <select class="border rounded p-2 bg-white w-full" bind:value={filters.liberalArtsArea} onchange={() => performRealTimeSearch()}>
          <option value="">전체 교양영역</option>
          {#each $filterOptions.liberalArtsAreas as area}
            <option value={area.value}>{area.label}</option>
          {/each}
        </select>
      </div>

      <div>
        <p class="text-xs text-gray-500 mb-2">교수</p>
        <Input 
          placeholder="교수명 검색"
          bind:value={filters.instructor}
          on:input={() => performRealTimeSearch()}
        />
      </div>

      <div>
        <p class="text-xs text-gray-500 mb-2">학점</p>
        <select class="border rounded p-2 bg-white w-full" bind:value={filters.creditHours} onchange={() => performRealTimeSearch()}>
          <option value="">전체 학점</option>
          {#each STATIC_FILTER_OPTIONS.creditHours as credit}
            <option value={credit.value}>{credit.label}</option>
          {/each}
        </select>
      </div>

      <div>
        <p class="text-xs text-gray-500 mb-2">단계</p>
        <select class="border rounded p-2 bg-white w-full" bind:value={filters.courseLevel} onchange={() => performRealTimeSearch()}>
          <option value="">전체 단계</option>
          {#each $filterOptions.courseLevels as level}
            <option value={level.value}>{level.label}</option>
          {/each}
        </select>
      </div>
    </div>
  </form>
  
  <!-- 필터 초기화 버튼 -->
  <div class="flex justify-between items-center">
    <p class="text-sm text-gray-600">
      검색 결과: <span class="font-semibold text-blue-600">{results.length}</span>개
    </p>
    <div class="flex gap-2">
      <button 
        type="button"
        class="text-sm text-blue-500 hover:text-blue-700 disabled:opacity-50"
        onclick={() => refreshCourseData()}
        disabled={$coursesLoading}
      >
        {$coursesLoading ? '로딩 중...' : '데이터 새로고침'}
      </button>
      <button 
        type="button"
        class="text-sm text-gray-500 hover:text-gray-700"
        onclick={resetFilters}
      >
        필터 초기화
      </button>
    </div>
  </div>
</div>

<!-- 강의 목록 섹션 -->
<section class="grid gap-4">
  {#if $coursesLoading}
    <!-- 로딩 스켈레톤 -->
    <div class="grid gap-4">
      {#each Array(5) as _}
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <div class="flex justify-between items-start mb-3">
            <div class="flex-1">
              <Skeleton width="w-3/4" height="h-5" rounded="rounded" />
              <Skeleton width="w-1/2" height="h-4" rounded="rounded" />
            </div>
            <Skeleton width="w-16" height="h-8" rounded="rounded" />
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
            <Skeleton width="w-full" height="h-4" rounded="rounded" count={4} />
          </div>
          <div class="flex gap-2">
            <Skeleton width="w-20" height="h-8" rounded="rounded" />
            <Skeleton width="w-20" height="h-8" rounded="rounded" />
          </div>
        </div>
      {/each}
    </div>
  {:else if results.length === 0}
    {#if $coursesError}
      <div class="text-center py-12">
        <div class="text-red-400 text-5xl mb-4">⚠️</div>
        <p class="text-red-500 text-lg">강의 데이터를 불러오지 못했습니다</p>
        <p class="text-red-400 text-sm mt-2">{$coursesError}</p>
      </div>
    {:else}
      <div class="text-center py-12">
        <div class="text-gray-400 text-5xl mb-4">📚</div>
        <p class="text-gray-500 text-lg">검색 결과가 없습니다</p>
        <p class="text-gray-400 text-sm mt-2">다른 키워드로 검색해보세요</p>
      </div>
    {/if}
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
              onclick={() => showLectureDetail(l)}
            >
              상세보기
            </button>
            <button 
              class="border border-blue-500 text-blue-500 hover:bg-blue-50 rounded px-3 py-1 text-sm transition-colors"
              onclick={() => onAddToCart(l)}
            >
              장바구니
            </button>
            <button 
              class="bg-blue-500 hover:bg-blue-600 text-white rounded px-3 py-1 text-sm transition-colors"
              onclick={() => onApply(l)}
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
            onclick={() => showDetail = false}
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
            onclick={() => selectedLecture && onAddToCart(selectedLecture)}
          >
            장바구니 담기
          </button>
          <button 
            class="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded py-2 transition-colors"
            onclick={() => selectedLecture && onApply(selectedLecture)}
          >
            강의신청
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}



