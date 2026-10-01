/**
 * Pure deterministic rotation calculation for note cards.
 * Computes a small tilt angle (-3deg to +3deg) based on the note ID hash.
 *
 * @param {string} id - The note ID.
 * @returns {number} The rotation angle in degrees.
 */
export function getNoteRotation(id) {
  const seed = id.slice(-3);

  return (parseInt(seed, 16) % 5 - 2) * 1.5;
}

export default getNoteRotation;
