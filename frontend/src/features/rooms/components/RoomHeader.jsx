import { motion } from "framer-motion";

function RoomHeader({
  room,
  currentUsername,
  onlineUsers,
  showTasks,
  setShowTasks,
  setShowInvite,
  setShowBetaNotice,
  navigate,
}) {
  const getInitials = (name) => (name ? name.slice(0, 2).toUpperCase() : "?");

  return (
    <div className="room-header">
      <div className="header-shimmer" />
      <div className="header-inner">
        {/* ── LEFT ── */}
        <div className="header-left">
          <div className="logo-mark">
            <span>A</span>
          </div>
          <div className="logo-name">
            Atri<em>o</em>
          </div>
          <span
            className="beta-pill"
            onClick={() => setShowBetaNotice(true)}
          >
            BETA
          </span>

          <div className="vdivider" />

          <button className="back-btn" onClick={() => navigate("/rooms")}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 3L5 8l5 5"
                stroke="#92400e"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Rooms
          </button>

          <div className="vdivider" />

          <div className="room-name-badge">{room?.name || "Loading…"}</div>
        </div>

        {/* ── CENTER — members ── */}
        <div className="header-center">
          <div className="members-row">
            {room?.members?.map((member) => {
              const isOnline = onlineUsers.includes(String(member._id));
              return (
                <div key={member._id} className="member-chip">
                  <span>{member.username}</span>
                  {isOnline && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      className="online-dot"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="header-right">
          <div className="user-avatar-sm">{getInitials(currentUsername)}</div>

          <div className="online-badge">
            <span className="online-pulse" />
            {onlineUsers.length} online
          </div>

          <button
            className={`hbtn hbtn-tasks ${showTasks ? "active" : ""}`}
            onClick={() => setShowTasks((p) => !p)}
          >
            ☑ Tasks
          </button>

          <button
            className="hbtn hbtn-invite"
            onClick={() => setShowInvite(true)}
          >
            + Invite
          </button>

          <button
            className="hbtn hbtn-contact"
            onClick={() => setShowBetaNotice(true)}
          >
            Contact
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoomHeader;
