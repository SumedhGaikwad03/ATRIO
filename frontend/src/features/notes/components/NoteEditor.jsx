import React from "react";

function NoteEditor({ title, content, setTitle, setContent }) {
  return (
    <div className="flex-1 flex flex-col h-full px-6 py-5">
      <style>{`
        .note-title-input {
          width: 100%; border: none; outline: none; background: transparent;
          font-size: 22px; font-weight: 700; color: #1c1917;
            font-family: 'DM Sans', sans-serif;
          padding-bottom: 10px;
          border-bottom: 2px solid #fde68a;
          transition: border-color 0.2s;
          margin-bottom: 16px;
        }
        .note-title-input:focus { border-bottom-color: #f97316; }
        .note-title-input::placeholder { color: #d6d3d1; font-weight: 600; }

        .note-content-input {
          flex: 1; width: 100%; border: none; outline: none; background: transparent;
          resize: none; font-size: 15px; line-height: 1.8; color: #44403c;
          font-family: 'DM Sans', sans-serif;
        }
        .note-content-input::placeholder { color: #d6d3d1; }
      `}</style>

      <input
        type="text"
        placeholder="Note title…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="note-title-input"
      />

      <textarea
        placeholder="Start writing your note…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="note-content-input"
      />

      {/* Character hint */}
      <div className="flex justify-end mt-2">
        <span className="text-xs text-amber-300">{content.length} chars</span>
      </div>
    </div>
  );
}

export default NoteEditor;
