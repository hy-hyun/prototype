<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Lecture } from "$lib/types";

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
    consecutiveWarnings = []
  } = $props<{
    blocks: TimetableBlock[];
    displayedDays: string[];
    // conflictPairs, consecutiveWarnings props are kept for future use if needed
    conflictPairs: Array<[TimetableBlock, TimetableBlock]>;
    consecutiveWarnings: Array<{ from: TimetableBlock; to: TimetableBlock; travelTime: number; isImpossible: boolean; }>;
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
    const block = blocks.find(b => b.id === blockId);
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
</script>

<div class="p-6 bg-white" data-timetable-grid>
  <table class="w-full border-collapse">
    <thead>
      <tr class="h-12">
        <th class="w-16 border p-2 text-sm font-medium bg-gray-50 text-gray-600">시간</th>
        {#each displayedDays as day}
          <th class="border p-2 text-sm font-medium bg-blue-50 text-blue-700">{day}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each timeSlots as timeSlot, i}
        <tr class="h-6">
          {#if timeSlot.minute === 0}
            <td class="border-r border-gray-200 text-center text-xs text-gray-500" rowspan="2">
              {timeSlot.label}
            </td>
          {/if}
          {#each displayedDays as day, j}
            <td class="border relative {timeSlot.minute === 0 ? 'border-t-dashed' : ''}">
              <!-- Blocks for this specific cell -->
              {#each blocks.filter(b => b.day === j && b.startTime === timeSlot.slot) as block}
                <div
                  class="absolute {block.color} border-l-4 {block.isConflict ? 'border-l-red-500' : 'border-l-blue-500'} p-1 text-xs overflow-hidden"
                  style="
                    top: 0;
                    left: 0;
                    right: 0;
                    height: {(block.endTime - block.startTime) * 1.5}rem;
                    z-index: 10;
                  "
                >
                  <div class="font-semibold text-gray-800 leading-tight">{block.title}</div>
                  <div class="text-gray-600 text-[10px] leading-tight">{block.instructor}</div>
                  <div class="text-gray-500 text-[10px] leading-tight">{block.building} {block.room}</div>
                  <button 
                    class="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center opacity-50 hover:opacity-100"
                    onclick={() => removeBlock(block.id)}
                  > × </button>
                </div>
              {/each}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>

  <!-- 시간표 경고 목록 -->
  {#if conflictPairs.length > 0 || consecutiveWarnings.length > 0}
    <div class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h4 class="font-semibold text-lg text-gray-800 mb-3">⚠️ 시간표 경고</h4>
      <div class="space-y-3">
        {#if conflictPairs.length > 0}
          <div>
            <h5 class="font-medium text-red-600">시간 중복</h5>
            <ul class="list-disc list-inside text-sm text-gray-700 mt-1 space-y-1">
              {#each conflictPairs as [blockA, blockB]}
                <li>
                  <strong>{blockA.title}</strong> ({["월","화","수","목","금","토","일"][blockA.day]} {formatTime(blockA.startTime)})와 <strong>{blockB.title}</strong> ({["월","화","수","목","금","토","일"][blockB.day]} {formatTime(blockB.startTime)}) 시간이 겹칩니다.
                </li>
              {/each}
            </ul>
          </div>
        {/if}
        
        {#if consecutiveWarnings.length > 0}
          <div>
            <h5 class="font-medium text-orange-600">이동 시간 부족</h5>
             <ul class="list-disc list-inside text-sm text-gray-700 mt-1 space-y-1">
              {#each consecutiveWarnings as warning}
                <li class={warning.isImpossible ? 'text-red-700 font-bold' : ''}>
                   <strong>{warning.from.title}</strong> ({warning.from.building}) → <strong>{warning.to.title}</strong> ({warning.to.building}): 이동시간 {warning.travelTime}분 소요. {#if warning.isImpossible}(이동 불가능){/if}
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
