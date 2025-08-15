<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Lecture, Gap } from "$lib/types";
  import { getRiskIcon, getGapStyle } from "$lib/stores";

  type TimetableBlock = {
    id: string; title: string; instructor: string; room: string; building: string;
    day: number; startTime: number; endTime: number; color: string;
    isConflict?: boolean; isConsecutiveWarning?: boolean;
    courseId: string; classId: string;
  };

  let { 
    blocks = [],
    displayedDays = ["월", "화", "수", "목", "금"],
    conflictPairs = [],
    consecutiveWarnings = [],
    gaps = []
  } = $props<{
    blocks: TimetableBlock[];
    displayedDays: string[];
    conflictPairs: Array<[TimetableBlock, TimetableBlock]>;
    consecutiveWarnings: Array<{ from: TimetableBlock; to: TimetableBlock; travelTime: number; isImpossible: boolean; }>;
    gaps: Gap[];
  }>();

  const timeSlots = Array.from({ length: 20 }, (_, i) => {
    const hour = 9 + Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return { slot: i, label: minute === 0 ? `${hour}:00` : '', minute: minute };
  });
  
  const dispatch = createEventDispatcher<{
    remove: { courseId: string; classId: string };
    suggest: { block: TimetableBlock };
  }>();

  function removeBlock(blockId: string) {
    const block = blocks.find((b: TimetableBlock) => b.id === blockId);
    if (block) { dispatch('remove', { courseId: block.courseId, classId: block.classId }); }
  }
  
  function suggestAlternatives(conflictBlock: TimetableBlock) {
    dispatch('suggest', { block: conflictBlock });
  }

  function formatTime(slot: number): string {
    const hour = 9 + Math.floor(slot / 2);
    const minute = (slot % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }

  // CSS Grid 설정
  const DAY_TO_COLUMN: Record<string, number> = {
    '월': 2, '화': 3, '수': 4, '목': 5, '금': 6
  };
</script>

<div class="p-6 bg-white" data-timetable-grid>
  <!-- CSS Grid 기반 시간표 -->
  <div class="timetable-grid">
    <!-- 헤더 -->
    <div class="grid-header">시간</div>
    {#each displayedDays as day}
      <div class="grid-header day-header">{day}</div>
    {/each}
    
    <!-- 시간 슬롯들 -->
    {#each timeSlots as timeSlot, i}
      {#if timeSlot.minute === 0}
        <div class="time-label" style="grid-row: {i + 2} / {i + 4};">
          {timeSlot.label}
        </div>
      {/if}
      
      {#each displayedDays as day, j}
        <div 
          class="grid-cell {timeSlot.minute === 0 ? 'hour-start' : 'half-hour'}"
          style="grid-column: {j + 2}; grid-row: {i + 2};"
        ></div>
      {/each}
    {/each}
    
    <!-- 강의 블록들 -->
    {#each blocks as block}
      <div
        class="lecture-block {block.color} {block.isConflict ? 'conflict' : ''}"
        style="
          grid-column: {block.day + 2};
          grid-row: {block.startTime + 2} / {block.endTime + 2};
          z-index: 10;
        "
      >
        <div class="lecture-content">
          <div class="lecture-title">{block.title}</div>
          <div class="lecture-instructor">{block.instructor}</div>
          <div class="lecture-location">{block.building} {block.room}</div>
        </div>
        <button 
          class="remove-btn"
          onclick={() => removeBlock(block.id)}
          title="강의 제거"
        >×</button>
      </div>
    {/each}
    
    <!-- 연강 경고 블록들 -->
    {#each gaps as gap}
      <div 
        style={getGapStyle(gap)}
        class="gap-block relative group hover:scale-125 transition-all duration-200"
        title={`${gap.fromLecture} → ${gap.toLecture}\n이동시간: ${gap.requiredTime}분\n상태: ${gap.warningMessage}`}
      >
        <!-- 간격 표시 내용 -->
        <div class="flex items-center justify-center gap-1 text-xs">
          <span class="text-xs">{getRiskIcon(gap.risk)}</span>
          <span class="text-xs font-bold">{gap.warningMessage}</span>
        </div>
        
        <!-- 호버 툴팁 -->
        <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
          <div class="font-semibold mb-1">🚨 이동 안내</div>
          <div class="space-y-1">
            <div>📚 {gap.fromLecture} → {gap.toLecture}</div>
            <div>🏫 {gap.from} → {gap.to}</div>
            <div>⏱️ 이동시간: {gap.requiredTime}분</div>
            <div>📊 간격: {gap.gapMinutes}분</div>
            <div>🎯 상태: {gap.warningMessage}</div>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <!-- 기존 경고 목록 제거 - 시간표 내부 경고만 사용 -->
</div>

<style>
  .timetable-grid {
    display: grid;
    grid-template-columns: 80px repeat(5, 1fr);
    grid-template-rows: 48px repeat(20, 24px);
    gap: 1px;
    background-color: #e5e7eb;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .grid-header {
    background-color: #f9fafb;
    border: 1px solid #d1d5db;
    padding: 8px;
    text-align: center;
    font-weight: 600;
    font-size: 0.875rem;
    color: #374151;
  }
  
  .day-header {
    background-color: #dbeafe !important;
    color: #1d4ed8 !important;
  }
  
  .time-label {
    background-color: #f9fafb;
    border: 1px solid #d1d5db;
    padding: 4px;
    text-align: center;
    font-size: 0.75rem;
    color: #6b7280;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .grid-cell {
    background-color: white;
    border: 1px solid #e5e7eb;
    position: relative;
  }
  
  .hour-start {
    border-top: 2px dashed #d1d5db !important;
  }
  
  .lecture-block {
    position: relative;
    margin: 2px;
    border-radius: 6px;
    border-left: 4px solid #3b82f6;
    padding: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
  }
  
  .lecture-block.conflict {
    border-left-color: #ef4444 !important;
  }
  
  .lecture-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .lecture-title {
    font-weight: 600;
    font-size: 0.75rem;
    color: #1f2937;
    line-height: 1.2;
  }
  
  .lecture-instructor {
    font-size: 0.625rem;
    color: #4b5563;
    line-height: 1.2;
  }
  
  .lecture-location {
    font-size: 0.625rem;
    color: #6b7280;
    line-height: 1.2;
  }
  
  .remove-btn {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 16px;
    height: 16px;
    background-color: #ef4444;
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.7;
    transition: opacity 0.2s;
  }
  
  .remove-btn:hover {
    opacity: 1;
    background-color: #dc2626;
  }
  
  .gap-block {
    margin: 2px;
    border-radius: 4px;
    font-size: 0.7rem;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: transform 0.2s;
  }
  
  .gap-block:hover {
    transform: scale(1.25);
  }
  
  /* 색상 클래스들 (기존 유지) */
  .bg-blue-100 { background-color: #dbeafe; }
  .bg-green-100 { background-color: #dcfce7; }
  .bg-yellow-100 { background-color: #fef3c7; }
  .bg-purple-100 { background-color: #e9d5ff; }
  .bg-pink-100 { background-color: #fce7f3; }
  .bg-indigo-100 { background-color: #e0e7ff; }
  .bg-red-100 { background-color: #fee2e2; }
  .bg-orange-100 { background-color: #fed7aa; }
</style>
