import React, { useState, useEffect } from "react";
import PomodoroTimer from "./PomodoroTimer";
import fetchQuote from "./Quotes";

const Dashboard = ({}) => {
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");

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
    <div>
      <div className="quote">
        <p>{quote}</p>
        <p>- {author}</p>
      </div>
      <div className="upcoming-tasks">upcoming tasks will be shown here</div>
      <PomodoroTimer setTabSwitchBlocked={() => false} />
    </div>
  );
};

export default Dashboard;
