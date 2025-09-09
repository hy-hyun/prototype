<script lang="ts">
  import { cart, applications, metrics, isLoggedIn, userDataLoading, currentUser, timetableCourses, isUserDataLoaded } from "$lib/stores";
  import { courses, loadCourses } from "$lib/stores";
  import { applyFcfs, applyBid, removeFromCart as removeFromCartStore, syncUserCart } from "$lib/stores";
  import { getUserDocument, getBettingPointsData } from "$lib/firestore";
  import Skeleton from "$lib/components/Skeleton.svelte";
  import { showToast } from "$lib/toast";
  import LoginModal from "$lib/components/LoginModal.svelte";
  import type { BettingPointsData } from "$lib/types";
  import { Tabs, TabsList, TabsTrigger, TabsContent } from "$lib/components/ui/tabs";
  import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "$lib/components/ui/accordion";
  import { dndzone, SOURCES, TRIGGERS } from 'svelte-dnd-action';
  import type { CartItem } from '$lib/types';

  import { get } from "svelte/store";
  // Svelte 5 룬모드: $state() 사용
  let view = $state<"cart" | "applications">("cart");
  let cartView = $state<"all" | "fcfs" | "bid" | "results">("all");
  let applying = $state(false);
  let loginOpen = $state(false);
  let statusFilter = $state<"ALL" | "PENDING" | "CONFIRMED" | "FAILED" | "CANCELLED">("ALL");
  
  // 드래그앤드롭 중인 임시 아이템들 상태
  let draggedItems = $state<any[]>([]);
  
  // 베팅 포인트 데이터 상태
  let bettingPointsData = $state<BettingPointsData>({});
  let bettingDataLoading = $state(false);
  let bettingDataLoaded = $state(false);

  // 데이터 로딩
  $effect(() => {
    if ($courses.length === 0) {
      loadCourses();
    }
  });

  // 베팅 포인트 데이터 로딩 (한 번만 실행)
  $effect(() => {
    // 아직 로딩하지 않았고, 현재 로딩 중이 아닐 때만 실행
    if (!bettingDataLoaded && !bettingDataLoading) {
      (async () => {
        try {
          bettingDataLoading = true;
          console.log('🎯 베팅 포인트 데이터 로딩 시작...');
          const data = await getBettingPointsData();
          bettingPointsData = data;
          bettingDataLoaded = true; // 로딩 완료 플래그 설정
          console.log('✅ 베팅 포인트 데이터 로딩 완료:', Object.keys(data).length, '개');
        } catch (error) {
          console.error('❌ 베팅 포인트 데이터 로딩 실패:', error);
          bettingDataLoaded = true; // 실패해도 재시도 방지
        } finally {
          bettingDataLoading = false;
        }
      })();
    }
  });

  // 🔥 로그인 상태에 따른 Firestore 데이터 로딩
  $effect(() => {
    // currentUser가 변경될 때만 이 효과를 실행합니다.
    const user = $currentUser;
    // 로그인 상태이고, 사용자 데이터가 아직 로드되지 않았을 때만 실행
    if ($isLoggedIn && user && !$isUserDataLoaded) {
      console.log('🔥 수강신청: 로그인 사용자 데이터 로딩 (페이지 진입)', user.id);
      
      // async 함수를 IIFE로 처리
      (async () => {
        try {
          userDataLoading.set(true); // 로딩 시작
          const userData = await getUserDocument(user.id);
          if (userData && userData.enrollment) {
            // 장바구니, 신청내역, 시간표 동기화
            cart.set(userData.enrollment.cart || []);
            applications.set(userData.enrollment.applications || []);
            timetableCourses.set(userData.enrollment.timetableCourses || []);
            isUserDataLoaded.set(true); // 데이터 로딩 완료!
            console.log('✅ 수강신청: Firestore 데이터 로딩 완료', {
              cart: userData.enrollment.cart?.length || 0,
              applications: userData.enrollment.applications?.length || 0,
              timetable: userData.enrollment.timetableCourses?.length || 0
            });
          }
        } catch (error) {
          console.error('❌ 수강신청: Firestore 데이터 로딩 실패:', error);
        } finally {
          userDataLoading.set(false); // 로딩 종료
        }
      })();
    } else if (!$isLoggedIn && $isUserDataLoaded) {
      // 로그아웃 시 데이터 초기화 (stores.ts에서 이미 처리하지만 방어적으로 추가)
      isUserDataLoaded.set(false);
      console.log('🔒 수강신청: 로그아웃 상태 감지. 데이터 로딩 상태 초기화.');
    }
  });

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
    
    // 베팅 확정 시 항상 대기 상태로 설정
    showToast("베팅 확정이 완료되었습니다. 베팅 결과에서 확인해주세요.", "success");
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

  // 로컬: 장바구니 조작/도우미들
  async function removeFromCart(courseId: string, classId: string) {
    await removeFromCartStore(courseId, classId);
  }

  async function setBidAmount(courseId: string, classId: string, bidAmount: number) {
    let newCart: any[] = [];
    
    cart.update((c) => {
      newCart = c.map((x) => (x.courseId === courseId && x.classId === classId ? { ...x, bidAmount } : x));
      return newCart;
    });
    
    // 🔥 Firebase 동기화
    try {
      await syncUserCart(newCart);
    } catch (error) {
      console.error('❌ 베팅 금액 변경 Firestore 동기화 실패:', error);
    }
  }

  async function applyMany(items: Array<{ courseId: string; classId: string; method: "FCFS" | "BID"; bidAmount?: number }>) {
    for (const it of items) {
      if (it.method === "FCFS") await Promise.resolve(applyFcfs(it.courseId, it.classId));
      else await Promise.resolve(applyBid(it.courseId, it.classId, it.bidAmount ?? 0));
    }
  }

  const coursesMap = $derived(new Map($courses.map(c => [`${c.courseId}-${c.classId}`, c])));

  function findLecture(courseId: string, classId: string) {
    return coursesMap.get(`${courseId}-${classId}`);
  }

  function computeCredits(courseId: string, classId: string) {
    const lec = findLecture(courseId, classId);
    if (!lec) return 0;
    return (lec.credits?.lecture ?? 0) + (lec.credits?.lab ?? 0);
  }

  function formatSchedule(courseId: string, classId: string) {
    const lec = findLecture(courseId, classId);
    if (!lec || !lec.schedule || lec.schedule.length === 0) return "시간 정보 없음";
    
    const days = ["", "월", "화", "수", "목", "금", "토", "일"];
    
    return lec.schedule
      .map((s) => {
        // 시간 슬롯을 실제 시간으로 변환 (9시 기준, 30분 단위)
        const startHour = Math.floor(s.start / 2) + 9;
        const startMinute = (s.start % 2) * 30;
        const endHour = Math.floor(s.end / 2) + 9;
        const endMinute = (s.end % 2) * 30;
        
        const startTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
        const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
        
        // 장소 정보 포맷팅
        const building = s.building || '';
        const room = s.room || '';
        let location = '';
        
        if (building && room) {
          // 둘 다 "미정"인 경우 하나만 표시
          if (building === '미정' && room === '미정') {
            location = ` 미정`;
          } else {
            location = ` ${building} ${room}`;
          }
        } else if (building) {
          location = ` ${building}`;
        } else if (room) {
          location = ` ${room}`;
        }
        
        const dayName = days[s.day] || "월";
        return `${dayName} ${startTime}~${endTime}${location}`;
      })
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

  // Firebase 베팅 데이터 기반 통계 조회
  function getBidStats(courseId: string, classId: string): { minWin: number; q25: number; q75: number; hasData: boolean } {
    const key = `${courseId}-${classId}`;
    const data = bettingPointsData[key];
    
    console.log(`🔍 베팅 통계 요청: ${key}`, { 
      데이터존재: !!data, 
      전체키목록: Object.keys(bettingPointsData),
      요청된데이터: data 
    });
    
    if (data) {
      // Firebase 데이터 사용
      return {
        minWin: data.lastYearMin,
        q25: data.lastYear25th,
        q75: data.lastYear75th,
        hasData: true
      };
    } else {
      // Firebase에 데이터가 없는 경우 기본값 반환
      console.warn(`베팅 데이터 없음: ${key}, 기본값 사용`);
      return {
        minWin: 20,
        q25: 25,
        q75: 35,
        hasData: false
      };
    }
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
    // 취소할 신청 정보 찾기
    const applicationToCancel = get(applications).find((x) => 
      x.courseId === a.courseId && x.classId === a.classId
    );
    
    // 베팅이고 당첨된 경우 포인트 반환 메시지 표시
    if (applicationToCancel?.method === 'BID' && 
        applicationToCancel?.bidResult === 'WON' && 
        applicationToCancel?.bidAmount) {
      showToast(`수강 취소 완료 (베팅 포인트 ${applicationToCancel.bidAmount}p 반환)`, "success");
    } else {
      showToast("수강 취소가 완료되었습니다", "success");
    }
    
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

  // 베팅 상태를 확인하는 함수
  function getBettingStatus(courseId: string, classId: string): { isApplied: boolean; bidResult?: "WAITING" | "WON" | "LOST"; status?: string } {
    const application = get(applications).find((a) => a.courseId === courseId && a.classId === classId);
    
    if (!application) {
      return { isApplied: false };
    }
    
    // 베팅이 아닌 경우 (선착순)
    if (application.method !== 'BID') {
      return { isApplied: true, status: application.status };
    }
    
    // 베팅인 경우
    return { 
      isApplied: true, 
      bidResult: application.bidResult,
      status: application.status
    };
  }

  // 현재 선택된 뷰에 따라 필터링된 장바구니 아이템 - Svelte 5 룬모드
  const filteredCartItems = $derived.by(() => {
    let items: CartItem[] = [];
    if (cartView === 'all') {
      items = $cart; // 전체 탭에서는 모든 아이템
    } else if (cartView === 'fcfs') {
      items = $cart.filter(x => x.method === 'FCFS');
    } else if (cartView === 'bid') {
      items = $cart.filter(x => x.method === 'BID');
    }
    
    // order 순으로 정렬, order가 없는 경우 뒤로
    return items.sort((a, b) => (a.order || 999) - (b.order || 999));
  });

  // 전체 탭에서 사용할 선착순/베팅별 그룹화된 아이템
  const groupedCartItems = $derived.by(() => {
    if (cartView !== 'all') return { fcfs: [], bid: [] };
    
    const fcfsItems = $cart.filter(x => x.method === 'FCFS').sort((a, b) => (a.order || 999) - (b.order || 999));
    const bidItems = $cart.filter(x => x.method === 'BID').sort((a, b) => (a.order || 999) - (b.order || 999));
    
    return { fcfs: fcfsItems, bid: bidItems };
  });

  // 드래그앤드롭을 위한 아이템 배열 - 각 아이템에 고유 id 추가
  const sortableItems = $derived.by(() => {
    // 드래그 중이면 임시 아이템들을 사용, 아니면 필터된 아이템들 사용
    const itemsToUse = draggedItems.length > 0 ? draggedItems : filteredCartItems;
    
    return itemsToUse.map((item: any, index: number) => ({
      id: `${item.courseId}-${item.classId}`,
      ...item,
      originalIndex: index,
      isDndShadowItem: item.isDndShadowItem || false
    }));
  });

  // 드래그앤드롭 핸들러
  function handleDndConsider(e: CustomEvent) {
    const { items } = e.detail;
    // 드래그 중 임시로 순서 변경된 아이템들을 상태에 저장
    draggedItems = items;
    
    console.log('🔄 드래그 중:', {
      itemsCount: items.length,
      items: items.map((item: any) => ({
        courseId: item.courseId,
        id: item.id
      }))
    });
  }

  async function handleDndFinalize(e: CustomEvent) {
    const { items } = e.detail;
    
    // 새로운 순서로 장바구니 업데이트
    let finalCart: any[] = [];
    cart.update((currentCart) => {
      const updatedCart = [...currentCart];
      
      // 현재 탭의 아이템들만 순서 변경
      const currentMethod = cartView === 'fcfs' ? 'FCFS' : 'BID';
      const otherItems = updatedCart.filter(x => x.method !== currentMethod);
      
      // 드래그된 아이템들의 새로운 순서 적용 - 모든 속성 보존
      const reorderedItems = items.map((item: any, newIndex: number) => {
        // 원본 아이템에서 모든 속성을 가져와서 order만 업데이트
        const originalItem = updatedCart.find(x => 
          x.courseId === item.courseId && x.classId === item.classId
        );
        
        return {
          ...originalItem, // 원본 아이템의 모든 속성 보존
          order: newIndex + 1 // 새로운 순서만 업데이트
        };
      }).filter(Boolean); // undefined 제거
      
      console.log('🔄 드래그앤드롭 완료:', {
        currentMethod,
        otherItemsCount: otherItems.length,
        reorderedItemsCount: reorderedItems.length,
        reorderedItems: reorderedItems.map((item: CartItem) => ({
          courseId: item.courseId,
          order: item.order,
          method: item.method
        }))
      });
      
      finalCart = [...otherItems, ...reorderedItems];
      return finalCart;
    });
    
    // 🔥 Firebase 동기화
    try {
      await syncUserCart(finalCart);
      console.log('✅ 드래그앤드롭 Firestore 동기화 완료');
    } catch (error) {
      console.error('❌ 드래그앤드롭 Firestore 동기화 실패:', error);
    }
    
    // 드래그 완료 후 임시 상태 초기화
    draggedItems = [];
  }

  // 베팅결과 - Svelte 5 룬모드 (모든 베팅 결과 포함 - 당첨/탈락/대기)
  const bettingResults = $derived($applications.filter(a => a.method === 'BID'));
  
  // 베팅 결과 처리 함수
  async function processBettingResults() {
    const waitingBets = get(applications).filter(a => a.method === 'BID' && a.bidResult === 'WAITING');
    
    if (waitingBets.length === 0) {
      showToast("처리할 베팅 결과가 없습니다", "error");
      return;
    }
    
    // 각 베팅에 대해 결과 처리
    applications.update(apps => {
      return apps.map(app => {
        if (app.method === 'BID' && app.bidResult === 'WAITING') {
          const key = `${app.courseId}-${app.classId}`;
          const data = bettingPointsData[key];
          
          // 베팅 결과 결정: currentBet >= currentActual이면 당첨
          let bidResult: "WON" | "LOST";
          if (data && data.currentActual !== undefined) {
            // Firebase 데이터가 있는 경우: currentBet >= currentActual이면 당첨
            if ((app.bidAmount || 0) >= data.currentActual) {
              bidResult = "WON";
            } else {
              bidResult = "LOST";
            }
          } else {
            // Firebase 데이터가 없는 경우 기본 로직 (전년도 최저값 기준)
            console.warn(`베팅 결과 처리 - 데이터 없음: ${key}, 기본 로직 사용`);
            const stats = getBidStats(app.courseId, app.classId);
            if ((app.bidAmount || 0) >= stats.minWin) {
              bidResult = "WON";
            } else {
              bidResult = "LOST";
            }
          }
          
          return {
            ...app,
            bidResult,
            status: bidResult === "WON" ? "CONFIRMED" : "FAILED"
          };
        }
        return app;
      });
    });
    
    // 결과 요약 메시지 생성
    const wonCount = waitingBets.filter(bet => {
      const key = `${bet.courseId}-${bet.classId}`;
      const data = bettingPointsData[key];
      
      if (data && data.currentActual !== undefined) {
        return (bet.bidAmount || 0) >= data.currentActual;
      } else {
        // 기본 로직
        const stats = getBidStats(bet.courseId, bet.classId);
        return (bet.bidAmount || 0) >= stats.minWin;
      }
    }).length;
    
    const lostCount = waitingBets.length - wonCount;
    
    if (wonCount > 0 && lostCount > 0) {
      showToast(`베팅 결과: ${wonCount}개 당첨, ${lostCount}개 탈락`, "success");
    } else if (wonCount > 0) {
      showToast(`베팅 결과: ${wonCount}개 모두 당첨!`, "success");
    } else {
      showToast(`베팅 결과: ${lostCount}개 모두 탈락`, "error");
    }
  }
  
</script>

<h2 class="text-xl font-semibold mb-4">수강신청</h2>

<Tabs bind:value={view} class="w-full">
  <div class="flex justify-between items-center mb-3">
    <TabsList>
      <TabsTrigger value="cart">🛒 장바구니</TabsTrigger>
      <TabsTrigger value="applications">📋 신청내역</TabsTrigger>
    </TabsList>
    <div class="text-base text-neutral-600 dark:text-neutral-400">
      기본 수업 학점 {$metrics.basicCredits} / 최대 학점 {$metrics.maxCredits} / 신청 과목 수 {$metrics.enrolledCourses} / 
      베팅 포인트: {$metrics.usedBettingPoints}/{$metrics.totalBettingPoints} (잔여: {$metrics.remainingBettingPoints})
    </div>
  </div>

  <TabsContent value="cart">
    <div class="flex justify-between items-center gap-2 mb-3">
      <div class="flex items-center border rounded-lg p-1 bg-neutral-50 dark:bg-neutral-800">
        <button 
          class="px-3 py-1 text-base rounded-md transition-colors"
          class:bg-white={cartView === 'all'}
          class:shadow-sm={cartView === 'all'}
          class:text-neutral-900={cartView === 'all'}
          class:text-neutral-600={cartView !== 'all'}
          class:dark:bg-neutral-700={cartView === 'all'}
          class:dark:text-white={cartView === 'all'}
          onclick={() => cartView = 'all'}
        >
          전체
        </button>
        <button 
          class="px-3 py-1 text-base rounded-md transition-colors"
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
          class="px-3 py-1 text-base rounded-md transition-colors"
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
          class="px-3 py-1 text-base rounded-md transition-colors"
          class:bg-white={cartView === 'results'}
          class:shadow-sm={cartView === 'results'}
          class:text-neutral-900={cartView === 'results'}
          class:text-neutral-600={cartView !== 'results'}
          class:dark:bg-neutral-700={cartView === 'results'}
          class:dark:text-white={cartView === 'results'}
          onclick={() => cartView = 'results'}
        >
          결과 열람
        </button>
      </div>
    </div>
    {#if $userDataLoading}
      <!-- 로딩 스켈레톤 -->
      <div class="grid gap-2">
        {#each Array(3) as _}
          <div class="rounded border p-3">
            <div class="flex items-center justify-between gap-3">
              <div class="text-base flex-1">
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
      <div class="flex justify-between items-center mb-3">
        <div class="text-base text-neutral-600">베팅 결과</div>
        <button 
          class="border border-green-500 bg-green-500 text-white hover:bg-green-600 rounded px-3 py-1 text-base disabled:opacity-50" 
          disabled={bettingResults.filter(r => r.bidResult === 'WAITING').length === 0 || bettingDataLoading}
          onclick={processBettingResults}
        >
          {#if bettingDataLoading}
            베팅 데이터 로딩 중...
          {:else}
            베팅 결과 보기
          {/if}
        </button>
      </div>
      {#if bettingResults.length === 0}
        <p class="text-base text-neutral-500">베팅 결과가 없습니다.</p>
      {:else}
        <ul class="grid gap-2">
          {#each bettingResults as item}
            <li class="rounded border p-3 flex items-center justify-between gap-3">
              <div class="text-base flex-1">
                <div class="font-medium">
                  {#if findLecture(item.courseId, item.classId)}
                    {findLecture(item.courseId, item.classId)?.title}
                  {:else}
                    {item.courseId}-{item.classId}
                  {/if}
                </div>
                <div class="text-sm text-neutral-500">
                  {computeCredits(item.courseId, item.classId)}학점 · {formatSchedule(item.courseId, item.classId)}
                </div>
                {#if item.bidAmount}
                  <div class="text-sm text-blue-600">베팅 금액: {item.bidAmount}p</div>
                {/if}
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm px-2 py-1 rounded border"
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
    {:else if cartView === 'all'}
      <!-- 전체 탭 - 아코디언 구조 -->
      {#if groupedCartItems.fcfs.length === 0 && groupedCartItems.bid.length === 0}
        <p class="text-base text-neutral-500">장바구니가 비었습니다.</p>
      {:else}
        <Accordion type="multiple" value={["fcfs-section", "bid-section"]} class="w-full">
          {#if groupedCartItems.fcfs.length > 0}
            <AccordionItem value="fcfs-section" class="border rounded-lg mb-3">
              <AccordionTrigger class="px-4 py-3 hover:no-underline">
                <div class="flex items-center justify-between w-full">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span class="font-medium">선착순 과목</span>
                    <span class="text-base text-neutral-500">({groupedCartItems.fcfs.length}개)</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent class="px-4 pb-3">
                <div class="space-y-2">
                  {#each groupedCartItems.fcfs as item, index}
                    <div class="rounded border p-3 bg-white">
                      <div class="flex items-center justify-between gap-3">
                        <!-- 우선순위 번호 -->
                        <div class="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                          {index + 1}
                        </div>
                        
                        <div class="text-base flex-1">
                          <div class="font-medium">
                            {#if findLecture(item.courseId, item.classId)}
                              {findLecture(item.courseId, item.classId)?.title}
                            {:else}
                              {item.courseId}-{item.classId}
                            {/if}
                          </div>
                          <div class="text-sm text-neutral-500">
                            {computeCredits(item.courseId, item.classId)}학점 · {formatSchedule(item.courseId, item.classId)}
                          </div>
                          <div class="mt-1 flex flex-wrap gap-1 text-xs">
                            {#if hasTimeConflict(item.courseId, item.classId)}
                              <span class="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">시간 충돌</span>
                            {/if}
                          </div>
                        </div>
                        
                        <div class="flex items-center gap-2">
                          {#if getBettingStatus(item.courseId, item.classId).isApplied}
                            <button class="border border-green-500 bg-green-50 text-green-700 rounded px-2 py-1 text-base opacity-60 cursor-default" disabled>신청 완료</button>
                          {:else}
                            <button class="border border-blue-500 bg-blue-500 text-white hover:bg-blue-600 rounded px-2 py-1 text-base" onclick={() => doApply(item)}>신청</button>
                          {/if}
                          <button class="border border-gray-500 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded px-2 py-1 text-base" onclick={() => removeFromCart(item.courseId, item.classId)}>🛒 장바구니 해제</button>
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              </AccordionContent>
            </AccordionItem>
          {/if}
          
          {#if groupedCartItems.bid.length > 0}
            <AccordionItem value="bid-section" class="border rounded-lg">
              <AccordionTrigger class="px-4 py-3 hover:no-underline">
                <div class="flex items-center justify-between w-full">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span class="font-medium">베팅 과목</span>
                    <span class="text-base text-neutral-500">({groupedCartItems.bid.length}개)</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent class="px-4 pb-3">
                <div class="space-y-2">
                  {#each groupedCartItems.bid as item, index}
                    <div class="rounded border p-3 bg-white">
                      <div class="flex items-center justify-between gap-3">
                        <!-- 우선순위 번호 -->
                        <div class="flex items-center justify-center w-6 h-6 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
                          {index + 1}
                        </div>
                        
                        <div class="text-base flex-1">
                          <div class="font-medium">
                            {#if findLecture(item.courseId, item.classId)}
                              {findLecture(item.courseId, item.classId)?.title}
                            {:else}
                              {item.courseId}-{item.classId}
                            {/if}
                          </div>
                          <div class="text-sm text-neutral-500">
                            {computeCredits(item.courseId, item.classId)}학점 · {formatSchedule(item.courseId, item.classId)}
                          </div>
                          <div class="mt-1 flex flex-wrap gap-1 text-xs">
                            {#if hasTimeConflict(item.courseId, item.classId)}
                              <span class="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">시간 충돌</span>
                            {/if}
                            {#if countBidSameCourse(item.courseId) > 1}
                              <span class="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">동일과목 중복베팅</span>
                            {/if}
                          </div>
                        </div>
                        
                        <div class="flex items-center gap-2">
                          <div class="relative group text-xs text-neutral-500 whitespace-nowrap">
                            {#if bettingDataLoading}
                              전년도 정보 로딩 중...
                            {:else}
                              {@const bidStats = getBidStats(item.courseId, item.classId)}
                              {#if bidStats.hasData}
                                <strong>전년도 정보:</strong> 최저 {bidStats.minWin}p · <strong>예상 범위:</strong> {bidStats.q25}~{bidStats.q75}p
                              {:else}
                                전년도 정보 없음
                              {/if}
                            {/if}
                            <button type="button" class="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full border border-neutral-300 text-neutral-500 bg-white select-none cursor-help" aria-label="설명">i</button>
                            <div role="tooltip" class="absolute z-10 left-1/2 -translate-x-1/2 mt-1 w-64 p-3 text-xs leading-relaxed bg-neutral-800 text-white rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                              {#if !bettingDataLoading}
                                {@const bidStats = getBidStats(item.courseId, item.classId)}
                                {#if bidStats.hasData}
                                  <div>전년도 베팅 당첨 통계입니다.</div>
                                  <div>최저: 최소 당첨 포인트 / 하위 25-75%: 중간 50% 구간 범위</div>
                                {:else}
                                  <div>해당 과목의 전년도 베팅 데이터가 없습니다.</div>
                                {/if}
                              {:else}
                                <div>베팅 데이터를 로딩 중입니다...</div>
                              {/if}
                            </div>
                          </div>
                          <input class="border rounded px-2 py-1 w-24 text-base" type="number" min="1" max="100" step="1" placeholder="최대 100p" value={item.bidAmount ?? ''} oninput={(e) => handleBidInput(e, item)} />
                          {#if getBettingStatus(item.courseId, item.classId).isApplied}
                            {@const bettingStatus = getBettingStatus(item.courseId, item.classId)}
                            {#if bettingStatus.bidResult === 'WON'}
                              <button class="border border-green-500 bg-green-50 text-green-700 rounded px-2 py-1 text-base opacity-60 cursor-default" disabled>베팅 당첨</button>
                            {:else if bettingStatus.bidResult === 'LOST'}
                              <button class="border border-red-500 bg-red-50 text-red-700 rounded px-2 py-1 text-base opacity-60 cursor-default" disabled>베팅 탈락</button>
                            {:else if bettingStatus.bidResult === 'WAITING'}
                              <button class="border border-yellow-500 bg-yellow-50 text-yellow-700 rounded px-2 py-1 text-base opacity-60 cursor-default" disabled>베팅 대기</button>
                            {:else}
                              <button class="border border-green-500 bg-green-50 text-green-700 rounded px-2 py-1 text-base opacity-60 cursor-default" disabled>신청 완료</button>
                            {/if}
                          {:else}
                            <button class="border border-blue-500 bg-blue-500 text-white hover:bg-blue-600 rounded px-2 py-1 text-base disabled:opacity-50" onclick={() => doApply(item)} disabled={!item.bidAmount || item.bidAmount <= 0 || countBidSameCourse(item.courseId) > 1}>
                              베팅 확정
                            </button>
                          {/if}
                          <button class="border border-gray-500 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded px-2 py-1 text-base" onclick={() => removeFromCart(item.courseId, item.classId)}>🛒 장바구니 해제</button>
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              </AccordionContent>
            </AccordionItem>
          {/if}
        </Accordion>
      {/if}
    {:else if sortableItems.length === 0}
      <p class="text-base text-neutral-500">
        {cartView === 'fcfs' ? '선착순 장바구니가' : cartView === 'bid' ? '베팅 장바구니가' : '장바구니가'} 비었습니다.
      </p>
    {:else}
      <div class="relative">
        <div class="text-sm text-gray-500 mb-2 flex items-center gap-2">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
          </svg>
          드래그하여 우선순위를 변경할 수 있습니다
        </div>
        <ul 
          class="grid gap-2" 
          use:dndzone={{
            items: sortableItems,
            flipDurationMs: 200,
            dropTargetStyle: {}
          }}
          onconsider={handleDndConsider}
          onfinalize={handleDndFinalize}
        >
          {#each sortableItems as item (item.id)}
            <li class="rounded border p-3 flex items-center justify-between gap-3 cursor-move hover:shadow-md transition-shadow bg-white relative group"
                class:opacity-75={item.isDndShadowItem}>
            <!-- 드래그 핸들 -->
            <div class="flex items-center mr-2 text-gray-400 group-hover:text-gray-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"/>
              </svg>
            </div>
            
            <!-- 우선순위 번호 -->
            <div class="flex items-center justify-center w-6 h-6 text-sm font-medium rounded-full mr-3"
                 class:bg-blue-100={item.method === 'FCFS'}
                 class:text-blue-800={item.method === 'FCFS'}
                 class:bg-orange-100={item.method === 'BID'}
                 class:text-orange-800={item.method === 'BID'}>
              {sortableItems.findIndex(x => x.id === item.id) + 1}
            </div>
            
            <div class="text-base flex-1">
              <div class="font-medium">
                {#if findLecture(item.courseId, item.classId)}
                  {findLecture(item.courseId, item.classId)?.title}
                {:else}
                  {item.courseId}-{item.classId}
                {/if}
              </div>
              <div class="text-sm text-neutral-500">
                {computeCredits(item.courseId, item.classId)}학점 · {formatSchedule(item.courseId, item.classId)}
              </div>
              <div class="mt-1 flex flex-wrap gap-1 text-xs">
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
                <div class="relative group text-xs text-neutral-500 whitespace-nowrap">
                  {#if bettingDataLoading}
                    전년도 정보 로딩 중...
                  {:else}
                    {@const bidStats = getBidStats(item.courseId, item.classId)}
                    {#if bidStats.hasData}
                    <strong>전년도 정보:</strong> 최저 {bidStats.minWin}p · <strong>예상 범위:</strong> {bidStats.q25}~{bidStats.q75}p
                    {:else}
                      전년도 정보 없음
                    {/if}
                  {/if}
                  <button type="button" class="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full border border-neutral-300 text-neutral-500 bg-white select-none cursor-help" aria-label="설명">i</button>
                  <div role="tooltip" class="absolute z-10 left-1/2 -translate-x-1/2 mt-1 w-64 p-3 text-xs leading-relaxed bg-neutral-800 text-white rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                    {#if !bettingDataLoading}
                      {@const bidStats = getBidStats(item.courseId, item.classId)}
                      {#if bidStats.hasData}
                        <div>전년도 베팅 당첨 통계입니다.</div>
                        <div>최저: 최소 당첨 포인트 / 하위 25-75%: 중간 50% 구간 범위</div>
                      {:else}
                        <div>해당 과목의 전년도 베팅 데이터가 없습니다.</div>
                      {/if}
                    {:else}
                      <div>베팅 데이터를 로딩 중입니다...</div>
                    {/if}
                  </div>
                </div>
                <input class="border rounded px-2 py-1 w-24 text-base" type="number" min="1" max="100" step="1" placeholder="최대 100p" value={item.bidAmount ?? ''} oninput={(e) => handleBidInput(e, item)} />
                {#if getBettingStatus(item.courseId, item.classId).isApplied}
                  {@const bettingStatus = getBettingStatus(item.courseId, item.classId)}
                  {#if bettingStatus.bidResult === 'WON'}
                    <button class="border border-green-500 bg-green-50 text-green-700 rounded px-2 py-1 text-base opacity-60 cursor-default" disabled>베팅 당첨</button>
                  {:else if bettingStatus.bidResult === 'LOST'}
                    <button class="border border-red-500 bg-red-50 text-red-700 rounded px-2 py-1 text-base opacity-60 cursor-default" disabled>베팅 탈락</button>
                  {:else if bettingStatus.bidResult === 'WAITING'}
                    <button class="border border-yellow-500 bg-yellow-50 text-yellow-700 rounded px-2 py-1 text-base opacity-60 cursor-default" disabled>베팅 대기</button>
                  {:else}
                    <button class="border border-green-500 bg-green-50 text-green-700 rounded px-2 py-1 text-base opacity-60 cursor-default" disabled>신청 완료</button>
                  {/if}
                {:else}
                  <button class="border border-blue-500 bg-blue-500 text-white hover:bg-blue-600 rounded px-2 py-1 text-base disabled:opacity-50" onclick={() => doApply(item)} disabled={!item.bidAmount || item.bidAmount <= 0 || countBidSameCourse(item.courseId) > 1}>
                    베팅 확정
                  </button>
                {/if}
              </div>
            {:else}
              {#if getBettingStatus(item.courseId, item.classId).isApplied}
                {@const bettingStatus = getBettingStatus(item.courseId, item.classId)}
                <button class="border border-green-500 bg-green-50 text-green-700 rounded px-2 py-1 text-base opacity-60 cursor-default" disabled>신청 완료</button>
              {:else}
                <button class="border border-blue-500 bg-blue-500 text-white hover:bg-blue-600 rounded px-2 py-1 text-base" onclick={() => doApply(item)}>신청</button>
              {/if}
            {/if}
            <button class="border border-gray-500 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded px-2 py-1 text-base" onclick={() => removeFromCart(item.courseId, item.classId)}>🛒 장바구니 해제</button>
          </li>
        {/each}
      </ul>
      </div>
    {/if}
  </TabsContent>

  <TabsContent value="applications">
    <div class="flex items-center justify-between mb-3">
      <div class="text-base">신청내역</div>
      <select class="border rounded p-1 text-base" bind:value={statusFilter}>
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
      <p class="text-base text-neutral-500">신청내역이 없습니다.</p>
    {:else}
      <ul class="grid gap-2">
        {#each $applications.filter(a => {
          // 상태 필터 적용
          const statusMatch = statusFilter === 'ALL' ? true : a.status === statusFilter;
          
          // 베팅인 경우 당첨된 것만 표시 (탈락은 제외)
          if (a.method === 'BID' && a.bidResult === 'LOST') {
            return false;
          }
          
          return statusMatch;
        }) as a}
          <li class="rounded border p-3 text-base flex items-center justify-between">
            <div class="flex-1">
              <div class="font-medium">{findLecture(a.courseId, a.classId)?.title || `${a.courseId}-${a.classId}`}</div>
              <div class="text-sm text-neutral-500">{a.courseId}-{a.classId} · {formatSchedule(a.courseId, a.classId)}</div>
              {#if a.method === 'BID' && a.bidAmount}
                <div class="text-sm text-blue-600 mt-1">베팅 금액: {a.bidAmount}p</div>
              {/if}
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm px-2 py-1 rounded border"
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
              <button class="border border-red-500 bg-red-500 text-white hover:bg-red-600 rounded px-2 py-1 text-sm" onclick={() => cancelApp(a)}>수강 취소</button>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </TabsContent>
</Tabs>

<LoginModal bind:isOpen={loginOpen} />

<style>
  /* 드래그앤드롭 시각적 피드백 스타일 */
  :global(.dnd-action-dragged-el) {
    transform: rotate(5deg);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    z-index: 1000;
  }
  
  :global(.dnd-action-dragged-el *) {
    pointer-events: none;
  }
  
  /* 드롭 타겟 하이라이트 */
  :global([data-is-dnd-shadow-item]) {
    opacity: 0.5;
    background: linear-gradient(135deg, #e3f2fd, #f3e5f5);
    border: 2px dashed #2196f3;
    transform: scale(0.98);
  }
  
  /* 드래그 중인 아이템의 원본 위치 표시 */
  :global(.sortable-chosen) {
    background-color: #f5f5f5 !important;
  }
</style>

