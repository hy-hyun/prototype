<script lang="ts">
  import { isLoggedIn, currentUser } from "$lib/stores";
  import { showToast } from "$lib/toast";
  
  let { isOpen = $bindable(false) } = $props();
  let username = $state("");
  let password = $state("");
  let rememberMe = $state(false);
  
  function handleLogin() {
    if (!username.trim() || !password.trim()) {
      showToast("아이디와 비밀번호를 입력해주세요", "error");
      return;
    }
    
    // 목 로그인 성공 처리
    isLoggedIn.set(true);
    currentUser.set({ id: username, name: "학생" + username });
    showToast("로그인 성공!", "success");
    
    // 모달 닫기 및 입력 초기화
    isOpen = false;
    username = "";
    password = "";
    rememberMe = false;
  }
  
  function handleClose() {
    isOpen = false;
    username = "";
    password = "";
    rememberMe = false;
  }
</script>

{#if isOpen}
  <div 
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" 
    role="dialog" 
    aria-modal="true" 
    tabindex="-1"
    onclick={handleClose} 
    onkeydown={(e) => e.key === 'Escape' && handleClose()}
  >
    <div 
      class="bg-white dark:bg-neutral-900 rounded-lg p-6 w-full max-w-md mx-4" 
      role="document" 
      onclick={(e) => e.stopPropagation()}
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
          <label for="username-input" class="block text-sm font-medium mb-1">아이디</label>
          <input 
            id="username-input"
            type="text" 
            bind:value={username}
            class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="아이디를 입력하세요"
          />
        </div>
        
        <div>
          <label for="password-input" class="block text-sm font-medium mb-1">비밀번호</label>
          <input 
            id="password-input"
            type="password" 
            bind:value={password}
            class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="비밀번호를 입력하세요"
          />
        </div>
        
        <div class="flex items-center">
          <input type="checkbox" bind:checked={rememberMe} class="mr-2" id="remember" />
          <label for="remember" class="text-sm">아이디 저장</label>
        </div>
        
        <div class="flex gap-2">
          <button 
            type="submit"
            class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            확인
          </button>
          <button 
            type="button"
            onclick={handleClose}
            class="flex-1 border border-neutral-300 py-2 px-4 rounded-md hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500"
          >
            취소
          </button>
        </div>
        
        <div class="text-center">
          <button type="button" class="text-sm text-blue-600 hover:underline">
            아이디/비밀번호 찾기
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

