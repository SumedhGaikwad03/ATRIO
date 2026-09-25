import { useState } from "react";
import * as taskService from "../services/taskService";

export function useTasks(roomId) {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    try {
      const res = await taskService.getTasks(roomId);
      setTasks(res.data);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  return {
    tasks,
    setTasks,
    fetchTasks
  };
}

export default useTasks; 




