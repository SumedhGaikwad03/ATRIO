import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import socket from "../sockets";

import useNotes from "../features/notes/hooks/useNotes";
import useRoom from "../features/rooms/hooks/useRoom";
import useTasks from "../features/tasks/hooks/useTasks";

import useRoomRealtime from "../features/realtime/hooks/useRoomRealtime";
import useTaskRealtime from "../features/realtime/hooks/useTaskRealtime";
import useNoteRealtime from "../features/realtime/hooks/useNoteRealtime";
import useRoomPresence from "../features/realtime/hooks/useRoomPresence";

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

  // ── local state ──
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

  // ── notes ──
  const {
    notes,
    setNotes,
    fetchNotes,
    createNote,
    deleteNote,
    saveEdit
  } = useNotes(roomId);

  // ── room ──
  const {
    room,
    fetchRoom,
    addMember
  } = useRoom(roomId);

  // ── tasks ──
  const {
    tasks,
    setTasks,
    fetchTasks
  } = useTasks(roomId);

  // ── realtime ──
  useRoomRealtime({ roomId });

  useNoteRealtime({ setNotes });

  useTaskRealtime({ setTasks });

  useRoomPresence({
    setOnlineUsers,
    setEditingUsers
  });

  // ── current user ──
  const currentUserId = localStorage.getItem("userId");
  const currentUsername = localStorage.getItem("username");

  // ── document title ──
  useEffect(() => {
    if (room?.name) {
      document.title = `${room.name} · Atrio`;
    }

    return () => {
      document.title = "Atrio";
    };
  }, [room?.name]);

  // ── note actions ──
  const handleCreateNote = async () => {
    if (!title.trim() || !content.trim()) return;

    const noteTitle = title;
    const noteContent = content;

    setTitle("");
    setContent("");
    setShowEditor(false);

    await createNote(noteTitle, noteContent);
  };

  const handleSaveEdit = async (id) => {
    setEditingId(null);

    await saveEdit(
      id,
      editTitle,
      editContent
    );
  };

  // ── room actions ──
  const handleAddMember = async () => {
    try {
      setInviteError("");

      await addMember(inviteEmail);

      setInviteEmail("");
      setShowInvite(false);
    } catch (err) {
      setInviteError(
        err.response?.data?.message ||
        "Something went wrong."
      );
    }
  };

  // ── initial room data + beta notice ──
  useEffect(() => {
    fetchNotes();
    fetchRoom();
    fetchTasks();

    if (!localStorage.getItem("atrio_beta_seen")) {
      setShowBetaNotice(true);
    }

    return () => {
      socket.off();
    };
  }, [roomId]);

  // ── utils ──
  const getRotation = (id) => {
    const seed = id.slice(-3);

    return (
      (parseInt(seed, 16) % 5 - 2) * 1.5
    );
  };

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const totalTasks = tasks.length;

  const taskProgress =
    totalTasks > 0
      ? (completedTasks / totalTasks) * 100
      : 0;

  // ── render ──
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="room-root"
    >
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="room-layout">

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

        <div
          style={{
            display: "flex",
            flex: 1
          }}
        >

          <TaskSidebar
            show={showTasks}
            setShowTasks={setShowTasks}
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
            saveEdit={handleSaveEdit}
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
        onSave={handleCreateNote}
      />

      <InviteModal
        show={showInvite}
        inviteEmail={inviteEmail}
        setInviteEmail={setInviteEmail}
        onClose={() => setShowInvite(false)}
        onInvite={handleAddMember}
        error={inviteError}
        setError={setInviteError}
      />

      <BetaModal
        show={showBetaNotice}
        onClose={() => setShowBetaNotice(false)}
        onConfirm={() => {
          localStorage.setItem(
            "atrio_beta_seen",
            "true"
          );

          setShowBetaNotice(false);
        }}
      />

    </motion.div>
  );
}

export default RoomView;