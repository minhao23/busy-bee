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
  const getID = async () => {
    const telegramUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
    if (!telegramUser) throw new Error("Telegram user not found");
    return telegramUser.id.toString();
  };
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [selectedImportance, setSelectedImportance] = useState<1 | 2 | 3 | 4>(
    1
  );

  const fetchCompletedTasks = async () => {
    const user = await getID();

    // Fetch tasks from Supabase
    const { data: Todo, error } = await supabase
      .from("Todo")
      .select("*")
      .eq("user_uuid", user)
      .not("finished_at", "is", null) // Fetch only completed tasks
      .order("created_at", { ascending: false });

    if (Todo) setCompletedTasks(Todo);
    if (error) console.error("Error fetching tasks:", error);
  };

  // Fetch tasks from Supabase
  const fetchTasks = async () => {
    // const session = supabase.auth.getSession();
    // console.log("Session:", session);
    // const user = supabase.auth.getUser();
    // console.log("User:", user);
    // console.log(
    //   "auth.id:",
    //   supabase.auth.getUser().then((u) => u.data?.user?.id)
    // );
    const user = await getID();
    let { data: Todo, error } = await supabase
      .from("Todo")
      .select("*")

      // Filters
      .eq("user_uuid", user)
      .is("finished_at", null)
      .order("created_at", { ascending: false });

    if (Todo) setTasks(Todo);
    if (error) console.error("Error fetching tasks:", error);
  };

  // Add new task
  const addTask = async () => {
    if (!newTaskName.trim()) return;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("User not found", userError);
      return;
    }

    const { data, error } = await supabase
      .from("Todo")
      .insert([
        {
          task_name: newTaskName.trim(),
          importance: selectedImportance,
          finished_at: null,
          user_uuid: user.id, // ✅ now this is a string, not a Promise
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
      await new Promise((resolve) => setTimeout(resolve, 300)); //delay for animation
      fetchTasks(); // Refresh tasks
      fetchCompletedTasks(); // Refresh completed tasks
    }
  };

  // Delete task
  const deleteTask = async (taskId: number) => {
    console.log("Deleting task with ID:", taskId);
    const { error } = await supabase.from("Todo").delete().eq("id", taskId);

    if (!error) {
      setTasks(tasks.filter((t) => t.id !== taskId));
      setCompletedTasks(completedTasks.filter((t) => t.id !== taskId));
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchCompletedTasks();
  }, []);

  // Quadrant definitions
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
          {completedTasks.map((completedTask) => (
            <div
              key={completedTask.id}
              className={`task ${completedTask.finished_at ? "completed" : ""}`}
            >
              <input
                type="checkbox"
                checked={!!completedTask.finished_at}
                onChange={() => toggleTaskCompletion(completedTask.id)}
              />
              <span>{completedTask.task_name}</span>
              <button
                className="delete-btn"
                onClick={() => deleteTask(completedTask.id)}
              ></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TodoList;
