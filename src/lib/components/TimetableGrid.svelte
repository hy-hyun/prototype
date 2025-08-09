<script lang="ts">
  import { cart, courses, applications } from "$lib/stores";
  
  // 시간표 설정
  const days = ["월", "화", "수", "목", "금"];
  const timeSlots = Array.from({ length: 10 }, (_, i) => ({
    hour: 9 + i,
    label: `${9 + i}:00`
  }));
  
  // 건물 간 이동시간 매트릭스 (분 단위)
  const buildingTravelTime: Record<string, Record<string, number>> = {
    "IT": { "IT": 0, "SCI": 5, "HUM": 10, "BIZ": 8, "ENG": 7 },
    "SCI": { "IT": 5, "SCI": 0, "HUM": 8, "BIZ": 12, "ENG": 6 },
    "HUM": { "IT": 10, "SCI": 8, "HUM": 0, "BIZ": 5, "ENG": 9 },
    "BIZ": { "IT": 8, "SCI": 12, "HUM": 5, "BIZ": 0, "ENG": 11 },
    "ENG": { "IT": 7, "SCI": 6, "HUM": 9, "BIZ": 11, "ENG": 0 }
  };
  
  // 시간표에 배치된 강의 블록들
  type TimetableBlock = {
    id: string;
    title: string;
    instructor: string;
    room: string;
    building: string;
    day: number; // 0:월, 1:화, 2:수, 3:목, 4:금
    startTime: number; // 9~18
    endTime: number;
    color: string;
    isConflict?: boolean;
    isConsecutiveWarning?: boolean;
    courseId: string;
    classId: string;
  };
  
  let baseTimetableBlocks = $state<TimetableBlock[]>([]);
  let timetableBlocks = $state<TimetableBlock[]>([]);
  let conflictPairs = $state<Array<[TimetableBlock, TimetableBlock]>>([]);
  let consecutiveWarnings = $state<Array<{
    from: TimetableBlock;
    to: TimetableBlock;
    travelTime: number;
    isImpossible: boolean;
  }>>([]);
  
  // 연강 모달 상태
  let showConsecutiveModal = $state(false);
  let selectedConsecutive = $state<{
    from: TimetableBlock;
    to: TimetableBlock;
    travelTime: number;
    isImpossible: boolean;
  } | null>(null);
  


  // 장바구니 기반으로 시간표 블록 생성 - Svelte 5 문법
  $effect(() => {
    const cartItems = $cart;
    const appItems = $applications;
    
    console.log("TimetableGrid: effect 실행됨", {
      cartCount: cartItems.length,
      appCount: appItems.length,
      cartItems,
      appItems
    });
    
    // 신청 완료된 과목들과 장바구니 과목들
    const allItems = [
      ...appItems.map(app => ({ ...app, isEnrolled: true })),
      ...cartItems.map(cart => ({ ...cart, isEnrolled: false }))
    ];
    
    const blocks: TimetableBlock[] = [];
    const colors = ["bg-blue-100 border-blue-300", "bg-green-100 border-green-300", "bg-purple-100 border-purple-300", "bg-orange-100 border-orange-300", "bg-pink-100 border-pink-300"];
    
    allItems.forEach((item, index) => {
      const lecture = $courses.find(l => 
        l.courseId === item.courseId && l.classId === item.classId
      );
      
      if (lecture && lecture.schedule) {
        lecture.schedule.forEach(schedule => {
          blocks.push({
            id: `${item.courseId}-${item.classId}-${schedule.day}`,
            title: lecture.title,
            instructor: lecture.instructor,
            room: schedule.room || '',
            building: schedule.building || '',
            day: schedule.day - 1, // 1-6 → 0-5 (월-토), 여기서는 0-4 (월-금)만 사용
            startTime: schedule.start,
            endTime: schedule.end,
            color: colors[index % colors.length],
            courseId: item.courseId,
            classId: item.classId
          });
        });
      }
    });
    
    const filteredBlocks = blocks.filter(block => block.day >= 0 && block.day < 5); // 월-금만
    console.log("TimetableGrid: 생성된 블록 수", filteredBlocks.length, filteredBlocks);
    baseTimetableBlocks = filteredBlocks;
  });

  // 충돌과 연강 감지를 별도의 effect로 분리
  $effect(() => {
    const { conflicts, consecutives, blocksWithFlags } = detectConflictsAndConsecutive(baseTimetableBlocks);
    console.log("연강 감지 결과:", consecutives);
    conflictPairs = conflicts;
    consecutiveWarnings = consecutives;
    timetableBlocks = blocksWithFlags;
  });
  
  // 시간 충돌 감지 - 새로운 배열 반환
  function detectConflictsAndConsecutive(blocks: TimetableBlock[]) {
    const conflicts: Array<[TimetableBlock, TimetableBlock]> = [];
    const consecutives: Array<{
      from: TimetableBlock;
      to: TimetableBlock;
      travelTime: number;
      isImpossible: boolean;
    }> = [];
    
    // 블록들의 복사본을 만들어서 플래그 설정
    const blocksWithFlags = blocks.map(block => ({ ...block, isConflict: false, isConsecutiveWarning: false }));
    
    // 충돌 감지
    for (let i = 0; i < blocksWithFlags.length; i++) {
      for (let j = i + 1; j < blocksWithFlags.length; j++) {
        const blockA = blocksWithFlags[i];
        const blockB = blocksWithFlags[j];
        
        // 같은 요일이고 시간이 겹치는 경우
        if (blockA.day === blockB.day) {
          const hasOverlap = !(blockA.endTime <= blockB.startTime || blockA.startTime >= blockB.endTime);
          if (hasOverlap) {
            conflicts.push([blockA, blockB]);
            blockA.isConflict = true;
            blockB.isConflict = true;
          }
          
          // 연강 감지 (바로 이어지는 경우)
          if (blockA.endTime === blockB.startTime || blockB.endTime === blockA.startTime) {
            const [from, to] = blockA.endTime === blockB.startTime ? [blockA, blockB] : [blockB, blockA];
            const travelTime = buildingTravelTime[from.building]?.[to.building] || 10;
            const isImpossible = travelTime > 10; // 10분 초과시 이동 불가능으로 간주
            
            consecutives.push({ from, to, travelTime, isImpossible });
            // 모든 연강에 대해 경고 표시 (이동 가능/불가능 상관없이)
            from.isConsecutiveWarning = true;
            to.isConsecutiveWarning = true;
          }
        }
      }
    }
    
    return { conflicts, consecutives, blocksWithFlags };
  }

  // 특정 시간/요일에 해당하는 블록 찾기
  function getBlockAt(day: number, hour: number) {
    return timetableBlocks.find(block => 
      block.day === day && hour >= block.startTime && hour < block.endTime
    );
  }
  
  // 블록이 시작되는 시간인지 확인
  function isBlockStart(day: number, hour: number) {
    const block = getBlockAt(day, hour);
    return block && block.startTime === hour;
  }
  
  // 블록의 높이 계산 (시간 단위)
  function getBlockHeight(block: TimetableBlock) {
    return block.endTime - block.startTime;
  }
  
  // 특정 위치에 연강 표시가 있는지 확인
  function getConsecutiveAt(day: number, hour: number) {
    const result = consecutiveWarnings.find(warning => 
      warning.from.day === day && warning.from.endTime === hour &&
      warning.to.day === day && warning.to.startTime === hour
    );
    if (result) {
      console.log(`연강 발견: 요일${day}, 시간${hour}`, result);
    }
    return result;
  }
  
  // 연강 모달 열기
  function openConsecutiveModal(consecutive: typeof consecutiveWarnings[0]) {
    selectedConsecutive = consecutive;
    showConsecutiveModal = true;
  }
  
  // 연강 모달 닫기
  function closeConsecutiveModal() {
    showConsecutiveModal = false;
    selectedConsecutive = null;
  }
  
  // 블록 삭제
  function removeBlock(blockId: string) {
    const block = timetableBlocks.find(b => b.id === blockId);
    if (block) {
      // 장바구니에서 제거
      cart.update(items => items.filter(item => 
        `${item.courseId}-${item.classId}` !== `${block.courseId}-${block.classId}`
      ));
    }
  }
  
  // 대체 과목 제안
  function suggestAlternatives(conflictBlock: TimetableBlock) {
    // 동일한 강의의 다른 분반 찾기
    const lectureData = $courses;
    const alternatives = lectureData.filter(lecture => 
      lecture.title === conflictBlock.title && 
      lecture.classId !== conflictBlock.classId
    );
    
    return alternatives.filter(alt => {
      // 시간 충돌이 없는 것들만 필터링
      return !alt.schedule.some(schedule => 
        timetableBlocks.some(block => 
          block.day === schedule.day - 1 && 
          !(schedule.end <= block.startTime || schedule.start >= block.endTime) &&
          block.id !== conflictBlock.id
        )
      );
    });
  }
  

