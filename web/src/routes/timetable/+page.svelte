<script lang="ts">
  import type { Lecture } from "$lib/types";
  import { cart, applications, lectures } from "$lib/stores";
  type Block = { day: number; start: number; end: number; title: string };
  const blocks = $state<Block[]>([]);
  const days = ["월", "화", "수", "목", "금"];

  function hasOverlap(a: Block, b: Block) {
    return a.day === b.day && Math.max(a.start, b.start) < Math.min(a.end, b.end);
  }
  $effect(() => {
    // 장바구니와 신청내역을 기준으로 시간표 블록 구성 (더미)
    const data = $lectures;
    const selectedIds = new Set($applications.map((a) => `${a.courseId}-${a.classId}`));
    const cartIds = new Set($cart.map((c) => `${c.courseId}-${c.classId}`));
    const chosen = data.filter((l) => selectedIds.has(`${l.courseId}-${l.classId}`) || cartIds.has(`${l.courseId}-${l.classId}`));
    blocks.length = 0;
    blocks.push(
      ...chosen.flatMap((l) => l.schedule.map((m) => ({ day: m.day - 1, start: m.start, end: m.end, title: l.title })))
    );
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
      <div class="relative border rounded h-14 overflow-hidden">
        {#each blocks.filter(b => b.day === di && b.start-1 === i) as b}
          <div class="absolute inset-0 bg-blue-500/20 text-xs p-1">{b.title}</div>
        {/each}
      </div>
    {/each}
  {/each}
</div>


