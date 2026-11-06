import React from "react";
import { Task } from "../../types";
import { quadrants } from "../TaskCard";

type Props = {
  tasks: Task[];
};

const UpcomingTasks = ({ tasks }: Props) => {
  if (!tasks.length) {
    return (
      <div className="tasks-box tasks-box-empty">
        <h3>Up next</h3>
        <p className="tasks-caption">
          You're all clear. Add your next task in the Tasks tab.
        </p>
      </div>
    );
  }

  return (
    <div className="tasks-box">
      <div className="upcoming-heading"><h3>Up next</h3><span>{tasks.length} priorities</span></div>
      <div className="upcoming-task-list">
        {tasks.map((task) => (
          <div key={task.id} className="upcoming-task">
            <span className={`task-importance-badge badge-${task.importance}`}>
              {quadrants.find((q) => q.id === task.importance)?.title ?? "Task"}
            </span>
            <span className="upcoming-task-name">{task.task_name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingTasks;
