import api from "../../../utils/api";
import {
  getMyRooms,
  getRoom,
  createRoom,
  addMember,
  leaveRoom,
} from "./roomService";

jest.mock("../../../utils/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("features/rooms/services/roomService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getMyRooms sends GET request to /rooms/myrooms", async () => {
    const mockResponse = { data: [{ _id: "room-1", name: "General" }] };
    api.get.mockResolvedValueOnce(mockResponse);

    const result = await getMyRooms();

    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith("/rooms/myrooms");
    expect(result).toBe(mockResponse);
  });

  test("getRoom sends GET request to /rooms/:roomId", async () => {
    const roomId = "room-123";
    const mockResponse = { data: { _id: roomId, name: "Sprint Planning" } };
    api.get.mockResolvedValueOnce(mockResponse);

    const result = await getRoom(roomId);

    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(`/rooms/${roomId}`);
    expect(result).toBe(mockResponse);
  });

  test("createRoom sends POST request to /rooms/create with room name", async () => {
    const roomName = "Architecture Discussion";
    const mockResponse = { data: { _id: "room-456", name: roomName } };
    api.post.mockResolvedValueOnce(mockResponse);

    const result = await createRoom(roomName);

    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith("/rooms/create", { name: roomName });
    expect(result).toBe(mockResponse);
  });

  test("addMember sends PUT request to /rooms/:roomId/add-member with member data", async () => {
    const roomId = "room-123";
    const memberData = { userEmail: "colleague@example.com" };
    const mockResponse = { data: { message: "Member added" } };
    api.put.mockResolvedValueOnce(mockResponse);

    const result = await addMember(roomId, memberData);

    expect(api.put).toHaveBeenCalledTimes(1);
    expect(api.put).toHaveBeenCalledWith(`/rooms/${roomId}/add-member`, memberData);
    expect(result).toBe(mockResponse);
  });

  test("leaveRoom sends DELETE request to /rooms/:roomId/leave", async () => {
    const roomId = "room-123";
    const mockResponse = { data: { message: "Left room successfully" } };
    api.delete.mockResolvedValueOnce(mockResponse);

    const result = await leaveRoom(roomId);

    expect(api.delete).toHaveBeenCalledTimes(1);
    expect(api.delete).toHaveBeenCalledWith(`/rooms/${roomId}/leave`);
    expect(result).toBe(mockResponse);
  });
});
