import { useState, useEffect } from "react";
import socket from "../../../sockets";

export function useRoomPresence() {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [editingUsers, setEditingUsers] = useState({});

  useEffect(() => {
    const handleOnlineUsersUpdate = (users) => {
      setOnlineUsers(users);
    };

    const handleNoteEditingUpdate = ({
      noteId,
      userId,
      isEditing
    }) => {
      setEditingUsers((prev) => {
        const updated = { ...prev };

        if (isEditing) {
          updated[noteId] = userId;
        } else {
          delete updated[noteId];
        }

        return updated;
      });
    };

    socket.on("online_users_update", handleOnlineUsersUpdate);
    socket.on("note_editing_update", handleNoteEditingUpdate);

    return () => {
      socket.off("online_users_update", handleOnlineUsersUpdate);
      socket.off("note_editing_update", handleNoteEditingUpdate);
    };
  }, []);

  return {
    onlineUsers,
    editingUsers,
    setOnlineUsers,
    setEditingUsers
  };
}

export default useRoomPresence;
