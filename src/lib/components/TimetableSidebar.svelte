<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Lecture } from "$lib/types";

  type DayTab = { key: string; label: string; count: number };

  let { 
    courses = [],
    cartCourses = [],
    dayTabs = [],
    activeTab = "전체",
    showFavorites = false,
    favoriteCourses = []
  } = $props<{
    courses: (Lecture & { isInCart: boolean; isFavorite: boolean })[];
    cartCourses: (Lecture & { cartMethod: string })[];
    dayTabs: DayTab[];
    activeTab: string;
    showFavorites: boolean;
    favoriteCourses: string[];
  }>();

  const dispatch = createEventDispatcher<{
    tabChange: string;
    add: Lecture;
    remove: Lecture;
    toggleFavorites: void;
    toggleFavorite: { courseId: string; classId: string };
  }>();

  function changeTab(tabKey: string) {
    dispatch('tabChange', tabKey);
  }

  function addToCart(course: Lecture) {
    dispatch('add', course);
  }

  function removeFromCart(course: Lecture) {
    dispatch('remove', course);
  }

  function formatTime(slot: number): string {
    const hour = 9 + Math.floor(slot / 2);
    const minute = (slot % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }
</script>

<!-- 사이드바 전체 컨테이너 -->
<div class="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
  <!-- 헤더 -->
  <div class="p-6 border-b border-gray-100">
    <div class="flex items-center justify-between">
      <h3 class="font-semibold text-gray-800 flex items-center gap-2 text-lg">
        <span class="text-blue-500">🛒</span>
        장바구니
      </h3>
      <span class="text-sm text-gray-500 bg-blue-50 px-2 py-1 rounded-full">장바구니 {cartCourses.length}개</span>
    </div>
  </div>

  <!-- 요일별 탭 메뉴 -->
  <div class="px-4 py-3 border-b border-gray-100">
    <div class="flex flex-col gap-2 mb-4">
      <!-- 찜 토글 (최상단) -->
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-gray-700">찜한 과목만 보기</span>
        <button 
          type="button"
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 {
            showFavorites ? 'bg-pink-500' : 'bg-gray-200'
          }"
          onclick={() => dispatch('toggleFavorites')}
        >
          <span class="sr-only">찜한 과목만 보기</span>
          <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {
            showFavorites ? 'translate-x-6' : 'translate-x-1'
          }"></span>
        </button>
      </div>
      
      <!-- 전체 버튼 (윗줄) -->
      {#each dayTabs as tab (tab.key)}
        {#if tab.key === "전체"}
          <button 
            type="button"
            class="px-2 py-2 text-sm rounded-lg transition-colors font-medium {
              activeTab === tab.key 
                ? 'bg-blue-500 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-150 hover:text-gray-800'
            }"
            onclick={() => changeTab(tab.key)}
          >
            {tab.label} ({tab.count})
          </button>
        {/if}
      {/each}
      
      <!-- 요일 버튼들 (아래줄, 작은 크기) -->
      <div class="flex flex-wrap gap-1">
        {#each dayTabs as tab (tab.key)}
          {#if tab.key !== "전체"}
            <button 
              type="button"
              class="px-2 py-1 text-xs rounded-lg transition-colors font-medium {
                activeTab === tab.key 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-150 hover:text-gray-800'
              }"
              onclick={() => changeTab(tab.key)}
            >
              {tab.label} ({tab.count})
            </button>
          {/if}
        {/each}
      </div>
    </div>
  </div>

  <!-- 강의 목록 -->
  <div class="flex-1 overflow-y-auto">
    <div class="p-4">
      {#if courses.length === 0}
        <div class="text-center text-gray-500 py-12">
          <div class="text-3xl mb-3">📚</div>
          <div class="text-base">선택한 요일에 강의가 없습니다</div>
        </div>
      {:else}
        {#each courses as course (course.courseId + course.classId)}
          <div class="mb-4 p-4 bg-gray-100 rounded-xl border hover:bg-gray-150 transition-all duration-200 hover:shadow-md {
            course.isInCart ? 'bg-green-50 border-green-200 shadow-sm' : 'border-gray-200'
          }">
            <!-- 과목 기본 정보 -->
            <div class="flex items-start mb-3">
              <div class="flex-1 min-w-0">
                <div class="font-semibold text-gray-800 text-base flex items-center gap-2 truncate mb-2">
                  {#if course.isInCart}
                    <span class="text-green-500 flex-shrink-0 text-lg">✓</span>
                  {/if}
                  <span class="truncate">{course.title}</span>
                </div>
                <div class="text-sm text-gray-500 mb-2 flex items-center gap-2 flex-wrap">
                  <span class="truncate font-mono">{course.courseId}</span>
                  <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs flex-shrink-0 font-medium">{course.category}</span>
                  <span class="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs flex-shrink-0 font-medium">
                    {typeof course.credits === 'object' && course.credits !== null 
                      ? (course.credits.lecture || 0) + (course.credits.lab || 0)
                      : course.credits || 0
                    }학점
                  </span>
                </div>
              </div>
            </div>
            
            <!-- 상세 정보 -->
            <div class="text-xs text-gray-600 space-y-0.5 mb-2">
              <div class="flex items-center gap-1">
                <span class="flex-shrink-0">👨‍🏫</span>
                <span class="truncate">{course.instructor}</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="flex-shrink-0">🕐</span>
                <span class="truncate">
                  {course.schedule?.map((s: any) => 
                    `${["일","월","화","수","목","금","토"][s.day % 7]} ${formatTime(s.start)}-${formatTime(s.end)}`
                  ).join(", ")}
                </span>
              </div>
              <div class="flex items-center gap-1">
                <span class="flex-shrink-0">🏠</span>
                <span class="truncate">
                  {course.schedule?.map((s: any) => `${s.building || ''} ${s.room || ''}`).filter((v: any, i: any, a: any) => a.indexOf(v) === i && v.trim() !== '').join(', ')}
                </span>
              </div>
            </div>

            <!-- 찜 버튼과 장바구니 버튼 -->
            <div class="flex justify-between items-center">
              <!-- 찜 버튼 -->
              <button 
                type="button"
                class="px-3 py-1.5 text-xs rounded-lg transition-colors font-medium {
                  course.isFavorite 
                    ? 'bg-pink-100 text-pink-500 hover:bg-pink-200' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }"
                onclick={() => dispatch('toggleFavorite', { courseId: course.courseId, classId: course.classId })}
                title={course.isFavorite ? "찜 해제" : "찜하기"}
              >
                {course.isFavorite ? "❤️" : "🤍"}
              </button>
              
              <!-- 장바구니 버튼 -->
              {#if course.isInCart}
                <button 
                  type="button"
                  class="cart-btn remove"
                  onclick={() => removeFromCart(course)}
                  title="장바구니에서 제거"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                  </svg>
                  제거
                </button>
              {:else if course.isFavorite}
                <button 
                  type="button"
                  class="cart-btn add"
                  onclick={() => addToCart(course)}
                  title="찜한 과목을 장바구니에 추가"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  추가
                </button>
              {:else}
                <button 
                  type="button"
                  class="cart-btn add"
                  onclick={() => addToCart(course)}
                  title="장바구니에 추가"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  추가
                </button>
              {/if}
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>

<style>
  .cart-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 500;
    transition: all 0.2s ease;
    cursor: pointer;
    border: 1px solid;
    white-space: nowrap;
    min-width: fit-content;
  }

  .cart-btn.add {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    border-color: #2563eb;
  }

  .cart-btn.add:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  }

  .cart-btn.remove {
    background: linear-gradient(135deg, #f8b4cb 0%, #fce7f3 100%);
    color: #be185d;
    border-color: #f9a8d4;
  }

  .cart-btn.remove:hover {
    background: linear-gradient(135deg, #f472b6 0%, #f8b4cb 100%);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(244, 114, 182, 0.3);
  }
</style>