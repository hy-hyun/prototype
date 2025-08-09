<script lang="ts">
  import favicon from "$lib/assets/favicon.svg";
  import "../app.css";
  import { toasts } from "$lib/toast";
  import { isLoggedIn, currentUser } from "$lib/stores";
  import LoginModal from "$lib/components/LoginModal.svelte";
  
  let { children } = $props();
  let showLoginModal = $state(false);
  
  const navItems = [
    { href: "/", label: "홈", icon: "🏠" },
    { href: "/notices", label: "공지사항", icon: "📢" },
    { href: "/search", label: "강의검색", icon: "🔍" },
    { href: "/enroll", label: "수강신청", icon: "📝" },
    { href: "/timetable", label: "시간표", icon: "📅" },
    { href: "/dashboard", label: "대시보드", icon: "📊" }
  ];
  
  function handleLogout() {
    isLoggedIn.set(false);
    currentUser.set(null);
  }
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav class="sticky top-0 z-40 bg-white/90 dark:bg-neutral-900/90 backdrop-blur border-b border-neutral-200 dark:border-neutral-800">
  <div class="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
    <a class="text-xl font-bold text-blue-600" href="/">hy-path</a>
    <div class="flex items-center gap-6">
      {#each navItems as item}
        <a class="flex items-center gap-1 text-sm hover:text-blue-600 transition-colors" href={item.href}>
          <span>{item.icon}</span>
          <span class="hidden sm:inline">{item.label}</span>
        </a>
      {/each}
      
      {#if $isLoggedIn}
        <div class="flex items-center gap-2">
          <span class="text-sm text-neutral-600">안녕하세요, {$currentUser?.name}님</span>
          <button 
            onclick={handleLogout}
            class="rounded-md border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
          >
            로그아웃
          </button>
        </div>
      {:else}
        <button 
          onclick={() => showLoginModal = true}
          class="rounded-md border border-blue-300 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50"
        >
          로그인
        </button>
      {/if}
    </div>
  </div>
</nav>

<main class="mx-auto max-w-7xl p-4">
  {@render children?.()}
  </main>

<!-- Login Modal -->
<LoginModal bind:isOpen={showLoginModal} />

<!-- Toasts -->
<div class="fixed bottom-4 right-4 grid gap-2 z-50">
  {#each $toasts as t}
    <div class="rounded border px-3 py-2 text-sm shadow bg-white dark:bg-neutral-900 {t.type === 'success' ? 'border-green-300 text-green-700' : t.type === 'error' ? 'border-red-300 text-red-700' : 'border-blue-300 text-blue-700'}">
      {t.message}
    </div>
  {/each}
</div>
