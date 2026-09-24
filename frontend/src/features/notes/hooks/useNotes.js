import { useState } from "react";
import * as noteService from "../services/noteService";

export function useNotes(roomId) {
  const [notes, setNotes] = useState([]);
  const currentUserId = localStorage.getItem("userId");

  const fetchNotes = async () => {
    try {
      const res = await noteService.getNotes(roomId);
      setNotes(res.data);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    }
  };

  const createNote = async (title, content) => {
    if (!title?.trim() || !content?.trim()) return;

    // optimistic UI → show note instantly before server confirms
    const tempId = "temp-" + Date.now();
    const optimisticNote = {
      _id: tempId,
      title: title.trim(),
      content: content.trim(),
      roomId,
      createdBy: { _id: currentUserId },
      isOptimistic: true
    };

    setNotes((prev) => [optimisticNote, ...prev]);

    try {
      const res = await noteService.createNote({
        title: title.trim(),
        content: content.trim(),
        roomId
      });

      // replace temp note with real one from backend
      setNotes((prev) =>
        prev.map((n) => (n._id === tempId ? res.data : n))
      );
    } catch (err) {
      console.error("Error creating note:", err);

      // rollback if failed
      setNotes((prev) => prev.filter((n) => n._id !== tempId));
    }
  };

  const deleteNote = async (id) => {
    const prev = notes;
    setNotes((p) => p.filter((n) => n._id !== id));

    try {
      await noteService.deleteNote(id);
    } catch (err) {
      console.error("Error deleting note:", err);
      setNotes(prev); // rollback
    }
  };

  const saveEdit = async (id, title, content) => {
    const prev = notes;

    // optimistic update
    setNotes((p) =>
      p.map((n) =>
        n._id === id ? { ...n, title, content } : n
      )
    );

    try {
      await noteService.updateNote(id, {
        title,
        content
      });
    } catch (err) {
      console.error("Error updating note:", err);
      setNotes(prev); // rollback
    }
  };

  return {
    notes,
    setNotes,
    fetchNotes,
    createNote,
    deleteNote,
    saveEdit
  };
}

export default useNotes;
