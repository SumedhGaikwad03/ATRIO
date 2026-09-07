# Atrio — Testing & Verification

## 1. AVAILABLE TEST SUITES & SCRIPTS

### Backend (`backend/package.json`)
* **Test Script:** `"test": "echo \"Error: no test specified\" && exit 1"`
* **Status:** No automated backend test framework (e.g., Jest, Mocha, Supertest) is configured in the repository.

### Frontend (`frontend/package.json`)
* **Test Script:** `"test": "react-scripts test"`
* **Test Files:** `frontend/src/App.test.js` (standard boilerplate Create React App smoke test), `frontend/src/setupTests.js` (`@testing-library/jest-dom`).
* **Status:** Default boilerplate test suite.

---

## 2. BUILD & SYNTAX VERIFICATION

### Frontend Build Verification
* **Build Command:** `npm run build` (via `react-scripts build`)
* **Artifacts:** Verified production build in `frontend/build/` containing bundled JavaScript chunks (`main.*.js`, `488.*.chunk.js`), minified CSS (`main.*.css`), and asset manifest.

### Code Syntax & Module Verification
* **Backend:** ES Module syntax (`"type": "module"` in `package.json`), verified with native Node.js import resolution.
* **Database Connection:** Verified Mongoose models and schema indexes (`taskSchema` with `room: 1` index, `RoomSchema` cascade middleware).

---

## 3. MANUAL & RUNTIME VERIFICATION MATRIX

| Capability | Verification Method | Result |
| :--- | :--- | :--- |
| **Authentication Flow** | Code audit: bcrypt hash + JWT 2h + `passwordChangedAt` check | **VERIFIED** |
| **Beta Capacity Limit** | Code audit: `process.env.USER_LIMIT_ENABLED` gating in `routes/Auth.js` | **VERIFIED** |
| **Room CRUD & Cascade** | Code audit: Mongoose `pre("findOneAndDelete")` cascade deletion hook | **VERIFIED** |
| **Socket Authentication** | Code audit: `ioInstance.use` JWT verification during handshake | **VERIFIED** |
| **Presence Multi-Connection** | Code audit: `roomOnlineUsers` nested Map tracking per-user socket count | **VERIFIED** |
| **Optimistic Note Sync** | Code audit: `temp-<timestamp>` ID injection with socket deduplication | **VERIFIED** |
| **Task State & Progress** | Code audit: Checkbox mutation + live progress math in `TaskSidebar.jsx` | **VERIFIED** |
| **Note Edit Lock Indicator** | Code audit: `note_editing_start` / `note_editing_stop` WebSocket events | **VERIFIED** |

---

## 4. KNOWN TESTING GAPS

1. No automated end-to-end (E2E) integration tests (e.g., Playwright / Cypress) verifying multi-browser socket synchronization.
2. No automated API regression tests for Express endpoints.
3. Smoke tests only exist as default React template files.
