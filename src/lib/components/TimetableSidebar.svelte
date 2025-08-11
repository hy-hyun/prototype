<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Lecture } from "$lib/types";

  type DayTab = { key: string; label: string; count: number };

  let { 
    courses = [],
    cartCourses = [],
    dayTabs = [],
    activeTab = "전체"
  } = $props<{
    courses: (Lecture & { isInCart: boolean })[];
    cartCourses: (Lecture & { cartMethod: string })[];
    dayTabs: DayTab[];
    activeTab: string;
  }>();

  const dispatch = createEventDispatcher<{
    tabChange: string;
    add: Lecture;
    remove: Lecture;
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
  <div class="p-4 border-b border-gray-100">
    <div class="flex items-center justify-between">
      <h3 class="font-semibold text-gray-800 flex items-center gap-2">
        <span class="text-blue-500">🛒</span>
        장바구니
      </h3>
      <span class="text-sm text-gray-500">장바구니 {cartCourses.length}개</span>
    </div>
  </div>

  <!-- 요일별 탭 메뉴 -->
  <div class="px-3 py-2 border-b border-gray-100">
    <div class="flex flex-wrap gap-1 mb-3">
      {#each dayTabs as tab (tab.key)}
        <button 
          type="button"
          class="px-2 py-1 text-xs rounded-md transition-colors {
            activeTab === tab.key 
              ? 'bg-blue-500 text-white' 
              : 'text-gray-600 hover:bg-gray-100'
          }"
          onclick={() => changeTab(tab.key)}
        >
          {tab.label} ({tab.count})
        </button>
      {/each}
    </div>
  </div>

  <!-- 강의 목록 -->
  <div class="flex-1 overflow-y-auto">
    <div class="p-3">
      {#if courses.length === 0}
        <div class="text-center text-gray-500 py-8">
          <div class="text-2xl mb-2">📚</div>
          <div class="text-sm">선택한 요일에 강의가 없습니다</div>
        </div>
      {:else}
        {#each courses as course (course.courseId + course.classId)}
          <div class="mb-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors {
            course.isInCart ? 'bg-green-50 border-green-200' : ''
          }">
            <!-- 과목 기본 정보 -->
            <div class="flex items-start justify-between mb-2">
              <div class="flex-1">
                <div class="font-medium text-gray-800 text-sm flex items-center gap-2">
                  {#if course.isInCart}
                    <span class="text-green-500">✓</span>
                  {/if}
                  {course.title}
                </div>
                <div class="text-xs text-gray-500 mt-1 flex items-center gap-2">
                  <span>{course.courseId}</span>
                  <span class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{course.category}</span>
                  <span class="text-orange-600">{course.credits.lecture + (course.credits.lab || 0)}학점</span>
                </div>
              </div>
              
              <!-- 추가/삭제 버튼 -->
              {#if course.isInCart}
                <button 
                  type="button"
                  class="ml-2 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                  onclick={() => removeFromCart(course)}
                  title="장바구니에서 제거"
                >
                  제거
                </button>
              {:else}
                <button 
                  type="button"
                  class="ml-2 px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                  onclick={() => addToCart(course)}
                  title="장바구니에 추가"
                >
                  추가
                </button>
              {/if}
            </div>
            
            <!-- 상세 정보 -->
            <div class="text-xs text-gray-600 space-y-1">
              <div class="flex items-center gap-1">
                <span>👨‍🏫</span>
                <span>{course.instructor}</span>
              </div>
              <div class="flex items-center gap-1">
                <span>🕐</span>
                <span>
                  {course.schedule?.map(s => 
                    `${["일","월","화","수","목","금","토"][s.day % 7]} ${formatTime(s.start)}-${formatTime(s.end)}`
                  ).join(", ")}
                </span>
              </div>
              <div class="flex items-center gap-1">
                <span>🏠</span>
                <span>
                  {course.schedule?.map(s => `${s.building || ''} ${s.room || ''}`).filter((v, i, a) => a.indexOf(v) === i && v.trim() !== '').join(', ')}
                </span>
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>