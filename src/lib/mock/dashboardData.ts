export const dashboardData = {
	userInfo: {
		name: '김민우',
		currentSemester: '2025-2',
		totalCredits: 102,
		requiredCredits: 126, // 
	},
	majors: [
		{
			id: 'main',
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
			id: 'double',
			name: '빅데이터융합전공',
			type: '다중전공',
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
			completed: 17,
			required: 21,
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
		general: { completed: 42, required: 50, name: '교직이수' },
	},
	learningJourney: [
		{ semester: '2021-1', credits: 19, cumulative: 19, milestone: '입학' },
		{ semester: '2021-2', credits: 18, cumulative: 37, milestone: null },
		{ semester: '2022-1', credits: 20, cumulative: 57, milestone: null },
		{ semester: '2022-2', credits: 19, cumulative: 76, milestone: null },
		{ semester: '2022-겨울', credits: 3, cumulative: 79, milestone: null },
		{ semester: '2023-1', credits: 0, cumulative: 79, milestone: '군휴학' },
		{ semester: '2025-1', credits: 23, cumulative: 102, milestone: '다중전공 시작, 복학 학기' },
		{ semester: '2025-2', credits: 18, cumulative: 120, milestone: '예상', isFuture: true },
		{ semester: '2026-1', credits: 15, cumulative: 135, milestone: '예상', isFuture: true },
<<<<<<< HEAD
		{ semester: '2026-2', credits: 16, cumulative: 151, milestone: '예상', isFuture: true },
=======
		{ semester: '2026-2', credits: 13, cumulative: 148, milestone: '예상', isFuture: true },
>>>>>>> main
	],
	recommendedCourses: [
		{ id: '1', title: '교육공학사례연구', dept: '교육공학과', credits: 3, reason: '400단위 전공 3학점 추천' },
		{ id: '2', title: '교육공학연구방법과통계', dept: '교육공학과', credits: 3, reason: '빅데이터융합전공 학점 인정' },
		{ id: '3', title: '4차산업혁명시대의인재경영론', dept: '교육공학과', credits: 3, reason: '미이수한 필수과목' },
	],
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
			title: '사랑의실천3(기업가정신)화',
			dept: '한양리더십센터',
			credits: 2,
			status: 'required',
			type: '교양필수',
		},
	],
	teachingCourses: {
		major: {
			name: '전공과목',
			categories: {
				basic: {
					name: '기본이수',
					required: 21,
<<<<<<< HEAD
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
						{ title: '교수체제개발', credits: 3, status: 'completed', fieldId: '교육행정' },
						{ title: '디지털변혁시대의HRD방법론', credits: 3, status: 'completed', fieldId: '교육행정' }
=======
					courses: [
						{ id: 'm1', title: '이러닝개발', credits: 3, status: 'completed' },
						{ id: 'm2', title: '교육방법및교육공학', credits: 3, status: 'completed' },
						{ id: 'm3', title: '인적자원개발론', credits: 3, status: 'in_progress' }
>>>>>>> main
					]
				},
				subjectEducation: {
					name: '교과교육',
					required: 8,
<<<<<<< HEAD
					fields: 3,
					courses: [
						{ title: '교육학교과교육론', credits: 3, status: 'not_started', fieldId: '교과교육론' },
						{ title: '교육학교과교재및이론', credits: 3, status: 'not_started', fieldId: '교과교재연구및지도' },
						{ title: '교육논술', credits: 2, status: 'not_started', fieldId: '논리및논술' }
=======
					courses: [
						{ id: 'se1', title: '컴퓨터교과교육론', credits: 3, status: 'not_started' },
						{ id: 'se2', title: '컴퓨터교과교재연구및지도법', credits: 3, status: 'not_started' }
>>>>>>> main
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
<<<<<<< HEAD
					fields: 6,
					courses: [
						{ title: '교육사회학', credits: 2, status: 'completed', fieldId: '교육사회학' },
						{ title: '교육철학및교육사', credits: 2, status: 'completed', fieldId: '교육철학및교육사' },
						{ title: '교육방법및공학', credits: 2, status: 'completed', fieldId: '교육방법및공학' },
						{ title: '교육행정및경영', credits: 2, status: 'completed', fieldId: '교육행정및경영' },
						{ title: '생활지도및상담', credits: 2, status: 'completed', fieldId: '생활지도및상담' },
						{ title: '교육평가론', credits: 2, status: 'completed', fieldId: '교육평가론' }
=======
					courses: [
						{ id: 't1', title: '교육심리', credits: 2, status: 'completed' },
						{ id: 't2', title: '교육철학 및 교육사', credits: 2, status: 'completed' },
						{ id: 't3', title: '교육과정', credits: 2, status: 'in_progress' },
						{ id: 't4', title: '교육사회', credits: 2, status: 'not_started' }
>>>>>>> main
					]
				},
				aptitude: {
					name: '교직소양',
					required: 6,
<<<<<<< HEAD
					fields: 3,
					courses: [
						{ title: '특수교육학개론', credits: 2, status: 'not_started', fieldId: '특수교육학개론' },
						{ title: '교직실무', credits: 2, status: 'not_started', fieldId: '교직실무' },
						{ title: '학교폭력예방및학생의이해', credits: 2, status: 'not_started', fieldId: '학교폭력예방의이론과실제' }
					]
=======
					courses: [{ id: 'a1', title: '특수교육학개론', credits: 2, status: 'not_started' }]
>>>>>>> main
				},
				practice: {
					name: '교육실습',
					required: 4,
<<<<<<< HEAD
					fields: 2,
					courses: [
						{ title: '교육봉사활동1', credits: 2, status: 'completed', fieldId: '교육봉사활동' },
						{ title: '교육실습', credits: 2, status: 'not_started', fieldId: '학교현장실습' }
					]
=======
					courses: [{ id: 'p1', title: '교육실습', credits: 2, status: 'not_started' }]
>>>>>>> main
				}
			}
		}
	}
};
