<script lang="ts">
  import { cart, applications } from "$lib/stores";

  // props로 전달받을 수 있도록 추가 (TimetableGrid에서 사용) - Svelte 5 문법
  interface Props {
    consecutiveWarnings?: Array<{
      from: any;
      to: any;
      travelTime: number;
      isImpossible: boolean;
    }>;
  }
  
  let { consecutiveWarnings = [] }: Props = $props();

  // 기본 연강 발생하는 과목들 감지 (cart 기반)
  let defaultConsecutiveClasses = $derived(detectConsecutiveClasses([...$cart, ...$applications.map(app => ({ courseId: app.courseId, classId: app.classId, method: "FCFS" as const }))]));
  
  // 최종 연강 클래스 (props가 있으면 props 사용, 없으면 기본 감지)
  let finalConsecutiveClasses = $derived(consecutiveWarnings.length > 0 ? consecutiveWarnings : defaultConsecutiveClasses);

  function detectConsecutiveClasses(allItems: Array<{courseId: string, classId: string, method: string}>) {
    const dummyLectures = [
      {
        courseId: "CSE101", classId: "01", title: "컴퓨터개론", instructor: "김교수",
        schedule: [{ day: 1, start: 9, end: 11, building: "IT", room: "101" }]
      },
      {
        courseId: "CSE102", classId: "01", title: "프로그래밍기초", instructor: "이교수", 
        schedule: [{ day: 1, start: 11, end: 13, building: "IT", room: "201" }]
      },
      {
        courseId: "MAT101", classId: "01", title: "미적분학", instructor: "박교수",
        schedule: [{ day: 1, start: 13, end: 15, building: "SCI", room: "301" }]
      },
      {
        courseId: "CSE201", classId: "01", title: "자료구조", instructor: "정교수",
        schedule: [{ day: 3, start: 9, end: 11, building: "IT", room: "102" }]
      },
      {
        courseId: "CSE202", classId: "01", title: "알고리즘", instructor: "강교수",
        schedule: [{ day: 3, start: 11, end: 13, building: "IT", room: "102" }]
      },
      {
        courseId: "CSE301", classId: "01", title: "데이터베이스", instructor: "한교수",
        schedule: [{ day: 5, start: 9, end: 11, building: "IT", room: "301" }]
      },
      {
        courseId: "CSE302", classId: "01", title: "운영체제", instructor: "오교수",
        schedule: [{ day: 5, start: 11, end: 13, building: "IT", room: "301" }]
      },
      {
        courseId: "CSE303", classId: "01", title: "네트워크", instructor: "서교수",
        schedule: [{ day: 5, start: 13, end: 15, building: "IT", room: "301" }]
      }
    ];

    const consecutives: any[] = [];
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

    // 요일별로 그룹화
    const classesByDay: Record<number, any[]> = {};
    allItems.forEach(item => {
      const lecture = dummyLectures.find(l => 
        l.courseId === item.courseId && l.classId === item.classId
      );
      if (lecture) {
        lecture.schedule.forEach(schedule => {
          if (!classesByDay[schedule.day]) {
            classesByDay[schedule.day] = [];
          }
          classesByDay[schedule.day].push({
            ...schedule,
            title: lecture.title,
            courseId: lecture.courseId
          });
        });
      }
    });

    // 각 요일별로 연강 체크
    Object.keys(classesByDay).forEach(dayStr => {
      const day = parseInt(dayStr);
      const classes = classesByDay[day].sort((a: any, b: any) => a.start - b.start);
      
      for (let i = 0; i < classes.length - 1; i++) {
        const current = classes[i];
        const next = classes[i + 1];
        
        // 연강 조건: 현재 수업 끝 시간 = 다음 수업 시작 시간
        if (current.end === next.start) {
          consecutives.push({
            day: day,
            dayName: dayNames[day],
            classes: [current, next],
            startTime: current.start,
            endTime: next.end,
            buildings: [current.building, next.building],
            rooms: [current.room, next.room]
          });
        }
      }
    });

    return consecutives;
  }

  // 건물 간 이동시간 매트릭스 (분 단위) - TimetableGrid와 동일
  const buildingTravelTime: Record<string, Record<string, number>> = {
    "IT": { "IT": 0, "SCI": 5, "HUM": 10, "BIZ": 8, "ENG": 7 },
    "SCI": { "IT": 5, "SCI": 0, "HUM": 8, "BIZ": 12, "ENG": 6 },
    "HUM": { "IT": 10, "SCI": 8, "HUM": 0, "BIZ": 5, "ENG": 9 },
    "BIZ": { "IT": 8, "SCI": 12, "HUM": 5, "BIZ": 0, "ENG": 11 },
    "ENG": { "IT": 7, "SCI": 6, "HUM": 9, "BIZ": 11, "ENG": 0 }
  };

  function getTravelTime(building1: string, building2: string): number {
    return buildingTravelTime[building1]?.[building2] || 10;
  }

  function getWarningLevel(travelTime: number): string {
    if (travelTime === 0) return "safe"; // 같은 건물
    if (travelTime <= 5) return "caution"; // 5분 이내
    if (travelTime <= 10) return "warning"; // 10분 이내
    return "danger"; // 10분 초과
  }
  
  // 연강 경고 데이터를 표준 형식으로 변환
  function formatConsecutiveWarnings() {
    if (consecutiveWarnings.length > 0) {
      // TimetableGrid에서 전달된 경고 사용
      return consecutiveWarnings.map(warning => ({
        from: warning.from,
        to: warning.to,
        travelTime: warning.travelTime,
        isImpossible: warning.isImpossible,
        warningLevel: getWarningLevel(warning.travelTime),
        dayName: ["일", "월", "화", "수", "목", "금", "토"][warning.from.day + 1] || "미정"
      }));
    } else {
      // 기본 감지된 연강 사용
      return defaultConsecutiveClasses;
    }
  }
  
  let formattedWarnings = $derived(formatConsecutiveWarnings());
