<script lang="ts">
  import { notices, scheduleEvents, isLoggedIn, getCacheInfo, getCacheStats, cleanupExpiredCache } from "$lib/stores";
  import { Button } from "$lib/components/ui/button";
  import SimpleAccordion from "$lib/components/SimpleAccordion.svelte";
  
  // Svelte 5 룬모드 사용
  let cacheInfo = $state<ReturnType<typeof getCacheInfo> | null>(null);
  let cacheStats = $state<ReturnType<typeof getCacheStats> | null>(null);
  let showCacheInfo = $state(false);

  

  
  // 파생 상태로 공지사항 필터링
  const allNotices = $derived(() => {
    const noticesValue = $notices;
    const pinned = noticesValue.filter((x) => x.pinned);
    const latest = noticesValue.filter((x) => !x.pinned).slice(0, 5);
    return [...pinned, ...latest];
  });

  // SimpleAccordion용 데이터 변환
  const accordionItems = $derived(() => {
    return allNotices().map(notice => ({
      id: notice.id,
      title: notice.title,
      date: formatDate(notice.createdAt),
      isPinned: notice.pinned,
      content: `
        ${notice.content}
        
        📅 공지일: ${formatDate(notice.createdAt)}
        ${notice.pinned ? '📌 고정 공지' : ''}
        
        ${notice.id === 'n1' ? '💡 안내: 수강신청 시 학점 제한과 베팅제를 확인하세요.' : ''}
        ${notice.id === 'n2' ? '✅ 참고: 시스템 점검 시간에는 접속이 제한됩니다.' : ''}
        ${notice.id === 'n3' ? '🆕 신규: AI 관련 과목들이 새롭게 개설되었습니다.' : ''}
        ${notice.id === 'n4' ? '📚 가이드: 가이드북을 통해 성공적인 수강신청을 준비하세요.' : ''}
        ${notice.id === 'n5' ? '🎯 베팅제: 포인트 사용 전략을 신중히 세우세요.' : ''}
      `.trim()
    }));
  });
  
  // 캐시 정보 로드 (한 번만 실행)
  $effect(() => {
    if (!cacheInfo) {
      cacheInfo = getCacheInfo();
    }
    if (!cacheStats) {
      cacheStats = getCacheStats();
    }
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
  
  function formatCacheTime(timestamp: Date) {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    return `${days}일 전`;
  }
  


  // 메인 페이지에 머물도록 리다이렉트 제거
</script>

<div class="space-y-8">

  <!-- 메인 배너 - 한양대학교 스타일 -->
  <section class="relative overflow-hidden bg-gradient-to-br from-hanyang-blue via-blue-400 to-hanyang-navy rounded-2xl shadow-2xl">
    <!-- 배경 패턴 -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
      <div class="absolute top-20 right-10 w-24 h-24 bg-white rounded-full"></div>
      <div class="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-20 translate-y-20"></div>
      <div class="absolute bottom-10 left-20 w-16 h-16 bg-white rounded-full"></div>
    </div>
    
    <div class="grid lg:grid-cols-2 gap-8 items-center min-h-[400px]">
      <!-- 왼쪽 콘텐츠 -->
      <div class="relative px-6 py-10 md:px-10 md:py-12">
        <div class="space-y-6">
          <!-- 특별 이벤트 라벨 -->
          <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
            <span class="text-white text-sm font-semibold tracking-wide">SPECIAL EVENT</span>
          </div>
          
          <!-- 메인 타이틀 -->
          <div class="space-y-3">
            <h1 class="text-4xl md:text-5xl font-black text-white leading-tight">
              스마트 수강신청<br/>
              <span class="text-white/90">시스템</span>
            </h1>
            <p class="text-white/80 text-lg font-medium">
              스마트한 AI 추천 기능과 함께
            </p>
          </div>
          
          <!-- CTA 버튼 -->
          <div class="pt-4">
            <a href="/enroll" class="inline-block bg-white text-hanyang-navy font-bold px-8 py-3 rounded-full hover:bg-hanyang-navy hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border-2 border-white/20">
              지금 시작하기
            </a>
          </div>
        </div>
      </div>
      
      <!-- 오른쪽 일러스트 섹션 -->
      <div class="relative px-6 py-10 hidden lg:block">
        <div class="relative">
          <!-- 메인 시간표 일러스트 -->
          <div class="relative bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl transform rotate-2 hover:rotate-1 transition-transform duration-300">
            <!-- 시간표 헤더 -->
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-hanyang-navy font-bold text-lg">나의 시간표</h3>
              <div class="w-3 h-3 bg-hanyang-blue rounded-full animate-pulse"></div>
            </div>
            
            <!-- 시간표 그리드 -->
            <div class="grid grid-cols-5 gap-1 text-xs">
              <div class="text-center font-semibold text-gray-600 py-2">월</div>
              <div class="text-center font-semibold text-gray-600 py-2">화</div>
              <div class="text-center font-semibold text-gray-600 py-2">수</div>
              <div class="text-center font-semibold text-gray-600 py-2">목</div>
              <div class="text-center font-semibold text-gray-600 py-2">금</div>
              
              <!-- 시간표 블록들 -->
              <div class="bg-blue-100 text-blue-800 rounded p-2 font-medium">
                프로그래밍
              </div>
              <div class="bg-green-100 text-green-800 rounded p-2 font-medium">
                수학
              </div>
              <div class="bg-purple-100 text-purple-800 rounded p-2 font-medium">
                영어
              </div>
              <div class="bg-orange-100 text-orange-800 rounded p-2 font-medium">
                물리학
              </div>
              <div class="bg-pink-100 text-pink-800 rounded p-2 font-medium">
                화학
              </div>
            </div>
          </div>
          
          <!-- 떠다니는 아이콘들 -->
          <div class="absolute -top-4 -right-4 w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <svg class="w-6 h-6 text-yellow-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          
          <div class="absolute -bottom-2 -left-2 w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <svg class="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          
          <div class="absolute top-1/2 -right-6 w-8 h-8 bg-green-200 rounded-full flex items-center justify-center shadow-lg animate-spin-slow">
            <svg class="w-4 h-4 text-green-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </section>



  <!-- 수강신청 일정 캘린더 -->
  <section>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-3xl font-bold text-black dark:text-neutral-100 flex items-center gap-3">
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
             <span class="text-xs text-white font-bold">2025-2학기 수강신청 기간</span>
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
      <h2 class="text-3xl font-bold text-black dark:text-neutral-100 flex items-center gap-3">
        <svg class="w-8 h-8 text-black dark:text-neutral-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        공지사항
      </h2>
      <Button variant="outline" size="sm" href="/notices">
        더보기
      </Button>
    </div>
    
    <SimpleAccordion 
      items={accordionItems()} 
      multipleOpen={false} 
      class="space-y-2"
    />
  </section>



</div>
