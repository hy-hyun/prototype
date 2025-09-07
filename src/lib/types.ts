export type Credit = { lecture: number; lab: number };
export type Meeting = { day: number; start: number; end: number; building?: string; room?: string };

export type Lecture = {
  courseId: string;      // 학수번호
  classId: string;       // 수업번호
  title: string;
  category: string;      // 전공/교양/교직 등
  dept: string;
  instructor: string;
  credits: Credit;
  schedule: Meeting[];
  building?: string;     // 건물 정보 (첫 번째 스케줄의 건물)
  capacity: number;
  area?: string;
  limit?: string;
  keywords?: string[];
  method?: "FCFS" | "BID";
  courseType?: string;
  courseLevel?: string; // 100, 200, 300 등 레벨 단위 문자열
};

export type Notice = { id: string; title: string; content: string; pinned?: boolean; createdAt: string; author?: string; views?: number, category?: string };

export type CartItem = { courseId: string; classId: string; method: "FCFS" | "BID"; bidAmount?: number; order?: number };
export type Application = { 
  courseId: string; 
  classId: string; 
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "FAILED";
  method?: "FCFS" | "BID";
  bidAmount?: number;
  bidResult?: "WAITING" | "WON" | "LOST";
};

// Toast 시스템 타입
export type ToastType = 'success' | 'error' | 'replace';

export type ToastMessage = {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
  existingLecture?: Lecture;
  newLecture?: Lecture;
};

// 연강 경고 시스템 타입
export type RiskLevel = 'safe' | 'warning' | 'danger';

export type TravelInfo = {
  time: number;        // 이동 시간 (분)
  risk: RiskLevel;     // 기본 위험도
  reason: string;      // 설명
};

export type Gap = {
  id: string;
  day: string;         // 요일명 ("월", "화", ...)
  timeSlot: number;    // 표시할 슬롯 위치
  from: string;        // 출발 건물
  to: string;          // 도착 건물
  fromLecture: string; // 출발 강의명
  toLecture: string;   // 도착 강의명
  risk: RiskLevel;     // 계산된 위험도
  requiredTime: number; // 필요 이동시간 (분)
  gapMinutes: number;  // 실제 간격 (분)
  warningMessage: string; // 상태 메시지
};

export type PastCourse = {
  classification: string;
  courseId: string;
  title: string;
  credits: number;
  gradePoints: number;
  grade: string;
};

export type LearningJourney = {
	semester: string;
	credits: number;
	cumulative: number;
	milestone: string | null;
	isFuture: boolean;
	courses?: PastCourse[];
};

// 🔥 새로 추가: 사용자 데이터 타입들
export type UserInfo = {
  name: string;
  studentId: string;
  currentSemester: string;
  totalCredits: number;
  requiredCredits: number;
};

export type Major = {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  color: string;
  requirements: {
    majorRequired: { completed: number; required: number; name: string };
    majorElective: { completed: number; required: number; name: string };
    total: { completed: number; required: number };
  };
};

export type GeneralEducation = {
  required: {
    completed: number;
    required: number;
    name: string;
    bySemester: Record<string, {
      completed: number;
      required: number;
      subjects: Array<{
        name: string;
        completed: number;
        required: number;
        status: string;
      }>;
    }>;
  };
  core: {
    completed: number;
    required: number;
    name: string;
    areas: Array<{
      name: string;
      completed: number;
      required: number;
      isGroup?: boolean;
    }>;
  };
  general: {
    name: string;
    completed: number;
    required: number;
  };
};

export type Course = {
  id: string;
  title: string;
  dept: string;
  credits: number;
  status: string;
  type: string;
  reason?: string; // 추천 이유 (recommendedCourses용)
};

export type TeachingCourses = {
  general: {
    name: string;
    completed: number;
    required: number;
  };
  major: {
    name: string;
    categories: {
      basic: {
        name: string;
        required: number;
        fields: number;
        courses: Array<{
          title: string;
          credits: number;
          status: string;
          fieldId: string;
        }>;
      };
      subjectEducation: {
        name: string;
        required: number;
        fields: number;
        courses: Array<{
          title: string;
          credits: number;
          status: string;
          fieldId: string;
        }>;
      };
    };
  };
  profession: {
    name: string;
    categories: {
      theory: {
        name: string;
        required: number;
        fields: number;
        courses: Array<{
          title: string;
          credits: number;
          status: string;
          fieldId: string;
        }>;
      };
      aptitude: {
        name: string;
        required: number;
        fields: number;
        courses: Array<{
          title: string;
          credits: number;
          status: string;
          fieldId: string;
        }>;
      };
      practice: {
        name: string;
        required: number;
        fields: number;
        courses: Array<{
          title: string;
          credits: number;
          status: string;
          fieldId: string;
        }>;
      };
    };
  };
};

// 🔥 Firestore 사용자 문서 타입
export type UserDocument = {
  profile: UserInfo & {
    email?: string;
    createdAt: Date;
    lastLoginAt: Date;
  };
  dashboard: {
    userInfo: UserInfo;
    majors: Major[];
    generalEducation: GeneralEducation;
    learningJourney: LearningJourney[];
    recommendedCourses: Course[];
    basicCourses: Course[];
    teachingCourses: TeachingCourses;
  };
  enrollment: {
    cart: CartItem[];
    applications: Application[];
    favorites: string[];
    timetableCourses: string[]; // 시간표에 추가된 과목들 (courseId-classId 형태)
    credits: {
      basicCredits: number; // 잔여 기본 수업 학점
      maxCredits: number; // 최대 학점
      totalBettingPoints: number; // 총 베팅 포인트
    };
  };
  settings: {
    theme?: string;
    notifications?: boolean;
  };
};

