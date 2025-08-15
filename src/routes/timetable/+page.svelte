<script lang="ts">
  import type { Lecture } from "$lib/types";
  import { cart, applications, courses, addLectureToCart } from "$lib/stores";
  import { browser } from "$app/environment";
  import TimetableHeader from "$lib/components/TimetableHeader.svelte";
  import TimetableSidebar from "$lib/components/TimetableSidebar.svelte";
  import TimetableGrid from "$lib/components/TimetableGrid.svelte";
  import ToastContainer from "$lib/components/ToastContainer.svelte";


  
  // --- 상태 관리 ---
  let activeTab = $state("전체");
  let selectedSemester = $state("2024-2학기");
  let displayedDays = $state(["월", "화", "수", "목", "금"]); // 요일 목록을 state로 변경

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

  // --- 상수 ---
  const semesters = ["2024-2학기", "2024-1학기", "2023-2학기"];
  const minCredits = 12;
  const maxCredits = 21;
  const buildingTravelTime: Record<string, Record<string, number>> = {
    "IT": { "IT": 0, "SCI": 5, "HUM": 10, "BIZ": 8, "ENG": 7 },
    "SCI": { "IT": 5, "SCI": 0, "HUM": 8, "BIZ": 12, "ENG": 6 },
    "HUM": { "IT": 10, "SCI": 8, "HUM": 0, "BIZ": 5, "ENG": 9 },
    "BIZ": { "IT": 8, "SCI": 12, "HUM": 5, "BIZ": 0, "ENG": 11 },
    "ENG": { "IT": 7, "SCI": 6, "HUM": 9, "BIZ": 11, "ENG": 0 }
  };

  // --- 파생 상태 (Derived State) ---

  // 1. 기본 시간표 블록 생성 (주말 포함)
  const baseTimetableBlocks = $derived.by(() => {
    if ($courses.length === 0) return [];
    
    const allItems = [
      ...$cart,
      ...$applications.map(app => ({ courseId: app.courseId, classId: app.classId, method: "FCFS" as const }))
    ];
    
    const colors = ["bg-blue-100 border-blue-300", "bg-green-100 border-green-300", "bg-purple-100 border-purple-300", "bg-orange-100 border-orange-300", "bg-pink-100 border-pink-300", "bg-indigo-100 border-indigo-300", "bg-gray-100 border-gray-300"];
    
    return allItems.flatMap((item, index) => {
      const lecture = $courses.find(l => l.courseId === item.courseId && l.classId === item.classId);
      if (!lecture || !Array.isArray(lecture.schedule)) return [];

      return lecture.schedule.map(schedule => ({
        id: `${item.courseId}-${item.classId}-${schedule.day}`,
        title: lecture.title, instructor: lecture.instructor, room: schedule.room || '', building: schedule.building || '',
        day: schedule.day - 1, // 1~7(월~일) -> 0~6(월~일)
        startTime: schedule.start, endTime: schedule.end,
        color: colors[index % colors.length], courseId: item.courseId, classId: item.classId
      }));
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
            const travelTime = buildingTravelTime[from.building]?.[to.building] ?? 10;
            const isImpossible = travelTime > 10;
            consecutives.push({ from, to, travelTime, isImpossible });
            from.isConsecutiveWarning = true;
            to.isConsecutiveWarning = true;
          }
        }
      }
    }
    return { blocks, conflicts, consecutives };
  });

  // 4. 사이드바에 필요한 데이터 가공
  const sidebarData = $derived.by(() => {
    const cartIds = new Set($cart.map(item => `${item.courseId}-${item.classId}`));
    const allCoursesWithCartStatus = $courses.map(c => ({
      ...c,
      isInCart: cartIds.has(`${c.courseId}-${c.classId}`)
    }));

    const dayTabs = [ "전체", "월", "화", "수", "목", "금" ].map((day, index) => {
      const dayNum = index;
      const count = day === "전체" 
        ? allCoursesWithCartStatus.length 
        : allCoursesWithCartStatus.filter(c => Array.isArray(c.schedule) && c.schedule.some(s => s.day === dayNum)).length;
      return { key: day, label: day, count };
    });

    const cartCourses = $cart.map(cartItem => {
      const course = $courses.find(c => c.courseId === cartItem.courseId && c.classId === cartItem.classId);
      return course ? { ...course, cartMethod: cartItem.method } : null;
    }).filter(Boolean) as (Lecture & { cartMethod: string })[];

    const dayMapping: Record<string, number> = { "월": 1, "화": 2, "수": 3, "목": 4, "금": 5 };
    const filteredCourses = activeTab === "전체" 
      ? allCoursesWithCartStatus 
      : allCoursesWithCartStatus.filter(course => 
          Array.isArray(course.schedule) && course.schedule.some(s => s.day === dayMapping[activeTab])
        );

    return { dayTabs, cartCourses, filteredCourses };
  });

  // 5. 헤더에 필요한 데이터 가공
  const headerData = $derived.by(() => {
    const allItems = [...$cart, ...$applications.map(app => ({ courseId: app.courseId, classId: app.classId }))];
    const totalCredits = allItems.reduce((sum, item) => {
      const lecture = $courses.find(l => l.courseId === item.courseId && l.classId === item.classId);
      if (lecture && lecture.credits) {
        return sum + (lecture.credits.lecture || 0) + (lecture.credits.lab || 0);
      }
      return sum;
    }, 0);
    
    let creditStatus: { status: "success" | "warning" | "error", message: string } = { status: "success", message: "적정 학점" };
    if (totalCredits < minCredits) creditStatus = { status: "warning", message: `최소 ${minCredits}학점 필요` };
    if (totalCredits > maxCredits) creditStatus = { status: "error", message: `최대 ${maxCredits}학점 초과` };
    
    return { totalCredits, creditStatus };
  });

  // 연강 간격 계산 (현재 비활성화)
  let lectureGaps = $derived.by(() => {
    return [];
  });

  // --- 이벤트 핸들러 ---

  function handleRemoveFromGrid(event: CustomEvent<{ courseId: string; classId: string }>) {
    const { courseId, classId } = event.detail;
    cart.update(items => items.filter(item => 
      !(item.courseId === courseId && item.classId === classId)
    ));
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

  function handleAddToCart(event: CustomEvent<Lecture>) {
    const course = event.detail;
    // 시간 중복 검사를 포함한 강의 추가
    addLectureToCart(course);
  }

  function handleRemoveFromCart(event: CustomEvent<Lecture>) {
    const course = event.detail;
    handleRemoveFromGrid({ detail: { courseId: course.courseId, classId: course.classId } } as any);
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
    if (confirm("장바구니의 모든 과목을 삭제하시겠습니까?")) {
      cart.set([]);
    }
  }
</script>

<div class="flex h-screen bg-gray-50">
  <TimetableSidebar
    courses={sidebarData.filteredCourses}
    cartCourses={sidebarData.cartCourses}
    dayTabs={sidebarData.dayTabs}
    activeTab={activeTab}
    on:tabChange={handleTabChange}
    on:add={handleAddToCart}
    on:remove={handleRemoveFromCart}
  />
  <div class="flex-1 flex flex-col">
    <TimetableHeader 
      selectedSemester={selectedSemester}
      semesters={semesters}
      totalCredits={headerData.totalCredits}
      creditStatus={headerData.creditStatus}
      minCredits={minCredits}
      maxCredits={maxCredits}
      on:semesterChange={(e) => selectedSemester = e.detail}
      on:reset={handleReset}
      on:download={handleDownload}
      on:share={handleShare}
    />
    <main class="flex-1 overflow-y-auto">
      <TimetableGrid 
        blocks={processedTimetable.blocks}
        conflictPairs={processedTimetable.conflicts}
        consecutiveWarnings={processedTimetable.consecutives}
        displayedDays={displayedDays}
        on:remove={handleRemoveFromGrid}
        on:suggest={handleSuggestFromGrid}
      />
    </main>
  </div>
</div>

<!-- Toast 컨테이너 -->
<ToastContainer />


