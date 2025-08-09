<script lang="ts">
  import TimetableHeader from "$lib/components/TimetableHeader.svelte";
  import TimetableGrid from "$lib/components/TimetableGrid.svelte";
  import TimetableSidebar from "$lib/components/TimetableSidebar.svelte";
  import TimetableFooter from "$lib/components/TimetableFooter.svelte";
  import ConsecutiveWarning from "$lib/components/ConsecutiveWarning.svelte";
  
  import { cart, applications } from "$lib/stores";
  
  // 시간 중복 및 연강 감지를 위한 상태
  let showConflictWarning = $state(false);
  let showConsecutiveWarning = $state(false);
  let conflictDetails = $state<string[]>([]);
  let consecutiveDetails = $state<string[]>([]);
  
  // 시간표 관련 상태 관리
  $effect(() => {
    // 장바구니와 신청내역 변경 시 충돌 및 연강 검사
    const allItems = [...$cart, ...$applications.map(app => ({ courseId: app.courseId, classId: app.classId, method: "FCFS" as const }))];
    
    // 여기서 충돌 검사 로직 구현 (추후 TimetableGrid에서 처리)
    // showConflictWarning = hasTimeConflicts(allItems);
    // showConsecutiveWarning = hasConsecutiveClasses(allItems);
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


