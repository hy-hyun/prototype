<script lang="ts">
  import favicon from "$lib/assets/favicon.svg";
  import "../app.css";
  let { children } = $props();
  const navItems = [
    { href: "/", label: "홈" },
    { href: "/notices", label: "공지사항" },
    { href: "/search", label: "강의검색" },
    { href: "/enroll", label: "수강신청" },
    { href: "/timetable", label: "시간표" },
    { href: "/dashboard", label: "대시보드" }
  ];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav class="sticky top-0 z-50 bg-white/70 dark:bg-neutral-900/70 backdrop-blur border-b border-neutral-200 dark:border-neutral-800">
  <div class="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
    <a class="font-semibold" href="/">hy-path</a>
    <div class="flex items-center gap-4">
      {#each navItems as item}
        <a class="text-sm hover:underline" href={item.href}>{item.label}</a>
      {/each}
      <button class="rounded-md border px-3 py-1 text-sm">로그인</button>
    </div>
  </div>
</nav>

<main class="mx-auto max-w-7xl p-4">
  {@render children?.()}
  </main>
