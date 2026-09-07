# Atrio — Portfolio Case Study Notes

---

## 1. PROJECT POSITIONING

> **"Sumedh Gaikwad built Atrio as a real-time collaborative workspace engineered around dual-channel HTTP/WebSocket synchronization, multi-tenant room isolation, and low-latency team presence."**

* **Engineering Identity:** Full-Stack & Real-Time Backend Systems Engineer.
* **Core Strength:** Architecting synchronous multi-user applications with optimistic UI updates, robust room-based authorization boundaries, in-memory presence tracking supporting multi-tab connection deduplication, and database cascade invariants.

---

## 2. THE PROBLEM

Lightweight note-taking and task-tracking tools often fall into two extremes:
1. **Single-User Silos:** Fast and simple, but lack multi-user collaboration and team presence.
2. **Heavyweight Enterprise Platforms:** Tools like Notion or Jira offer multi-tenancy but carry heavy cognitive overhead, complex permission matrices, and slow synchronization latency for lightweight team sprints or study pods.

**The Engineering Challenge:** Build a snappy, low-friction collaborative workspace where distributed users can create shared rooms, capture notes, and manage tasks with instant feedback, zero perceived latency, and guaranteed multi-tenant data isolation.

---

## 3. THE SOLUTION

Atrio implements a hybrid architecture:
* **Stateless Express REST API** for reliable CRUD persistence, authentication, and room lifecycle management.
* **Stateful Socket.io Server** for sub-millisecond presence broadcasting, collaborative editing locks, and real-time state propagation.
* **Optimistic React Client** that updates the UI immediately with temporary IDs and reconciles with server/socket events, rolling back on network failures.
* **Room-Scoped Security Boundary** where all note and task operations enforce `room.members.includes(req.userId)`.

---

## 4. SYSTEM ARCHITECTURE

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

## 5. IMPORTANT ENGINEERING PROBLEMS SOLVED

1. **Multi-Tab Presence Deduplication:**
   * *Problem:* When a user opens 3 tabs to the same room, naive tracking counts 3 active users and broadcasts a disconnect if any single tab closes.
   * *Solution:* In-memory nested mapping `Map<roomId, Map<userId, socketCount>>`. Presence only decrements to zero when all sockets for that user disconnect.
2. **Instant Invalidation of Compromised JWTs:**
   * *Problem:* Stateless JWTs cannot be revoked until expiry without heavy distributed blacklists.
   * *Solution:* Comparing `decoded.iat * 1000` against `user.passwordChangedAt` in middleware instantly invalidates all legacy tokens upon password update.
3. **Database Cascade Invariants:**
   * *Problem:* Room deletion leaving orphaned notes and tasks in MongoDB.
   * *Solution:* Mongoose `pre("findOneAndDelete")` middleware guarantees that deleting a room cleans up all associated child documents.
4. **Optimistic UI with Duplicate Prevention:**
   * *Problem:* Emitting socket broadcasts for locally created notes can render duplicate cards on the author's screen.
   * *Solution:* Optimistic insertion with temporary IDs (`temp-<timestamp>`), matched and replaced by both HTTP response and Socket.io event listeners.

---

## 6. KEY ENGINEERING DECISIONS

| Decision | Why It Was Chosen | Tradeoff |
| :--- | :--- | :--- |
| **Room-Based Authorization** | Allows multiple team members to collaborate on any note/task in a room. | Requires parent room lookup on every note/task mutation. |
| **In-Memory Presence Map** | High-performance, zero-latency presence tracking for single-node backend. | Process-local; requires Redis adapter for horizontal scaling. |
| **Password Timestamp Invalidation** | Stateless session revocation on password change without token blacklist DB. | Requires fetching `User` document on authenticated HTTP requests. |
| **Deterministic Card Jitter** | Natural sticky-note visual rotation seeded from ObjectId hex hash (`id.slice(-3)`). | Rotation is fixed per note (`[-3deg, +3deg]`), not user-customizable. |
| **Controlled Beta Capacity Limit** | Protects early backend infrastructure by enforcing `USER_LIMIT` during signup. | Rejects new users with HTTP 403 when limit is reached. |

---

## 7. DATA MODEL OVERVIEW

* **`User`:** `username` (unique), `email` (unique), `password` (bcrypt hash), `passwordChangedAt` (Date).
* **`Room`:** `name`, `createdBy` (Ref User), `members` (Array of Ref User). Auto-cascades deletion to child models.
* **`Note`:** `title`, `content`, `user` (Ref User), `room` (Ref Room), `createdAt`.
* **`Task`:** `room` (Ref Room, indexed), `text` (max 200), `completed` (Boolean), `createdBy` (Ref User), `completedAt` (Date).

---

## 8. SECURITY CONTROLS

* **Authentication:** bcrypt password hashing (10 salt rounds) + 2h JWT tokens.
* **Authorization:** Room membership checks (`room.members.includes(req.userId)`) on all routes and socket channels.
* **Session Revocation:** Immediate token invalidation via `passwordChangedAt`.
* **CORS Protection:** Strict origin whitelist matching local, Vercel, and custom domains.

---

## 9. INTERESTING IMPLEMENTATION DETAILS

* **Live Collaborative Edit Indicator:** Double-clicking a note emits `note_editing_start`, rendering an active "Editing..." badge and emerald ring on peer screens.
* **Interactive Task Progress:** Task completion dynamically recalculates `(completedTasks / totalTasks) * 100` and renders a live progress bar.
* **Auto-Room Cleanup:** When the last collaborator leaves a room, the backend deletes the room and all its assets.

---

## 10. WHAT IS ACTUALLY COMPLETE

* [x] User registration & login with password hashing and JWT sessions.
* [x] Controlled beta capacity gating.
* [x] Room creation, member invitation by email, and room departure.
* [x] Automatic room cascade deletion on last member departure.
* [x] Real-time sticky note canvas with optimistic updates.
* [x] Live collaborative editing status indicators.
* [x] Real-time task sidebar with completion progress tracking.
* [x] In-memory multi-connection room presence tracking.
* [x] Warm editorial UI with Framer Motion spring physics.

---

## 11. WHAT IS INCOMPLETE / ROADMAP

* [ ] Redis Pub/Sub adapter for multi-instance socket clustering.
* [ ] Rich text / Markdown / WYSIWYG note editing (currently plain text).
* [ ] Activity log audit feed (models/routes exist in commented-out state).
* [ ] Automated E2E multi-browser test suite.

---

## 12. WHAT SHOULD NOT BE CLAIMED

* **DO NOT claim:** Multi-region Redis architecture, CRDT/OT operational transformation (like Figma/Google Docs multi-cursor inside a single textarea), AI note summarization, or millions of production users.
* **DO highlight:** Clean separation of REST and WebSocket concerns, robust room-level authorization, multi-connection presence deduplication, and responsive optimistic state synchronization.

---

## 13. POTENTIAL PORTFOLIO VISUALIZATIONS & INTERACTIVE ELEMENTS

1. **Dual-Channel System Flow:** Interactive diagram toggling between HTTP REST persistence and Socket.io real-time broadcast paths.
2. **Presence Map State Machine:** Visual showing how a user opening 2 tabs increments `socketCount` to 2 and decrements to 1 upon closing one tab without dropping presence.
3. **Optimistic Sync Sequence:** Diagram showing Client Optimistic Render &rarr; HTTP POST &rarr; MongoDB Write &rarr; Socket Broadcast &rarr; Peer Client Render.
4. **Verified Engineering Decisions:** Structured cards with *Decision*, *Why it matters*, and *Engineering tradeoff*.
