import { useEffect } from "react";
import socket from "../../../sockets";

const useNoteRealtime = ({ setNotes }) => {
  useEffect(() => {
    const handleNoteCreated = (note) => {
      setNotes((prev) => {
        // Avoid duplicates
        if (prev.some((n) => n._id === note._id)) {
          return prev;
        }

        // Replace optimistic note
        const optimisticNote = prev.find(
          (n) => n.isOptimistic && n.title === note.title
        );

        if (optimisticNote) {
          return prev.map((n) =>
            n._id === optimisticNote._id ? note : n
          );
        }

        return [note, ...prev];
      });
    };

    const handleNoteUpdated = (note) => {
      setNotes((prev) =>
        prev.map((n) => (n._id === note._id ? note : n))
      );
    };

    const handleNoteDeleted = (noteId) => {
      setNotes((prev) =>
        prev.filter((n) => n._id !== noteId)
      );
    };

    socket.on("note_created", handleNoteCreated);
    socket.on("note_updated", handleNoteUpdated);
    socket.on("note_deleted", handleNoteDeleted);

    return () => {
      socket.off("note_created", handleNoteCreated);
      socket.off("note_updated", handleNoteUpdated);
      socket.off("note_deleted", handleNoteDeleted);
    };
  }, [setNotes]);
};

export default useNoteRealtime;