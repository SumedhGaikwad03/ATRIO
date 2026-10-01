import { isTokenValid } from "./auth";

describe("utils/auth - isTokenValid", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const createMockToken = (payload) => {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const body = btoa(JSON.stringify(payload));
    const signature = "signature";
    return `${header}.${body}.${signature}`;
  };

  test("returns false when no token is present in localStorage", () => {
    expect(isTokenValid()).toBe(false);
  });

  test("returns true for a valid JWT token with a future expiration time", () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour in the future
    const token = createMockToken({ exp: futureExp, userId: "user-123" });

    localStorage.setItem("token", token);

    expect(isTokenValid()).toBe(true);
  });

  test("returns false for an expired JWT token", () => {
    const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour in the past
    const token = createMockToken({ exp: pastExp, userId: "user-123" });

    localStorage.setItem("token", token);

    expect(isTokenValid()).toBe(false);
  });

  test("returns false for a malformed token string", () => {
    localStorage.setItem("token", "invalid.token.string");

    expect(isTokenValid()).toBe(false);
  });

  test("returns false for a non-JWT random string", () => {
    localStorage.setItem("token", "some-random-gibberish");

    expect(isTokenValid()).toBe(false);
  });

  test("returns false when token payload lacks an exp claim", () => {
    const token = createMockToken({ userId: "user-123" });

    localStorage.setItem("token", token);

    expect(isTokenValid()).toBe(false);
  });
});
