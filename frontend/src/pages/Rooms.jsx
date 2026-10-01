import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useRooms from "../features/rooms/hooks/useRooms";
import CreateRoomModal from "../components/modals/CreateRoomModal";
import LeaveRoomModal from "../components/modals/LeaveRoomModal";

function Rooms() {
  const {
    rooms,
    loading,
    createRoom,
    leaveRoom,
  } = useRooms();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [roomToLeave, setRoomToLeave] = useState(null);
  const [username, setUsername] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);
  }, []);

  /* ── GREETING ── */
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.slice(0, 2).toUpperCase();
  };

  /* ── LOGOUT ── */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  /* ── ROOM ACTIONS ── */
  const handleCreateRoom = async (name) => {
    try {
      await createRoom(name);
      setShowCreateModal(false);
    } catch (err) {
      // Handled in useRooms hook
    }
  };

  const handleLeaveRoom = async (roomId) => {
    try {
      await leaveRoom(roomId);
      setShowLeaveModal(false);
    } catch (err) {
      // Handled in useRooms hook
    }
  };

  const handleRoomClick = (roomId) => navigate(`/rooms/${roomId}`);

  /* ── LOADING ── */
  if (loading) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
          @keyframes pulse { 0%,100%{opacity:1;}50%{opacity:0.4;} }
        `}</style>
        <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#fffbeb 0%,#fef3c7 35%,#fff7ed 65%,#ffedd5 100%)", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"16px" }}>
          <div style={{ width:"44px", height:"44px", borderRadius:"13px", background:"linear-gradient(135deg,#fbbf24,#f97316)", animation:"pulse 1.4s ease-in-out infinite" }} />
          <p style={{ fontFamily:"'DM Sans',sans-serif", color:"#92400e", fontSize:"14px", fontWeight:500 }}>Loading your workspace…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        .atrio-rooms * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }

        /* ── PAGE ── */
        .atrio-rooms {
          min-height: 100vh;
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 35%, #fff7ed 65%, #ffedd5 100%);
          position: relative;
          overflow-x: hidden;
        }

        /* ── BLOBS ── */
        @keyframes blob1 { 0%,100%{transform:translate(0,0) scale(1) rotate(0deg);}25%{transform:translate(60px,-80px) scale(1.1) rotate(8deg);}50%{transform:translate(-40px,60px) scale(0.95) rotate(-5deg);}75%{transform:translate(80px,40px) scale(1.05) rotate(12deg);} }
        @keyframes blob2 { 0%,100%{transform:translate(0,0) scale(1);}20%{transform:translate(-70px,50px) scale(1.08);}50%{transform:translate(50px,-70px) scale(0.92);}80%{transform:translate(-30px,-40px) scale(1.12);} }
        @keyframes blob3 { 0%,100%{transform:translate(0,0) scale(1);}33%{transform:translate(40px,80px) scale(1.15);}66%{transform:translate(-60px,-30px) scale(0.88);} }

        .blob { position:fixed; border-radius:50%; filter:blur(80px); pointer-events:none; z-index:0; }
        .blob-1 { width:600px; height:600px; background:rgba(251,191,36,0.3); top:-200px; left:-200px; animation:blob1 14s ease-in-out infinite; }
        .blob-2 { width:600px; height:600px; background:rgba(249,115,22,0.22); bottom:-200px; right:-200px; animation:blob2 17s ease-in-out infinite; }
        .blob-3 { width:500px; height:500px; background:rgba(253,224,71,0.25); top:30%; left:50%; animation:blob3 11s ease-in-out infinite; }

        /* ── SHAPES ── */
        @keyframes drift1 { 0%,100%{transform:translateY(0) rotate(0deg);}50%{transform:translateY(-30px) rotate(10deg);} }
        @keyframes drift2 { 0%,100%{transform:translateY(0) translateX(0);}50%{transform:translateY(20px) translateX(15px);} }
        @keyframes floatC { 0%,100%{transform:translateY(0);opacity:0.5;}50%{transform:translateY(-18px);opacity:0.8;} }

        .shape { position:fixed; pointer-events:none; z-index:0; }
        .sq1{width:60px;height:60px;background:rgba(255,255,255,0.4);border:1.5px solid rgba(255,255,255,0.65);border-radius:14px;top:10%;left:6%;backdrop-filter:blur(4px);animation:drift1 7s ease-in-out infinite;}
        .sq2{width:40px;height:40px;background:rgba(251,191,36,0.25);border:1.5px solid rgba(251,191,36,0.45);border-radius:10px;bottom:20%;right:6%;animation:drift2 9s ease-in-out infinite;}
        .sq3{width:28px;height:28px;background:rgba(249,115,22,0.18);border:1.5px solid rgba(249,115,22,0.35);border-radius:8px;top:6%;right:16%;animation:drift1 8s ease-in-out infinite;}
        .c1{width:16px;height:16px;background:rgba(249,115,22,0.45);border-radius:50%;top:28%;right:4%;animation:floatC 5s ease-in-out infinite;}
        .c2{width:10px;height:10px;background:rgba(251,191,36,0.55);border-radius:50%;bottom:28%;left:22%;animation:floatC 7s ease-in-out infinite 1s;}

        /* ── CONTENT ── */
        .rooms-content {
          position: relative;
          z-index: 1;
          padding: 24px 32px 48px;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* ── HEADER ── */
        .rooms-header {
          position: relative;
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.6);
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 36px;
          box-shadow: 0 4px 24px rgba(194,65,12,0.08), 0 1px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9);
        }

        .header-shine {
          height: 3px;
          background: linear-gradient(90deg, #fbbf24, #f97316, #ea580c, #f97316, #fbbf24);
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }
        @keyframes shimmer { 0%{background-position:-200% center;}100%{background-position:200% center;} }

        .header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          padding: 16px 24px;
        }

        /* Left */
        .header-left { display:flex; align-items:center; gap:14px; }

        .logo-mark {
          width: 42px; height: 42px; border-radius: 12px;
          background: linear-gradient(135deg, #fbbf24, #f97316);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(249,115,22,0.35);
        }
        .logo-mark span {
          font-family: 'Playfair Display', serif;
          font-weight: 800; font-size: 20px; color: white; line-height: 1;
        }
        .logo-name {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700;
          color: #1c1917; letter-spacing: -0.3px; line-height: 1;
        }
        .logo-name em { font-style:normal; color:#f97316; }

        /* Greeting + avatar */
        .user-block { display:flex; align-items:center; gap:10px; }
        .user-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          background: linear-gradient(135deg, #fbbf24, #f97316);
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700; font-size: 13px; color: white;
          flex-shrink: 0;
          box-shadow: 0 3px 10px rgba(249,115,22,0.3);
        }
        .user-text {}
        .user-greeting {
          font-size: 11px; color: #a8a29e;
          text-transform: uppercase; letter-spacing: 0.05em; font-weight: 500;
        }
        .user-name {
          font-size: 16px; font-weight: 700; color: #1c1917;
          letter-spacing: -0.2px; line-height: 1.2;
        }

        /* Center stats */
        .header-center { display:flex; align-items:center; gap:20px; }
        .stat { display:flex; flex-direction:column; align-items:center; }
        .stat-value { font-size:20px; font-weight:700; color:#f97316; line-height:1; }
        .stat-label { font-size:10px; color:#a8a29e; text-transform:uppercase; letter-spacing:0.06em; margin-top:2px; }
        .stat-divider { width:1px; height:32px; background:rgba(228,228,231,0.8); border-radius:99px; }
        .status-dot { width:8px; height:8px; border-radius:50%; background:#34d399; animation:pulse 2s ease-in-out infinite; display:inline-block; margin-right:5px; }
        @keyframes pulse { 0%,100%{opacity:1;}50%{opacity:0.4;} }
        .status-text { font-size:13px; font-weight:600; color:#059669; }

        /* Right actions */
        .header-right { display:flex; align-items:center; gap:10px; }

        .btn-primary {
          display: flex; align-items: center; gap: 6px;
          padding: 9px 18px; border-radius: 12px; border: none;
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white; font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 600; cursor: pointer;
          box-shadow: 0 3px 10px rgba(234,88,12,0.3);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .btn-primary:hover { transform:translateY(-1px); box-shadow:0 6px 18px rgba(234,88,12,0.38); }
        .btn-primary:active { transform:scale(0.97); }

        .btn-logout {
          padding: 9px 16px; border-radius: 12px;
          border: 1.5px solid rgba(220,38,38,0.2);
          background: rgba(254,226,226,0.5);
          color: #dc2626; font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 600; cursor: pointer;
          transition: background 0.15s, border-color 0.15s, transform 0.15s;
          display: flex; align-items: center; gap: 5px;
        }
        .btn-logout:hover { background:rgba(254,226,226,0.9); border-color:rgba(220,38,38,0.4); transform:translateY(-1px); }
        .btn-logout:active { transform:scale(0.97); }

        /* ── SECTION LABEL ── */
        .section-label {
          font-size: 11px; font-weight: 600; color: #a8a29e;
          text-transform: uppercase; letter-spacing: 0.08em;
          margin-bottom: 16px;
        }

        /* ── ROOM CARDS ── */
        .rooms-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 18px;
        }

        .room-card {
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.65);
          border-radius: 18px;
          padding: 22px;
          cursor: pointer;
          display: flex; flex-direction: column; justify-content: space-between;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 12px rgba(194,65,12,0.06), 0 1px 3px rgba(0,0,0,0.04);
          animation: cardIn 0.4s cubic-bezier(0.16,1,0.3,1) both;
        }
        .room-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(194,65,12,0.12), 0 2px 8px rgba(0,0,0,0.06);
        }

        @keyframes cardIn {
          from { opacity:0; transform:translateY(16px) scale(0.98); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }

        .room-card-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:16px; }

        .room-card-icon {
          width: 40px; height: 40px; border-radius: 11px;
          background: linear-gradient(135deg, rgba(251,191,36,0.25), rgba(249,115,22,0.2));
          border: 1px solid rgba(251,191,36,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
        }

        .room-leave-btn {
          padding: 4px 10px; border-radius: 8px;
          border: 1px solid rgba(220,38,38,0.15);
          background: rgba(254,226,226,0.4);
          color: #dc2626; font-size: 11px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.15s, border-color 0.15s;
        }
        .room-leave-btn:hover { background:rgba(254,226,226,0.85); border-color:rgba(220,38,38,0.35); }

        .room-name {
          font-family: 'Playfair Display', serif;
          font-size: 17px; font-weight: 700;
          color: #1c1917; letter-spacing: -0.2px;
          margin-bottom: 6px; line-height: 1.3;
        }

        .room-meta { font-size: 12px; color: #a8a29e; font-weight: 400; }

        .room-card-bottom {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 14px;
          border-top: 1px solid rgba(228,228,231,0.6);
          margin-top: 14px;
        }

        .room-badge {
          font-size: 11px; font-weight: 600;
          padding: 3px 10px; border-radius: 99px;
          background: rgba(251,191,36,0.18);
          border: 1px solid rgba(251,191,36,0.4);
          color: #92400e;
        }

        .room-open {
          font-size: 13px; color: #a8a29e; font-weight: 500;
          transition: color 0.15s, transform 0.15s;
          display: inline-block;
        }
        .room-card:hover .room-open { color: #f97316; transform: translateX(3px); }

        /* ── EMPTY STATE ── */
        .empty-state {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; text-align: center;
          padding: 80px 24px;
          background: rgba(255,255,255,0.65);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.6);
          border-radius: 24px;
          box-shadow: 0 4px 24px rgba(194,65,12,0.06);
        }
        .empty-icon {
          width: 64px; height: 64px; border-radius: 18px;
          background: linear-gradient(135deg, rgba(251,191,36,0.2), rgba(249,115,22,0.15));
          border: 1px solid rgba(251,191,36,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 28px; margin-bottom: 20px;
        }
        .empty-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 700; color: #1c1917;
          margin-bottom: 8px; letter-spacing: -0.2px;
        }
        .empty-sub { font-size: 14px; color: #a8a29e; max-width: 260px; line-height: 1.6; margin-bottom: 24px; }
      `}</style>

      <div className="atrio-rooms">

        {/* Blobs */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        {/* Shapes */}
        <div className="shape sq1" /><div className="shape sq2" />
        <div className="shape sq3" />
        <div className="shape c1" /><div className="shape c2" />

        <div className="rooms-content">

          {/* ── HEADER ── */}
          <header className="rooms-header">
            <div className="header-shine" />
            <div className="header-inner">

              {/* Left: logo + user */}
              <div className="header-left">
                <div className="logo-mark"><span>A</span></div>
                <div className="logo-name">Atri<em>o</em></div>
                <div style={{ width:"1px", height:"32px", background:"rgba(228,228,231,0.7)", margin:"0 4px" }} />
                <div className="user-block">
                  <div className="user-avatar">{getInitials(username)}</div>
                  <div className="user-text">
                    <div className="user-greeting">{getGreeting()}</div>
                    <div className="user-name">{username || "Guest"}</div>
                  </div>
                </div>
              </div>

              {/* Center: stats */}
              <div className="header-center">
                <div className="stat">
                  <span className="stat-value">{rooms.length}</span>
                  <span className="stat-label">Rooms</span>
                </div>
                <div className="stat-divider" />
                <div className="stat">
                  <span className="stat-value" style={{ fontSize:"13px", display:"flex", alignItems:"center" }}>
                    <span className="status-dot" />
                    <span className="status-text">Active</span>
                  </span>
                  <span className="stat-label">Status</span>
                </div>
              </div>

              {/* Right: actions */}
              <div className="header-right">
                <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                  <span style={{ fontSize:"16px", lineHeight:1 }}>+</span> New Room
                </button>
                <button className="btn-logout" onClick={handleLogout}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Logout
                </button>
              </div>

            </div>
          </header>

          {/* ── ROOMS ── */}
          {rooms.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏛</div>
              <h2 className="empty-title">No rooms yet</h2>
              <p className="empty-sub">Create your first room to start collaborating with your team in real time.</p>
              <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                <span style={{ fontSize:"16px", lineHeight:1 }}>+</span> Create a Room
              </button>
            </div>
          ) : (
            <>
              <p className="section-label">{rooms.length} room{rooms.length !== 1 ? "s" : ""} · your workspace</p>
              <div className="rooms-grid">
                {rooms.map((room, i) => (
                  <div
                    key={room._id}
                    className="room-card"
                    style={{ animationDelay: `${i * 0.06}s` }}
                    onClick={() => handleRoomClick(room._id)}
                  >
                    <div>
                      <div className="room-card-top">
                        <div className="room-card-icon">🏛</div>
                        <button
                          className="room-leave-btn"
                          onClick={(e) => { //  as this is a smaller button inside a smaller button we need to stop propagation 
                            // to prevent the click for opening the room as well as opening the leave modal 
                            e.stopPropagation();
                            setRoomToLeave(room._id);
                            setShowLeaveModal(true);
                          }}
                        >
                          Leave
                        </button>
                      </div>
                      <div className="room-name">{room.name}</div>
                      <div className="room-meta">
                        {room.members?.length || 1} collaborator{(room.members?.length || 1) !== 1 ? "s" : ""}
                      </div>
                    </div>

                    <div className="room-card-bottom">
                      <span className="room-badge">Collaborative</span>
                      <span className="room-open">Open →</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </div>

      {/* ── MODALS ── */}
      <CreateRoomModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateRoom}
      />
      <LeaveRoomModal
        show={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onLeave={() => handleLeaveRoom(roomToLeave)}
      />
    </>
  );
}

export default Rooms;