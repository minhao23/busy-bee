import React, { useState, useEffect, useRef } from "react";
import supabase from "../utils/supabase";
import "./TaskBoard.css";
import { getID, useTasks } from "./Supabase/TaskLogic";
import audioManager from "../utils/audioManager";
import TaskCard from "./TaskCard";
import { Importance, quadrants } from "../utils/taskPriorities";
import Icon from "./Icon";

const TodoList: React.FC = () => {
  const [newTaskName, setNewTaskName] = useState("");
  const { setTasks, tasks, fetchTasks, completedTasks, isLoading, loadError } = useTasks();
  const [selectedImportance, setSelectedImportance] = useState<Importance>(1);
  const [activeDropZone, setActiveDropZone] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [saveError, setSaveError] = useState("");
  const focusTask = useRef<number | null>(null);
  const completedSection = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (saving || focusTask.current === null) return;
    const taskId = focusTask.current;
    const frame = requestAnimationFrame(() => {
      document.querySelector<HTMLButtonElement>(`[data-task-id="${taskId}"] .task-move`)
        ?.focus({ preventScroll: true });
      focusTask.current = null;
    });
    return () => cancelAnimationFrame(frame);
  }, [saving, tasks, completedTasks]);

  const addTask = async () => {
    if (saving) return;
    if (!newTaskName.trim()) {
      audioManager.play("emptyAdd");
      setSaveError("Give your task a name first.");
      return;
    }

    setSaving(true);
    setSaveError("");
    const userTeleId = await getID();

    audioManager.play("add");

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
      await fetchTasks();
      setNewTaskName("");
      setFeedback("Task added.");
    }
    if (error) {
      console.error("Error adding task:", error);
      setSaveError("Task wasn't added. Your text is still here; please try again.");
    }
    setSaving(false);
  };

  const toggleTaskCompletion = async (taskId: number) => {
    const task =
      tasks.find((t) => t.id === taskId) ||
      completedTasks.find((t) => t.id === taskId);
    if (!task || saving) return;

    focusTask.current = taskId;
    if (!task.finished_at && completedSection.current) completedSection.current.open = true;
    const newFinishedAt = task.finished_at ? null : new Date().toISOString();
    setSaving(true);
    setSaveError("");
    const userTeleId = await getID();

    const { data, error } = await supabase
      .from("Todo")
      .update({ finished_at: newFinishedAt })
      .eq("id", taskId)
      .eq("user_tele_id", userTeleId)
      .select("*").single();

    if (error) {
      console.error("Error updating task completion:", error);
      setSaveError("Task wasn't updated. Please try again.");
      setSaving(false);
      return;
    }

    if (data) {
      await fetchTasks();
      if (!task.finished_at) audioManager.play("complete");
      setFeedback(task.finished_at ? "Task reopened." : "Task completed.");
    }
    setSaving(false);
  };

  const deleteTask = async (taskId: number) => {
    if (saving) return;
    setSaving(true);
    setSaveError("");
    const userTeleId = await getID();
    const { error } = await supabase.from("Todo").delete().eq("id", taskId)
      .eq("user_tele_id", userTeleId).select("*").single();

    if (!error) {
      await fetchTasks();
      setFeedback("Task deleted.");
    } else setSaveError("Task wasn't deleted. Please try again.");
    setSaving(false);
  };

  const updateTaskImportance = async (
    taskId: number,
    newImportance: Importance
  ) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || saving || task.importance === newImportance) {
      setActiveDropZone(null);
      return;
    }

    setSaving(true);
    setSaveError("");
    setFeedback("Saving priority...");
    focusTask.current = taskId;
    setTasks((currentTasks) =>
      currentTasks.map((item) =>
        item.id === taskId ? { ...item, importance: newImportance } : item
      )
    );

    const userTeleId = await getID();
    const { data, error } = await supabase
      .from("Todo")
      .update({ importance: newImportance })
      .eq("id", taskId)
      .eq("user_tele_id", userTeleId)
      .select("*").single();

    setActiveDropZone(null);

    if (error) {
      console.error("Error updating task importance:", error);
      setTasks((current) => current.map((item) => item.id === taskId ? task : item));
      setSaveError("Priority wasn't saved. The task is back in its original quadrant; try again.");
      setFeedback("");
      setSaving(false);
      return;
    }
    if (data) {
      setTasks((current) => current.map((item) => item.id === taskId ? data : item));
      setFeedback(`Moved to ${quadrants[newImportance - 1].title.toLowerCase()}. Saved.`);
      audioManager.play("add");
    }
    setSaving(false);
  };

  return (
    <div className="todo-container">
      <header className="todo-summary">
        <h2 className="todo-title">Tasks</h2>
        <p className="todo-summary-status">
          {tasks.length} open, {completedTasks.length} completed
        </p>
      </header>

      <form className="task-input-container" onSubmit={(event) => { event.preventDefault(); addTask(); }}>
        <label className="sr-only" htmlFor="new-task">Task name</label>
        <input
          id="new-task"
          type="text"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          placeholder="What needs doing?"
          maxLength={500}
          disabled={saving}
        />
        <div className="task-type-row">
          <select
            aria-label="Priority for new task"
            disabled={saving}
            value={selectedImportance}
            onChange={(e) =>
              setSelectedImportance(Number(e.target.value) as Importance)
            }
          >
            {quadrants.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title}: {q.description}
              </option>
            ))}
          </select>
          <button type="submit" disabled={saving}><Icon name="plus" /> Add task</button>
        </div>
      </form>
      <div className="board-feedback">
        {saveError || loadError ? (
          <p role="alert">{saveError || loadError} {loadError && <button onClick={fetchTasks}>Retry</button>}</p>
        ) : (
          <p role="status">{saving ? "Saving..." : isLoading ? "Loading tasks..." : tasks.length === 0 ? "No tasks yet" : "Drag the handle to move a task, or tap it for options."}</p>
        )}
        <span className="sr-only" role="status">{saving ? "" : feedback}</span>
      </div>

      <div className="quadrants-grid">
        {quadrants.map((quadrant) => {
          const quadrantTasks = tasks.filter((task) => task.importance === quadrant.id);
          return (
            <div
              key={quadrant.id}
              data-quadrant={quadrant.id}
              data-empty={quadrantTasks.length === 0}
              className={`quadrant quadrant-${quadrant.id} ${
                activeDropZone === quadrant.id ? "quadrant-drop-active" : ""
              }`}
            >
              <div className="quadrant-header">
                <div>
                  <h3>{quadrant.title}</h3>
                  <p>{quadrant.description}</p>
                </div>
                <span className="quadrant-count">
                  {quadrantTasks.length}
                </span>
              </div>
              <div className="tasks-list">
                {quadrantTasks.length === 0 && activeDropZone === quadrant.id && (
                  <div className="quadrant-empty-state">
                    Drop here
                  </div>
                )}
                {quadrantTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task} disabled={saving}
                    onComplete={() => toggleTaskCompletion(task.id)}
                    onDelete={() => deleteTask(task.id)}
                    onMove={(importance) => updateTaskImportance(task.id, importance)}
                    onDrag={(_, quadrant) => setActiveDropZone(quadrant)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <details ref={completedSection} className="completed">
        <summary>Completed <span>{completedTasks.length}</span></summary>
        <div className="tasks-list">
          {completedTasks.length === 0 ? (
            <div className="completed-empty-state">
              Finish a task and it will appear here.
            </div>
          ) : (
            completedTasks.map((task) => (
              <TaskCard key={task.id} task={task} disabled={saving}
                onComplete={() => toggleTaskCompletion(task.id)}
                onDelete={() => deleteTask(task.id)}
                onMove={() => {}} onDrag={() => {}} />
            ))
          )}
        </div>
      </details>
    </div>
  );
};

export default TodoList;
