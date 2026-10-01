import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import useNotes from "../features/notes/hooks/useNotes";
import useRoom from "../features/rooms/hooks/useRoom";
import useTasks from "../features/tasks/hooks/useTasks";

import useRoomRealtime from "../features/realtime/hooks/useRoomRealtime";
import useTaskRealtime from "../features/realtime/hooks/useTaskRealtime";
import useNoteRealtime from "../features/realtime/hooks/useNoteRealtime";
import useRoomPresence from "../features/realtime/hooks/useRoomPresence";

import NoteEditorModal from "../features/notes/components/NoteEditorModal";
import InviteModal from "../components/modals/InviteModal";

import RoomHeader from "../features/rooms/components/RoomHeader";
import TaskSidebar from "../features/tasks/components/TaskSidebar";
import NotesBoard from "../features/notes/components/NotesBoard";
import BetaModal from "../components/modals/BetaModal";

import "../styles/room.css";

function RoomView() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  // ── local state ──
  const [showEditor, setShowEditor] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [showBetaNotice, setShowBetaNotice] = useState(false);

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
    fetchTasks,
    createTask,
    updateTask,
    deleteTask
  } = useTasks(roomId);

  // ── realtime ──
  useRoomRealtime({ roomId });

  useNoteRealtime({ setNotes });

  useTaskRealtime({ setTasks });

  const {
    onlineUsers,
    editingUsers
  } = useRoomPresence();

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
  const handleCreateNote = async (noteTitle, noteContent) => {
    if (!noteTitle?.trim() || !noteContent?.trim()) return;

    setShowEditor(false);
    await createNote(noteTitle, noteContent);
  };

  // ── room actions ──
  const handleAddMember = async (email) => {
    await addMember(email);
    setShowInvite(false);
  };

  // ── initial room data + beta notice ──
  useEffect(() => {
    fetchNotes();
    fetchRoom();
    fetchTasks();

    if (!localStorage.getItem("atrio_beta_seen")) {
      setShowBetaNotice(true);
    }
  }, [roomId]);

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
            createTask={createTask}
            updateTask={updateTask}
            deleteTask={deleteTask}
          />

          <NotesBoard
            notes={notes}
            showTasks={showTasks}
            saveEdit={saveEdit}
            deleteNote={deleteNote}
            roomId={roomId}
            editingUsers={editingUsers}
            currentUserId={currentUserId}
            setShowEditor={setShowEditor}
          />

        </div>
      </div>

      <NoteEditorModal
        show={showEditor}
        onClose={() => setShowEditor(false)}
        onSave={handleCreateNote}
      />

      <InviteModal
        show={showInvite}
        onClose={() => setShowInvite(false)}
        onInvite={handleAddMember}
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