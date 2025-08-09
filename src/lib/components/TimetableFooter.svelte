<script lang="ts">
  import { cart, applications } from "$lib/stores";
  
  // 통계 계산 - Svelte 5 문법
  let totalCourses = $derived($cart.length + $applications.length);
  let enrolledCourses = $derived($applications.length);
  let cartCourses = $derived($cart.length);
  
  // 시간 통계 (임시) - Svelte 5 문법
  let totalHours = $derived(totalCourses * 3); // 임시로 3시간씩 계산
  let busyDays = $derived(Math.min(5, totalCourses)); // 최대 5일
</script>

<!-- 푸터 컨테이너 -->
<div class="bg-white border-t border-gray-200 px-6 py-3">
  <div class="flex items-center justify-between">
    <!-- 좌측: 통계 정보 -->
    <div class="flex items-center gap-6 text-sm">
      <!-- 추가된 강의 수 -->
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
        <span class="text-gray-600">
          현재 추가된 강의: <span class="font-semibold text-blue-600">{totalCourses}개</span>
        </span>
      </div>
      
      <!-- 신청 완료 vs 장바구니 -->
      <div class="text-gray-500">
        신청완료 {enrolledCourses}개 · 장바구니 {cartCourses}개
      </div>
      
      <!-- 총 시간 -->
      <div class="text-gray-500">
        주간 {totalHours}시간 · {busyDays}일 활용
      </div>
    </div>

    <!-- 우측: 빠른 액션 -->
    <div class="flex items-center gap-3">
      <!-- 강의 검색 바로가기 -->
      <a 
        href="/search" 
        class="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        강의 검색
      </a>
      
      <!-- 구분선 -->
      <div class="w-px h-4 bg-gray-300"></div>
      
      <!-- 수강신청 바로가기 -->
      <a 
        href="/enroll" 
        class="text-sm text-green-600 hover:text-green-800 flex items-center gap-1"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
        </svg>
        수강신청
      </a>
      
      <!-- 새로고침 버튼 -->
      <button 
        class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        onclick={() => window.location.reload()}
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        새로고침
      </button>
    </div>
  </div>
</div>
