<script lang="ts">
  import { cart, applications, metrics, isLoggedIn } from "$lib/stores";
  import { courses, loadCourses } from "$lib/stores";
  import { applyFcfs, applyBid } from "$lib/stores";
  import { showToast } from "$lib/toast";
  import LoginModal from "$lib/components/LoginModal.svelte";
  import { Tabs, TabsList, TabsTrigger, TabsContent } from "$lib/components/ui/tabs";
  import { Switch } from "$lib/components/ui/switch";
  import { get } from "svelte/store";
  import { onMount } from "svelte";
  let view: "cart" | "applications" = "cart";
  let showFcfs = true;
  let showBid = true;
  let applying = false;
  let loginOpen = false;
  let statusFilter: "ALL" | "PENDING" | "CONFIRMED" | "FAILED" | "CANCELLED" = "ALL";

  // 데이터 로딩은 +layout.ts에서 전역으로 처리하므로 이 코드는 제거합니다.

  async function doApply(item: { courseId: string; classId: string; method: "FCFS" | "BID"; bidAmount?: number }) {
    if (!$isLoggedIn) {
      loginOpen = true;
      showToast("로그인이 필요합니다", "error");
      return;
    }
    // 신청내역과 시간 충돌 시 차단
    if (conflictsWithApplications(item.courseId, item.classId)) {
      showToast("이미 신청된 강의와 시간이 겹쳐 신청할 수 없습니다", "error");
      return;
    }
    if (item.method === "FCFS") {
      await applyFcfs(item.courseId, item.classId);
      return;
    }
    const amount = item.bidAmount ?? 0;
    if (amount <= 0) {
      showToast("베팅 금액을 입력하세요", "error");
      return;
    }
    if ($metrics.budget < 0) {
      showToast("베팅 예산을 초과했습니다", "error");
      return;
    }
    await applyBid(item.courseId, item.classId, amount);
  }

  async function applyCurrentTabAll() {
    if (!$isLoggedIn) {
      loginOpen = true;
      showToast("로그인이 필요합니다", "error");
      return;
    }
    const items = get(cart).filter(
      (x) => (showFcfs && x.method === "FCFS") || (showBid && x.method === "BID")
    );
    // 동일 과목 중복 베팅 제거(규칙상 금지)
    const seenCourse = new Set<string>();
    const deduped = items.filter((x) => {
      if (x.method !== "BID") return true;
      if (seenCourse.has(x.courseId)) return false;
      seenCourse.add(x.courseId);
      return true;
    });
    const invalid = items.filter((x) => x.method === "BID" && (!x.bidAmount || x.bidAmount <= 0));
    const valid = deduped.filter((x) => !invalid.includes(x));
    if (valid.length === 0) {
      showToast("신청할 항목이 없습니다", "info");
      return;
    }
    applying = true;
    try {
      await applyMany(valid);
      const skipped = invalid.length + (items.length - deduped.length);
      if (skipped > 0) showToast(`${skipped}개 항목은 규칙 위반/금액 없음으로 건너뜀`, "error");
      else showToast("신청을 완료했습니다", "success");
    } finally {
      applying = false;
    }
  }

  // 로컬: 장바구니 조작/도우미들 (스토어 수정 없이 페이지에서만 처리)
  function removeFromCart(courseId: string, classId: string) {
    cart.update((c) => c.filter((x) => !(x.courseId === courseId && x.classId === classId)));
  }

  function setBidAmount(courseId: string, classId: string, bidAmount: number) {
    cart.update((c) =>
      c.map((x) => (x.courseId === courseId && x.classId === classId ? { ...x, bidAmount } : x))
    );
  }

  async function applyMany(items: Array<{ courseId: string; classId: string; method: "FCFS" | "BID"; bidAmount?: number }>) {
    for (const it of items) {
      if (it.method === "FCFS") await Promise.resolve(applyFcfs(it.courseId, it.classId));
      else await Promise.resolve(applyBid(it.courseId, it.classId, it.bidAmount ?? 0));
    }
  }

  function findLecture(courseId: string, classId: string) {
    return get(courses).find((l) => l.courseId === courseId && l.classId === classId);
  }

  function computeCredits(courseId: string, classId: string) {
    const lec = findLecture(courseId, classId);
    if (!lec) return 0;
    return (lec.credits?.lecture ?? 0) + (lec.credits?.lab ?? 0);
  }

  function formatSchedule(courseId: string, classId: string) {
    const lec = findLecture(courseId, classId);
    if (!lec) return "";
    const dayMap = ["월", "화", "수", "목", "금", "토", "일"];
    return lec.schedule
      .map((s) => `${dayMap[(s.day - 1) % 7]} ${s.start}-${s.end}${s.building ? ` @${s.building}-${s.room ?? ''}` : ''}`)
      .join(", ");
  }

  function countBidSameCourse(courseId: string) {
    return get(cart).filter((x) => x.method === "BID" && x.courseId === courseId).length;
  }

  function otherBidSpent(courseId: string, classId: string) {
    return get(cart)
      .filter((x) => x.method === "BID" && !(x.courseId === courseId && x.classId === classId))
      .reduce((sum, x) => sum + (x.bidAmount ?? 0), 0);
  }

  // 더미: 전년도 당첨 베팅 최저/중위값 생성기(항목별 결정적 난수)
  function hashString(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = (hash * 31 + input.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
  }

  function seededInt(seed: string, min: number, max: number): number {
    const base = hashString(seed) % 10000; // 0..9999
    const r = base / 10000; // 0..1
    return Math.floor(min + r * (max - min + 1));
  }

  function getBidStats(courseId: string, classId: string): { minWin: number; medianWin: number } {
    const key = `${courseId}-${classId}`;
    const minWin = seededInt(key + ":min", 8, 18);
    const medianBase = seededInt(key + ":med", 12, 28);
    const medianWin = Math.max(minWin, medianBase);
    return { minWin, medianWin };
  }

  function handleBidInput(e: Event, item: { courseId: string; classId: string }) {
    const target = e.currentTarget as HTMLInputElement;
    let val = parseInt(target.value || "0", 10);
    if (isNaN(val)) val = 0;
    val = Math.max(0, val);
    const spentOthers = otherBidSpent(item.courseId, item.classId);
    const maxAllowed = Math.max(0, 100 - spentOthers);
    if (val > maxAllowed) {
      val = maxAllowed;
      showToast("예산 한도를 초과할 수 없습니다", "error");
    }
    setBidAmount(item.courseId, item.classId, val);
  }

  function cancelApp(a: { courseId: string; classId: string }) {
    applications.update((list) => list.filter((x) => !(x.courseId === a.courseId && x.classId === a.classId)));
  }

  // 시간 충돌 검사 (페이지 로컬)
  function schedulesOverlap(
    a: { day: number; start: number; end: number },
    b: { day: number; start: number; end: number }
  ) {
    return a.day === b.day && Math.max(a.start, b.start) < Math.min(a.end, b.end);
  }

  function hasTimeConflict(courseId: string, classId: string): boolean {
    const allLectures = get(courses);
    const target = findLecture(courseId, classId);
    if (!target) return false;
    const cartItems = get(cart);
    const appItems = get(applications).filter((a) => a.status !== "CANCELLED");
    const others = [
      ...cartItems.filter((c) => !(c.courseId === courseId && c.classId === classId)),
      ...appItems,
    ]
      .map((x) => allLectures.find((l) => l.courseId === x.courseId && l.classId === x.classId))
      .filter(Boolean) as Array<ReturnType<typeof findLecture>>;
    return others.some((lec: any) =>
      lec.schedule.some((s: any) => target.schedule.some((t) => schedulesOverlap(s, t)))
    );
  }

  function conflictsWithApplications(courseId: string, classId: string): boolean {
    const allLectures = get(courses);
    const target = findLecture(courseId, classId);
    if (!target) return false;
    const appItems = get(applications).filter((a) => a.status !== "CANCELLED");
    const appliedLectures = appItems
      .map((x) => allLectures.find((l) => l.courseId === x.courseId && l.classId === x.classId))
      .filter(Boolean) as Array<ReturnType<typeof findLecture>>;
    return appliedLectures.some((lec: any) =>
      lec.schedule.some((s: any) => target.schedule.some((t) => schedulesOverlap(s, t)))
    );
  }

  // 로컬 베팅 예산 잔액 표시용
  $: bidSpent = $cart.filter(x => x.method === 'BID').reduce((sum, x) => sum + (x.bidAmount ?? 0), 0);
  $: bidBudget = Math.max(0, 100 - bidSpent);

  function isApplied(courseId: string, classId: string): boolean {
    return get(applications).some((a) => a.courseId === courseId && a.classId === classId);
  }
</script>

<h2 class="text-lg font-semibold mb-4">수강신청</h2>

<Tabs bind:value={view} class="w-full">
  <div class="flex justify-between items-center mb-3">
    <TabsList>
      <TabsTrigger value="cart">장바구니</TabsTrigger>
      <TabsTrigger value="applications">신청내역</TabsTrigger>
    </TabsList>
    <div class="text-sm text-neutral-600 dark:text-neutral-400">
      최소 {$metrics.min} / 최대 {$metrics.max} / 신청 {$metrics.current} / 잔여 베팅 {bidBudget}
    </div>
  </div>

  <TabsContent value="cart">
    <div class="flex justify-between items-center gap-2 mb-3">
      <div class="flex items-center gap-4">
        <label class="flex items-center gap-2 text-sm">
          <Switch bind:checked={showFcfs} />
          <span>선착순</span>
        </label>
        <label class="flex items-center gap-2 text-sm">
          <Switch bind:checked={showBid} />
          <span>베팅</span>
        </label>
      </div>
      <button class="border rounded px-3 py-1 text-sm disabled:opacity-50" disabled={applying || $cart.filter(x => (showFcfs && x.method==='FCFS') || (showBid && x.method==='BID')).length === 0} on:click={applyCurrentTabAll}>
        표시 항목 전체 신청
      </button>
    </div>
    {#if $cart.length === 0}
      <p class="text-sm text-neutral-500">장바구니가 비었습니다.</p>
    {:else}
      <ul class="grid gap-2">
        {#each $cart.filter(x => (showFcfs && x.method === 'FCFS') || (showBid && x.method === 'BID')) as item}
          <li class="rounded border p-3 flex items-center justify-between gap-3">
            <div class="text-sm flex-1">
              <div class="font-medium">
                {#if findLecture(item.courseId, item.classId)}
                  {findLecture(item.courseId, item.classId)?.title}
                {:else}
                  {item.courseId}-{item.classId}
                {/if}
              </div>
              <div class="text-xs text-neutral-500">
                {computeCredits(item.courseId, item.classId)}학점 · {formatSchedule(item.courseId, item.classId)}
              </div>
              <div class="mt-1 flex flex-wrap gap-1 text-[11px]">
                {#if hasTimeConflict(item.courseId, item.classId)}
                  <span class="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">시간 충돌</span>
                {/if}
                {#if item.method === 'BID' && countBidSameCourse(item.courseId) > 1}
                  <span class="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">동일과목 중복베팅</span>
                {/if}
              </div>
            </div>
            {#if item.method === 'BID'}
              <div class="flex items-center gap-2">
                <div class="relative group text-[11px] text-neutral-500 whitespace-nowrap">
                  작년 컷: 최저 {getBidStats(item.courseId, item.classId).minWin} · 중위 {getBidStats(item.courseId, item.classId).medianWin}
                  <button type="button" class="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full border border-neutral-300 text-neutral-500 bg-white select-none cursor-help" aria-label="설명">i</button>
                  <div role="tooltip" class="absolute z-10 left-1/2 -translate-x-1/2 mt-1 w-64 p-2 text-[11px] leading-snug bg-neutral-800 text-white rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                    전년도 배팅 당첨자의 참고 통계입니다.
                  </div>
                </div>
                <input class="border rounded px-2 py-1 w-24 text-sm" type="number" min="1" step="1" placeholder="베팅" value={item.bidAmount ?? ''} on:input={(e) => handleBidInput(e, item)} />
                <button class="border rounded px-2 py-1 text-sm disabled:opacity-50" on:click={() => doApply(item)} disabled={!item.bidAmount || item.bidAmount <= 0 || countBidSameCourse(item.courseId) > 1}>
                  베팅 신청
                </button>
              </div>
            {:else}
              {#if isApplied(item.courseId, item.classId)}
                <button class="border rounded px-2 py-1 text-sm opacity-60 cursor-default" disabled>신청 완료</button>
              {:else}
                <button class="border rounded px-2 py-1 text-sm" on:click={() => doApply(item)}>신청</button>
              {/if}
            {/if}
            <button class="border rounded px-2 py-1 text-sm" on:click={() => removeFromCart(item.courseId, item.classId)}>장바구니 해제</button>
          </li>
        {/each}
      </ul>
    {/if}
  </TabsContent>

  <TabsContent value="applications">
    <div class="flex items-center justify-between mb-3">
      <div class="text-sm">신청내역</div>
      <select class="border rounded p-1 text-sm" bind:value={statusFilter}>
        <option value="ALL">전체</option>
        <option value="PENDING">대기</option>
        <option value="CONFIRMED">확정</option>
        <option value="CANCELLED">취소</option>
      </select>
    </div>
    {#if $applications.length === 0}
      <p class="text-sm text-neutral-500">신청내역이 없습니다.</p>
    {:else}
      <ul class="grid gap-2">
        {#each $applications.filter(a => statusFilter === 'ALL' ? true : a.status === statusFilter) as a}
          <li class="rounded border p-3 text-sm flex items-center justify-between">
            <div>
              <div class="font-medium">{findLecture(a.courseId, a.classId)?.title || `${a.courseId}-${a.classId}`}</div>
              <div class="text-xs text-neutral-500">{a.courseId}-{a.classId} · {formatSchedule(a.courseId, a.classId)}</div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs px-2 py-1 rounded border"
                class:bg-green-50={a.status==='CONFIRMED'}
                class:text-green-700={a.status==='CONFIRMED'}
                class:border-green-200={a.status==='CONFIRMED'}
                class:bg-yellow-50={a.status==='PENDING'}
                class:text-yellow-700={a.status==='PENDING'}
                class:border-yellow-200={a.status==='PENDING'}
                class:bg-neutral-100={a.status==='CANCELLED'}
                class:text-neutral-600={a.status==='CANCELLED'}
                class:border-neutral-300={a.status==='CANCELLED'}
              >{a.status}</span>
              <button class="border rounded px-2 py-1 text-xs" on:click={() => cancelApp(a)}>수강 취소</button>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </TabsContent>
</Tabs>

<LoginModal bind:isOpen={loginOpen} />

