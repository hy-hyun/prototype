<script lang="ts">
  import { notices, scheduleEvents, isLoggedIn } from "$lib/stores";
  import { derived } from "svelte/store";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  
  const pinnedNotices = derived(notices, ($n) => $n.filter((x) => x.pinned));
  const latestNotices = derived(notices, ($n) => $n.filter((x) => !x.pinned).slice(0, 3));
  
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

  // 개발 단계: 루트 접속 시 수강신청 페이지로 이동
  onMount(() => {
    goto("/enroll");
  });
</script>

<div class="space-y-8">
  <!-- 히어로 섹션 -->
  <section class="text-center py-16 bg-hanyang-light-blue dark:bg-gradient-to-r dark:from-neutral-900 dark:to-neutral-900 rounded-2xl border border-hanyang-blue/10 dark:border-neutral-800">
    <h1 class="text-5xl font-bold hanyang-navy dark:text-neutral-100 mb-6">
      안녕하세요! 학생 여러분
      <span class="text-hanyang-accent">🚀</span>
    </h1>
    <p class="text-xl hanyang-dark-gray dark:text-neutral-400 mb-8 max-w-2xl mx-auto leading-relaxed">
      수강신청이 더 쉽고 공정해지는 <strong class="hanyang-navy dark:text-neutral-100">HY-PATH</strong>로<br>
      여러분의 학업 여정을 설계해보세요
    </p>
    {#if !$isLoggedIn}
      <div class="inline-flex items-center gap-2 bg-white dark:bg-neutral-800 px-6 py-3 rounded-full border border-hanyang-blue/20 dark:border-neutral-700 shadow-sm">
        <span class="text-sm hanyang-blue dark:text-blue-400 font-medium">✨ 로그인하여 개인화된 서비스를 이용해보세요!</span>
      </div>
    {/if}
  </section>
  
  <!-- 수강신청 일정 캘린더 -->
  <section>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-3xl font-bold hanyang-navy dark:text-neutral-100">📅 수강신청 일정</h2>
      <span class="text-sm hanyang-dark-gray dark:text-neutral-400 bg-hanyang-gray dark:bg-neutral-800 px-3 py-1 rounded-full">카드 뉴스 형태로 학년별 일정 표시</span>
    </div>
    
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {#each $scheduleEvents as event}
        <div class="rounded-xl border-2 p-6 {getEventTypeColor(event.type)} hover:shadow-lg transition-all duration-200">
          <div class="flex items-center justify-between mb-3">
            <span class="font-bold text-lg">{formatDate(event.date)}</span>
            <span class="text-xs px-3 py-1 rounded-full bg-white/80 dark:bg-white/10 font-medium">
              {event.type === 'primary' ? '🔥 D-DAY' : event.type === 'danger' ? '⚠️ 마감' : '📌 예정'}
            </span>
          </div>
          <h3 class="font-bold text-lg mb-2">{event.title}</h3>
          <p class="text-sm opacity-90 leading-relaxed">{event.desc}</p>
        </div>
      {/each}
    </div>
  </section>
  
  <!-- 최신 공지사항 -->
  <section>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-3xl font-bold hanyang-navy dark:text-neutral-100">📢 공지사항</h2>
      <a href="/notices" class="text-sm hanyang-blue dark:text-blue-400 hover:hanyang-navy dark:hover:text-blue-300 font-medium transition-colors duration-200">자세히 보기 →</a>
    </div>
    
    <div class="space-y-6">
      <!-- 고정 공지 -->
      <div>
        <h3 class="font-semibold hanyang-navy dark:text-neutral-300 mb-4 text-lg">📌 고정 공지</h3>
        <div class="space-y-3">
          {#each $pinnedNotices as notice}
            <div class="bg-gradient-to-r from-yellow-50 to-orange-50 dark:bg-yellow-950 border-l-4 border-yellow-400 dark:border-yellow-600 rounded-lg p-4 shadow-sm">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="font-semibold text-yellow-800 dark:text-yellow-200 text-lg mb-1">{notice.title}</h4>
                  <p class="text-sm text-yellow-700 dark:text-yellow-300 leading-relaxed">{notice.content}</p>
                </div>
                <span class="text-xs text-yellow-600 dark:text-yellow-300 bg-yellow-200/50 dark:bg-yellow-900 px-3 py-1 rounded-full font-medium">📌 고정</span>
              </div>
            </div>
          {/each}
        </div>
      </div>
      
      <!-- 최신 공지 -->
      <div>
        <h3 class="font-semibold hanyang-navy dark:text-neutral-300 mb-4 text-lg">🆕 최신 공지</h3>
        <div class="space-y-3">
          {#each $latestNotices as notice}
            <div class="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-4 hover:shadow-md hover:border-hanyang-blue/30 dark:hover:border-blue-600 transition-all duration-200">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="font-semibold hanyang-navy dark:text-neutral-200 text-lg mb-1">{notice.title}</h4>
                  <p class="text-sm hanyang-dark-gray dark:text-neutral-400 leading-relaxed">{notice.content}</p>
                </div>
                <span class="text-xs hanyang-dark-gray dark:text-neutral-400 bg-hanyang-gray dark:bg-neutral-800 px-3 py-1 rounded-full ml-4 font-medium">{formatDate(notice.createdAt)}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </section>
  
  <!-- 빠른 시작 -->
  <section>
    <h2 class="text-3xl font-bold hanyang-navy dark:text-neutral-100 mb-6">🚀 빠른 시작</h2>
    <div class="grid gap-6 md:grid-cols-3">
      <a href="/search" class="group block p-8 bg-white dark:bg-neutral-900 border-2 border-hanyang-blue/20 dark:border-neutral-800 rounded-2xl hover:shadow-xl hover:border-hanyang-blue dark:hover:border-blue-600 transition-all duration-300 hover:-translate-y-1">
        <div class="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🔍</div>
        <h3 class="font-bold text-xl hanyang-navy dark:text-neutral-200 group-hover:hanyang-blue dark:group-hover:text-blue-400 transition-colors mb-2">강의 검색</h3>
        <p class="text-sm hanyang-dark-gray dark:text-neutral-400 leading-relaxed">필터와 키워드로 원하는 과목을 찾아보세요</p>
      </a>
      
      <a href="/enroll" class="group block p-8 bg-white dark:bg-neutral-900 border-2 border-green-200 dark:border-neutral-800 rounded-2xl hover:shadow-xl hover:border-green-400 dark:hover:border-green-600 transition-all duration-300 hover:-translate-y-1">
        <div class="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">📝</div>
        <h3 class="font-bold text-xl hanyang-navy dark:text-neutral-200 group-hover:text-green-600 transition-colors mb-2">수강신청</h3>
        <p class="text-sm hanyang-dark-gray dark:text-neutral-400 leading-relaxed">장바구니와 신청내역을 관리하세요</p>
      </a>
      
      <a href="/timetable" class="group block p-8 bg-white dark:bg-neutral-900 border-2 border-purple-200 dark:border-neutral-800 rounded-2xl hover:shadow-xl hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 hover:-translate-y-1">
        <div class="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">📅</div>
        <h3 class="font-bold text-xl hanyang-navy dark:text-neutral-200 group-hover:text-purple-600 transition-colors mb-2">시간표</h3>
        <p class="text-sm hanyang-dark-gray dark:text-neutral-400 leading-relaxed">나만의 시간표를 만들고 최적화하세요</p>
      </a>
    </div>
  </section>
</div>
