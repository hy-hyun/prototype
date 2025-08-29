<script lang="ts">
  import { onMount } from 'svelte';
  import { dashboardData } from '$lib/mock/dashboardData';
  
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
  let tooltip = $state({
    show: false,
    x: 0,
    y: 0,
    data: null
  });
  
  // 툴팁 표시 함수
  function showTooltip(journey: any, index: number) {
    const element = document.querySelector(`[data-journey-index="${index}"]`);
    if (element) {
      const rect = element.getBoundingClientRect();
      tooltip = {
        show: true,
        x: rect.left + rect.width / 2,
        y: rect.top,
        data: journey
      };
    }
  }
  
  // 툴팁 숨김 함수
  function hideTooltip() {
    tooltip = { ...tooltip, show: false };
  }
  
     // 선택된 영역 정보 상태
   let selectedArea: { name: string; completed: number; required: number } | null = $state(null);
   let donutTooltip = $state({ visible: false, area: '', percentage: 0 });
   
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
   
   // 영역 정보 표시 함수
   function showAreaInfo(name: string, completed: number, required: number) {
     selectedArea = { name, completed, required };
   }
   
               // 아코디언 토글 함수
     function toggleAccordion(cardType: 'basicCourses' | 'recommendedCourses' | 'quickActions' | 'teachingMajor' | 'teachingProfession' | 'teachingSubject' | 'teachingAptitude' | 'teachingPractice') {
       expandedCards[cardType] = !expandedCards[cardType];
     }
</script>

