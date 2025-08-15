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
};

export type Notice = { id: string; title: string; content: string; pinned?: boolean; createdAt: string };

export type CartItem = { courseId: string; classId: string; method: "FCFS" | "BID"; bidAmount?: number };
export type Application = { courseId: string; classId: string; status: "PENDING" | "CONFIRMED" | "CANCELLED" };

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


