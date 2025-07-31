import React, { useState, useEffect } from "react";
import PomodoroTimer from "./Dashboard/PomodoroTimer";
import fetchQuote from "./Dashboard/Quotes";
import "./Dashboard.css";
import supabase from "../utils/supabase";
import { Task } from "../types";
import UpcomingTasks from "./Dashboard/UpcomingTasks";

const Dashboard = ({}) => {
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [fetchingTasks, setFetchingTasks] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);

  const getID = async (): Promise<string> => {
    var telegramUser = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user;
    if (!telegramUser || !telegramUser.id) {
      // console.error("Telegram user not available");
      // throw new Error("Telegram user not available");

      telegramUser = {
        id: 101010101,
      }; // this is purely for dev, do not use in production
    }
    console.log("Telegram user ID:", telegramUser.id);
    console.log("data type of telegramUser.id:", typeof telegramUser.id);

    return telegramUser.id; // use directly as a string
  };

  const fetchTasks = async () => {
    const userTeleId = await getID();

    const { data: Todo, error } = await supabase
      .from("Todo")
      .select("*")
      .eq("user_tele_id", userTeleId)
      .is("finished_at", null)
      .order("importance", { ascending: true });

    if (Todo) setTasks(Todo);
    if (error) console.error("Error fetching tasks:", error);
  };

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
    fetchTasks().finally(() => setFetchingTasks(false));
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-left">
        <PomodoroTimer setTabSwitchBlocked={() => false} />
      </div>
      <div className="dashboard-right">
        <UpcomingTasks tasks={tasks} />
        <div className="quote-box">
          <p>{quote}</p>
          <p>- {author}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
