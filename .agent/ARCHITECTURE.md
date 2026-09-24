# Atrio Architecture

> Atrio engineering documentation.
> This document describes the current repository architecture and/or agent rules.
> Update this document when the corresponding architecture changes.

---

## 1. System Overview

Atrio uses a dual-channel hybrid architecture combining stateless RESTful HTTP APIs with persistent, bidirectional WebSocket connections (Socket.io).

```text
                  ┌────────────────────────────────────────────────────────┐
                  │                 React 18 SPA Client                    │
                  │   • React Router DOM v7 (/login, /rooms, /rooms/:id)   │
                  │   • UI: Tailwind CSS + Framer Motion Spring Physics    │
                  │   • Optimistic UI with Socket Reconciliation           │
                  └───────────────┬────────────────────────┬───────────────┘
                                  │                        │
                      HTTP REST   │                        │ WebSocket
                   (Axios Bearer) │                        │ (Socket.io Handshake)
                                  ▼                        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           Express 5 Backend                            │
│ ┌──────────────────────────────────────┐ ┌───────────────────────────┐ │
│ │              REST API                │ │     Socket.io Server      │ │
│ │  /api/auth   → Signup / Login / Gate │ │  JWT Handshake Auth       │ │
│ │  /api/rooms  → Create / List / Inv   │ │  join_room / leave_room   │ │
│ │  /api/notes  → CRUD + Socket Emit    │ │  note_editing_start/stop  │ │
│ │  /api/rooms/:id/tasks → CRUD + Socket│ │  Presence Map (RAM Map)   │ │
│ └──────────────────┬───────────────────┘ └─────────────┬─────────────┘ │
│                    │                                   │               │
│                    ▼                                   ▼               │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │                   Security & Authorization Layer                   │ │
│ │  - req.userId extraction via authMiddleware                        │ │
│ │  - Password change token invalidation (passwordChangedAt)          │ │
│ │  - Multi-tenant room isolation: room.members.includes(req.userId)  │ │
│ └──────────────────────────────────┬─────────────────────────────────┘ │
└────────────────────────────────────┼───────────────────────────────────┘
                                     │ Mongoose 8 ODM
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                            MongoDB Database                            │
│    Collections: Users · Rooms · Notes · Tasks                          │
│    Cascade Hook: Room.findOneAndDelete -> Note/Task cascade purge      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture

* **Framework & Build:** React 18.2.0 (`frontend/package.json`), initialized with Create React App / `react-scripts 5.0.1`, Tailwind CSS 3.4.17, PostCSS 8.
* **Routing:** `react-router-dom` v7.6.3 (`frontend/src/App.jsx`).
  * `/login` &rarr; [`Login.jsx`](file:///frontend/src/pages/Login.jsx)
  * `/signup` &rarr; [`Signup.jsx`](file:///frontend/src/pages/Signup.jsx)
  * `/rooms` &rarr; Wrapped in `PrivateRoute`, renders [`Rooms.jsx`](file:///frontend/src/pages/Rooms.jsx)
  * `/rooms/:roomId` &rarr; Wrapped in `PrivateRoute`, renders [`RoomView.jsx`](file:///frontend/src/pages/RoomView.jsx)
* **Component Breakdown:**
  * [`RoomView.jsx`](file:///frontend/src/pages/RoomView.jsx): Core workspace orchestrator. Manages note/task state, active socket listeners, and modal toggles.
  * [`RoomHeader.jsx`](file:///frontend/src/pages/rooms/RoomHeader.jsx): Room title, member avatars, live presence count, task toggle button, invite trigger.
  * [`NotesBoard.jsx`](file:///frontend/src/pages/rooms/NotesBoard.jsx): Grid container for sticky notes with layout animations and FAB add button.
  * [`NoteCard.jsx`](file:///frontend/src/components/notes/NoteCard.jsx): Note presentation with deterministic rotation angle, double-click inline editor, and live `"Editing..."` peer badge.
  * [`TaskSidebar.jsx`](file:///frontend/src/pages/rooms/TaskSidebar.jsx): Animated slide-out drawer (`Framer Motion`), task completion progress bar, task list, and input field.
  * Modals: [`CreateRoomModal.jsx`](file:///frontend/src/components/modals/CreateRoomModal.jsx), [`LeaveRoomModal.jsx`](file:///frontend/src/components/modals/LeaveRoomModal.jsx), [`NoteEditorModal.jsx`](file:///frontend/src/components/modals/NoteEditorModal.jsx), [`InviteModal.jsx`](file:///frontend/src/components/modals/InviteModal.jsx), [`BetaModal.jsx`](file:///frontend/src/pages/rooms/BetaModal.jsx).
* **Client Networking:**
  * [`utils/api.js`](file:///frontend/src/utils/api.js): Axios singleton with automatic `Authorization: Bearer <token>` request interceptor and 401 response interceptor.
  * [`sockets.js`](file:///frontend/src/sockets.js): Socket.io-client singleton with `connectSocket()` configuring `{ auth: { token } }`.
* **State & Optimistic Updates:** State lives primarily in `RoomView.jsx` (`notes`, `tasks`, `onlineUsers`, `editingUsers`). Optimistic updates insert items with temporary IDs (`temp-<timestamp>`), replaced upon server response and socket event deduplication.

---

## 3. Backend Architecture

* **Runtime & Framework:** Node.js (ES Modules, `"type": "module"`), Express 5.2.1 (`backend/server.js`).
* **HTTP Server & Sockets:** Wraps Express in Node's native `http.createServer(app)` to allow Socket.io to share the HTTP port.
* **CORS Allowlist:**
  * `http://localhost:3000` (React local dev)
  * `http://localhost:5173` (Vite local dev)
  * `https://notesy-sumedh-gaikwads-projects.vercel.app`
  * `https://atrio-gamma.vercel.app`
  * `https://atrio.sumedhgaikwad.com`
