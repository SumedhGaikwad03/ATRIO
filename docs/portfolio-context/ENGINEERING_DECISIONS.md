# Atrio — Key Engineering Decisions & Tradeoffs

## Decision 1: Room-Based Multi-Tenant Authorization vs Single-User Ownership

### Context
In traditional personal note applications, notes are strictly tied to `note.user === req.userId`. In a collaborative workspace, multiple users must read and modify notes and tasks within a shared boundary.

### Implementation
All note and task mutations check membership on the parent room document rather than creator ownership:
```javascript
// backend/routes/notes.js
const room = await Room.findOne({
  _id: note.room,
  members: req.userId
});
if (!room) return res.status(403).json({ message: "Access denied" });
```

### Why
Enables full team collaboration inside a room while guaranteeing strict data isolation from non-member users.

### Tradeoff
Requires an additional database query or join to verify room membership on every note/task modification before execution.

### Evidence
* `backend/routes/notes.js` (lines 55–66, 178–187, 242–251)
* `backend/routes/tasks.js` (lines 23–30, 64–71, 112–119, 166–173)

---

## Decision 2: In-Memory Multi-Connection Presence Map

### Context
In real-time web applications, users frequently refresh the page, open multiple tabs, or connect from multiple devices simultaneously. Naive tracking by raw socket ID causes presence flicker and inaccurate online user counts.

### Implementation
Structured in-memory nested Map tracking user-to-socket counts per room:
```javascript
// backend/socket.js
// roomId -> Map(userId -> socketCount)
const roomOnlineUsers = new Map();
```

### Why
Accurately tracks active human presence. A user remains "online" in a room until all active sockets for that user in that room have disconnected.

### Tradeoff
State is stored in Node.js process memory. Suitable for single-node deployments; horizontal multi-instance scaling would require an external distributed store like Redis.

### Evidence
* `backend/socket.js` (lines 8–10, 82–94, 139–170)

---

## Decision 3: JWT Invalidation via `passwordChangedAt` Timestamp

### Context
Standard stateless JWT tokens remain valid until their expiration time, creating a security window if user credentials are leaked or changed.

### Implementation
The `User` model records `passwordChangedAt` on password modifications. The authentication middleware verifies that the token's issued-at timestamp (`iat`) is strictly after the password change time:
```javascript
// backend/middleware/auth.js
if (user.passwordChangedAt && decoded.iat * 1000 < user.passwordChangedAt.getTime()) {
  return res.status(401).json({
    message: "Token is invalid due to password change. Please login again."
  });
}
```

### Why
Provides instant revocation of active sessions across all devices upon password reset without requiring a distributed token blacklist database.

### Tradeoff
Requires querying the `User` collection on authenticated HTTP requests to fetch `passwordChangedAt`.

### Evidence
* `backend/models/User_Model.js` (lines 23–25, 37–40)
* `backend/middleware/auth.js` (lines 31–39)

---

## Decision 4: Automatic Cascade Cleanup via Mongoose Pre-Hooks

### Context
In relational and document models, deleting a parent room can leave orphaned child notes and tasks in the database.

### Implementation
Mongoose middleware hook on `findOneAndDelete`:
```javascript
// backend/models/room.js
RoomSchema.pre("findOneAndDelete", async function (next) {
  const room = await this.model.findOne(this.getFilter());
  if (room) {
    await mongoose.model("Note").deleteMany({ roomId: room._id });
    await mongoose.model("Task").deleteMany({ roomId: room._id });
  }
  next();
});
```
When the last member leaves a room (`DELETE /api/rooms/:roomId/leave`), the backend calls `Room.findByIdAndDelete(roomId)`, triggering automatic cleanup of all room assets.

### Why
Guarantees database cleanliness and prevents orphaned documents from consuming storage or corrupting analytics.

### Tradeoff
Requires careful coordination with Mongoose query filters and model loading order.

### Evidence
* `backend/models/room.js` (lines 31–41)
* `backend/routes/rooms.js` (lines 236–240)

---

## Decision 5: Deterministic Hash-Based Visual Card Jitter

### Context
Physical sticky-note boards have subtle, natural tilt variations. Generating random angles on the client causes cards to violently jitter on every re-render. Storing rotation angles in the database bloats the schema with presentation metadata.

### Implementation
Pure deterministic rotation algorithm based on the last 3 hex characters of the document's MongoDB ObjectId:
```javascript
// frontend/src/pages/RoomView.jsx
const getRotation = (id) => {
  const seed = id.slice(-3);
  return ((parseInt(seed, 16) % 5) - 2) * 1.5;
};
```

### Why
Produces consistent, pleasant tilt angles across all browsers and re-renders with zero state storage or network overhead.

### Tradeoff
Angle variation is constrained to a fixed range `[-3deg, +3deg]` computed from the ObjectId seed.

### Evidence
* `frontend/src/pages/RoomView.jsx` (lines 230–233)
* `frontend/src/components/notes/NoteCard.jsx` (line 54)

---

## Decision 6: Optimistic UI with Socket Broadcast Reconciliation

### Context
Network roundtrips introduce noticeable UI latency during note and task creation.

### Implementation
Client generates temporary IDs (`temp-<timestamp>`), renders items immediately with `{ isOptimistic: true }`, replaces them upon HTTP/Socket arrival, and rolls back on failure:
```javascript
// frontend/src/pages/RoomView.jsx
const optimisticNote = {
  _id: "temp-" + Date.now(),
  title, content, roomId,
  isOptimistic: true
};
setNotes(prev => [optimisticNote, ...prev]);
```

### Why
Provides zero-latency tactile feedback for the active user while ensuring peer clients receive real-time updates via Socket.io.

### Tradeoff
Requires deduplication logic in socket event listeners to prevent duplicate cards when both HTTP response and WebSocket broadcast arrive.

### Evidence
* `frontend/src/pages/RoomView.jsx` (lines 56–84, 163–200)
* `frontend/src/pages/rooms/TaskSidebar.jsx` (lines 77–87, 137–153)
