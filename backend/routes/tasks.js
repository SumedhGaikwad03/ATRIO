import express from "express";
import mongoose from "mongoose";
import Task from "../models/task.js";
import Room from "../models/room.js";
import authMiddleware from "../middleware/auth.js";
import { getIO } from "../socket.js";

const router = express.Router();

console.log("TASK ROUTER LOADED");

/*
  GET all tasks for a room
*/
router.get("/:roomId/tasks", authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    const room = await Room.findOne({
      _id: roomId,
      members: req.userId
    });

    if (!room) {
      return res.status(403).json({ message: "Access denied" });
    }

    const tasks = await Task.find({ room: roomId })
      .sort({
        completed: 1,        // false first
        completedAt: 1,      // null first
        createdAt: 1
      })
      .populate("createdBy", "username");

    res.json(tasks);

  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


/*
  CREATE task
*/
router.post("/:roomId/tasks", authMiddleware, async (req, res) => {
    const io = getIO();
    console.log(" TASK POST ROUTE HIT");
console.log(" IO instance exists:", !!io);
  try {
    const { roomId } = req.params;
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Task text required" });
    }

    const room = await Room.findOne({
      _id: roomId,
      members: req.userId
    });

    if (!room) {
      return res.status(403).json({ message: "Access denied" });
    }

    let task = await Task.create({
  room: roomId,
  text: text.trim(),
  createdBy: req.userId
});

task = await task.populate("createdBy", "username");
   console.log(" Emitting task_created to:", roomId.toString());
    const io = getIO();
    io.to(roomId.toString()).emit("task_created", task);
    console.log(" Emit done");

    res.status(201).json(task);

  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


/*
  UPDATE task (toggle complete or edit text)
*/
router.put("/:roomId/tasks/:taskId", authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text, completed } = req.body;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const room = await Room.findOne({
      _id: task.room,
      members: req.userId
    });

    if (!room) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (typeof text === "string") {
      task.text = text.trim();
    }

    if (typeof completed === "boolean") {
      task.completed = completed;
      task.completedAt = completed ? new Date() : null;
    }

    await task.save();

    // Re-fetch with populated user so frontend gets username
    const populatedTask = await Task.findById(task._id)
      .populate("createdBy", "username");


    const io = getIO();
    io.to(task.room.toString()).emit("task_updated", populatedTask  ) ;

    res.json(populatedTask);

  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


/*
  DELETE task
*/
router.delete("/:roomId/tasks/:taskId", authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const room = await Room.findOne({
      _id: task.room,
      members: req.userId
    });

    if (!room) {
      return res.status(403).json({ message: "Access denied" });
    }

    await task.deleteOne();

    const io = getIO();
    io.to(task.room.toString()).emit("task_deleted", taskId);

    res.status(204).send();

  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



export default router;