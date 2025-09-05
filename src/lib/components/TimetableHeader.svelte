<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  type CreditStatus = {
    status: "success" | "warning" | "error";
    message: string;
  };

  // 부모로부터 모든 데이터를 props로 받습니다.
  let {
    totalCredits = 0,
    creditStatus = { status: "success", message: "적정 학점" },
    minCredits = 12,
    maxCredits = 21
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

<!-- Glassmorphism 헤더 컨테이너 -->
<div class="relative">
  <!-- 헤더 배경 -->
  <div class="glass-header backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg">
    <div class="px-6 py-2 max-w-7xl mx-auto">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <!-- 1. 총학점 게이지 -->
        <div class="flex items-center gap-4">
          <div class="hidden lg:flex items-center">
            <div class="inline-gauge-container {creditStatus.status === 'warning' ? 'gauge-warning' : creditStatus.status === 'error' ? 'gauge-error' : ''}">
              <!-- 미니 원형 게이지 -->
              <div class="inline-gauge-bg">
                <svg class="inline-gauge-svg" viewBox="0 0 60 60">
                  <!-- 배경 원 -->
                  <circle 
                    cx="30" 
                    cy="30" 
                    r="25" 
                    fill="none" 
                    stroke="rgba(255,255,255,0.3)" 
                    stroke-width="4"
                    stroke-linecap="round"
                  />
                  <!-- 진행률 원 -->
                  <circle 
                    cx="30" 
                    cy="30" 
                    r="25" 
                    fill="none" 
                    stroke="url(#inlineGaugeGradient)" 
                    stroke-width="4"
                    stroke-linecap="round"
                    stroke-dasharray="157"
                    stroke-dashoffset="{157 - (157 * creditProgress() / 100)}"
                    transform="rotate(-90 30 30)"
                    class="gauge-progress"
                  />
                  
                  <!-- 그라디언트 정의 -->
                  <defs>
                    <linearGradient id="inlineGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" class="inline-gauge-start" />
                      <stop offset="100%" class="inline-gauge-end" />
                    </linearGradient>
                  </defs>
                </svg>
                
                <!-- 중앙 텍스트 -->
                <div class="inline-gauge-text">
                  <div class="inline-gauge-credits">{totalCredits}</div>
                </div>
              </div>
              
              <!-- 게이지 정보 -->
              <div class="inline-gauge-info">
                <div class="inline-gauge-label">총 학점</div>
                <div class="inline-gauge-status">{creditStatus.message}</div>
                <div class="inline-gauge-range">{minCredits}-{maxCredits} 학점</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. 주간 시간표 제목 (중앙) -->
        <div class="flex items-center justify-center flex-1 max-w-4xl mx-auto">
          <h1 class="font-black text-blue-600 flex items-center gap-3" style="font-family: 'Poppins', 'Nunito', 'Roboto', system-ui, sans-serif; letter-spacing: -0.03em; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span class="text-3xl lg:text-4xl hidden sm:inline">주간 시간표</span>
            <span class="text-xl sm:hidden">시간표</span>
          </h1>
        </div>

        <!-- 3. 리셋 버튼 -->
        <div class="flex items-center gap-4 flex-wrap">
          <!-- 초기화 버튼 -->
          <div class="relative group">
            <button 
              class="icon-btn"
              onclick={resetTimetable}
              aria-label="시간표 초기화"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </button>
            <div class="tooltip">시간표 초기화</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 모바일용 플로팅 학점 게이지 (lg 미만에서만 표시) -->
  <div class="mobile-floating-gauge lg:hidden">
    <div class="mobile-gauge-container {creditStatus.status === 'warning' ? 'gauge-warning' : creditStatus.status === 'error' ? 'gauge-error' : ''}">
      <div class="mobile-gauge-content">
        <div class="mobile-gauge-text">
          <span class="mobile-gauge-credits">{totalCredits}</span>
          <span class="mobile-gauge-unit">학점</span>
        </div>
        <div class="mobile-gauge-bar">
          <div 
            class="mobile-gauge-fill" 
            style="width: {creditProgress()}%"
          ></div>
        </div>
        <div class="mobile-gauge-status">{creditStatus.message}</div>
      </div>
    </div>
  </div>
</div>

<style>
  /* 글래스모피즘 헤더 */
  .glass-header {
    background: rgba(219, 234, 254, 0.9); /* 연한 하늘색 (sky-100) */
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
    border: 1px solid rgba(147, 197, 253, 0.3); /* sky-300 테두리 */
    border-radius: 24px 24px 32px 32px; /* 상단과 하단 모두 둥글게 */
    position: relative;
    z-index: 30; /* 네비게이션(z-40) 아래로 설정 */
    box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15);
  }

  /* 글래스모피즘 선택 박스 */
  .glass-select {
    position: relative;
    background: rgba(219, 234, 254, 0.8); /* 연한 하늘색 */
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(147, 197, 253, 0.4); /* sky-300 테두리 */
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15);
    transition: all 0.3s ease;
    opacity: 0.9;
  }

  .glass-select:hover {
    background: rgba(219, 234, 254, 0.95); /* 연한 하늘색 강화 */
    transform: translateY(-1px);
    box-shadow: 0 12px 40px rgba(59, 130, 246, 0.2);
    opacity: 1;
  }

  /* 새로운 안정적인 아이콘 버튼 */
  .icon-btn {
    width: 48px;
    height: 48px;
    background: rgba(219, 234, 254, 0.8); /* 연한 하늘색 */
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(147, 197, 253, 0.4); /* sky-300 테두리 */
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    cursor: pointer;
    color: #6b7280;
    position: relative;
    opacity: 0.9;
  }

  .icon-btn:hover {
    background: rgba(219, 234, 254, 0.95); /* 연한 하늘색 강화 */
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
    color: #374151;
    opacity: 1;
  }

  .icon-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  /* 툴팁 */
  .tooltip {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 8px;
    padding: 6px 12px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    font-size: 0.75rem;
    font-weight: 500;
    border-radius: 6px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
    z-index: 50;
  }

  .tooltip::before {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-bottom-color: rgba(0, 0, 0, 0.8);
  }

  .group:hover .tooltip {
    opacity: 1;
  }

  /* 인라인 게이지 (데스크톱) */
  .inline-gauge-container {
    display: flex;
    align-items: center;
    gap: 16px;
    background: rgba(219, 234, 254, 0.8); /* 연한 하늘색 */
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(147, 197, 253, 0.4); /* sky-300 테두리 */
    border-radius: 16px;
    padding: 8px 12px;
    box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15);
    transition: all 0.3s ease;
    opacity: 0.9;
  }

  .inline-gauge-container:hover {
    background: rgba(219, 234, 254, 0.95); /* 연한 하늘색 강화 */
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(59, 130, 246, 0.2);
    opacity: 1;
  }

  .inline-gauge-bg {
    position: relative;
    width: 50px;
    height: 50px;
    flex-shrink: 0;
  }

  .inline-gauge-svg {
    width: 100%;
    height: 100%;
  }

  .inline-gauge-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }

  .inline-gauge-credits {
    font-size: 1.25rem;
    font-weight: 800;
    background: linear-gradient(135deg, #7dd3fc 0%, #0ea5e9 50%, #0284c7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1;
  }

  .inline-gauge-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .inline-gauge-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }

  .inline-gauge-status {
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 500;
  }

  .inline-gauge-range {
    font-size: 0.625rem;
    color: #9ca3af;
  }

  /* 인라인 게이지 색상 */
  .inline-gauge-start {
    stop-color: #7dd3fc; /* 맑은 하늘색 */
  }

  .inline-gauge-end {
    stop-color: #0284c7; /* 진한 하늘색 */
  }

  :global(.gauge-warning) .inline-gauge-start {
    stop-color: #93c5fd;
  }

  :global(.gauge-warning) .inline-gauge-end {
    stop-color: #3b82f6;
  }

  :global(.gauge-error) .inline-gauge-start {
    stop-color: #a5b4fc;
  }

  :global(.gauge-error) .inline-gauge-end {
    stop-color: #6366f1;
  }

  /* 모바일 플로팅 게이지 */
  .mobile-floating-gauge {
    position: fixed;
    top: 90px;
    right: 16px;
    z-index: 25; /* 네비게이션(z-40) 아래로 설정 */
    animation: float 4s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
  }

  .mobile-gauge-container {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-radius: 12px;
    padding: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    min-width: 120px;
  }

  .mobile-gauge-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .mobile-gauge-text {
    display: flex;
    align-items: baseline;
    gap: 2px;
  }

  .mobile-gauge-credits {
    font-size: 1.25rem;
    font-weight: 800;
    background: linear-gradient(135deg, #7dd3fc 0%, #0284c7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .mobile-gauge-unit {
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 500;
  }

  .mobile-gauge-bar {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    overflow: hidden;
  }

  .mobile-gauge-fill {
    height: 100%;
    background: linear-gradient(90deg, #7dd3fc 0%, #0284c7 100%);
    border-radius: 2px;
    transition: width 1s ease-in-out;
  }

  .mobile-gauge-status {
    font-size: 0.625rem;
    color: #6b7280;
    text-align: center;
    font-weight: 500;
  }

  /* 모바일 게이지 색상 변화 */
  :global(.gauge-warning) .mobile-gauge-fill {
    background: linear-gradient(90deg, #93c5fd 0%, #3b82f6 100%);
  }

  :global(.gauge-error) .mobile-gauge-fill {
    background: linear-gradient(90deg, #a5b4fc 0%, #6366f1 100%);
  }

  /* 반응형 조정 */
  @media (max-width: 1024px) {
    .inline-gauge-container {
      display: none; /* lg 미만에서 숨김 */
    }
  }

  @media (max-width: 640px) {
    .mobile-floating-gauge {
      top: 70px;
      right: 12px;
      transform: scale(0.9);
    }
    
    .mobile-gauge-container {
      padding: 8px;
      min-width: 100px;
    }
  }
</style>
