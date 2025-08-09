<script lang="ts">
  import { notices } from "$lib/stores";
  import { derived } from "svelte/store";
  
  let currentPage = 1;
  const itemsPerPage = 10;
  
  const pinnedNotices = derived(notices, ($n) => $n.filter((x) => x.pinned));
  const regularNotices = derived(notices, ($n) => $n.filter((x) => !x.pinned));
  
  $: paginatedRegularNotices = (() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return $regularNotices.slice(startIndex, endIndex);
  })();
  
  const totalPages = derived(regularNotices, ($notices) => {
    return Math.ceil($notices.length / itemsPerPage);
  });
  
  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
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
        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        공지사항
      </h1>
    </div>
    
    <div class="space-y-2">
      <!-- 고정 공지사항 (항상 표시) -->
      {#each $pinnedNotices as notice}
        <div class="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-3 hover:shadow-md hover:border-hanyang-blue/30 dark:hover:border-blue-600 transition-all duration-200">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-yellow-500 dark:text-yellow-400">📌</span>
                <h4 class="font-semibold hanyang-navy dark:text-neutral-200 text-base">{notice.title}</h4>
              </div>
              <p class="text-sm hanyang-dark-gray dark:text-neutral-400 leading-snug">{notice.content}</p>
            </div>
            <span class="text-xs hanyang-dark-gray dark:text-neutral-400 bg-hanyang-gray dark:bg-neutral-800 px-2 py-1 rounded-full ml-4 font-medium">{formatDate(notice.createdAt)}</span>
          </div>
        </div>
      {/each}
      
      <!-- 일반 공지사항 (페이지네이션) -->
      {#each paginatedRegularNotices as notice}
        <div class="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-3 hover:shadow-md hover:border-hanyang-blue/30 dark:hover:border-blue-600 transition-all duration-200">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <h4 class="font-semibold hanyang-navy dark:text-neutral-200 text-base">{notice.title}</h4>
              </div>
              <p class="text-sm hanyang-dark-gray dark:text-neutral-400 leading-snug">{notice.content}</p>
            </div>
            <span class="text-xs hanyang-dark-gray dark:text-neutral-400 bg-hanyang-gray dark:bg-neutral-800 px-2 py-1 rounded-full ml-4 font-medium">{formatDate(notice.createdAt)}</span>
          </div>
        </div>
      {/each}
    </div>
    
    <!-- 페이지네이션 -->
    {#if $totalPages > 1}
      <div class="flex items-center justify-center gap-1 mt-8">
        <button 
          on:click={goToFirstPage}
          disabled={currentPage === 1}
          class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          &laquo;
        </button>
        
        <button 
          on:click={goToPrevPage}
          disabled={currentPage === 1}
          class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          &lt;
        </button>
        
        <span class="px-4 py-2 text-sm text-gray-600">
          {currentPage} / {$totalPages}
        </span>
        
        <button 
          on:click={goToNextPage}
          disabled={currentPage === $totalPages}
          class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          &gt;
        </button>
        
        <button 
          on:click={goToLastPage}
          disabled={currentPage === $totalPages}
          class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          &raquo;
        </button>
      </div>
    {/if}
  </section>
</div>


