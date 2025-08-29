<script lang="ts">
  import { cart, applications, metrics, isLoggedIn, userDataLoading } from "$lib/stores";
  import { courses, loadCourses } from "$lib/stores";
  import { applyFcfs, applyBid } from "$lib/stores";
  import Skeleton from "$lib/components/Skeleton.svelte";
  import { showToast } from "$lib/toast";
  import LoginModal from "$lib/components/LoginModal.svelte";
  import { Tabs, TabsList, TabsTrigger, TabsContent } from "$lib/components/ui/tabs";

  import { get } from "svelte/store";
  // Svelte 5 룬모드: $state() 사용
  let view = $state<"cart" | "applications">("cart");
  let cartView = $state<"fcfs" | "bid" | "results">("fcfs");
  let applying = $state(false);
  let loginOpen = $state(false);
  let statusFilter = $state<"ALL" | "PENDING" | "CONFIRMED" | "FAILED" | "CANCELLED">("ALL");

  // 데이터 로딩은 +layout.ts에서 전역으로 처리하므로 이 코드는 제거합니다.

  async function doApply(item: { courseId: string; classId: string; method: "FCFS" | "BID"; bidAmount?: number }) {
    if (!$isLoggedIn) {
      loginOpen = true;
      showToast("로그인이 필요합니다", "error");
      return;
    }
    
    // 중복 신청 방지 - 이미 신청된 과목인지 확인
    if (isApplied(item.courseId, item.classId)) {
      showToast("이미 신청된 강의입니다", "error");
      return;
    }
    
    // 신청내역과 시간 충돌 시 차단
    if (conflictsWithApplications(item.courseId, item.classId)) {
      showToast("이미 신청된 강의와 시간이 겹쳐 신청할 수 없습니다", "error");
      return;
    }
    
    if (item.method === "FCFS") {
      await applyFcfs(item.courseId, item.classId);
      showToast("선착순 신청이 완료되었습니다", "success");
      return;
    }
    
    const amount = item.bidAmount ?? 0;
    if (amount <= 0) {
      showToast("베팅 금액을 입력하세요", "error");
      return;
    }
    if (amount > 100) {
      showToast("한 강의당 최대 100p까지 베팅 가능합니다", "error");
      return;
    }
    // 현재 아이템을 제외한 다른 베팅들의 합계 계산
    const otherBetsTotal = otherBidSpent(item.courseId, item.classId);
    const totalRequired = otherBetsTotal + amount;
    if (totalRequired > $metrics.remainingBettingPoints) {
      showToast("베팅 포인트가 부족합니다", "error");
      return;
    }
    await applyBid(item.courseId, item.classId, amount);
    showToast("베팅 신청이 완료되었습니다", "success");
  }

  async function applyCurrentTabAll() {
    if (!$isLoggedIn) {
      loginOpen = true;
      showToast("로그인이 필요합니다", "error");
      return;
    }
    const items = filteredCartItems;
    
    // 이미 신청된 과목 제거
    const notApplied = items.filter((x) => !isApplied(x.courseId, x.classId));
    
    // 동일 과목 중복 베팅 제거(규칙상 금지)
    const seenCourse = new Set<string>();
    const deduped = notApplied.filter((x) => {
      if (x.method !== "BID") return true;
      if (seenCourse.has(x.courseId)) return false;
      seenCourse.add(x.courseId);
      return true;
    });
    
    const invalid = notApplied.filter((x) => x.method === "BID" && (!x.bidAmount || x.bidAmount <= 0));
    const valid = deduped.filter((x) => !invalid.includes(x));
    
    if (valid.length === 0) {
      const alreadyApplied = items.length - notApplied.length;
      if (alreadyApplied > 0) {
        showToast(`${alreadyApplied}개 항목은 이미 신청되어 건너뜀`, "info");
      } else {
        showToast("신청할 항목이 없습니다", "info");
      }
      return;
    }
    
    applying = true;
    try {
      await applyMany(valid);
      const alreadyApplied = items.length - notApplied.length;
      const skipped = invalid.length + (notApplied.length - deduped.length);
      let message = "신청을 완료했습니다";
      
      if (alreadyApplied > 0 || skipped > 0) {
        const skipMessages = [];
        if (alreadyApplied > 0) skipMessages.push(`${alreadyApplied}개 이미 신청됨`);
        if (skipped > 0) skipMessages.push(`${skipped}개 규칙 위반/금액 없음`);
        message = `신청 완료 (건너뜀: ${skipMessages.join(', ')})`;
      }
      
      showToast(message, "success");
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

  function getBidStats(courseId: string, classId: string): { minWin: number; q25: number; q75: number } {
    const key = `${courseId}-${classId}`;
    const minWin = seededInt(key + ":min", 15, 25); // 5-15에서 15-25로 10p 상승
    const q25Base = seededInt(key + ":q25", 18, 30); // 8-20에서 18-30으로 10p 상승
    const q75Base = seededInt(key + ":q75", 25, 45); // 15-35에서 25-45로 10p 상승
    const q25 = Math.max(minWin, q25Base);
    const q75 = Math.max(q25 + 5, q75Base); // q75는 q25보다 최소 5p 높게
    return { minWin, q25, q75 };
  }

  function handleBidInput(e: Event, item: { courseId: string; classId: string }) {
    const target = e.currentTarget as HTMLInputElement;
    let val = parseInt(target.value || "0", 10);
    if (isNaN(val)) val = 0;
    val = Math.max(0, val);
    
    // 한 강의당 최대 100p 제한
    const maxPerCourse = 100;
    if (val > maxPerCourse) {
      val = maxPerCourse;
      showToast("한 강의당 최대 100p까지 베팅 가능합니다", "error");
    }
    
    // 전체 베팅 포인트 한도 체크
    const spentOthers = otherBidSpent(item.courseId, item.classId);
    const maxAllowed = Math.max(0, $metrics.remainingBettingPoints - spentOthers);
    if (val > maxAllowed) {
      val = maxAllowed;
      showToast("베팅 포인트 한도를 초과할 수 없습니다", "error");
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

  // 로컬 베팅 포인트 계산 - Svelte 5 룬모드
  const bidSpent = $derived($cart.filter(x => x.method === 'BID').reduce((sum, x) => sum + (x.bidAmount ?? 0), 0));
  const availableBettingPoints = $derived(Math.max(0, $metrics.remainingBettingPoints - bidSpent));

  function isApplied(courseId: string, classId: string): boolean {
    return get(applications).some((a) => a.courseId === courseId && a.classId === classId);
  }

  // 현재 선택된 뷰에 따라 필터링된 장바구니 아이템 - Svelte 5 룬모드
  const filteredCartItems = $derived.by(() => {
    if (cartView === 'fcfs') {
      return $cart.filter(x => x.method === 'FCFS');
    } else if (cartView === 'bid') {
      return $cart.filter(x => x.method === 'BID');
    }
    return [];
  });

  // 베팅결과 - Svelte 5 룬모드
  const bettingResults = $derived($applications.filter(a => a.method === 'BID'));
</script>

<h2 class="text-lg font-semibold mb-4">수강신청</h2>

<Tabs bind:value={view} class="w-full">
  <div class="flex justify-between items-center mb-3">
    <TabsList>
      <TabsTrigger value="cart">장바구니</TabsTrigger>
      <TabsTrigger value="applications">신청내역</TabsTrigger>
    </TabsList>
    <div class="text-sm text-neutral-600 dark:text-neutral-400">
      기본 수업 학점 {$metrics.basicCredits} / 최대 학점 {$metrics.maxCredits} / 신청 과목 수 {$metrics.enrolledCourses} / 잔여 베팅 포인트 {$metrics.remainingBettingPoints}
    </div>
  </div>

  <TabsContent value="cart">
    <div class="flex justify-between items-center gap-2 mb-3">
      <div class="flex items-center border rounded-lg p-1 bg-neutral-50 dark:bg-neutral-800">
        <button 
          class="px-3 py-1 text-sm rounded-md transition-colors"
          class:bg-white={cartView === 'fcfs'}
          class:shadow-sm={cartView === 'fcfs'}
          class:text-neutral-900={cartView === 'fcfs'}
          class:text-neutral-600={cartView !== 'fcfs'}
          class:dark:bg-neutral-700={cartView === 'fcfs'}
          class:dark:text-white={cartView === 'fcfs'}
          onclick={() => cartView = 'fcfs'}
        >
          선착순
        </button>
        <button 
          class="px-3 py-1 text-sm rounded-md transition-colors"
          class:bg-white={cartView === 'bid'}
          class:shadow-sm={cartView === 'bid'}
          class:text-neutral-900={cartView === 'bid'}
          class:text-neutral-600={cartView !== 'bid'}
          class:dark:bg-neutral-700={cartView === 'bid'}
          class:dark:text-white={cartView === 'bid'}
          onclick={() => cartView = 'bid'}
        >
          베팅
        </button>
        <button 
          class="px-3 py-1 text-sm rounded-md transition-colors"
          class:bg-white={cartView === 'results'}
          class:shadow-sm={cartView === 'results'}
          class:text-neutral-900={cartView === 'results'}
          class:text-neutral-600={cartView !== 'results'}
          class:dark:bg-neutral-700={cartView === 'results'}
          class:dark:text-white={cartView === 'results'}
          onclick={() => cartView = 'results'}
        >
          베팅결과
        </button>
      </div>
      <button class="border rounded px-3 py-1 text-sm disabled:opacity-50" disabled={applying || filteredCartItems.length === 0} onclick={applyCurrentTabAll}>
        표시 항목 전체 신청
      </button>
    </div>
    {#if $userDataLoading}
      <!-- 로딩 스켈레톤 -->
      <div class="grid gap-2">
        {#each Array(3) as _}
          <div class="rounded border p-3">
            <div class="flex items-center justify-between gap-3">
              <div class="text-sm flex-1">
                <Skeleton width="w-3/4" height="h-4" rounded="rounded" />
                <Skeleton width="w-1/2" height="h-3" rounded="rounded" />
              </div>
              <div class="flex gap-2">
                <Skeleton width="w-16" height="h-8" rounded="rounded" />
                <Skeleton width="w-20" height="h-8" rounded="rounded" />
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else if cartView === 'results'}
      <!-- 베팅결과 뷰 -->
      {#if bettingResults.length === 0}
        <p class="text-sm text-neutral-500">베팅 결과가 없습니다.</p>
      {:else}
        <ul class="grid gap-2">
          {#each bettingResults as item}
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
                {#if item.bidAmount}
                  <div class="text-xs text-blue-600">베팅 금액: {item.bidAmount}p</div>
                {/if}
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs px-2 py-1 rounded border"
                  class:bg-yellow-50={item.bidResult === 'WAITING'}
                  class:text-yellow-700={item.bidResult === 'WAITING'}
                  class:border-yellow-200={item.bidResult === 'WAITING'}
                  class:bg-green-50={item.bidResult === 'WON'}
                  class:text-green-700={item.bidResult === 'WON'}
                  class:border-green-200={item.bidResult === 'WON'}
                  class:bg-red-50={item.bidResult === 'LOST'}
                  class:text-red-700={item.bidResult === 'LOST'}
                  class:border-red-200={item.bidResult === 'LOST'}
                >
                  {item.bidResult === 'WAITING' ? '대기중' : item.bidResult === 'WON' ? '당첨' : '탈락'}
                </span>
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    {:else if filteredCartItems.length === 0}
      <p class="text-sm text-neutral-500">
        {cartView === 'fcfs' ? '선착순 장바구니가' : '베팅 장바구니가'} 비었습니다.
      </p>
    {:else}
      <ul class="grid gap-2">
        {#each filteredCartItems as item}
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
                  전년도 정보: 최저 {getBidStats(item.courseId, item.classId).minWin}p · 하위 25-75% {getBidStats(item.courseId, item.classId).q25}~{getBidStats(item.courseId, item.classId).q75}p
                  <button type="button" class="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full border border-neutral-300 text-neutral-500 bg-white select-none cursor-help" aria-label="설명">i</button>
                  <div role="tooltip" class="absolute z-10 left-1/2 -translate-x-1/2 mt-1 w-64 p-3 text-[11px] leading-relaxed bg-neutral-800 text-white rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                    <div>전년도 베팅 당첨 통계입니다.</div>
                    <div>최저: 최소 당첨 포인트 / 하위 25-75%: 중간 50% 구간 범위</div>
                  </div>
                </div>
                <input class="border rounded px-2 py-1 w-24 text-sm" type="number" min="1" max="100" step="1" placeholder="최대 100p" value={item.bidAmount ?? ''} oninput={(e) => handleBidInput(e, item)} />
                {#if isApplied(item.courseId, item.classId)}
                  <button class="border rounded px-2 py-1 text-sm opacity-60 cursor-default" disabled>신청 완료</button>
                {:else}
                  <button class="border rounded px-2 py-1 text-sm disabled:opacity-50" onclick={() => doApply(item)} disabled={!item.bidAmount || item.bidAmount <= 0 || countBidSameCourse(item.courseId) > 1}>
                    베팅 신청
                  </button>
                {/if}
              </div>
            {:else}
              {#if isApplied(item.courseId, item.classId)}
                <button class="border rounded px-2 py-1 text-sm opacity-60 cursor-default" disabled>신청 완료</button>
              {:else}
                <button class="border rounded px-2 py-1 text-sm" onclick={() => doApply(item)}>신청</button>
              {/if}
            {/if}
            <button class="border rounded px-2 py-1 text-sm" onclick={() => removeFromCart(item.courseId, item.classId)}>장바구니 해제</button>
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
        <option value="FAILED">실패/탈락</option>
        <option value="CANCELLED">취소</option>
      </select>
    </div>
    {#if $userDataLoading}
      <!-- 로딩 스켈레톤 -->
      <div class="grid gap-2">
        {#each Array(2) as _}
          <div class="rounded border p-3">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <Skeleton width="w-3/4" height="h-4" rounded="rounded" />
                <Skeleton width="w-1/2" height="h-3" rounded="rounded" />
              </div>
              <div class="flex gap-2">
                <Skeleton width="w-16" height="h-6" rounded="rounded-full" />
                <Skeleton width="w-16" height="h-6" rounded="rounded" />
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else if $applications.length === 0}
      <p class="text-sm text-neutral-500">신청내역이 없습니다.</p>
    {:else}
      <ul class="grid gap-2">
        {#each $applications.filter(a => statusFilter === 'ALL' ? true : a.status === statusFilter) as a}
          <li class="rounded border p-3 text-sm flex items-center justify-between">
            <div class="flex-1">
              <div class="font-medium">{findLecture(a.courseId, a.classId)?.title || `${a.courseId}-${a.classId}`}</div>
              <div class="text-xs text-neutral-500">{a.courseId}-{a.classId} · {formatSchedule(a.courseId, a.classId)}</div>
              {#if a.method === 'BID' && a.bidAmount}
                <div class="text-xs text-blue-600 mt-1">베팅 금액: {a.bidAmount}p</div>
              {/if}
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs px-2 py-1 rounded border"
                class:bg-green-50={a.status==='CONFIRMED'}
                class:text-green-700={a.status==='CONFIRMED'}
                class:border-green-200={a.status==='CONFIRMED'}
                class:bg-yellow-50={a.status==='PENDING'}
                class:text-yellow-700={a.status==='PENDING'}
                class:border-yellow-200={a.status==='PENDING'}
                class:bg-red-50={a.status==='FAILED'}
                class:text-red-700={a.status==='FAILED'}
                class:border-red-200={a.status==='FAILED'}
                class:bg-neutral-100={a.status==='CANCELLED'}
                class:text-neutral-600={a.status==='CANCELLED'}
                class:border-neutral-300={a.status==='CANCELLED'}
              >
                {#if a.status === 'CONFIRMED'}
                  {a.method === 'FCFS' ? '신청 완료' : '베팅 당첨'}
                {:else if a.status === 'PENDING'}
                  {a.method === 'FCFS' ? '신청 대기' : '베팅 대기'}
                {:else if a.status === 'FAILED'}
                  {a.method === 'FCFS' ? '신청 실패' : '베팅 탈락'}
                {:else if a.status === 'CANCELLED'}
                  취소됨
                {:else}
                  {a.status}
                {/if}
              </span>
              <button class="border rounded px-2 py-1 text-xs" onclick={() => cancelApp(a)}>수강 취소</button>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </TabsContent>
</Tabs>

<LoginModal bind:isOpen={loginOpen} />

