<script lang="ts">
  import { onMount } from 'svelte';
  import { dashboardData } from '$lib/mock/dashboardData';
  
  // 임시 데이터
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
  
  // 러닝저니 데이터 (학기별 학점 축적) - 다중전공 176학점 기준
  let learningJourney = dashboardData.learningJourney;
  
  // 추천 강의 임시 데이터
  let recommendedCourses = dashboardData.recommendedCourses;
  
  // 기본 수업 임시 데이터
  let basicCourses = dashboardData.basicCourses;

  let teachingSectionsState = $state({});

  // 졸업 사정 카드 섹션별 접기/펴기 상태
  let graduationSections = $state({
    journey: false, // 러닝저니
    majors: true,   // 전공
    general: false, // 교양
  });
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
        <div class="mb-6 border-b border-gray-200 pb-6">
          <div
            class="flex items-center justify-between cursor-pointer rounded-lg p-2 -m-2 hover:bg-gray-50 transition-colors"
            onclick={() => graduationSections.journey = !graduationSections.journey}
          >
            <h3 class="text-lg font-medium text-gray-900 flex items-center">⭐ 러닝저니</h3>
            <svg
              class="w-5 h-5 text-gray-500 transition-transform"
              class:rotate-180={graduationSections.journey}
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>

          {#if graduationSections.journey}
            <div class="mt-6 grid grid-cols-1 gap-y-8 md:grid-cols-2 md:gap-x-12">
              <!-- Left Column -->
              <div class="flow-root">
                <ul class="-mb-8">
                  {#each learningJourney.slice(0, Math.ceil(learningJourney.length / 2)) as journey, i}
                  {@const list = learningJourney.slice(0, Math.ceil(learningJourney.length / 2))}
                  <li>
                    <div class="relative pb-8">
                      {#if i !== list.length - 1}
                        <span class="absolute left-2.5 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                      {/if}
                      <div class="relative flex items-start space-x-3">
                        <div>
                          <div class="h-5 w-5 rounded-full {journey.isFuture ? 'bg-gray-300' : 'bg-blue-500'} flex items-center justify-center ring-4 ring-white">
                          </div>
                        </div>
                        <div class="min-w-0 flex-1 pt-0.5">
                          <p class="text-sm font-medium text-gray-900">{journey.semester}</p>
                          <p class="mt-0.5 text-sm text-gray-500">
                            {journey.credits}학점 이수 (누적 {journey.cumulative}학점)
                          </p>
                          {#if journey.milestone}
                            <div class="mt-2">
                              <span class="inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium {journey.milestone === '현재' ? 'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-200' : journey.milestone.includes('졸업') ? 'bg-green-100 text-green-700 ring-1 ring-inset ring-green-200' : 'bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200'}">
                                {journey.milestone}
                              </span>
                            </div>
                          {/if}
                        </div>
                      </div>
                    </div>
                  </li>
                  {/each}
                </ul>
              </div>
              <!-- Right Column -->
              <div class="flow-root">
                <ul class="-mb-8">
                  {#each learningJourney.slice(Math.ceil(learningJourney.length / 2)) as journey, i}
                  {@const list = learningJourney.slice(Math.ceil(learningJourney.length / 2))}
                  <li>
                    <div class="relative pb-8">
                      {#if i !== list.length - 1}
                        <span class="absolute left-2.5 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                      {/if}
                      <div class="relative flex items-start space-x-3">
                        <div>
                          <div class="h-5 w-5 rounded-full {journey.isFuture ? 'bg-gray-300' : 'bg-blue-500'} flex items-center justify-center ring-4 ring-white">
                          </div>
                        </div>
                        <div class="min-w-0 flex-1 pt-0.5">
                          <p class="text-sm font-medium text-gray-900">{journey.semester}</p>
                          <p class="mt-0.5 text-sm text-gray-500">
                            {journey.credits}학점 이수 (누적 {journey.cumulative}학점)
                          </p>
                          {#if journey.milestone}
                            <div class="mt-2">
                              <span class="inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium {journey.milestone === '현재' ? 'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-200' : journey.milestone.includes('졸업') ? 'bg-green-100 text-green-700 ring-1 ring-inset ring-green-200' : 'bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200'}">
                                {journey.milestone}
                              </span>
                            </div>
                          {/if}
                        </div>
                      </div>
                    </div>
                  </li>
                  {/each}
                </ul>
              </div>
            </div>
          {/if}
        </div>

        <!-- ★ 전공 이수 현황 섹션 -->
        <div class="mb-6 border-b border-gray-200 pb-6">
          <div
            class="flex items-center justify-between cursor-pointer rounded-lg p-2 -m-2 hover:bg-gray-50 transition-colors"
            onclick={() => graduationSections.majors = !graduationSections.majors}
          >
            <h3 class="text-lg font-medium text-gray-900 flex items-center">📚 전공 이수 현황</h3>
            <svg
              class="w-5 h-5 text-gray-500 transition-transform"
              class:rotate-180={graduationSections.majors}
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>

          {#if graduationSections.majors}
            <div class="mt-4">
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
            </div>
          {/if}
        </div>

        <!-- 교양 영역별 상세 -->
        <div>
          <div
            class="flex items-center justify-between cursor-pointer rounded-lg p-2 -m-2 hover:bg-gray-50 transition-colors"
            onclick={() => graduationSections.general = !graduationSections.general}
          >
            <h3 class="text-lg font-medium text-gray-900 flex items-center">🌍 교양 영역별 현황</h3>
            <svg
              class="w-5 h-5 text-gray-500 transition-transform"
              class:rotate-180={graduationSections.general}
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>

          {#if graduationSections.general}
            <div class="mt-4">
              <div class="space-y-4">
                <!-- 교양필수 (학년별) -->
                <div class="bg-blue-50 rounded-lg p-3">
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="font-medium text-gray-900">{generalEducation.required.name}</h4>
                    <span class="text-sm text-gray-700">{generalEducation.required.completed}/{generalEducation.required.required} 학점</span>
                  </div>

                  <!-- 학기 선택 탭 (1-1부터 4-4까지) -->
                  <div class="grid grid-cols-4 gap-1 bg-gray-100 rounded-lg p-1 mb-3">
                    {#each Object.entries(generalEducation.required.bySemester) as [semester, data]}
                      <button
                        class="px-2 py-1 text-xs font-medium rounded transition-all {selectedSemester === semester ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'}"
                        onclick={() => selectedSemester = semester}
                      >
                        {semester}
                        <div class="text-xs">({data.completed}/{data.required})</div>
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
                                    {#if subject.status === 'completed'}✅{:else if subject.status === 'in_progress'}🔄{:else}⏳{/if}
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
                          <div class="text-center text-gray-500 text-sm py-4">해당 학기에 교양필수 과목이 없습니다.</div>
                        {/if}
                      </div>
                    {/if}
                  {/each}
                </div>

                <!-- 핵심교양 -->
                <div class="bg-yellow-50 rounded-lg p-3">
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="font-medium text-gray-900">{generalEducation.core.name}</h4>
                    <span class="text-sm text-gray-700">{generalEducation.core.completed}/{generalEducation.core.required} 학점</span>
                  </div>

                  <div class="space-y-2">
                    {#each generalEducation.core.areas as area}
                      <div class="bg-white rounded p-2">
                        <div class="flex items-center justify-between text-sm mb-1">
                          <span class="text-gray-700 font-medium">{area.name}</span>
                          <span class="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {area.completed}/{area.required > 0 ? area.required : '선택'}
                            {#if area.required > 0 && area.completed >= area.required}
                              ✅
                            {/if}
                          </span>
                        </div>
                        {#if area.isGroup}
                          {#if area.completed > area.required}
                            <div class="text-xs text-gray-500">{area.required}학점 중 선택, {area.completed - area.required}학점 초과 이수</div>
                          {:else if area.completed >= area.required}
                            <div class="text-xs text-gray-500">{area.required}학점 중 선택하여 이수 완료</div>
                          {/if}
                        {/if}
                        {#if (area.required === 0 || !area.required) && area.completed > 0}
                          <div class="text-xs text-gray-500">선택사항 (보너스 이수)</div>
                        {/if}
                      </div>
                    {/each}
                  </div>
                </div>
              </div>
            </div>
          {/if}
        </div>

        <!-- 예상 졸업 학기 -->
        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700">예상 졸업 학기</span>
            <span class="text-lg font-bold text-blue-600">{learningJourney[learningJourney.length - 1]?.semester}</span>
          </div>
          <div class="mt-2 text-xs text-gray-500 space-y-1">
            <p>총 {requiredCredits}학점 이수 필요 (교직 {generalEducation.general.required}학점 별도)</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <span class="font-medium">전공</span>
                {#each majors as major}
                  <div class="ml-2">• {major.name}: {major.requirements.total.required}학점</div>
                {/each}
              </div>
              <div>
                <span class="font-medium">교양</span>
                <div class="ml-2">• {generalEducation.required.name}: {generalEducation.required.required}학점</div>
                <div class="ml-2">• {generalEducation.core.name}: {generalEducation.core.required}학점</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 교직 이수 현황 카드 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          🏫 교직 이수 현황
          <span class="ml-2 text-sm font-normal text-gray-500">({generalEducation.general.completed}/{generalEducation.general.required}학점)</span>
        </h2>
        
        <div class="space-y-6">
          <!-- 전공과목 섹션 -->
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">{dashboardData.teachingCourses.major.name}</h3>
            <div class="space-y-4">
              {#each Object.values(dashboardData.teachingCourses.major.categories) as category}
                <div>
                  <div 
                    class="flex justify-between items-center p-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                    onclick={() => { teachingSectionsState[category.name] = !teachingSectionsState[category.name] }}
                  >
                    <h4 class="font-medium text-gray-700">{category.name}</h4>
                    <div class="flex items-center space-x-2">
                      <span class="text-sm text-gray-600">
                        {category.courses.filter(c => c.status === 'completed').reduce((sum, c) => sum + c.credits, 0)}/{category.required}학점
                      </span>
                      <svg
                        class="w-4 h-4 text-gray-600 transition-transform"
                        class:rotate-180={teachingSectionsState[category.name]}
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </div>

                  {#if teachingSectionsState[category.name]}
                  <div class="mt-2 pl-4 ml-1 space-y-2 border-l-2 border-gray-200">
                    {#each category.courses as course}
                      <div class="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                        <div>
                          {#if course.status === 'completed'}
                            <span class="text-green-500">✅</span>
                          {:else if course.status === 'in_progress'}
                            <span class="text-blue-500">🔄</span>
                          {:else}
                            <span class="text-gray-400">⏳</span>
                          {/if}
                        </div>
                        <div class="flex-grow">
                          <p class="font-medium text-gray-800 text-sm">{course.title}</p>
                          <p class="text-xs text-gray-500">{course.credits}학점</p>
                        </div>
                      </div>
                    {/each}
                  </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>

          <!-- 교직과목 섹션 -->
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">{dashboardData.teachingCourses.profession.name}</h3>
            <div class="space-y-4">
              {#each Object.values(dashboardData.teachingCourses.profession.categories) as category}
                <div>
                  <div 
                    class="flex justify-between items-center p-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                    onclick={() => { teachingSectionsState[category.name] = !teachingSectionsState[category.name] }}
                  >
                    <h4 class="font-medium text-gray-700">{category.name}</h4>
                    <div class="flex items-center space-x-2">
                      <span class="text-sm text-gray-600">
                        {category.courses.filter(c => c.status === 'completed').reduce((sum, c) => sum + c.credits, 0)}/{category.required}학점
                      </span>
                      <svg
                        class="w-4 h-4 text-gray-600 transition-transform"
                        class:rotate-180={teachingSectionsState[category.name]}
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </div>
                  
                  {#if teachingSectionsState[category.name]}
                  <div class="mt-2 pl-4 ml-1 space-y-2 border-l-2 border-gray-200">
                    {#each category.courses as course}
                      <div class="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                        <div>
                          {#if course.status === 'completed'}
                            <span class="text-green-500">✅</span>
                          {:else if course.status === 'in_progress'}
                            <span class="text-blue-500">🔄</span>
                          {:else}
                            <span class="text-gray-400">⏳</span>
                          {/if}
                        </div>
                        <div class="flex-grow">
                          <p class="font-medium text-gray-800 text-sm">{course.title}</p>
                          <p class="text-xs text-gray-500">{course.credits}학점</p>
                        </div>
                      </div>
                    {/each}
                  </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 오른쪽 컬럼: 추천 강의 (1/3 너비) -->
    <div class="space-y-6">
      
      <!-- 기본 수업 카드 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          📋 기본 수업
          <span class="ml-2 text-sm font-normal text-gray-500">(필수/권장 과목)</span>
        </h2>
        
        <div class="space-y-4">
          {#each basicCourses as course}
            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 class="font-medium text-gray-900 mb-1">{course.title}</h3>
              <p class="text-sm text-gray-600 mb-2">{course.dept}</p>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {course.credits}학점
                  </span>
                  <span class="text-xs {course.status === 'required' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'} px-2 py-1 rounded-full">
                    {course.status === 'required' ? '필수' : '권장'}
                  </span>
                   <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    {course.type}
                  </span>
                </div>
                <button class="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors flex-shrink-0">
                  담기
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- 추천 강의 카드 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          💡 추천 강의
        </h2>
        
        <div class="space-y-4">
          {#each recommendedCourses as course}
            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 class="font-medium text-gray-900 mb-1">{course.title}</h3>
              <p class="text-sm text-gray-600 mb-2">{course.dept}</p>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {course.credits}학점
                  </span>
                  <span class="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                    {course.reason}
                  </span>
                </div>
                <button class="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors">
                  담기
                </button>
              </div>
            </div>
          {/each}
        </div>
        
        <button class="w-full mt-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
          더 많은 추천 보기
        </button>
      </div>
      
      <!-- 빠른 액션 카드 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          ⚡ 빠른 액션
        </h2>
        
        <div class="space-y-3">
          <button class="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <div class="font-medium text-blue-900">시간표 보기</div>
            <div class="text-sm text-blue-700">현재 학기 시간표 확인</div>
          </button>
          
          <button class="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <div class="font-medium text-green-900">강의 검색</div>
            <div class="text-sm text-green-700">새로운 강의 찾아보기</div>
          </button>
          
          <button class="w-full p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <div class="font-medium text-purple-900">수강 신청</div>
            <div class="text-sm text-purple-700">장바구니에서 신청하기</div>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
