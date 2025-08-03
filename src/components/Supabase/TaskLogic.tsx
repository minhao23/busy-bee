import React, { createContext, useContext, useEffect, useState } from "react";
import { Task } from "../../types";
import supabase from "../../utils/supabase";

// Add topTasks and setTopTasks to the context type
type TaskContextType = {
  tasks: Task[];
  topTasks: Task[];
  completedTasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setTopTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  fetchTasks: () => void;
  fetchTopTasks: () => void;
};

const TaskContext = createContext<TaskContextType | null>(null);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [topTasks, setTopTasks] = useState<Task[]>([]);

  const fetchTasks = async () => {
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
      fetchTopTasks();
    }

    if (error) console.error("Error fetching tasks:", error);
  };

  const fetchTopTasks = async () => {
    const userTeleId = await getID();

    const { data: Todo, error } = await supabase
      .from("Todo")
      .select("*")
      .eq("user_tele_id", userTeleId)
      .is("finished_at", null)
      .order("importance", { ascending: true })
      .limit(5);

    if (Todo) setTopTasks(Todo);
    if (error) console.error("Error fetching top tasks:", error);
  };

  useEffect(() => {
    fetchTasks();
    fetchTopTasks();
  }, []);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        topTasks,
        completedTasks,
        setTasks,
        setTopTasks,
        fetchTasks,
        fetchTopTasks,
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
