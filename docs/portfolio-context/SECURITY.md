# Atrio — Security Architecture & Verification

## 1. AUTHENTICATION & SESSION LIFECYCLE

* **Password Hashing:** Passwords are salted and hashed using `bcryptjs` with a work factor of 10 (`bcrypt.genSalt(10)`) inside a Mongoose `pre("save")` hook (`backend/models/User_Model.js`).
* **JWT Tokens:** Issued upon successful login with a 2-hour expiration window (`expiresIn: "2h"`), signed with a server-side secret (`process.env.JWT_SECRET`).
* **Password Change Invalidation:** When a password is updated, `passwordChangedAt` is recorded (`Date.now() - 1000`). The `authMiddleware` validates that `decoded.iat * 1000 >= user.passwordChangedAt.getTime()`. Tokens issued prior to a password modification are immediately rejected with HTTP 401.

---

## 2. MULTI-TENANT AUTHORIZATION & DATA ISOLATION

* **Room Membership Gating:** Access to all room resources (notes, tasks, member lists) requires active membership in `room.members`.
* **Resource Mutation Verification:** Unlike naive implementations that check only user authentication, every Note and Task route performs a database check against the parent room document:
  ```javascript
  const room = await Room.findOne({
    _id: note.room,
    members: req.userId
  });
  if (!room) return res.status(403).json({ message: "Access denied" });
  ```
* **Anti-Hijacking on Sockets:** Socket handshake authenticates JWT tokens. Socket event listeners verify room membership before allowing clients to join room-specific broadcast channels (`socket.join(roomKey)`).

---

## 3. INPUT VALIDATION & SANITIZATION

* **Mongoose Schema Constraints:**
  * `User.username`: `trim: true`, `lowercase: true`, `unique: true`.
  * `User.email`: `trim: true`, `lowercase: true`, `unique: true`.
  * `Task.text`: `maxlength: 200`, `trim: true`.
* **Route Validation:**
  * Checks for empty/whitespace strings on room creation, note creation, and task submission.
  * Checks for valid MongoDB ObjectIds via `mongoose.Types.ObjectId.isValid()`.

---

## 4. CORS & NETWORK SECURITY

* **CORS Whitelist:** Configured on both Express HTTP server and Socket.io server to allow only approved development and production origins:
  * `http://localhost:3000` (Local frontend dev)
  * `http://localhost:5173` (Vite dev)
  * `https://notesy-sumedh-gaikwads-projects.vercel.app` (Vercel deployment)
  * `https://atrio-gamma.vercel.app` (Production custom domain / Vercel alias)
* **Credentials:** `credentials: true` with restricted HTTP headers (`Content-Type`, `Authorization`).

---

## 5. KNOWN SECURITY GAPS & LIMITATIONS

* **Rate Limiting:** No dedicated rate-limiting middleware (such as `express-rate-limit`) is configured on auth routes.
* **Schema Validation Libraries:** Input validation relies on standard JavaScript condition checks and Mongoose schemas rather than a declarative runtime parser like Zod.
* **Socket Reconnection Flood:** Socket reconnection relies on client-side reconnection parameters without exponential backoff token refreshing.
