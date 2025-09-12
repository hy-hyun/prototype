<script lang="ts">
  import type { Lecture } from "$lib/types";
  import { courses, addToCart, removeFromCart, applyFcfs, applyBid, loadCourses, filterOptions, coursesLoading, coursesError, refreshCourseData, cart, isLoggedIn, currentUser, userDocument } from "$lib/stores";
  import { showToast } from "$lib/toast";
  import Loading from "$lib/components/Loading.svelte";
  import Skeleton from "$lib/components/Skeleton.svelte";
  import { Input } from "$lib/components/ui/input";
  import { STATIC_FILTER_OPTIONS, collegeToDepartmentMapping } from "$lib/mock/data";
  import LoginModal from "$lib/components/LoginModal.svelte";
  import * as Accordion from "$lib/components/ui/accordion";
  // Svelte 5 룬모드 상태 변수들
  let keyword = $state("");
  let showLoginModal = $state(false);
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
  
  let resultsWithEnrollment = $derived.by(() => {
    // 중간 변수 없이 스토어에서 직접 학년 정보를 가져옵니다.
    const grade = $userDocument?.dashboard?.userInfo?.userGrade ?? null;

    return results.map(lecture => {
      const { enrolledByYear, enrollmentCapByYear, capacity: totalCapacityFromLecture } = lecture;
      let enrollmentInfo;

      // 1. 학년별 정보 표시 (로그인 & 1-4학년)
      if (grade && grade >= 1 && grade <= 4) {
        const yearKey = `year${grade}`;
        const capacity = enrollmentCapByYear?.[yearKey];
        const enrolled = enrolledByYear?.[yearKey] ?? 0;
        let competition = 'N/A';
        if (typeof capacity === 'number' && capacity > 0) {
          competition = `${(enrolled / capacity).toFixed(2)}:1`;
        }
        enrollmentInfo = {
          capacity: typeof capacity === 'number' ? `${capacity}명` : 'N/A',
          enrolled: `${enrolled}명`,
          competition,
          label: `${grade}학년`
        };
      } 
      // 2. 전체 정보 표시 (비로그인 or 5학년 이상)
      else {
        let totalCapacity: number | undefined;
        if (enrollmentCapByYear) {
          totalCapacity = Object.values(enrollmentCapByYear).reduce((a, b) => a + b, 0);
        } else {
          totalCapacity = totalCapacityFromLecture;
        }
        const totalEnrolled = enrolledByYear ? Object.values(enrolledByYear).reduce((a, b) => a + b, 0) : 0;
        let competition = 'N/A';
        if (typeof totalCapacity === 'number' && totalCapacity > 0) {
          competition = `${(totalEnrolled / totalCapacity).toFixed(2)}:1`;
        }
        enrollmentInfo = {
          capacity: typeof totalCapacity === 'number' ? `${totalCapacity}명` : 'N/A',
          enrolled: `${totalEnrolled}명`,
          competition,
          label: '전체'
        };
      }

      return { ...lecture, enrollmentInfo };
    });
  });

  // 페이지네이션 상태
  let currentPage = $state(1);
  const itemsPerPage = 10;
  
  // 페이지네이션된 결과를 계산하는 파생 상태
  let paginatedResults = $derived.by(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return resultsWithEnrollment.slice(startIndex, endIndex);
  });
  
  // 총 페이지 수 계산
  let totalPages = $derived(Math.ceil(resultsWithEnrollment.length / itemsPerPage));

  // 선택된 단과대학에 따라 학과 목록을 필터링하는 파생 상태
  let availableDepts = $derived.by(() => {
    const selectedCollege = filters.college;
    if (!selectedCollege) {
      return $filterOptions.departments; // 단과대학 미선택 시 전체 학과 표시
    }
    
    // 선택된 단과대학에 매핑된 학과 목록을 가져옵니다.
    const mappedDepts = collegeToDepartmentMapping[selectedCollege] || [];
    
    // 실제 존재하는 학과 목록($filterOptions.departments)을 기준으로 필터링
    return $filterOptions.departments.filter(d => mappedDepts.includes(d.value));
  });

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
      const collegeMatch = true; // TODO: 단과대학 필터 기능 활성화 필요
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

  async function onToggleCart(l: Lecture) {
    if (!$isLoggedIn) {
      showToast("로그인이 필요합니다", "error");
      showLoginModal = true;
      return;
    }
    if (isInCart(l.courseId, l.classId)) {
      // 장바구니에서 제거
      await removeFromCart(l.courseId, l.classId);
      showToast("장바구니에서 제거했습니다", "success");
    } else {
      // 장바구니에 추가
      console.log('🛒 장바구니에 추가:', { courseId: l.courseId, classId: l.classId, method: l.method ?? "FCFS" });
      await addToCart({ courseId: l.courseId, classId: l.classId, method: l.method ?? "FCFS" });
      console.log('🛒 현재 장바구니 상태:', $cart);
      showToast("장바구니에 담았습니다", "success");
    }
  }

  function isInCart(courseId: string, classId: string): boolean {
    return $cart.some(item => item.courseId === courseId && item.classId === classId);
  }

  function onApply(l: Lecture) {
    if ((l.method ?? "FCFS") === "FCFS") applyFcfs(l.courseId, l.classId);
    else applyBid(l.courseId, l.classId, 10);
    showToast("완료되었습니다. 신청 결과는 수강신청 페이지의 신청 내역에서 확인하세요.", "info");
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

  $effect(() => {
    if ($isLoggedIn) {
      showLoginModal = false;
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
          class="border rounded p-2 bg-white w-full" 
          bind:value={filters.college} 
          onchange={() => {
            filters.dept = ''; // 단과대학 변경 시 학과 선택 초기화
            performRealTimeSearch();
          }}
          title="단과대학 필터는 검색 결과에 영향을 주지 않습니다."
        >
          <option value="">전체 대학</option>
          {#each STATIC_FILTER_OPTIONS.colleges as college}
            <option value={college.value}>{college.label}</option>
          {/each}
        </select>
      </div>

      <div>
        <p class="text-xs text-gray-500 mb-2">학과/전공</p>
        <select class="border rounded p-2 bg-white w-full" bind:value={filters.dept} onchange={() => performRealTimeSearch()}>
          <option value="">전체 학과</option>
          {#each availableDepts as dept}
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
                <h3 class="font-semibold text-xl text-gray-900 mb-1">{l.title}</h3>
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
            <div class="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2 text-base text-gray-600 pt-2 mt-2 border-t border-gray-100">
              <!-- 1열 -->
              <div class="flex items-center gap-2">
                <span class="font-semibold">학수번호:</span>
                <span class="font-medium">{l.courseId}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-semibold">{l.enrollmentInfo.label} 정원:</span>
                <span class="font-medium text-blue-600">{l.enrollmentInfo.capacity}</span>
              </div>
              <div class="flex items-center gap-2">              
                <span class="font-semibold">수업시간:</span>
               <span class="text-medium">{formatTime(l.schedule)}</span>
             </div>
               
               <!-- 2열 -->
               <div class="flex items-center gap-2">
                <span class="font-semibold">수업번호:</span>
                <span class="font-medium">{l.classId}</span>
               </div>
              <div class="flex items-center gap-2">
                 <span class="font-semibold">{l.enrollmentInfo.label} 담은 인원:</span>
                 <span class="font-medium text-green-600">{l.enrollmentInfo.enrolled}</span>
               </div>
              <div class="flex items-center gap-2">
                <span class="font-semibold">강의실:</span>
                <span class="font-medium">{formatLocation(l.schedule)}</span>
              </div>
              

              <!-- 3열 -->
              {#if l.courseLevel}
                <div class="flex items-center gap-2">
                  <span class="font-semibold">단위:</span>
                  <span class="font-medium">{Math.floor(parseInt(l.courseLevel) / 100) * 100}단위</span>
                </div>
              {/if}
               <div class="flex items-center gap-2">
                 <span class="font-semibold">예상 경쟁률:</span>
                 <span class="font-medium text-red-600">{l.enrollmentInfo.competition}</span>
               </div>
               
               {#if (l.category === '핵심교양' || l.category === '교양') && l.area}
                 <div class="flex items-center gap-2">
                   <span class="font-semibold">교양영역:</span>
                   <span class="font-medium">{l.area}</span>
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
                isInCart(l.courseId, l.classId) ? 'bg-pink-100 border-pink-400 text-pink-500 hover:bg-pink-200' : ''
              }"
              onclick={() => onToggleCart(l)}
            >
              {isInCart(l.courseId, l.classId) ? '🛒 장바구니 해제' : '🛒 장바구니 담기'}
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
    <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
      <div class="p-8">
        <!-- 모달 헤더 -->
        <div class="flex justify-between items-start mb-8">
          <div class="flex-1">
            <!-- 키워드 표시 -->
            {#if selectedLecture.keywords && selectedLecture.keywords.length > 0}
              <div class="flex gap-2 flex-wrap mb-3">
                {#each selectedLecture.keywords as keyword}
                  <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    #{keyword}
                  </span>
                {/each}
              </div>
            {/if}
            <h2 class="text-3xl font-bold text-blue-900 mb-2">{selectedLecture.title}</h2>
            <div class="flex items-center gap-4 text-blue-700 mb-4">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd"></path>
                </svg>
                <span class="font-medium">{selectedLecture.dept}</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                </svg>
                <span class="font-medium">{selectedLecture.instructor}</span>
              </div>
            </div>
            
            {#if selectedLecture.courseGoals}
              <div class="mb-4 text-sm text-blue-700 bg-blue-50 px-4 py-3 rounded-lg border-l-4 border-blue-400">
                <div class="flex items-start gap-2">
                  <svg class="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                  </svg>
                  <div>
                    <p class="leading-relaxed">
                      {#if typeof selectedLecture.courseGoals === 'string'}
                        {selectedLecture.courseGoals}
                      {:else if selectedLecture.courseGoals && selectedLecture.courseGoals.overall}
                        {selectedLecture.courseGoals.overall}
                      {:else}
                        {JSON.stringify(selectedLecture.courseGoals, null, 2)}
                      {/if}
                    </p>
                  </div>
                </div>
              </div>
            {/if}
          </div>
          <button 
            class="text-blue-400 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-100"
            onclick={() => showDetail = false}
            aria-label="모달 닫기"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- 모달 내용 - 2열 레이아웃 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- 왼쪽 열 -->
          <div class="space-y-6">
            <!-- 기본 정보 -->
            <div class="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <h3 class="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z" clip-rule="evenodd"></path>
                </svg>
                기본 정보
              </h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-blue-700 font-medium">이수구분</span>
                  <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">{selectedLecture.category}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-blue-700 font-medium">학과</span>
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="text-blue-900 font-medium">{selectedLecture.dept}</span>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-blue-700 font-medium">학수번호</span>
                  <div class="flex items-center gap-2">
                    <span class="text-blue-900 font-medium">{selectedLecture.courseId}</span>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-blue-700 font-medium">수업번호</span>
                  <div class="flex items-center gap-2">
                    <span class="text-blue-900 font-medium">{selectedLecture.classId}</span>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-blue-700 font-medium">학점</span>
                  <div class="flex items-center gap-2">
                    <span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">{selectedLecture.credits.lecture}학점</span>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-blue-700 font-medium">수강정원</span>
                  <div class="flex items-center gap-2">
                    <span class="text-blue-900 font-medium">{selectedLecture.capacity}명</span>
                  </div>
                </div>
                {#if selectedLecture.courseLevel}
                  <div class="flex items-center justify-between">
                    <span class="text-blue-700 font-medium">단위</span>
                    <div class="flex items-center gap-2">
                      <span class="text-blue-900 font-medium">{Math.floor(parseInt(selectedLecture.courseLevel) / 100) * 100}단위</span>
                    </div>
                  </div>
                {/if}
                {#if (selectedLecture.category === '핵심교양' || selectedLecture.category === '교양') && selectedLecture.area}
                  <div class="flex items-center justify-between">
                    <span class="text-blue-700 font-medium">교양영역</span>
                    <div class="flex items-center gap-2">
                      <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">{selectedLecture.area}</span>
                    </div>
                  </div>
                {/if}
              </div>
            </div>

            <!-- 수업시간 및 강의실 -->
            <div class="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <h3 class="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                </svg>
                수업시간 및 강의실
              </h3>
              <div class="space-y-4">
                <div class="bg-blue-50 p-4 rounded-lg">
                  <div class="flex items-center gap-2 mb-2">
                    <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="font-medium text-blue-800">수업시간</span>
                  </div>
                  <p class="text-blue-700">{formatTime(selectedLecture.schedule)}</p>
                </div>
                <div class="bg-blue-50 p-4 rounded-lg">
                  <div class="flex items-center gap-2 mb-2">
                    <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="font-medium text-blue-800">강의실</span>
                  </div>
                  <p class="text-blue-700">{formatLocation(selectedLecture.schedule)}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 오른쪽 열 -->
          <div class="space-y-6">
            <!-- 강의 정보 -->
            <div class="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <h3 class="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z" clip-rule="evenodd"></path>
                </svg>
                강의 정보
              </h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-blue-700 font-medium">교수</span>
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="text-blue-900 font-medium">{selectedLecture.instructor}</span>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-blue-700 font-medium">신청방법</span>
                  <div class="flex items-center gap-2">
                    <span class="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                      {(selectedLecture.method ?? "FCFS") === "FCFS" ? "선착순" : "베팅"}
                    </span>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-blue-700 font-medium">예상 경쟁률</span>
                  <div class="flex items-center gap-2">
                    <span class="text-blue-900 font-medium">{selectedLecture.enrollmentInfo?.competition || 'N/A'}</span>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-blue-700 font-medium">{selectedLecture.enrollmentInfo.label} 정원</span>
                  <div class="flex items-center gap-2">
                    <span class="text-blue-900 font-medium">{selectedLecture.enrollmentInfo?.capacity || 'N/A'}</span>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-blue-700 font-medium">{selectedLecture.enrollmentInfo.label} 담은 인원</span>
                  <div class="flex items-center gap-2">
                    <span class="text-blue-900 font-medium">{selectedLecture.enrollmentInfo?.enrolled || 'N/A'}</span>
                  </div>
                </div>
                {#if selectedLecture.building}
                  <div class="flex items-center justify-between">
                    <span class="text-blue-700 font-medium">건물</span>
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                      </svg>
                      <span class="text-blue-900 font-medium">{selectedLecture.building}</span>
                    </div>
                  </div>
                {/if}
              </div>
            </div>


            <!-- 주차별 강의계획서 섹션 -->
            <div class="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <h3 class="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
                </svg>
                주차별 강의계획서
              </h3>
              {#if selectedLecture.weeklyPlan && selectedLecture.weeklyPlan.length > 0}
                <div class="bg-white rounded-lg border border-blue-200">
                  <div class="px-4 py-3 border-b border-blue-200">
                    <div class="flex items-center gap-3">
                      <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
                      </svg>
                      <span class="font-medium text-blue-900">주차별 강의 계획</span>
                    </div>
                  </div>
                  <div class="p-4">
                    <div class="max-h-48 overflow-y-auto space-y-2">
                      {#each selectedLecture.weeklyPlan as plan, index}
                        <div class="bg-blue-50 p-2 rounded border border-blue-200 hover:bg-blue-100 transition-colors">
                          <div class="flex items-center gap-2">
                            <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium min-w-[3rem] text-center">
                              {plan.week || index + 1}주차
                            </span>
                            <span class="text-sm text-blue-900 font-medium truncate">
                              {plan.title || plan.subject || plan.topic || `주차 ${plan.week || index + 1} 강의`}
                            </span>
                          </div>
                          {#if plan.content || plan.description || plan.overview}
                            <div class="mt-1 text-xs text-blue-700 truncate">
                              {plan.content || plan.description || plan.overview}
                            </div>
                          {/if}
                        </div>
                      {/each}
                    </div>
                  </div>
                </div>
              {:else}
                <div class="bg-blue-50 p-4 rounded-lg text-center text-blue-600">
                  <svg class="w-8 h-8 mx-auto mb-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <p class="text-sm">주차별 강의 계획이 등록되지 않았습니다.</p>
                </div>
              {/if}
            </div>
          </div>
        </div>
        
        <!-- 모달 푸터 -->
        <div class="flex gap-4 mt-8 pt-6 border-t border-blue-200">
          <button 
            class="flex-1 border-2 border-blue-500 text-blue-500 hover:bg-blue-50 rounded-xl py-3 transition-all duration-200 font-medium {
              selectedLecture && isInCart(selectedLecture.courseId, selectedLecture.classId) ? 'bg-pink-100 border-pink-400 text-pink-500 hover:bg-pink-200' : ''
            }"
            onclick={() => selectedLecture && onToggleCart(selectedLecture)}
          >
            {selectedLecture && isInCart(selectedLecture.courseId, selectedLecture.classId) ? '🛒 장바구니 해제' : '🛒 장바구니 담기'}
          </button>
          <button 
            class="flex-1 rounded-xl py-3 transition-all duration-200 font-medium {selectedLecture && isBettingCourse(selectedLecture) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'}"
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



{#if showLoginModal}
  <LoginModal bind:isOpen={showLoginModal} />
{/if}