</script>

{#if formattedWarnings.length > 0}
  <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 rounded-md">
    <div class="flex items-center mb-3">
      <div class="flex-shrink-0">
        <svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
        </svg>
      </div>
      <div class="ml-3 flex-1">
        <h3 class="text-sm font-medium text-blue-800">
          🏃‍♂️ 연강 이동시간 주의! {formattedWarnings.length}개 연강이 감지되었습니다
        </h3>
        <p class="text-xs text-blue-700 mt-1">건물 간 이동시간을 고려하여 수강신청하세요</p>
      </div>
    </div>
    
    <div class="space-y-3">
      {#each formattedWarnings as warning}
        <div class="bg-white rounded-lg p-3 border {warning.isImpossible ? 'border-red-300' : 'border-blue-200'} shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <div class="font-medium text-gray-900 text-sm">
              {#if warning.from && warning.to}
                {warning.dayName}요일: {warning.from.title} → {warning.to.title}
              {:else}
                {warning.dayName}요일 {warning.startTime}:00-{warning.endTime}:00 연강
              {/if}
            </div>
            <div class="flex items-center gap-2">
              {#if warning.warningLevel === "safe"}
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span class="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                  안전
                </span>
              {:else if warning.warningLevel === "caution"}
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <span class="w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
                  주의 ({warning.travelTime}분)
                </span>
              {:else if warning.warningLevel === "warning"}
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-200 text-blue-900">
                  <span class="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                  경고 ({warning.travelTime}분)
                </span>
              {:else}
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <span class="w-2 h-2 bg-red-400 rounded-full mr-1"></span>
                  위험 ({warning.travelTime}분)
                </span>
              {/if}
            </div>
          </div>
          
          <div class="space-y-1 text-sm text-gray-600">
            {#if warning.from && warning.to}
              <!-- TimetableGrid에서 전달된 데이터 -->
              <div class="grid grid-cols-2 gap-4">
                <div class="flex items-center space-x-2">
                  <span class="font-medium">{warning.from.title}</span>
                  <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {warning.from.building} {warning.from.room}
                  </span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="font-medium">{warning.to.title}</span>
                  <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    {warning.to.building} {warning.to.room}
                  </span>
                </div>
              </div>
              <div class="text-xs text-gray-500 flex items-center gap-2 mt-2">
                <span>🕐 {warning.from.startTime}:00-{warning.from.endTime}:00 → {warning.to.startTime}:00-{warning.to.endTime}:00</span>
              </div>
            {:else if warning.classes}
              <!-- 기본 감지된 데이터 -->
              {#each warning.classes as cls, i}
                <div class="flex items-center">
                  <span class="font-medium">{cls.title}</span>
                  <span class="mx-2">•</span>
                  <span>{cls.building} {cls.room}</span>
                  <span class="mx-2">•</span>
                  <span>{cls.start}:00-{cls.end}:00</span>
                </div>
              {/each}
            {/if}
          </div>
          
          <div class="mt-2 flex items-center justify-between">
            <div class="text-xs text-gray-500">
              {#if warning.from && warning.to}
                💡 {warning.from.building}에서 {warning.to.building}까지 약 {warning.travelTime}분 소요
              {:else}
                💡 건물 간 이동시간: 약 {warning.travelTime}분
              {/if}
            </div>
            {#if warning.isImpossible}
              <div class="text-xs text-red-600 font-medium">
                ⚠️ 이동 불가능
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
    
    <div class="mt-4 p-3 bg-yellow-100 rounded-lg">
      <div class="text-xs text-yellow-800">
        <div class="font-medium mb-1">💡 연강 이동시간 가이드:</div>
        <ul class="space-y-1 ml-3">
          <li>• 같은 건물: 즉시 이동 가능</li>
          <li>• 5분 이내: 여유 있게 이동 가능</li>
          <li>• 10분 이내: 빠르게 이동해야 함</li>
          <li>• 10분 초과: 이동 불가능, 다른 분반 고려</li>
        </ul>
      </div>
    </div>
  </div>
{/if}
