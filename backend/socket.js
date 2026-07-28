import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Room from "./models/room.js";

let ioInstance = null;
// roomId -> Map(userId -> socketCount)
const roomOnlineUsers = new Map(); // this is a map that keeps track of online users in each room. The key is the roomId, and the value is another map that tracks userId to socketCount.
//  This allows us to handle multiple connections from the same user in a room. 
// all while the storage is in memory locally not the server.


export const initSocket = (server) => {
  if (ioInstance) {
    return ioInstance;
  }

  const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173" || "https://notesy-backend-xrw3.onrender.com";

  ioInstance = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://notesy-sumedh-gaikwads-projects.vercel.app",
      "https://atrio-gamma.vercel.app",

    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

  // 🔐 JWT Authentication
  ioInstance.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      const jwtSecret = process.env.JWT_SECRET;

      if (!token || !jwtSecret) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, jwtSecret);

      // Standardize this. Always rely on userId.
      if (!decoded.userId) {
        return next(new Error("Invalid token payload"));
      }

      socket.userId = decoded.userId;

      next();
    } catch (err) {
      console.error("Socket auth error:", err.message);
      next(new Error("Authentication error"));
    }
  });

 ioInstance.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // JOIN ROOM
  socket.on("join_room", async (roomId) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(roomId)) {
        return socket.emit("socket_error", { message: "Invalid room ID" });
      }

      const room = await Room.findOne({
        _id: roomId,
        members: socket.userId
      }).lean();

      if (!room) {
        return socket.emit("socket_error", { message: "Access denied" });
      }

      const roomKey = roomId.toString();
      socket.join(roomKey);

      // ----- PRESENCE LOGIC -----
      if (!roomOnlineUsers.has(roomKey)) {
        roomOnlineUsers.set(roomKey, new Map());
      }

      const userMap = roomOnlineUsers.get(roomKey);
      const currentCount = userMap.get(socket.userId) || 0;
      userMap.set(socket.userId, currentCount + 1);

      socket.roomId = roomKey;

      emitOnlineUsers(roomKey);

    } catch (error) {
      console.error("Join room error:", error.message);
      socket.emit("socket_error", { message: "Could not join room" });
    }
  });

  // 🔥 NOTE EDITING START
  socket.on("note_editing_start", ({ roomId, noteId }) => {
    const roomKey = roomId.toString();

    socket.to(roomKey).emit("note_editing_update", {
      noteId,
      userId: socket.userId,
      isEditing: true
    });
  });

  // 🔥 NOTE EDITING STOP
  socket.on("note_editing_stop", ({ roomId, noteId }) => {
    const roomKey = roomId.toString();

    socket.to(roomKey).emit("note_editing_update", {
      noteId,
      userId: socket.userId,
      isEditing: false
    });
  });

  // LEAVE ROOM
  socket.on("leave_room", () => {
    handleDisconnect(socket);
  });

  socket.on("disconnect", () => {
    handleDisconnect(socket);
  });
});


  




function handleDisconnect(socket) {
  const roomKey = socket.roomId;
  if (!roomKey) return;

  const userMap = roomOnlineUsers.get(roomKey);
  if (!userMap) return;

  const currentCount = userMap.get(socket.userId) || 0;

  if (currentCount <= 1) {
    userMap.delete(socket.userId);
  } else {
    userMap.set(socket.userId, currentCount - 1);
  }

  if (userMap.size === 0) {
    roomOnlineUsers.delete(roomKey);
  }

  emitOnlineUsers(roomKey);
}

function emitOnlineUsers(roomKey) {
  const userMap = roomOnlineUsers.get(roomKey);
  const users = userMap
  ? Array.from(userMap.keys()).map(id => id.toString())
  : [];

  ioInstance.to(roomKey).emit("online_users_update", users);
  console.log("Online users for room:", roomKey, users);

}



  return ioInstance;
};

export const getIO = () => {
  if (!ioInstance) {
    throw new Error("Socket.io not initialized");
  }
  return ioInstance;
};
