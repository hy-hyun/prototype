<script lang="ts">
  type Lecture = {
    courseId: string;
    title: string;
    category: string;
    dept?: string;
    instructor?: string;
    credits?: { lecture: number; lab: number };
    method?: "FCFS" | "BID";
    keywords?: string[];
  };

  let keyword = "";
  let filters = { term: "", grade: "", org: "" };
  let results: Lecture[] = [];

  function search() {
    // DB 비어있음: 결과 없음 유지
    results = [];
  }
</script>

<h2 class="text-lg font-semibold mb-4">강의 검색</h2>

<form class="grid gap-3 md:grid-cols-4 mb-4" on:submit|preventDefault={search}>
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
  {/if}
</section>


