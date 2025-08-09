<script lang="ts">
  import type { Lecture } from "$lib/types";
  import { cart, applications, courses } from "$lib/stores";
  import TimetableHeader from "$lib/components/TimetableHeader.svelte";
  import TimetableSidebar from "$lib/components/TimetableSidebar.svelte";
  import TimetableGrid from "$lib/components/TimetableGrid.svelte";
  import ConsecutiveWarning from "$lib/components/ConsecutiveWarning.svelte";
  import TimetableFooter from "$lib/components/TimetableFooter.svelte";
  
  type Block = { day: number; start: number; end: number; title: string };
  const blocks = $state<Block[]>([]);
  const days = ["월", "화", "수", "목", "금"];
  
  // 경고 상태들
  let showConflictWarning = $state(false);
  let conflictDetails = $state<string[]>([]);
  let showConsecutiveWarning = $state(false);

  function hasOverlap(a: Block, b: Block) {
    return a.day === b.day && Math.max(a.start, b.start) < Math.min(a.end, b.end);
  }
  $effect(() => {
    // 장바구니와 신청내역을 기준으로 시간표 블록 구성 (더미)
    const data = $courses;
    const selectedIds = new Set($applications.map((a) => `${a.courseId}-${a.classId}`));
    const cartIds = new Set($cart.map((c) => `${c.courseId}-${c.classId}`));
    const chosen = data.filter((l) => selectedIds.has(`${l.courseId}-${l.classId}`) || cartIds.has(`${l.courseId}-${l.classId}`));
    
    blocks.length = 0;
    blocks.push(
      ...chosen.flatMap((l) => l.schedule.map((m) => ({ day: m.day - 1, start: m.start, end: m.end, title: l.title })))
    );
    
    // 시간 중복 검사
    const conflicts = [];
    for (let i = 0; i < blocks.length; i++) {
      for (let j = i + 1; j < blocks.length; j++) {
        if (hasOverlap(blocks[i], blocks[j])) {
          conflicts.push(`${blocks[i].title} - ${blocks[j].title}`);
        }
      }
    }
    
    showConflictWarning = conflicts.length > 0;
    conflictDetails = conflicts;
    
    // 연강 검사 (간단한 버전)
    showConsecutiveWarning = blocks.some((block, i) => 
      blocks.some((other, j) => 
        i !== j && block.day === other.day && Math.abs(block.end - other.start) === 0
      )
    );
  });
</script>

<!-- 시간표 전체 레이아웃 -->
<div class="min-h-screen bg-gray-50">
  <!-- 시간표 헤더 -->
  <TimetableHeader />
  
  <!-- 메인 컨텐츠 영역 -->
  <div class="flex flex-1">
    <!-- 좌측 사이드바 (강의 목록) -->
    <TimetableSidebar />
    
    <!-- 중앙 시간표 그리드 -->
    <div class="flex-1">
      <TimetableGrid />
      
      <!-- 경고 메시지들 -->
      {#if showConflictWarning}
        <div class="mx-6 mb-4">
          <div class="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">시간 중복 경고</h3>
                <div class="mt-2 text-sm text-red-700">
                  <p>다음 강의들이 시간이 겹칩니다:</p>
                  <ul class="list-disc ml-5 mt-1">
                    {#each conflictDetails as detail}
                      <li>{detail}</li>
                    {/each}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
      
      {#if showConsecutiveWarning}
        <div class="mx-6 mb-4">
          <ConsecutiveWarning />
        </div>
      {/if}
    </div>
  </div>
  
  <!-- 시간표 푸터 -->
  <TimetableFooter />
</div>


