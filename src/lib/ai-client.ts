// AI 추천 및 최적화를 위한 클라이언트 측 유틸리티

export interface UserProfile {
  major: string;
  year: number;
  interests: string[];
  completedCourses: string[];
}

export interface TimetablePreferences {
  preferMorning?: boolean;
  avoidConsecutive?: boolean;
  maxDailyHours?: number;
}

export interface CourseRecommendation {
  courseId: string;
  reason: string;
  confidence: number;
}

// 강의 추천 요청
export async function getAIRecommendations(userProfile: UserProfile): Promise<{
  success: boolean;
  recommendations?: CourseRecommendation[];
  error?: string;
}> {
  try {
    const response = await fetch('/api/ai/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userProfile }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error };
    }

    const data = await response.json();
    return {
      success: true,
      recommendations: data.recommendations,
    };
  } catch (error) {
    return {
      success: false,
      error: '네트워크 오류가 발생했습니다.',
    };
  }
}

// 시간표 최적화 요청
export async function optimizeWithAI(
  selectedCourses: Array<{
    courseId: string;
    title: string;
    schedule: Array<{ day: number; start: number; end: number; building: string; room: string }>;
  }>,
  preferences: TimetablePreferences = {}
): Promise<{
  success: boolean;
  optimization?: string;
  error?: string;
}> {
  try {
    const response = await fetch('/api/ai/optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedCourses, preferences }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error };
    }

    const data = await response.json();
    return {
      success: true,
      optimization: data.optimization,
    };
  } catch (error) {
    return {
      success: false,
      error: '네트워크 오류가 발생했습니다.',
    };
  }
}

// AI 추천을 표시하는 컴포넌트에서 사용할 수 있는 헬퍼 함수들
export function formatRecommendation(recommendation: CourseRecommendation): string {
  return `${recommendation.courseId}: ${recommendation.reason} (신뢰도: ${recommendation.confidence}%)`;
}

export function groupRecommendationsByCategory(
  recommendations: CourseRecommendation[],
  courses: Array<{ courseId: string; category: string }>
): Record<string, CourseRecommendation[]> {
  const grouped: Record<string, CourseRecommendation[]> = {};
  
  recommendations.forEach(rec => {
    const course = courses.find(c => c.courseId === rec.courseId);
    const category = course?.category || '기타';
    
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(rec);
  });
  
  return grouped;
}

