import React from "react";
import { Task } from "../../types";

type Props = {
  tasks: Task[];
};

const UpcomingTasks = ({ tasks }: Props) => {
  if (!tasks.length) return <div className="tasks-box">No tasks upcoming!</div>;

  return (
    <div className="tasks-box">
      <h3>Upcoming Tasks</h3>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <strong>{task.task_name}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UpcomingTasks;
