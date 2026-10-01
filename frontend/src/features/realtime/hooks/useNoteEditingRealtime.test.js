import socket from "../../../sockets";
import useNoteEditingRealtime from "./useNoteEditingRealtime";

jest.mock("../../../sockets", () => ({
  __esModule: true,
  default: {
    emit: jest.fn(),
  },
}));

describe("features/realtime/hooks/useNoteEditingRealtime", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("startEditing emits note_editing_start with roomId and noteId", () => {
    const roomId = "room-123";
    const noteId = "note-456";

    const { startEditing } = useNoteEditingRealtime(roomId);
    startEditing(noteId);

    expect(socket.emit).toHaveBeenCalledTimes(1);
    expect(socket.emit).toHaveBeenCalledWith("note_editing_start", {
      roomId,
      noteId,
    });
  });

  test("stopEditing emits note_editing_stop with roomId and noteId", () => {
    const roomId = "room-123";
    const noteId = "note-456";

    const { stopEditing } = useNoteEditingRealtime(roomId);
    stopEditing(noteId);

    expect(socket.emit).toHaveBeenCalledTimes(1);
    expect(socket.emit).toHaveBeenCalledWith("note_editing_stop", {
      roomId,
      noteId,
    });
  });

  test("supports object configuration with custom socket or roomId property", () => {
    const customSocket = { emit: jest.fn() };
    const roomId = "room-custom";
    const noteId = "note-789";

    const { startEditing, stopEditing } = useNoteEditingRealtime(customSocket, roomId);
    startEditing(noteId);
    stopEditing(noteId);

    expect(customSocket.emit).toHaveBeenCalledWith("note_editing_start", {
      roomId,
      noteId,
    });
    expect(customSocket.emit).toHaveBeenCalledWith("note_editing_stop", {
      roomId,
      noteId,
    });
  });
});
