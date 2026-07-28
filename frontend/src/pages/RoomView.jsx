import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { motion } from "framer-motion";
import socket, { connectSocket } from "../sockets";

import NoteEditorModal from "../components/modals/NoteEditorModal";
import InviteModal from "../components/modals/InviteModal";

import RoomHeader from "./rooms/RoomHeader";
import TaskSidebar from "./rooms/TaskSidebar";
import NotesBoard from "./rooms/NotesBoard";
import BetaModal from "./rooms/BetaModal";

import "../styles/room.css";

function RoomView() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [room, setRoom] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [editingUsers, setEditingUsers] = useState({});

  const [showEditor, setShowEditor] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [showBetaNotice, setShowBetaNotice] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const currentUserId = localStorage.getItem("userId");
  const currentUsername = localStorage.getItem("username");

  /* ── document title ── */
  useEffect(() => {
    if (room?.name) document.title = `${room.name} · Atrio`;
    return () => { document.title = "Atrio"; };
  }, [room?.name]);

  /* ── fetchers ── */
  const fetchNotes = async () => { const r = await api.get(`/rooms/${roomId}/notes`); setNotes(r.data); };
  const fetchRoom = async () => { const r = await api.get(`/rooms/${roomId}`); setRoom(r.data); };
  const fetchTasks = async () => { const r = await api.get(`/rooms/${roomId}/tasks`); setTasks(r.data); };

  /* ── note actions ── */
  const createNote = async () => {
    if (!title.trim() || !content.trim()) return;

    // optimistic UI → show note instantly before server confirms
    const tempId = "temp-" + Date.now();
    const optimisticNote = {
      _id: tempId,
      title: title.trim(),
      content: content.trim(),
      roomId,
      createdBy: { _id: currentUserId },
      isOptimistic: true
    };

    setNotes(prev => [optimisticNote, ...prev]);
    setTitle(""); setContent(""); setShowEditor(false);

    try {
      const res = await api.post("/notes/add", { title, content, roomId });

      // replace temp note with real one from backend
      setNotes(prev => prev.map(n => n._id === tempId ? res.data : n));
    } catch (err) {
      console.error(err);

      // rollback if failed
      setNotes(prev => prev.filter(n => n._id !== tempId));
    }
  };

  // NOTE:
  // you might have double optimistic updates because sockets already emit note_created
  // so both frontend optimistic + socket event may duplicate work

  const deleteNote = async (id) => {
    const prev = notes;
    setNotes(p => p.filter(n => n._id !== id));

    try {
      await api.delete(`/notes/delete/${id}`);
    } catch (err) {
      console.error(err);
      setNotes(prev); // rollback
    }
  };

  const saveEdit = async (id) => {
    const prev = notes;

    // optimistic update
    setNotes(p => p.map(n =>
      n._id === id ? { ...n, title: editTitle, content: editContent } : n
    ));

    setEditingId(null);

    try {
      await api.put(`/notes/update/${id}`, {
        title: editTitle,
        content: editContent
      });
    } catch (err) {
      console.error(err);
      setNotes(prev); // rollback
      setEditingId(null);
    }
  };

  const addMember = async () => {
    try {
      setInviteError("");

      await api.put(`/rooms/${roomId}/add-member`, {
        userEmail: inviteEmail
      });

      setInviteEmail("");
      setShowInvite(false);

      fetchRoom(); // refresh members
    } catch (err) {
      setInviteError(err.response?.data?.message || "Something went wrong.");
    }
  };

  /* ── socket ── */
  // socket is a way for server to communicate with frontend
  // enables real-time 2-way communication

  // sockets act like fast messengers
  // we listen to events and react instantly → gives real-time feel
  useEffect(() => {
    fetchNotes();
    fetchRoom();
    fetchTasks();

    connectSocket();

    const joinRoom = () => socket.emit("join_room", roomId);

    if (!localStorage.getItem("atrio_beta_seen")) {
      setShowBetaNotice(true);
    }

    if (socket.connected) joinRoom();
    socket.on("connect", joinRoom);

    socket.on("note_created", (note) => {
      setNotes(prev => {
        // avoid duplicate
        if (prev.some(n => n._id === note._id)) return prev;

        // replace optimistic note if exists
        const opt = prev.find(n => n.isOptimistic && n.title === note.title);
        if (opt) return prev.map(n => n._id === opt._id ? note : n);

        return [note, ...prev];
      });
    });

    socket.on("note_updated", (note) =>
      setNotes(prev => prev.map(n => n._id === note._id ? note : n))
    );

    socket.on("note_deleted", (noteId) =>
      setNotes(prev => prev.filter(n => n._id !== noteId))
    );

    socket.on("task_created", (task) => {
      setTasks(prev => {
        const match = prev.find(t =>
          t.isOptimistic &&
          t.text === task.text &&
          t.createdBy?._id === task.createdBy?._id
        );

        if (match) return prev.map(t => t._id === match._id ? task : t);

        if (!prev.some(t => t._id === task._id)) {
          return [task, ...prev.filter(t => !t.isOptimistic)];
        }

        return prev;
      });
    });

    socket.on("task_updated", (t) =>
      setTasks(prev => prev.map(p => p._id === t._id ? t : p))
    );

    socket.on("task_deleted", (id) =>
      setTasks(prev => prev.filter(t => String(t._id) !== String(id)))
    );

    socket.on("online_users_update", setOnlineUsers);

    socket.on("note_editing_update", ({ noteId, userId, isEditing }) => {
      setEditingUsers(prev => {
        const u = { ...prev };

        if (isEditing) u[noteId] = userId;
        else delete u[noteId];

        return u;
      });
    });

    return () => {
      socket.emit("leave_room", roomId);
      socket.off();
    };
  }, [roomId]);

  /* ── utils ── */
  const getRotation = (id) => {
    const seed = id.slice(-3);
    return ((parseInt(seed, 16) % 5) - 2) * 1.5;
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  /* ── render ── */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="room-root"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#fffbeb 0%,#fef3c7 35%,#fff7ed 65%,#ffedd5 100%)",
        position: "relative",
        overflowX: "hidden"
      }}
    >
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        <RoomHeader
          room={room}
          currentUsername={currentUsername}
          onlineUsers={onlineUsers}
          showTasks={showTasks}
          setShowTasks={setShowTasks}
          setShowInvite={setShowInvite}
          setShowBetaNotice={setShowBetaNotice}
          navigate={navigate}
        />

        <div style={{ display: "flex", flex: 1 }}>

          <TaskSidebar
            show={showTasks}
            setShowTasks={setShowTasks}//what
            room={room}
            tasks={tasks}
            setTasks={setTasks}
            roomId={roomId}
            currentUserId={currentUserId}
            isAdding={isAdding}
            setIsAdding={setIsAdding}
            taskProgress={taskProgress}
            completedTasks={completedTasks}
            totalTasks={totalTasks}
          />

          <NotesBoard
            notes={notes}
            showTasks={showTasks}
            editingId={editingId}
            setEditingId={setEditingId}
            editTitle={editTitle}
            setEditTitle={setEditTitle}
            editContent={editContent}
            setEditContent={setEditContent}
            saveEdit={saveEdit}
            deleteNote={deleteNote}
            getRotation={getRotation}
            roomId={roomId}
            editingUsers={editingUsers}
            socket={socket}
            currentUserId={currentUserId}
            setShowEditor={setShowEditor}
          />

        </div>
      </div>

      <NoteEditorModal
        show={showEditor}
        title={title}
        content={content}
        setTitle={setTitle}
        setContent={setContent}
        onClose={() => {
          setShowEditor(false);
          setTitle("");
          setContent("");
        }}
        onSave={createNote}
      />

      <InviteModal
        show={showInvite}
        inviteEmail={inviteEmail}
        setInviteEmail={setInviteEmail}
        onClose={() => setShowInvite(false)}
        onInvite={addMember}
        error={inviteError}
        setError={setInviteError}
      />

      <BetaModal
        show={showBetaNotice}
        onClose={() => setShowBetaNotice(false)}
        onConfirm={() => {
          localStorage.setItem("atrio_beta_seen", "true");
          setShowBetaNotice(false);
        }}
      />

    </motion.div>
  );
}

export default RoomView;