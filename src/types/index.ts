export type Task = {
  id: number;
  created_at: string;
  finished_at: string | null;
  importance: number;
  task_name: string;
};

export type TimerMode = "work" | "shortBreak" | "longBreak" | "custom";
