# Engineering Rules & Architectural Invariants

> Atrio engineering documentation.
> This document describes the current repository architecture and/or agent rules.
> Update this document when the corresponding architecture changes.

---

## 1. General Rules

1. **Inspect Before Modifying:** Never assume the presence of a library, pattern, or route. Inspect actual files in `backend/` and `frontend/` first.
2. **Preserve Existing Patterns:** Use ES modules in backend (`import`/`export`), standard React functional components with hooks in frontend, and Mongoose schema models.
3. **No Speculative Abstractions:** Do not introduce premature design patterns, service layers, or generic abstractions unless explicitly requested.
4. **No Unrelated Refactoring:** Do not reformat entire files, rename unrelated variables, or rewrite working modules as side-effects of a task.
5. **Small & Reversible Diffs:** Keep changes minimal, isolated, testable, and strictly scoped.
6. **Preserve Functional Behavior:** Never break existing features, UI flows, or API responses while adding new functionality.

---

## 2. Architectural Boundaries & Layering

Atrio follows a practical 5-tier architecture:

```text
React 18 UI (Components & Modals)
       ↓
Client Network Layer (utils/api.js & sockets.js)
       ↓
Express 5 Application Entry (backend/server.js)
       ↓
Route Handlers & Sockets Engine (backend/routes/ & backend/socket.js)
       ↓
Mongoose 8 Data Models (backend/models/)
       ↓
MongoDB Document Store
```

### Invariants:
* **Separation of Concerns:** Business logic and authorization reside within route handlers (`backend/routes/`) and socket event listeners (`backend/socket.js`).
* **Singleton Sockets:** Sockets must always be accessed on the server via `getIO()` from `backend/socket.js` rather than creating new `Server` instances.
* **Axios Singleton:** Frontend HTTP requests must flow through the preconfigured `api` instance in `frontend/src/utils/api.js` to ensure JWT Bearer header injection and 401 handling.

---

## 3. API & Controller Rules

1. **Authentication:** All protected routes must mount `authMiddleware` from `backend/middleware/auth.js`.
2. **Room-Scoped Multi-Tenant Security:** Every route operating on a room, note, or task must explicitly verify that `req.userId` is present in `room.members`.
   ```javascript
   const room = await Room.findOne({
     _id: roomId, // or note.room / task.room
     members: req.userId
   });
   if (!room) {
     return res.status(403).json({ message: "Access denied" });
   }
   ```
3. **Request Validation:**
   * String inputs must be trimmed and validated against empty/whitespace values.
   * ObjectIds must be validated using `mongoose.Types.ObjectId.isValid(id)` before querying.
4. **Response Contracts:**
   * Successful mutations that emit real-time events must populate user details (e.g., `.populate("user", "username")` or `.populate("createdBy", "username")`) before broadcasting and returning JSON.
   * Successful deletion must return HTTP 204 No Content or a clean `{ message: "..." }` payload.
   * Errors must consistently return an appropriate HTTP status code (`400`, `401`, `403`, `404`, `500`) with `{ message: "<descriptive message>" }`.

---

## 4. Realtime (Socket.io) Rules

Socket.io is a core functional contract in Atrio, not an optional enhancement.

1. **Handshake Verification:** Sockets must pass authentication during handshake (`socket.handshake.auth.token`). Sockets without valid JWTs are rejected.
2. **Room Isolation:** Socket broadcasts must always be scoped to the room channel using `io.to(roomId.toString()).emit(...)` or `socket.to(roomKey).emit(...)`. Never broadcast room-specific state globally via `io.emit(...)`.
3. **Event Symmetry:** Every event emitted by the server must have corresponding client handling, and vice versa:
   * Note Events: `note_created`, `note_updated`, `note_deleted`, `note_editing_start`, `note_editing_stop`, `note_editing_update`.
   * Task Events: `task_created`, `task_updated`, `task_deleted`.
   * Room & Presence Events: `join_room`, `leave_room`, `online_users_update`, `member_added`, `memberLeft`.
4. **Dual Broadcast Pattern:** When a persistent REST mutation occurs (e.g. `POST /api/notes/add`), the backend route must persist the document, populate user relations, and emit the socket event to notify peer clients in the room.

---

## 5. Database & Model Rules

1. **Schema Authority:** Models are defined in `backend/models/`:
   * `User_Model.js` (`User` collection)
   * `room.js` (`Room` collection)
   * `note.js` (`Note` collection)
   * `task.js` (`Task` collection)
2. **Cascade Deletion:** The `Room` model defines a `pre("findOneAndDelete")` middleware hook to cascade deletion to child `Note` and `Task` documents.
   > **Note on Discrepancy:** The schema definition uses field name `room` on Note and Task models, whereas the existing `room.js` pre-hook filters on `{ roomId: room._id }`. When maintaining or modifying cascade queries, ensure the correct schema field (`room`) is respected.
3. **Password Security:** The `User` model automatically salts and hashes `password` on `pre("save")` and updates `passwordChangedAt = Date.now() - 1000` to prevent token generation race conditions.
4. **Indexes:** Maintain indexes on foreign keys (e.g. `taskSchema` index on `room: 1`).

---

## 6. Frontend State & Synchronization Rules

1. **Optimistic Updates:** UI operations (note creation, note edits, note deletion, task toggles) must update local React state immediately using temporary IDs (`temp-<timestamp>`) with `{ isOptimistic: true }`.
2. **Socket Deduplication:** When receiving socket events (e.g. `note_created`, `task_created`), event handlers must check if an item with matching ID or an optimistic placeholder exists to prevent duplicate UI rendering.
3. **Error Rollback:** If an HTTP mutation fails, the optimistic item must be rolled back cleanly from state.
4. **Subscription Cleanup:** All socket listeners (`socket.on(...)`) registered in `useEffect` hooks must be cleanly unregistered (`socket.off(...)` or `socket.emit("leave_room")`) in the effect cleanup function to prevent memory leaks and duplicate handler execution.
