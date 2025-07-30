import React, { useState, useEffect } from "react";
import PomodoroTimer from "./PomodoroTimer";
import fetchQuote from "./Quotes";
import "./Dashboard.css";

const Dashboard = ({}) => {
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [fetchingTasks, setFetchingTasks] = useState(true);

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
      <div className="dashboard-left">
        <PomodoroTimer setTabSwitchBlocked={() => false} />
      </div>
      <div className="dashboard-right">
        <div className="tasks-box">upcoming tasks will be shown here</div>
        <div className="quote-box">
          <p>{quote}</p>
          <p>- {author}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
