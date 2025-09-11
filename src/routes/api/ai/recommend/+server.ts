import { json } from '@sveltejs/kit';
import { recommendCourses } from '$lib/openai';
import { MOCK_LECTURES } from '$lib/mock/data';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { userProfile } = await request.json();
    
    // 사용자 프로필 검증
    if (!userProfile || !userProfile.major || !userProfile.year) {
      return json({ error: 'Invalid user profile' }, { status: 400 });
    }

    // Mock 데이터를 AI 추천을 위한 형태로 변환
    const availableCourses = MOCK_LECTURES.map(course => ({
      courseId: course.courseId,
      title: course.title,
      category: course.category,
      dept: course.dept,
      instructor: course.instructor,
      keywords: course.keywords || []
    }));

    // OpenAI API 호출
    const result = await recommendCourses(userProfile, availableCourses);
    
    if (!result.success) {
      return json({ error: result.error }, { status: 500 });
    }

    // AI 응답 파싱 (JSON 형태로 되어있다고 가정)
    let recommendations;
    try {
      recommendations = JSON.parse(result.data);
    } catch {
      // JSON 파싱 실패 시 텍스트 그대로 반환
      recommendations = { message: result.data };
    }

    return json({
      success: true,
      recommendations,
      usage: result.usage
    });

  } catch (error) {
    console.error('AI Recommendation Error:', error);
    return json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
};

