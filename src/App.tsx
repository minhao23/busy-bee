import React, { useState, useEffect } from "react";
import PomodoroTimer from "./components/PomodoroTimer";
import WebApp from "@twa-dev/sdk";
import TodoList from "./components/TodoList";
import "./App.css";
import { initializeTelegramUser } from "./auth";

function App() {
  useEffect(() => {
    const initUser = async () => {
      try {
        const user = await initializeTelegramUser();
        console.log("Telegram user initialized:", user);
      } catch (error) {
        console.error("Failed to initialize user:", error);
      }
    };

    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      initUser();
    }
  }, []);

  const [activeTab, setActiveTab] = useState<"timer" | "todos">("timer");
  useEffect(() => {
    WebApp.ready();
    //WebApp.expand();
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Lets get to work!</h1>
        <p className="app-subtitle">use zen quotes api</p>
      </header>

      <nav className="tab-navigation">
        <button
          className={`tab-button ${activeTab === "timer" ? "active" : ""}`}
          onClick={() => setActiveTab("timer")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
            />
            <polyline
              points="12,6 12,12 16,14"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          Timer
        </button>
        <button
          className={`tab-button ${activeTab === "todos" ? "active" : ""}`}
          onClick={() => setActiveTab("todos")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 11L12 14L22 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Todos
        </button>
      </nav>

      <main className="app-main">
        {activeTab === "timer" ? <PomodoroTimer /> : <TodoList />}
        <button className="close-button" onClick={() => WebApp.close()}>
          Close
        </button>
      </main>
    </div>
  );
}

export default App;
