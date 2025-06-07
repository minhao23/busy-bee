import React, { useState, useEffect } from "react";
import supabase from "../utils/supabase";
import "./TodoList.css";

type Task = {
  id: number;
  created_at: string;
  finished_at: string | null;
  importance: number; // 1-4 for Eisenhower quadrants
  task_name: string;
};

const TodoList: React.FC = () => {
  console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [selectedImportance, setSelectedImportance] = useState<1 | 2 | 3 | 4>(
    1
  );

  // Fetch tasks from Supabase
  const fetchTasks = async () => {
    console.log("supabase URL:", import.meta.env.VITE_SUPABASE_URL);
    console.log("supabase key:", import.meta.env.VITE_SUPABASE_ANON_KEY);
    const { data, error } = await supabase
      .from("Todo")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setTasks(data);
    if (error) console.error("Error fetching tasks:", error);
  };

  // Add new task
  const addTask = async () => {
    if (!newTaskName.trim()) return;

    const { data, error } = await supabase
      .from("Todo")
      .insert([
        {
          task_name: newTaskName.trim(),
          importance: selectedImportance,
          finished_at: null,
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

  // Toggle task completion
  const toggleTaskCompletion = async (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newFinishedAt = task.finished_at ? null : new Date().toISOString();

    const { data, error } = await supabase
      .from("todos")
      .update({ finished_at: newFinishedAt })
      .eq("id", taskId)
      .select();

    if (data) {
      setTasks(tasks.map((t) => (t.id === taskId ? data[0] : t)));
    }
  };

  // Delete task
  const deleteTask = async (taskId: number) => {
    const { error } = await supabase.from("todos").delete().eq("id", taskId);

    if (!error) {
      setTasks(tasks.filter((t) => t.id !== taskId));
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Quadrant definitions
  const quadrants = [
    { id: 1, title: "Urgent & Important", color: "red" },
    { id: 2, title: "Not Urgent & Important", color: "blue" },
    { id: 3, title: "Urgent & Not Important", color: "orange" },
    { id: 4, title: "Not Urgent & Not Important", color: "green" },
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
                    <span>{task.task_name}</span>
                    <span className="task-date">
                      {new Date(task.created_at).toLocaleDateString()}
                    </span>
                    <button
                      className="delete-btn"
                      onClick={() => deleteTask(task.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoList;
