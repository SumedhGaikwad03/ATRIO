import api from "../../../utils/api";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "./taskService";

jest.mock("../../../utils/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("features/tasks/services/taskService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getTasks sends GET request to /rooms/:roomId/tasks", async () => {
    const roomId = "room-123";
    const mockResponse = { data: [{ _id: "task-1", text: "Buy milk", completed: false }] };
    api.get.mockResolvedValueOnce(mockResponse);

    const result = await getTasks(roomId);

    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(`/rooms/${roomId}/tasks`);
    expect(result).toBe(mockResponse);
  });

  test("createTask sends POST request to /rooms/:roomId/tasks with text payload", async () => {
    const roomId = "room-123";
    const taskText = "Implement auth middleware";
    const mockResponse = { data: { _id: "task-new", text: taskText, completed: false } };
    api.post.mockResolvedValueOnce(mockResponse);

    const result = await createTask(roomId, taskText);

    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith(`/rooms/${roomId}/tasks`, { text: taskText });
    expect(result).toBe(mockResponse);
  });

  test("updateTask sends PUT request to /rooms/:roomId/tasks/:taskId with update payload", async () => {
    const roomId = "room-123";
    const taskId = "task-456";
    const updatePayload = { completed: true };
    const mockResponse = { data: { _id: taskId, completed: true } };
    api.put.mockResolvedValueOnce(mockResponse);

    const result = await updateTask(roomId, taskId, updatePayload);

    expect(api.put).toHaveBeenCalledTimes(1);
    expect(api.put).toHaveBeenCalledWith(`/rooms/${roomId}/tasks/${taskId}`, updatePayload);
    expect(result).toBe(mockResponse);
  });

  test("deleteTask sends DELETE request to /rooms/:roomId/tasks/:taskId", async () => {
    const roomId = "room-123";
    const taskId = "task-456";
    const mockResponse = { data: { message: "Task deleted" } };
    api.delete.mockResolvedValueOnce(mockResponse);

    const result = await deleteTask(roomId, taskId);

    expect(api.delete).toHaveBeenCalledTimes(1);
    expect(api.delete).toHaveBeenCalledWith(`/rooms/${roomId}/tasks/${taskId}`);
    expect(result).toBe(mockResponse);
  });
});
