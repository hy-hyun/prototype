<script lang="ts">
  import { notices, scheduleEvents, isLoggedIn } from "$lib/stores";
  import { derived } from "svelte/store";
  
  const allNotices = derived(notices, ($n) => {
    const pinned = $n.filter((x) => x.pinned);
    const latest = $n.filter((x) => !x.pinned).slice(0, 5);
    return [...pinned, ...latest];
  });
  
  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
  
  function getEventTypeColor(type: string) {
    switch (type) {
      case 'primary': return 'bg-hanyang-light-blue text-hanyang-navy border-hanyang-blue/30 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-900';
      case 'secondary': return 'bg-green-50 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-900';
      case 'danger': return 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-900';
      default: return 'bg-hanyang-gray text-hanyang-dark-gray border-gray-200 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700';
    }
  }
</script>

<div class="space-y-8">

  <!-- 수강신청 일정 캘린더 -->
  <section>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-3xl font-bold hanyang-navy dark:text-neutral-100 flex items-center gap-3">
        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
        </svg>
        수강신청 일정
      </h2>
    </div>
    
    <div class="bg-white border rounded-lg p-4">
      <div class="text-center mb-4">
        <h3 class="text-xl font-bold mb-1">2025년 8월</h3>
        <p class="text-sm text-gray-600">수강신청 일정</p>
      </div>
      
      <div class="grid grid-cols-7 text-sm" style="gap: 1px 0;">
        <div class="text-center py-3 font-bold">일</div>
        <div class="text-center py-3 font-bold">월</div>
        <div class="text-center py-3 font-bold">화</div>
        <div class="text-center py-3 font-bold">수</div>
        <div class="text-center py-3 font-bold">목</div>
        <div class="text-center py-3 font-bold">금</div>
        <div class="text-center py-3 font-bold">토</div>
        
        <div class="text-center py-3 text-gray-300">28</div>
        <div class="text-center py-3 text-gray-300">29</div>
        <div class="text-center py-3 text-gray-300">30</div>
        <div class="text-center py-3 text-gray-300">31</div>
        <div class="text-center py-3">1</div>
        <div class="text-center py-3">2</div>
        <div class="text-center py-3">3</div>
        <div class="text-center py-3">4</div>
        <div class="text-center py-3">5</div>
        <div class="text-center py-3">6</div>
        <div class="text-center py-3">7</div>
        <div class="text-center py-3">8</div>
        <div class="text-center py-3">9</div>
        <div class="text-center py-3">10</div>
        <div class="text-center py-3">11</div>
        
        <!-- 수강신청 기간 날짜들 -->
        <div class="text-center py-3 relative">
          <div class="font-bold mb-1">12</div>
          <div class="h-5 bg-hanyang-blue rounded-l -mr-px"></div>
        </div>
        <div class="text-center py-3 relative">
          <div class="font-bold mb-1">13</div>
          <div class="h-5 bg-hanyang-blue -mr-px -ml-px"></div>
        </div>
        <div class="text-center py-3 relative">
          <div class="font-bold mb-1">14</div>
          <div class="h-5 bg-hanyang-blue flex items-center justify-center -mr-px -ml-px">
            <span class="text-xs text-white font-medium">2025-2학기 수강신청 기간</span>
          </div>
        </div>
        <div class="text-center py-3 relative">
          <div class="font-bold mb-1">15</div>
          <div class="h-5 bg-hanyang-blue -mr-px -ml-px"></div>
        </div>
        <div class="text-center py-3 relative">
          <div class="font-bold mb-1">16</div>
          <div class="h-5 bg-hanyang-blue rounded-r -ml-px"></div>
        </div>
        
        <div class="text-center py-3">17</div>
        <div class="text-center py-3">18</div>
        <div class="text-center py-3">19</div>
        <div class="text-center py-3">20</div>
        <div class="text-center py-3">21</div>
        <div class="text-center py-3">22</div>
        <div class="text-center py-3">23</div>
        <div class="text-center py-3">24</div>
        <div class="text-center py-3">25</div>
        <div class="text-center py-3">26</div>
        <div class="text-center py-3">27</div>
        <div class="text-center py-3">28</div>
        <div class="text-center py-3">29</div>
        <div class="text-center py-3">30</div>
        <div class="text-center py-3">31</div>
      </div>
    </div>
  </section>
  
  <!-- 최신 공지사항 -->
  <section>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-3xl font-bold hanyang-navy dark:text-neutral-100 flex items-center gap-3">
        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        공지사항
      </h2>
      <a href="/notices" class="w-6 h-6 border-2 border-black hover:border-black hover:bg-black rounded-full flex items-center justify-center transition-all duration-200 group -ml-4">
        <span class="text-black group-hover:text-white font-bold text-sm">+</span>
      </a>
    </div>
    
    <div class="space-y-2">
      {#each $allNotices as notice}
        <div class="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-3 hover:shadow-md hover:border-hanyang-blue/30 dark:hover:border-blue-600 transition-all duration-200">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                {#if notice.pinned}
                  <span class="text-yellow-500 dark:text-yellow-400">📌</span>
                {/if}
                <h4 class="font-semibold hanyang-navy dark:text-neutral-200 text-base">{notice.title}</h4>
              </div>
              <p class="text-sm hanyang-dark-gray dark:text-neutral-400 leading-snug">{notice.content}</p>
            </div>
            <span class="text-xs hanyang-dark-gray dark:text-neutral-400 bg-hanyang-gray dark:bg-neutral-800 px-2 py-1 rounded-full ml-4 font-medium">{formatDate(notice.createdAt)}</span>
          </div>
        </div>
      {/each}
    </div>
  </section>

</div>
