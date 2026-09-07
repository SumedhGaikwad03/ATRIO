# Atrio — Domain & Data Model

## 1. ENTITY-RELATIONSHIP DIAGRAM

```text
┌─────────────────────────┐
│          User           │
├─────────────────────────┤
│ _id: ObjectId           │
│ username: String (uq)   │
│ email: String (uq)      │
│ password: String (hash) │
│ passwordChangedAt: Date │
│ createdAt / updatedAt   │
└────────────┬────────────┘
             │ 1:N (createdBy / members)
             ▼
┌─────────────────────────┐
│          Room           │
├─────────────────────────┤
│ _id: ObjectId           │
│ name: String            │
│ createdBy: Ref<User>    │
│ members: [Ref<User>]    │
│ createdAt / updatedAt   │
└──────┬────────────┬─────┘
       │ 1:N        │ 1:N
       ▼            ▼
┌──────────────┐ ┌──────────────┐
│     Note     │ │     Task     │
├──────────────┤ ├──────────────┤
│ _id: ObjId   │ │ _id: ObjId   │
│ title: Str   │ │ room: Ref    │
│ content: Str │ │ text: Str    │
│ user: Ref    │ │ completed: B │
│ room: Ref    │ │ createdBy    │
│ createdAt    │ │ completedAt  │
└──────────────┘ └──────────────┘
```

---

## 2. DETAILED SCHEMA SPECIFICATIONS

### `User` Collection (`backend/models/User_Model.js`)
* **Primary Key:** `_id` (`mongoose.Schema.Types.ObjectId`)
* **Fields:**
  * `username` (`String`, required, unique, trim, lowercase)
  * `email` (`String`, required, unique, trim, lowercase)
  * `password` (`String`, required — bcrypt hashed with salt 10)
  * `passwordChangedAt` (`Date` — set during password updates)
  * `timestamps` (`createdAt`, `updatedAt`)
* **Hooks:**
  * `pre("save")`: Automatically salts and hashes `password` if modified; adjusts `passwordChangedAt = Date.now() - 1000` to prevent token generation race conditions.

---

### `Room` Collection (`backend/models/room.js`)
* **Primary Key:** `_id` (`mongoose.Schema.Types.ObjectId`)
* **Fields:**
  * `name` (`String`, required, trim)
  * `createdBy` (`ObjectId`, ref: `User`, required)
  * `members` (`[ObjectId]`, ref: `User` — array of authorized collaborators)
  * `timestamps` (`createdAt`, `updatedAt`)
* **Domain Rules & Lifecycle:**
  * The creator is automatically added to `members` on creation.
  * Adding a member uses `$addToSet` to prevent duplicate membership.
  * Leaving a room removes the user ID from `members`. If `members.length === 0`, the room document is deleted.
* **Hooks:**
  * `pre("findOneAndDelete")`: Cascades deletion to remove all `Note` and `Task` documents where `roomId === room._id`.

---

### `Note` Collection (`backend/models/note.js`)
* **Primary Key:** `_id` (`mongoose.Schema.Types.ObjectId`)
* **Fields:**
  * `title` (`String`, required, trim)
  * `content` (`String`, required, trim)
  * `user` (`ObjectId`, ref: `User`, required — original author)
  * `room` (`ObjectId`, ref: `Room`, required — parent workspace)
  * `createdAt` (`Date`, default: `Date.now`)
* **Authorization Invariant:**
  * Creation and mutation require `room.members.includes(req.userId)`.

---

### `Task` Collection (`backend/models/task.js`)
* **Primary Key:** `_id` (`mongoose.Schema.Types.ObjectId`)
* **Fields:**
  * `room` (`ObjectId`, ref: `Room`, required, indexed: `true`)
  * `text` (`String`, required, trim, maxlength: `200`)
  * `completed` (`Boolean`, default: `false`)
  * `createdBy` (`ObjectId`, ref: `User`, required)
  * `completedAt` (`Date`, default: `null`)
  * `timestamps` (`createdAt`, `updatedAt`)
* **Indexing:**
  * `{ room: 1 }` index for rapid retrieval during room hydration.
* **Sorting Invariant:**
  * Tasks are sorted with `completed: 1` (uncompleted first), `completedAt: 1`, and `createdAt: 1`.
