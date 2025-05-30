import React, { useState, useRef } from "react";
import { TodoItem } from "../types";

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTodo = () => {
    if (inputValue.trim() === "") return;

    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      completed: false,
      createdAt: new Date(),
    };

    setTodos((prev) => [newTodo, ...prev]);
    setInputValue("");
    inputRef.current?.focus();
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const handleInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  const completedCount = todos.filter((todo) => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className="todo-list">
      <div className="todo-header">
        <h2 className="todo-title">Todo List</h2>
        {totalCount > 0 && (
          <div className="todo-stats">
            {completedCount} of {totalCount} completed
          </div>
        )}
      </div>

      <div className="todo-input-container">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleInputKeyPress}
          placeholder="Add a new task..."
          className="todo-input"
        />
        <button
          onClick={addTodo}
          className="add-button"
          disabled={inputValue.trim() === ""}
        >
          Add
        </button>
      </div>

      <div className="todo-items">
        {todos.length === 0 ? (
          <div className="empty-state">
            <p>No tasks yet. Add one above!</p>
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className={`todo-item ${todo.completed ? "completed" : ""}`}
            >
              <button
                className="todo-checkbox"
                onClick={() => toggleTodo(todo.id)}
                aria-label={
                  todo.completed ? "Mark as incomplete" : "Mark as complete"
                }
              >
                {todo.completed && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M13.5 4.5L6 12L2.5 8.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>

              <span className="todo-text">{todo.text}</span>

              <button
                className="delete-button"
                onClick={() => deleteTodo(todo.id)}
                aria-label="Delete task"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M12 4L4 12M4 4L12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TodoList;
