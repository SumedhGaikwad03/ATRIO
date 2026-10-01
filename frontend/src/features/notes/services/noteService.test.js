import api from "../../../utils/api";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from "./noteService";

jest.mock("../../../utils/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("features/notes/services/noteService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getNotes sends GET request to /rooms/:roomId/notes", async () => {
    const roomId = "room-123";
    const mockResponse = { data: [{ _id: "note-1", title: "Note 1" }] };
    api.get.mockResolvedValueOnce(mockResponse);

    const result = await getNotes(roomId);

    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(`/rooms/${roomId}/notes`);
    expect(result).toBe(mockResponse);
  });

  test("createNote sends POST request to /notes/add with note data", async () => {
    const noteData = {
      title: "New Note",
      content: "Note content here",
      roomId: "room-123",
    };
    const mockResponse = { data: { _id: "note-new", ...noteData } };
    api.post.mockResolvedValueOnce(mockResponse);

    const result = await createNote(noteData);

    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith("/notes/add", noteData);
    expect(result).toBe(mockResponse);
  });

  test("updateNote sends PUT request to /notes/update/:noteId with update payload", async () => {
    const noteId = "note-123";
    const updatePayload = {
      title: "Updated Title",
      content: "Updated Content",
    };
    const mockResponse = { data: { _id: noteId, ...updatePayload } };
    api.put.mockResolvedValueOnce(mockResponse);

    const result = await updateNote(noteId, updatePayload);

    expect(api.put).toHaveBeenCalledTimes(1);
    expect(api.put).toHaveBeenCalledWith(`/notes/update/${noteId}`, updatePayload);
    expect(result).toBe(mockResponse);
  });

  test("deleteNote sends DELETE request to /notes/delete/:noteId", async () => {
    const noteId = "note-123";
    const mockResponse = { data: { message: "Note deleted" } };
    api.delete.mockResolvedValueOnce(mockResponse);

    const result = await deleteNote(noteId);

    expect(api.delete).toHaveBeenCalledTimes(1);
    expect(api.delete).toHaveBeenCalledWith(`/notes/delete/${noteId}`);
    expect(result).toBe(mockResponse);
  });
});
