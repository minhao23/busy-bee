import { useState, useEffect } from "react";
import PomodoroTimer from "./Dashboard/PomodoroTimer";
import fetchQuote from "./Dashboard/Quotes";
import "./Dashboard.css";
import UpcomingTasks from "./Dashboard/UpcomingTasks";
import { useTasks } from "./Supabase/TaskLogic";

const Dashboard = ({}) => {
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const { topTasks, fetchTopTasks } = useTasks();
  const { tasks } = useTasks();

  useEffect(() => {
    const fetchData = async () => {
      const temp = await fetchQuote();
      if (temp?.[0]) {
        setQuote(temp[0].quote);
        setAuthor(temp[0].author);
      } else {
        setQuote("Let's get to work!");
        setAuthor("");
      }
    };

    fetchData();
    fetchTopTasks();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-main">
        <div className="dashboard-left">
          <PomodoroTimer />
        </div>
        <div className="dashboard-right">
          <div className="quote-box">
            <p>{quote}</p>
            <p>- {author}</p>
          </div>
          <UpcomingTasks tasks={topTasks} />
        </div>
      </div>

      <div className="stats">
        <div className="stat-item">Total Tasks: {tasks.length}</div>
      </div>
    </div>
  );
};

export default Dashboard;