* **Middleware Pipeline:**
  * `cors(...)` with credentials enabled.
  * `express.json()` body parser.
  * [`middleware/auth.js`](file:///backend/middleware/auth.js): JWT bearer extraction, signature validation, database user lookup, and `passwordChangedAt` timestamp invalidation check.
* **Route Mounting:**
  * `/api/auth` &rarr; [`routes/Auth.js`](file:///backend/routes/Auth.js) (signup with capacity gating, login)
  * `/api/rooms` &rarr; [`routes/rooms.js`](file:///backend/routes/rooms.js) (create, list, invite, leave)
  * `/api/rooms` &rarr; [`routes/tasks.js`](file:///backend/routes/tasks.js) (task CRUD scoped under `/:roomId/tasks`)
  * `/api/notes` &rarr; [`routes/notes.js`](file:///backend/routes/notes.js) (note CRUD)
  * `/api/health` &rarr; Health check endpoint (`{ status: "ok" }`)
* **Realtime Sockets:** [`socket.js`](file:///backend/socket.js) initializes Socket.io with handshake JWT verification and presence management.

---

## 4. Database Architecture

* **Database Engine:** MongoDB via Mongoose 8.16.3 (`backend/models/`).
* **Collections & Schemas:**

### 1. `User` Collection (`models/User_Model.js`)
* `username`: String (required, unique, trim, lowercase)
* `email`: String (required, unique, trim, lowercase)
* `password`: String (required, bcrypt hash)
* `passwordChangedAt`: Date (timestamp for token invalidation)
* `timestamps`: `createdAt`, `updatedAt`
* *Hooks:* `pre("save")` hashes password with salt 10; sets `passwordChangedAt = Date.now() - 1000` if modified on existing document.

### 2. `Room` Collection (`models/room.js`)
* `name`: String (required, trim)
* `createdBy`: ObjectId (ref: `User`, required)
* `members`: `[ObjectId]` (ref: `User`)
* `timestamps`: `createdAt`, `updatedAt`
* *Cascade Hook:* `pre("findOneAndDelete")` triggers cascade deletion of notes and tasks associated with the room.
  > **Discrepancy Note:** The hook in `room.js` queries `{ roomId: room._id }` on Note/Task models, while Note and Task schemas name the reference field `room`.

### 3. `Note` Collection (`models/note.js`)
* `title`: String (required, trim)
* `content`: String (required, trim)
* `user`: ObjectId (ref: `User`, required)
* `room`: ObjectId (ref: `Room`, required)
* `createdAt`: Date (default: `Date.now`)

### 4. `Task` Collection (`models/task.js`)
* `room`: ObjectId (ref: `Room`, required, indexed: `true`)
* `text`: String (required, trim, maxlength: 200)
* `completed`: Boolean (default: `false`)
* `createdBy`: ObjectId (ref: `User`, required)
* `completedAt`: Date (default: `null`)
* `timestamps`: `createdAt`, `updatedAt`

---

## 5. Authentication Flow

```text
1. REST Authentication Flow:
   Client POST /api/auth/login { email, password }
       ↓
   Server verifies user exists & bcrypt.compare(password, user.password)
       ↓
   Server signs JWT: jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "2h" })
       ↓
   Client stores token in localStorage("token") and username in localStorage("username")
       ↓
   Subsequent REST requests attach `Authorization: Bearer <token>`
       ↓
   authMiddleware verifies JWT signature, extracts `req.userId = decoded.userId`
       ↓
   authMiddleware queries User by `req.userId`
       ↓
   Verifies: !user.passwordChangedAt || (decoded.iat * 1000 >= user.passwordChangedAt.getTime())
       ↓
   Attaches `req.user = user`, calls `next()`

2. Socket.io Authentication Flow:
   Client invokes `connectSocket()` -> passes `socket.auth = { token: localStorage.getItem("token") }`
       ↓
   ioInstance.use() middleware intercepts handshake
       ↓
   jwt.verify(token, JWT_SECRET) extracts `decoded.userId`
       ↓
   Sets `socket.userId = decoded.userId`
       ↓
   Connection accepted (or next(new Error("Authentication error")) if invalid)
```

---

## 6. Realtime Architecture

### In-Memory Presence & Multi-Tab Tracking
Presence is tracked per room using a nested RAM Map in `backend/socket.js`:
```text
roomOnlineUsers = Map<
  roomId: string,
  Map<userId: string, socketCount: number>
>
```

* **Multi-Tab Support:** If a user opens 3 tabs to the same room, `socketCount` is incremented to 3. The user appears online once.
* **Disconnect / Leave:** Disconnecting decrements `socketCount`. Only when `socketCount <= 0` is the user removed from the room presence list and `online_users_update` broadcast to the room. If no users remain in a room, the room key is purged from memory.

### Realtime Event Catalog

| Event Name | Direction | Payload | Purpose |
| :--- | :--- | :--- | :--- |
| `join_room` | Client &rarr; Server | `roomId` (string) | Authenticates room membership in MongoDB and joins socket room channel `roomId`. |
| `leave_room` | Client &rarr; Server | `roomId` (string) | Leaves room channel and triggers presence decrement. |
| `online_users_update`| Server &rarr; Client | `string[]` (array of user IDs) | Broadcasts unique active user IDs in the room. |
| `note_editing_start` | Client &rarr; Server | `{ roomId, noteId }` | User started editing a note. |
| `note_editing_stop`  | Client &rarr; Server | `{ roomId, noteId }` | User stopped editing a note. |
| `note_editing_update`| Server &rarr; Peer | `{ noteId, userId, isEditing }` | Notifies peer clients to display the editing badge/ring. |
| `note_created` | Server &rarr; Room | `Note` (populated with `user.username`)| Emitted after `POST /api/notes/add`. |
| `note_updated` | Server &rarr; Room | `Note` (populated with `user.username`)| Emitted after `PUT /api/notes/update/:id`. |
| `note_deleted` | Server &rarr; Room | `noteId` (string) | Emitted after `DELETE /api/notes/delete/:id`. |
| `task_created` | Server &rarr; Room | `Task` (populated with `createdBy.username`)| Emitted after `POST /api/rooms/:roomId/tasks`. |
| `task_updated` | Server &rarr; Room | `Task` (populated with `createdBy.username`)| Emitted after `PUT /api/rooms/:roomId/tasks/:taskId`. |
| `task_deleted` | Server &rarr; Room | `taskId` (string) | Emitted after `DELETE /api/rooms/:roomId/tasks/:taskId`. |
| `member_added` | Server &rarr; Room | `{ userId, username }` | Emitted when a collaborator is invited to the room. |
| `memberLeft`   | Server &rarr; Room | `{ roomId, userId }` | Emitted when a collaborator leaves the room. |
| `socket_error` | Server &rarr; Client | `{ message: string }` | Emitted on unauthorized or invalid room joins. |

---

## 7. Major Data Flows

### 1. Room Creation
1. Client calls `api.post("/rooms/create", { name })`.
2. Backend creates `Room` document with `createdBy: req.userId` and `members: [req.userId]`.
3. Returns `201 Created` with the room object.
4. Client prepends new room to local rooms array.

### 2. Note Creation & Sync
1. Client generates `tempId = "temp-" + Date.now()` and optimistically prepends note to React state.
2. Client calls `api.post("/notes/add", { title, content, roomId })`.
3. Backend checks `Room.findOne({ _id: roomId, members: req.userId })`.
4. Backend persists `Note.create({ title, content, user: req.userId, room: roomId })`.
5. Backend populates `user.username`, accesses `getIO()`, and emits `note_created` to room channel.
6. Backend returns `201 Created` with populated note.
7. Active client replaces `tempId` with persisted note. Peer clients receive `note_created` via WebSocket and prepend to state.

### 3. Note Editing & Peer Indicator
1. User double-clicks a `NoteCard`.
2. Client sets `editingId = note._id` and emits `note_editing_start` via socket.
3. Server relays `note_editing_update` (`isEditing: true`) to peers in the room.
4. Peers display the `"Editing..."` tag and green highlight ring on that note card.
5. User clicks Save &rarr; client updates local state, calls `api.put("/notes/update/:id")`, and emits `note_editing_stop`.
6. Server broadcasts `note_updated` and `note_editing_update` (`isEditing: false`).

### 4. Task Creation & Progress Calculation
1. User types in `TaskSidebar` and hits Enter.
2. Client optimistically adds task with `tempId`.
3. Client calls `api.post("/rooms/:roomId/tasks", { text })`.
4. Backend verifies room membership, saves `Task`, populates `createdBy.username`, and emits `task_created` to room channel.
5. Client reconciles optimistic item with server response.
6. React recomputes `completedTasks`, `totalTasks`, and `taskProgress` percentage dynamically.

---

## 8. Domain Map

```text
User
 │
 ├── (owns/belongs to)
 │
 └── Room (members: [User._id], createdBy: User._id)
      │
      ├── Note (room: Room._id, user: User._id)
      │
      └── Task (room: Room._id, createdBy: User._id)
```

---

## 9. Architectural Invariants

* **Multi-Tenant Room Isolation:** No user may read, create, update, or delete a note or task without verified membership in the parent room's `members` array.
* **Single HTTP/Socket Port:** The Express application and Socket.io server bind to the same HTTP server instance.
* **Dual Persistence + Broadcast:** State-altering operations persist via HTTP REST and broadcast to collaborators via Socket.io.
* **Deterministic Card Tilt:** Card tilt variation is computed purely on the client via `getRotation(note._id)` with no database schema footprint.
