<script lang="ts">
  import { dashboardData } from '$lib/mock/dashboardData';
  import type { LearningJourney } from '$lib/types';
  
  // 김민우 학생 데이터
  let userName = dashboardData.userInfo.name;
  let currentSemester = dashboardData.userInfo.currentSemester;
  let totalCredits = dashboardData.userInfo.totalCredits;
  let requiredCredits = dashboardData.userInfo.requiredCredits;
  
  // 다중전공 데이터 구조
  let majors = dashboardData.majors;
  
  let selectedMajor = $state('main');
  let selectedSemester = $state('1-1'); // 교양필수 학기 선택
  
  // 교양 영역별 상세 데이터 (다중전공 기준)
  let generalEducation = dashboardData.generalEducation;
  
  // 러닝저니 데이터 (학기별 학점 축적) - 김민우 학생 데이터
  let learningJourney = dashboardData.learningJourney;
  
  // 추천 강의 데이터
  let recommendedCourses = dashboardData.recommendedCourses;
  
  // 기본 수업 데이터
  let basicCourses = dashboardData.basicCourses;
  
  // 툴팁 상태
  let tooltip = $state<{
    show: boolean;
    x: number;
    y: number;
    data: LearningJourney | null;
  }>({
    show: false,
    x: 0,
    y: 0,
    data: null,
  });
  
  let graphAreaContainer: HTMLDivElement;

  // 툴팁 표시 함수
  function showTooltip(journey: LearningJourney, index: number) {
    const element = document.querySelector(`[data-journey-index="${index}"]`);
    if (element && graphAreaContainer) {
      const elementRect = element.getBoundingClientRect();
      const containerRect = graphAreaContainer.getBoundingClientRect();
      tooltip = {
        show: true,
        x: elementRect.left - containerRect.left + elementRect.width / 2,
        y: elementRect.top - containerRect.top,
        data: journey,
      };
    }
  }
  
  // 툴팁 숨김 함수
  function hideTooltip() {
    tooltip = { ...tooltip, show: false };
  }

	// 그래프 경로 계산
	const getCurvePath = (points: { x: number; y: number }[]) => {
		if (points.length < 1) return '';
		// M command for the first point, L for the rest, creating straight lines.
		return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
	};

	const curvePoints = $derived(
		learningJourney.map((p, i) => ({
			x: (i / (learningJourney.length - 1)) * 100,
			y: 100 - (p.cumulative / 200) * 100,
		}))
	);

	const splitIndex = $derived(learningJourney.findIndex((p) => p.isFuture));

	const fullCurvePath = $derived(getCurvePath(curvePoints));
	const fullAreaPath = $derived(
		(() => {
			if (curvePoints.length < 2) return 'M 0 100 Z';
			const lastPoint = curvePoints[curvePoints.length - 1];
			const firstPoint = curvePoints[0];
			return `${fullCurvePath} L ${lastPoint.x} 100 L ${firstPoint.x} 100 Z`;
		})()
	);

	const completedPoints = $derived(
		splitIndex === -1 ? curvePoints : curvePoints.slice(0, splitIndex)
	);
	const completedStrokePath = $derived(getCurvePath(completedPoints));
	const completedAreaPath = $derived(
		(() => {
			if (completedPoints.length < 2) return 'M 0 100 Z';
			const lastPoint = completedPoints[completedPoints.length - 1];
			const firstPoint = completedPoints[0];
			return `${completedStrokePath} L ${lastPoint.x} 100 L ${firstPoint.x} 100 Z`;
		})()
	);

	const futurePoints = $derived(splitIndex === -1 ? [] : curvePoints.slice(splitIndex - 1));
	const futureStrokePath = $derived(getCurvePath(futurePoints));

	// 타임라인 데이터 분할
	let journeyMidpoint = $derived(Math.ceil(learningJourney.length / 2));
	let journeyPart1 = $derived(learningJourney.slice(0, journeyMidpoint));
	let journeyPart2 = $derived(learningJourney.slice(journeyMidpoint));

	// 선택된 영역 정보 상태
  let selectedArea: { name: string; completed: number; required: number } | null = $state(null);
  let donutTooltip = $state({ visible: false, area: '', completed: 0, required: 0 });
  
  // 아코디언 상태
  let expandedCards = $state({
    basicCourses: false,
    recommendedCourses: false,
    quickActions: false,
    teachingMajor: false,
    teachingProfession: false,
    teachingSubject: false,
    teachingAptitude: false,
    teachingPractice: false
  });
  
  // 졸업 섹션 상태
  let graduationSections = $state({
    majors: false,
    general: false
  });
  
  // 영역 정보 표시 함수
  function showAreaInfo(name: string, completed: number, required: number) {
    selectedArea = { name, completed, required };
  }
  
  // 아코디언 토글 함수
  function toggleAccordion(cardType: 'basicCourses' | 'recommendedCourses' | 'quickActions' | 'teachingMajor' | 'teachingProfession' | 'teachingSubject' | 'teachingAptitude' | 'teachingPractice') {
    expandedCards[cardType] = !expandedCards[cardType];
  }

  // 교직이수 영역별 이수 계산
  const { major, profession } = dashboardData.teachingCourses;

  const completedFieldsCount = $derived({
    basic: new Set(major.categories.basic.courses.filter(c => c.status === 'completed').map(c => c.fieldId)).size,
    subjectEducation: new Set(major.categories.subjectEducation.courses.filter(c => c.status === 'completed').map(c => c.fieldId)).size,
    theory: new Set(profession.categories.theory.courses.filter(c => c.status === 'completed').map(c => c.fieldId)).size,
    aptitude: new Set(profession.categories.aptitude.courses.filter(c => c.status === 'completed').map(c => c.fieldId)).size,
    practice: new Set(profession.categories.practice.courses.filter(c => c.status === 'completed').map(c => c.fieldId)).size,
  });

  const totalFields = $derived({
    basic: major.categories.basic.fields,
    subjectEducation: major.categories.subjectEducation.fields,
    theory: profession.categories.theory.fields,
    aptitude: profession.categories.aptitude.fields,
    practice: profession.categories.practice.fields
  });

  const getProgressColor = (completed: number, total: number) => {
    if (total === 0) return 'bg-green-500';
    const percentage = (completed / total) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-pink-500';
  };

  const getProgressTextColor = (completed: number, total: number) => {
    if (total === 0) return 'text-green-600';
    const percentage = (completed / total) * 100;
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-pink-600';
  };

  const getProgressBadgeClass = (completed: number, total: number) => {
    if (total === 0) return 'bg-green-100 text-green-700';
    const percentage = (completed / total) * 100;
    if (percentage >= 100) return 'bg-green-100 text-green-700';
    if (percentage >= 50) return 'bg-yellow-100 text-yellow-700';
    return 'bg-pink-100 text-pink-700';
  };

  const coreAreaColors = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#a8d5ff'];

  const getXAxisLabelTransform = (index: number, total: number) => {
    if (index === 0) {
      return 'translateX(0%)';
    }
    if (index === total - 1) {
      return 'translateX(-100%)';
    }
    return 'translateX(-50%)';
  };
