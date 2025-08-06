import { useState, useEffect } from "react";
import TodoList from "./components/TodoList";
import "./App.css";
import { initializeTelegramUser } from "./components/Supabase/auth";
import Dashboard from "./components/Dashboard";
import { TaskProvider } from "./components/Supabase/TaskLogic";

declare global {
  interface Window {
    Telegram: any;
  }
} // this is purely to deal with typescript typechecking,
// an issue that would not be present in JS

// Mock setup that matches both window.Telegram.WebApp and @twa-dev/sdk WebApp
if (import.meta.env.DEV) {
  if (!(window as any)["Telegram"]?.WebApp) {
    const mockWebApp = {
      initDataUnsafe: {
        user: {
          id: 123456789,
          first_name: "Test",
          username: "test_user",
        },
      },
      ready: () => console.log("Telegram.WebApp.ready() called"),
      expand: () => console.log("Telegram.WebApp.expand() called"),
      close: () => console.log("Telegram.WebApp.close() called"),
    };
    if (!(window as any)["WebApp"]) {
      (window as any)["WebApp"] = mockWebApp;
    }
  }
}

function App() {
  const [activeTab, setActiveTab] = useState<"timer" | "todos">("timer");
  const [isTelegramReady, setIsTelegramReady] = useState(false);

  useEffect(() => {
    const initTelegram = async () => {
      try {
        console.log("Initializing Telegram WebApp...");

        const Telegram = window.Telegram;

        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
        setIsTelegramReady(true);
        // Else, we will initialise the user, and set the session (done in the initializeTelegramUser function)
        const user = await initializeTelegramUser();
        console.log("Telegram user initialized:", user);
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };

    initTelegram();
  }, []);
  return (
    <div className="app">
      <header className="app-header">
        <h2>Hi, welcome to Ikizen</h2>
      </header>
      <TaskProvider>
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
          <div style={{ display: activeTab === "timer" ? "block" : "none" }}>
            <Dashboard />
          </div>
          <div style={{ display: activeTab === "todos" ? "block" : "none" }}>
            <TodoList />
          </div>
        </main>
      </TaskProvider>
    </div>
  );
}

export default App;