<div class="min-h-screen bg-gray-50 p-6">
  <!-- 헤더 -->
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">대시보드</h1>
    <p class="text-lg text-gray-600">{userName}님, 안녕하세요! 📚</p>
    <p class="text-sm text-gray-500">{currentSemester} 학기</p>
  </div>

  <!-- 메인 그리드 레이아웃 -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    
    <!-- 왼쪽 컬럼: 졸업 사정 (2/3 너비) -->
    <div class="lg:col-span-2 space-y-6">
      
      <!-- 졸업 사정 카드 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900 flex items-center">
            🎓 졸업 사정
          </h2>
          <div class="text-sm text-gray-500">
            총 {totalCredits}/{requiredCredits} 학점 ({Math.round((totalCredits/requiredCredits)*100)}%)
          </div>
        </div>

        <!-- ★ 러닝저니 섹션 -->
        <div class="mb-8">
          <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
            ⭐ 러닝저니
          </h3>
          
                     <!-- 연도별 학기 진행 그래프 -->
           <div class="mb-6">
             <div class="bg-gray-50 rounded-lg p-4">
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
                   <div class="absolute left-12 right-0 -bottom-8 flex justify-between text-xs text-gray-500">
                     {#each learningJourney as journey, i}
                       <div class="text-center">
                         <div class="font-medium">
                           {#if journey.isFuture && parseInt(journey.semester.split('-')[0]) >= 2025}
                             {parseInt(journey.semester.split('-')[0]) - 2021}-{journey.semester.split('-')[1]}({journey.semester.split('-')[0]})
                           {:else}
                             {parseInt(journey.semester.split('-')[0]) - 2021}-{journey.semester.split('-')[1]}
                           {/if}
                         </div>
                       </div>
                     {/each}
                   </div>
                  
                  <!-- 격자선 -->
                  <div class="absolute left-12 right-0 top-0 bottom-0">
                    {#each Array.from({length: 4}, (_, i) => i) as i}
                      <div class="absolute left-0 right-0 h-px bg-gray-200" style="top: {(i + 1) * 25}%"></div>
                    {/each}
                  </div>
                 
                 <!-- 그래프 영역 -->
                 <div class="absolute left-12 right-0 top-0 bottom-0">
                   <!-- 완료된 학기 영역 -->
                   <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                     <defs>
                                               <linearGradient id="completedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.9"/>
                          <stop offset="50%" stop-color="#3b82f6" stop-opacity="0.6"/>
                          <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.2"/>
                        </linearGradient>
                       <linearGradient id="futureGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                         <stop offset="0%" stop-color="#e5e7eb" stop-opacity="0.6"/>
                         <stop offset="100%" stop-color="#e5e7eb" stop-opacity="0.3"/>
                       </linearGradient>
                     </defs>
                     
                                           <!-- 전체 학기 영역 (곡선 아래를 0학점까지 완전히 채우기) -->
                                             <path 
                         d="M 0 100 {learningJourney.map((journey, i) => {
                           const x = (i / (learningJourney.length - 1)) * 100;
                           const y = 100 - (journey.cumulative / 200) * 100;
                           
                           if (i === 0) {
                             return `L ${x} ${y}`;
                           } else {
                             const prevJourney = learningJourney[i - 1];
                             const prevX = ((i - 1) / (learningJourney.length - 1)) * 100;
                             const prevY = 100 - (prevJourney.cumulative / 200) * 100;
                            
                                                         // 더 자연스러운 볼록거림을 위한 제어점 계산
                             const controlX = (prevX + x) / 2;
                             const progress = i / (learningJourney.length - 1);
                             
                             // 학년별로 다른 볼록거림 적용
                             let controlY;
                             if (progress < 0.25) { // 1학년: 약간의 볼록거림
                               controlY = Math.min(prevY, y) - 2;
                             } else if (progress < 0.5) { // 2학년: 중간 볼록거림
                               controlY = Math.min(prevY, y) - 4;
                             } else if (progress < 0.75) { // 3학년: 강한 볼록거림
                               controlY = Math.min(prevY, y) - 6;
                             } else { // 4학년: 약한 볼록거림
                               controlY = Math.min(prevY, y) - 3;
                             }
                             
                             return `Q ${controlX} ${controlY} ${x} ${y}`;
                          }
                        }).join(' ')} L 100 100 Z"
                        fill="url(#completedGradient)"
                        stroke="#3b82f6"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="graph-line transition-all duration-300"
                      />
                     
                     
                   </svg>
                   
                                       <!-- 데이터 포인트 -->
                    <div class="absolute inset-0">
                      {#each learningJourney as journey, i}
                        <div 
                          class="absolute w-3 h-3 {i < 5 ? 'bg-blue-500' : 'bg-gray-400'} rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-125 transition-all duration-300 hover:shadow-lg"
                          style="left: {(i / (learningJourney.length - 1)) * 100}%; top: {100 - (journey.cumulative / 200) * 100}%"
                          data-journey-index={i}
                          onmouseenter={() => showTooltip(journey, i)}
                          onmouseleave={() => hideTooltip()}
                        >
                          <!-- 내부 원형 표시 -->
                          <div class="absolute inset-0.5 {i < 5 ? 'bg-blue-300' : 'bg-gray-300'} rounded-full opacity-75"></div>
                          
                          <!-- 호버 시 확대 효과 -->
                          <div class="absolute inset-0 {i < 5 ? 'bg-blue-400' : 'bg-gray-500'} rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
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
                         <div>누적 학점: <span class="font-medium">{tooltip.data.cumulative}</span></div>
                         <div>이번 학기: <span class="font-medium">{tooltip.data.credits}</span></div>
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
          <div class="relative">
            <!-- 진행 라인 -->
            <div class="absolute top-6 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 via-blue-500 to-gray-300"></div>
            
            <!-- 학기별 포인트 -->
            <div class="flex justify-between items-start relative z-10">
              {#each learningJourney as journey, i}
                <div class="flex flex-col items-center">
                  <!-- 포인트 -->
                  <div class="w-4 h-4 rounded-full border-2 {journey.isFuture ? 'bg-white border-gray-300' : 'bg-blue-500 border-blue-500'} mb-2"></div>
                  
                  <!-- 학기 정보 -->
                  <div class="text-center">
                    <div class="text-xs font-medium {journey.isFuture ? 'text-gray-400' : 'text-gray-700'}">{journey.semester}</div>
                    <div class="text-xs {journey.isFuture ? 'text-gray-400' : 'text-gray-600'}">{journey.cumulative}학점</div>
                    {#if journey.milestone}
                      <div class="text-xs font-medium mt-1 px-2 py-1 rounded-full {journey.milestone === '현재' ? 'bg-blue-100 text-blue-700' : journey.milestone === '졸업 예정' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}">
                        {journey.milestone}
                      </div>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>

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
                <div class="text-xs text-blue-700 mt-1">
                  {major.requirements.total.completed}/{major.requirements.total.required} 학점
                </div>
              </div>

              <!-- 전공 세부 영역 -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="bg-indigo-50 rounded-lg p-3">
                  <h4 class="font-medium text-indigo-900 text-sm mb-2">📚 {major.requirements.majorRequired.name}</h4>
                  <div class="space-y-1">
                    <div class="flex justify-between text-xs">
                      <span>{major.requirements.majorRequired.completed}/{major.requirements.majorRequired.required} 학점</span>
                      <span class="font-medium">{Math.round((major.requirements.majorRequired.completed / major.requirements.majorRequired.required) * 100)}%</span>
                    </div>
                    <div class="w-full bg-indigo-200 rounded-full h-1.5">
                      <div 
                        class="bg-indigo-600 h-1.5 rounded-full"
                        style="width: {Math.round((major.requirements.majorRequired.completed / major.requirements.majorRequired.required) * 100)}%"
                      ></div>
                    </div>
                  </div>
                </div>

                <div class="bg-purple-50 rounded-lg p-3">
                  <h4 class="font-medium text-purple-900 text-sm mb-2">📖 {major.requirements.majorElective.name}</h4>
                  <div class="space-y-1">
                    <div class="flex justify-between text-xs">
                      <span>{major.requirements.majorElective.completed}/{major.requirements.majorElective.required} 학점</span>
                      <span class="font-medium">{Math.round((major.requirements.majorElective.completed / major.requirements.majorElective.required) * 100)}%</span>
                    </div>
                    <div class="w-full bg-purple-200 rounded-full h-1.5">
                      <div 
                        class="bg-purple-600 h-1.5 rounded-full"
                        style="width: {Math.round((major.requirements.majorElective.completed / major.requirements.majorElective.required) * 100)}%"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/if}
        {/each}

        <!-- 교양 영역별 상세 -->
        <div class="mt-6 pt-6 border-t border-gray-200">
          <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
            🌍 교양 영역별 현황
          </h3>
          
          <div class="space-y-4">
            <!-- 교양필수 (학년별) -->
            <div class="bg-blue-50 rounded-lg p-3">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium text-gray-900">{generalEducation.required.name}</h4>
                <span class="text-sm text-gray-700">{generalEducation.required.completed}/{generalEducation.required.required} 학점</span>
              </div>

              <!-- 학기 선택 탭 (1-1부터 4-4까지) -->
              <div class="grid grid-cols-4 gap-1 bg-gray-100 rounded-lg p-1 mb-3">
                {#each Object.keys(generalEducation.required.bySemester) as semester}
                  <button 
                    class="px-2 py-1 text-xs font-medium rounded transition-all {selectedSemester === semester ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'}"
                    onclick={() => selectedSemester = semester}
                  >
                    {semester}
                    <div class="text-xs">
                      ({generalEducation.required.bySemester[semester].completed}/{generalEducation.required.bySemester[semester].required})
                    </div>
                  </button>
                {/each}
              </div>

              <!-- 선택된 학기의 상세 정보 -->
              {#each Object.entries(generalEducation.required.bySemester) as [semester, semesterData]}
                {#if selectedSemester === semester}
                  <div class="bg-white rounded-lg p-2">
                    {#if semesterData.subjects.length > 0}
                      <div class="space-y-2">
                        {#each semesterData.subjects as subject}
                          <div class="bg-gray-50 rounded p-2">
                            <div class="flex items-center justify-between mb-1">
                              <span class="text-sm font-medium text-gray-700">{subject.name}</span>
                              <span class="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                {subject.completed}/{subject.required}
                                {#if subject.status === 'completed'}✅
                                {:else if subject.status === 'in_progress'}🔄
                                {:else}⏳{/if}
                              </span>
                            </div>
                            <div class="text-xs text-gray-500">
                              {#if subject.status === 'completed'}
                                이수 완료
                              {:else if subject.status === 'in_progress'}
                                수강 중
                              {:else}
                                미이수
                              {/if}
                            </div>
                          </div>
                        {/each}
                      </div>
                    {:else}
                      <div class="text-center text-gray-500 text-sm py-4">
                        해당 학기에 교양필수 과목이 없습니다.
                      </div>
                    {/if}
                  </div>
                {/if}
              {/each}
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
                      
                      <!-- 글로벌 언어와 문화 영역 (16.7%) - 진한 파란색 -->
                      <circle 
                        cx="100" cy="110" r="70" 
                        fill="none" 
                        stroke="#1e40af" 
                        stroke-width="35"
                        stroke-dasharray="73.45 366.37"
                        stroke-dashoffset="0"
                        transform="rotate(-90 100 110)"
                        class="cursor-pointer hover:opacity-80 transition-all duration-200"
                        onclick={() => showAreaInfo('고전읽기영역', 2, 2)}
                        onmouseenter={() => donutTooltip = { visible: true, area: '고전읽기영역', percentage: 15.4 }}
                        onmouseleave={() => donutTooltip.visible = false}
                      />
                      
                      <!-- 소프트웨어 영역 (16.7%) - 중간 파란색 -->
                      <circle 
                        cx="100" cy="110" r="70" 
                        fill="none" 
                        stroke="#3b82f6" 
                        stroke-width="35"
                        stroke-dasharray="73.45 366.37"
                        stroke-dashoffset="-73.45"
                        transform="rotate(-90 100 110)"
                        class="cursor-pointer hover:opacity-80 transition-all duration-200"
                        onclick={() => showAreaInfo('글로벌언어와문화영역', 3, 2)}
                        onmouseenter={() => donutTooltip = { visible: true, area: '글로벌언어와문화영역', percentage: 23.1 }}
                        onmouseleave={() => donutTooltip.visible = false}
                      />
                      
                      <!-- 미래산업 & 과학기술 영역 (33.3%) - 밝은 파란색 -->
                      <circle 
                        cx="100" cy="110" r="70" 
                        fill="none" 
                        stroke="#60a5fa" 
                        stroke-width="35"
                        stroke-dasharray="146.46 293.36"
                        stroke-dashoffset="-146.81"
                        transform="rotate(-90 100 110)"
                        class="cursor-pointer hover:opacity-80 transition-all duration-200"
                        onclick={() => showAreaInfo('소프트웨어영역', 2, 2)}
                        onmouseenter={() => donutTooltip = { visible: true, area: '소프트웨어영역', percentage: 15.4 }}
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
                        onclick={() => showAreaInfo('미래산업과창업영역 + 과학과기술영역', 4, 2)}
                        onmouseenter={() => donutTooltip = { visible: true, area: '미래산업과창업영역 + 과학과기술영역', percentage: 30.8 }}
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
                         onclick={() => showAreaInfo('인문과예술영역 + 사회와세계영역', 2, 2)}
                         onmouseenter={() => donutTooltip = { visible: true, area: '인문과예술영역 + 사회와세계영역', percentage: 15.4 }}
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
                          {donutTooltip.area} ({donutTooltip.percentage}%)
                        </text>
                      {/if}
                    </svg>
                  </div>
                 
                                   <!-- 범례 -->
                  <div class="space-y-2">
                    <div class="flex items-center gap-2">
                      <div class="w-3 h-3 rounded-full" style="background-color: #1e40af;"></div>
                      <span class="text-sm text-gray-700">고전읽기영역 (15.4%) ✅</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <div class="w-3 h-3 rounded-full" style="background-color: #3b82f6;"></div>
                      <span class="text-sm text-gray-700">글로벌언어와문화영역 (23.1%) ✅</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <div class="w-3 h-3 rounded-full" style="background-color: #60a5fa;"></div>
                      <span class="text-sm text-gray-700">소프트웨어영역 (15.4%) ✅</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <div class="w-3 h-3 rounded-full" style="background-color: #93c5fd;"></div>
                      <span class="text-sm text-gray-700">미래산업과창업영역 + 과학과기술영역 (30.8%) ✅</span>
                    </div>
                                         <div class="flex items-center gap-2">
                       <div class="w-3 h-3 rounded-full" style="background-color: #a8d5ff;"></div>
                       <span class="text-sm text-gray-700">인문과예술영역 + 사회와세계영역 (15.4%) ✅</span>
                     </div>
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
                 
                 <!-- 교직이수 통합 영역 -->
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
                          <span class="text-xs font-medium">30/21 학점</span>
                        </div>
                        <div class="w-full bg-green-100 rounded-full h-1.5">
                          <div class="bg-green-500 h-1.5 rounded-full" style="width: 100%"></div>
                        </div>
                        
                        <!-- 교과교육 -->
                        <div class="flex justify-between items-center">
                          <span class="text-xs text-gray-600">교과교육</span>
                          <span class="text-xs font-medium">0/8 학점</span>
                        </div>
                        <div class="w-full bg-green-100 rounded-full h-1.5">
                          <div class="bg-green-500 h-1.5 rounded-full" style="width: 0%"></div>
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
                          <span class="text-xs font-medium">12/12 학점</span>
                        </div>
                        <div class="w-full bg-green-100 rounded-full h-1.5">
                          <div class="bg-green-500 h-1.5 rounded-full" style="width: 100%"></div>
                        </div>
                        
                        <!-- 교직소양 -->
                        <div class="flex justify-between items-center">
                          <span class="text-xs text-gray-600">교직소양</span>
                          <span class="text-xs font-medium">0/6 학점</span>
                        </div>
                        <div class="w-full bg-green-100 rounded-full h-1.5">
                          <div class="bg-green-500 h-1.5 rounded-full" style="width: 0%"></div>
                        </div>
                        
                        <!-- 교육실습 -->
                        <div class="flex justify-between items-center">
                          <span class="text-xs text-gray-600">교육실습</span>
                          <span class="text-xs font-medium">2/4 학점</span>
                        </div>
                        <div class="w-full bg-green-100 rounded-full h-1.5">
                          <div class="bg-green-500 h-1.5 rounded-full" style="width: 50%"></div>
                        </div>
                      </div>
                    </div>
                 </div>
                 
                 <!-- 과목별 상세 정보 -->
                 <div class="mt-4 space-y-3">
                   <!-- 전공과목 상세 아코디언 -->
                   <div class="bg-white rounded-lg border border-green-200">
                     <button 
                       class="w-full p-3 text-left flex items-center justify-between hover:bg-green-50 transition-colors"
                       onclick={() => toggleAccordion('teachingMajor')}
                     >
                       <div class="flex items-center gap-2">
                         <h6 class="font-medium text-green-900 text-xs">📚 전공과목 상세</h6>
                         <span class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                           {dashboardData.teachingCourses.major.categories.basic.courses.filter(c => c.status === 'completed').length}/{dashboardData.teachingCourses.major.categories.basic.courses.length} 완료
                         </span>
                       </div>
                       <svg class="w-4 h-4 transition-transform {expandedCards.teachingMajor ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                       </svg>
                     </button>
                     
                     {#if expandedCards.teachingMajor}
                       <div class="p-3 pt-0 space-y-2 animate-fade-in">
                         {#each dashboardData.teachingCourses.major.categories.basic.courses as course}
                           <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                             <div class="flex items-center gap-2">
                               <div class="w-2 h-2 rounded-full {course.status === 'completed' ? 'bg-green-500' : course.status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-400'}"></div>
                               <span class="text-xs text-gray-700">{course.title}</span>
                             </div>
                             <div class="flex items-center gap-2">
                               <span class="text-xs text-gray-600">{course.credits}학점</span>
                               <span class="text-xs px-2 py-1 rounded {course.status === 'completed' ? 'bg-green-100 text-green-700' : course.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}">
                                 {course.status === 'completed' ? '완료' : course.status === 'in_progress' ? '수강중' : '미이수'}
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
                         <span class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                           {dashboardData.teachingCourses.major.categories.subjectEducation.courses.filter(c => c.status === 'completed').length}/{dashboardData.teachingCourses.major.categories.subjectEducation.courses.length} 완료
                         </span>
                       </div>
                       <svg class="w-4 h-4 transition-transform {expandedCards.teachingSubject ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                       </svg>
                     </button>
                     
                     {#if expandedCards.teachingSubject}
                       <div class="p-3 pt-0 space-y-2 animate-fade-in">
                         {#each dashboardData.teachingCourses.major.categories.subjectEducation.courses as course}
                           <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                             <div class="flex items-center gap-2">
                               <div class="w-2 h-2 rounded-full {course.status === 'completed' ? 'bg-green-500' : course.status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-400'}"></div>
                               <span class="text-xs text-gray-700">{course.title}</span>
                             </div>
                             <div class="flex items-center gap-2">
                               <span class="text-xs text-gray-600">{course.credits}학점</span>
                               <span class="text-xs px-2 py-1 rounded {course.status === 'completed' ? 'bg-green-100 text-green-700' : course.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}">
                                 {course.status === 'completed' ? '완료' : course.status === 'in_progress' ? '수강중' : '미이수'}
                               </span>
                             </div>
                           </div>
                         {/each}
                       </div>
                     {/if}
                   </div>
                   
                   <!-- 교직과목 상세 아코디언 -->
                   <div class="bg-white rounded-lg border border-green-200">
                     <button 
                       class="w-full p-3 text-left flex items-center justify-between hover:bg-green-50 transition-colors"
                       onclick={() => toggleAccordion('teachingProfession')}
                     >
                       <div class="flex items-center gap-2">
                         <h6 class="font-medium text-green-900 text-xs">👨‍🏫 교직과목 상세</h6>
                         <span class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                           {dashboardData.teachingCourses.profession.categories.theory.courses.filter(c => c.status === 'completed').length}/{dashboardData.teachingCourses.profession.categories.theory.courses.length} 완료
                         </span>
                       </div>
                       <svg class="w-4 h-4 transition-transform {expandedCards.teachingProfession ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                       </svg>
                     </button>
                     
                     {#if expandedCards.teachingProfession}
                       <div class="p-3 pt-0 space-y-2 animate-fade-in">
                         {#each dashboardData.teachingCourses.profession.categories.theory.courses as course}
                           <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                             <div class="flex items-center gap-2">
                               <div class="w-2 h-2 rounded-full {course.status === 'completed' ? 'bg-green-500' : course.status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-400'}"></div>
                               <span class="text-xs text-gray-700">{course.title}</span>
                             </div>
                             <div class="flex items-center gap-2">
                               <span class="text-xs text-gray-600">{course.credits}학점</span>
                               <span class="text-xs px-2 py-1 rounded {course.status === 'completed' ? 'bg-green-100 text-green-700' : course.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}">
                                 {course.status === 'completed' ? '완료' : course.status === 'in_progress' ? '수강중' : '미이수'}
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
                         <span class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                           {dashboardData.teachingCourses.profession.categories.aptitude.courses.filter(c => c.status === 'completed').length}/{dashboardData.teachingCourses.profession.categories.aptitude.courses.length} 완료
                         </span>
                       </div>
                       <svg class="w-4 h-4 transition-transform {expandedCards.teachingAptitude ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                       </svg>
                     </button>
                     
                     {#if expandedCards.teachingAptitude}
                       <div class="p-3 pt-0 space-y-2 animate-fade-in">
                         {#each dashboardData.teachingCourses.profession.categories.aptitude.courses as course}
                           <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                             <div class="flex items-center gap-2">
                               <div class="w-2 h-2 rounded-full {course.status === 'completed' ? 'bg-green-500' : course.status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-400'}"></div>
                               <span class="text-xs text-gray-700">{course.title}</span>
                             </div>
                             <div class="flex items-center gap-2">
                               <span class="text-xs text-gray-600">{course.credits}학점</span>
                               <span class="text-xs px-2 py-1 rounded {course.status === 'completed' ? 'bg-green-100 text-green-700' : course.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}">
                                 {course.status === 'completed' ? '완료' : course.status === 'in_progress' ? '수강중' : '미이수'}
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
                         <span class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                           {dashboardData.teachingCourses.profession.categories.practice.courses.filter(c => c.status === 'completed').length}/{dashboardData.teachingCourses.profession.categories.practice.courses.length} 완료
                         </span>
                       </div>
                       <svg class="w-4 h-4 transition-transform {expandedCards.teachingPractice ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                       </svg>
                     </button>
                     
                     {#if expandedCards.teachingPractice}
                       <div class="p-3 pt-0 space-y-2 animate-fade-in">
                         {#each dashboardData.teachingCourses.profession.categories.practice.courses as course}
                           <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                             <div class="flex items-center gap-2">
                               <div class="w-2 h-2 rounded-full {course.status === 'completed' ? 'bg-green-500' : course.status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-400'}"></div>
                               <span class="text-xs text-gray-700">{course.title}</span>
                             </div>
                             <div class="flex items-center gap-2">
                               <span class="text-xs text-gray-600">{course.credits}학점</span>
                               <span class="text-xs px-2 py-1 rounded {course.status === 'completed' ? 'bg-green-100 text-green-700' : course.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}">
                                 {course.status === 'completed' ? '완료' : course.status === 'in_progress' ? '수강중' : '미이수'}
                               </span>
                             </div>
                           </div>
                         {/each}
                       </div>
                     {/if}
                   </div>
                 </div>
              </div>
             
             <!-- 일반교양 -->
             <div class="bg-gray-50 rounded-lg p-4">
               <div class="flex justify-between items-center">
                 <h4 class="font-medium text-gray-900">{generalEducation.general.name}</h4>
                 <span class="text-sm text-gray-700">{generalEducation.general.completed}/{generalEducation.general.required} 학점</span>
               </div>
               <div class="mt-2">
                 <div class="w-full bg-gray-200 rounded-full h-2">
                   <div 
                     class="bg-gray-600 h-2 rounded-full"
                     style="width: {Math.min((generalEducation.general.completed / generalEducation.general.required) * 100, 100)}%"
                   ></div>
                 </div>
               </div>
             </div>
          </div>
        </div>

        <!-- 예상 졸업 학기 -->
        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700">예상 졸업 학기</span>
            <span class="text-lg font-bold text-blue-600">2026-2</span>
          </div>
          <div class="mt-2 text-xs text-gray-500 space-y-1">
            <p>다중전공 기준 총 176학점 (기본 150 + 복수전공 36 - 주전공 감소 10)</p>
            <div class="grid grid-cols-2 gap-2 mt-2">
              <div>
                <span class="font-medium">전공:</span>
                <div class="ml-2">• 교육공학과: 50학점</div>
                <div class="ml-2">• 화학공학과: 36학점</div>
              </div>
              <div>
                <span class="font-medium">교양 (사범대):</span>
                <div class="ml-2">• 교양필수: 15학점</div>
                <div class="ml-2">• 핵심교양: 18학점</div>
                <div class="ml-2">• 일반교양: 57학점</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      
    </div>
    
         <!-- 오른쪽 컬럼: 기본수업, 추천 강의 (1/3 너비) -->
     <div class="space-y-6">
       
                               <!-- 기본 수업 카드 -->
         <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
           <h2 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
             📋 기본 수업
             <span class="ml-2 text-xs font-normal text-gray-500">(필수/권장 과목)</span>
           </h2>
           
                                 <div class="space-y-2">
              {#each basicCourses.slice(0, 2) as course}
                <div class="flex items-start gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div class="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 {course.status === 'required' ? 'bg-red-500' : 'bg-yellow-500'}"></div>
                  <div class="min-w-0 flex-1">
                    <h3 class="font-medium text-gray-900 text-sm leading-tight mb-1">{course.title}</h3>
                    <p class="text-xs text-gray-600">{course.dept} • {course.credits}학점</p>
                    <div class="flex items-center gap-1 mt-1">
                      <span class="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">필수</span>
                      <span class="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{course.type}</span>
                    </div>
                  </div>
                  <button class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex-shrink-0">
                    담기
                  </button>
                </div>
              {/each}
             
             {#if basicCourses.length > 2}
               <!-- 아코디언 영역 -->
               <div class="border-t border-gray-200 pt-2">
                 <button 
                   class="w-full text-center text-xs text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-center gap-1"
                   onclick={() => toggleAccordion('basicCourses')}
                 >
                   <span>+{basicCourses.length - 2}개 더 보기</span>
                   <svg class="w-3 h-3 transition-transform {expandedCards.basicCourses ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                   </svg>
                 </button>
                 
                 {#if expandedCards.basicCourses}
                   <div class="mt-2 space-y-2 animate-fade-in">
                     {#each basicCourses.slice(2) as course}
                       <div class="flex items-start gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                         <div class="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 {course.status === 'required' ? 'bg-red-500' : 'bg-yellow-500'}"></div>
                         <div class="min-w-0 flex-1">
                           <h3 class="font-medium text-gray-900 text-sm leading-tight mb-1">{course.title}</h3>
                           <p class="text-xs text-gray-600">{course.dept} • {course.credits}학점</p>
                         </div>
                         <button class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex-shrink-0">
                           담기
                         </button>
                       </div>
                     {/each}
                   </div>
                 {/if}
               </div>
             {/if}
           </div>
        </div>
       
                               <!-- 추천 강의 카드 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            💡 추천 강의
          </h2>
          
                    <div class="space-y-2">
             {#each recommendedCourses.slice(0, 2) as course}
               <div class="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                 <h3 class="font-medium text-gray-900 text-sm mb-1 truncate">{course.title}</h3>
                 <p class="text-xs text-gray-600 mb-2 truncate">{course.dept}</p>
                 <div class="flex items-center justify-between">
                   <div class="flex items-center space-x-1">
                     <span class="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                       {course.credits}학점
                     </span>
                     <span class="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded truncate max-w-20">
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
           
           {#if recommendedCourses.length > 2}
             <!-- 더 많은 추천 보기 버튼 -->
             <div class="border-t border-gray-200 pt-2">
               <button class="w-full p-2 text-center text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200">
                 더 많은 추천 보기
               </button>
             </div>
           {/if}
          
          {#if recommendedCourses.length > 2}
            <!-- 아코디언 영역 -->
            <div class="border-t border-gray-200 pt-2">
              <button 
                class="w-full text-center text-xs text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-center gap-1"
                onclick={() => toggleAccordion('recommendedCourses')}
              >
                <span>+{recommendedCourses.length - 2}개 더 보기</span>
                <svg class="w-3 h-3 transition-transform {expandedCards.recommendedCourses ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              {#if expandedCards.recommendedCourses}
                <div class="mt-2 space-y-2 animate-fade-in">
                  {#each recommendedCourses.slice(2) as course}
                    <div class="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                      <h3 class="font-medium text-gray-900 text-sm mb-1 truncate">{course.title}</h3>
                      <p class="text-xs text-gray-600 mb-2 truncate">{course.dept}</p>
                      <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-1">
                          <span class="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                            {course.credits}학점
                          </span>
                          <span class="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded truncate max-w-20">
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
              {/if}
            </div>
          {/if}
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
