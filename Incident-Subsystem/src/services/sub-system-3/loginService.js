const API_BASE = "http://localhost:8000/api";

/**
 * Authenticate a user with email and password.
 * Sends a POST request to /api/login and returns the parsed JSON response.
 */
export const login = async (email, password) => {
  // Clear any stale session before attempting a fresh login
  clearAuth();

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
  if (data.token) {
    localStorage.setItem("authToken", data.token);
  }
  if (data.user) {
    localStorage.setItem("authUser", JSON.stringify(data.user));
  }
};

/**
 * Log the user out by calling /api/logout, then clear local auth data.
 */
export const logout = async () => {
  const token = localStorage.getItem("authToken");

  await fetch(`${API_BASE}/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  clearAuth();
};

/**
 * Remove auth data from localStorage.
 */
export const clearAuth = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUser");
  localStorage.removeItem("userStatusSnapshot");
  localStorage.removeItem("userNotifications");
};

/**
 * Check whether the user is currently authenticated.
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem("authToken");
};

/**
 * Retrieve the stored auth token.
 */
export const getToken = () => {
  return localStorage.getItem("authToken");
};

/**
 * Retrieve the stored user object.
 */
export const getUser = () => {
  const user = localStorage.getItem("authUser");
  return user ? JSON.parse(user) : null;
};

/**
 * Check whether the logged-in user has the admin role.
 */
export const isAdmin = () => {
  const user = getUser();
  return user?.role === "admin";
};
