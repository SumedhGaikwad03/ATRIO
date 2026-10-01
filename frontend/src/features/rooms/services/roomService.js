import api from "../../../utils/api";

export const getMyRooms = () => api.get("/rooms/myrooms");

export const getRoom = (roomId) => api.get(`/rooms/${roomId}`);

export const createRoom = (name) => api.post("/rooms/create", { name });

export const addMember = (roomId, data) =>
  api.put(`/rooms/${roomId}/add-member`, data);

export const leaveRoom = (roomId) =>
  api.delete(`/rooms/${roomId}/leave`);
