import { useState } from "react";
import * as roomService from "../services/roomService";

export function useRoom(roomId) {
  const [room, setRoom] = useState(null);

  const fetchRoom = async () => {
    try {
      const res = await roomService.getRoom(roomId);
      setRoom(res.data);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch room:", err);
    }
  };

  const addMember = async (userEmail) => {
    const res = await roomService.addMember(roomId, { userEmail });
    await fetchRoom();
    return res.data;
  };

  return {
    room,
    setRoom,
    fetchRoom,
    addMember
  };
}

export default useRoom;
