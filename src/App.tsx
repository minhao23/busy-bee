import { useState, useEffect } from "react";
import TodoList from "./components/TodoList";
import "./App.css";
import { initializeTelegramUser } from "./components/Supabase/auth";
import Dashboard from "./components/Dashboard";
import { TaskProvider } from "./components/Supabase/TaskLogic";
import audioManager from "./utils/audioManager";
import Icon from "./components/Icon";
import "./Desktop.css";

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
    (window as any)["Telegram"] = { WebApp: mockWebApp };
    (window as any)["WebApp"] = mockWebApp;
  }
}

function App() {
  const [activeTab, setActiveTab] = useState<"timer" | "todos">("timer");

  useEffect(() => {
    const initTelegram = async () => {
      try {
        console.log("Initializing Telegram WebApp...");

        const telegramWebApp = window.Telegram?.WebApp;

        if (!telegramWebApp) {
          throw new Error("Telegram WebApp unavailable");
        }

        telegramWebApp.ready();
        telegramWebApp.expand();
        telegramWebApp.setHeaderColor?.("#1b3c53");
        telegramWebApp.setBackgroundColor?.("#1b3c53");
        audioManager.init();
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
      <div className="app-shell">
        <header className="app-header">
          <h1 className="app-title">Busy Bee</h1>
          <span className="app-date">{new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
        </header>
        <TaskProvider>
          <nav className="tab-navigation" aria-label="Main navigation">
            <button
              className={`tab-button ${activeTab === "timer" ? "active" : ""}`}
              onClick={() => setActiveTab("timer")}
              aria-current={activeTab === "timer" ? "page" : undefined}
              aria-controls="focus-panel"
            >
              <Icon name="timer" />
              Focus
            </button>
            <button
              className={`tab-button ${activeTab === "todos" ? "active" : ""}`}
              onClick={() => setActiveTab("todos")}
              aria-current={activeTab === "todos" ? "page" : undefined}
              aria-controls="tasks-panel"
            >
              <Icon name="board" />
              Tasks
            </button>
          </nav>

          <main className="app-main">
            <section className="app-panel">
              <div id="focus-panel" hidden={activeTab !== "timer"}>
                <Dashboard />
              </div>
              <div id="tasks-panel" hidden={activeTab !== "todos"}>
                <TodoList />
              </div>
            </section>
          </main>
        </TaskProvider>
      </div>
    </div>
  );
}

export default App;
