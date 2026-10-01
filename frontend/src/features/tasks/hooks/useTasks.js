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


  const createTask = async(text) => {

    const tempId = "temp-"+Date.now();

    const optimisticTask = {
    _id: tempId,
    text,
    completed: false,
    createdBy: { _id: localStorage.getItem("userId") },
    isOptimistic: true
  };

  setTasks(prev => [...prev, optimisticTask]);

  try {
    const res = await taskService.createTask(roomId, text);

    setTasks(prev =>
      prev.map(task =>
        task._id === tempId ? res.data : task
      )
    );

    return res.data;
  } catch (err) {
    setTasks(prev =>
      prev.filter(task => task._id !== tempId)
    );

    throw err;
  }
};

const updateTask = async (taskId, data) => {
  const previousTasks = tasks;

  setTasks(prev =>
    prev.map(task =>
      task._id === taskId
        ? { ...task, ...data, isOptimistic: true }
        : task
    )
  );

  try {
    const res = await taskService.updateTask(roomId, taskId, data);

    setTasks(prev =>
      prev.map(task =>
        task._id === taskId
          ? { ...res.data, isOptimistic: false }
          : task
      )
    );

    return res.data;
  } catch (err) {
    setTasks(previousTasks);
    throw err;
  }
};

const deleteTask = async (taskId) => {
  const previousTasks = tasks;

  setTasks(prev =>
    prev.filter(task => task._id !== taskId)
  );

  try {
    await taskService.deleteTask(roomId, taskId);
  } catch (err) {
    setTasks(previousTasks);
    throw err;
  }
};

 return {
  tasks,
  setTasks,
  fetchTasks,
  createTask,
  updateTask,
  deleteTask
};
}

   

export default useTasks; 




