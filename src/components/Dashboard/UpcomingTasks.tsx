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
      <div>
        {tasks.map((task) => (
          <div key={task.id} className="upcoming-task">
            <span className="upcoming-task-name">{task.task_name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingTasks;
