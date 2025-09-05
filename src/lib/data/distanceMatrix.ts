/**
 * 건물 그룹 간 이동거리 매트릭스
 * 'X'Y': 값 형식으로 저장
 * X: 출발 그룹, Y: 도착 그룹
 */

export type DistanceWarning = '0' | '주의' | '경고' | '비대면' | '-';

export const DISTANCE_MATRIX: Record<string, Record<string, DistanceWarning>> = {
  'A': {
    'A': '0',
    'B': '주의',
    'C': '경고',
    'D': '주의',
    'E': '-',
    'F': '-',
    'G': '-',
    'H': '비대면'
  },
  'B': {
    'A': '-',
    'B': '0',
    'C': '-',
    'D': '-',
    'E': '경고',
    'F': '-',
    'G': '-',
    'H': '비대면'
  },
  'C': {
    'A': '경고',
    'B': '주의',
    'C': '0',
    'D': '경고',
    'E': '-',
    'F': '경고',
    'G': '경고',
    'H': '비대면'
  },
  'D': {
    'A': '-',
    'B': '-',
    'C': '경고',
    'D': '0',
    'E': '경고',
    'F': '-',
    'G': '경고',
    'H': '비대면'
  },
  'E': {
    'A': '-',
    'B': '경고',
    'C': '-',
    'D': '경고',
    'E': '0',
    'F': '경고',
    'G': '-',
    'H': '비대면'
  },
  'F': {
    'A': '-',
    'B': '-',
    'C': '경고',
    'D': '-',
    'E': '경고',
    'F': '0',
    'G': '-',
    'H': '비대면'
  },
  'G': {
    'A': '주의',
    'B': '경고',
    'C': '-',
    'D': '경고',
    'E': '-',
    'F': '주의',
    'G': '0',
    'H': '비대면'
  },
  'H': {
    'A': '주의',
    'B': '경고',
    'C': '경고',
    'D': '경고',
    'E': '-',
    'F': '주의',
    'G': '-',
    'H': '비대면'
  }
};

/**
 * 두 건물 그룹 간의 이동거리 경고 레벨을 반환하는 함수
 */
export function getDistanceWarning(fromGroup: string, toGroup: string): DistanceWarning | null {
  if (!DISTANCE_MATRIX[fromGroup] || !DISTANCE_MATRIX[fromGroup][toGroup]) {
    return null;
  }
  return DISTANCE_MATRIX[fromGroup][toGroup];
}

/**
 * 이동거리 경고 레벨에 따른 UI 정보를 반환하는 함수 (사용자 제공 정보 기반)
 */
export function getDistanceWarningInfo(warning: DistanceWarning) {
  switch (warning) {
    case '0':
      return {
        icon: '🏢',
        message: '동일 건물군',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    case '주의':
      return {
        icon: '⚠️',
        message: '경사 주의',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      };
    case '경고':
      return {
        icon: '⏰',
        message: '이동 시간 경고',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    case '비대면':
      return {
        icon: '💻',
        message: '비대면',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    case '-':
      return {
        icon: '🚶',
        message: '이동 필요',
        color: 'text-darkgray-600',
        bgColor: 'bg-darkgray-50',
        borderColor: 'border-blue-200'
      };
  }
}
