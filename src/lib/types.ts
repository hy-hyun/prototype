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
  capacity: number;
  area?: string;
  limit?: string;
  keywords?: string[];
  method?: "FCFS" | "BID";
  courseType?: string;
  courseLevel?: string; // 100, 200, 300 등 레벨 단위 문자열
};

export type Notice = { id: string; title: string; content: string; pinned?: boolean; createdAt: string; author?: string; views?: number };

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

export type LearningJourney = {
	semester: string;
	credits: number;
	cumulative: number;
	milestone: string | null;
	isFuture: boolean;
};


