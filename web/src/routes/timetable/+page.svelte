<script lang="ts">
  type Block = { day: number; start: number; end: number; title: string };
  let blocks: Block[] = [];
  const days = ["월", "화", "수", "목", "금"];

  function hasOverlap(a: Block, b: Block) {
    return a.day === b.day && Math.max(a.start, b.start) < Math.min(a.end, b.end);
  }
  $effect(() => {
    // 단순 중복 검출: blocks 배열 비어있으므로 현재는 경고 없음
  });
</script>

<h2 class="text-lg font-semibold mb-4">시간표</h2>

<div class="grid grid-cols-6 gap-2">
  <div></div>
  {#each days as d}
    <div class="text-center font-medium">{d}</div>
  {/each}

  {#each Array.from({ length: 10 }) as _, i}
    <div class="text-right pr-2 text-sm text-neutral-500">{i + 1}교시</div>
    {#each days as _, di}
      <div class="border rounded h-14"></div>
    {/each}
  {/each}
</div>


