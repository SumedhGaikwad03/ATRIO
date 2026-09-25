import api from "../../../utils/api";

export const getTasks = (roomId) => api.get(`/rooms/${roomId}/tasks`);
