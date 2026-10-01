import api from "../../../utils/api";

export const getTasks = (roomId) =>
  api.get(`/rooms/${roomId}/tasks`);

export const createTask = (roomId, text) =>
  api.post(`/rooms/${roomId}/tasks`, { text });

export const updateTask = (roomId, taskId, data) =>
  api.put(`/rooms/${roomId}/tasks/${taskId}`, data);

export const deleteTask = (roomId, taskId) =>
  api.delete(`/rooms/${roomId}/tasks/${taskId}`);
