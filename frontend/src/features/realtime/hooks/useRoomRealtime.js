import { useEffect } from "react";
import socket, { connectSocket } from "../../../sockets";

const useRoomRealtime = ({ roomId }) => {
  useEffect(() => {
    if (!roomId) return;

    connectSocket();
    socket.emit("join_room", roomId);

    return () => {
      socket.emit("leave_room", roomId);
    };
  }, [roomId]);
};

export default useRoomRealtime;
