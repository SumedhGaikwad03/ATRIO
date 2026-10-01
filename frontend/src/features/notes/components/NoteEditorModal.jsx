import React, { useState } from "react";
import NoteEditor from "./NoteEditor";

function NoteEditorModal({ show, onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  if (!show) return null;

  const handleClose = () => {
    setTitle("");
    setContent("");
    onClose();
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;
    const noteTitle = title;
    const noteContent = content;
    setTitle("");
    setContent("");
    onSave(noteTitle, noteContent);
  };

  return (
    <>
      <style>{`
        @keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(16px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
        .note-modal-enter { animation: modalIn 0.35s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)" }}
        onClick={handleClose}>

        <div className="note-modal-enter relative w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col"
          style={{
            height: "520px",
            background: "rgba(255,253,245,0.98)",
            border: "1px solid rgba(253,230,138,0.6)",
            boxShadow: "0 24px 64px rgba(194,65,12,0.15)"
          }}
          onClick={(e) => e.stopPropagation()}>

          {/* Shimmer stripe */}
          <div style={{ height: "3px", flexShrink: 0, background: "linear-gradient(90deg,#fbbf24,#f97316,#ea580c,#f97316,#fbbf24)", backgroundSize: "200% auto", animation: "shimmer 3s linear infinite" }} />

          {/* Modal top bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: "rgba(253,230,138,0.4)", flexShrink: 0 }}>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#fbbf24,#f97316)" }}>
                <span className="text-white text-sm">✎</span>
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-lg font-bold text-amber-800">
                New Note
              </h2>
            </div>
            <button onClick={handleClose}
              className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 hover:bg-red-100 hover:text-red-500 transition flex items-center justify-center font-bold text-lg">
              ×
            </button>
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            <NoteEditor
              title={title}
              content={content}
              setTitle={setTitle}
              setContent={setContent}
            />
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-between px-6 py-4 border-t"
            style={{ borderColor: "rgba(253,230,138,0.4)", background: "rgba(255,251,235,0.8)", flexShrink: 0 }}>
            <p className="text-xs text-amber-400">
              {title.trim() && content.trim() ? "✓ Ready to save" : "Fill in title and content"}
            </p>
            <div className="flex gap-2">
              <button onClick={handleClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 transition hover:bg-gray-200"
                style={{ background: "#f3f4f6" }}>
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim() || !content.trim()}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                style={{ background: "linear-gradient(135deg,#f97316,#ea580c)", boxShadow: (title.trim() && content.trim()) ? "0 4px 14px rgba(234,88,12,0.3)" : "none" }}>
                Add Note →
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default NoteEditorModal;
