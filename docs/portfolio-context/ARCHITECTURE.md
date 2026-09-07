# Atrio — Technical System Architecture

## 1. SYSTEM OVERVIEW

Atrio uses a hybrid architecture combining stateless RESTful HTTP APIs with persistent bi-directional WebSocket connections (Socket.io).

```text
┌────────────────────────────────────────────────────────┐
│                   React 18 Frontend                    │
│   (Rooms View · NotesBoard · TaskSidebar · Modals)     │
└───────────────┬────────────────────────┬───────────────┘
                │ HTTP REST (Axios)      │ WebSocket (Socket.io)
                │ JWT Bearer Auth        │ Handshake Auth
                ▼                        ▼
┌────────────────────────────────────────────────────────┐
│                   Express 5 Backend                    │
│ ┌───────────────────────────┐ ┌──────────────────────┐ │
│ │       REST Routes         │ │   Socket.io Server   │ │
│ │  /api/auth · /api/rooms   │ │  JWT Verification    │ │
│ │  /api/notes · /api/tasks  │ │  Presence Map (RAM)  │ │
│ └─────────────┬─────────────┘ └──────────┬───────────┘ │
│               │                          │             │
│               ▼                          ▼             │
│ ┌────────────────────────────────────────────────────┐ │
│ │           Auth & Room Membership Security          │ │
│ │  - req.userId injection                            │ │
│ │  - passwordChangedAt token validation              │ │
│ │  - room.members.includes(req.userId) verification  │ │
│ └─────────────────────────┬──────────────────────────┘ │
└───────────────────────────┼────────────────────────────┘
                            │ Mongoose 8 ODM
                            ▼
┌────────────────────────────────────────────────────────┐
│                   MongoDB Database                     │
│    Collections: Users · Rooms · Notes · Tasks          │
│    (Pre-hook cascade deletion: Room -> Notes/Tasks)    │
└────────────────────────────────────────────────────────┘
```

---

## 2. DUAL-CHANNEL COMMUNICATION FLOW

### 1. HTTP REST Channel
* **Purpose:** Initial workspace state hydration, persistent database mutations (CRUD), and authentication flows.
* **Axios Interceptors:**
  * Request interceptor automatically attaches `Authorization: Bearer <token>`.
  * Response interceptor catches `401 Unauthorized` responses, clears local storage, and redirects to `/login`.

### 2. WebSocket Channel (Socket.io)
* **Purpose:** Real-time presence tracking, collaborative editing status indicators, and instantaneous state propagation to peer clients in the same room.
* **Handshake Security:**
  * Client connects with `{ auth: { token: localStorage.getItem("token") } }`.
  * Server middleware verifies the JWT against `process.env.JWT_SECRET` and attaches `socket.userId = decoded.userId`.
  * Sockets without valid tokens are rejected before connection completion.

---

## 3. REAL-TIME PRESENCE & MULTI-CONNECTION MANAGEMENT

Presence tracking handles multi-tab scenarios where a single user opens multiple tabs to the same room.

```text
Room Presence Memory Structure:
roomOnlineUsers = Map<
  roomId: string,
  Map<userId: string, socketCount: number>
>
```

### Connection Flow:
1. Client emits `join_room(roomId)`.
2. Backend verifies room membership in MongoDB:
   ```javascript
   const room = await Room.findOne({ _id: roomId, members: socket.userId }).lean();
   ```
3. If verified, socket joins Socket.io room channel `roomId.toString()`.
4. The user's `socketCount` is incremented.
5. Server broadcasts `online_users_update` containing an array of unique active `userId` strings.

### Disconnection Flow:
1. Upon `disconnect` or `leave_room`, `socketCount` is decremented.
2. If `socketCount === 0`, `userId` is removed from the room's presence map.
3. If the room has 0 online users, the room entry is purged from RAM.
4. An updated `online_users_update` is broadcast to remaining room participants.

---

## 4. REST-TO-SOCKET BROADCAST PATTERN

When a state-altering mutation occurs via HTTP (e.g., adding a note or toggling a task), the backend executes a unified persistence and broadcast pattern:

```text
HTTP POST /api/notes/add
   ↓
Verify authMiddleware & req.userId
   ↓
Verify room membership: Room.findOne({ _id: roomId, members: req.userId })
   ↓
Persist Note in MongoDB: Note.create({ title, content, user: req.userId, room: roomId })
   ↓
Populate User details: note.populate("user", "username")
   ↓
Access Socket Singleton: const io = getIO();
   ↓
Broadcast to Room Channel: io.to(roomId).emit("note_created", populatedNote)
   ↓
Return HTTP 201 Created to caller
```

---

## 5. FRONTEND STATE SYNCHRONIZATION & OPTIMISTIC UI

To ensure zero perceived latency, the React client implements optimistic state updates paired with server and socket reconciliation:

1. **Optimistic Insert:**
   * Client generates a temporary ID: `tempId = "temp-" + Date.now()`.
   * Note/task is immediately inserted into local React state with `{ isOptimistic: true }`.
2. **HTTP Reconciliation:**
   * Upon successful API response, the item with `_id === tempId` is replaced with the real document from the server.
3. **Socket Deduplication:**
   * When `socket.on("note_created")` receives the event:
     * If the ID is already in local state, it is ignored.
     * If an optimistic note with matching title exists, it is replaced with the socket payload.
4. **Error Rollback:**
   * If the HTTP request fails, the optimistic item is removed from state.
