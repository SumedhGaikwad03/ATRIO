import api from "../../../utils/api";

export const getRoom = (roomId) => api.get(`/rooms/${roomId}`);

export const addMember = (roomId, data) =>
  api.put(`/rooms/${roomId}/add-member`, data);
