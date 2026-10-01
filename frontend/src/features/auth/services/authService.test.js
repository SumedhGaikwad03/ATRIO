import api from "../../../utils/api";
import { signup, login } from "./authService";

jest.mock("../../../utils/api", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

describe("features/auth/services/authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("signup sends POST request to /auth/signup with payload", async () => {
    const payload = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    };
    const mockResponse = { data: { message: "User registered" } };
    api.post.mockResolvedValueOnce(mockResponse);

    const result = await signup(payload);

    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith("/auth/signup", payload);
    expect(result).toBe(mockResponse);
  });

  test("login sends POST request to /auth/login with credentials", async () => {
    const credentials = {
      email: "test@example.com",
      password: "password123",
    };
    const mockResponse = { data: { token: "jwt-token-xyz", username: "testuser" } };
    api.post.mockResolvedValueOnce(mockResponse);

    const result = await login(credentials);

    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith("/auth/login", credentials);
    expect(result).toBe(mockResponse);
  });
});
