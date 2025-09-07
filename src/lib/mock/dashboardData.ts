export const dashboardData = {
	userInfo: {
		name: '김민우',
		currentSemester: '2025-2',
		totalCredits: 102,
		requiredCredits: 126, // 
	},
	majors: [
		{
			id: '1',
			name: '교육공학과',
			type: '주전공',
			isActive: true,
			color: '#3b82f6',
			requirements: {
				majorRequired: { completed: 39, required: 44, name: '100-300단위' },
				majorElective: { completed: 3, required: 6, name: '400단위' },
				total: { completed: 42, required: 50 }, // 다중전공시 주전공 50학점 (60-10)
			},
		},
		{
			id: '2',
			name: '빅데이터융합전공',
			type: '제2전공',
			isActive: false,
			color: '#10b981',
			requirements: {
				majorRequired: { completed: 12, required: 21, name: '100-300단위' },
				majorElective: { completed: 0, required: 15, name: '400단위' },
				total: { completed: 12, required: 36 }, // 복수전공 36학점
			},
		},
	],
	generalEducation: {
		required: {
			completed: 16,
			required: 19,
			name: '교양 필수',
			bySemester: {
				'1-1': {
					completed: 7,
					required: 7,
					subjects: [
						{ name: '말과글', completed: 2, required: 2, status: 'completed' },
						{ name: '창의적컴퓨팅', completed: 2, required: 2, status: 'completed' },
						{ name: '커리어개발Ⅰ:취.창업진로로드맵', completed: 1, required: 1, status: 'completed' },
						{ name: '사랑의실천1(한양나눔)', completed: 2, required: 2, status: 'completed' },
					],
				},
				'1-2': {
					completed: 4,
					required: 4,
					subjects: [
						{ name: '세계시민교육론', completed: 2, required: 2, status: 'completed' },
						{ name: '과학기술의철학적이해', completed: 2, required: 2, status: 'completed' }]
				},
				'2-1': {completed: 0,required: 0, subjects: [] },
				'2-2': {
					completed: 5,
					required: 5,
					subjects: [
						{ name: '사랑의실천2(스마트커뮤니케이션)', completed: 2, required: 2, status: 'completed' },
						{ name: '전문학술영어', completed: 3, required: 3, status: 'completed' }
					],
				},
				'3-1': { completed: 0, required: 0, subjects: [] },
				'3-2': { completed: 0, required: 3, subjects: [
					{ name: '커리어개발Ⅱ:취.창업진로포트폴리오', completed: 0, required: 1, status: 'not_started' },
					{ name: '사랑의실천3(기업가정신)', completed: 0, required: 2, status: 'not_started' }
					] 
				},
				'4-1': { completed: 0, required: 0, subjects: [] },
				'4-2': { completed: 0, required: 0, subjects: [] },
			},
		},
		core: {
			completed: 13,
			required: 10,
			name: '핵심교양',
			areas: [
				{ name: '고전읽기영역', completed: 2, required: 2 },
				{ name: '글로벌언어와문화영역', completed: 3, required: 2 },
				{ name: '소프트웨어영역', completed: 2, required: 2 },
				{
					name: '미래산업과창업영역 + 과학과기술영역',
					completed: 4,
					required: 2,
					isGroup: true,
				},
				{
					name: '인문과예술영역 + 사회와세계영역',
					completed: 2,
					required: 2,
					isGroup: true,
				},
			],
		},
		general: { completed: 42, required: 50, name: '일반교양' },
	},
	learningJourney: [
		{ semester: '2021-1', credits: 19, cumulative: 19, milestone: '신입학', isFuture: false,
			courses: [
				{ classification: '교양필수', courseId: 'CUL0005', title: '말과글', credits: 3, gradePoints: 4.5, grade: 'A+' },
				{ classification: '교양필수', courseId: 'CUL0011', title: '창의적컴퓨팅', credits: 3, gradePoints: 4.5, grade: 'A+' },
				{ classification: '교양필수', courseId: 'GEN5029', title: '커리어개발 I:취.창업진로로드맵', credits: 1, gradePoints: 4.5, grade: 'A+' },
				{ classification: '교양필수', courseId: 'SYH0001', title: '사랑의실천1(한양나눔)', credits: 2, gradePoints: 0.0, grade: 'P' },
				{ classification: '핵심교양', courseId: 'GEN1078', title: '문화론특강', credits: 2, gradePoints: 4.5, grade: 'A+' },
				{ classification: '핵심교양', courseId: 'GEN5019', title: '매경-한양CEO특강', credits: 2, gradePoints: 0.0, grade: 'P' },
				{ classification: '전공핵심', courseId: 'DET1005', title: '첨단미디어학습환경설계', credits: 3, gradePoints: 4.5, grade: 'A+' },
				{ classification: '전공기초(필수)', courseId: 'DET1003', title: '첨단매체와스마트러닝', credits: 3, gradePoints: 4.5, grade: 'A+' },
			]
		},
		{ semester: '2021-2', credits: 18, cumulative: 37, milestone: null, isFuture: false,
			courses: [
				{ classification: '교양필수', courseId: 'CED1004', title: '세계시민교육론', credits: 2, gradePoints: 4.5, grade: 'A+' },
				{ classification: '교양필수', courseId: 'GEN4091', title: '과학기술의철학적이해', credits: 3, gradePoints: 4.5, grade: 'A+' },
				{ classification: '교직선택', courseId: 'EDU2003', title: '교육사회학', credits: 2, gradePoints: 4.5, grade: 'A+' },
				{ classification: '교직선택', courseId: 'EDU2014', title: '교육철학및교육사', credits: 2, gradePoints: 4.5, grade: 'A+' },
				{ classification: '핵심교양', courseId: 'CUL1122', title: '창의적프로그래밍', credits: 2, gradePoints: 4.5, grade: 'A+' },
				{ classification: '핵심교양', courseId: 'CUL4034', title: '교양테니스1', credits: 2, gradePoints: 0.0, grade: 'P' },
				{ classification: '핵심교양', courseId: 'ECO1006', title: '미시경제원론', credits: 2, gradePoints: 4.5, grade: 'A+' },
				{ classification: '전공기초(필수)', courseId: 'DET1004', title: '교육공학이론과실제', credits: 3, gradePoints: 4.5, grade: 'A+' },
			]
		},
		{ semester: '2022-1', credits: 20, cumulative: 57, milestone: null, isFuture: false, courses: [
				{ classification: '교직선택', courseId: 'EDU3020', title: '교육행정및경영', credits: 2, gradePoints: 4.5, grade: 'A+' },
				{ classification: '교직선택', courseId: 'EDU2061', title: '생활지도및상담', credits: 2, gradePoints: 4.5, grade: 'A+' },
				{ classification: '핵심교양', courseId: 'CUL6078', title: '미디어로세상읽기', credits: 2, gradePoints: 4.5, grade: 'A+' },
				{ classification: '핵심교양', courseId: 'CUL5036', title: '교양배드민턴', credits: 2, gradePoints: 0.0, grade: 'P' },
				{ classification: '전공핵심', courseId: 'DET2029', title: '소통미디어교육론', credits: 3, gradePoints: 4.5, grade: 'A+' },
				{ classification: '전공핵심', courseId: 'DET4022', title: '교수체제개발', credits: 3, gradePoints: 4.5, grade: 'A+' },
				{ classification: '전공심화', courseId: 'EDU4037', title: '교육공학데이터분석', credits: 3, gradePoints: 4.5, grade: 'A+' },
				{ classification: '전공심화', courseId: 'DET3039', title: 'GBL설계와적용', credits: 3, gradePoints: 4.5, grade: 'A+' },
			]
		},
		{ semester: '2022-2', credits: 19, cumulative: 76, milestone: '제2전공', isFuture: false, courses: [
				{ classification: '교양필수', courseId: 'SYH0002', title: '사랑의실천2(스마트커뮤니케이션)', credits: 2, gradePoints: 0.0, grade: 'P' },
				{ classification: '교직선택', courseId: 'EDU3079', title: '교육평가론', credits: 2, gradePoints: 4.5, grade: 'A+' },
				{ classification: '핵심교양', courseId: 'GEN5014', title: '기초스페인어', credits: 3, gradePoints: 4.5, grade: 'A+' },
				{ classification: '전공핵심', courseId: 'DET3035', title: '학습동기와게임', credits: 3, gradePoints: 4.5, grade: 'A+' },
				{ classification: '전공심화', courseId: 'DET3038', title: 'LMS와학습분석학', credits: 3, gradePoints: 4.5, grade: 'A+' },
				{ classification: '전공기초(필수)', courseId: 'DET2014', title: '교수설계', credits: 3, gradePoints: 4.5, grade: 'A+' },
				{ classification: '전공기초(필수)', courseId: 'DET3014', title: '오프러닝과적응적기술의활용', credits: 3, gradePoints: 4.5, grade: 'A+' },
			]
		},
		{ semester: '2022-겨울', credits: 3, cumulative: 79, milestone: null, isFuture: false, courses: [
				{ classification: '교양필수', courseId: 'GEN6032', title: '전문학술영어', credits: 3, gradePoints: 4.5, grade: 'A+' },
			]
		},
		{
			semester: '2025-1',
			credits: 23,
			cumulative: 102,
			milestone: '정규 복학',
			isFuture: false,
			courses: [
				{ classification: '제2전공', courseId: 'BIG2003', title: '자료구조와알고리즘', credits: 3, gradePoints: 4.5, grade: 'A+' },
				{ classification: '제2전공', courseId: 'BIG2007', title: '사회데이터조사방법론', credits: 3, gradePoints: 4.5, grade: 'A+' },
				{ classification: '제2전공', courseId: 'BIG2002', title: '기초확률및통계', credits: 3, gradePoints: 4.5, grade: 'A+' },
				{ classification: '교직필수', courseId: 'EDU3041', title: '교육봉사활동1', credits: 2, gradePoints: 0.0, grade: 'P' },
				{ classification: '교직선택', courseId: 'EDU4019', title: '교육방법및공학', credits: 2, gradePoints: 4.5, grade: 'A+' },
				{ classification: '핵심교양', courseId: 'GEN4079', title: '사회봉사', credits: 1, gradePoints: 0.0, grade: 'P' },
				{ classification: '전공핵심', courseId: 'DET2028', title: '뉴미디어학습컨텐츠개발', credits: 3, gradePoints: 4.5, grade: 'A+' },
				{ classification: '전공기초(필수)', courseId: 'DET4012', title: '디지털변혁시대의HRD방법론', credits: 3, gradePoints: 4.5, grade: 'A+' },
			]
		},
		{ semester: '2025-2', credits: 21, cumulative: 123, milestone: '21학점 이수 예상', isFuture: true },
		{ semester: '2026-1', credits: 16, cumulative: 139, milestone: '16학점 이수 예상', isFuture: true },
		{ semester: '2026-2', credits: 15, cumulative: 154, milestone: '15학점 이수 예상', isFuture: true },
	],
	// 학기별 기본 추천 과목
	baseRecommendationsBySemester: {
		'2025-2': [
			{
				id: 'DET2038',
				title: '4차산업혁명시대의인재경영론',
				dept: '교육공학과',
				credits: 3,
				reason: '미이수한 필수과목'
			},
			{
				id: 'DET3028',
				title: '이러닝개발',
				dept: '교육공학과',
				credits: 3,
				reason: '3학년 2학기 필수과목'
			},
			{
				id: 'GEN5100',
				title: '커리어개발Ⅱ:취.창업진로포트폴리오',
				dept: '교육공학과',
				credits: 1,
				reason: '3학년 2학기 필수과목'
			},
			{
				id: 'SYH0003',
				title: '사랑의실천3(기업가정신)',
				dept: '한양리더십센터',
				credits: 2,
				reason: '3학년 2학기 필수과목'
			},
			{
				id: 'CED2012',
				title: '교육학교과교육론',
				dept: '교육학과',
				credits: 3,
				reason: '미이수한 교직이수 과목'
			},
			{
				id: 'DET4029',
				title: '교육공학사례연구',
				dept: '교육공학과',
				credits: 3,
				reason: '400단위 전공 이수'
			},
			{
				id: 'BIG2006',
				title: 'R과자료시각화',
				dept: '빅데이터융합전공',
				credits: 3,
				reason: '제2전공 학점 이수'
			},
			{
				id: 'AIX0005',
				title: 'AI+X:머신러닝',
				dept: '창의융합교육원',
				credits: 3,
				reason: '전공 인정 교과목 (제2전공)'
			}
		],
		'2026-1': [
			{
				id: 'EDU3032',
				title: '교육학교과교재및이론',
				dept: '교육학과',
				credits: 3,
				reason: '미이수한 교직이수 과목'
			},
			{
				id: 'EDU2025',
				title: '교육논술',
				dept: '교육학과',
				credits: 2,
				reason: '미이수한 교직이수 과목'
			},
			{
				id: 'EDU4003',
				title: '교육실습',
				dept: '교직과',
				credits: 3,
				reason: '미이수한 교직이수 과목'
			},
			{
				id: 'BIG2001',
				title: '기초미적분학',
				dept: '빅데이터융합전공',
				credits: 3,
				reason: '제2전공 필수 과목'
			},
			{
				id: 'BIG3001',
				title: '통계적모델링',
				dept: '빅데이터융합전공',
				credits: 3,
				reason: '제2전공 학점 이수'
			},
			{
				id: 'BIG3002',
				title: '빅데이터마이닝',
				dept: '빅데이터융합전공',
				credits: 3,
				reason: '제2전공 학점 이수'
			}
		],
		'2026-2': [
			{
				id: 'EDU3080',
				title: '학교폭력예방및학생의이해',
				dept: '교원양성지원센터',
				credits: 2,
				reason: '미이수한 교직이수 과목'
			},
			{
				id: 'EDU3071',
				title: '특수교육학개론',
				dept: '교원양성지원센터',
				credits: 2,
				reason: '미이수한 교직이수 과목'
			},
			{
				id: 'EDU4003',
				title: '교육실습',
				dept: '교직과',
				credits: 3,
				reason: '미이수한 교직이수 과목'
			},
			{
				id: 'BIG3005',
				title: '사회연결망분석과텍스트마이닝',
				dept: '빅데이터융합전공',
				credits: 3,
				reason: '제2전공 학점 이수'
			},
			{
				id: 'ITC3009',
				title: '텍스트마이닝',
				dept: '빅데이터융합전공',
				credits: 3,
				reason: '제2전공 400단위 전공 이수'
			},
			{
				id: 'BIG4001',
				title: '응용회귀분석',
				dept: '빅데이터융합전공',
				credits: 3,
				reason: '제2전공 400단위 전공 이수'
			}
		],
	},
	basicCourses: [
		{
			id: '1',
			title: '이러닝개발',
			dept: '교육공학과',
			credits: 3,
			status: 'required',
			type: '전공필수(기초)',
		},
		{
			id: '2',
			title: '커리어개발Ⅱ:취.창업진로포트폴리오',
			dept: '교육공학과',
			credits: 1,
			status: 'required',
			type: '교양필수',
		},
		{
			id: '3',
			title: '사랑의실천3(기업가정신)',
			dept: '한양리더십센터',
			credits: 2,
			status: 'required',
			type: '교양필수',
		},
	],
	teachingCourses: {
		general: { completed: 42, required: 51, name: '교직이수' },
		major: {
			name: '전공과목',
			categories: {
				basic: {
					name: '기본이수',
					required: 21,
					fields: 7,
					courses: [
						{ title: '이러닝설계론', credits: 3, status: 'completed', fieldId: '교육학개론' },
						{ title: '소통미디어교육론', credits: 3, status: 'completed', fieldId: '교육학개론' },
						{ title: 'LMS와학습분석학', credits: 3, status: 'completed', fieldId: '교육평가' },
						{ title: '교육공학데이터분석', credits: 3, status: 'completed', fieldId: '교육평가' },
						{ title: '교수설계', credits: 3, status: 'completed', fieldId: '교수학습이론' },
						{ title: '뉴미디어학습컨텐츠개발', credits: 3, status: 'completed', fieldId: '교육행정' },
						{ title: '교육공학이론과실제', credits: 3, status: 'completed', fieldId: '교육공학' },
						{ title: '첨단매체와스마트러닝', credits: 3, status: 'completed', fieldId: '교육공학' },
						{ title: '교수체제개발', credits: 3, status: 'completed', fieldId: '교육연구방법' },
						{ title: '디지털변혁시대의HRD방법론', credits: 3, status: 'completed', fieldId: '교육연구방법' }
					]
				},
				subjectEducation: {
					name: '교과교육',
					required: 8,
					fields: 3,
					courses: [
						{ title: '교육학교과교육론', credits: 3, status: 'not_started', fieldId: '교과교육론' },
						{ title: '교육학교과교재및이론', credits: 3, status: 'not_started', fieldId: '교과교재연구및지도' },
						{ title: '교육논술', credits: 2, status: 'not_started', fieldId: '논리및논술' }
					]
				}
			}
		},
		profession: {
			name: '교직과목',
			categories: {
				theory: {
					name: '교직이론',
					required: 12,
					fields: 6,
					courses: [
						{ title: '교육사회학', credits: 2, status: 'completed', fieldId: '교육사회학' },
						{ title: '교육철학및교육사', credits: 2, status: 'completed', fieldId: '교육철학및교육사' },
						{ title: '교육방법및공학', credits: 2, status: 'completed', fieldId: '교육방법및공학' },
						{ title: '교육행정및경영', credits: 2, status: 'completed', fieldId: '교육행정및경영' },
						{ title: '생활지도및상담', credits: 2, status: 'completed', fieldId: '생활지도및상담' },
						{ title: '교육평가론', credits: 2, status: 'completed', fieldId: '교육평가론' }
					]
				},
				aptitude: {
					name: '교직소양',
					required: 6,
					fields: 3,
					courses: [
						{ title: '특수교육학개론', credits: 2, status: 'not_started', fieldId: '특수교육학개론' },
						{ title: '교직실무', credits: 2, status: 'not_started', fieldId: '교직실무' },
						{ title: '학교폭력예방및학생의이해', credits: 2, status: 'not_started', fieldId: '학교폭력예방의이론과실제' }
					]
				},
				practice: {
					name: '교육실습',
					required: 4,
					fields: 2,
					courses: [
						{ title: '교육봉사활동1', credits: 2, status: 'completed', fieldId: '교육봉사활동' },
						{ title: '교육실습', credits: 2, status: 'not_started', fieldId: '학교현장실습' }
					]
				}
			}
		}
	}
};
