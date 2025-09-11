import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// 기본 chat completion 함수
export async function chatCompletion(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
) {
  try {
    const response = await openai.chat.completions.create({
      model: options.model || 'gpt-3.5-turbo',
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000,
    });

    return {
      success: true,
      data: response.choices[0]?.message?.content || '',
      usage: response.usage,
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// 강의 추천을 위한 특화 함수
export async function recommendCourses(
  userProfile: {
    major: string;
    year: number;
    interests: string[];
    completedCourses: string[];
  },
  availableCourses: Array<{
    courseId: string;
    title: string;
    category: string;
    dept: string;
    instructor: string;
    keywords: string[];
  }>
) {
  const systemPrompt = `당신은 대학교 수강신청 도우미입니다. 학생의 프로필과 관심사를 바탕으로 적절한 강의를 추천해주세요.

학생 정보:
- 전공: ${userProfile.major}
- 학년: ${userProfile.year}학년
- 관심사: ${userProfile.interests.join(', ')}
- 완료한 강의: ${userProfile.completedCourses.join(', ')}

추천 기준:
1. 학년에 맞는 적절한 난이도
2. 전공과의 연관성
3. 학생의 관심사와의 매칭
4. 이미 수강한 과목과의 중복 방지

응답 형식: JSON 배열로 courseId와 추천 이유를 포함해주세요.`;

  const userPrompt = `다음 강의들 중에서 추천해주세요:
${availableCourses.map(course => 
  `- ${course.courseId}: ${course.title} (${course.category}, ${course.dept}, ${course.keywords.join(', ')})`
).join('\n')}`;

  return chatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], {
    model: 'gpt-3.5-turbo',
    temperature: 0.3,
  });
}

// 시간표 최적화를 위한 함수
export async function optimizeTimetable(
  selectedCourses: Array<{
    courseId: string;
    title: string;
    schedule: Array<{ day: number; start: number; end: number; building: string; room: string }>;
  }>,
  preferences: {
    preferMorning?: boolean;
    avoidConsecutive?: boolean;
    maxDailyHours?: number;
  }
) {
  const systemPrompt = `당신은 시간표 최적화 전문가입니다. 주어진 강의들을 바탕으로 최적의 시간표를 제안해주세요.

최적화 기준:
- 시간 충돌 방지
- 건물 간 이동시간 고려
- 사용자 선호도 반영
- 학습 효율성 고려

응답 형식: 
1. 추천 시간표 (JSON 형태)
2. 문제점 및 개선사항
3. 대안 제안`;

  const userPrompt = `선택한 강의들:
${selectedCourses.map(course => 
  `- ${course.courseId}: ${course.title}\n  시간: ${course.schedule.map(s => 
    `${['일','월','화','수','목','금','토'][s.day]} ${s.start}:00-${s.end}:00 (${s.building} ${s.room})`
  ).join(', ')}`
).join('\n')}

사용자 선호도:
- 오전 선호: ${preferences.preferMorning ? '예' : '아니오'}
- 연강 기피: ${preferences.avoidConsecutive ? '예' : '아니오'}
- 일일 최대 시간: ${preferences.maxDailyHours || '제한없음'}시간`;

  return chatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], {
    model: 'gpt-4',
    temperature: 0.2,
  });
}

export default openai;

