<script lang="ts">
  import type { Lecture } from "$lib/types";
  import { lectures, addToCart, applyFcfs, applyBid } from "$lib/stores";
  import { showToast } from "$lib/toast";
  import { get } from "svelte/store";

  let keyword = "";
  let filters = { term: "", grade: "", org: "" };
  let results: Lecture[] = [];

  function search() {
    const kw = keyword.trim().toLowerCase();
    const hasTag = kw.startsWith("#") ? kw.slice(1) : "";
    const data = get(lectures);
    results = data.filter((l) => {
      const textMatch = !kw || l.title.toLowerCase().includes(kw);
      const tagMatch = !hasTag || l.keywords?.some((k) => k.toLowerCase().includes(hasTag));
      return textMatch || tagMatch;
    });
  }

  function onAddToCart(l: Lecture) {
    addToCart({ courseId: l.courseId, classId: l.classId, method: l.method ?? "FCFS" });
    showToast("장바구니에 담았습니다", "success");
  }

  function onApply(l: Lecture) {
    if ((l.method ?? "FCFS") === "FCFS") applyFcfs(l.courseId, l.classId);
    else applyBid(l.courseId, l.classId, 10);
    showToast("신청을 진행했습니다", "info");
  }
</script>

<h2 class="text-lg font-semibold mb-4">강의 검색</h2>

<form class="grid gap-3 md:grid-cols-4 mb-4" onsubmit={(e) => { e.preventDefault(); search(); }}>
  <select class="border rounded p-2" bind:value={filters.term}>
    <option value="">학기</option>
  </select>
  <select class="border rounded p-2" bind:value={filters.grade}>
    <option value="">학년</option>
  </select>
  <select class="border rounded p-2" bind:value={filters.org}>
    <option value="">조직</option>
  </select>
  <div class="flex gap-2">
    <input class="border rounded p-2 flex-1" placeholder="강의명 또는 #키워드" bind:value={keyword} />
    <button class="border rounded px-4">검색</button>
  </div>
</form>

<section class="grid gap-3">
  {#if results.length === 0}
    <p class="text-sm text-neutral-500">검색 결과가 없습니다.</p>
  {:else}
    {#each results as l}
      <div class="rounded border p-3 flex items-center justify-between">
        <div>
          <div class="font-medium">{l.title}</div>
          <div class="text-xs text-neutral-500">{l.category} · {l.dept} · {l.instructor}</div>
          <div class="text-xs text-neutral-500">{l.credits.lecture}+{l.credits.lab}학점 · {l.method}</div>
        </div>
        <div class="flex gap-2">
          <button class="border rounded px-2 py-1 text-sm" onclick={() => onAddToCart(l)}>장바구니</button>
          <button class="border rounded px-2 py-1 text-sm" onclick={() => onApply(l)}>강의신청</button>
        </div>
      </div>
    {/each}
  {/if}
</section>


