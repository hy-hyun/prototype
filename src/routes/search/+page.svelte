<script lang="ts">
  import type { Lecture } from "$lib/types";
  import { courses, addToCart, applyFcfs, applyBid, loadCourses, filterOptions, coursesLoading, coursesError, refreshCourseData, favoriteCourses, addToFavorites, removeFromFavorites, isFavorite } from "$lib/stores";
  import { showToast } from "$lib/toast";
  import Loading from "$lib/components/Loading.svelte";
  import Skeleton from "$lib/components/Skeleton.svelte";
  import { Input } from "$lib/components/ui/input";
  import { STATIC_FILTER_OPTIONS } from "$lib/mock/data";
  // Svelte 5 룬모드 상태 변수들
  let keyword = $state("");
  let filters = $state({ 
    grade: "", 
    dept: "",
    college: "", // 단과대학 필드 추가
    category: "",
    liberalArtsArea: "",
    instructor: "",
    courseLevel: "",
    creditHours: ""
  });
  let results = $state<Lecture[]>([]);
  let selectedLecture = $state<Lecture | null>(null);
  let showDetail = $state(false);
  
  // 페이지네이션 상태
  let currentPage = $state(1);
  const itemsPerPage = 10;
  
  // 페이지네이션된 결과를 계산하는 파생 상태
  let paginatedResults = $derived.by(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return results.slice(startIndex, endIndex);
  });
  
  // 총 페이지 수 계산
  let totalPages = $derived(Math.ceil(results.length / itemsPerPage));

  function search() {
    const searchTerm = keyword.trim().toLowerCase();
    const allCourses = $courses;
    
    if (allCourses.length === 0) {
      results = [];
      return;
    }
    
    // 필터링 실행: 키워드 검색 + 필터 조건
    results = allCourses.filter((course) => {
      // 1. 키워드 검색 (검색어가 있을 때만)
      let keywordMatch = true;
      if (searchTerm) {
        // 과목명에서 검색
        const titleMatch = course.title.toLowerCase().includes(searchTerm);
        
        // 키워드에서 검색 (# 태그 검색)
        let tagMatch = false;
        if (searchTerm.startsWith('#')) {
          const tag = searchTerm.slice(1); // # 제거
          tagMatch = !!(course.keywords && course.keywords.some(k => k.toLowerCase().includes(tag)));
        } else {
          // 일반 검색에서도 키워드 배열 확인
          tagMatch = !!(course.keywords && course.keywords.some(k => k.toLowerCase().includes(searchTerm)));
        }
        
        keywordMatch = titleMatch || tagMatch;
      }
      
      // 2. 필터 조건들 검사
      const gradeMatch = !filters.grade || course.courseLevel?.startsWith(filters.grade + "00");
      const deptMatch = !filters.dept || course.dept === filters.dept;
      const collegeMatch = !filters.college; // 단과대학 필터는 현재 비활성화 상태이므로 항상 true
      const categoryMatch = !filters.category || course.category === filters.category;
      // 교양영역 필터는 이수구분이 '교양' 또는 '핵심교양'인 경우에만 적용
      const liberalArtsAreaMatch = !filters.liberalArtsArea || 
        ((course.category === '교양' || course.category === '핵심교양') && course.area === filters.liberalArtsArea);
      const instructorMatch = !filters.instructor || course.instructor.toLowerCase().includes(filters.instructor.toLowerCase());
      const courseLevelMatch = !filters.courseLevel || course.courseLevel === filters.courseLevel;
      const creditHoursMatch = !filters.creditHours || course.credits.lecture.toString() === filters.creditHours;
      
      return keywordMatch && gradeMatch && deptMatch && collegeMatch && 
             categoryMatch && liberalArtsAreaMatch && instructorMatch && 
             courseLevelMatch && creditHoursMatch;
    });
    
    // 검색 후 첫 페이지로 이동
    currentPage = 1;
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
      grade: "", 
      dept: "",
      college: "",
      category: "",
      liberalArtsArea: "",
      instructor: "",
      courseLevel: "",
      creditHours: ""
    };
    search(); // 검색 함수 호출로 전체 목록 표시
  }
  
  // 페이지 변경 함수
  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
    }
  }

  function onAddToCart(l: Lecture) {
    // 찜한 과목으로만 저장 (시간표에 바로 표시되지 않음)
    addToFavorites(l.courseId, l.classId);
    showToast("찜한 과목에 추가되었습니다", "success");
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

  // 베팅 과목인지 확인하는 함수
  function isBettingCourse(lecture: Lecture): boolean {
    return (lecture.method ?? "FCFS") === "BID";
  }

  // 수업시간만 포맷팅하는 함수
  function formatTime(schedule: any[]) {
    const days = ["", "월", "화", "수", "목", "금", "토", "일"];
    
    if (!schedule || schedule.length === 0) {
      return "시간 정보 없음";
    }
    
    return schedule
      .map((s) => {
        // 시간 슬롯을 실제 시간으로 변환 (9시 기준, 30분 단위)
        const startHour = Math.floor(s.start / 2) + 9;
        const startMinute = (s.start % 2) * 30;
        const endHour = Math.floor(s.end / 2) + 9;
        const endMinute = (s.end % 2) * 30;
        
        const startTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
        const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
        
        const dayName = days[s.day] || "월";
        return `${dayName} ${startTime}~${endTime}`;
      })
      .join(", ");
  }

  // 강의실 정보만 포맷팅하는 함수
  function formatLocation(schedule: any[]) {
    if (!schedule || schedule.length === 0) {
      return "장소 정보 없음";
    }
    
    return schedule
      .map((s) => {
        // 장소 정보 포맷팅
        const building = s.building || '';
        const room = s.room || '';
        
        if (building && room) {
          // 둘 다 "미정"인 경우 하나만 표시
          if (building === '미정' && room === '미정') {
            return '미정';
          } else {
            return `${building} ${room}`;
          }
        } else if (building) {
          return building;
        } else if (room) {
          return room;
        } else {
          return '미정';
        }
      })
      .join(", ");
  }

  // 기존 formatSchedule 함수 (호환성을 위해 유지)
  function formatSchedule(schedule: any[]) {
    const timeInfo = formatTime(schedule);
    const locationInfo = formatLocation(schedule);
    
    if (timeInfo === "시간 정보 없음") {
      return "시간 정보 없음";
    }
    
    return `${timeInfo} ${locationInfo}`;
  }

  // 컴포넌트 마운트 시 더 이상 여기서 데이터를 로드하지 않습니다.
  // 데이터 로딩은 src/routes/+layout.ts에서 전역으로 처리됩니다.
  
  // 강의 데이터가 로드되면 초기 검색 실행
  $effect(() => {
    if ($courses.length > 0 && results.length === 0 && !keyword) {
      console.log('🔍 초기 데이터 로드 완료 - 전체 목록 표시');
      results = $courses; // 직접 할당으로 무한 루프 방지
      currentPage = 1; // 첫 페이지로 설정
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
    
    <!-- 첫 번째 필터 행: 이수구분, 학년, 단과대학, 학과 -->
    <div class="grid gap-3 md:grid-cols-4">
      <div>
        <p class="text-xs text-gray-500 mb-2">이수구분</p>
        <select 
          class="border rounded p-2 bg-white w-full" 
          bind:value={filters.category} 
          onchange={() => {
            // 이수구분이 '교양' 또는 '핵심교양'이 아닌 경우 교양영역 필터 초기화
            if (filters.category !== '교양' && filters.category !== '핵심교양') {
              filters.liberalArtsArea = '';
            }
            performRealTimeSearch();
          }}
        >
          <option value="">전체 구분</option>
          {#each $filterOptions.categories as category}
            <option value={category.value}>{category.label}</option>
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
        <p class="text-xs text-gray-500 mb-2">단과대학</p>
        <select 
          class="border rounded p-2 w-full cursor-not-allowed opacity-50" 
          bind:value={filters.college} 
          disabled
          title="단과대학 필터는 준비 중입니다"
        >
          <option value="">준비 중</option>
          {#each STATIC_FILTER_OPTIONS.colleges as college}
            <option value={college.value}>{college.label}</option>
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
        <select 
          class="border rounded p-2 bg-white w-full" 
          class:opacity-50={filters.category !== '교양' && filters.category !== '핵심교양'}
          class:cursor-not-allowed={filters.category !== '교양' && filters.category !== '핵심교양'}
          bind:value={filters.liberalArtsArea} 
          onchange={() => performRealTimeSearch()}
          disabled={filters.category !== '교양' && filters.category !== '핵심교양'}
        >
          <option value="">
            {(filters.category === '교양' || filters.category === '핵심교양') ? '전체 교양영역' : '교양/핵심교양만 해당'}
          </option>
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
        <p class="text-xs text-gray-500 mb-2">단위</p>
        <select class="border rounded p-2 bg-white w-full" bind:value={filters.courseLevel} onchange={() => performRealTimeSearch()}>
          <option value="">전체 단위</option>
          {#each $filterOptions.courseLevels as level}
            <option value={level.value}>{level.label.replace('단계', '단위')}</option>
          {/each}
        </select>
      </div>
    </div>
  </form>
  
  <!-- 필터 초기화 버튼 -->
  <div class="flex justify-between items-center">
    <div class="text-sm text-gray-600">
      <p>검색 결과: <span class="font-semibold text-blue-600">{results.length}</span>개</p>
      {#if results.length > itemsPerPage}
        <p class="text-xs text-gray-500 mt-1">
          {currentPage}페이지 / 총 {totalPages}페이지 
          ({(currentPage - 1) * itemsPerPage + 1}~{Math.min(currentPage * itemsPerPage, results.length)}번째 강의)
        </p>
      {/if}
    </div>
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
    {#each paginatedResults as l}
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
                  {#if l.category === '교양' && l.area}
                    <span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                      {l.area}
                    </span>
                  {/if}
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
            <div class="space-y-2 text-sm text-gray-600">
              <!-- 1행: 정원, 과목코드 (항상 표시) -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="flex items-center gap-2">
                  <span class="font-medium">정원:</span>
                  <span>{l.capacity}명</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-medium">과목코드:</span>
                  <span class="text-xs font-mono">{l.courseId}</span>
                </div>
              </div>
              
              <!-- 2행: 수업시간, 강의실 (항상 표시) -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="flex items-center gap-2">
                  <span class="font-medium">수업시간:</span>
                  <span class="text-xs">{formatTime(l.schedule)}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-medium">강의실:</span>
                  <span class="text-xs">{formatLocation(l.schedule)}</span>
                </div>
              </div>
              
              <!-- 3행: 단위(조건부), 교양영역(조건부) -->
              {#if ((l.category === '핵심교양' || l.category === '교양') && l.area) || l.courseLevel}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <!-- 단위 표시 (courseLevel이 있는 경우만) -->
                  {#if l.courseLevel}
                    <div class="flex items-center gap-2">
                      <span class="font-medium">단위:</span>
                      <span class="text-xs">{Math.floor(parseInt(l.courseLevel) / 100) * 100}단위</span>
                    </div>
                  {:else}
                    <div></div> <!-- 빈 공간 유지 -->
                  {/if}
                  
                  <!-- 교양영역 표시 (핵심교양, 교양인 경우만) -->
                  {#if (l.category === '핵심교양' || l.category === '교양') && l.area}
                    <div class="flex items-center gap-2">
                      <span class="font-medium">교양영역:</span>
                      <span class="text-xs">{l.area}</span>
                    </div>
                  {/if}
                </div>
              {/if}
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
              class="border border-blue-500 text-blue-500 hover:bg-blue-50 rounded px-3 py-1 text-sm transition-colors {
                isFavorite(l.courseId, l.classId) ? 'bg-pink-100 border-pink-400 text-pink-500' : ''
              }"
              onclick={() => onAddToCart(l)}
            >
              {isFavorite(l.courseId, l.classId) ? '❤️ 찜됨' : '장바구니'}
            </button>
            <button 
              class="rounded px-3 py-1 text-sm transition-colors {isBettingCourse(l) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}"
              onclick={() => !isBettingCourse(l) && onApply(l)}
              disabled={isBettingCourse(l)}
              title={isBettingCourse(l) ? '베팅 과목은 수강신청 페이지에서 신청하세요' : ''}
            >
              강의신청
            </button>
          </div>
        </div>
      </div>
    {/each}
  {/if}
</section>

<!-- 페이지네이션 -->
{#if results.length > itemsPerPage}
  <div class="mt-8 flex justify-center">
    <nav class="flex items-center gap-2">
      <!-- 이전 버튼 -->
      <button 
        class="px-3 py-2 rounded border {currentPage <= 1 ? 'border-gray-300 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}"
        onclick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        이전
      </button>
      
      <!-- 첫 페이지 -->
      {#if totalPages > 1}
        <button 
          class="px-3 py-2 rounded {currentPage === 1 ? 'bg-blue-500 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}"
          onclick={() => goToPage(1)}
        >
          1
        </button>
      {/if}
      
      <!-- 시작 생략 표시 -->
      {#if currentPage > 3}
        <span class="px-2 text-gray-500">...</span>
      {/if}
      
      <!-- 현재 페이지 주변 페이지들 -->
      {#each Array.from({length: totalPages}, (_, i) => i + 1) as page}
        {#if page > 1 && page < totalPages && Math.abs(page - currentPage) <= 1}
          <button 
            class="px-3 py-2 rounded {currentPage === page ? 'bg-blue-500 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}"
            onclick={() => goToPage(page)}
          >
            {page}
          </button>
        {/if}
      {/each}
      
      <!-- 끝 생략 표시 -->
      {#if currentPage < totalPages - 2}
        <span class="px-2 text-gray-500">...</span>
      {/if}
      
      <!-- 마지막 페이지 -->
      {#if totalPages > 1}
        <button 
          class="px-3 py-2 rounded {currentPage === totalPages ? 'bg-blue-500 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}"
          onclick={() => goToPage(totalPages)}
        >
          {totalPages}
        </button>
      {/if}
      
      <!-- 다음 버튼 -->
      <button 
        class="px-3 py-2 rounded border {currentPage >= totalPages ? 'border-gray-300 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}"
        onclick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        다음
      </button>
    </nav>
  </div>
{/if}

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
        <div class="space-y-6">
          <!-- 기본 정보 섹션 -->
          <div>
            <h3 class="font-medium text-gray-700 mb-3 border-b border-gray-200 pb-2">기본 정보</h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-medium text-gray-700">학수번호:</span>
                <span class="ml-2 font-mono text-gray-900">{selectedLecture.courseId}-{selectedLecture.classId}</span>
              </div>
              <div>
                <span class="font-medium text-gray-700">과목코드:</span>
                <span class="ml-2 font-mono text-gray-900">{selectedLecture.courseId}</span>
              </div>
              <div>
                <span class="font-medium text-gray-700">이수구분:</span>
                <span class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">{selectedLecture.category}</span>
              </div>
              <!-- 교양영역 표시 (핵심교양, 교양인 경우) -->
              {#if (selectedLecture.category === '핵심교양' || selectedLecture.category === '교양') && selectedLecture.area}
                <div>
                  <span class="font-medium text-gray-700">교양영역:</span>
                  <span class="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">{selectedLecture.area}</span>
                </div>
              {/if}
              <!-- 모든 강의에 대해 단위 표시 (courseLevel이 있는 경우) -->
              {#if selectedLecture.courseLevel}
                <div>
                  <span class="font-medium text-gray-700">단위:</span>
                  <span class="ml-2">{Math.floor(parseInt(selectedLecture.courseLevel) / 100) * 100}단위</span>
                </div>
              {/if}
              <div>
                <span class="font-medium text-gray-700">학점:</span>
                <span class="ml-2 px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">{selectedLecture.credits.lecture}학점</span>
              </div>
              <div>
                <span class="font-medium text-gray-700">수강정원:</span>
                <span class="ml-2">{selectedLecture.capacity}명</span>
              </div>
            </div>
          </div>
          
          <!-- 강의시간 섹션 -->
          <div>
            <h3 class="font-medium text-gray-700 mb-3 border-b border-gray-200 pb-2">수업시간 및 강의실</h3>
            <div class="space-y-3">
              <div class="bg-gray-50 p-3 rounded">
                <div class="flex items-center gap-2 mb-2">
                  <span class="font-medium text-gray-700">수업시간:</span>
                </div>
                <p class="text-sm text-gray-600">{formatTime(selectedLecture.schedule)}</p>
              </div>
              <div class="bg-gray-50 p-3 rounded">
                <div class="flex items-center gap-2 mb-2">
                  <span class="font-medium text-gray-700">강의실:</span>
                </div>
                <p class="text-sm text-gray-600">{formatLocation(selectedLecture.schedule)}</p>
              </div>
            </div>
          </div>
          
          <!-- 키워드 섹션 -->
          {#if selectedLecture.keywords && selectedLecture.keywords.length > 0}
            <div>
              <h3 class="font-medium text-gray-700 mb-3 border-b border-gray-200 pb-2">키워드</h3>
              <div class="flex gap-2 flex-wrap">
                {#each selectedLecture.keywords as keyword}
                  <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    #{keyword}
                  </span>
                {/each}
              </div>
            </div>
          {/if}
          
          <!-- 강의계획서 섹션 -->
          <div>
            <h3 class="font-medium text-gray-700 mb-3 border-b border-gray-200 pb-2">강의계획서</h3>
            <div class="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 space-y-3">
              <div>
                <span class="font-semibold text-gray-700">강의목표:</span>
                <span class="ml-2">본 강의는 {selectedLecture.title}의 기초 개념을 학습하고 실무 능력을 기르는 것을 목표로 합니다.</span>
              </div>
              <div>
                <span class="font-semibold text-gray-700">평가방법:</span>
                <span class="ml-2">중간고사 30%, 기말고사 30%, 과제 20%, 출석 20%</span>
              </div>
              <div>
                <span class="font-semibold text-gray-700">교재:</span>
                <span class="ml-2">강의 중 별도 공지</span>
              </div>
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
            class="flex-1 rounded py-2 transition-colors {selectedLecture && isBettingCourse(selectedLecture) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}"
            onclick={() => selectedLecture && !isBettingCourse(selectedLecture) && onApply(selectedLecture)}
            disabled={selectedLecture && isBettingCourse(selectedLecture)}
            title={selectedLecture && isBettingCourse(selectedLecture) ? '베팅 과목은 수강신청 페이지에서 신청하세요' : ''}
          >
            강의신청
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}



