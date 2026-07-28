// this is used for curd oprations 

import authMiddleware from '../middleware/auth.js';
import express from 'express';
import Note from '../models/note.js';
import Room from '../models/room.js';
//import Activity from '../models/activity.js';
import { getIO } from '../socket.js'; // 🔌 we get socket instance safely from singleton // 

const router = express.Router(); // it is there to create a new router object that can be used to define routes for the notes resource.
// also modulate the routes code and and use this router object to handle all the routes related to notes. 
// and then we can export this router object and use it in the main app.js file to register the routes.


// GET CURRENT USER NOTES (across all rooms)
// this is an redundat route now 
/*
router.get("/my", authMiddleware, async (req, res) => {

  try {

   const notes = await Note.find({ user: req.userId })
  .populate("user", "username")
  .sort({ createdAt: -1 });

    res.json(notes);

  } catch (error) {

    console.error("Error fetching user notes:", error);

    res.status(500).json({
      message: "Internal server error"
    });

  }

});*/


// this is made to add a note
router.post('/add', authMiddleware, async (req, res) => {

  try {

    const { title, content, roomId } = req.body;

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({
        message: "Title and content are required"
      });
    }

    // we verfy if user has acess to add notes to this room 
    const room = await Room.findOne({
      _id: roomId,
      members: req.userId
    });

    if (!room) {

      return res.status(403).json({
        message: "You do not have access to this room"
      });

    }

    const note = await Note.create({
      title: title.trim(),
      content: content.trim(),
      user: req.userId,
      room: roomId
    }); // we are getting user id from token and then we are using 
       // that user id to create a note for that user only

    // we create activity BEFORE emitting socket so we can broadcast it
    /*const activity = await Activity.create({
      room: roomId,
      user: req.userId,
      type: "note_created",
      targetId: note._id,
      meta: { title: note.title }
    });*/

    // 🔌 emit real-time events
    const populatedNote = await note.populate("user", "username");

    const io = getIO();
    io.to(roomId.toString()).emit("note_created", populatedNote);
    //io.to(roomId.toString()).emit("activity_update", activity);

    res.status(201).json(populatedNote);

    console.log("note added");

  } catch (error) {

    console.error("Error adding note:", error);

    res.status(500).json({
      message: "Internal server error"
    });

  }

});


// this is just a test route
// you can remove it later
/*router.get('/getnote', authMiddleware, async (req, res) => {

  try {

    const { ID } = req.body;

    const note = await Note.findById(ID);

    res.status(200).json(note); // this returns a json obj of note to the calling link that is from api.js getNoteById function

    console.log("hello from get");

  } catch (error) {

    console.error("Error fetching note:", error);

    res.status(500).json({
      message: "Internal server error"
    });

  }

});*/

// this is the route for an older version 

/*
router.get('/allnotes', authMiddleware, async (req, res) => {

  try {

    const notes = await Note.find();

    res.status(200).json(notes);

    console.log("hello from all notes");

  } catch (error) {

    console.error("Error fetching all notes:", error);

    res.status(500).json({
      message: "Internal server error"
    });

  }

});*/


router.put('/update/:id', authMiddleware, async (req, res) => {

  try {

    const { id } = req.params;
    const { title, content } = req.body;
   // const roomId = req.body.roomId;

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found"
      });
    }

    // 🔐 Check room membership instead of ownership
    const room = await Room.findOne({
      _id: note.room,
      members: req.userId
    });

    if (!room) {
      return res.status(403).json({
        message: "You do not have access to this room"
      });
    }

    note.title = title ?? note.title;
    note.content = content ?? note.content;

    await note.save();
    const populatedNote = await note.populate("user", "username");

    const io = getIO();
    io.to(note.room.toString()).emit("note_updated", populatedNote);
    //io.to(roomId.toString()).emit("activity_update", activity);

    res.status(200).json(populatedNote);

    console.log("note updated");

    /*const activity = await Activity.create({
      room: note.room,
      user: req.userId,
      type: "note_updated",
      targetId: note._id,
      meta: { title: note.title }
    });*/

   

  } catch (error) {

    console.error("Error updating note:", error);

    res.status(500).json({
      message: "Internal server error"
    });

  }

});



router.delete('/delete/:id', authMiddleware, async (req, res) => {

  try {

    const { id } = req.params;

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found"
      });
    }

    // 🔐 Check room membership instead of ownership
    const room = await Room.findOne({
      _id: note.room,
      members: req.userId
    });

    if (!room) {
      return res.status(403).json({
        message: "You do not have access to this room"
      });
    }

    const roomId = note.room;

    await note.deleteOne();

    console.log("Note deleted");

    /*const activity = await Activity.create({
      room: roomId,
      user: req.userId,
      type: "note_deleted",
      targetId: id,
      meta: { title: note.title }
    });*/

    const io = getIO();
    io.to(roomId.toString()).emit("note_deleted", id);// used to emit the note has beendeleted 
    //io.to(roomId.toString()).emit("activity_update", activity);

    res.status(204).send();

  } catch (error) {

    console.error("Error deleting note:", error);

    res.status(500).json({
      message: "Internal server error"
    });

  }

});



router.get("/test", (req, res) => {
  res.send("Notes router working");
});


// GET user notes fallback route

router.get("/", authMiddleware, async (req, res) => {

  try {

    const notes = await Note.find({
      user: req.userId
    });

    res.json(notes); // now user can access only his notes not other users notes because 
                     // we are using authmiddleware and in that we are getting user id from token and then we are
                     // using that user id to find notes of that user only

  } catch (error) {

    console.error("Error fetching notes:", error);

    res.status(500).json({
      message: "Internal server error"
    });

  }

});


export default router;
