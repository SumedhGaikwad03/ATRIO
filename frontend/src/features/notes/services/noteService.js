import api from "../../../utils/api";

export const getNotes = (roomId) => api.get(`/rooms/${roomId}/notes`);

export const createNote = (data) => api.post("/notes/add", data);

export const updateNote = (noteId, data) =>
  api.put(`/notes/update/${noteId}`, data);

export const deleteNote = (noteId) =>
  api.delete(`/notes/delete/${noteId}`);