</script>



<!-- 시간표 그리드 컨테이너 -->
<div class="p-6 bg-white" data-timetable-grid>

  <div class="grid grid-cols-6 gap-0 border border-gray-300 rounded-lg overflow-hidden">
    <!-- 헤더: 시간 + 요일 -->
    <div class="bg-gray-50 border-b border-gray-300 p-3 text-center text-sm font-medium text-gray-600">
      시간
    </div>
    {#each days as day}
      <div class="bg-blue-50 border-b border-gray-300 p-3 text-center text-sm font-medium text-blue-700">
        {day}
      </div>
    {/each}
    
    <!-- 시간표 그리드 -->
    {#each timeSlots as timeSlot, hourIndex}
      <!-- 시간 라벨 -->
      <div class="bg-gray-50 border-b border-gray-300 p-3 text-center text-sm text-gray-600 flex items-center justify-center">
        {timeSlot.label}
      </div>
      
      <!-- 각 요일별 셀 -->
      {#each days as day, dayIndex}
        {@const block = getBlockAt(dayIndex, timeSlot.hour)}
        {@const isStart = isBlockStart(dayIndex, timeSlot.hour)}
        {@const consecutive = getConsecutiveAt(dayIndex, timeSlot.hour)}
        
        <div class="relative border-b border-r border-gray-300 h-16 bg-white hover:bg-gray-50 transition-colors">
          <!-- 강의 블록 표시 (시작 시간에만) -->
          {#if block && isStart}
            <div 
              class="absolute inset-x-0 {block.isConflict ? 'bg-red-100 border-red-400' : block.isConsecutiveWarning ? 'bg-yellow-100 border-yellow-400' : block.color} border-l-4 {block.isConflict ? 'border-l-red-500' : block.isConsecutiveWarning ? 'border-l-yellow-500' : 'border-l-blue-500'} p-2 text-xs overflow-hidden"
              style="height: {getBlockHeight(block) * 4}rem; z-index: 10;"
            >
              <!-- 경고 아이콘 -->
              {#if block.isConflict}
                <div class="absolute top-1 left-1 text-red-500" title="시간 충돌">⚠️</div>
              {:else if block.isConsecutiveWarning}
                <div class="absolute top-1 left-1 text-yellow-500" title="이동시간 부족">🏃</div>
              {/if}
              
              <!-- 강의 정보 -->
              <div class="font-semibold text-gray-800 leading-tight mb-1 {block.isConflict || block.isConsecutiveWarning ? 'mt-3' : ''}">
                {block.title}
              </div>
              <div class="text-gray-600 leading-tight">
                {block.instructor}
              </div>
              <div class="text-gray-500 leading-tight">
                {block.building} {block.room}
              </div>
              
              <!-- 삭제 버튼 -->
              <button 
                class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors flex items-center justify-center"
                onclick={() => removeBlock(block.id)}
                title="강의 삭제"
              >
                ×
              </button>
              
              <!-- 대체 과목 제안 버튼 (충돌 시에만) -->
              {#if block.isConflict}
                <button 
                  class="absolute bottom-1 right-1 text-xs bg-blue-500 text-white px-1 py-0.5 rounded hover:bg-blue-600"
                  onclick={() => {
                    const alternatives = suggestAlternatives(block);
                    if (alternatives.length > 0) {
                      alert(`대체 가능한 분반: ${alternatives.map(a => a.classId).join(', ')}`);
                    } else {
                      alert('대체 가능한 분반이 없습니다.');
                    }
                  }}
                  title="대체 분반 찾기"
                >
                  대체
                </button>
              {/if}
            </div>
          {:else if !block}
            <!-- 빈 셀 -->
            <div class="w-full h-full flex items-center justify-center text-gray-200">
              <!-- 점선 패턴 -->
              <div class="w-full h-full bg-gray-50"></div>
            </div>
          {/if}
          
          <!-- 연강 표시 (블록 사이 가로 공간에) -->
          {#if consecutive && !block}
            <button 
              type="button"
              class="absolute inset-0 flex items-center justify-center cursor-pointer z-20 bg-{consecutive.isImpossible ? 'red' : 'yellow'}-100 border-2 border-{consecutive.isImpossible ? 'red' : 'orange'}-400"
              onclick={() => openConsecutiveModal(consecutive)}
              title="연강 이동시간: {consecutive.travelTime}분"
            >
              <div class="bg-{consecutive.isImpossible ? 'red' : 'orange'}-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg hover:scale-110 transition-transform animate-pulse">
                <div class="flex items-center gap-1">
                  <span>🏃</span>
                  <span>{consecutive.travelTime}분</span>
                  {#if consecutive.isImpossible}
                    <span>⚠️</span>
                  {/if}
                </div>
              </div>
            </button>
          {/if}
        </div>
      {/each}
    {/each}
  </div>
  
  <!-- 범례 -->
  <div class="mt-4 flex items-center gap-4 text-xs text-gray-500">
    <div class="flex items-center gap-2">
      <div class="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
      <span>정상</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
      <span>시간 중복</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
      <span>이동시간 부족</span>
    </div>
    <div class="ml-auto text-gray-400">
      💡 장바구니에서 강의를 추가/삭제할 수 있습니다
    </div>
  </div>
</div>

<!-- 연강 상세 정보 모달 -->
{#if showConsecutiveModal && selectedConsecutive}
  <div 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
    role="dialog" 
    aria-modal="true"
    tabindex="-1"
    onclick={closeConsecutiveModal}
    onkeydown={(e) => e.key === 'Escape' && closeConsecutiveModal()}
  >
    <div 
      class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" 
      role="document"
    >
      <div class="p-6">
        <!-- 모달 헤더 -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
            🏃 연강 이동시간 안내
            {#if selectedConsecutive.isImpossible}
              <span class="text-red-500 text-sm">⚠️ 연강</span>
            {/if}
          </h3>
          <button 
            class="text-gray-400 hover:text-gray-600"
            onclick={closeConsecutiveModal}
          >
            ✕
          </button>
        </div>
        
        <!-- 연강 정보 -->
        <div class="space-y-4">
          <!-- 출발 강의 -->
          <div class="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
            <div class="font-medium text-blue-800 mb-1">출발</div>
            <div class="text-sm text-blue-700">
              <div class="font-medium">{selectedConsecutive.from.title}</div>
              <div class="text-xs mt-1">
                📍 {selectedConsecutive.from.building} {selectedConsecutive.from.room}
              </div>
              <div class="text-xs">
                🕐 {days[selectedConsecutive.from.day]} {selectedConsecutive.from.startTime}:00-{selectedConsecutive.from.endTime}:00
              </div>
            </div>
          </div>
          
          <!-- 이동시간 -->
          <div class="flex items-center justify-center">
            <div class="bg-{selectedConsecutive.isImpossible ? 'red' : 'yellow'}-100 border border-{selectedConsecutive.isImpossible ? 'red' : 'yellow'}-300 px-4 py-2 rounded-full">
              <div class="text-center text-sm">
                <div class="font-medium text-{selectedConsecutive.isImpossible ? 'red' : 'yellow'}-800">
                  이동시간: {selectedConsecutive.travelTime}분
                </div>
                <div class="text-xs text-{selectedConsecutive.isImpossible ? 'red' : 'yellow'}-600">
                  {selectedConsecutive.from.building} → {selectedConsecutive.to.building}
                </div>
              </div>
            </div>
          </div>
          
          <!-- 도착 강의 -->
          <div class="bg-green-50 border-l-4 border-green-400 p-3 rounded">
            <div class="font-medium text-green-800 mb-1">도착</div>
            <div class="text-sm text-green-700">
              <div class="font-medium">{selectedConsecutive.to.title}</div>
              <div class="text-xs mt-1">
                📍 {selectedConsecutive.to.building} {selectedConsecutive.to.room}
              </div>
              <div class="text-xs">
                🕐 {days[selectedConsecutive.to.day]} {selectedConsecutive.to.startTime}:00-{selectedConsecutive.to.endTime}:00
              </div>
            </div>
          </div>
          
          <!-- 경고 메시지 -->
          {#if selectedConsecutive.isImpossible}
            <div class="bg-red-50 border border-red-200 p-3 rounded">
              <div class="flex items-center gap-2 text-red-700">
                <span class="text-lg">⚠️</span>
                <div class="text-sm">
                  <div class="font-medium">이동 불가능</div>
                  <div class="text-xs">10분 내 이동이 어려울 수 있습니다.</div>
                </div>
              </div>
            </div>
          {:else}
            <div class="bg-green-50 border border-green-200 p-3 rounded">
              <div class="flex items-center gap-2 text-green-700">
                <span class="text-lg">✅</span>
                <div class="text-sm">
                  <div class="font-medium">이동 가능</div>
                  <div class="text-xs">충분한 이동시간입니다.</div>
                </div>
              </div>
            </div>
          {/if}
        </div>
        
        <!-- 모달 푸터 -->
        <div class="mt-6 flex justify-end">
          <button 
            class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            onclick={closeConsecutiveModal}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
