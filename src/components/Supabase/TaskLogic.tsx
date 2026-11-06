import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { Task } from "../../types";
import supabase from "../../utils/supabase";

type TaskContextType = {
  tasks: Task[];
  topTasks: Task[];
  completedTasks: Task[];
  isLoading: boolean;
  loadError: string;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  fetchTasks: () => Promise<void>;
};

const TaskContext = createContext<TaskContextType | null>(null);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const topTasks = useMemo(
    () => [...tasks].sort((a, b) => a.importance - b.importance).slice(0, 5),
    [tasks]
  );
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
        fetchTasks,
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

export const getID = async (): Promise<number> => {
  const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  return telegramUser?.id || 101010101;
};
