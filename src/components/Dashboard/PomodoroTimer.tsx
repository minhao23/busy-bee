import React, { useState, useEffect, useRef } from "react";
import { TimerMode } from "../../types";
import audioManager from "../../utils/audioManager";
import "../Dashboard.css";

const TIMER_DURATIONS = {
  work: 25 * 60, // 25 minutes
  shortBreak: 5 * 60, // 5 minutes
  longBreak: 15 * 60, // 15 minutes
  custom: 0, // will never use this, only for type consistency
} as const;

const ALARM_DURATION = 4;

const PomodoroTimer: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS.work);
  const [isActive, setIsActive] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(10);
  const [customSeconds, setCustomSeconds] = useState(0);
  const [zeroTimeErrorMssg, setZeroTimeErrorMssg] = useState("");
  const intervalRef = useRef<number | null>(null);
  const alarmTimerRef = useRef<number | null>(null);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
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
      return customMinutes * 60 + customSeconds;
    } else {
      return TIMER_DURATIONS[mode];
    }
  };

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
    if (isCustomModeZeroTime()) {
      setZeroTimeErrorMssg("Please input a valid time period for the timer");
    } else {
      setZeroTimeErrorMssg("");
      setIsActive(!isActive);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(getTime(mode));
  };

  const switchMode = (newMode: TimerMode) => {
    setZeroTimeErrorMssg("");
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

  const isCustomModeZeroTime = () => {
    return mode === "custom" && customMinutes === 0 && customSeconds === 0;
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
          disabled={!isCustomModeZeroTime() && (isActive || timeLeft === 0)}
        >
          Work
        </button>
        <button
          className={`mode-button ${mode === "shortBreak" ? "active" : ""}`}
          onClick={() => switchMode("shortBreak")}
          disabled={!isCustomModeZeroTime() && (isActive || timeLeft === 0)}
        >
          Short Break
        </button>
        <button
          className={`mode-button ${mode === "longBreak" ? "active" : ""}`}
          onClick={() => switchMode("longBreak")}
          disabled={!isCustomModeZeroTime() && (isActive || timeLeft === 0)}
        >
          Long Break
        </button>
      </div>

      {mode === "custom" && !isActive && (
        <div className="custom-setting">
          <div className="time-input">
            <label>Minutes</label>
            <select
              value={customMinutes}
              onChange={(e) => {
                const minutes = parseInt(e.target.value);
                setCustomMinutes(minutes);
                setTimeLeft(minutes * 60 + customSeconds);
              }}
            >
              {Array.from({ length: 60 }, (_, i) => (
                <option key={i} value={i}>
                  {i < 10 ? `0${i}` : i}
                </option>
              ))}
            </select>
          </div>
          <div className="time-input">
            <label>Seconds</label>
            <select
              value={customSeconds}
              onChange={(e) => {
                const seconds = parseInt(e.target.value);
                setCustomSeconds(seconds);
                setTimeLeft(customMinutes * 60 + seconds);
              }}
            >
              {Array.from({ length: 60 }, (_, i) => (
                <option key={i} value={i}>
                  {i < 10 ? `0${i}` : i}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="timer-display">
        <button
          className="custom-button"
          onClick={() => switchMode("custom")}
          disabled={!isCustomModeZeroTime() && (isActive || timeLeft === 0)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3"></circle>
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 
      1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 
      1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06
      a1.65 1.65 0 0 0 .33-1.82 
      1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09
      c.7 0 1.31-.4 1.51-1 
      a1.65 1.65 0 0 0-.33-1.82l-.06-.06
      a2 2 0 1 1 2.83-2.83l.06.06
      c.51.51 1.2.68 1.82.33 
      .45-.26.74-.75.74-1.28V3
      a2 2 0 1 1 4 0v.09
      c0 .53.29 1.02.74 1.28
      .62.35 1.31.18 1.82-.33l.06-.06
      a2 2 0 1 1 2.83 2.83l-.06.06
      c-.36.36-.49.91-.33 1.82
      .2.61.79 1.01 1.51 1.01H21
      a2 2 0 1 1 0 4h-.09
      c-.72 0-1.31.4-1.51 1z"
            ></path>
          </svg>
        </button>
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
        {timeLeft > 0 || isCustomModeZeroTime() ? (
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
      {zeroTimeErrorMssg && (
        <div className="error-message">{zeroTimeErrorMssg}</div>
      )}
    </div>
  );
};

export default PomodoroTimer;
