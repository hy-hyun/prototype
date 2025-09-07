import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllCourses } from '$lib/firestore';
import type { Lecture, UserDocument } from '$lib/types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '$env/static/private';

// Gemini AI 클라이언트 초기화
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * AI 강의 추천을 위한 프롬프트 생성 함수
 * @param studentData 학생의 전체 문서 데이터
 * @param allCourses Firestore의 전체 강의 목록
 * @returns Gemini API에 전달할 프롬프트 문자열
 */
function createPrompt(studentData: UserDocument, allCourses: Lecture[], semester: string): string {
	const { profile, dashboard } = studentData;

	// 학생이 이미 수강한 과목 목록
	const takenCourses = dashboard.learningJourney
		.flatMap(journey => journey.courses || [])
		.map(course => `- ${course.title} (${course.courseId})`)
		.join('\n');

	// 학생이 이미 수강한 과목 ID 목록
	const takenCourseIds = new Set(
		dashboard.learningJourney.flatMap(journey => journey.courses || []).map(course => course.courseId)
	);

	// 학생이 이수해야 할 필수 과목 목록 생성
	const unmetRequirementTitles = new Set<string>();
	let unmetRequirementsText = '';

	// 1. basicCourses
	if (dashboard.basicCourses) {
		dashboard.basicCourses
			.filter(c => c.status === 'required')
			.forEach(c => {
				unmetRequirementTitles.add(c.title);
				unmetRequirementsText += `- ${c.title} (기본 필수)\n`;
			});
	}
	// 2. generalEducation.required
	if (dashboard.generalEducation?.required) {
		for (const semester in dashboard.generalEducation.required.bySemester) {
			dashboard.generalEducation.required.bySemester[semester].subjects
				.filter(s => s.status === 'not_started')
				.forEach(s => {
					unmetRequirementTitles.add(s.name);
					unmetRequirementsText += `- ${s.name} (교양 필수)\n`;
				});
		}
	}
	// 3. teachingCourses
	if (dashboard.teachingCourses) {
		const { major, profession } = dashboard.teachingCourses;
		Object.values(major.categories)
			.flatMap(cat => cat.courses)
			.filter(c => c.status === 'not_started')
			.forEach(c => {
				unmetRequirementTitles.add(c.title);
				unmetRequirementsText += `- ${c.title} (교직 필수)\n`;
			});
		Object.values(profession.categories)
			.flatMap(cat => cat.courses)
			.filter(c => c.status === 'not_started')
			.forEach(c => {
				unmetRequirementTitles.add(c.title);
				unmetRequirementsText += `- ${c.title} (교직 필수)\n`;
			});
	}

	// 추천 대상 강의 목록을 지능적으로 구성 (필수 과목 우선)
	const allAvailableCourses = allCourses.filter(c => !takenCourseIds.has(c.courseId));
	
	const requiredCoursesInList = allAvailableCourses.filter(c => unmetRequirementTitles.has(c.title));
	const otherCoursesInList = allAvailableCourses.filter(c => !unmetRequirementTitles.has(c.title));

	const prioritizedCourses = [...requiredCoursesInList, ...otherCoursesInList];
	
	const availableCoursesText = prioritizedCourses
		.slice(0, 200) // 우선순위 정렬된 목록에서 200개 선택
		.map(
			c =>
				`- ${c.title} (${c.courseId}-${c.classId}, ${c.dept}, ${c.credits.lecture + c.credits.lab}학점, 이수구분: ${c.category})`
		)
		.join('\n');


	// 제외할 과목 목록 생성
	const coursesToExclude = new Set([
		...(dashboard.basicCourses || []).map(c => c.title),
		...(dashboard.baseRecommendationsBySemester?.[semester] || []).map(c => c.title)
	]);

	// 2026-2 학기에는 이전 학기 추천 과목도 제외
	if (semester === '2026-2') {
		(dashboard.baseRecommendationsBySemester?.['2025-2'] || []).forEach(c => coursesToExclude.add(c.title));
		(dashboard.baseRecommendationsBySemester?.['2026-1'] || []).forEach(c => coursesToExclude.add(c.title));
	}
	
	const exclusionListText = Array.from(coursesToExclude).map(title => `- ${title}`).join('\n');


	// 학생 정보에 필요한 전공 정보
	const major1 = dashboard.majors?.[0];
	const major2 = dashboard.majors?.[1];

	// 최종 프롬프트
	return `
너는 한양대학교 교육공학과의 전문 학사 조교 AI야. 주어진 학생 데이터를 바탕으로, ${semester} 학기에 수강하면 가장 좋을 단 하나의 강의를 추천하고 그 이유를 설명해야 해. **단, 이미 학생에게 기본적으로 추천된 과목은 제외해야 해.**

### 학생 정보
- 이름: ${profile.name}
- 주전공: ${major1?.name || '정보 없음'}
${major2 ? `- 다중전공: ${major2.name}` : ''}

### 학생이 이미 수강한 과목 목록
${takenCourses}

### 학생이 졸업을 위해 필수로 이수해야 하지만 아직 듣지 않은 과목 목록
${unmetRequirementsText.trim() || '현재 데이터로는 명확한 필수 미이수 과목을 찾을 수 없습니다.'}

### 이미 기본 추천으로 표시된 과목 목록 (이 목록의 과목은 추천에서 제외할 것)
${exclusionListText || '없음'}

### 추천 가능한 전체 강의 목록 (학생이 아직 수강하지 않은 과목들이며, 이 목록 안에서만 추천해야 함)
${availableCoursesText}

### 지시사항
1. **가장 중요한 규칙: 추천하는 과목은 반드시 '추천 가능한 전체 강의 목록'에 있는 과목이어야 해. 목록에 없는 과목을 절대 지어내면 안 돼.**
2. '이미 기본 추천으로 표시된 과목 목록'에 있는 과목은 **절대 추천하지 마**.
3. 그 다음, '학생이 졸업을 위해 필수로 이수해야 하지만 아직 듣지 않은 과목 목록'을 확인해줘.
4. 위 목록에 있으면서, 기본 추천 목록에는 없는 과목을 최우선으로 추천해줘.
5. 만약 그런 과목이 없다면, 학생의 주전공 또는 다중전공 학점을 채우는 데 가장 도움이 되는 다른 전공 과목을 추천해줘.
6. 추천 이유('reason')는 '미이수한 교직이수 과목', '제2전공 학점 이수' 와 같이 핵심적인 키워드나 카테고리 형태로 매우 짧게 작성해줘.
7. 반드시 아래 JSON 형식에 맞춰 한글로만 답변해야 하며, 다른 어떤 텍스트도 추가하지 마.

{
  "id": "추천과목 학수번호-수업번호",
  "title": "추천 과목명",
  "dept": "개설 학과",
  "credits": "학점(숫자만)",
  "reason": "사용자에게 보여줄 간결한 추천 이유"
}
(주의: id, title을 포함한 모든 필드는 반드시 채워져야 하며, 누락되어서는 안 됨)
`.trim();
}

