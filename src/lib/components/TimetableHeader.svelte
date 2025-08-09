<script lang="ts">
  import { cart, applications, lectures } from "$lib/stores";
  import html2canvas from "html2canvas";
  
  // 학기 선택
  let selectedSemester = $state("2024-2학기");
  const semesters = ["2024-2학기", "2024-1학기", "2023-2학기"];
  
  // 총 학점 계산 (장바구니 + 신청내역 기준) - Svelte 5 문법
  let totalCredits = $derived.by(() => {
    const allItems = [...$cart, ...$applications.map(app => ({ courseId: app.courseId, classId: app.classId, method: "FCFS" as const }))];
    const lectureData = $lectures;
    
    return allItems.reduce((sum, item) => {
      const lecture = lectureData.find(l => l.courseId === item.courseId && l.classId === item.classId);
      if (lecture) {
        return sum + lecture.credits.lecture + lecture.credits.lab;
      }
      return sum + 3; // 기본값 3학점
    }, 0);
  });
  
  // 학점 제한 정보
  const minCredits = 12;
  const maxCredits = 21;
  let creditStatus = $derived.by(() => {
    const current = totalCredits;
    if (current < minCredits) return { status: "warning", message: `최소 ${minCredits}학점 필요` };
    if (current > maxCredits) return { status: "error", message: `최대 ${maxCredits}학점 초과` };
    return { status: "success", message: "적정 학점" };
  });

  async function downloadPNG() {
    try {
      // 시간표 그리드 요소 찾기
      const timetableElement = document.querySelector('[data-timetable-grid]') as HTMLElement;
      if (!timetableElement) {
        alert("시간표를 찾을 수 없습니다.");
        return;
      }
      
      // html2canvas로 캡처
      const canvas = await html2canvas(timetableElement, {
        scale: 2, // 고해상도
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });
      
      // 다운로드 링크 생성
      const link = document.createElement('a');
      link.download = `시간표_${selectedSemester}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log("PNG 다운로드 완료");
    } catch (error) {
      console.error("PNG 다운로드 실패:", error);
      alert("PNG 다운로드에 실패했습니다.");
    }
  }

  function shareTimetable() {
    // 시간표 공유 URL 생성
    const shareData = {
      semester: selectedSemester,
      courses: [...$cart, ...$applications.map(app => ({ courseId: app.courseId, classId: app.classId, method: "FCFS" as const }))]
    };
    
    const shareUrl = `${window.location.origin}/timetable?data=${encodeURIComponent(JSON.stringify(shareData))}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${selectedSemester} 시간표`,
        text: `내 시간표를 확인해보세요! (총 ${totalCredits}학점)`,
        url: shareUrl
      }).catch(console.error);
    } else {
      // 클립보드에 URL 복사
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert("시간표 공유 링크가 클립보드에 복사되었습니다!");
      }).catch(() => {
        alert(`공유 링크: ${shareUrl}`);
      });
    }
  }
  
  function resetTimetable() {
    if (confirm("장바구니의 모든 과목을 삭제하시겠습니까?")) {
      cart.set([]);
    }
  }
</script>

<!-- 헤더 컨테이너 -->
<div class="bg-white border-b border-gray-200 px-6 py-4">
  <div class="flex items-center justify-between">
    <!-- 좌측: 제목과 학기 선택 -->
    <div class="flex items-center gap-4">
      <h1 class="text-xl font-bold text-gray-800 flex items-center gap-2">
        <span class="text-blue-500">📅</span>
        주간 시간표
      </h1>
      
      <!-- 학기 선택 드롭다운 -->
      <select 
        class="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        bind:value={selectedSemester}
      >
        {#each semesters as semester}
          <option value={semester}>{semester}</option>
        {/each}
      </select>
    </div>

    <!-- 우측: 학점 정보와 액션 버튼들 -->
    <div class="flex items-center gap-4">
      <!-- 학점 정보 -->
      <div class="{creditStatus.status === 'success' ? 'bg-blue-50 border-blue-200' : creditStatus.status === 'warning' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'} px-4 py-2 rounded-lg border">
        <div class="text-sm {creditStatus.status === 'success' ? 'text-blue-600' : creditStatus.status === 'warning' ? 'text-yellow-600' : 'text-red-600'} font-medium">
          총 {totalCredits}학점
        </div>
        <div class="text-xs {creditStatus.status === 'success' ? 'text-blue-500' : creditStatus.status === 'warning' ? 'text-yellow-500' : 'text-red-500'}">
          {creditStatus.message} ({minCredits}~{maxCredits}학점)
        </div>
      </div>

      <!-- 진행률 바 -->
      <div class="flex flex-col items-center gap-1">
        <div class="text-xs text-gray-500">신청 진행률</div>
        <div class="w-24 bg-gray-200 rounded-full h-2">
          <div 
            class="{creditStatus.status === 'success' ? 'bg-blue-500' : creditStatus.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'} h-2 rounded-full transition-all duration-300"
            style="width: {Math.min(100, (totalCredits / maxCredits) * 100)}%"
          ></div>
        </div>
      </div>

      <!-- 액션 버튼들 -->
      <div class="flex items-center gap-2">
        <!-- 초기화 버튼 -->
        <button 
          class="px-3 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors text-sm flex items-center gap-1"
          onclick={resetTimetable}
          title="장바구니 비우기"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          초기화
        </button>

        <!-- PNG 다운로드 버튼 -->
        <button 
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm flex items-center gap-2"
          onclick={downloadPNG}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          PNG 저장
        </button>

        <!-- 공유 버튼 -->
        <button 
          class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm flex items-center gap-2"
          onclick={shareTimetable}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
          </svg>
          공유하기
        </button>
      </div>
    </div>
  </div>
</div>
