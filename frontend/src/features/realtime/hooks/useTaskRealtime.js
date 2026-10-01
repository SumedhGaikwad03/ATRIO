import { useEffect } from "react";
import socket from "../../../sockets";

const useTaskRealtime = ({ setTasks }) => {
  useEffect(() => {
    const handleTaskCreated = (task) => {
      setTasks((prev) => {
        const optimisticTask = prev.find(
          (t) =>
            t.isOptimistic &&
            t.text === task.text &&
            t.createdBy?._id === task.createdBy?._id
        );

        if (optimisticTask) {
          return prev.map((t) =>
            t._id === optimisticTask._id ? task : t
          );
        }

        if (!prev.some((t) => t._id === task._id)) {
          return [task, ...prev.filter((t) => !t.isOptimistic)];
        }

        return prev;
      });
    };

    const handleTaskUpdated = (task) => {
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? task : t))
      );
    };

    const handleTaskDeleted = (taskId) => {
      // cuz it only receives a string we have to stringfy the id
      setTasks((prev) =>
        prev.filter((t) => String(t._id) !== String(taskId))
      );
    };

    socket.on("task_created", handleTaskCreated);
    socket.on("task_updated", handleTaskUpdated);
    socket.on("task_deleted", handleTaskDeleted);

    return () => {
      socket.off("task_created", handleTaskCreated);
      socket.off("task_updated", handleTaskUpdated);
      socket.off("task_deleted", handleTaskDeleted);
    };
  }, [setTasks]);
};

export default useTaskRealtime;
