import { isNoteBeingEditedByOther } from "./presence";

describe("features/realtime/utils/presence - isNoteBeingEditedByOther", () => {
  const currentUserId = "user-123";
  const otherUserId = "user-456";
  const noteId = "note-789";

  test("returns true when note is being edited by another user", () => {
    const editingUsers = {
      [noteId]: otherUserId,
    };

    expect(isNoteBeingEditedByOther(editingUsers, noteId, currentUserId)).toBe(true);
  });

  test("returns false when note is being edited by the current user", () => {
    const editingUsers = {
      [noteId]: currentUserId,
    };

    expect(isNoteBeingEditedByOther(editingUsers, noteId, currentUserId)).toBe(false);
  });

  test("returns false when note is not in the editing map", () => {
    const editingUsers = {
      "other-note-001": otherUserId,
    };

    expect(isNoteBeingEditedByOther(editingUsers, noteId, currentUserId)).toBe(false);
  });

  test("returns false when editingUsers is empty", () => {
    expect(isNoteBeingEditedByOther({}, noteId, currentUserId)).toBe(false);
  });

  test("returns false when editingUsers is null or undefined", () => {
    expect(isNoteBeingEditedByOther(null, noteId, currentUserId)).toBe(false);
    expect(isNoteBeingEditedByOther(undefined, noteId, currentUserId)).toBe(false);
  });

  test("correctly discriminates between multiple notes and editors", () => {
    const editingUsers = {
      "note-mine": currentUserId,
      "note-theirs": otherUserId,
      "note-another": "user-999",
    };

    expect(isNoteBeingEditedByOther(editingUsers, "note-mine", currentUserId)).toBe(false);
    expect(isNoteBeingEditedByOther(editingUsers, "note-theirs", currentUserId)).toBe(true);
    expect(isNoteBeingEditedByOther(editingUsers, "note-another", currentUserId)).toBe(true);
    expect(isNoteBeingEditedByOther(editingUsers, "note-untracked", currentUserId)).toBe(false);
  });
});
