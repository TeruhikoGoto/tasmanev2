export interface WorkTask {
  content: string;
  time: number;
}

export interface TimeEntry {
  id: string;
  startTime: string;
  endTime: string;
  tasks: WorkTask[];
}

export interface TimeTrackingSession {
  id?: string;
  sessionDate: string; // YYYY-MM-DD format
  entries: TimeEntry[];
  totalHours: number;
  userId: string;
  memo?: string; // セッション用メモ
  createdAt?: any; // Firestore Timestamp
  updatedAt?: any; // Firestore Timestamp
}

export interface SessionsByDate {
  [year: string]: {
    [month: string]: TimeTrackingSession[];
  };
}