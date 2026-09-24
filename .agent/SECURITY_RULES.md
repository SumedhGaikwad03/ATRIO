# Security Boundaries & Rules

> Atrio engineering documentation.
> This document describes the current repository architecture and/or agent rules.
> Update this document when the corresponding architecture changes.

---

## 1. Authentication Security

* **Password Hashing:** All user passwords must be hashed using `bcryptjs` with salt rounds of 10 (`bcrypt.genSalt(10)`). Never store or compare plaintext passwords.
* **JWT Lifecycle:** Tokens are signed using `process.env.JWT_SECRET` with a 2-hour expiration (`expiresIn: "2h"`).
* **Password Change Invalidation:** When a user's password changes, `passwordChangedAt` is updated to `Date.now() - 1000`. The `authMiddleware` in `backend/middleware/auth.js` strictly rejects tokens issued before this timestamp (`decoded.iat * 1000 < user.passwordChangedAt.getTime()`).
* **Secret Isolation:** `JWT_SECRET` and `MONGO_URI` must always be loaded from environment variables (`process.env`) and never hardcoded in source files.

---

## 2. Multi-Tenant Room Authorization

Atrio relies on room-level multi-tenant isolation. No data may be accessed or modified without verified room membership.

### Non-Negotiable Authorization Pattern:
For any REST route or Socket.io event touching a room, note, or task:
```javascript
// 1. Verify that the parent room exists AND that req.userId is in members
const room = await Room.findOne({
  _id: targetRoomId,
  members: req.userId
});

// 2. Reject immediately if unauthorized
if (!room) {
  return res.status(403).json({ message: "Access denied" });
}
```

* **Notes Authorization:** Note modification and deletion check membership on the parent `note.room`.
* **Tasks Authorization:** Task CRUD checks membership on the parent `task.room`.
* **Member Management:** Only room members may invite new collaborators or leave a room.

---

## 3. REST API Security

1. **Mandatory Auth Middleware:** Every private route in `backend/routes/` must mount `authMiddleware`.
2. **MongoDB ObjectId Sanitization:** Route handlers receiving parameters (`:roomId`, `:taskId`, `:id`) must validate ID formats using `mongoose.Types.ObjectId.isValid(id)` before querying the database to prevent casting exceptions and injection vectors.
3. **Input Sanitization:** String inputs for usernames, emails, note titles, note content, and task text must be trimmed and checked for non-empty content before persisting.
4. **CORS Configuration:** The backend CORS configuration in `backend/server.js` restricts origin access strictly to authorized frontend development and production URLs with `credentials: true`.

---

## 4. WebSocket & Realtime Security

1. **Handshake Authentication:** Socket connections must pass JWT validation during the handshake phase in `ioInstance.use(...)` before being granted a socket ID.
2. **Room Channel Access Control:** The `join_room` socket event must query MongoDB to verify that `socket.userId` is a member of `Room.findOne({ _id: roomId, members: socket.userId })` before calling `socket.join(roomKey)`.
3. **Scoped Broadcasting:** Never emit sensitive workspace changes to global sockets (`io.emit(...)`). Always scope broadcasts to verified room channels (`io.to(roomKey).emit(...)` or `socket.to(roomKey).emit(...)`).

---

## 5. Data Exposure Prevention

1. **Password Hash Protection:** User queries must never return password hashes to the client. When querying users with `.select("+password")` for login verification, the password hash must not be included in the JSON response.
2. **Populate Sanitization:** When populating user details for notes or tasks, explicitly restrict populated fields (e.g., `.populate("user", "username")` or `.populate("createdBy", "username")`). Never populate entire User documents into notes or tasks.
3. **Error Message Hygiene:** Production errors must return generic, safe messages (`{ message: "Internal server error" }` or `{ message: "Access denied" }`) rather than leaking internal database stack traces or schema structures.

---

## 6. Security Change Protocol

Any proposed modification that touches:
* `backend/middleware/auth.js`
* `backend/models/User_Model.js` (password hashing, schema fields)
* `backend/routes/Auth.js` (login, signup, token issuance)
* Socket handshake or room join authorization in `backend/socket.js`
* Room membership checks across `routes/rooms.js`, `routes/notes.js`, or `routes/tasks.js`

**MUST** undergo a comprehensive security audit of all affected routes, socket events, and database query filters before being accepted.
