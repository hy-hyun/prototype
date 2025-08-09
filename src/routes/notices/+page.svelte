<script lang="ts">
  import { notices } from "$lib/stores";
  import { derived } from "svelte/store";
  const pinned = derived(notices, ($n) => $n.filter((x) => x.pinned));
  const latest = derived(notices, ($n) => $n.filter((x) => !x.pinned));
</script>

<h2 class="text-lg font-semibold mb-2">공지사항</h2>

<section class="grid gap-4">
  <div>
    <h3 class="font-medium">고정 공지</h3>
    {#if $pinned.length === 0}
      <p class="text-sm text-neutral-500">고정 공지가 없습니다.</p>
    {:else}
      <ul class="list-disc pl-5">
        {#each $pinned as n}
          <li>{n.title}</li>
        {/each}
      </ul>
    {/if}
  </div>

  <div>
    <h3 class="font-medium">최신 공지</h3>
    {#if $latest.length === 0}
      <p class="text-sm text-neutral-500">공지 목록이 없습니다.</p>
    {:else}
      <ul class="list-disc pl-5">
        {#each $latest as n}
          <li>{n.title}</li>
        {/each}
      </ul>
    {/if}
  </div>
</section>


