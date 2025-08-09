<script lang="ts">
  import { notices, scheduleEvents, isLoggedIn } from "$lib/stores";
  import { derived } from "svelte/store";
  
  const pinnedNotices = derived(notices, ($n) => $n.filter((x) => x.pinned));
  const latestNotices = derived(notices, ($n) => $n.filter((x) => !x.pinned).slice(0, 3));
  
  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
  
  function getEventTypeColor(type: string) {
    switch (type) {
      case 'primary': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'secondary': return 'bg-green-100 text-green-800 border-green-200';
      case 'danger': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  }
</script>

<div class="space-y-8">
  <!-- 하이로 섹션 -->
  <section class="text-center py-12 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg">
    <h1 class="text-4xl font-bold text-neutral-800 mb-4">안녕하세요! 학생 여러분 🚀</h1>
    <p class="text-lg text-neutral-600 mb-6">수강신청이 더 쉽고 공정해지는 hy-path로 여러분의 학업 여정을 설계해보세요</p>
    {#if !$isLoggedIn}
      <p class="text-sm text-blue-600">로그인하여 개인화된 서비스를 이용해보세요!</p>
    {/if}
  </section>
  
  <!-- 수강신청 일정 캘린더 -->
  <section>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold text-neutral-800">📅 수강신청 일정</h2>
      <span class="text-sm text-neutral-500">카드 뉴스 형태로 학년별 일정 표시</span>
    </div>
    
    <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {#each $scheduleEvents as event}
        <div class="rounded-lg border p-4 {getEventTypeColor(event.type)}">
          <div class="flex items-center justify-between mb-2">
            <span class="font-semibold text-sm">{formatDate(event.date)}</span>
            <span class="text-xs px-2 py-1 rounded-full bg-white/50">{event.type === 'primary' ? 'D-DAY' : event.type === 'danger' ? '마감' : '예정'}</span>
          </div>
          <h3 class="font-bold mb-1">{event.title}</h3>
          <p class="text-sm opacity-80">{event.desc}</p>
        </div>
      {/each}
    </div>
  </section>
  
  <!-- 최신 공지사항 -->
  <section>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold text-neutral-800">📢 공지사항</h2>
      <a href="/notices" class="text-sm text-blue-600 hover:underline">자세히 보기 →</a>
    </div>
    
    <div class="space-y-3">
      <!-- 고정 공지 -->
      <div>
        <h3 class="font-medium text-neutral-700 mb-2">📌 고정 공지</h3>
        <div class="space-y-2">
          {#each $pinnedNotices as notice}
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div class="flex items-start justify-between">
                <div>
                  <h4 class="font-medium text-yellow-800">{notice.title}</h4>
                  <p class="text-sm text-yellow-700 mt-1">{notice.content}</p>
                </div>
                <span class="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">고정</span>
              </div>
            </div>
          {/each}
        </div>
      </div>
      
      <!-- 최신 공지 -->
      <div>
        <h3 class="font-medium text-neutral-700 mb-2">🆕 최신 공지</h3>
        <div class="space-y-2">
          {#each $latestNotices as notice}
            <div class="bg-white border rounded-lg p-3 hover:shadow-sm transition-shadow">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="font-medium text-neutral-800">{notice.title}</h4>
                  <p class="text-sm text-neutral-600 mt-1">{notice.content}</p>
                </div>
                <span class="text-xs text-neutral-500 ml-3">{formatDate(notice.createdAt)}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </section>
  
  <!-- 빠른 시작 -->
  <section>
    <h2 class="text-2xl font-bold text-neutral-800 mb-4">🚀 빠른 시작</h2>
    <div class="grid gap-4 md:grid-cols-3">
      <a href="/search" class="group block p-6 border rounded-lg hover:shadow-md transition-all hover:border-blue-300">
        <div class="text-3xl mb-3">🔍</div>
        <h3 class="font-semibold text-neutral-800 group-hover:text-blue-600 transition-colors">강의 검색</h3>
        <p class="text-sm text-neutral-600 mt-1">필터와 키워드로 원하는 과목을 찾아보세요</p>
      </a>
      
      <a href="/enroll" class="group block p-6 border rounded-lg hover:shadow-md transition-all hover:border-green-300">
        <div class="text-3xl mb-3">📝</div>
        <h3 class="font-semibold text-neutral-800 group-hover:text-green-600 transition-colors">수강신청</h3>
        <p class="text-sm text-neutral-600 mt-1">장바구니와 신청내역을 관리하세요</p>
      </a>
      
      <a href="/timetable" class="group block p-6 border rounded-lg hover:shadow-md transition-all hover:border-purple-300">
        <div class="text-3xl mb-3">📅</div>
        <h3 class="font-semibold text-neutral-800 group-hover:text-purple-600 transition-colors">시간표</h3>
        <p class="text-sm text-neutral-600 mt-1">나만의 시간표를 만들고 최적화하세요</p>
      </a>
    </div>
  </section>
</div>
