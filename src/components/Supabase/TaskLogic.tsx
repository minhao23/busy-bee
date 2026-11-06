import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Task } from "../../types";
import supabase from "../../utils/supabase";

// Add topTasks and setTopTasks to the context type
type TaskContextType = {
  tasks: Task[];
  topTasks: Task[];
  completedTasks: Task[];
  isLoading: boolean;
  loadError: string;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setTopTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  fetchTasks: () => Promise<void>;
  fetchTopTasks: () => Promise<void>;
};

const TaskContext = createContext<TaskContextType | null>(null);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [topTasks, setTopTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const fetchTasks = useCallback(async () => {
    const userTeleId = await getID();
    const { data: Todo, error } = await supabase
      .from("Todo")
      .select("*")
      .eq("user_tele_id", userTeleId)
      .order("created_at", { ascending: false });

    if (Todo) {
      const active = Todo.filter((t) => !t.finished_at);
      const completed = Todo.filter((t) => !!t.finished_at);
      setTasks(active);
      setCompletedTasks(completed);
    }

    setLoadError(error ? "Tasks couldn't load. Please retry." : "");
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setTopTasks([...tasks].sort((a, b) => a.importance - b.importance).slice(0, 5));
  }, [tasks]);

  useEffect(() => {
    fetchTasks();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      // Schedule outside the auth callback to avoid waiting on the auth lock.
      window.setTimeout(() => fetchTasks(), 0);
    });
    return () => subscription.unsubscribe();
  }, [fetchTasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        topTasks,
        completedTasks,
        isLoading,
        loadError,
        setTasks,
        setTopTasks,
        fetchTasks,
        fetchTopTasks: fetchTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTasks must be used within a TaskProvider");
  return context;
};

export const getID = async (): Promise<string> => {
  var telegramUser = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user;
  if (!telegramUser || !telegramUser.id) {
    telegramUser = { id: 101010101 }; // dev only
  }
  console.log("Telegram user ID:", telegramUser.id);
  return telegramUser.id;
};
