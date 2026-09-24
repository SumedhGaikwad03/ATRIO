# Development Workflow & Agent Protocol

> Atrio engineering documentation.
> This document describes the current repository architecture and/or agent rules.
> Update this document when the corresponding architecture changes.

---

## 1. Core Agent Lifecycle

Every coding agent working on the Atrio codebase must strictly follow this sequential workflow:

```text
REQUEST
   ↓
INVESTIGATE
   ↓
LOCATE
   ↓
UNDERSTAND
   ↓
DESIGN
   ↓
IMPLEMENT
   ↓
TEST
   ↓
REVIEW
   ↓
REPORT
```

Never jump straight from a user request to code implementation without completing the preceding analysis steps.

---

## 2. Phase-by-Phase Instructions

### Phase 1: REQUEST & INVESTIGATE
* Identify the exact objective, bug report, or feature request.
* Inspect the repository and relevant architecture documents in `.agent/`.
* Formulate hypotheses and determine what data models, routes, or components are involved.

### Phase 2: LOCATE
Find and catalogue all participating files:
* Frontend components, hooks, modals, and style sheets (`frontend/src/`).
* API client calls (`frontend/src/utils/api.js`) and socket configurations (`frontend/src/sockets.js`).
* Backend routes (`backend/routes/`), middleware (`backend/middleware/`), and socket handlers (`backend/socket.js`).
* Mongoose data models (`backend/models/`).

### Phase 3: UNDERSTAND
* Trace how data flows from user input &rarr; React state &rarr; Axios HTTP call &rarr; Express route &rarr; Mongoose query &rarr; Socket.io broadcast &rarr; React reconciliation.
* Verify security boundaries: identify how `req.userId` and `room.members` are validated for the affected domain.
* Identify dependencies and side-effects.

### Phase 4: DESIGN
* Plan the **smallest valid implementation** that satisfies the requirement.
* Ensure existing API contracts and Socket.io event names/payloads remain backward compatible.
* Identify edge cases (network drop, multi-tab race conditions, invalid ObjectIds, unauthorized access).

### Phase 5: IMPLEMENT
* Apply edits incrementally.
* Touch **only** the files identified in the design phase.
* Never perform opportunistic cleanups, unrelated lint refactoring, or framework migrations.

### Phase 6: TEST & VALIDATE
* Run frontend build/test commands if available:
  ```bash
  # In frontend/
  npm run build
  ```
* Verify backend syntax and import integrity.
* Validate all modified Socket.io events have matching server emitters and client listeners.
* Check that room authorization checks are preserved on all modified routes.

### Phase 7: REVIEW
* Inspect the git diff to ensure no unintended modifications, dead code, or debugging statements (`console.log` clutter) were introduced.
* Ensure no secrets, environment variables, or password hashes are exposed.

### Phase 8: REPORT
* Compile a comprehensive, structured final report following the template below.

---

## 3. Standard Final Report Format

Every completed implementation must conclude with this report:

```markdown
### Summary of Changes
- [Concise description of the objective and solution]

### Files Modified
- `path/to/modified/file.js`: [Description of changes]

### Files Added
- `path/to/new/file.js`: [Purpose of new file]

### Files Removed
- `path/to/deleted/file.js`: [Rationale for deletion]

### Behavior Changed
- [Explicit list of old vs new behavior]

### Tests & Validation Executed
- [Exact commands executed and validation steps verified]

### Potential Risks & Edge Cases
- [Identified edge cases or concurrency considerations]

### Remaining Concerns & Assumptions
- [Any unverified assumptions or follow-up items]
```
