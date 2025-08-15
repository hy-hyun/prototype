<script lang="ts">
  import { toastMessages, removeToast, confirmReplace } from "$lib/stores";
  import type { ToastMessage } from "$lib/types";

  // 시간 포맷팅 함수
  function formatTime(slot: number): string {
    const hour = 9 + Math.floor(slot / 2);
    const minute = (slot % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }

  function formatSchedule(schedule: any[]): string {
    if (!schedule || schedule.length === 0) return '';
    
    return schedule.map(s => {
      const dayName = ["일","월","화","수","목","금","토"][s.day % 7];
      const startTime = formatTime(s.start);
      const endTime = formatTime(s.end);
      return `${dayName} ${startTime}-${endTime}`;
    }).join(', ');
  }

  function formatLocation(schedule: any[]): string {
    if (!schedule || schedule.length === 0) return '';
    
    const locations = schedule
      .map(s => `${s.building || ''} ${s.room || ''}`.trim())
      .filter((v, i, a) => v && a.indexOf(v) === i);
    
    return locations.join(', ') || '위치 정보 없음';
  }

  function handleConfirmReplace(toast: ToastMessage) {
    if (toast.existingLecture && toast.newLecture) {
      confirmReplace(toast.id, toast.existingLecture, toast.newLecture);
    }
  }
</script>

<!-- Toast 컨테이너 -->
<div class="fixed top-4 right-4 z-50 space-y-2">
  {#each $toastMessages as toast (toast.id)}
    {#if toast.type === 'replace'}
      <!-- 교체 확인 Toast -->
      <div class="bg-white border border-orange-200 rounded-lg shadow-lg max-w-sm p-4 animate-in slide-in-from-right">
        <div class="text-sm font-semibold text-orange-800 mb-2 flex items-center gap-2">
          <span>⚠️</span>
          시간 중복 감지
        </div>
        
        <!-- 기존 → 새 강의 -->
        <div class="space-y-2 text-xs mb-3">
          <!-- 기존 강의 -->
          <div class="bg-red-50 border border-red-200 rounded p-2">
            <div class="text-red-700 font-medium flex items-center gap-1">
              <span>🗑️</span>
              {toast.existingLecture?.title}
            </div>
            <div class="text-red-600 mt-1 text-xs">
              {formatSchedule(toast.existingLecture?.schedule || [])}
            </div>
            <div class="text-red-500 text-xs">
              {formatLocation(toast.existingLecture?.schedule || [])}
            </div>
          </div>
          
          <!-- 화살표 -->
          <div class="text-center text-gray-400">⬇️</div>
          
          <!-- 새 강의 -->
          <div class="bg-green-50 border border-green-200 rounded p-2">
            <div class="text-green-700 font-medium flex items-center gap-1">
              <span>✅</span>
              {toast.newLecture?.title}
            </div>
            <div class="text-green-600 mt-1 text-xs">
              {formatSchedule(toast.newLecture?.schedule || [])}
            </div>
            <div class="text-green-500 text-xs">
              {formatLocation(toast.newLecture?.schedule || [])}
            </div>
          </div>
        </div>
        
        <!-- 버튼 -->
        <div class="flex gap-2">
          <button 
            onclick={() => removeToast(toast.id)}
            class="flex-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            취소
          </button>
          <button 
            onclick={() => handleConfirmReplace(toast)}
            class="flex-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            교체하기
          </button>
        </div>
      </div>
    {:else}
      <!-- 일반 Toast -->
      <div class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border max-w-sm animate-in slide-in-from-right {
        toast.type === 'success' ? 'bg-green-50 border-green-200' :
        toast.type === 'error' ? 'bg-red-50 border-red-200' :
        'bg-blue-50 border-blue-200'
      }">
        <div class="text-lg">
          {toast.type === 'success' ? '🎉' :
           toast.type === 'error' ? '❌' : 'ℹ️'}
        </div>
        <div class="flex-1 text-sm font-medium {
          toast.type === 'success' ? 'text-green-800' :
          toast.type === 'error' ? 'text-red-800' :
          'text-blue-800'
        }">
          {toast.message}
        </div>
        <button 
          onclick={() => removeToast(toast.id)}
          class="text-gray-400 hover:text-gray-600 transition-colors text-sm"
          title="닫기"
        >
          ✕
        </button>
      </div>
    {/if}
  {/each}
</div>

<style>
  @keyframes slide-in-from-right {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .animate-in {
    animation: slide-in-from-right 0.3s ease-out;
  }
</style>