# Atrio — Coding Agent Operating Manual

Welcome to **Atrio** (repository code name: `notesy`). This document is the primary entry point and operational manual for AI coding agents, software architects, and developers working on this codebase.

---

## 1. Project Overview

Atrio is a high-performance, real-time collaboration workspace designed for notes, tasks, and team coordination. It combines persistent RESTful CRUD operations with low-latency WebSocket synchronization via Socket.io, providing multi-tenant rooms with live presence tracking, concurrent editing indicators, and optimistic UI state management.

---

## 2. Repository Organization

```text
ATRIO (notesy)/
├── .agent/                             # Persistent agent engineering rules & architecture
│   ├── RULES.md                        # Non-negotiable engineering rules & invariants
│   ├── ARCHITECTURE.md                 # Full system architecture & realtime specifications
│   ├── PROJECT_CONTEXT.md              # Technical stack, decisions, debt & limitations
│   ├── DEVELOPMENT_WORKFLOW.md         # Step-by-step agent workflow & reporting protocol
│   └── SECURITY_RULES.md               # Security boundaries, auth & authorization rules
├── backend/                            # Express 5 + Socket.io + Mongoose API server
│   ├── middleware/                     # Authentication & request filters (auth.js)
│   ├── models/                         # Mongoose models (User_Model.js, room.js, note.js, task.js)
│   ├── routes/                         # REST controllers (Auth.js, rooms.js, notes.js, tasks.js)
│   ├── server.js                       # HTTP server entry point & route mounting
│   └── socket.js                       # Socket.io initialization, presence map & event handlers
├── docs/                               # Case study & historical portfolio documentation
│   └── portfolio-context/              # Deep-dive architectural records
├── frontend/                           # React 18 SPA (Create React App + Tailwind + Framer Motion)
│   ├── public/                         # Static web assets, manifest & icons
│   └── src/
│       ├── components/                 # Modals, note cards & shared components
│       ├── pages/                      # Route views (Login, Signup, Rooms, RoomView)
│       │   └── rooms/                  # Room subcomponents (NotesBoard, TaskSidebar, RoomHeader)
│       ├── styles/                     # CSS stylesheets (room.css, index.css)
│       ├── utils/                      # Axios client instance (api.js) & auth helpers (auth.js)
│       ├── App.jsx                     # Route registry & socket connection trigger
│       ├── index.js                    # React root entry point
│       └── sockets.js                  # Socket.io-client singleton & auth handshake setup
├── AGENTS.md                           # This document (primary agent entry point)
└── README.md                           # Project public overview
```

---

## 3. Architecture at a Glance

Atrio employs a hybrid architecture separating durable data persistence from transient real-time broadcasting:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                          React 18 SPA Client                           │
│   • Router: React Router DOM v7 (/login, /signup, /rooms, /rooms/:id)  │
│   • UI / Motion: Tailwind CSS, Framer Motion, DM Sans & Playfair Fonts │
│   • State Sync: Optimistic UI with temp IDs + Socket Reconciliation    │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │ HTTP REST (Axios Singleton)    │ WebSocket (Socket.io-client)
                    │ Bearer JWT Auth Header         │ Handshake Auth ({ token })
                    ▼                                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           Express 5 Backend                            │
│ ┌──────────────────────────────────────┐ ┌───────────────────────────┐ │
│ │              REST API                │ │     Socket.io Server      │ │
│ │  /api/auth   → Signup / Login / Gate │ │  JWT Handshake Auth       │ │
│ │  /api/rooms  → Create / List / Inv   │ │  join_room / leave_room   │ │
│ │  /api/notes  → CRUD + Sockets Emit   │ │  note_editing_start/stop  │ │
│ │  /api/rooms/:id/tasks → CRUD + Sockets││  Presence Map (RAM Map)   │ │
│ └──────────────────┬───────────────────┘ └─────────────┬─────────────┘ │
│                    │                                   │               │
│                    ▼                                   ▼               │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │                    Security & Authorization Layer                  │ │
│ │  • authMiddleware (JWT verify + User lookup + passwordChangedAt)   │ │
│ │  • Room membership checks: room.members.includes(req.userId)       │ │
│ └──────────────────────────────────┬─────────────────────────────────┘ │
└────────────────────┼───────────────────────────────────┼───────────────┘
                     │ Mongoose 8 ODM                    │
                     ▼                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                            MongoDB Database                            │
│  Collections: User (hashed pwd), Room (members[]), Note, Task          │
│  Cascade Hook: Room.findOneAndDelete -> Note/Task cascade purge        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Documentation Hierarchy

When working in this repository, follow this priority hierarchy:

```text
AGENTS.md (Root Rules & Philosophy)
    ↓
.agent/RULES.md (Engineering Invariants & Constraints)
    ↓
.agent/ARCHITECTURE.md (System Architecture & Realtime Specs)
    ↓
.agent/PROJECT_CONTEXT.md (Stack, Decisions, Known Debt & Status)
    ↓
.agent/DEVELOPMENT_WORKFLOW.md (Step-by-step Agent Protocol)
    ↓
.agent/SECURITY_RULES.md (Auth, Authorization & Data Boundaries)
```

> **Rule:** The most specific applicable rule in `.agent/` governs the task. If documentation and implementation conflict, inspect the actual source code, document the discrepancy, and treat the codebase behavior as the baseline.

---

## 5. Required Agent Behavior

Every AI coding agent acting on this codebase **MUST**:

1. **Inspect Before Editing:** Locate all relevant files, dependencies, socket emitters, socket listeners, and caller contracts before making any modifications.
2. **Understand the Real Flow:** Understand where state is created, persisted in MongoDB, emitted via Socket.io, and reconciled in React state.
3. **Reuse Existing Patterns:** Match existing naming conventions, Mongoose schema patterns, Axios API utilities, and component folder structure.
4. **Make Minimal Safe Changes:** Implement the smallest possible change that solves the issue.
5. **Preserve API & Socket Contracts:** Do not break existing REST endpoint response structures or Socket.io event payloads.
6. **Preserve Security Boundaries:** Always enforce room membership validation (`room.members.includes(req.userId)`) on both REST routes and Socket.io handlers.
7. **Validate Thoroughly:** Run syntax checks, type checks, build scripts, or manual verification steps before finishing.
8. **Provide a Structured Final Report:** Follow the reporting schema defined in [`.agent/DEVELOPMENT_WORKFLOW.md`](file:///.agent/DEVELOPMENT_WORKFLOW.md).

---

## 6. Prohibited Agent Behavior

Coding agents **MUST NOT**:

* **Rewrite the Application:** Do not initiate broad refactoring or change application frameworks.
* **Introduce Unnecessary Dependencies:** Do not add npm packages without explicit justification.
* **Restructure the Repository:** Do not rename or move files unless directly required by the task.
* **Change Database Schemas Casually:** Do not alter model field types or required flags without evaluating backward compatibility.
* **Change Socket.io Event Names/Signatures:** Do not rename events (e.g., `note_created`, `task_updated`, `online_users_update`) without updating both server and client symmetrically.
* **Remove "Unused" Code Without Proof:** Commented-out or unmounted code must not be deleted unless explicitly requested.
* **Modify Unrelated Features:** Keep diffs strictly focused on the requested objective.
* **Commit or Push:** Never run `git commit` or `git push` unless explicitly asked by the user.
