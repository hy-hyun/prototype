<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Lecture, Gap } from "$lib/types";
  import { getRiskIcon, getGapStyle } from "$lib/stores";
  import type { DistanceWarningResult } from "$lib/utils/distanceWarning";

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
    distanceWarnings = [],
    noTimeSlotCourses = []
  } = $props<{
    blocks: TimetableBlock[];
    displayedDays: string[];
    conflictPairs: Array<[TimetableBlock, TimetableBlock]>;
    distanceWarnings: DistanceWarningResult[];
    noTimeSlotCourses: Lecture[];
  }>();

  // 시간 슬롯을 9시~21시까지 30분 간격으로 확장 (24개 슬롯)
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = 9 + Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return { 
      slot: i, 
      label: minute === 0 ? `${hour}:00` : '', 
      minute: minute,
      hour: hour
    };
  });
  
  const dispatch = createEventDispatcher<{
    remove: { courseId: string; classId: string };
    suggest: { block: TimetableBlock };
    removeNoTimeSlot: Lecture;
  }>();

  function removeBlock(blockId: string) {
    const block = blocks.find((b: TimetableBlock) => b.id === blockId);
    if (block) { dispatch('remove', { courseId: block.courseId, classId: block.classId }); }
  }
  
  function suggestAlternatives(conflictBlock: TimetableBlock) {
    dispatch('suggest', { block: conflictBlock });
  }
  
  function removeNoTimeSlotCourse(course: Lecture) {
    dispatch('removeNoTimeSlot', course);
  }

  function formatTime(slot: number): string {
    const hour = 9 + slot;
    return `${hour.toString().padStart(2, '0')}:00`;
  }

  function formatSlotTime(slot: number): string {
    const hour = 9 + Math.floor(slot / 2);
    const minute = (slot % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }

  const dayIndexToName = ["일", "월", "화", "수", "목", "금", "토"];

  // CSS Grid 설정
  const DAY_TO_COLUMN: Record<string, number> = {
    '월': 2, '화': 3, '수': 4, '목': 5, '금': 6
  };
</script>

<div class="p-6 bg-white flex flex-col" data-timetable-grid>
  <!-- CSS Grid 기반 시간표 -->
  <div class="timetable-grid">
    <!-- 헤더 -->
    <div class="grid-header">시간</div>
    <div class="grid-header day-header">월</div>
    <div class="grid-header day-header">화</div>
    <div class="grid-header day-header">수</div>
    <div class="grid-header day-header">목</div>
    <div class="grid-header day-header">금</div>
    
    <!-- 시간 슬롯들 -->
    {#each timeSlots as timeSlot, i}
      {#if timeSlot.minute === 0}
        <div class="time-label" style="grid-row: {i + 2} / {i + 4};">
          {timeSlot.label}
        </div>
      {/if}
      
      <!-- 월화수목금 그리드 셀들 (30분 간격) -->
      <div class="grid-cell {timeSlot.minute === 0 ? 'hour-start' : 'half-hour'}" style="grid-column: 2; grid-row: {i + 2};"></div>
      <div class="grid-cell {timeSlot.minute === 0 ? 'hour-start' : 'half-hour'}" style="grid-column: 3; grid-row: {i + 2};"></div>
      <div class="grid-cell {timeSlot.minute === 0 ? 'hour-start' : 'half-hour'}" style="grid-column: 4; grid-row: {i + 2};"></div>
      <div class="grid-cell {timeSlot.minute === 0 ? 'hour-start' : 'half-hour'}" style="grid-column: 5; grid-row: {i + 2};"></div>
      <div class="grid-cell {timeSlot.minute === 0 ? 'hour-start' : 'half-hour'}" style="grid-column: 6; grid-row: {i + 2};"></div>
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
    
    <!-- 이동거리 경고 구분선 -->
    {#each distanceWarnings as warning}
      {@const fromLecture = warning.fromLecture}
      {@const toLecture = warning.toLecture}
      {@const fromBlock = blocks.find((b: TimetableBlock) => b.courseId === fromLecture.courseId && b.classId === fromLecture.classId)}
      {@const toBlock = blocks.find((b: TimetableBlock) => b.courseId === toLecture.courseId && b.classId === toLecture.classId)}
      
      {#if fromBlock && toBlock && fromBlock.day === toBlock.day && fromBlock.endTime === toBlock.startTime}
        <div
          class="distance-warning-indicator"
          style="
            grid-column: {fromBlock.day + 2};
            grid-row: {fromBlock.endTime + 2};
            background-color: {warning.info.color};
          "
          title="{warning.fromBuilding} → {warning.toBuilding}: {warning.info.message}"
        ></div>
      {/if}
    {/each}
    
    <!-- 연강 경고 블록들 -->
    
  </div>
    <!-- 시간 정보가 없는 과목들 섹션 -->
    {#if noTimeSlotCourses.length > 0}
    <div class="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
      <h3 class="text-base font-semibold text-amber-800 mb-3 flex items-center gap-2">
        <span class="text-lg">📝</span>
        시간 미지정 과목
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {#each noTimeSlotCourses as course}
          <div class="no-time-slot-card">
            <div class="flex items-start justify-between mb-2">
              <div class="flex-1 min-w-0">
                <div class="course-title font-semibold text-gray-800 text-sm mb-1 line-clamp-2">
                  {course.title}
                </div>
                <div class="course-id text-xs text-amber-700 font-medium mb-1">
                  {course.courseId} · {course.classId}
                </div>
                <div class="course-instructor text-xs text-gray-600 mb-1">
                  {course.instructor}
                </div>
                <div class="course-credits text-xs text-amber-600 font-medium">
                  {(course.credits.lecture || 0) + (course.credits.lab || 0)}학점
                  {#if course.credits.lecture && course.credits.lab}
                    (이론 {course.credits.lecture}, 실습 {course.credits.lab})
                  {/if}
                </div>
              </div>
              <button 
                class="remove-no-time-btn"
                onclick={() => removeNoTimeSlotCourse(course)}
                title="과목 제거"
              >
                ×
              </button>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
  <!-- 이동거리 경고 섹션 -->
  {#if distanceWarnings.length > 0}
    <div class="mt-4 p-4 bg-gray-50 rounded-lg">
      <h3 class="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <span class="text-lg">🚶‍♂️</span>
        연강 안내
      </h3>
      <div class="space-y-2">
        {#each distanceWarnings as warning}
          {#if warning.info}
            <div class="distance-warning {warning.info.bgColor} {warning.info.borderColor} border rounded-lg p-3">
              <div class="flex items-start gap-2">
                <span class="text-lg mt-1">{warning.info.icon}</span>
                <div class="flex-1">
                  <div class="text-base font-medium {warning.info.color}">
                    {warning.info.message}
                    {#if warning.day !== undefined && warning.startTime !== undefined}
                      <span class="font-medium ml-2">[{dayIndexToName[warning.day]} {formatSlotTime(warning.startTime)}]</span>
                    {/if}
                  </div>
                  <div class="text-sm text-gray-600 mt-1">
                    <span class="font-semibold">{warning.fromLecture.title}</span> → <span class="font-semibold">{warning.toLecture.title}</span>
                  </div>
                  <div class="text-sm text-gray-500 mt-1">
                    {warning.fromBuilding} → {warning.toBuilding}
                  </div>
                </div>
              </div>
            </div>
          {/if}
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .timetable-grid {
    display: grid;
    grid-template-columns: 120px repeat(5, 1fr);
    grid-template-rows: 40px repeat(24, 35px);
    gap: 0px;
    background-color: #ffffff;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    overflow: hidden;
    height: 880px;
    width: 100%;
    min-width: 700px;
    max-width: none;
  }
  
  .grid-header {
    background-color: #f9fafb;
    border: none;
    padding: 10px 6px;
    text-align: center;
    font-weight: 600;
    font-size: 0.8rem;
    color: #374151;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .day-header {
    background-color: #3b82f6;
    color: white;
    font-weight: 700;
    font-size: 1rem;
    border-left: 1px solid #e5e7eb;
    border-right: 1px solid #e5e7eb;
  }
  
  .time-label {
    background-color: #f9fafb;
    border: none;
    padding: 12px 8px;
    text-align: center;
    font-size: 1rem;
    color: #374151;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
  }
  
  .grid-cell {
    background-color: #ffffff;
    border-left: 1px solid #e5e7eb;
    border-right: 1px solid #e5e7eb;
    position: relative;
    min-height: 30px;
  }
  
  .hour-start {
    border-top: 1px solid #d1d5db !important;
  }
  
  .half-hour {
    border-top: none !important;
  }
  
  .lecture-block {
    position: relative;
    margin: 1px;
    border-radius: 4px;
    border-left: 4px solid #3b82f6;
    padding: 4px 6px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    min-height: 30px;
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
    font-size: 0.875rem;
    color: #1f2937;
    line-height: 1.2;
    word-break: break-word;
  }
  
  .lecture-instructor {
    font-size: 0.75rem;
    color: #4b5563;
    line-height: 1.1;
  }
  
  .lecture-location {
    font-size: 0.75rem;
    color: #6b7280;
    line-height: 1.1;
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
  
  .distance-warning-indicator {
    height: 4px;
    margin: -2px 4px 0 4px;
    border-radius: 2px;
    z-index: 15;
    align-self: start;
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
  
  .distance-warning {
    transition: all 0.2s ease-in-out;
  }
  
  .distance-warning:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  /* 시간 미지정 과목 카드 스타일 */
  .no-time-slot-card {
    background: white;
    border: 1px solid #fbbf24;
    border-radius: 8px;
    padding: 12px;
    position: relative;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(245, 158, 11, 0.1);
  }
  
  .no-time-slot-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(245, 158, 11, 0.15);
  }
  
  .course-title {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .course-category {
    background: rgba(245, 158, 11, 0.1);
    color: #92400e;
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 4px;
    text-align: center;
    font-weight: 500;
  }
  
  .remove-no-time-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 20px;
    height: 20px;
    background-color: #ef4444;
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.7;
    transition: all 0.2s ease;
    z-index: 1;
  }
  
  .remove-no-time-btn:hover {
    opacity: 1;
    background-color: #dc2626;
    transform: scale(1.1);
  }
</style>
