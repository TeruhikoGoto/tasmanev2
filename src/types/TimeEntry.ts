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

export interface TimeTrackingData {
  entries: TimeEntry[];
}