import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { TimerMode } from "../../types";
import audioManager from "../../utils/audioManager";
import "../Focus.css";
import Icon from "../Icon";

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
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(10);
  const [customSeconds, setCustomSeconds] = useState(0);
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [zeroTimeErrorMssg, setZeroTimeErrorMssg] = useState("");
  const intervalRef = useRef<number | null>(null);
  const alarmTimerRef = useRef<number | null>(null);
  const deadlineRef = useRef<number | null>(null);
  const timerRef = useRef<HTMLDivElement | null>(null);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const cycleSessions = mode === "longBreak" && completedSessions > 0 && completedSessions % 4 === 0
    ? 4 : completedSessions % 4;

  useLayoutEffect(() => {
    const timer = timerRef.current;
    const navigation = document.querySelector<HTMLElement>(".tab-navigation");
    if (!timer || !navigation) return;

    const fitCircle = () => {
      if (timer.closest("[hidden]") || window.innerWidth >= 760
        || timer.closest('[data-telegram-desktop="true"]')) return;
      const display = timer.querySelector<HTMLElement>(".timer-display");
      const controls = timer.querySelector<HTMLElement>(".timer-controls");
      if (!display || !controls) return;
      const padding = getComputedStyle(display);
      const boundary = Math.min(window.innerHeight, navigation.getBoundingClientRect().top);
      // Reserve the actions and their spacing; short/zoomed views can still scroll.
      const available = boundary - (display.getBoundingClientRect().top + window.scrollY)
        - controls.getBoundingClientRect().height
        - (timer.querySelector<HTMLElement>(".custom-setting")?.getBoundingClientRect().height ?? 0)
        - (timer.querySelector(".custom-setting") ? 12 : 0)
        - parseFloat(padding.paddingTop) - parseFloat(padding.paddingBottom) - 16;
      timer.style.setProperty("--focus-circle-size", `${Math.max(160, Math.min(340, available))}px`);
    };
    const observer = new ResizeObserver(fitCircle);
    observer.observe(timer);
    observer.observe(navigation);
    window.addEventListener("resize", fitCircle);
    window.visualViewport?.addEventListener("resize", fitCircle);
    fitCircle();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fitCircle);
      window.visualViewport?.removeEventListener("resize", fitCircle);
    };
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        // Reconcile with elapsed time when a mobile WebView resumes from the background.
        if (deadlineRef.current) setTimeLeft(Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000)));
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
      audioManager.stop("alarm");
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
    setIsAlarmRinging(true);
    deadlineRef.current = null;

    // Play alarm
    const loop = true;
    audioManager.play("alarm", loop);

    // Play alarm until timer is up
    alarmTimerRef.current = window.setTimeout(() => {
      handleAlarmDismiss();
    }, ALARM_DURATION * 1000);
  };

  const handleAlarmDismiss = () => {
    if (!alarmTimerRef.current) return;
    stopAlarm();
    setIsAlarmRinging(false);

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
    if (isAlarmRinging) return;
    if (isCustomModeZeroTime()) {
      setZeroTimeErrorMssg("Please input a valid time period for the timer");
    } else {
      setZeroTimeErrorMssg("");
      setIsEditingDuration(false);
      deadlineRef.current = isActive ? null : Date.now() + timeLeft * 1000;
      setIsActive(!isActive);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    deadlineRef.current = null;
    stopAlarm();
    setIsAlarmRinging(false);
    setTimeLeft(getTime(mode));
  };

  const switchMode = (newMode: TimerMode) => {
    setZeroTimeErrorMssg("");
    setIsEditingDuration(false);
    deadlineRef.current = null;
    setMode(newMode);
    setTimeLeft(getTime(newMode));
    setIsActive(false);
  };

  const toggleDurationEditor = () => {
    if (!isEditingDuration) {
      const duration = getTime(mode);
      setCustomMinutes(Math.floor(duration / 60));
      setCustomSeconds(duration % 60);
    }
    setIsEditingDuration(!isEditingDuration);
    setZeroTimeErrorMssg("");
  };

  const formatTime = (time: number) => {
    return time.toString().padStart(2, "0");
  };

  const getProgressPercentage = () => {
    const totalTime = getTime(mode);
    return totalTime > 0 ? Math.max(0, Math.min(100, ((totalTime - timeLeft) / totalTime) * 100)) : 0;
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
    <div ref={timerRef} data-mode={mode} className={`pomodoro-timer ${isActive ? "timer-running" : ""}`}>
      <h2 className="sr-only">Focus timer</h2>
      <div className="session-row">
        <div className="session-counter">
          {completedSessions} {completedSessions === 1 ? "session" : "sessions"} completed
        </div>
        <div className="session-cycle" role="group"
          aria-label={`${cycleSessions} of 4 work sessions before a long break`}>
          <div className="session-dots" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => <span key={i}
              className={i < cycleSessions ? "filled" : ""} />)}
          </div>
          <span className="session-cycle-label">to long break</span>
        </div>
      </div>

      <div className="mode-selector">
        <button
          className={`mode-button ${mode === "work" ? "active" : ""}`}
          onClick={() => switchMode("work")}
          aria-pressed={mode === "work"}
          disabled={isActive || isAlarmRinging}
        >
          Work
        </button>
        <button
          className={`mode-button ${mode === "shortBreak" ? "active" : ""}`}
          onClick={() => switchMode("shortBreak")}
          aria-pressed={mode === "shortBreak"}
          disabled={isActive || isAlarmRinging}
        >
          Short Break
        </button>
        <button
          className={`mode-button ${mode === "longBreak" ? "active" : ""}`}
          onClick={() => switchMode("longBreak")}
          aria-pressed={mode === "longBreak"}
          disabled={isActive || isAlarmRinging}
        >
          Long Break
        </button>
      </div>

      <div className="timer-display">
        <div className="timer-circle">
          <svg className="progress-ring" viewBox="0 0 200 200" aria-hidden="true">
            <circle className="progress-ring-background" strokeWidth="3" fill="transparent" r="92" cx="100" cy="100" />
            <circle className="progress-ring-fill" strokeWidth="4" fill="transparent" r="92" cx="100" cy="100"
              strokeDasharray={`${2 * Math.PI * 92}`}
              strokeDashoffset={`${2 * Math.PI * 92 * (1 - getProgressPercentage() / 100)}`}
              transform="rotate(-90 100 100)" />
          </svg>
          <div className="timer-text">
            <span className="timer-time" role="timer" aria-label={`${minutes} minutes ${seconds} seconds remaining`}>
              {formatTime(minutes)}:{formatTime(seconds)}
            </span>
            <span className="timer-mode">
              {mode === "work" ? "Work" : mode === "shortBreak" ? "Short Break" : mode === "longBreak" ? "Long Break" : "Custom"}
            </span>
          </div>
        </div>
        <button className="custom-button" aria-label="Custom timer"
          aria-expanded={isEditingDuration && !isActive} aria-controls="duration-settings"
          onClick={toggleDurationEditor} disabled={isActive || isAlarmRinging}>
          <Icon name="edit" />
          {isEditingDuration ? "Done" : "Edit"}
        </button>
      </div>

      {isEditingDuration && !isActive && (
        <div className="custom-setting" id="duration-settings">
          <div className="time-input">
            <label htmlFor="custom-minutes">Minutes</label>
            <select
              id="custom-minutes"
              disabled={isAlarmRinging}
              value={customMinutes}
              onChange={(e) => {
                const minutes = parseInt(e.target.value);
                setMode("custom");
                setZeroTimeErrorMssg("");
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
            <label htmlFor="custom-seconds">Seconds</label>
            <select
              id="custom-seconds"
              disabled={isAlarmRinging}
              value={customSeconds}
              onChange={(e) => {
                const seconds = parseInt(e.target.value);
                setMode("custom");
                setZeroTimeErrorMssg("");
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

      <div className="timer-controls">
        <button
          className={`control-button primary ${isActive ? "pause" : "start"}`}
          onClick={toggleTimer}
          disabled={isAlarmRinging}
        >
          <Icon name={isActive ? "pause" : "play"} />
          {isAlarmRinging ? "Finished" : isActive ? "Pause" : timeLeft < getTime(mode) ? "Resume" : "Start"}
        </button>
        {!isAlarmRinging ? (
          <button className="control-button secondary" onClick={resetTimer}>
            <Icon name="reset" /> Reset
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
        <div className="error-message" role="alert">{zeroTimeErrorMssg}</div>
      )}
    </div>
  );
};

export default PomodoroTimer;
