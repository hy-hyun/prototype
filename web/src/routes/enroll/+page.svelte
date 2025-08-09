<script lang="ts">
  let activeTab: "FCFS" | "BID" = "FCFS";
  let view: "cart" | "applications" = "cart";
  const metrics = { min: 0, max: 0, current: 0, budget: 0 };
</script>

<h2 class="text-lg font-semibold mb-4">수강신청</h2>

<div class="flex justify-between items-center mb-3">
  <div class="flex gap-2">
    <button class="border rounded px-3 py-1 text-sm" on:click={() => (view = "cart")}>장바구니</button>
    <button class="border rounded px-3 py-1 text-sm" on:click={() => (view = "applications")}>신청내역</button>
  </div>
  <div class="text-sm text-neutral-600 dark:text-neutral-400">
    최소 {metrics.min} / 최대 {metrics.max} / 신청 {metrics.current} / 잔여 베팅 {metrics.budget}
  </div>
</div>

{#if view === "cart"}
  <div class="flex gap-2 mb-3">
    <button class="border rounded px-3 py-1 text-sm" on:click={() => (activeTab = "FCFS")}>선착순</button>
    <button class="border rounded px-3 py-1 text-sm" on:click={() => (activeTab = "BID")}>베팅</button>
  </div>
  <p class="text-sm text-neutral-500">장바구니가 비었습니다.</p>
{:else}
  <p class="text-sm text-neutral-500">신청내역이 없습니다.</p>
{/if}