// 간단한 인메모리 캐시 구현
interface CacheEntry {
	data: any;
	timestamp: number;
}
const recommendationCache = new Map<string, CacheEntry>();
const CACHE_DURATION_MS = 3 * 60 * 1000; // 캐시 유효 시간: 3분

/**
 * AI 강의 추천 API (POST)
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const { userDocument, semester } = await request.json();

		if (!userDocument?.profile?.studentId) {
			return json({ success: false, message: '학생 정보(학번)가 필요합니다.' }, { status: 400 });
		}
		const studentId = userDocument.profile.studentId;

		// 2026-1 학기는 AI 추천 비활성화 (데모용)
		if (semester === '2026-1') {
			return json({ success: true, data: null });
		}

		// 1. 캐시 확인
		const cachedEntry = recommendationCache.get(studentId + semester); // 학기별로 캐시 키 구분
		if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_DURATION_MS) {
			console.log(`🤖 캐시된 추천 제공: ${studentId} (${semester})`);
			return json({
				success: true,
				data: cachedEntry.data
			});
		}
		
		const allCourses = await getAllCourses();
		if (!allCourses || allCourses.length === 0) {
			return json({ success: false, message: '추천할 강의 목록을 불러올 수 없습니다.' }, { status: 404 });
		}
		
		const prompt = createPrompt(userDocument, allCourses, semester);

		const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
		
		const result = await model.generateContent(prompt);
		const response = result.response;
		const text = response.text();

		let aiRecommendation;
		try {
			// Gemini가 반환한 텍스트에서 JSON 블록만 추출
			const jsonMatch = text.match(/{[\s\S]*}/);
			if (!jsonMatch) {
				console.error('Gemini 응답에서 JSON 객체를 찾을 수 없음:', text);
				throw new Error('AI가 유효한 추천을 제공하지 못했습니다.');
			}
			
			const jsonString = jsonMatch[0];
			aiRecommendation = JSON.parse(jsonString);
		} catch (parseError) {
			console.error('Gemini 응답 JSON 파싱 실패:', text);
			throw new Error('AI가 추천 결과를 잘못된 형식으로 반환했습니다.');
		}

		// credits를 숫자로 변환
		aiRecommendation.credits = Number(aiRecommendation.credits) || 0;

		// 2. 새로운 결과를 캐시에 저장
		recommendationCache.set(studentId + semester, { // 학기별로 캐시 키 구분
			data: aiRecommendation,
			timestamp: Date.now()
		});

		return json({
			success: true,
			data: aiRecommendation
		}, { status: 200 });

	} catch (error) {
		console.error('AI recommendation API error:', error);
		
		return json({
			success: false,
			message: 'AI 추천을 받아오는 중 오류가 발생했습니다.' 
		}, { status: 500 });
	}
};
