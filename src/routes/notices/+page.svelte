<script lang="ts">
  import { notices } from "$lib/stores";
  import { derived } from "svelte/store";
  import * as Accordion from "$lib/components/ui/accordion";
  
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
        <svg class="w-8 h-8 hanyang-navy dark:text-neutral-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        공지사항
      </h1>
    </div>
    
    <!-- 공지사항 아코디언 -->
    <div class="border border-hanyang-blue/20 dark:border-blue-700/30 rounded-xl overflow-hidden shadow-md">
      <!-- Accordion Header -->
      <div class="flex justify-between items-center p-4 bg-hanyang-blue dark:bg-blue-700 text-white font-semibold text-sm">
        <div class="flex-1 text-center">제목</div>
        <div class="hidden md:flex items-center gap-4 flex-shrink-0">
            <span class="w-20 text-center">작성자</span>
            <span class="w-24 text-center">등록일</span>
            <span class="w-20 text-center">조회수</span>
        </div>
      </div>
      <Accordion.Root type="single" collapsible class="w-full">
        <!-- 고정 공지사항 -->
        {#each $pinnedNotices as notice}
          <Accordion.Item value={notice.id} class="border-b border-hanyang-blue/10 dark:border-blue-700/20">
            <Accordion.Trigger class="p-4 text-left hover:no-underline hover:bg-hanyang-light-blue/10 dark:hover:bg-blue-900/20 transition-colors hide-arrow">
              <div class="flex justify-between items-center w-full gap-4">
                <div class="flex items-center gap-3 min-w-0 flex-1">
                   <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-300 shadow-sm flex-shrink-0"><span class="text-red-400 dark:text-red-300 mr-1">📌</span>중요</span>
                  <p class="font-semibold text-hanyang-navy dark:text-neutral-100 truncate">{notice.title}</p>
                </div>
                <div class="hidden md:flex items-center gap-4 text-sm text-hanyang-dark-gray dark:text-neutral-300 flex-shrink-0">
                  <span class="w-20 text-center">{notice.author || '홍**'}</span>
                  <span class="w-24 text-center">{formatDate(notice.createdAt)}</span>
                  <span class="w-20 text-center">{notice.views || 0}</span>
                </div>
              </div>
            </Accordion.Trigger>
            <Accordion.Content class="p-6 bg-sky-50/50 dark:bg-blue-900/10 text-sm">
              {#if notice.content}
                <div class="max-w-none">
                  {@html notice.content}
                </div>
              {:else}
                <p>내용이 없습니다.</p>
              {/if}
            </Accordion.Content>
          </Accordion.Item>
        {/each}
        
        <!-- 일반 공지사항 -->
        {#each paginatedRegularNotices as notice, index}
           <Accordion.Item value={notice.id} class="border-b border-hanyang-blue/10 dark:border-blue-700/20 last:border-b-0">
            <Accordion.Trigger class="p-4 text-left hover:no-underline hover:bg-sky-50/50 dark:hover:bg-blue-900/10 transition-colors hide-arrow">
              <div class="flex justify-between items-center w-full gap-4">
                <div class="flex items-center gap-3 min-w-0 flex-1">
                  <span class="text-sm font-semibold text-hanyang-blue dark:text-sky-400 bg-sky-50 dark:bg-blue-900/20 px-2 py-1 rounded-md w-12 text-center flex-shrink-0">{getNoticeNumber(index)}</span>
                  <p class="font-medium text-hanyang-navy dark:text-neutral-100 truncate">{notice.title}</p>
                </div>
                <div class="hidden md:flex items-center gap-4 text-sm text-hanyang-dark-gray dark:text-neutral-300 flex-shrink-0">
                  <span class="w-20 text-center">{notice.author || '홍**'}</span>
                  <span class="w-24 text-center">{formatDate(notice.createdAt)}</span>
                  <span class="w-20 text-center">{notice.views || 0}</span>
                </div>
              </div>
            </Accordion.Trigger>
            <Accordion.Content class="p-6 bg-gray-50 dark:bg-neutral-800/20 text-sm">
              {#if notice.content}
                <div class="max-w-none">
                  {@html notice.content}
                </div>
              {:else}
                <p>내용이 없습니다.</p>
              {/if}
            </Accordion.Content>
          </Accordion.Item>
        {/each}
      </Accordion.Root>
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

<style>
  :global(.hide-arrow > svg) {
    display: none;
  }
</style>


