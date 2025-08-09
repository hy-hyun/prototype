<script lang="ts">
  const features = [
    { title: "수강신청 일정 요약", desc: "학사 캘린더 요약을 카드로 확인" },
    { title: "최신 공지", desc: "고정 2 + 최신 3" },
    { title: "강의검색", desc: "필터/키워드로 과목 탐색" }
  ];
</script>

<section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {#each features as f}
    <div class="rounded-lg border p-4">
      <h3 class="font-semibold">{f.title}</h3>
      <p class="text-sm text-neutral-600 dark:text-neutral-400">{f.desc}</p>
    </div>
  {/each}
</section>
