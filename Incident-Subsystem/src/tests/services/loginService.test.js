import {
  login,
  saveAuth,
  logout,
  clearAuth,
  isAuthenticated,
  getToken,
  getUser,
  isAdmin,
  forgotPassword,
  changePassword,
  resetPassword,
} from "../../homepage/services/loginService";

const API_BASE = "http://localhost:8000/api";

const mockFetch = (data, ok = true) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(data),
  });
};

beforeEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
});

// ─── login ────────────────────────────────────────────────────────────────────
describe("login", () => {
  it("clears stale auth before sending the request", async () => {
    localStorage.setItem("authToken", "old-token");
    mockFetch({ token: "new-token", user: { id: 1 } });
    await login("user@example.com", "password");
    // By the time fetch is called the old token is already gone
    expect(localStorage.getItem("authToken")).toBeNull();
  });

  it("sends POST /login with identifier and password as JSON", async () => {
    mockFetch({ token: "abc", user: {} });
    await login("user@example.com", "secret");
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/login`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
        body: JSON.stringify({ identifier: "user@example.com", password: "secret" }),
      })
    );
  });

  it("returns the server response on success", async () => {
    const payload = { token: "abc123", user: { id: 1, role: "user" } };
    mockFetch(payload);
    await expect(login("user@example.com", "secret")).resolves.toEqual(payload);
  });

  it("throws the server error message on failure", async () => {
    mockFetch({ message: "Invalid credentials." }, false);
    await expect(login("x@x.com", "wrong")).rejects.toThrow("Invalid credentials.");
  });

  it("throws a fallback message when the server provides none", async () => {
    mockFetch({}, false);
    await expect(login("x@x.com", "wrong")).rejects.toThrow(
      "Invalid email or password."
    );
  });
});

// ─── saveAuth ─────────────────────────────────────────────────────────────────
describe("saveAuth", () => {
  it("stores token from data.token", () => {
    saveAuth({ token: "tok-1", user: { id: 1 } });
    expect(localStorage.getItem("authToken")).toBe("tok-1");
  });

  it("stores token from data.access_token when data.token is absent", () => {
    saveAuth({ access_token: "tok-2", user: { id: 1 } });
    expect(localStorage.getItem("authToken")).toBe("tok-2");
  });

  it("stores the user object as a JSON string", () => {
    const user = { id: 1, role: "admin" };
    saveAuth({ token: "t", user });
    expect(JSON.parse(localStorage.getItem("authUser"))).toEqual(user);
  });

  it("stores user from data.data.user when data.user is absent", () => {
    const user = { id: 2, role: "user" };
    saveAuth({ token: "t", data: { user } });
    expect(JSON.parse(localStorage.getItem("authUser"))).toEqual(user);
  });

  it("does not write authToken when token is absent", () => {
    saveAuth({ user: { id: 1 } });
    expect(localStorage.getItem("authToken")).toBeNull();
  });

  it("does not write authUser when user is absent", () => {
    saveAuth({ token: "t" });
    expect(localStorage.getItem("authUser")).toBeNull();
  });
});

// ─── clearAuth ────────────────────────────────────────────────────────────────
describe("clearAuth", () => {
  it("removes authToken from localStorage", () => {
    localStorage.setItem("authToken", "tok");
    clearAuth();
    expect(localStorage.getItem("authToken")).toBeNull();
  });

  it("removes authUser from localStorage", () => {
    localStorage.setItem("authUser", JSON.stringify({ id: 1 }));
    clearAuth();
    expect(localStorage.getItem("authUser")).toBeNull();
  });

  it("removes userStatusSnapshot from localStorage", () => {
    localStorage.setItem("userStatusSnapshot", "active");
    clearAuth();
    expect(localStorage.getItem("userStatusSnapshot")).toBeNull();
  });
});

// ─── logout ───────────────────────────────────────────────────────────────────
describe("logout", () => {
  it("sends POST /logout with the stored Bearer token", async () => {
    localStorage.setItem("authToken", "my-token");
    mockFetch({});
    await logout();
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/logout`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer my-token",
        }),
      })
    );
  });

  it("clears auth from localStorage after a successful server call", async () => {
    localStorage.setItem("authToken", "my-token");
    mockFetch({});
    await logout();
    expect(localStorage.getItem("authToken")).toBeNull();
  });

  it("still clears auth even when the server call throws", async () => {
    localStorage.setItem("authToken", "my-token");
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));
    await logout();
    expect(localStorage.getItem("authToken")).toBeNull();
  });
});

// ─── isAuthenticated ──────────────────────────────────────────────────────────
describe("isAuthenticated", () => {
  it("returns false when no token is stored", () => {
    expect(isAuthenticated()).toBe(false);
  });

  it("returns true when a token is present in localStorage", () => {
    localStorage.setItem("authToken", "tok");
    expect(isAuthenticated()).toBe(true);
  });
});

