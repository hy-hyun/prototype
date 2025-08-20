<script lang="ts">
  import { onMount } from 'svelte';
  
  // 임시 데이터
  let userName = "김학생";
  let currentSemester = "2024-2";
  let totalCredits = 84;
  let requiredCredits = 176; // 다중전공: 150 + 36 - 10 = 176
  
  // 다중전공 데이터 구조
  let majors = [
    {
      id: 'main',
      name: '교육공학과',
      type: '주전공',
      isActive: true,
      color: '#3b82f6',
      requirements: {
        majorRequired: { completed: 24, required: 30, name: '전공필수' },
        majorElective: { completed: 15, required: 20, name: '전공선택' },
        total: { completed: 39, required: 50 } // 다중전공시 주전공 50학점 (60-10)
      }
    },
    {
      id: 'double',
      name: '화학공학과',
      type: '복수전공',
      isActive: false,
      color: '#10b981',
      requirements: {
        majorRequired: { completed: 18, required: 21, name: '전공필수' },
        majorElective: { completed: 9, required: 15, name: '전공선택' },
        total: { completed: 27, required: 36 } // 복수전공 36학점
      }
    }
  ];
  
  let selectedMajor = $state('main');
  let selectedSemester = $state('1-1'); // 교양필수 학기 선택
  
  // 교양 영역별 상세 데이터 (다중전공 기준)
  let generalEducation = {
    required: { 
      completed: 12, required: 15, name: '교양필수',
      bySemester: {
        '1-1': {
          completed: 6, required: 6,
          subjects: [
            { name: '글쓰기와 의사소통', completed: 3, required: 3, status: 'completed' },
            { name: '영어읽기와 쓰기', completed: 3, required: 3, status: 'completed' }
          ]
        },
        '1-2': {
          completed: 3, required: 3,
          subjects: [
            { name: '학술적 글쓰기', completed: 3, required: 3, status: 'completed' }
          ]
        },
        '2-1': {
          completed: 1, required: 3,
          subjects: [
            { name: '고급영어', completed: 1, required: 3, status: 'in_progress' }
          ]
        },
        '2-2': {
          completed: 2, required: 3,
          subjects: [
            { name: '중국어 기초', completed: 2, required: 3, status: 'in_progress' }
          ]
        },
        '3-1': { completed: 0, required: 0, subjects: [] },
        '3-2': { completed: 0, required: 0, subjects: [] },
        '4-1': { completed: 0, required: 0, subjects: [] },
        '4-2': { completed: 0, required: 0, subjects: [] }
      },
      areas: [
        { name: '글쓰기', completed: 6, required: 6 },
        { name: '영어', completed: 4, required: 6 },
        { name: '제2외국어', completed: 2, required: 3 }
      ]
    },
    core: { 
      completed: 18, required: 18, name: '핵심교양',
      areas: [
        { name: '글로벌 언어와 문화 영역', completed: 2, required: 2 },
        { name: '소프트웨어 영역', completed: 2, required: 2 },
        { name: '미래산업과 창업영역 + 과학과 기술영역', completed: 4, required: 4, isGroup: true },
        { name: '고전읽기 + 인문과 예술 + 사회와 세계 영역', completed: 8, required: 4, isGroup: true },
        { name: '가상대학 영역', completed: 2, required: 0, isOptional: true }
      ]
    },
    general: { completed: 21, required: 57, name: '일반교양' } // 176 - 50(주전공) - 36(복수전공) - 15(교양필수) - 18(핵심교양) = 57
  };
  
  // 러닝저니 데이터 (학기별 학점 축적) - 다중전공 176학점 기준
  let learningJourney = [
    { semester: '2022-1', credits: 18, cumulative: 18, milestone: '입학' },
    { semester: '2022-2', credits: 19, cumulative: 37, milestone: null },
    { semester: '2023-1', credits: 17, cumulative: 54, milestone: '전공기초 완료' },
    { semester: '2023-2', credits: 18, cumulative: 72, milestone: '복수전공 시작' },
    { semester: '2024-1', credits: 12, cumulative: 84, milestone: '현재' },
    { semester: '2024-2', credits: 18, cumulative: 102, milestone: '예상', isFuture: true },
    { semester: '2025-1', credits: 19, cumulative: 121, milestone: '예상', isFuture: true },
    { semester: '2025-2', credits: 18, cumulative: 139, milestone: '예상', isFuture: true },
    { semester: '2026-1', credits: 19, cumulative: 158, milestone: '예상', isFuture: true },
    { semester: '2026-2', credits: 18, cumulative: 176, milestone: '졸업 예정', isFuture: true }
  ];
  
  // 추천 강의 임시 데이터
  let recommendedCourses = [
    { id: '1', title: '데이터베이스시스템', dept: '컴퓨터공학과', credits: 3, reason: '전공 필수' },
    { id: '2', title: '운영체제', dept: '컴퓨터공학과', credits: 3, reason: '전공 필수' },
    { id: '3', title: '창의적 사고와 글쓰기', dept: '교양학부', credits: 3, reason: '교양 필수' }
  ];
  
  // 기본 수업 임시 데이터
  let basicCourses = [
    { id: '1', title: '캡스톤디자인', dept: '컴퓨터공학과', credits: 3, status: 'required', type: '전공필수' },
    { id: '2', title: '소프트웨어공학', dept: '컴퓨터공학과', credits: 3, status: 'recommended', type: '전공선택' },
    { id: '3', title: '영어회화', dept: '교양학부', credits: 2, status: 'required', type: '교양필수' }
  ];
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

            <!-- 핵심교양 (사범대 기준) -->
            <div class="bg-yellow-50 rounded-lg p-3">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium text-gray-900">{generalEducation.core.name} (사범대)</h4>
                <span class="text-sm text-gray-700">{generalEducation.core.completed}/{generalEducation.core.required} 학점</span>
              </div>
              
              <div class="space-y-2">
                <!-- 개별 영역 -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div class="bg-white rounded p-2">
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-gray-700 font-medium">글로벌 언어와 문화</span>
                      <span class="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">2/2 ✅</span>
                    </div>
                  </div>
                  <div class="bg-white rounded p-2">
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-gray-700 font-medium">소프트웨어</span>
                      <span class="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">2/2 ✅</span>
                    </div>
                  </div>
                </div>

                <!-- 영역 A: 미래/과학 -->
                <div class="bg-white rounded p-2">
                  <div class="flex items-center justify-between text-sm mb-1">
                    <span class="text-gray-700 font-medium">미래산업 & 과학기술 영역</span>
                    <span class="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">4/4 ✅</span>
                  </div>
                  <div class="text-xs text-gray-500">4학점 중 선택하여 이수 완료</div>
                </div>

                <!-- 영역 B: 인문/고전/사회 -->
                <div class="bg-white rounded p-2">
                  <div class="flex items-center justify-between text-sm mb-1">
                    <span class="text-gray-700 font-medium">고전읽기 & 인문예술 & 사회세계 영역</span>
                    <span class="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">8/4 🏆</span>
                  </div>
                  <div class="text-xs text-gray-500">4학점 중 선택, 4학점 초과 이수</div>
                </div>

                <!-- 선택 영역: 가상대학 -->
                <div class="bg-white rounded p-2">
                  <div class="flex items-center justify-between text-sm mb-1">
                    <span class="text-gray-700 font-medium">가상대학 영역</span>
                    <span class="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">2/선택</span>
                  </div>
                  <div class="text-xs text-gray-500">선택사항 (보너스 이수)</div>
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
      
      <!-- 기본 수업 카드 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          📋 기본 수업
          <span class="ml-2 text-sm font-normal text-gray-500">(필수/권장 과목)</span>
        </h2>
        
        <div class="space-y-3">
          {#each basicCourses as course}
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 rounded-full {course.status === 'required' ? 'bg-red-500' : 'bg-yellow-500'}"></div>
                <div>
                  <h3 class="font-medium text-gray-900">{course.title}</h3>
                  <p class="text-sm text-gray-600">{course.dept} • {course.credits}학점 • {course.type}</p>
                </div>
              </div>
              <div class="flex space-x-2">
                <button class="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors">
                  담기
                </button>
                <button class="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors">
                  신청
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
    
    <!-- 오른쪽 컬럼: 추천 강의 (1/3 너비) -->
    <div class="space-y-6">
      
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
