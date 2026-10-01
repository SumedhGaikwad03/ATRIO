import { useState, useEffect, useCallback } from "react";
import * as roomService from "../services/roomService";

export function useRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await roomService.getMyRooms();
      setRooms(res.data);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createRoom = async (name) => {
    try {
      const res = await roomService.createRoom(name);
      setRooms((prev) => [res.data, ...prev]);
      return res.data;
    } catch (err) {
      console.error("Room creation failed:", err);
      throw err;
    }
  };

  const leaveRoom = async (roomId) => {
    try {
      await roomService.leaveRoom(roomId);
      setRooms((prev) => prev.filter((room) => room._id !== roomId));
    } catch (err) {
      console.error("Failed to leave room:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return {
    rooms,
    setRooms,
    loading,
    error,
    fetchRooms,
    createRoom,
    leaveRoom,
  };
}

export default useRooms;
