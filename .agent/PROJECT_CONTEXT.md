# Atrio Project Context

> Atrio engineering documentation.
> This document describes the current repository architecture and/or agent rules.
> Update this document when the corresponding architecture changes.

---

## 1. Product Overview

**Atrio** (repository code name: `notesy`) is a real-time collaborative workspace platform designed for frictionless team notes and task management. It provides private, multi-tenant virtual workspaces ("Rooms") where distributed teams and study groups collaborate synchronously without page refreshes, manual saves, or synchronization lag.

---

## 2. Users & Target Use Cases

* **Target Audience:** Small engineering squads, study groups, design teams, and project pods who need instantaneous collaboration without the cognitive overhead or setup complexity of heavy enterprise tools (such as Jira or Notion).
* **Core Problem Solved:** Lightweight note applications are typically single-user or rely on slow polling/manual refreshes. Atrio solves this by providing instant WebSocket-driven multi-user synchronization, live presence indicators, and optimistic UI updates.

---

## 3. Core Features (Currently Implemented)

1. **User Authentication & Beta Gating:**
   * Registration with configurable server capacity check (`USER_LIMIT_ENABLED`).
   * Password hashing via `bcryptjs` with salt rounds 10.
   * Stateless JWT sessions with automatic invalidation if passwords change (`passwordChangedAt`).
2. **Multi-Tenant Collaborative Workspaces (Rooms):**
   * Creation of shared rooms with creator auto-enrolled as initial member.
   * Collaborator invitations by email via `$addToSet`.
   * Safe leave room flow with automatic cascade deletion of all child notes and tasks when the final member exits.
3. **Real-Time Note Canvas:**
   * Sticky-note cards rendered with deterministic visual rotation tilts based on ObjectId hashes.
   * Real-time concurrent editing indicators (`"Editing..."` badge and highlight ring on peer viewports).
   * Full CRUD operations with instant optimistic updates and Socket.io broadcasts.
4. **Collaborative Task Sidebar:**
   * Slide-out drawer with Framer Motion spring physics.
   * Task completion checkboxes with dynamic `completedAt` timestamp tracking.
   * Live calculated progress bar reflecting team completion percentage.
5. **Real-Time Presence Tracking:**
   * In-memory multi-tab tracking per room.
   * Live count and display of active collaborators.

---

## 4. Current Technical State & Stack

| Layer | Package / Technology | Version | Location |
| :--- | :--- | :--- | :--- |
| **Backend Runtime** | Node.js (ESM) | Node 18+ | `backend/package.json` |
| **Backend Framework** | Express | `^5.2.1` | `backend/package.json` |
| **Database & ODM** | MongoDB / Mongoose | `^8.16.3` | `backend/package.json` |
| **Realtime Engine** | Socket.io | `^4.8.3` | `backend/package.json` |
| **Authentication** | `jsonwebtoken`, `bcryptjs` | `^9.0.3`, `^3.0.3` | `backend/package.json` |
| **Frontend Framework**| React / React DOM | `^18.2.0` | `frontend/package.json` |
| **Routing** | React Router DOM | `^7.6.3` | `frontend/package.json` |
| **HTTP Client** | Axios | `^1.10.0` | `frontend/package.json` |
| **Animation Engine** | Framer Motion | `^12.34.3` | `frontend/package.json` |
| **Styling** | Tailwind CSS / PostCSS | `^3.4.17` / `^8.4.21` | `frontend/package.json` |
| **Icons & Typography** | Lucide React, Google Fonts | `^0.263.0` | `frontend/package.json` |

---

## 5. Important Implementation Decisions

* **Room-Scoped Authorization:** Every database read and write verifies that `room.members` contains `req.userId`, ensuring zero data leakage across rooms.
* **In-Memory Nested Presence Map:** Tracks `Map<roomId, Map<userId, socketCount>>` to prevent presence flicker when users open multiple tabs or refresh.
* **Token Invalidation via `passwordChangedAt`:** Verifies token `iat` against `passwordChangedAt` timestamp, revoking compromised sessions without maintaining a stateful token blacklist.
* **Deterministic Card Jitter:** Card tilts `[-3deg, +3deg]` are computed via pure hash algorithm `getRotation(note._id)` rather than storing presentation metadata in the database.
* **Optimistic UI with Deduplication:** Frontend uses temporary IDs (`temp-<timestamp>`) for immediate tactile response, reconciling with server responses and deduplicating incoming Socket.io broadcasts.

---

## 6. Confirmed Technical Debt & Discrepancies

1. **Cascade Hook Query Discrepancy:** In `backend/models/room.js`, the `findOneAndDelete` hook queries `Note.deleteMany({ roomId: room._id })` and `Task.deleteMany({ roomId: room._id })`, whereas `note.js` and `task.js` define the reference field as `room`.
2. **Commented-out Activity Logging:** An `Activity` model and associated route logging code exist commented out in `backend/routes/rooms.js` and `backend/routes/notes.js`.
3. **Automated Test Coverage:** Automated unit/integration test suites are not currently implemented; verification relies on build, lint, and runtime API testing.
4. **Redundant User ID in Client Storage:** Client stores both `token` and `username` in `localStorage`; `userId` is occasionally retrieved from localStorage or decoded token.

---

## 7. Current Limitations vs Planned Direction

### CURRENT (Actual Codebase State)
* **Single-Node In-Memory Presence:** In-memory presence map operates on a single Node.js instance.
* **Plain Text Note Formatting:** Notes store plain string `title` and `content` (no rich text or CRDT operational transformation).
* **Standard Express Error Handling:** Error responses use manual status code and JSON messages without centralized global error middleware.

### PLANNED (Future Architectural Evolution)
* **Distributed Presence:** Adding Redis Adapter for Socket.io to support horizontal clustering.
* **Rich Text Editing:** Collaborative markdown or rich-text editing with operational transformation.
* **Automated CI/CD Testing:** Introducing Jest/Supertest backend suites and React Testing Library frontend suites.
