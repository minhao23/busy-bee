export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export interface TimerState {
  minutes: number;
  seconds: number;
  isActive: boolean;
  isBreak: boolean;
  completedSessions: number;
}

export type TimerMode = "work" | "shortBreak" | "longBreak";
