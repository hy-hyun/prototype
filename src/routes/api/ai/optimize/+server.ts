import { json } from '@sveltejs/kit';
import { optimizeTimetable } from '$lib/openai';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { selectedCourses, preferences = {} } = await request.json();
    
    // 입력 데이터 검증
    if (!selectedCourses || !Array.isArray(selectedCourses)) {
      return json({ error: 'Invalid selected courses' }, { status: 400 });
    }

    // OpenAI API 호출
    const result = await optimizeTimetable(selectedCourses, preferences);
    
    if (!result.success) {
      return json({ error: result.error }, { status: 500 });
    }

    return json({
      success: true,
      optimization: result.data,
      usage: result.usage
    });

  } catch (error) {
    console.error('AI Optimization Error:', error);
    return json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
};

