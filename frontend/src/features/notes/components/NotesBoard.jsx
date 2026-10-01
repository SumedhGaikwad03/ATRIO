import { AnimatePresence, motion } from "framer-motion";
import NoteCard from "./NoteCard";
import { isNoteBeingEditedByOther } from "../../realtime/utils/presence";

function NotesBoard({
  notes,
  showTasks,
  saveEdit,
  deleteNote,
  roomId,
  editingUsers,
  currentUserId,
  setShowEditor,
}) {
  return (
    <motion.div
      animate={{ marginLeft: showTasks ? 320 : 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 32 }}
      style={{ flex: 1 }}
    >
      <div className="notes-board">

        {/* Board meta */}
        {notes.length > 0 && (
          <div className="board-meta">
            <span className="note-count">
              {notes.length} note{notes.length !== 1 ? "s" : ""}
            </span>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, rgba(253,230,138,0.5), transparent)" }} />
          </div>
        )}

        {/* Notes grid */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", justifyContent: "flex-start" }}>
          <AnimatePresence>
            {notes.map(note => (
              <NoteCard
                key={note._id}
                layoutId={note._id}
                note={note}
                saveEdit={saveEdit}
                deleteNote={deleteNote}
                roomId={roomId}
                isBeingEditedByOther={isNoteBeingEditedByOther(
                  editingUsers,
                  note._id,
                  currentUserId
                )}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {notes.length === 0 && (
          <div className="empty-board">
            <div className="empty-icon-wrap">
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                <rect x="5" y="3" width="24" height="28" rx="5" stroke="#fbbf24" strokeWidth="1.5"/>
                <path d="M11 11h12M11 16h9M11 21h6" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="26" cy="26" r="6" fill="#fff7ed" stroke="#f97316" strokeWidth="1.5"/>
                <path d="M24 26l1.5 1.5L28 24" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "20px", fontWeight: 700, color: "#1c1917", marginBottom: "8px" }}>
              No notes yet
            </p>
            <p style={{ fontSize: "13px", color: "#a8a29e", maxWidth: "220px", lineHeight: 1.6 }}>
              Hit the <strong style={{ color: "#f97316" }}>+</strong> button to add your first note to this room.
            </p>
          </div>
        )}
      </div>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 8 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setShowEditor(true)}
        className="fab"
      >+</motion.button>

    </motion.div>
  );
}

export default NotesBoard;
