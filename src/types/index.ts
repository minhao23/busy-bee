
export interface TodoItem {
  id: number;
  created_at: string;
  finished_at: string | null;
  importance: number; // 1-4 for Eisenhower quadrants
  task_name: string;
}

export interface TimerState {
  minutes: number;
  seconds: number;
  isActive: boolean;
  isBreak: boolean;
  completedSessions: number;
}

export type Task = {
  id: number;
  created_at: string;
  finished_at: string | null;
  importance: number;
  task_name: string;
};

export type TimerMode = "work" | "shortBreak" | "longBreak" | "custom";
