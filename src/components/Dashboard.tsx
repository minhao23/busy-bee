import { useState, useEffect } from "react";
import PomodoroTimer from "./Dashboard/PomodoroTimer";
import fetchQuote from "./Dashboard/Quotes";
import "./Focus.css";
import UpcomingTasks from "./Dashboard/UpcomingTasks";
import { useTasks } from "./Supabase/TaskLogic";

const Dashboard = () => {
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const { topTasks, isLoading, loadError, fetchTasks } = useTasks();

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
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-main">
        <div className="dashboard-left">
          <PomodoroTimer />
        </div>
        <div className="dashboard-right">
          {loadError ? <p className="error-message" role="alert">{loadError} <button onClick={fetchTasks}>Retry</button></p>
            : isLoading ? <p className="tasks-caption" role="status">Loading your priorities...</p>
            : <UpcomingTasks tasks={topTasks} />}
          <blockquote className="quote-box">
            <p className="quote-text">{quote}</p>
            {author && <footer className="quote-author">{author}</footer>}
          </blockquote>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
