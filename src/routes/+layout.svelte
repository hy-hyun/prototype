<script lang="ts">
  import favicon from "$lib/assets/favicon.svg";
  import "../app.css";
  import { toasts } from "$lib/toast";
  import { isLoggedIn, currentUser, globalLoading, loadingText } from "$lib/stores";
  import LoginModal from "$lib/components/LoginModal.svelte";
  import Loading from "$lib/components/Loading.svelte";
  import { Button } from "$lib/components/ui/button";
  import { onMount } from 'svelte';
  import { auth } from '$lib/firebase';
  import { onAuthStateChanged } from 'firebase/auth';
  import {
    Megaphone,
    Search as SearchIcon,
    ClipboardList,
    CalendarDays,
    LayoutDashboard
  } from "@lucide/svelte";

  let { children } = $props();
  let showLoginModal = $state(false);

  // 컴포넌트가 마운트될 때 Firebase 인증 상태를 감시합니다.
  onMount(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 사용자가 로그인되어 있는 경우
        isLoggedIn.set(true);
        currentUser.set({
          id: user.uid,
          // user.displayName이 null일 경우를 대비해 기본값을 설정합니다.
          name: user.displayName || user.email || '사용자', 
        });
        console.log('🔒 인증 상태 변경: 로그인됨', user);
      } else {
        // 사용자가 로그아웃되어 있는 경우
        isLoggedIn.set(false);
        currentUser.set(null);
        console.log('🔒 인증 상태 변경: 로그아웃됨');
      }
    });

    // 컴포넌트가 파괴될 때 감시를 중단하여 메모리 누수를 방지합니다.
    return () => unsubscribe();
  });

  const navItems = [
    { href: "/notices", label: "공지사항", icon: Megaphone },
    { href: "/search", label: "강의검색", icon: SearchIcon },
    { href: "/enroll", label: "수강신청", icon: ClipboardList },
    { href: "/timetable", label: "시간표", icon: CalendarDays },
    { href: "/dashboard", label: "대시보드", icon: LayoutDashboard }
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
    <div class="flex items-center gap-4 sm:gap-6">
      {#each navItems as item}
        {@const Icon = item.icon}
        <Button
          variant="ghost"
          size="sm"
          class="text-gray-700 hover:text-hanyang-navy"
          href={item.href}
          aria-label={item.label}
        >
          <Icon class="size-4" />
          <span class="hidden sm:inline">{item.label}</span>
        </Button>
      {/each}

      {#if $isLoggedIn}
        <div class="flex items-center gap-3">
          <span class="text-sm hanyang-dark-gray">안녕하세요, <span class="font-semibold hanyang-navy">{$currentUser?.name}</span>님</span>
          <Button
            variant="outline"
            class="border-red-300 text-red-600 hover:bg-red-50"
            onclick={handleLogout}
          >
            로그아웃
          </Button>
        </div>
      {:else}
        <Button
          variant="default"
          class="bg-hanyang-navy hover:bg-hanyang-blue text-white"
          onclick={() => (showLoginModal = true)}
        >
          로그인
        </Button>
      {/if}
    </div>
  </div>
</nav>

<main class="mx-auto max-w-7xl p-6 bg-hanyang-gray/30 min-h-screen">
  <div class="bg-white rounded-2xl p-8 shadow-sm border border-hanyang-blue/10">
    {#if $globalLoading}
      <Loading fullscreen={false} text={$loadingText} size="lg" />
    {:else}
      {@render children?.()}
    {/if}
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
