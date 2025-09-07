<script lang="ts">
  import type { Lecture } from "$lib/types";
  import { cart, applications, courses, addLectureToCart, hasTimeConflict, showReplaceToast, confirmReplaceInTimetable, removeFromCart, loadCourses, syncUserCart, isLoggedIn, currentUser, timetableCourses, addToTimetable, removeFromTimetable } from "$lib/stores";
  import { showToast } from "$lib/toast";
  import { getUserDocument } from "$lib/firestore";
  import { browser } from "$app/environment";
  import TimetableHeader from "$lib/components/TimetableHeader.svelte";
  import TimetableSidebar from "$lib/components/TimetableSidebar.svelte";
  import TimetableGrid from "$lib/components/TimetableGrid.svelte";
  import TimetableFooter from "$lib/components/TimetableFooter.svelte";
  import ToastContainer from "$lib/components/ToastContainer.svelte";
  import DistanceWarning from "$lib/components/DistanceWarning.svelte";
  import { analyzeTimetableDistanceWarnings, analyzeNewLectureDistanceWarnings, type DistanceWarningResult } from "$lib/utils/distanceWarning";
  import { DISTANCE_MATRIX } from '$lib/data/distanceMatrix';


  // --- 상수 정의 ---
  const minCredits = 10; // 최소 신청 학점
  const maxCredits = 20; // 최대 신청 학점
  
  // --- 상태 관리 ---
  let activeTab = $state("전체");
  let selectedSemester = $state("2024-2학기");
  let displayedDays = $state(["월", "화", "수", "목", "금"]); // 요일 목록을 state로 변경
  let showCartOnly = $state(true); // 장바구니에 넣은 과목만 보기 토글

  // 데이터 로딩
  $effect(() => {
    if ($courses.length === 0) {
      loadCourses();
    }
  });

  // 🔥 로그인 상태에 따른 Firestore 데이터 로딩
  $effect(() => {
    if ($isLoggedIn && $currentUser) {
      console.log('🔥 시간표: 로그인 사용자 데이터 로딩', $currentUser.id);
      
      // async 함수를 IIFE로 처리
      (async () => {
        try {
          const userData = await getUserDocument($currentUser.id);
          if (userData && userData.enrollment) {
            // 장바구니, 신청내역, 시간표 동기화
            cart.set(userData.enrollment.cart || []);
            applications.set(userData.enrollment.applications || []);
            timetableCourses.set(userData.enrollment.timetableCourses || []);
            console.log('✅ 시간표: Firestore 데이터 로딩 완료', {
              cart: userData.enrollment.cart?.length || 0,
              applications: userData.enrollment.applications?.length || 0,
              timetable: userData.enrollment.timetableCourses?.length || 0
            });
          }
        } catch (error) {
          console.error('❌ 시간표: Firestore 데이터 로딩 실패:', error);
        }
      })();
    } else {
      console.log('🔒 시간표: 로그인 필요');
    }
  });

  // 🔥 Firestore 장바구니 데이터 동기화 확인
  $effect(() => {
    if ($cart.length === 0) {
      console.log('🛒 시간표: 장바구니가 비어있습니다. Firestore 연동을 확인하세요.');
    } else {
      console.log('🛒 시간표: 장바구니 데이터 로드됨:', $cart.length, '개 과목');
    }
  });

  // 이동거리 경고 분석 (사용자 제공 정보만 사용)
  const distanceWarnings = $derived(() => {
    try {
      const timetableLectures = baseTimetableBlocks.map(block => {
        const lecture = $courses.find(l => l.courseId === block.courseId && l.classId === block.classId);
        return lecture;
      }).filter(Boolean) as Lecture[];
      
      // 연속된 강의들만 간단히 확인
      return analyzeTimetableDistanceWarnings(timetableLectures);
    } catch (error) {
      console.warn('이동거리 경고 분석 중 오류:', error);
      return [];
    }
  });

  // 충돌 경고 감지 및 토스트 메시지 표시
  $effect(() => {
    if (conflictAnalysis.conflictPairs.length > 0) {
      showToast(`시간 충돌이 감지되었습니다! (${conflictAnalysis.conflictPairs.length}개)`, "error");
    }
    if (conflictAnalysis.consecutiveWarnings.length > 0) {
      const impossibleCount = conflictAnalysis.consecutiveWarnings.filter(w => w.isImpossible).length;
      if (impossibleCount > 0) {
        showToast(`연속 강의 이동 불가능! (${impossibleCount}개)`, "error");
      }
    }
  });

  // 교체 Toast 처리 핸들러
  function handleReplaceToast(event: CustomEvent<{ toastId: string; existingLecture: Lecture; newLecture: Lecture }>) {
    const { toastId, existingLecture, newLecture } = event.detail;
    console.log('🔄 교체 이벤트 수신:', { toastId, existingLecture: existingLecture.title, newLecture: newLecture.title });
    console.log('🔄 교체 전 timetableCourses:', $timetableCourses);
    
    const newTimetableCourses = confirmReplaceInTimetable(toastId, existingLecture, newLecture, $timetableCourses);
    timetableCourses.set(newTimetableCourses);
    
    console.log('🔄 교체 후 timetableCourses:', $timetableCourses);
  }

  // 장바구니만 보기 토글 핸들러
  function handleToggleCartOnly() {
    showCartOnly = !showCartOnly;
  }

  // --- 타입 정의 ---
  type TimetableBlock = {
    id: string;
    title: string;
    instructor: string;
    room: string;
    building: string;
    day: number;
    startTime: number;
    endTime: number;
    color: string;
    isConflict?: boolean;
    isConsecutiveWarning?: boolean;
    courseId: string;
    classId: string;
  };


  // --- 파생 상태 (Derived State) ---

  // 1. 기본 시간표 블록 생성 (주말 포함)
  const baseTimetableBlocks = $derived.by(() => {
    if ($courses.length === 0) return [];
    
    // 시간표에는 신청된 과목과 장바구니에서 추가 버튼을 눌러서 시간표에 추가된 과목만 표시
    const allItems = [
      ...$applications.map(app => ({ courseId: app.courseId, classId: app.classId, method: "FCFS" as const })),
      ...$timetableCourses.map(courseKey => {
        const [courseId, classId] = courseKey.split('-');
        return { courseId, classId, method: "FCFS" as const };
      })
    ];
    
    const colors = ["bg-blue-100 border-blue-300", "bg-green-100 border-green-300", "bg-purple-100 border-purple-300", "bg-orange-100 border-orange-300", "bg-pink-100 border-pink-300", "bg-indigo-100 border-indigo-300", "bg-gray-100 border-gray-300"];
    
    return allItems.flatMap((item, index) => {
      const lecture = $courses.find(l => l.courseId === item.courseId && l.classId === item.classId);
      if (!lecture || !Array.isArray(lecture.schedule)) return [];

      return lecture.schedule.map(schedule => {
        // parseTimeToSlot 함수가 이미 올바르게 계산하므로 그대로 사용
        const startTime = schedule.start;
        const endTime = schedule.end;
        
        // 디버깅을 위한 로그
        if (lecture.title.includes('뮤지컬') || lecture.title.includes('인재경영')) {
          console.log(`🔍 강의 시간 계산 최종: ${lecture.title}`, {
            원본스케줄: schedule,
            계산된슬롯: `${startTime}-${endTime}`,
            그리드위치: `row: ${startTime + 2} / ${endTime + 2}`,
            실제시간: `${startTime + 9}:00-${endTime + 9}:00`
          });
        }
        
        return {
          id: `${item.courseId}-${item.classId}-${schedule.day}`,
          title: lecture.title, instructor: lecture.instructor, room: schedule.room || '', building: schedule.building || '',
          day: schedule.day - 1, // 1~7(월~일) -> 0~6(월~일)
          startTime: startTime, // parseTimeToSlot에서 이미 올바르게 계산됨
          endTime: endTime, // parseTimeToSlot에서 이미 올바르게 계산됨
          color: colors[index % colors.length], courseId: item.courseId, classId: item.classId
        };
      });
    });
  });
  
  // 2. 표시할 요일 목록 결정: $derived 대신 $effect 사용으로 변경
  $effect(() => {
    const allDayNames = ["월", "화", "수", "목", "금", "토", "일"];
    
    // 코스 데이터가 로드되지 않았으면 기본값 유지
    if ($courses.length === 0) {
      displayedDays = allDayNames.slice(0, 5);
      return;
    }
    
    // 원본 데이터($cart, $applications)에서 직접 주말 강의 여부 계산
    const allItems = [
      ...$cart,
      ...$applications.map(app => ({ courseId: app.courseId, classId: app.classId }))
    ];

    const hasWeekendClasses = allItems.some(item => {
      const lecture = $courses.find(l => l.courseId === item.courseId && l.classId === item.classId);
      if (!lecture || !Array.isArray(lecture.schedule)) return false;
      return lecture.schedule.some(schedule => schedule.day >= 6); 
    });
    
    displayedDays = hasWeekendClasses ? allDayNames : allDayNames.slice(0, 5);
  });

  // 3. 시간표 그리드에 필요한 데이터 가공 (충돌, 연강 감지)
  const processedTimetable = $derived.by(() => {
    // displayedDays.length 필터링 제거: 모든 블록을 일단 처리
    const blocks = baseTimetableBlocks.map(b => ({ ...b, isConflict: false, isConsecutiveWarning: false }));
    const conflicts: Array<[TimetableBlock, TimetableBlock]> = [];
    const consecutives: Array<{ from: TimetableBlock; to: TimetableBlock; travelTime: number; isImpossible: boolean; }> = [];

    for (let i = 0; i < blocks.length; i++) {
      for (let j = i + 1; j < blocks.length; j++) {
        const blockA = blocks[i];
        const blockB = blocks[j];
        
        if (blockA.day === blockB.day) {
          if (!(blockA.endTime <= blockB.startTime || blockA.startTime >= blockB.endTime)) {
            conflicts.push([blockA, blockB]);
            blockA.isConflict = true;
            blockB.isConflict = true;
          }
          if (blockA.endTime === blockB.startTime || blockB.endTime === blockA.startTime) {
            const [from, to] = blockA.endTime === blockB.startTime ? [blockA, blockB] : [blockB, blockA];
            
            // DISTANCE_MATRIX 사용하도록 수정. building 대신 building group을 사용해야 합니다.
            // 이 예제에서는 building 속성에 building group이 있다고 가정합니다.
            const travelWarning = DISTANCE_MATRIX[from.building]?.[to.building];
            const isImpossible = travelWarning === '경고';
            
            if (travelWarning && travelWarning !== '0' && travelWarning !== '비대면') {
                consecutives.push({ from, to, travelTime: isImpossible ? 15 : 5, isImpossible });
                from.isConsecutiveWarning = true;
                to.isConsecutiveWarning = true;
            }
          }
        }
      }
    }
    return { blocks, conflicts, consecutives };
  });

  // 3. 시간 충돌 및 연속 강의 경고 검사
  const conflictAnalysis = $derived.by(() => {
    if (baseTimetableBlocks.length === 0) return { conflictPairs: [], consecutiveWarnings: [] };
    
    const conflicts: Array<[TimetableBlock, TimetableBlock]> = [];
    const consecutiveWarnings: Array<{ from: TimetableBlock; to: TimetableBlock; travelTime: number; isImpossible: boolean; }> = [];
    
    // 시간 충돌 검사
    for (let i = 0; i < baseTimetableBlocks.length; i++) {
      for (let j = i + 1; j < baseTimetableBlocks.length; j++) {
        const block1 = baseTimetableBlocks[i];
        const block2 = baseTimetableBlocks[j];
        
        // 같은 요일이고 시간이 겹치는지 확인
        if (block1.day === block2.day && 
            Math.max(block1.startTime, block2.startTime) < Math.min(block1.endTime, block2.endTime)) {
          conflicts.push([block1, block2]);
        }
      }
    }
    
    // 연속 강의 경고 검사
    for (let i = 0; i < baseTimetableBlocks.length; i++) {
      for (let j = 0; j < baseTimetableBlocks.length; j++) {
        if (i === j) continue;
        
        const fromBlock = baseTimetableBlocks[i];
        const toBlock = baseTimetableBlocks[j];
        
        // 같은 요일이고 연속 강의인지 확인
        if (fromBlock.day === toBlock.day && fromBlock.endTime === toBlock.startTime) {
            // DISTANCE_MATRIX 사용
            const fromBuilding = fromBlock.building || 'A';
            const toBuilding = toBlock.building || 'A';
            const travelWarning = DISTANCE_MATRIX[fromBuilding]?.[toBuilding];
            const isImpossible = travelWarning === '경고';

            if (travelWarning && travelWarning !== '0' && travelWarning !== '비대면' && travelWarning !== '-') {
              consecutiveWarnings.push({
                from: fromBlock,
                to: toBlock,
                travelTime: isImpossible ? 15 : 5, // travelTime을 임의로 설정
                isImpossible
              });
            }
        }
      }
    }
    
    return { conflictPairs: conflicts, consecutiveWarnings };
  });

  // 4. 사이드바에 필요한 데이터 가공
  const sidebarData = $derived.by(() => {
    const cartIds = new Set($cart.map(item => `${item.courseId}-${item.classId}`));
    const timetableCourseIds = new Set($timetableCourses);
    
    const allCoursesWithStatus = $courses.map(c => ({
      ...c,
      isInCart: cartIds.has(`${c.courseId}-${c.classId}`),
      isInTimetable: timetableCourseIds.has(`${c.courseId}-${c.classId}`)
    }));

    // 장바구니에 넣은 과목만 보기 필터링
    const filteredCourses = showCartOnly 
      ? allCoursesWithStatus.filter(course => course.isInCart)
      : allCoursesWithStatus;

    const dayTabs = [ "전체", "월", "화", "수", "목", "금" ].map((day, index) => {
      const dayNum = index;
      const count = day === "전체" 
        ? filteredCourses.length 
        : filteredCourses.filter(c => Array.isArray(c.schedule) && c.schedule.some(s => s.day === dayNum)).length;
      return { key: day, label: day, count };
    });

    const cartCourses = $cart.map(cartItem => {
      const course = $courses.find(c => c.courseId === cartItem.courseId && c.classId === cartItem.classId);
      return course ? { ...course, cartMethod: cartItem.method } : null;
    }).filter(Boolean) as (Lecture & { cartMethod: string })[];

    const dayMapping: Record<string, number> = { "월": 1, "화": 2, "수": 3, "목": 4, "금": 5 };
    const finalFilteredCourses = activeTab === "전체" 
      ? filteredCourses 
      : filteredCourses.filter(course => 
          Array.isArray(course.schedule) && course.schedule.some(s => s.day === dayMapping[activeTab])
        );

    return { dayTabs, cartCourses, filteredCourses: finalFilteredCourses };
  });

  // 5. 헤더에 필요한 데이터 가공
  const headerData = $derived.by(() => {
    const timetableCourseKeys = new Set([
      ...$applications.map(app => `${app.courseId}-${app.classId}`),
      ...$timetableCourses
    ]);

    let totalCredits = 0;
    for (const key of timetableCourseKeys) {
      const [courseId, classId] = key.split('-');
      const lecture = $courses.find(l => l.courseId === courseId && l.classId === classId);
      if (lecture && lecture.credits) {
        totalCredits += (lecture.credits.lecture || 0) + (lecture.credits.lab || 0);
      }
    }
    
    let creditStatus: { status: "success" | "warning" | "error", message: string } = { status: "success", message: "적정 학점" };
    if (totalCredits < minCredits) creditStatus = { status: "warning", message: `최소 ${minCredits}학점 필요` };
    if (totalCredits > maxCredits) creditStatus = { status: "error", message: `최대 ${maxCredits}학점 초과` };
    
    return { totalCredits, creditStatus };
  });

  // --- 이벤트 핸들러 ---

  function handleRemoveFromGrid(event: CustomEvent<{ courseId: string; classId: string }>) {
    const { courseId, classId } = event.detail;
    const courseKey = `${courseId}-${classId}`;
    
    // 시간표에서만 제거 (장바구니는 유지)
    removeFromTimetable(courseId, classId);
    showToast("시간표에서 제거했습니다", "success");
  }

  function handleSuggestFromGrid(event: CustomEvent<{ block: TimetableBlock }>) {
    const conflictBlock = event.detail.block;
    const alternatives = $courses.filter(lecture => 
      lecture.title === conflictBlock.title && 
      lecture.classId !== conflictBlock.classId &&
      Array.isArray(lecture.schedule)
    ).filter(alt => 
      !alt.schedule.some(schedule => 
        baseTimetableBlocks.some(block => 
          block.day === schedule.day - 1 && 
          !(schedule.end <= block.startTime || schedule.start >= block.endTime) &&
          block.id !== conflictBlock.id
        )
      )
    );
    
    if (alternatives.length > 0) {
      alert(`대체 가능한 분반: ${alternatives.map(a => a.classId).join(', ')}`);
    } else {
      alert('대체 가능한 분반이 없습니다.');
    }
  }

  function handleTabChange(event: CustomEvent<string>) {
    activeTab = event.detail;
  }


  function handleAddToTimetable(event: CustomEvent<Lecture>) {
    const course = event.detail;
    const courseKey = `${course.courseId}-${course.classId}`;
    
    // 이미 시간표에 있는지 확인
    if ($timetableCourses.includes(courseKey)) {
      showToast("이미 시간표에 있는 강의입니다", "info");
      return;
    }
    
    // 시간 충돌 검사
    const existingCourses = $timetableCourses.map(key => {
      const [courseId, classId] = key.split('-');
      return $courses.find(c => c.courseId === courseId && c.classId === classId);
    }).filter(Boolean) as Lecture[];
    
    for (const existingCourse of existingCourses) {
      if (hasTimeConflict(existingCourse, course)) {
        // 교체 Toast 표시
        showReplaceToast(existingCourse, course);
        return;
      }
    }
    
    // 이동거리 경고 분석 (사용자 제공 정보만 사용)
    try {
      const distanceWarnings = analyzeNewLectureDistanceWarnings(course, existingCourses);
      if (distanceWarnings.length > 0) {
        distanceWarnings.forEach(warning => {
          if (warning.info) {
            showToast(`${warning.info.icon} ${warning.info.message}: ${warning.fromBuilding} → ${warning.toBuilding}`, "info");
          }
        });
      }
    } catch (error) {
      console.warn('이동거리 경고 분석 중 오류:', error);
    }
    
    // 정상 추가
    addToTimetable(course.courseId, course.classId);
    showToast(`"${course.title}" 강의가 시간표에 추가되었습니다!`, "success");
  }

  function handleRemoveFromTimetable(event: CustomEvent<Lecture>) {
    const course = event.detail;
    const courseKey = `${course.courseId}-${course.classId}`;
    
    // 시간표에서 제거
    removeFromTimetable(course.courseId, course.classId);
    showToast(`"${course.title}" 강의를 시간표에서 제거했습니다.`, "success");
  }

  async function handleToggleCart(event: CustomEvent<Lecture> | Lecture) {
    // 이벤트에서 오는 경우와 직접 호출되는 경우 모두 처리
    const course = event instanceof CustomEvent ? event.detail : event;
    
    const isInCartNow = $cart.some(item => item.courseId === course.courseId && item.classId === course.classId);
    
    if (isInCartNow) {
      // 장바구니에서 제거
      removeFromCart(course.courseId, course.classId);
      showToast("🛒 장바구니에서 제거했습니다", "success");
    } else {
      // 장바구니에 추가 (시간표에는 자동으로 추가하지 않음)
      addLectureToCart(course);
    }
  }

  async function handleDownload() {
    if (!browser) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const timetableElement = document.querySelector('[data-timetable-grid]') as HTMLElement;
      if (!timetableElement) { alert("시간표를 찾을 수 없습니다."); return; }
      const canvas = await html2canvas(timetableElement, { scale: 2, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `시간표_${selectedSemester}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      link.remove(); // 메모리 누수 방지
    } catch (error) {
      console.error("PNG 다운로드 실패:", error);
      alert("PNG 다운로드에 실패했습니다.");
    }
  }

  function handleShare() {
    if (!browser) return;
    const shareData = {
      semester: selectedSemester,
      courses: [...$cart.map(c => ({ courseId: c.courseId, classId: c.classId }))]
    };
    const shareUrl = `${window.location.origin}/timetable?data=${encodeURIComponent(JSON.stringify(shareData))}`;
    if (navigator.share) {
      navigator.share({ title: `${selectedSemester} 시간표`, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => alert("공유 링크가 복사되었습니다!"));
    }
  }

  function handleReset() {
    if (confirm("시간표를 초기화하시겠습니까?")) {
      // 시간표에서만 제거 (장바구니는 유지)
      timetableCourses.set([]);
      showToast("시간표가 초기화되었습니다", "success");
    }
  }
</script>

<!-- 데스크톱 레이아웃 (lg 이상) -->
<div class="hidden lg:flex h-screen bg-gray-50">
  <TimetableSidebar
    courses={sidebarData.filteredCourses}
    cartCourses={sidebarData.cartCourses}
    dayTabs={sidebarData.dayTabs}
    activeTab={activeTab}
    showFavorites={showCartOnly}
    on:tabChange={handleTabChange}
    on:add={handleAddToTimetable}
    on:remove={handleRemoveFromTimetable}
    on:toggleFavorites={handleToggleCartOnly}
    on:toggleCart={handleToggleCart}
  />
  <div class="flex-1 flex flex-col min-w-0">
    <TimetableHeader 
      totalCredits={headerData.totalCredits}
      creditStatus={headerData.creditStatus}
      minCredits={minCredits}
      maxCredits={maxCredits}
      on:reset={handleReset}
      on:download={handleDownload}
      on:share={handleShare}
    />
    <main class="flex-1 overflow-hidden px-4 py-2">
      <TimetableGrid
        blocks={processedTimetable.blocks}
        conflictPairs={conflictAnalysis.conflictPairs}
        consecutiveWarnings={conflictAnalysis.consecutiveWarnings}
        distanceWarnings={distanceWarnings()}
        displayedDays={displayedDays}
        on:remove={(e) => handleRemoveFromGrid(e)}
        on:suggest={handleSuggestFromGrid}
      />
      <TimetableFooter
        on:download={handleDownload}
        on:share={handleShare}
      />
    </main>
  </div>
</div>

<!-- 모바일 레이아웃 (lg 미만) -->
<div class="lg:hidden flex flex-col h-screen bg-gray-50">
  <!-- 모바일 헤더 -->
  <TimetableHeader 
    totalCredits={headerData.totalCredits}
    creditStatus={headerData.creditStatus}
    minCredits={minCredits}
    maxCredits={maxCredits}
    on:reset={handleReset}
    on:download={handleDownload}
    on:share={handleShare}
  />
  
  <!-- 모바일 장바구니 요약 (2-3개 과목만) -->
  <div class="bg-white border-b border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold text-gray-800 flex items-center gap-2 text-lg">
        <span class="text-blue-500">📚</span>
        장바구니 ({sidebarData.cartCourses.length}개)
      </h3>
      <button 
        class="text-sm text-blue-600 font-medium px-3 py-1 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        onclick={() => {
          // 전체 사이드바 토글 로직 추가 가능
          alert('전체 과목 보기 기능 추가 예정');
        }}
      >
        전체보기
      </button>
    </div>
    
    <!-- 모바일 요일 선택 버튼 -->
    <div class="mb-4">
      <div class="flex items-center gap-2 mb-3">
        <span class="text-sm font-medium text-gray-700">요일 선택:</span>
      </div>
      <div class="flex gap-3 flex-wrap">
        {#each ["월", "화", "수", "목", "금", "토", "일"] as day}
          <button
            class="day-select-btn {displayedDays.includes(day) ? 'day-active' : 'day-inactive'}"
            onclick={() => {
              if (displayedDays.includes(day)) {
                displayedDays = displayedDays.filter(d => d !== day);
              } else {
                displayedDays = [...displayedDays, day];
              }
            }}
          >
            {day}
          </button>
        {/each}
      </div>
    </div>
    
    <!-- 장바구니 과목 가로 스크롤 -->
    <div class="flex gap-3 overflow-x-auto pb-2">
      {#each sidebarData.cartCourses.slice(0, 4) as course}
        <div class="mobile-cart-card">
          <div class="font-medium text-xs text-gray-800 truncate mb-1">{course.courseId}</div>
          <div class="text-xs text-gray-500 mb-2">
            <div class="truncate">{course.title}</div>
            <div class="text-orange-600">
              {typeof course.credits === 'object' && course.credits !== null 
                ? (course.credits.lecture || 0) + (course.credits.lab || 0)
                : course.credits || 0
              }학점
            </div>
          </div>
          <button 
            class="mobile-cart-toggle-btn"
            onclick={() => handleToggleCart(course)}
            aria-label="장바구니 토글"
            title="장바구니에서 제거"
          >
            🛒
          </button>
        </div>
      {/each}
      
      {#if sidebarData.cartCourses.length > 4}
        <button 
          class="mobile-more-btn"
          onclick={() => {
            // 전체 사이드바 토글 로직 추가 가능
            alert('전체 과목 보기 기능 추가 예정');
          }}
        >
          <div class="text-xs font-medium text-blue-600 mb-1">더보기</div>
          <div class="text-xs text-gray-500">+{sidebarData.cartCourses.length - 4}</div>
        </button>
      {/if}
      
      {#if sidebarData.cartCourses.length === 0}
        <div class="flex-1 text-center text-gray-500 py-4 text-sm">
          <div class="text-2xl mb-2">📝</div>
          <div>장바구니에 과목을 추가해보세요</div>
        </div>
      {/if}
    </div>
  </div>
  
  <!-- 모바일 시간표 -->
  <main class="flex-1 overflow-y-auto px-2 py-2">
    <TimetableGrid
      blocks={processedTimetable.blocks}
      conflictPairs={conflictAnalysis.conflictPairs}
      consecutiveWarnings={conflictAnalysis.consecutiveWarnings}
      distanceWarnings={distanceWarnings()}
      displayedDays={displayedDays}
      on:remove={handleRemoveFromGrid}
      on:suggest={handleSuggestFromGrid}
    />
    <TimetableFooter
      on:download={handleDownload}
      on:share={handleShare}
    />
  </main>
</div>

<!-- Toast 컨테이너 -->
<ToastContainer on:replace={handleReplaceToast} />

<style>
  /* 모바일 장바구니 카드 */
  .mobile-cart-card {
    flex: 0 0 auto;
    width: 140px;
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    border: 1px solid #bbf7d0;
    border-radius: 12px;
    padding: 12px;
    position: relative;
    box-shadow: 0 2px 8px rgba(34, 197, 94, 0.1);
    transition: all 0.2s ease;
  }

  .mobile-cart-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.15);
  }

  /* 모바일 카트 토글 버튼 */
  .mobile-cart-toggle-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    border: 1px solid #2563eb;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    cursor: pointer;
    font-size: 12px;
  }

  .mobile-cart-toggle-btn:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
    transform: scale(1.1);
  }

  /* 더보기 버튼 */
  .mobile-more-btn {
    flex: 0 0 auto;
    width: 80px;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 12px;
    padding: 12px 8px;
    text-align: center;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .mobile-more-btn:hover {
    background: rgba(59, 130, 246, 0.15);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  }

  /* 스크롤바 스타일링 */
  .overflow-x-auto {
    scrollbar-width: thin;
    scrollbar-color: rgba(59, 130, 246, 0.3) transparent;
  }

  .overflow-x-auto::-webkit-scrollbar {
    height: 4px;
  }

  .overflow-x-auto::-webkit-scrollbar-track {
    background: transparent;
  }

  .overflow-x-auto::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.3);
    border-radius: 2px;
  }

  .overflow-x-auto::-webkit-scrollbar-thumb:hover {
    background: rgba(59, 130, 246, 0.5);
  }

  /* 모바일 요일 선택 버튼 */
  .day-select-btn {
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    cursor: pointer;
    border: 1px solid;
  }

  .day-active {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
  }

  .day-active:hover {
    background: #2563eb;
    border-color: #2563eb;
    transform: translateY(-1px);
  }

  .day-inactive {
    background: white;
    color: #6b7280;
    border-color: #d1d5db;
  }

  .day-inactive:hover {
    background: #f9fafb;
    border-color: #9ca3af;
    color: #374151;
  }
</style>


