# Atrio — Features & User Workflows

## Feature 1: User Authentication & Controlled Beta Rollout

* **Purpose:** Secure user identity management with an early-access capacity limit.
* **User Flow:**
  1. User navigates to `/signup` and enters username, email, and password.
  2. If the beta capacity threshold is exceeded, the server returns HTTP 403 with a friendly capacity notice.
  3. Otherwise, user is created, credentials hashed with bcrypt, and user logs in via `/login`.
  4. Server issues a 2-hour JWT token stored in `localStorage`.
* **Frontend Implementation:** `frontend/src/pages/Signup.jsx`, `frontend/src/pages/Login.jsx`, `frontend/src/utils/api.js`.
* **Backend Implementation:** `backend/routes/Auth.js`, `backend/models/User_Model.js`.
* **Data Involved:** `User` collection (`username`, `email`, `password`, `passwordChangedAt`).
* **Current Status:** **READY & OPERATIONAL**.

---

## Feature 2: Multi-Room Workspace Management

* **Purpose:** Allow users to organize projects, teams, or study pods into isolated rooms.
* **User Flow:**
  1. Authenticated user views their rooms on `/rooms`.
  2. User clicks `+ New Room`, fills out the modal, and submits.
  3. Room card renders in grid showing active collaborators and room status.
  4. User can click `Open →` to enter or `Leave` to remove themselves. If all members leave, the room is deleted automatically.
* **Frontend Implementation:** `frontend/src/pages/Rooms.jsx`, `frontend/src/components/modals/CreateRoomModal.jsx`, `frontend/src/components/modals/LeaveRoomModal.jsx`.
* **Backend Implementation:** `backend/routes/rooms.js` (`/create`, `/myrooms`, `/:roomId/leave`).
* **Data Involved:** `Room` collection, `RoomSchema.pre("findOneAndDelete")`.
* **Current Status:** **READY & OPERATIONAL**.

---

## Feature 3: Real-Time Sticky Note Canvas (NotesBoard)

* **Purpose:** Synchronous canvas for capturing ideas, discussion notes, and documentation.
* **User Flow:**
  1. User enters `/rooms/:roomId` and sees the note grid.
  2. Clicking the floating action button (`+ FAB`) opens the note editor modal.
  3. Submitting triggers an optimistic note creation and an HTTP POST; the backend emits a Socket.io `note_created` event to all room participants.
  4. Double-clicking any note activates inline edit mode and emits `note_editing_start`, rendering an active "Editing..." badge and emerald focus ring on other participants' screens.
  5. Saving or canceling emits `note_editing_stop` and persists updates.
* **Frontend Implementation:** `frontend/src/pages/rooms/NotesBoard.jsx`, `frontend/src/components/notes/NoteCard.jsx`, `frontend/src/components/modals/NoteEditorModal.jsx`.
* **Backend Implementation:** `backend/routes/notes.js`, `backend/socket.js`.
* **Data Involved:** `Note` collection (`title`, `content`, `user`, `room`).
* **Current Status:** **READY & OPERATIONAL**.

---

## Feature 4: Live Task Management & Team Progress (TaskSidebar)

* **Purpose:** Track actionable deliverables with real-time checkbox status and completion metrics.
* **User Flow:**
  1. User toggles the task sidebar from the room header.
  2. Sidebar animates into view using spring physics (`framer-motion`).
  3. Typing a task into the bottom input and pressing `Enter` optimistically adds the task and broadcasts `task_created` via WebSocket.
  4. Toggling a checkbox updates the task, sets `completedAt`, re-sorts the list, and dynamically animates the team progress bar (`completedTasks / totalTasks * 100`).
* **Frontend Implementation:** `frontend/src/pages/rooms/TaskSidebar.jsx`.
* **Backend Implementation:** `backend/routes/tasks.js`.
* **Data Involved:** `Task` collection (`room`, `text`, `completed`, `createdBy`, `completedAt`).
* **Current Status:** **READY & OPERATIONAL**.

---

## Feature 5: In-Room Member Invitations & Live Presence

* **Purpose:** Add team members by email and visualize who is currently active in the room.
* **User Flow:**
  1. Room participant clicks `Invite` in the header, types a registered user's email, and submits.
  2. Backend adds the user to `room.members` via `$addToSet` and broadcasts `member_added`.
  3. Connected members see a live green status dot and count of active users in the room header updated via `online_users_update`.
* **Frontend Implementation:** `frontend/src/pages/rooms/RoomHeader.jsx`, `frontend/src/components/modals/InviteModal.jsx`.
* **Backend Implementation:** `backend/routes/rooms.js` (`PUT /:roomId/add-member`), `backend/socket.js`.
* **Data Involved:** `Room` collection (`members`), in-memory presence Map.
* **Current Status:** **READY & OPERATIONAL**.
