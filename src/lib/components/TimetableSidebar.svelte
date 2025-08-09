<script lang="ts">
  import { cart, lectures } from "$lib/stores";
  import type { Lecture } from "$lib/types";



  // Svelte 5 runes 사용
  let activeTab = $state("전체");

  // 요일별 강의 개수 계산
  const dayTabs = $derived([
    { key: "전체", label: "전체", count: $lectures.length },
    { key: "월", label: "월", count: $lectures.filter(c => c.schedule.some(s => s.day === 1)).length },
    { key: "화", label: "화", count: $lectures.filter(c => c.schedule.some(s => s.day === 2)).length },
    { key: "수", label: "수", count: $lectures.filter(c => c.schedule.some(s => s.day === 3)).length },
    { key: "목", label: "목", count: $lectures.filter(c => c.schedule.some(s => s.day === 4)).length },
    { key: "금", label: "금", count: $lectures.filter(c => c.schedule.some(s => s.day === 5)).length }
  ]);

  // 장바구니 강의 목록
  const cartCourses = $derived(
    $cart.map(cartItem => {
      const course = $lectures.find(c => 
        c.courseId === cartItem.courseId && c.classId === cartItem.classId
      );
      return course ? { ...course, cartMethod: cartItem.method } : null;
    }).filter(Boolean) as (Lecture & { cartMethod: string })[]
  );

  // 필터링된 강의 목록
  const filteredCourses = $derived(() => {
    console.log("현재 activeTab:", activeTab);
    
    if (activeTab === "전체") {
      console.log("전체 강의 개수:", $lectures.length);
      return $lectures;
    }
    
    const dayMapping: Record<string, number> = {
      "월": 1, "화": 2, "수": 3, "목": 4, "금": 5
    };
    
    const targetDay = dayMapping[activeTab];
    if (!targetDay) {
      console.log("유효하지 않은 요일:", activeTab);
      return [];
    }
    
    const filtered = $lectures.filter(course => 
      course.schedule.some(schedule => schedule.day === targetDay)
    );
    console.log(`${activeTab}요일 강의 개수:`, filtered.length);
    return filtered;
  });

  // 함수들
  function changeTab(tabKey: string) {
    console.log("탭 변경 시도:", tabKey);
    activeTab = tabKey;
    console.log("탭 변경 완료:", activeTab);
  }

  function addToCart(course: Lecture) {
    console.log("addToCart 호출됨:", course.title);
    try {
      cart.update(items => {
        const exists = items.find(item => 
          item.courseId === course.courseId && item.classId === course.classId
        );
        if (!exists) {
          const newItems = [...items, { 
            courseId: course.courseId, 
            classId: course.classId, 
            method: "FCFS" as const
          }];
          console.log("장바구니에 추가됨:", course.title);
          return newItems;
        } else {
          console.log("이미 장바구니에 있음:", course.title);
          return items;
        }
      });
    } catch (error) {
      console.error("addToCart 오류:", error);
    }
  }

  function removeFromCart(course: Lecture) {
    console.log("removeFromCart 호출됨:", course.title);
    try {
      cart.update(items => {
        const newItems = items.filter(item => 
          !(item.courseId === course.courseId && item.classId === course.classId)
        );
        console.log("장바구니에서 제거됨:", course.title);
        return newItems;
      });
    } catch (error) {
      console.error("removeFromCart 오류:", error);
    }
  }
  
  function isInCart(course: Lecture): boolean {
    return $cart.some(item => 
      item.courseId === course.courseId && item.classId === course.classId
    );
  }

  function clearCart() {
    console.log("장바구니 전체삭제 호출됨");
    if (confirm('장바구니를 모두 비우시겠습니까?')) {
      cart.set([]);
      console.log("장바구니 비워짐");
    }
  }

  function viewCart() {
    console.log("장바구니 보기 호출됨");
    alert(`장바구니에 ${cartCourses.length}개의 강의가 있습니다.`);
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
          onclick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            changeTab(tab.key);
          }}
        >
          {tab.label} ({tab.count})
        </button>
      {/each}
    </div>
    

  </div>

  <!-- 강의 목록 -->
  <div class="flex-1 overflow-y-auto">
    <div class="p-3">
      {#if filteredCourses().length === 0}
        <div class="text-center text-gray-500 py-8">
          <div class="text-2xl mb-2">📚</div>
          <div class="text-sm">선택한 요일에 강의가 없습니다</div>
        </div>
      {:else}
        {#each filteredCourses() as course (course.courseId + course.classId)}
          <div class="mb-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors {
            isInCart(course) ? 'bg-green-50 border-green-200' : ''
          }">
            <!-- 과목 기본 정보 -->
            <div class="flex items-start justify-between mb-2">
              <div class="flex-1">
                <div class="font-medium text-gray-800 text-sm flex items-center gap-2">
                  {#if isInCart(course)}
                    <span class="text-green-500">✓</span>
                  {/if}
                  {course.title}
                </div>
                <div class="text-xs text-gray-500 mt-1 flex items-center gap-2">
                  <span>{course.courseId}</span>
                  <span class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{course.category}</span>
                  <span class="text-orange-600">{course.credits.lecture + course.credits.lab}학점</span>
                </div>
              </div>
              
              <!-- 추가/삭제 버튼 -->
              {#if isInCart(course)}
                <button 
                  type="button"
                  class="ml-2 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                  onclick={(e) => {
                    removeFromCart(course);
                  }}
                  title="장바구니에서 제거"
                >
                  제거
                </button>
              {:else}
                <button 
                  type="button"
                  class="ml-2 px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                  onclick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addToCart(course);
                  }}
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
                    `${["일","월","화","수","목","금","토"][s.day]} ${s.start}:00-${s.end}:00`
                  ).join(", ")}
                </span>
              </div>
              <div class="flex items-center gap-1">
                <span>🏠</span>
                <span>{course.schedule?.[0]?.building} {course.schedule?.[0]?.room}</span>
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>


</div>