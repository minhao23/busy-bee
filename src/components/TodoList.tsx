import React, { useState, useEffect, useRef } from "react";
import supabase from "../utils/supabase";
import "./TodoList.css";
import { v5 as uuidv5 } from "uuid";

type Task = {
  id: number;
  created_at: string;
  finished_at: string | null;
  importance: number;
  task_name: string;
};

const TodoList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [selectedImportance, setSelectedImportance] = useState<1 | 2 | 3 | 4>(
    1
  );

  // Sound effects
  const soundRefs = useRef<{
    add: HTMLAudioElement | null;
    complete: HTMLAudioElement | null;
    remove: HTMLAudioElement | null;
    cancel: HTMLAudioElement | null;
    emptyAdd: HTMLAudioElement | null;
  }>({
    add: null,
    complete: null, 
    remove: null,
    cancel: null,
    emptyAdd: null,
  })

  const getID = async (): Promise<string> => {
    var telegramUser = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user;
    if (!telegramUser || !telegramUser.id) {
      // console.error("Telegram user not available");
      // throw new Error("Telegram user not available");

      telegramUser = {
        id: 101010101,
      }; // this is purely for dev, do not use in production
    }
    console.log("Telegram user ID:", telegramUser.id);
    console.log("data type of telegramUser.id:", typeof telegramUser.id);

    return telegramUser.id; // use directly as a string
  };

  // ✅ Fetches uncompleted tasks for the current user
  const fetchTasks = async () => {
    const userTeleId = await getID();

    const { data: Todo, error } = await supabase
      .from("Todo")
      .select("*")
      .eq("user_tele_id", userTeleId)
      .is("finished_at", null)
      .order("created_at", { ascending: false });

    if (Todo) setTasks(Todo);
    if (error) console.error("Error fetching tasks:", error);
  };

  // ✅ Fetches completed tasks for the current user
  const fetchCompletedTasks = async () => {
    const userTeleId = await getID();

    const { data: Todo, error } = await supabase
      .from("Todo")
      .select("*")
      .eq("user_tele_id", userTeleId)
      .not("finished_at", "is", null)
      .order("created_at", { ascending: false });

    if (Todo) setCompletedTasks(Todo);
    if (error) console.error("Error fetching completed tasks:", error);
  };

  const addTask = async () => {
    if (!newTaskName.trim()) {
      if (soundRefs.current && soundRefs.current.emptyAdd) {
        soundRefs.current.emptyAdd.currentTime = 0
        soundRefs.current.emptyAdd.play().catch((e) => console.error("failed to play wrong add sound", e))
      }
      return;
    }

    const userTeleId = await getID();

    if (soundRefs.current && soundRefs.current.add) {
      soundRefs.current.add.currentTime = 0
      soundRefs.current.add.play().catch((e) => console.error("failed to play add sound", e))
    }

    const { data, error } = await supabase
      .from("Todo")
      .insert([
        {
          task_name: newTaskName.trim(),
          importance: selectedImportance,
          finished_at: null,
          user_tele_id: userTeleId,
        },
      ])
      .select();

    if (data) {
      setTasks([...data, ...tasks]);
      setNewTaskName("");
    }
    if (error) {
      console.error("Error adding task:", error);
    }
  };

  // ✅ Toggles task completion
  const toggleTaskCompletion = async (taskId: number) => {
    const task =
      tasks.find((t) => t.id === taskId) ||
      completedTasks.find((t) => t.id === taskId);
    if (!task) return;

    const newFinishedAt = task.finished_at ? null : new Date().toISOString();

    if (soundRefs.current && soundRefs.current.complete) {
      soundRefs.current.complete.currentTime = 0
      soundRefs.current.complete.play().catch((e) => console.error("failed to play complete sound", e))
    }

    const { data, error } = await supabase
      .from("Todo")
      .update({ finished_at: newFinishedAt })
      .eq("id", taskId)
      .select();
    
    if (data) {
      setTasks(tasks.map((t) => (t.id === taskId ? data[0] : t)));
      await new Promise((resolve) => setTimeout(resolve, 300));
      fetchTasks();
      fetchCompletedTasks();
    }
  };

  // ✅ Deletes a task
  const deleteTask = async (taskId: number) => {
    const { error } = await supabase.from("Todo").delete().eq("id", taskId);

    if (!error) {
      const completed = completedTasks.some((t) => t.id == taskId)
      if (completed && soundRefs.current && soundRefs.current.remove) {
        soundRefs.current.remove.currentTime = 0
        soundRefs.current.remove.play().catch((e) => console.error("failed to play removed sound", e))
      } else if (!completed && soundRefs.current && soundRefs.current.cancel) {
        soundRefs.current.cancel.currentTime = 0
        soundRefs.current.cancel.play().catch((e) => console.error("failed to play cancel sound", e))
      }

      setTasks(tasks.filter((t) => t.id !== taskId));
      setCompletedTasks(completedTasks.filter((t) => t.id !== taskId));
    }
  };

  useEffect(() => {
    window.Telegram.WebApp.ready();
    const initializeAuth = async () => {
      // Wait for Supabase to restore session (if tokens exist)
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // Fallback: Try to restore from localStorage
        const access_token = localStorage.getItem("sb-access-token");
        const refresh_token = localStorage.getItem("sb-refresh-token");

        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token });
        } else {
          console.error("No valid session found");
          return;
        }
      }
    };

    initializeAuth();
    fetchTasks();
    fetchCompletedTasks();
  }, []);

  // Init sound effect objects
  useEffect(() => {
    soundRefs.current.add = new Audio("audio_files/sharp-pop-328170.mp3")
    soundRefs.current.complete = new Audio("audio_files/game-level-complete-143022.mp3")
    soundRefs.current.remove = new Audio("audio_files/mag-remove-92075.mp3")
    soundRefs.current.cancel = new Audio("audio_files/cancel-116016.mp3")
    soundRefs.current.emptyAdd = new Audio("audio_files/wronganswer-37702.mp3")
  }, [])

  const quadrants = [
    { id: 1, title: "Urgent & Important", color: 1 },
    { id: 2, title: "Not Urgent & Important", color: 2 },
    { id: 3, title: "Urgent & Not Important", color: 3 },
    { id: 4, title: "Not Urgent & Not Important", color: 4 },
  ];

  return (
    <div className="todo-container">
      <div className="task-input-container">
        <input
          type="text"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          placeholder="Enter task..."
          onKeyPress={(e) => e.key === "Enter" && addTask()}
        />
        <div className="task-type-row">
          <select
            value={selectedImportance}
            onChange={(e) =>
              setSelectedImportance(parseInt(e.target.value) as 1 | 2 | 3 | 4)
            }
          >
            {quadrants.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title}
              </option>
            ))}
          </select>
          <button onClick={addTask}>Add Task</button>
        </div>
      </div>

      <div className="quadrants-grid">
        {quadrants.map((quadrant) => (
          <div
            key={quadrant.id}
            className={`quadrant quadrant-${quadrant.color}`}
          >
            <h3>{quadrant.title}</h3>
            <div className="tasks-list">
              {tasks
                .filter((task) => task.importance === quadrant.id)
                .map((task) => (
                  <div
                    key={task.id}
                    className={`task ${task.finished_at ? "completed" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={!!task.finished_at}
                      onChange={() => toggleTaskCompletion(task.id)}
                    />
                    <span className="task-name">{task.task_name}</span>
                    <span className="task-date">
                      {new Date(task.created_at).toLocaleDateString()}
                    </span>
                    <button
                      className="delete-btn"
                      onClick={() => deleteTask(task.id)}
                    ></button>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="completed">
        <h3>Completed Tasks</h3>
        <div className="tasks-list">
          {completedTasks.map((task) => (
            <div key={task.id} className="task completed">
              <input
                type="checkbox"
                checked={!!task.finished_at}
                onChange={() => toggleTaskCompletion(task.id)}
              />
              <span>{task.task_name}</span>
              <button
                className="delete-btn"
                onClick={() => deleteTask(task.id)}
              ></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TodoList;
