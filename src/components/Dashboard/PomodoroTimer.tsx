import React, { useState, useEffect, useRef } from "react";
import { TimerMode } from "../../types";
import audioManager from "../../utils/audioManager";
import "../Dashboard.css";

const TIMER_DURATIONS = {
  work: 25 * 60, // 25 minutes
  shortBreak: 5 * 60, // 5 minutes
  longBreak: 15 * 60, // 15 minutes
  custom: 0 // will never use this, only for type consistency
} as const;

const ALARM_DURATION = 4;

const PomodoroTimer: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS.work);
  const [isActive, setIsActive] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [customTime, setCustomTime] = useState(10);
  const intervalRef = useRef<number | null>(null);
  const alarmTimerRef = useRef<number | null>(null);

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
    return () => {
      if (alarmTimerRef.current) {
        clearTimeout(alarmTimerRef.current);
      }
    };
  }, []);

  const getTime = (mode: TimerMode) => {
    if (mode === "custom") {
      return customTime * 60;
    } else {
      return TIMER_DURATIONS[mode];
    }
  }

  const handleTimerComplete = () => {
    setIsActive(false);

    // Play alarm
    const loop = true;
    audioManager.play("alarm", loop);

    // Play alarm until timer is up
    alarmTimerRef.current = window.setTimeout(() => {
      handleAlarmDismiss();
    }, ALARM_DURATION * 1000);
  };

  const handleAlarmDismiss = () => {
    stopAlarm();

    if (mode === "work") {
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);

      // Every 4th session, take a long break
      const nextMode =
        newCompletedSessions % 4 === 0 ? "longBreak" : "shortBreak";
      setMode(nextMode);
      setTimeLeft(getTime(nextMode));
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
    setTimeLeft(getTime(mode));
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(getTime(newMode));
    setIsActive(false);
  };

  const formatTime = (time: number) => {
    return time.toString().padStart(2, "0");
  };

  const getProgressPercentage = () => {
    const totalTime = getTime(mode);
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const stopAlarm = () => {
    audioManager.stop("alarm");

    if (alarmTimerRef.current) {
      clearTimeout(alarmTimerRef.current); // prevent double-trigger
      alarmTimerRef.current = null;
    }
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
          disabled={isActive || timeLeft === 0}
        >
          Work
        </button>
        <button
          className={`mode-button ${mode === "shortBreak" ? "active" : ""}`}
          onClick={() => switchMode("shortBreak")}
          disabled={isActive || timeLeft === 0}
        >
          Short Break
        </button>
        <button
          className={`mode-button ${mode === "longBreak" ? "active" : ""}`}
          onClick={() => switchMode("longBreak")}
          disabled={isActive || timeLeft === 0}
        >
          Long Break
        </button>
        <button
          className={`mode-button ${mode == "custom" ? "active" : ""}`}
          onClick={() => switchMode("custom")}
          disabled={isActive || timeLeft == 0}
        >
          Custom
        </button>
      </div>

      {mode === "custom" && !isActive && (
        <div className="custom-setting">
          <label>
              Minutes:{" "}
              <input 
                type="number"
                min={1}
                max={180}
                value={customTime}
                onChange={(e) => {
                  const newTime = parseInt(e.target.value) || 1
                  setCustomTime(newTime);
                  setTimeLeft(newTime * 60);
                }}
              />
          </label>
        </div>
      )}

      <div className="timer-display">
        <div className="custom-setting-placeholder"></div>
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
                : mode === "longBreak"
                ? "Long Break"
                : "Custom"}
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
        {timeLeft > 0 ? (
          <button className="control-button secondary" onClick={resetTimer}>
            Reset
          </button>
        ) : (
          <button
            className="control-button secondary"
            onClick={handleAlarmDismiss}
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};

export default PomodoroTimer;
