import React, { useState } from "react";

function InviteModal({ show, onClose, onInvite }) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");

  if (!show) return null;

  const handleClose = () => {
    setInviteEmail("");
    setInviteError("");
    onClose();
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;

    try {
      setInviteError("");
      await onInvite(inviteEmail.trim());
      setInviteEmail("");
      setInviteError("");
    } catch (err) {
      setInviteError(
        err.response?.data?.message ||
        "Something went wrong."
      );
    }
  };

  return (
    <>
      <style>{`
        @keyframes modalIn { from { opacity:0; transform:scale(0.93) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
        .invite-modal-enter { animation: modalIn 0.3s cubic-bezier(0.16,1,0.3,1) both; }
        .invite-input {
          width: 100%; padding: 12px 16px; border-radius: 12px;
          border: 1.5px solid #fde68a; background: rgba(255,255,255,0.85);
          font-size: 14px; color: #1c1917; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .invite-input:focus { border-color: #f97316; box-shadow: 0 0 0 4px rgba(251,146,60,0.15); }
        .invite-input::placeholder { color: #a8a29e; }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)" }}>

        <div className="invite-modal-enter relative w-full max-w-sm rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255,253,245,0.97)",
            border: "1px solid rgba(253,230,138,0.6)",
            boxShadow: "0 24px 64px rgba(194,65,12,0.15)"
          }}>

          {/* Shimmer stripe */}
          <div style={{ height: "3px", background: "linear-gradient(90deg,#fbbf24,#f97316,#ea580c,#f97316,#fbbf24)", backgroundSize: "200% auto", animation: "shimmer 3s linear infinite" }} />

          <div className="p-7">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold text-amber-800">
                  Invite Someone
                </h2>
                <p className="text-xs text-amber-500 mt-0.5">They'll get access to this room instantly</p>
              </div>
              <button onClick={handleClose}
                className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 hover:bg-red-100 hover:text-red-500 transition flex items-center justify-center font-bold text-lg">
                ×
              </button>
            </div>

            {/* Input */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2 block">
                Email address
              </label>
              <input
                className="invite-input"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.target.value);
                  if (inviteError) setInviteError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && inviteEmail.trim() && handleInvite()}
                autoFocus
              />
            </div>

            {/* Error */}
            {inviteError && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-600 font-medium mb-4"
                style={{ background: "rgba(254,226,226,0.75)", border: "1px solid rgba(252,165,165,0.4)" }}>
                <span>⚠</span> {inviteError}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-2">
              <button onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 transition hover:bg-gray-100"
                style={{ background: "#f3f4f6" }}>
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={!inviteEmail.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                style={{ background: "linear-gradient(135deg,#f97316,#ea580c)", boxShadow: inviteEmail.trim() ? "0 4px 14px rgba(234,88,12,0.3)" : "none" }}>
                Send Invite →
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default InviteModal;