import React, { useState } from "react";
import { motion } from "framer-motion";
import useNoteEditingRealtime from "../../realtime/hooks/useNoteEditingRealtime";
import { getNoteRotation } from "../utils/layout";

function NoteCard({
  note,
  layoutId,
  saveEdit,
  deleteNote,
  roomId,
  isBeingEditedByOther
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const { startEditing, stopEditing } = useNoteEditingRealtime(roomId);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditTitle(note.title);
    setEditContent(note.content);
    startEditing(note._id);
  };

  const handleSave = () => {
    setIsEditing(false);
    stopEditing(note._id);
    saveEdit(note._id, editTitle, editContent);
  };

  const handleDelete = () => {
    if (isEditing) {
      setIsEditing(false);
      stopEditing(note._id);
    }
    deleteNote(note._id);
  };

  const handleCancel = () => {
    setIsEditing(false);
    stopEditing(note._id);
  };

  return (
    <motion.div
      layout
      layoutId={note._id}
      initial={{ opacity: 0, scale: 0.9, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.25 }}
      onDoubleClick={handleStartEdit}
      className={`relative w-64 bg-white p-5 rounded-md border transition-all duration-300
        ${
          isBeingEditedByOther
            ? "ring-2 ring-emerald-400 shadow-lg shadow-emerald-200"
            : "border-yellow-200 shadow-[6px_6px_12px_rgba(0,0,0,0.15)] hover:shadow-[8px_8px_16px_rgba(0,0,0,0.25)]"
        }
      `}
      style={{ rotate: `${getNoteRotation(note._id)}deg` }}
    >
      {/* Tape strip */}
      <div className="absolute -top-3 left-6 w-10 h-4 bg-gray-300 rounded-sm shadow-md rotate-3"></div>

      {/* Editing indicator */}
      {isBeingEditedByOther && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-2 right-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full"
        >
          Editing...
        </motion.div>
      )}

      {isEditing ? (
        <>
          <input
            className="w-full border p-1 mb-2 rounded"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />

          <textarea
            className="w-full border p-1 rounded"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />

          <div className="flex justify-between mt-3">
            <button
              className="bg-amber-500 text-white px-3 py-1 rounded hover:bg-amber-600 transition"
              onClick={handleSave}
            >
              Save
            </button>

            <div className="flex gap-2">
              <button
                className="text-red-500 font-medium px-3 py-1 rounded hover:bg-red-50 transition"
                onClick={handleDelete}
              >
                Delete
              </button>

              <button
                className="text-gray-400 font-bold text-lg leading-none hover:text-gray-600 transition"
                onClick={handleCancel}
              >
                ×
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <h3 className="font-bold text-lg">{note.title}</h3>
          <p className="mt-2 text-gray-700">{note.content}</p>
          {note.user?.username && (
            <div className="mt-3 pt-2 border-t border-yellow-100 flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold" style={{ fontSize: "9px" }}>
                  {note.user.username.slice(0, 1).toUpperCase()}
                </span>
              </div>
              <span className="text-xs font-medium text-amber-800 truncate">
                {note.user.username}
              </span>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

export default NoteCard;
