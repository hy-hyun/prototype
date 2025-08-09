<script lang="ts">
  import favicon from "$lib/assets/favicon.svg";
  import "../app.css";
  import { toasts } from "$lib/toast";
  import { isLoggedIn, currentUser } from "$lib/stores";
  import LoginModal from "$lib/components/LoginModal.svelte";
  
  let { children } = $props();
  let showLoginModal = $state(false);
  
  const navItems = [
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

<nav class="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-hanyang-blue/20 shadow-sm">
  <div class="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
    <a class="text-2xl font-bold hanyang-navy hover:hanyang-blue transition-colors duration-200" href="/">
      HY-PATH
      <span class="text-sm font-normal hanyang-blue block -mt-1">한양대학교 수강신청 시스템</span>
    </a>
    <div class="flex items-center gap-8">
      {#each navItems as item}
        <a class="flex items-center gap-2 text-sm font-medium text-gray-700 hover:hanyang-navy transition-colors duration-200" href={item.href}>
          <span class="text-base">{item.icon}</span>
          <span class="hidden sm:inline">{item.label}</span>
        </a>
      {/each}
      
      {#if $isLoggedIn}
        <div class="flex items-center gap-3">
          <span class="text-sm hanyang-dark-gray">안녕하세요, <span class="font-semibold hanyang-navy">{$currentUser?.name}</span>님</span>
          <button 
            onclick={handleLogout}
            class="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 font-medium"
          >
            로그아웃
          </button>
        </div>
      {:else}
        <button 
          onclick={() => showLoginModal = true}
          class="rounded-lg bg-hanyang-navy px-4 py-2 text-sm text-white hover:bg-hanyang-blue transition-colors duration-200 font-medium"
        >
          로그인
        </button>
      {/if}
    </div>
  </div>
</nav>

<main class="mx-auto max-w-7xl p-6 bg-hanyang-gray/30 min-h-screen">
  <div class="bg-white rounded-2xl p-8 shadow-sm border border-hanyang-blue/10">
    {@render children?.()}
  </div>
</main>

<!-- Login Modal -->
<LoginModal bind:isOpen={showLoginModal} />

<!-- Toasts -->
<div class="fixed bottom-6 right-6 grid gap-3 z-50">
  {#each $toasts as t}
    <div class="rounded-xl border-2 px-4 py-3 text-sm shadow-lg bg-white font-medium {t.type === 'success' ? 'border-green-300 text-green-700' : t.type === 'error' ? 'border-red-300 text-red-700' : 'border-hanyang-blue text-hanyang-navy'}">
      {t.message}
    </div>
  {/each}
</div>
