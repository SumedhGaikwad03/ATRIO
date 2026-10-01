/**
 * Determines whether a specific note is currently being edited by another user in the room.
 *
 * @param {Record<string, string>} editingUsers - Map of noteId -> userId.
 * @param {string} noteId - The ID of the note to check.
 * @param {string} currentUserId - The ID of the currently logged-in user.
 * @returns {boolean} True if another user is actively editing this note.
 */
export function isNoteBeingEditedByOther(editingUsers, noteId, currentUserId) {
  const editingUserId = editingUsers?.[noteId];
  return Boolean(editingUserId && editingUserId !== currentUserId);
}

export default isNoteBeingEditedByOther;