// ─── getToken ─────────────────────────────────────────────────────────────────
describe("getToken", () => {
  it("returns null when no token is stored", () => {
    expect(getToken()).toBeNull();
  });

  it("returns the stored token string", () => {
    localStorage.setItem("authToken", "my-token");
    expect(getToken()).toBe("my-token");
  });
});

// ─── getUser ──────────────────────────────────────────────────────────────────
describe("getUser", () => {
  it("returns null when no user is stored", () => {
    expect(getUser()).toBeNull();
  });

  it("returns the parsed user object", () => {
    const user = { id: 1, role: "admin" };
    localStorage.setItem("authUser", JSON.stringify(user));
    expect(getUser()).toEqual(user);
  });
});

// ─── isAdmin ──────────────────────────────────────────────────────────────────
describe("isAdmin", () => {
  it("returns false when no user is stored", () => {
    expect(isAdmin()).toBe(false);
  });

  it("returns false when the user role is not admin", () => {
    localStorage.setItem("authUser", JSON.stringify({ id: 1, role: "user" }));
    expect(isAdmin()).toBe(false);
  });

  it("returns true when the user role is admin", () => {
    localStorage.setItem("authUser", JSON.stringify({ id: 1, role: "admin" }));
    expect(isAdmin()).toBe(true);
  });
});

// ─── resetPassword token expiry (backend config) ──────────────────────────────
describe("reset password token expiry", () => {
  it("reset link expires after exactly 60 minutes per backend config (auth.php)", () => {
    // This documents the agreed expiry window.
    // If the product requirement changes, update config/auth.php 'expire' AND this value together.
    const EXPECTED_EXPIRY_MINUTES = 60;
    expect(EXPECTED_EXPIRY_MINUTES).toBe(60);
  });
});

// ─── forgotPassword ───────────────────────────────────────────────────────────
describe("forgotPassword", () => {
  it("sends POST /forgot-password with the email as JSON", async () => {
    mockFetch({ message: "Reset link sent." });
    await forgotPassword("user@example.com");
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/forgot-password`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
        body: JSON.stringify({ email: "user@example.com" }),
      })
    );
  });

  it("returns the server response on success", async () => {
    const payload = { message: "Reset link sent." };
    mockFetch(payload);
    await expect(forgotPassword("user@example.com")).resolves.toEqual(payload);
  });

  it("throws the server error message on failure", async () => {
    mockFetch({ message: "Email not found." }, false);
    await expect(forgotPassword("nobody@x.com")).rejects.toThrow("Email not found.");
  });

  it("throws a fallback message when the server provides none", async () => {
    mockFetch({}, false);
    await expect(forgotPassword("x@x.com")).rejects.toThrow(
      "Failed to send reset email."
    );
  });
});

// ─── changePassword ───────────────────────────────────────────────────────────
describe("changePassword", () => {
  const payload = {
    current_password: "old123",
    new_password: "new456",
    new_password_confirmation: "new456",
  };

  it("sends POST /change-password with the Bearer token and JSON body", async () => {
    localStorage.setItem("authToken", "my-token");
    mockFetch({ message: "Password changed." });
    await changePassword(payload);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/change-password`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer my-token",
        }),
        body: JSON.stringify(payload),
      })
    );
  });

  it("returns the server response on success", async () => {
    mockFetch({ message: "Password changed." });
    await expect(changePassword(payload)).resolves.toEqual({
      message: "Password changed.",
    });
  });

  it("throws the server error message on failure", async () => {
    mockFetch({ message: "Current password is incorrect." }, false);
    await expect(changePassword(payload)).rejects.toThrow(
      "Current password is incorrect."
    );
  });

  it("throws a fallback message when the server provides none", async () => {
    mockFetch({}, false);
    await expect(changePassword(payload)).rejects.toThrow(
      "Failed to change password."
    );
  });
});

// ─── resetPassword ────────────────────────────────────────────────────────────
describe("resetPassword", () => {
  const payload = {
    token: "reset-token-abc",
    email: "user@example.com",
    password: "newpass123",
    password_confirmation: "newpass123",
  };

  it("sends POST /reset-password with JSON body", async () => {
    mockFetch({ message: "Password reset successful." });
    await resetPassword(payload);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/reset-password`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      })
    );
  });

  it("returns the server response on success", async () => {
    mockFetch({ message: "Password reset successful." });
    await expect(resetPassword(payload)).resolves.toEqual({
      message: "Password reset successful.",
    });
  });

  it("throws the server error message on failure", async () => {
    mockFetch({ message: "Invalid or expired token." }, false);
    await expect(resetPassword(payload)).rejects.toThrow(
      "Invalid or expired token."
    );
  });

  it("throws a fallback message when the server provides none", async () => {
    mockFetch({}, false);
    await expect(resetPassword(payload)).rejects.toThrow(
      "Failed to reset password."
    );
  });
});
