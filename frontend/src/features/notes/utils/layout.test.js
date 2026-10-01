import { getNoteRotation } from "./layout";

describe("features/notes/utils/layout - getNoteRotation", () => {
  test("returns the exact same rotation for the same note ID (deterministic)", () => {
    const id = "65f1a2b3c4d5e6f7a8b9c0d1";
    const rotation1 = getNoteRotation(id);
    const rotation2 = getNoteRotation(id);

    expect(rotation1).toBe(rotation2);
  });

  test("returns a number within the expected range [-3, 3] degrees", () => {
    const sampleIds = [
      "65f1a2b3c4d5e6f7a8b9c0d1",
      "65f1a2b3c4d5e6f7a8b9c0d2",
      "65f1a2b3c4d5e6f7a8b9c0d3",
      "65f1a2b3c4d5e6f7a8b9c0d4",
      "65f1a2b3c4d5e6f7a8b9c0d5",
      "65f1a2b3c4d5e6f7a8b9c0da",
      "65f1a2b3c4d5e6f7a8b9c0ff",
      "temp-1700000000000",
      "note-abc",
    ];

    const validAngles = [-3, -1.5, 0, 1.5, 3];

    sampleIds.forEach((id) => {
      const rotation = getNoteRotation(id);
      expect(typeof rotation).toBe("number");
      expect(rotation).toBeGreaterThanOrEqual(-3);
      expect(rotation).toBeLessThanOrEqual(3);
      expect(validAngles).toContain(rotation);
    });
  });

  test("produces different rotations for different IDs with distinct seeds", () => {
    // 0x000 % 5 = 0 -> -3
    // 0x001 % 5 = 1 -> -1.5
    // 0x002 % 5 = 2 -> 0
    // 0x003 % 5 = 3 -> 1.5
    // 0x004 % 5 = 4 -> 3
    expect(getNoteRotation("id_000")).toBe(-3);
    expect(getNoteRotation("id_001")).toBe(-1.5);
    expect(getNoteRotation("id_002")).toBe(0);
    expect(getNoteRotation("id_003")).toBe(1.5);
    expect(getNoteRotation("id_004")).toBe(3);
  });
});
