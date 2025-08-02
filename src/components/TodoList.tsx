import React, { useState, useEffect } from "react";
import supabase from "../utils/supabase";
import "./TodoList.css";
import { Task } from "../types";
import { v5 as uuidv5 } from "uuid";
import { getID, useTasks } from "./Supabase/TaskLogic";

const TodoList: React.FC = () => {
  const [newTaskName, setNewTaskName] = useState("");
  const { setTasks, tasks, fetchTasks, completedTasks } = useTasks();
  const [selectedImportance, setSelectedImportance] = useState<1 | 2 | 3 | 4>(
    1
  );

  const addTask = async () => {
    if (!newTaskName.trim()) return;

    const userTeleId = await getID();

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
      fetchTasks();
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

    const { data, error } = await supabase
      .from("Todo")
      .update({ finished_at: newFinishedAt })
      .eq("id", taskId)
      .select();

    if (data) {
      setTasks(tasks.map((t) => (t.id === taskId ? data[0] : t)));
      await new Promise((resolve) => setTimeout(resolve, 300));
      fetchTasks();
    }
  };

  const deleteTask = async (taskId: number) => {
    const { error } = await supabase.from("Todo").delete().eq("id", taskId);

    if (!error) {
      fetchTasks();
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
  }, []);

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