</script>

<div class="min-h-screen bg-gray-50 p-6">
  <!-- 헤더 -->
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">대시보드</h1>
    <p class="text-lg text-gray-600">{userName}님, 안녕하세요! 📚</p>
    <p class="text-sm text-gray-500">{currentSemester} 학기</p>
  </div>

  <!-- 메인 그리드 레이아웃 -->
  <div class="flex flex-col lg:flex-row gap-6">
    
    <!-- 왼쪽 컬럼: 졸업 사정 (2/3 너비) -->
    <div class="w-full lg:w-2/3 space-y-6">
      
      <!-- 졸업 사정 카드 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900 flex items-center">
            🎓 졸업사정 조회
          </h2>
          <div class="text-sm text-gray-500">
            총 {totalCredits}/{requiredCredits} 학점 ({Math.round((totalCredits/requiredCredits)*100)}%)
          </div>
        </div>

        <!-- ★ 러닝저니 섹션 -->
        <div class="mb-8">
          
          
          <!-- 연도별 학기 진행 그래프 -->
          <div class="mb-6">
            <div class="bg-gray-50 rounded-lg px-2 py-4">
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-sm font-medium text-gray-700">누적 학점 진행</h4>
                <div class="flex items-center gap-4 text-xs text-gray-500">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 bg-blue-400 rounded-sm"></div>
                    <span>완료</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 bg-gray-300 rounded-sm"></div>
                    <span>예상</span>
                  </div>
                </div>
              </div>
              
              <!-- 그래프 컨테이너 -->
              <div class="relative h-48 animate-fade-in">
                <!-- Y축 (누적 학점) -->
                <div class="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
                  <span>200</span>
                  <span>150</span>
                  <span>100</span>
                  <span>50</span>
                  <span>0</span>
                </div>

                <!-- X축 (학기/학년) -->
                <div class="absolute left-12 right-0 -bottom-8 h-8">
                  {#each learningJourney as journey, i}
                    {@const year = parseInt(journey.semester.split('-')[0])}
                    {@const sem = journey.semester.split('-')[1]}
                    {@const displayYear = year < 2025 ? year - 2020 : year - 2022}
                    <div
                      class="absolute text-center text-xs text-gray-500"
                      style="left: {(i / (learningJourney.length - 1)) * 100}%; transform: {getXAxisLabelTransform(i, learningJourney.length)};"
                    >
                      <div class="font-medium">
                        {displayYear}-{sem}
                        {#if journey.isFuture}
                          <span class="text-gray-400">({year})</span>
                        {/if}
                      </div>
                    </div>
                  {/each}
                </div>
                
                <!-- 격자선 -->
                <div class="absolute left-12 right-0 top-0 bottom-0">
                  {#each Array.from({ length: 4 }, (_, i) => i) as i}
                    <div
                      class="absolute left-0 right-0 h-px bg-gray-200"
                      style="top: {(i + 1) * 25}%"
                    ></div>
                  {/each}
                </div>

                <!-- 그래프 영역 -->
                <div class="absolute left-12 right-0 top-0 bottom-0" bind:this={graphAreaContainer}>
                  <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <!-- 전체 학기 영역 (곡선 아래를 0학점까지 완전히 채우기) -->
                    <path d={fullAreaPath} fill="#e5e7eb" />
                    <path d={completedAreaPath} fill="#3b82f6" />
                    <path
                      d={completedStrokePath}
                      fill="none"
                      stroke="#3b82f6"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d={futureStrokePath}
                      fill="none"
                      stroke="#d1d5db"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>

                  <!-- 데이터 포인트 -->
                  <div class="absolute inset-0">
                    {#each learningJourney as journey, i}
                      <div
                        class="absolute w-3 h-3 {journey.isFuture
                          ? 'bg-gray-400'
                          : 'bg-blue-500'} rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-125 transition-all duration-300 hover:shadow-lg"
                        style="left: {(i / (learningJourney.length - 1)) * 100}%; top: {100 -
                          (journey.cumulative / 200) * 100}%; transform: translate(-50%, -50%);"
                        data-journey-index={i}
                        onmouseenter={() => showTooltip(journey, i)}
                        onmouseleave={() => hideTooltip()}
                      >
                        <!-- 내부 원형 표시 -->
                        <div
                          class="absolute inset-0.5 {journey.isFuture
                            ? 'bg-gray-300'
                            : 'bg-blue-300'} rounded-full opacity-75"
                        ></div>

                        <!-- 호버 시 확대 효과 -->
                        <div
                          class="absolute inset-0 {journey.isFuture
                            ? 'bg-gray-500'
                            : 'bg-blue-400'} rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200"
                        ></div>
                      </div>
                    {/each}
                  </div>

                  <!-- 툴팁 -->
                  {#if tooltip.show && tooltip.data}
                    <div
                      class="absolute bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs z-20 pointer-events-none"
                      style="left: {tooltip.x}px; top: {tooltip.y}px; transform: translate(-50%, -100%); margin-top: -8px;"
                    >
                      <div class="font-semibold text-gray-900 mb-1">{tooltip.data.semester}</div>
                      <div class="text-gray-600 space-y-1">
                        <div>
                          누적 학점: <span class="font-medium">{tooltip.data.cumulative}</span>
                        </div>
                        <div>
                          이번 학기: <span class="font-medium">{tooltip.data.credits}</span>
                        </div>
                        {#if tooltip.data.milestone}
                          <div class="text-blue-600 font-medium">🏆 {tooltip.data.milestone}</div>
                        {/if}
                      </div>
                      <!-- 화살표 -->
                      <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                    </div>
                  {/if}
                </div>
              </div>
              
              <!-- 그래프 통계 요약 -->
              <div class="mt-8 grid grid-cols-3 gap-4 text-center">
                <div class="bg-white rounded-lg p-3 border border-gray-200">
                  <div class="text-lg font-bold text-blue-600">{totalCredits}</div>
                  <div class="text-xs text-gray-500">현재 학점</div>
                </div>
                <div class="bg-white rounded-lg p-3 border border-gray-200">
                  <div class="text-lg font-bold text-green-600">{requiredCredits - totalCredits}</div>
                  <div class="text-xs text-gray-500">남은 학점</div>
                </div>
                <div class="bg-white rounded-lg p-3 border border-gray-200">
                  <div class="text-lg font-bold text-purple-600">{Math.round((totalCredits / requiredCredits) * 100)}%</div>
                  <div class="text-xs text-gray-500">진행률</div>
                </div>
              </div>
              
              <!-- 년도/학기 아이콘 추가 -->
              <div class="mt-4 flex justify-center items-center gap-2 text-xs text-gray-500">
                <div class="flex items-center gap-1">
                  <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>완료 학기</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="w-2 h-2 bg-gray-400 rounded-full"></span>
                  <span>예상 학기</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="w-2 h-2 bg-blue-300 rounded-full"></span>
                  <span>현재 학기</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 학기별 진행 타임라인 -->
          <div class="relative mt-4">
			<div class="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 hidden md:block"></div>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-x-6">
				<!-- Left Column -->
				<div class="space-y-3 min-w-0">
					{#each journeyPart1 as journey (journey.semester)}
						<div
							class="flex items-start rounded-lg p-3 transition-colors {journey.isFuture ? 'bg-gray-50' : 'bg-blue-50'}"
						>
							<div
								class="mt-1 h-3 w-3 flex-shrink-0 rounded-full {journey.isFuture ? 'border-2 border-gray-300' : 'bg-blue-500'}"
							></div>
							<div class="ml-3 flex-1">
								<div class="flex items-baseline justify-between">
									<p
										class="text-sm font-medium {journey.isFuture ? 'text-gray-500' : 'text-gray-800'}"
									>
										{journey.semester}
									</p>
									<p class="text-sm {journey.isFuture ? 'text-gray-400' : 'text-gray-600'}">
										{journey.cumulative}학점
									</p>
								</div>
								{#if journey.milestone}
									<p
										class="mt-1 inline-block rounded-full px-2 py-0.5 text-xs {journey.isFuture
											? 'bg-gray-200 text-gray-600'
											: 'bg-blue-100 text-blue-700'}"
									>
										{journey.milestone}
									</p>
								{/if}
							</div>
						</div>
					{/each}
				</div>
				<!-- Right Column -->
				<div class="space-y-3 min-w-0">
					{#each journeyPart2 as journey (journey.semester)}
						<div
							class="flex items-start rounded-lg p-3 transition-colors {journey.isFuture ? 'bg-gray-50' : 'bg-blue-50'}"
						>
							<div
								class="mt-1 h-3 w-3 flex-shrink-0 rounded-full {journey.isFuture ? 'border-2 border-gray-300' : 'bg-blue-500'}"
							></div>
							<div class="ml-3 flex-1">
								<div class="flex items-baseline justify-between">
									<p
										class="text-sm font-medium {journey.isFuture ? 'text-gray-500' : 'text-gray-800'}"
									>
										{journey.semester}
									</p>
									<p class="text-sm {journey.isFuture ? 'text-gray-400' : 'text-gray-600'}">
										{journey.cumulative}학점
									</p>
								</div>
								{#if journey.milestone}
									<p
										class="mt-1 inline-block rounded-full px-2 py-0.5 text-xs {journey.isFuture
											? 'bg-gray-200 text-gray-600'
											: 'bg-blue-100 text-blue-700'}"
									>
										{journey.milestone}
									</p>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
        </div>

        <!-- 전공 이수 현황 섹션 -->
        <div class="mb-6 border-b border-gray-200 pb-6">
          <h3 class="text-lg font-medium text-gray-900 flex items-center mb-4">📚 전공 이수 현황</h3>

          <div class="space-y-4">
            <!-- 다중전공 탭 -->
            <div class="mb-6">
              <div class="flex space-x-1 bg-gray-100 rounded-lg p-1">
                {#each majors as major}
                  <button 
                    class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all {selectedMajor === major.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
                    onclick={() => selectedMajor = major.id}
                  >
                    {major.name}
                    <span class="ml-1 text-xs">({major.type})</span>
                  </button>
                {/each}
              </div>
            </div>

            <!-- 선택된 전공의 세부 요건 -->
            {#each majors as major}
              {#if selectedMajor === major.id}
                <div class="space-y-4">
                  <!-- 전공 전체 진행도 -->
                  <div class="bg-blue-50 rounded-lg p-4">
                    <div class="flex justify-between text-sm font-medium text-blue-900 mb-2">
                      <span>{major.name} 전체 진행도</span>
                      <span>{Math.round((major.requirements.total.completed / major.requirements.total.required) * 100)}%</span>
                    </div>
                    <div class="w-full bg-blue-200 rounded-full h-3">
                      <div
                        class="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style="width: {Math.round((major.requirements.total.completed / major.requirements.total.required) * 100)}%"
                      ></div>
                    </div>
                    <div class="text-xs text-blue-700 mt-1">{major.requirements.total.completed}/{major.requirements.total.required} 학점</div>
                  </div>
                </div>
              {/if}
            {/each}
          </div>
        </div>

        <!-- 교양 영역별 상세 -->
        <div class="mb-6">
          <h3 class="text-lg font-medium text-gray-900 flex items-center mb-4">🌍 교양 영역별 현황</h3>

          <div class="space-y-4">
              <!-- 교양필수 -->
              <div class="bg-blue-50 rounded-lg p-3">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="font-medium text-gray-900">{generalEducation.required.name}</h4>
                  <span class="text-sm text-gray-700">{generalEducation.required.completed}/{generalEducation.required.required} 학점</span>
                </div>
                <div class="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    class="bg-blue-600 h-2 rounded-full"
                    style="width: {Math.min((generalEducation.required.completed / generalEducation.required.required) * 100, 100)}%"
                  ></div>
                </div>
              </div>

              <!-- 핵심교양 (사범대 기준) - 원 그래프 -->
              <div class="bg-yellow-50 rounded-lg p-4">
                <div class="flex items-center justify-between mb-4">
                  <h4 class="font-medium text-gray-900">{generalEducation.core.name} (사범대)</h4>
                  <span class="text-sm text-gray-700">{generalEducation.core.completed}/{generalEducation.core.required} 학점</span>
                </div>
                
                <div class="flex flex-col items-center gap-6">
                  <!-- 도넛 차트 -->
                  <div class="relative w-48 h-48 flex items-center justify-center">
                    <svg class="w-full h-full" viewBox="0 0 200 200">
                      <!-- 배경 원 -->
                      <circle cx="100" cy="110" r="70" fill="none" stroke="#f3f4f6" stroke-width="35"/>
                      
                      <!-- 고전읽기영역 (15.4%) - 진한 파란색 -->
                      <circle 
                        cx="100" cy="110" r="70" 
                        fill="none" 
                        stroke="#1e40af" 
                        stroke-width="35"
                        stroke-dasharray="73.45 366.37"
                        stroke-dashoffset="0"
                        transform="rotate(-90 100 110)"
                        class="cursor-pointer hover:opacity-80 transition-all duration-200"
                        onclick={() => showAreaInfo(generalEducation.core.areas[0].name, generalEducation.core.areas[0].completed, generalEducation.core.areas[0].required)}
                        onmouseenter={() => donutTooltip = { visible: true, area: generalEducation.core.areas[0].name, completed: generalEducation.core.areas[0].completed, required: generalEducation.core.areas[0].required }}
                        onmouseleave={() => donutTooltip.visible = false}
                      />
                      
                      <!-- 글로벌언어와문화영역 (23.1%) - 중간 파란색 -->
                      <circle 
                        cx="100" cy="110" r="70" 
                        fill="none" 
                        stroke="#3b82f6" 
                        stroke-width="35"
                        stroke-dasharray="73.45 366.37"
                        stroke-dashoffset="-73.45"
                        transform="rotate(-90 100 110)"
                        class="cursor-pointer hover:opacity-80 transition-all duration-200"
                        onclick={() => showAreaInfo(generalEducation.core.areas[1].name, generalEducation.core.areas[1].completed, generalEducation.core.areas[1].required)}
                        onmouseenter={() => donutTooltip = { visible: true, area: generalEducation.core.areas[1].name, completed: generalEducation.core.areas[1].completed, required: generalEducation.core.areas[1].required }}
                        onmouseleave={() => donutTooltip.visible = false}
                      />
                      
                      <!-- 소프트웨어영역 (15.4%) - 밝은 파란색 -->
                      <circle 
                        cx="100" cy="110" r="70" 
                        fill="none" 
                        stroke="#60a5fa" 
                        stroke-width="35"
                        stroke-dasharray="73.45 366.37"
                        stroke-dashoffset="-146.81"
                        transform="rotate(-90 100 110)"
                        class="cursor-pointer hover:opacity-80 transition-all duration-200"
                        onclick={() => showAreaInfo(generalEducation.core.areas[2].name, generalEducation.core.areas[2].completed, generalEducation.core.areas[2].required)}
                        onmouseenter={() => donutTooltip = { visible: true, area: generalEducation.core.areas[2].name, completed: generalEducation.core.areas[2].completed, required: generalEducation.core.areas[2].required }}
                        onmouseleave={() => donutTooltip.visible = false}
                      />
                      
                      <!-- 미래산업과창업영역 + 과학과기술영역 (30.8%) - 연한 파란색 -->
                      <circle 
                        cx="100" cy="110" r="70" 
                        fill="none" 
                        stroke="#93c5fd" 
                        stroke-width="35"
                        stroke-dasharray="135.38 304.44"
                        stroke-dashoffset="-271.15"
                        transform="rotate(-90 100 110)"
                        class="cursor-pointer hover:opacity-80 transition-all duration-200"
                        onclick={() => showAreaInfo(generalEducation.core.areas[3].name, generalEducation.core.areas[3].completed, generalEducation.core.areas[3].required)}
                        onmouseenter={() => donutTooltip = { visible: true, area: generalEducation.core.areas[3].name, completed: generalEducation.core.areas[3].completed, required: generalEducation.core.areas[3].required }}
                        onmouseleave={() => donutTooltip.visible = false}
                      />
                      
                      <!-- 인문과예술영역 + 사회와세계영역 (15.4%) - 연한 푸른색 -->
                      <circle 
                        cx="100" cy="110" r="70" 
                        fill="none" 
                        stroke="#a8d5ff" 
                        stroke-width="35"
                        stroke-dasharray="67.69 372.13"
                        stroke-dashoffset="-406.53"
                        transform="rotate(-90 100 110)"
                        class="cursor-pointer hover:opacity-80 transition-all duration-200"
                        onclick={() => showAreaInfo(generalEducation.core.areas[4].name, generalEducation.core.areas[4].completed, generalEducation.core.areas[4].required)}
                        onmouseenter={() => donutTooltip = { visible: true, area: generalEducation.core.areas[4].name, completed: generalEducation.core.areas[4].completed, required: generalEducation.core.areas[4].required }}
                        onmouseleave={() => donutTooltip.visible = false}
                      />
                      
                      <!-- 중앙 원형 배경 -->
                      <circle cx="100" cy="110" r="27" fill="white" stroke="#e5e7eb" stroke-width="1"/>
                      
                      <!-- 중앙 텍스트 -->
                      <text x="100" y="105" text-anchor="middle" class="text-xl font-bold fill-gray-800">{generalEducation.core.completed}</text>
                      <text x="100" y="120" text-anchor="middle" class="text-xs fill-gray-600">학점</text>
                      
                      <!-- 호버 시 표시되는 라벨들 -->
                      {#if donutTooltip.visible}
                        <text x="100" y="40" text-anchor="middle" class="text-sm font-medium fill-blue-700 opacity-90">
                          {donutTooltip.area} ({donutTooltip.completed}/{donutTooltip.required})
                        </text>
                      {/if}
                    </svg>
                  </div>
                  
                  <!-- 범례 -->
                  <div class="space-y-2">
                    {#each generalEducation.core.areas as area, i}
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full" style="background-color: {coreAreaColors[i]};"></div>
                        <span class="text-sm text-gray-700">
                          {area.name} ({area.completed}/{area.required})
                          {#if area.completed >= area.required}
                            <span class="ml-1">✅</span>
                          {/if}
                        </span>
                      </div>
                    {/each}
                  </div>
                  
                  <!-- 영역 정보 표시 -->
                  {#if selectedArea}
                    <div class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div class="text-center">
                        <h5 class="font-medium text-blue-900 mb-1">{selectedArea.name}</h5>
                        <p class="text-sm text-blue-700">
                          이수: {selectedArea.completed}학점 / 필요: {selectedArea.required}학점
                        </p>
                        {#if selectedArea.completed >= selectedArea.required}
                          <span class="inline-block mt-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">✅ 완료</span>
                        {:else}
                          <span class="inline-block mt-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">🔄 진행중</span>
                        {/if}
                      </div>
                    </div>
                  {/if}
                </div>
              </div>

              <!-- 교직이수 -->
              <div class="bg-green-50 rounded-lg p-4">
                <div class="flex justify-between items-center mb-3">
                  <h4 class="font-medium text-gray-900">🎓 교직이수</h4>
                  <span class="text-sm text-gray-700">{generalEducation.general.completed}/{generalEducation.general.required} 학점</span>
                </div>

                <div class="space-y-4">
                  <!-- 전체 진행도 -->
                  <div class="bg-white rounded-lg p-3 border border-green-200">
                    <div class="flex justify-between items-center mb-2">
                      <h5 class="font-medium text-green-900 text-sm">전체 진행률</h5>
                      <span class="text-xs font-medium text-green-700">{Math.round((generalEducation.general.completed / generalEducation.general.required) * 100)}%</span>
                    </div>
                    <div class="w-full bg-green-100 rounded-full h-2 mb-2">
                      <div
                        class="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style="width: {Math.min((generalEducation.general.completed / generalEducation.general.required) * 100, 100)}%"
                      ></div>
                    </div>
                    <div class="text-xs text-gray-600 text-center">
                      {generalEducation.general.completed}/{generalEducation.general.required} 학점
                    </div>
                  </div>

                  <!-- 전공과목 -->
                  <div class="bg-white rounded-lg p-3 border border-green-200">
                    <div class="flex justify-between items-center mb-2">
                      <h5 class="font-medium text-green-900 text-sm">📚 전공과목</h5>
                      <span class="text-xs font-medium text-green-700">30/29 학점</span>
                    </div>
                    <div class="space-y-2">
                      <!-- 기본이수 -->
                      <div class="flex justify-between items-center">
                        <span class="text-xs text-gray-600">기본이수</span>
                        <span class="text-xs font-medium {getProgressTextColor(completedFieldsCount.basic, totalFields.basic)}">{completedFieldsCount.basic}/{totalFields.basic}</span>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-1.5">
                        <div class="{getProgressColor(completedFieldsCount.basic, totalFields.basic)} h-1.5 rounded-full" style="width: {Math.round((completedFieldsCount.basic / totalFields.basic) * 100)}%"></div>
                      </div>

                      <!-- 교과교육 -->
                      <div class="flex justify-between items-center">
                        <span class="text-xs text-gray-600">교과교육</span>
                        <span class="text-xs font-medium {getProgressTextColor(completedFieldsCount.subjectEducation, totalFields.subjectEducation)}">{completedFieldsCount.subjectEducation}/{totalFields.subjectEducation}</span>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-1.5">
                        <div class="{getProgressColor(completedFieldsCount.subjectEducation, totalFields.subjectEducation)} h-1.5 rounded-full" style="width: {Math.round((completedFieldsCount.subjectEducation / totalFields.subjectEducation) * 100)}%"></div>
                      </div>
                    </div>

                    <!-- 과목별 상세 정보 아코디언 그룹 -->
                    <div class="space-y-3 pt-4">
                      <!-- 기본이수 상세 아코디언 -->
                      <div class="bg-white rounded-lg border border-green-200">
                        <button
                          class="w-full p-3 text-left flex items-center justify-between hover:bg-green-50 transition-colors"
                          onclick={() => toggleAccordion('teachingMajor')}
                        >
                          <div class="flex items-center gap-2">
                            <h6 class="font-medium text-green-900 text-xs">📚 기본이수 상세</h6>
                            <span class="text-xs px-2 py-1 rounded {getProgressBadgeClass(completedFieldsCount.basic, totalFields.basic)}">
                              {completedFieldsCount.basic}/{totalFields.basic}
                            </span>
                          </div>
                          <svg
                            class="w-4 h-4 transition-transform {expandedCards.teachingMajor ? 'rotate-180' : ''}"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M19 9l-7 7-7-7"
                            ></path>
                          </svg>
                        </button>

                        {#if expandedCards.teachingMajor}
                          <div class="p-3 pt-0 space-y-2 animate-fade-in">
                            {#each dashboardData.teachingCourses.major.categories.basic.courses as course}
                              <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div class="flex items-center gap-2">
                                  <div
                                    class="w-2 h-2 rounded-full {course.status === 'completed'
                                      ? 'bg-green-500'
                                      : course.status === 'in_progress'
                                      ? 'bg-yellow-500'
                                      : 'bg-gray-400'}"
                                  ></div>
                                  <span class="text-xs text-gray-700">{course.title}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                  <span class="text-xs text-gray-600">{course.credits}학점</span>
                                  <span
                                    class="text-xs px-2 py-1 rounded {course.status === 'completed'
                                      ? 'bg-green-100 text-green-700'
                                      : course.status === 'in_progress'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-gray-100 text-gray-600'}"
                                  >
                                    {course.status === 'completed'
                                      ? '완료'
                                      : course.status === 'in_progress'
                                      ? '수강중'
                                      : '미이수'}
                                  </span>
                                </div>
                              </div>
                            {/each}
                          </div>
                        {/if}
                      </div>

                      <!-- 교과교육 상세 아코디언 -->
                      <div class="bg-white rounded-lg border border-green-200">
                        <button
                          class="w-full p-3 text-left flex items-center justify-between hover:bg-green-50 transition-colors"
                          onclick={() => toggleAccordion('teachingSubject')}
                        >
                          <div class="flex items-center gap-2">
                            <h6 class="font-medium text-green-900 text-xs">📖 교과교육 상세</h6>
                            <span class="text-xs px-2 py-1 rounded {getProgressBadgeClass(completedFieldsCount.subjectEducation, totalFields.subjectEducation)}">
                              {completedFieldsCount.subjectEducation}/{totalFields.subjectEducation}
                            </span>
                          </div>
                          <svg
                            class="w-4 h-4 transition-transform {expandedCards.teachingSubject ? 'rotate-180' : ''}"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M19 9l-7 7-7-7"
                            ></path>
                          </svg>
                        </button>

                        {#if expandedCards.teachingSubject}
                          <div class="p-3 pt-0 space-y-2 animate-fade-in">
                            {#each dashboardData.teachingCourses.major.categories.subjectEducation.courses as course}
                              <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div class="flex items-center gap-2">
                                  <div
                                    class="w-2 h-2 rounded-full {course.status === 'completed'
                                      ? 'bg-green-500'
                                      : course.status === 'in_progress'
                                      ? 'bg-yellow-500'
                                      : 'bg-gray-400'}"
                                  ></div>
                                  <span class="text-xs text-gray-700">{course.title}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                  <span class="text-xs text-gray-600">{course.credits}학점</span>
                                  <span
                                    class="text-xs px-2 py-1 rounded {course.status === 'completed'
                                      ? 'bg-green-100 text-green-700'
                                      : course.status === 'in_progress'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-gray-100 text-gray-600'}"
                                  >
                                    {course.status === 'completed'
                                      ? '완료'
                                      : course.status === 'in_progress'
                                      ? '수강중'
                                      : '미이수'}
                                  </span>
                                </div>
                              </div>
                            {/each}
                          </div>
                        {/if}
                      </div>
                    </div>
                  </div>

                  <!-- 교직과목 -->
                  <div class="bg-white rounded-lg p-3 border border-green-200">
                    <div class="flex justify-between items-center mb-2">
                      <h5 class="font-medium text-green-900 text-sm">👨‍🏫 교직과목</h5>
                      <span class="text-xs font-medium text-green-700">14/22 학점</span>
                    </div>
                    <div class="space-y-2">
                      <!-- 교직이론 -->
                      <div class="flex justify-between items-center">
                        <span class="text-xs text-gray-600">교직이론</span>
                        <span class="text-xs font-medium {getProgressTextColor(completedFieldsCount.theory, totalFields.theory)}">{completedFieldsCount.theory}/{totalFields.theory}</span>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-1.5">
                        <div class="{getProgressColor(completedFieldsCount.theory, totalFields.theory)} h-1.5 rounded-full" style="width: {Math.round((completedFieldsCount.theory / totalFields.theory) * 100)}%"></div>
                      </div>

                      <!-- 교직소양 -->
                      <div class="flex justify-between items-center">
                        <span class="text-xs text-gray-600">교직소양</span>
                        <span class="text-xs font-medium {getProgressTextColor(completedFieldsCount.aptitude, totalFields.aptitude)}">{completedFieldsCount.aptitude}/{totalFields.aptitude}</span>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-1.5">
                        <div class="{getProgressColor(completedFieldsCount.aptitude, totalFields.aptitude)} h-1.5 rounded-full" style="width: {Math.round((completedFieldsCount.aptitude / totalFields.aptitude) * 100)}%"></div>
                      </div>

                      <!-- 교육실습 -->
                      <div class="flex justify-between items-center">
                        <span class="text-xs text-gray-600">교육실습</span>
                        <span class="text-xs font-medium {getProgressTextColor(completedFieldsCount.practice, totalFields.practice)}">{completedFieldsCount.practice}/{totalFields.practice}</span>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-1.5">
                        <div class="{getProgressColor(completedFieldsCount.practice, totalFields.practice)} h-1.5 rounded-full" style="width: {Math.round((completedFieldsCount.practice / totalFields.practice) * 100)}%"></div>
                      </div>
                    </div>
                    
                    <div class="space-y-3 pt-4">
                      <!-- 교직이론 상세 아코디언 -->
                      <div class="bg-white rounded-lg border border-green-200">
                        <button
                          class="w-full p-3 text-left flex items-center justify-between hover:bg-green-50 transition-colors"
                          onclick={() => toggleAccordion('teachingProfession')}
                        >
                          <div class="flex items-center gap-2">
                            <h6 class="font-medium text-green-900 text-xs">👨‍🏫 교직이론 상세</h6>
                            <span class="text-xs px-2 py-1 rounded {getProgressBadgeClass(completedFieldsCount.theory, totalFields.theory)}">
                              {completedFieldsCount.theory}/{totalFields.theory}
                            </span>
                          </div>
                          <svg
                            class="w-4 h-4 transition-transform {expandedCards.teachingProfession ? 'rotate-180' : ''}"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M19 9l-7 7-7-7"
                            ></path>
                          </svg>
                        </button>

                        {#if expandedCards.teachingProfession}
                          <div class="p-3 pt-0 space-y-2 animate-fade-in">
                            {#each dashboardData.teachingCourses.profession.categories.theory.courses as course}
                              <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div class="flex items-center gap-2">
                                  <div
                                    class="w-2 h-2 rounded-full {course.status === 'completed'
                                      ? 'bg-green-500'
                                      : course.status === 'in_progress'
                                      ? 'bg-yellow-500'
                                      : 'bg-gray-400'}"
                                  ></div>
                                  <span class="text-xs text-gray-700">{course.title}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                  <span class="text-xs text-gray-600">{course.credits}학점</span>
                                  <span
                                    class="text-xs px-2 py-1 rounded {course.status === 'completed'
                                      ? 'bg-green-100 text-green-700'
                                      : course.status === 'in_progress'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-gray-100 text-gray-600'}"
                                  >
                                    {course.status === 'completed'
                                      ? '완료'
                                      : course.status === 'in_progress'
                                      ? '수강중'
                                      : '미이수'}
                                  </span>
                                </div>
                              </div>
                            {/each}
                          </div>
                        {/if}
                      </div>

                      <!-- 교직소양 상세 아코디언 -->
                      <div class="bg-white rounded-lg border border-green-200">
                        <button
                          class="w-full p-3 text-left flex items-center justify-between hover:bg-green-50 transition-colors"
                          onclick={() => toggleAccordion('teachingAptitude')}
                        >
                          <div class="flex items-center gap-2">
                            <h6 class="font-medium text-green-900 text-xs">🎯 교직소양 상세</h6>
                            <span class="text-xs px-2 py-1 rounded {getProgressBadgeClass(completedFieldsCount.aptitude, totalFields.aptitude)}">
                              {completedFieldsCount.aptitude}/{totalFields.aptitude}
                            </span>
                          </div>
                          <svg
                            class="w-4 h-4 transition-transform {expandedCards.teachingAptitude ? 'rotate-180' : ''}"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M19 9l-7 7-7-7"
                            ></path>
                          </svg>
                        </button>

                        {#if expandedCards.teachingAptitude}
                          <div class="p-3 pt-0 space-y-2 animate-fade-in">
                            {#each dashboardData.teachingCourses.profession.categories.aptitude.courses as course}
                              <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div class="flex items-center gap-2">
                                  <div
                                    class="w-2 h-2 rounded-full {course.status === 'completed'
                                      ? 'bg-green-500'
                                      : course.status === 'in_progress'
                                      ? 'bg-yellow-500'
                                      : 'bg-gray-400'}"
                                  ></div>
                                  <span class="text-xs text-gray-700">{course.title}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                  <span class="text-xs text-gray-600">{course.credits}학점</span>
                                  <span
                                    class="text-xs px-2 py-1 rounded {course.status === 'completed'
                                      ? 'bg-green-100 text-green-700'
                                      : course.status === 'in_progress'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-gray-100 text-gray-600'}"
                                  >
                                    {course.status === 'completed'
                                      ? '완료'
                                      : course.status === 'in_progress'
                                      ? '수강중'
                                      : '미이수'}
                                  </span>
                                </div>
                              </div>
                            {/each}
                          </div>
                        {/if}
                      </div>

                      <!-- 교육실습 상세 아코디언 -->
                      <div class="bg-white rounded-lg border border-green-200">
                        <button
                          class="w-full p-3 text-left flex items-center justify-between hover:bg-green-50 transition-colors"
                          onclick={() => toggleAccordion('teachingPractice')}
                        >
                          <div class="flex items-center gap-2">
                            <h6 class="font-medium text-green-900 text-xs">🏫 교육실습 상세</h6>
                            <span class="text-xs px-2 py-1 rounded {getProgressBadgeClass(completedFieldsCount.practice, totalFields.practice)}">
                              {completedFieldsCount.practice}/{totalFields.practice}
                            </span>
                          </div>
                          <svg
                            class="w-4 h-4 transition-transform {expandedCards.teachingPractice ? 'rotate-180' : ''}"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M19 9l-7 7-7-7"
                            ></path>
                          </svg>
                        </button>

                        {#if expandedCards.teachingPractice}
                          <div class="p-3 pt-0 space-y-2 animate-fade-in">
                            {#each dashboardData.teachingCourses.profession.categories.practice.courses as course}
                              <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div class="flex items-center gap-2">
                                  <div
                                    class="w-2 h-2 rounded-full {course.status === 'completed'
                                      ? 'bg-green-500'
                                      : course.status === 'in_progress'
                                      ? 'bg-yellow-500'
                                      : 'bg-gray-400'}"
                                  ></div>
                                  <span class="text-xs text-gray-700">{course.title}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                  <span class="text-xs text-gray-600">{course.credits}학점</span>
                                  <span
                                    class="text-xs px-2 py-1 rounded {course.status === 'completed'
                                      ? 'bg-green-100 text-green-700'
                                      : course.status === 'in_progress'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-gray-100 text-gray-600'}"
                                  >
                                    {course.status === 'completed'
                                      ? '완료'
                                      : course.status === 'in_progress'
                                      ? '수강중'
                                      : '미이수'}
                                  </span>
                                </div>
                              </div>
                            {/each}
                          </div>
                        {/if}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 일반교양 -->
              <div class="bg-gray-50 rounded-lg p-3">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="font-medium text-gray-900">{generalEducation.general.name}</h4>
                  <span class="text-sm text-gray-700">{generalEducation.general.completed}/{generalEducation.general.required} 학점</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-gray-600 h-2 rounded-full"
                    style="width: {Math.min((generalEducation.general.completed / generalEducation.general.required) * 100, 100)}%"
                  ></div>
                </div>
              </div>
            </div>
        </div>

        <!-- 예상 졸업 학기 -->
        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700">예상 졸업 학기</span>
            <span class="text-lg font-bold text-blue-600">{learningJourney[learningJourney.length - 1]?.semester}</span>
          </div>
          <div class="mt-2 text-xs text-gray-500">
            <p>총 {requiredCredits}학점 이수 필요</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 오른쪽 컬럼: 기본수업, 추천 강의 (1/3 너비) -->
    <div class="w-full lg:w-1/3 space-y-6">
      
      <!-- 기본 수업 카드 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h2 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          📋 기본 수업
          <span class="ml-2 text-xs font-normal text-gray-500">(필수/권장 과목)</span>
        </h2>
        
        <div class="space-y-2">
          {#each basicCourses.slice(0, 3) as course}
            <div class="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
              <h3 class="font-medium text-gray-900 text-sm mb-1 truncate">{course.title}</h3>
              <p class="text-xs text-gray-600 mb-2 truncate">{course.dept}</p>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-1">
                  {#if course.status === 'required'}
                    <span class="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                      필수
                    </span>
                  {:else if course.status === 'recommended'}
                     <span class="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                      권장
                    </span>
                  {/if}
                  <span class="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                    {course.credits}학점
                  </span>
                </div>
                <button
                  class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex-shrink-0"
                >
                  담기
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>
      
      <!-- 추천 강의 카드 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h2 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          💡 추천 강의
        </h2>
        
        <div class="space-y-2">
          {#each recommendedCourses.slice(0, 3) as course}
            <div class="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
              <h3 class="font-medium text-gray-900 text-sm mb-1 truncate">{course.title}</h3>
              <p class="text-xs text-gray-600 mb-2 truncate">{course.dept}</p>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-1">
                  <span class="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                    {course.credits}학점
                  </span>
                  <span class="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                    {course.reason}
                  </span>
                </div>
                <button class="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors">
                  담기
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>
      
      <!-- 빠른 액션 카드 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h2 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          ⚡ 빠른 액션
        </h2>
        
        <div class="space-y-2">
          <button class="w-full p-2 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <div class="font-medium text-blue-900 text-sm">시간표 보기</div>
            <div class="text-xs text-blue-700">현재 학기 시간표 확인</div>
          </button>
          
          <button class="w-full p-2 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <div class="font-medium text-green-900 text-sm">강의 검색</div>
            <div class="text-xs text-green-700">새로운 강의 찾아보기</div>
          </button>
          
          <button class="w-full p-2 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <div class="font-medium text-purple-900 text-sm">수강 신청</div>
            <div class="text-xs text-purple-700">장바구니에서 신청하기</div>
          </button>
        </div>
      </div>
    </div>
  </div>

</div>

<style>
  /* 그래프 애니메이션 */
  .animate-fade-in {
    animation: fadeInUp 0.8s ease-out;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* 그래프 호버 효과 */
  .graph-container:hover .graph-line {
    stroke-width: 3;
    transition: stroke-width 0.3s ease;
  }
  
  /* 데이터 포인트 펄스 효과 */
  .data-point {
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
    }
    50% {
      box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
    }
  }
</style>
