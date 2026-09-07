# Atrio — Authoritative Project Context

## 1. PROJECT IDENTITY

### Project Name
**Atrio** (Repository code name: `notesy`)

### Project Type
Real-time collaborative workspace and team notes/task platform.

### Primary Purpose
Atrio provides lightweight, multi-tenant virtual workspaces ("Rooms") where teams and study groups collaborate synchronously. It bridges deterministic REST-based CRUD persistence with real-time Socket.io state synchronization (live presence, collaborative note editing indicators, and shared task tracking).

### Target User & Problem
* **Target Audience:** Small distributed engineering teams, study pods, and project squads who find heavy tools like Notion or Jira over-engineered for rapid, real-time shared note capture and task coordination.
* **Core Problem:** Most lightweight note-taking apps are single-user or rely on slow polling/manual refreshes. Atrio provides low-latency multi-user room collaboration with optimistic UI updates and live room presence.

### Current Implementation Status
* **Status:** **DEPLOYED BETA / FUNCTIONAL WORKSPACE**
* **Repository Reality:** Complete full-stack implementation with Node.js/Express/Socket.io backend and React 18/Tailwind/Framer Motion frontend. Real-time collaboration, member invites, presence tracking, and optimistic state synchronization are fully implemented and verified.

---

## 2. CORE WORKFLOWS

1. **Authentication & Beta Rollout:**
   * User registers with capacity check (`USER_LIMIT_ENABLED` gating).
   * Password hashing via `bcryptjs` with timestamp tracking (`passwordChangedAt`).
   * JWT session management with auto-invalidation if credentials change.
2. **Room Lifecycle & Membership:**
   * Users create named rooms and invite collaborators by verified email.
   * Membership is stored as an array of User ObjectIds on the Room document.
   * Leaving a room filters out the user; if the last member leaves, a Mongoose cascade hook (`findOneAndDelete`) automatically purges the room and all its child notes and tasks.
3. **Real-Time Note Canvas:**
   * Users add sticky notes styled with deterministic rotation tilts based on ObjectId hashes.
   * Live editing status is broadcast via WebSocket (`note_editing_start` / `note_editing_stop`), rendering an "Editing..." badge and emerald ring on peer viewports.
   * Note mutations (create, update, delete) trigger both optimistic UI updates and room-scoped Socket.io broadcasts.
4. **Collaborative Task Sidebar:**
   * Collapsible drawer with spring-physics animation showing room tasks.
   * Interactive checkboxes update task completion and record `completedAt` timestamps.
   * Live progress bar dynamically recalculates team completion percentage.

---

## 3. TECH STACK INVENTORY

| Layer | Technology | Verified in Repository |
| :--- | :--- | :--- |
| **Backend Framework** | Node.js (ESM), Express.js 5 (`^5.2.1`) | `backend/package.json`, `backend/server.js` |
| **Real-Time Protocol** | Socket.io (`^4.8.3`), Socket.io-Client (`^4.8.3`) | `backend/socket.js`, `frontend/src/sockets.js` |
| **Database & ODM** | MongoDB, Mongoose (`^8.16.3`) | `backend/models/*.js` |
| **Authentication** | JSON Web Tokens (`jsonwebtoken ^9.0.3`), `bcryptjs ^3.0.3` | `backend/middleware/auth.js`, `backend/routes/Auth.js` |
| **Frontend Framework** | React 18 (`^18.2.0`), React Router v7 (`^7.6.3`) | `frontend/package.json`, `frontend/src/App.jsx` |
| **HTTP Client** | Axios (`^1.10.0`) with request/response interceptors | `frontend/src/utils/api.js` |
| **Animation & Motion** | Framer Motion (`^12.34.3`) | `frontend/src/pages/RoomView.jsx`, `TaskSidebar.jsx` |
| **Styling** | Tailwind CSS (`^3.4.17`), PostCSS, Custom CSS | `frontend/tailwind.config.js`, `room.css` |
| **Icons & Typography** | Lucide React (`^0.263.0`), Google Fonts (Playfair Display, DM Sans) | `frontend/src/pages/Rooms.jsx` |

---

## 4. ARCHITECTURE SUMMARY

* **5-Tier Flow:** Client UI (React + Framer Motion) &rarr; Axios / Socket.io &rarr; Express Routes & Socket Handlers &rarr; Auth Middleware & In-Memory Presence &rarr; Mongoose Models &rarr; MongoDB.
* **Dual Channel Communication:** HTTP REST for initial data fetching and durable mutations; WebSocket for transient presence, edit indicators, and live event broadcasts.
* **Multi-Tenant Room Scoping:** Every note and task query verifies that `room.members` includes `req.userId`.

---

## 5. VERIFIED LIMITATIONS & GAPS

1. **In-Memory Presence Map:** Room presence (`roomOnlineUsers`) is held in a Node.js process `Map`. It works cleanly for a single-instance backend but would require Redis Pub/Sub / Socket.io Redis Adapter for horizontal multi-instance scaling.
2. **Plain Text Note Formatting:** Notes currently store plain string `title` and `content` without rich-text markdown or CRDT/Yjs operational transformation.
3. **Commented Activity Feed:** An `Activity` model and associated route logging exist in commented-out form in `rooms.js` and `notes.js`, but are not actively mounted in the current production loop.
4. **Test Coverage:** Automated unit/integration test suites are not implemented; verification relies on build, lint, and runtime API testing.

---

## 6. UNKNOWNS & DO NOT CLAIM

* **Do NOT claim:** Production multi-million user scale, distributed Redis clustering, rich-text WYSIWYG/CRDT collaboration, or AI-powered summarization (none are present in the repository).
* **DO highlight:** Robust multi-tenant room isolation, JWT token invalidation upon password update, in-memory presence supporting multi-tab connection deduplication, Mongoose cascade cleanup hooks, and optimistic UI synchronization.
