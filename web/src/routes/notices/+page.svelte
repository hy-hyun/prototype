<script lang="ts">
  const pinned = [] as { id: string; title: string }[];
  const latest = [] as { id: string; title: string }[];
</script>

<h2 class="text-lg font-semibold mb-2">공지사항</h2>

<section class="grid gap-4">
  <div>
    <h3 class="font-medium">고정 공지</h3>
    {#if pinned.length === 0}
      <p class="text-sm text-neutral-500">고정 공지가 없습니다.</p>
    {/if}
  </div>

  <div>
    <h3 class="font-medium">최신 공지</h3>
    {#if latest.length === 0}
      <p class="text-sm text-neutral-500">공지 목록이 없습니다.</p>
    {/if}
  </div>
</section>


