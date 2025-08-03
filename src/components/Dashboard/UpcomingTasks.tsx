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
          <div key={task.id} className="task">
            {task.task_name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingTasks;
