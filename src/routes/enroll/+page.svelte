<script lang="ts">
  import { cart, applications, metrics } from "$lib/stores";
  import { addToCart, applyFcfs, applyBid } from "$lib/stores";
  import { get } from "svelte/store";
  let activeTab: "FCFS" | "BID" = "FCFS";
  let view: "cart" | "applications" = "cart";

  function doApply(item: { courseId: string; classId: string; method: "FCFS" | "BID" }) {
    if (item.method === "FCFS") applyFcfs(item.courseId, item.classId);
    else applyBid(item.courseId, item.classId, 10);
  }
</script>

<h2 class="text-lg font-semibold mb-4">수강신청</h2>

<div class="flex justify-between items-center mb-3">
  <div class="flex gap-2">
    <button class="border rounded px-3 py-1 text-sm" onclick={() => (view = "cart")}>장바구니</button>
    <button class="border rounded px-3 py-1 text-sm" onclick={() => (view = "applications")}>신청내역</button>
  </div>
  <div class="text-sm text-neutral-600 dark:text-neutral-400">
    최소 {$metrics.min} / 최대 {$metrics.max} / 신청 {$metrics.current} / 잔여 베팅 {$metrics.budget}
  </div>
</div>

{#if view === "cart"}
  <div class="flex gap-2 mb-3">
    <button class="border rounded px-3 py-1 text-sm" onclick={() => (activeTab = "FCFS")}>선착순</button>
    <button class="border rounded px-3 py-1 text-sm" onclick={() => (activeTab = "BID")}>베팅</button>
  </div>
  {#if $cart.length === 0}
    <p class="text-sm text-neutral-500">장바구니가 비었습니다.</p>
  {:else}
    <ul class="grid gap-2">
      {#each $cart.filter(x => x.method === activeTab) as item}
        <li class="rounded border p-3 flex items-center justify-between">
          <div class="text-sm">{item.courseId}-{item.classId} ({item.method})</div>
          <div class="flex gap-2">
            {#if item.method === 'BID'}
              <button class="border rounded px-2 py-1 text-sm" onclick={() => doApply(item)}>베팅 신청</button>
            {:else}
              <button class="border rounded px-2 py-1 text-sm" onclick={() => doApply(item)}>신청</button>
            {/if}
          </div>
        </li>
      {/each}
    </ul>
  {/if}
{:else}
  {#if $applications.length === 0}
    <p class="text-sm text-neutral-500">신청내역이 없습니다.</p>
  {:else}
    <ul class="grid gap-2">
      {#each $applications as a}
        <li class="rounded border p-3 text-sm">
          {a.courseId}-{a.classId}: {a.status}
        </li>
      {/each}
    </ul>
  {/if}
{/if}


