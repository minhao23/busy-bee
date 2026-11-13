import { TimerMode } from "../types";

export type ReminderSnapshot = {
  version: number;
  state: "idle" | "running" | "paused" | "completed";
  mode: TimerMode;
  durationSeconds: number;
  remainingSeconds: number;
};

type Action = "read" | "start" | "pause" | "resume" | "reset";

export function createTimerReminderClient() {
  const baseUrl = import.meta.env.VITE_BOT_API_URL;
  const initData = window.Telegram?.WebApp?.initData;
  // Keep standalone browser development working without a Telegram identity.
  if (!baseUrl || !initData) return null;
  const url = new URL(baseUrl);
  if (url.protocol !== "https:" && !(url.protocol === "http:"
    && ["localhost", "127.0.0.1"].includes(url.hostname))) {
    throw new Error("VITE_BOT_API_URL must use HTTPS.");
  }

  let snapshot: ReminderSnapshot | null = null;
  return {
    get snapshot() { return snapshot; },
    async send(action: Action, mode?: TimerMode, durationSeconds?: number) {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 10000);
      try {
        const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/timer`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Telegram-Init-Data": initData },
          body: JSON.stringify({
            action, version: snapshot?.version ?? 0,
            requestId: crypto.randomUUID(), mode, durationSeconds,
          }),
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(response.status === 401
            ? "Reopen the app in Telegram to sync reminders."
            : response.status === 409
              ? "The timer changed in another window. Please retry."
              : "Couldn't sync timer reminders. Please retry.");
        }
        const result = await response.json();
        if (!Number.isSafeInteger(result.version) || result.version < 0
          || !["idle", "running", "paused", "completed"].includes(result.state)
          || !["work", "shortBreak", "longBreak", "custom"].includes(result.mode)
          || !Number.isInteger(result.durationSeconds) || result.durationSeconds < 1
          || result.durationSeconds > 3599 || !Number.isInteger(result.remainingSeconds)
          || result.remainingSeconds < 0 || result.remainingSeconds > result.durationSeconds) {
          throw new Error("Invalid timer response. Please retry.");
        }
        snapshot = result as ReminderSnapshot;
        return snapshot;
      } finally {
        window.clearTimeout(timeout);
      }
    },
  };
}
