<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import * as Popover from "$lib/components/ui/popover";
  import { Button } from "$lib/components/ui/button";
  
  type CreditStatus = {
    status: "success" | "warning" | "error";
    message: string;
  };

  // 부모로부터 모든 데이터를 props로 받습니다.
  let {
    totalCredits = 0,
    creditStatus = { status: "success", message: "적정 학점" },
    minCredits = 10,
    maxCredits = 23
  } = $props<{
    totalCredits: number;
    creditStatus: CreditStatus;
    minCredits: number;
    maxCredits: number;
  }>();

  const dispatch = createEventDispatcher<{
    semesterChange: string;
    reset: void;
    download: void;
    share: void;
  }>();

  // 학점 진행률 계산
  const creditProgress = $derived(() => {
    const progress = Math.min(100, (totalCredits / maxCredits) * 100);
    return progress;
  });

  // 게이지 색상 결정
  const gaugeColor = $derived(() => {
    if (creditStatus.status === 'success') return 'from-emerald-400 to-cyan-400';
    if (creditStatus.status === 'warning') return 'from-amber-400 to-orange-400';
    return 'from-red-400 to-pink-400';
  });

  // 이벤트 핸들러는 이벤트를 dispatch 하기만 합니다.
  function onSemesterChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    dispatch('semesterChange', target.value);
  }

  function resetTimetable() {
    dispatch('reset');
  }

  function downloadPNG() {
    dispatch('download');
  }

  function shareTimetable() {
    dispatch('share');
  }
</script>

<!-- 새로운 헤더 디자인 -->
<div class="glass-header">
  <div class="px-6 py-4 w-full">
    <div class="flex items-center justify-between">
      <!-- 왼쪽: 제목 섹션 -->
      <div class="flex items-center gap-3">
        <svg class="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <div class="flex flex-col">
          <h1 class="text-2xl font-bold" style="color: #3b82f6;">
            2025-2학기
          </h1>
          <span class="text-lg font-semibold text-black">
            시간표
          </span>
        </div>
      </div>

      <!-- 오른쪽: 액션 버튼들 -->
      <div class="flex items-center gap-3">
        <!-- 학점 정보 팝오버 -->
        <Popover.Root>
          <Popover.Trigger>
            <Button variant="outline" size="sm" class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              학점 정보
            </Button>
          </Popover.Trigger>
          <Popover.Content class="w-80">
            <div class="space-y-4">
              <div class="space-y-2">
                <h4 class="font-medium leading-none">총 학점 현황</h4>
                <div class="flex items-center justify-between">
                  <span class="text-2xl font-bold text-blue-600">{totalCredits}학점</span>
                  <span class="text-sm text-gray-500">{minCredits}-{maxCredits}학점</span>
                </div>
              </div>
              
              <!-- 진행률 바 -->
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span>진행률</span>
                  <span>{Math.round(creditProgress())}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style="width: {creditProgress()}%"
                  ></div>
                </div>
              </div>
              
              <div class="text-sm">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full {
                    creditStatus.status === 'success' ? 'bg-green-500' : 
                    creditStatus.status === 'warning' ? 'bg-yellow-500' : 
                    'bg-red-500'
                  }"></div>
                  <span class="font-medium">{creditStatus.message}</span>
                </div>
              </div>
            </div>
          </Popover.Content>
        </Popover.Root>

        <!-- 초기화 버튼 -->
        <Button variant="outline" size="sm" onclick={resetTimetable}>
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          초기화
        </Button>

        <!-- 이미지 저장 버튼 -->
        <Button variant="outline" size="sm" onclick={downloadPNG}>
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          저장
        </Button>

        <!-- 공유하기 버튼 -->
        <Button variant="outline" size="sm" onclick={shareTimetable}>
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
          </svg>
          공유
        </Button>
      </div>
    </div>
  </div>
</div>

<style>
  /* 깔끔한 흰색 헤더 */
  .glass-header {
    background: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    position: relative;
    z-index: 30;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
</style>
