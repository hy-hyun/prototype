<script lang="ts">
  import { notices } from "$lib/stores";
  import { derived } from "svelte/store";
  
  let currentPage = $state(1);
  const itemsPerPage = 10;
  
  const pinnedNotices = derived(notices, ($n) => $n.filter((x) => x.pinned));
  const regularNotices = derived(notices, ($n) => $n.filter((x) => !x.pinned));
  
  // Svelte 5 룬모드로 변환
  const paginatedRegularNotices = $derived.by(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return $regularNotices.slice(startIndex, endIndex);
  });
  
  const totalPages = derived(regularNotices, ($notices) => {
    return Math.ceil($notices.length / itemsPerPage);
  });
  
  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  }

  // 공지사항 번호 계산 (고정 공지 제외하고 역순)
  function getNoticeNumber(index: number): number {
    return $regularNotices.length - ((currentPage - 1) * itemsPerPage + index);
  }
  
  function goToPage(page: number) {
    currentPage = page;
  }
  
  function goToFirstPage() {
    currentPage = 1;
  }
  
  function goToPrevPage() {
    if (currentPage > 1) {
      currentPage--;
    }
  }
  
  function goToNextPage() {
    if (currentPage < $totalPages) {
      currentPage++;
    }
  }
  
  function goToLastPage() {
    currentPage = $totalPages;
  }
</script>

<div class="space-y-8">
  <!-- 공지사항 헤더 -->
  <section>
    <div class="flex items-center mb-6">
      <h1 class="text-3xl font-bold hanyang-navy dark:text-neutral-100 flex items-center gap-3">
        <svg class="w-8 h-8 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        공지사항
      </h1>
    </div>
    
    <!-- 공지사항 테이블 -->
    <div class="bg-white dark:bg-neutral-900 border border-hanyang-blue/20 dark:border-blue-700/30 rounded-xl overflow-hidden shadow-md">
      <table class="w-full">
        <thead class="bg-hanyang-blue dark:bg-blue-700">
          <tr>
            <th class="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider w-16">번호</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">제목</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider w-24">작성자</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider w-32">등록일</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider w-20">조회수</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-hanyang-blue/10 dark:divide-blue-700/20 bg-white dark:bg-neutral-900">
          <!-- 고정 공지사항 -->
          {#each $pinnedNotices as notice}
            <tr class="hover:bg-hanyang-light-blue/10 dark:hover:bg-blue-900/20 transition-all duration-200 cursor-pointer border-l-4 border-l-sky-400">
              <td class="px-6 py-4 whitespace-nowrap">
                                 <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-sky-100 to-blue-100 text-sky-800 dark:from-sky-900 dark:to-blue-900 dark:text-sky-200 shadow-sm">
                   📌 중요
                 </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <span class="text-lg">📢</span>
                  <span class="text-sm font-semibold text-hanyang-navy dark:text-neutral-100 hover:text-hanyang-blue dark:hover:text-sky-400 transition-colors">{notice.title}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-hanyang-dark-gray dark:text-neutral-300">
                {notice.author || '홍**'}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-hanyang-dark-gray dark:text-neutral-300">
                {formatDate(notice.createdAt)}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-hanyang-blue dark:text-sky-400 text-right">
                {notice.views || 0}
              </td>
            </tr>
          {/each}
          
          <!-- 일반 공지사항 -->
          {#each paginatedRegularNotices as notice, index}
            <tr class="hover:bg-sky-50/50 dark:hover:bg-blue-900/10 transition-all duration-200 cursor-pointer group">
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span class="text-sm font-semibold text-hanyang-blue dark:text-sky-400 bg-sky-50 dark:bg-blue-900/20 px-2 py-1 rounded-md">
                  {getNoticeNumber(index)}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium text-hanyang-navy dark:text-neutral-100 group-hover:text-hanyang-blue dark:group-hover:text-sky-400 transition-colors">
                    {notice.title}
                  </span>
                  {#if notice.views && notice.views > 500}
                    <span class="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full">HOT</span>
                  {:else if notice.views && notice.views > 200}
                    <span class="text-xs bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-0.5 rounded-full">인기</span>
                  {/if}
                </div>
              </td>
                             <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-hanyang-dark-gray dark:text-neutral-300">
                 {notice.author || '홍**'}
               </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-hanyang-dark-gray dark:text-neutral-300">
                {formatDate(notice.createdAt)}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-hanyang-blue dark:text-sky-400 text-right">
                {notice.views || 0}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    
    <!-- 페이지네이션 -->
    {#if $totalPages > 1}
      <div class="flex items-center justify-center gap-1 mt-8">
        <!-- 이전 버튼 -->
        {#if currentPage > 1}
          <button 
            onclick={goToPrevPage}
            class="px-3 py-2 text-sm text-hanyang-blue hover:bg-hanyang-blue hover:text-white rounded-lg border border-hanyang-blue/30 transition-all duration-200 font-medium"
          >
            ‹
          </button>
        {/if}
        
        <!-- 페이지 번호들 -->
        {#each Array.from({length: $totalPages}, (_, i) => i + 1) as pageNum}
          {#if pageNum === currentPage}
            <button 
              class="px-3 py-2 text-sm bg-hanyang-blue text-white rounded-lg font-semibold shadow-sm"
            >
              {pageNum}
            </button>
          {:else if Math.abs(pageNum - currentPage) <= 2 || pageNum === 1 || pageNum === $totalPages}
            <button 
              onclick={() => goToPage(pageNum)}
              class="px-3 py-2 text-sm text-hanyang-blue hover:bg-hanyang-blue hover:text-white rounded-lg border border-hanyang-blue/30 transition-all duration-200 font-medium"
            >
              {pageNum}
            </button>
          {:else if Math.abs(pageNum - currentPage) === 3}
            <span class="px-2 py-2 text-hanyang-blue">…</span>
          {/if}
        {/each}
        
        <!-- 다음 버튼 -->
        {#if currentPage < $totalPages}
          <button 
            onclick={goToNextPage}
            class="px-3 py-2 text-sm text-hanyang-blue hover:bg-hanyang-blue hover:text-white rounded-lg border border-hanyang-blue/30 transition-all duration-200 font-medium"
          >
            ›
          </button>
        {/if}
      </div>
    {/if}
  </section>
</div>


