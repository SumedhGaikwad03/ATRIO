import defaultSocket from "../../../sockets";

const useNoteEditingRealtime = (arg1, arg2) => {
  let socket = defaultSocket;
  let roomId;

  if (typeof arg1 === "object" && arg1 !== null) {
    if (arg1.emit) {
      socket = arg1;
      roomId = arg2;
    } else {
      roomId = arg1.roomId;
      if (arg1.socket) socket = arg1.socket;
    }
  } else {
    roomId = arg1;
  }

  const startEditing = (noteId) => {
    socket.emit("note_editing_start", {
      roomId,
      noteId,
    });
  };

  const stopEditing = (noteId) => {
    socket.emit("note_editing_stop", {
      roomId,
      noteId,
    });
  };

  return {
    startEditing,
    stopEditing,
  };
};

export default useNoteEditingRealtime;
