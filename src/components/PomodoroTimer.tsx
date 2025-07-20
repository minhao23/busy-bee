import React, { useState, useEffect, useRef } from "react";
import { TimerState, TimerMode } from "../types";

const TIMER_DURATIONS = {
  work: 25 * 60, // 25 minutes
  shortBreak: 5 * 60, // 5 minutes
  longBreak: 15 * 60, // 15 minutes
} as const;

const PomodoroTimer: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS.work);
  const [isActive, setIsActive] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const alarmRef = useRef<HTMLAudioElement | null>(null);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft]);

  useEffect(() => {
    alarmRef.current = new Audio("../assets/audio_files/mixkit-morning-clock-alarm-1003.wav")
  }, []);

  const handleTimerComplete = () => {
    setIsActive(false);

    // Play alarm
    if (alarmRef.current) {
      alarmRef.current.currentTime = 0;
      alarmRef.current.play().catch((e) => console.error("Alarm play failed: ", e));
    }

    if (mode === "work") {
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);

      // Every 4th session, take a long break
      const nextMode =
        newCompletedSessions % 4 === 0 ? "longBreak" : "shortBreak";
      setMode(nextMode);
      setTimeLeft(TIMER_DURATIONS[nextMode]);
    } else {
      setMode("work");
      setTimeLeft(TIMER_DURATIONS.work);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(TIMER_DURATIONS[mode]);
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(TIMER_DURATIONS[newMode]);
    setIsActive(false);
  };

  const formatTime = (time: number) => {
    return time.toString().padStart(2, "0");
  };

  const getProgressPercentage = () => {
    const totalTime = TIMER_DURATIONS[mode];
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  return (
    <div className="pomodoro-timer">
      <div className="timer-header">
        <div className="session-counter">
          Sessions Completed: {completedSessions}
        </div>
      </div>

      <div className="mode-selector">
        <button
          className={`mode-button ${mode === "work" ? "active" : ""}`}
          onClick={() => switchMode("work")}
        >
          Work
        </button>
        <button
          className={`mode-button ${mode === "shortBreak" ? "active" : ""}`}
          onClick={() => switchMode("shortBreak")}
        >
          Short Break
        </button>
        <button
          className={`mode-button ${mode === "longBreak" ? "active" : ""}`}
          onClick={() => switchMode("longBreak")}
        >
          Long Break
        </button>
      </div>

      <div className="timer-display">
        <div className="timer-circle">
          <svg
            className="progress-ring"
            viewBox="0 0 200 200"
            style={{ width: "40vmin", height: "40vmin" }}
          >
            <circle
              className="progress-ring-background"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="transparent"
              r="92"
              cx="100"
              cy="100"
            />
            <circle
              className="progress-ring-fill"
              stroke={mode === "work" ? "#dc2626" : "#16a34a"}
              strokeWidth="8"
              fill="transparent"
              r="92"
              cx="100"
              cy="100"
              strokeDasharray={`${2 * Math.PI * 96}`}
              strokeDashoffset={`${
                2 * Math.PI * 96 * (1 - getProgressPercentage() / 100)
              }`}
              transform="rotate(-90 100 100)"
            />
          </svg>
          <div className="timer-text">
            <span className="timer-time">
              {formatTime(minutes)}:{formatTime(seconds)}
            </span>
            <span className="timer-mode">
              {mode === "work"
                ? "Work"
                : mode === "shortBreak"
                ? "Short Break"
                : "Long Break"}
            </span>
          </div>
        </div>
      </div>

      <div className="timer-controls">
        <button
          className={`control-button primary ${isActive ? "pause" : "start"}`}
          onClick={toggleTimer}
        >
          {isActive ? "Pause" : "Start"}
        </button>
        <button className="control-button secondary" onClick={resetTimer}>
          Reset
        </button>
      </div>
    </div>
  );
};

export default PomodoroTimer;
