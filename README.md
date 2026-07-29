# Atrio

Lightweight real-time collaboration app for notes and tasks — built for speed, simplicity, and zero friction.

**Live demo:** [notesy-gamma.vercel.app](https://notesy-gamma.vercel.app)

---

## Overview

Atrio is a real-time collaborative workspace where multiple users can create, edit, and organize shared notes and tasks with changes syncing instantly across every connected session. It was built to explore what a genuinely frictionless collaboration tool feels like — no page refreshes, no manual saves, no lag between one person typing and another person seeing it.

## What it does

- **Real-time sync** — edits to notes and tasks propagate live to every connected user via WebSockets, so collaborators always see the current state without refreshing.
- **Shared workspaces** — notes and tasks live in a shared space that multiple users can access and edit together.
- **JWT-based authentication** — user sessions are secured with JSON Web Tokens, keeping the API stateless and easy to scale horizontally.
- **Frictionless onboarding** — designed so a new user can start collaborating immediately, without a heavy setup flow getting in the way.
- **Deployed and used by real users** during a beta phase, not just a local demo.

## Architecture

- **Frontend** — a React single-page app that renders the workspace and reconciles local UI state against incoming real-time events.
- **Backend** — a Node.js/Express API handles persistence (notes, tasks, workspace data) to MongoDB.
- **Real-time layer** — Socket.io sits alongside the REST API, broadcasting updates to all clients connected to a given workspace the moment a change happens.

```
Client (React) ⇄ REST API (Express) ⇄ MongoDB
       ⇅
   Socket.io (real-time broadcast layer)
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Backend | Node.js, Express |
| Database | MongoDB |
| Real-time | Socket.io |
| Auth | JWT (JSON Web Tokens) |

## Engineering notes

- Socket.io was chosen over plain WebSockets for its built-in reconnection handling and room-based broadcasting, which made it straightforward to scope real-time updates to a specific workspace rather than broadcasting globally.
- JWT-based auth keeps the API stateless — no server-side session store to manage — which fits naturally with a real-time app that already has to handle reconnects and multiple concurrent clients.
- Keeping the REST API and the real-time layer separate (rather than routing everything through sockets) kept persistence logic centralized and easier to reason about, while still getting instant updates on the client.
- Real-time features surface edge cases that a typical request/response API doesn't — reconnection after a dropped connection, and out-of-order events when multiple users edit concurrently were the two biggest things this project had to handle.

## Project structure

```
ATRIO/
├── backend/     # Express API + Socket.io server, MongoDB models
└── frontend/    # React client
```

---

Built by [Sumedh Gaikwad](https://github.com/SumedhGaikwad03) — [Portfolio](https://sumedh-portfolio-cyan.vercel.app/)
