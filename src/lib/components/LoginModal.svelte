<script lang="ts">
  import { loginUser, userDataLoading } from "$lib/stores";
  import { migrateKimMinwooData } from "$lib/firestore";
  import { showToast } from "$lib/toast";
  
  let { isOpen = $bindable(false) } = $props();
  let studentId = $state("");
  let password = $state("");
  let rememberMe = $state(false);
  let isLoading = $state(false);
  
  async function handleMigration() {
    try {
      isLoading = true;
      await migrateKimMinwooData();
      showToast("김민우 학생 데이터로 Firestore를 업데이트했습니다. 다시 로그인해주세요.", "success");
    } catch (error) {
      console.error("데이터 마이그레이션 실패:", error);
      showToast("데이터 업데이트에 실패했습니다.", "error");
    } finally {
      isLoading = false;
    }
  }

  async function handleLogin() {
    if (!studentId.trim()) {
      showToast("학번을 입력해주세요", "error");
      return;
    }
    
    // 비밀번호는 현재 검증하지 않음 (간단한 로그인)
    if (!password.trim()) {
      showToast("비밀번호를 입력해주세요", "error");
      return;
    }
    
    try {
      isLoading = true;
      
      // 🔥 실제 Firestore 로그인
      const success = await loginUser(studentId.trim());
      
      if (success) {
        showToast("로그인 성공!", "success");
        
        // 모달 닫기 및 입력 초기화
        isOpen = false;
        studentId = "";
        password = "";
        rememberMe = false;
      } else {
        showToast("로그인에 실패했습니다", "error");
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      showToast("로그인 중 오류가 발생했습니다", "error");
    } finally {
      isLoading = false;
    }
  }
  
  function handleClose() {
    isOpen = false;
    studentId = "";
    password = "";
    rememberMe = false;
  }

  function handleOverlayClick(e: MouseEvent) {
    if (e.currentTarget === e.target) {
      handleClose();
    }
  }
</script>

{#if isOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    onclick={handleOverlayClick}
    onkeydown={(e) => e.key === 'Escape' && handleClose()}
  >
    <div
      class="bg-white dark:bg-neutral-900 rounded-lg p-6 w-full max-w-md mx-4"
      role="document"
    >
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">로그인</h2>
        <button class="text-neutral-500 hover:text-neutral-700" onclick={handleClose} aria-label="닫기">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <form onsubmit={(e) => { e.preventDefault(); handleLogin(); }} class="space-y-4">
        <div>
          <label for="studentId-input" class="block text-sm font-medium mb-1">학번</label>
          <input 
            id="studentId-input"
            type="text" 
            bind:value={studentId}
            disabled={isLoading || $userDataLoading}
            class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            placeholder="학번을 입력하세요 (예: 2024123456)"
          />
        </div>
        
        <div>
          <label for="password-input" class="block text-sm font-medium mb-1">비밀번호</label>
          <input 
            id="password-input"
            type="password" 
            bind:value={password}
            disabled={isLoading || $userDataLoading}
            class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            placeholder="비밀번호를 입력하세요"
          />
        </div>
        
        <div class="flex items-center">
          <input 
            type="checkbox" 
            bind:checked={rememberMe} 
            disabled={isLoading || $userDataLoading}
            class="mr-2" 
            id="remember" 
          />
          <label for="remember" class="text-sm">학번 저장</label>
        </div>
        
        <!-- 🔥 로딩 상태 표시 -->
        {#if isLoading || $userDataLoading}
          <div class="text-center text-sm text-blue-600">
            로그인 중...
          </div>
        {/if}
        
        <div class="flex gap-2">
          <button 
            type="submit"
            disabled={isLoading || $userDataLoading}
            class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading || $userDataLoading ? '로그인 중...' : '확인'}
          </button>
          <button 
            type="button"
            onclick={handleClose}
            disabled={isLoading || $userDataLoading}
            class="flex-1 border border-neutral-300 py-2 px-4 rounded-md hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500 disabled:opacity-50"
          >
            취소
          </button>
        </div>
      </form>

      <!-- 개발용 데이터 마이그레이션 버튼 -->
      <div class="mt-4 pt-4 border-t border-gray-200">
        <p class="text-xs text-gray-500 mb-2">
          [개발용] '김민우' 학생(3학년) 데이터가 아니거나 학년 정보가 올바르지 않은 경우, 아래 버튼을 눌러 Firestore 데이터를 덮어쓴 후 다시 로그인해주세요.
        </p>
        <button 
          type="button"
          onclick={handleMigration}
          disabled={isLoading || $userDataLoading}
          class="w-full bg-yellow-500 text-white py-2 px-4 rounded-md text-sm hover:bg-yellow-600 disabled:opacity-50"
        >
          '2021075178' 데이터 덮어쓰기
        </button>
      </div>
    </div>
  </div>
{/if}

