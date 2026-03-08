/**
 * loginService.js
 * Handles all authentication (login/logout) API calls.
 * Backend: http://localhost:8000
 *
 * NOTE: Registration is handled separately by authService.js (port 8002).
 */

const API_BASE = "http://localhost:8000/api";

/**
 * Authenticate a user with email and password.
 */
export const login = async (email, password) => {
  clearAuth(); // Clear stale session before new login

  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Invalid email or password.");
  }
  return data;
};

/**
 * Persist auth data (token + user) to localStorage.
 */
export const saveAuth = (data) => {
  const token = data.token || data.access_token;
  const user = data.user || data.data?.user;

  if (token) localStorage.setItem("authToken", token);
  if (user) localStorage.setItem("authUser", JSON.stringify(user));
};

/**
 * Log the user out — calls /api/logout then clears local storage.
 */
export const logout = async () => {
  const token = localStorage.getItem("authToken");

  try {
    await fetch(`${API_BASE}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    // Proceed with local cleanup even if the server call fails
  } finally {
    clearAuth();
  }
};

/**
 * Remove all auth data from localStorage.
 */
export const clearAuth = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUser");
  localStorage.removeItem("userStatusSnapshot");
};

/** Check whether a session token exists. */
export const isAuthenticated = () => !!localStorage.getItem("authToken");

/** Retrieve the stored bearer token. */
export const getToken = () => localStorage.getItem("authToken");

/** Retrieve the stored user object. */
export const getUser = () => {
  const raw = localStorage.getItem("authUser");
  return raw ? JSON.parse(raw) : null;
};

/** Check whether the logged-in user has the admin role. */
export const isAdmin = () => {
  const user = getUser();
  return user?.role === "admin";
};

/** Request a password-reset email. */
export const forgotPassword = async (email) => {
  const response = await fetch(`${API_BASE}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Failed to send reset email.");
  return data;
};

/** Change password for an authenticated user. */
export const changePassword = async ({ current_password, password, password_confirmation }) => {
  const token = localStorage.getItem("authToken");
  const response = await fetch(`${API_BASE}/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ current_password, password, password_confirmation }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to change password.");
  return data;
};

/** Submit a new password using the reset token from the emailed link. */
export const resetPassword = async ({
  token,
  email,
  password,
  password_confirmation,
}) => {
  const response = await fetch(`${API_BASE}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ token, email, password, password_confirmation }),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Failed to reset password.");
  return data;
};
