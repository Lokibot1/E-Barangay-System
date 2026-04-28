/**
 * loginService.js
 * Handles all authentication (login/logout) API calls.
 * Backend: incident-reporting API
 *
 * NOTE: Registration is handled separately by authService.js (resident backend).
 */

import { INCIDENT_API_BASE_URL } from "../../config/runtimeApi";

const API_BASE = INCIDENT_API_BASE_URL;
export const AUTH_UNAUTHORIZED_EVENT = "auth:unauthorized";
export const DEFAULT_SESSION_EXPIRED_MESSAGE =
  "Your session has expired. Please sign in again.";

const INVALID_TOKEN_STRINGS = new Set(["", "undefined", "null", "[object Object]"]);

const readTokenCandidate = (value) => {
  if (!value || typeof value !== "object") return value;

  return (
    value.plainTextToken ||
    value.plain_text_token ||
    value.access_token ||
    value.accessToken ||
    value.token ||
    value.value ||
    value.data?.plainTextToken ||
    value.data?.plain_text_token ||
    value.data?.access_token ||
    value.data?.accessToken ||
    value.data?.token ||
    ""
  );
};

export const normalizeToken = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (INVALID_TOKEN_STRINGS.has(trimmed)) return "";

    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      try {
        return normalizeToken(JSON.parse(trimmed));
      } catch {
        return trimmed.replace(/^Bearer\s+/i, "").trim();
      }
    }

    return trimmed.replace(/^Bearer\s+/i, "").trim();
  }

  if (typeof value === "object") {
    return normalizeToken(readTokenCandidate(value));
  }

  return "";
};

export const extractToken = (data) =>
  normalizeToken(
    data?.token ||
      data?.access_token ||
      data?.accessToken ||
      data?.plainTextToken ||
      data?.plain_text_token ||
      data?.data?.token ||
      data?.data?.access_token ||
      data?.data?.accessToken ||
      data?.data?.plainTextToken ||
      data?.data?.plain_text_token ||
      data?.meta?.token ||
      data?.meta?.access_token ||
      data?.authorization?.token ||
      "",
  );

export const extractUser = (data) =>
  data?.user ||
  data?.data?.user ||
  data?.account ||
  data?.data?.account ||
  data?.profile ||
  data?.data?.profile ||
  null;

const normalizeRoleValue = (role) =>
  String(role || "")
    .trim()
    .toLowerCase();

/**
 * Authenticate a user with email and password.
 */
export const login = async (identifier, password) => {
  clearAuth(); // Clear stale session before new login

  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: buildAuthHeaders({ includeJson: true }),
    body: JSON.stringify({ identifier, password }),
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
  const token = extractToken(data);
  const user = extractUser(data);

  clearAuth();

  if (token) {
    localStorage.setItem("authToken", token);
  }

  if (token && user) {
    localStorage.setItem("authUser", JSON.stringify(user));
  }

  return { token, user };
};

/**
 * Log the user out — calls /api/logout then clears local storage.
 */
export const logout = async () => {
  try {
    await fetch(`${API_BASE}/logout`, {
      method: "POST",
      headers: buildAuthHeaders({ includeJson: true }),
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

  if (typeof window !== "undefined") {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("ebs:security:two-factor:session:")) {
        sessionStorage.removeItem(key);
      }
    });
  }
};

export const replaceCurrentHistoryPath = (path = "/") => {
  if (typeof window === "undefined" || !path) return;

  try {
    window.history.replaceState(window.history.state, "", path);
  } catch {
    // Ignore history edge cases and fall back to the normal redirect flow.
  }
};

export const buildAuthHeaders = ({ includeJson = false, headers = {} } = {}) => {
  const builtHeaders = {
    Accept: "application/json",
    ...headers,
  };

  if (includeJson) {
    builtHeaders["Content-Type"] = "application/json";
  }

  const token = getToken();
  if (token) {
    builtHeaders.Authorization = `Bearer ${token}`;
  }

  return builtHeaders;
};

export const notifyAuthExpired = (
  message = DEFAULT_SESSION_EXPIRED_MESSAGE,
) => {
  clearAuth();

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(AUTH_UNAUTHORIZED_EVENT, {
        detail: { message },
      }),
    );
  }
};

export const handleUnauthorizedResponse = (
  response,
  message = DEFAULT_SESSION_EXPIRED_MESSAGE,
) => {
  if (response?.status === 401) {
    notifyAuthExpired(message);
  }

  return response;
};

/** Check whether a session token exists. */
export const isAuthenticated = () => !!getToken();

/** Retrieve the stored bearer token. */
export const getToken = () => normalizeToken(localStorage.getItem("authToken"));

/** Retrieve the stored user object. */
export const getUser = () => {
  const raw = localStorage.getItem("authUser");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const getUserRole = () => normalizeRoleValue(getUser()?.role);

export const hasRole = (...roles) => {
  const role = getUserRole();
  if (!role) return false;

  return roles
    .flat()
    .map(normalizeRoleValue)
    .includes(role);
};

const ADMIN_PANEL_ROLES = ["super_admin", "admin"];
const STAFF_PANEL_ROLES = ["super_admin", "admin", "staff"];

/** Check whether the logged-in user has the admin role. */
export const isSuperAdmin = () => hasRole("super_admin");
export const isAdmin = () => hasRole("super_admin", "admin");
export const isStaff = () => hasRole("staff");
export const isEncoder = () => hasRole("encoder");
export const isViewer = () => hasRole("viewer");
export const canAccessAdminPanel = () => hasRole(ADMIN_PANEL_ROLES);
export const canAccessStaffPanel = () => hasRole(STAFF_PANEL_ROLES);
export const getDefaultAuthenticatedPath = () => {
  if (canAccessAdminPanel()) return "/admin";
  if (canAccessStaffPanel()) return "/staff";
  return "/sub-system-2";
};
export const getProfilePath = () => {
  if (canAccessAdminPanel()) return "/admin/profile";
  if (canAccessStaffPanel()) return "/staff/profile";
  return "/profile";
};
export const mapAdminPathToAccessiblePath = (path = "") => {
  if (!path) return getDefaultAuthenticatedPath();
  if (canAccessAdminPanel() || !canAccessStaffPanel()) return path;
  return path.replace(/^\/admin(?=\/|$)/, "/staff");
};
export const canViewResidentDigitalId = () =>
  hasRole("super_admin", "admin", "staff");
export const canApproveRecords = () => canAccessStaffPanel();
export const canEditRecords = () => canAccessStaffPanel();
export const canDeleteRecords = () => hasRole("super_admin", "admin");
export const canViewResidents = () => canAccessStaffPanel();
export const canManageResidents = () => canEditRecords();
export const canManageHouseholds = () => canAccessStaffPanel();
export const canAccessVerificationQueue = () => canAccessStaffPanel();
export const canViewIncidentCases = () => canAccessStaffPanel();
export const canManageIncidentCases = () => canAccessStaffPanel();
export const canViewAppointments = () => canAccessStaffPanel();
export const canManageAppointments = () => canAccessStaffPanel();
export const canViewDocuments = () => canAccessStaffPanel();
export const canProcessDocuments = () => canAccessStaffPanel();
export const canManageAccounts = () => hasRole("super_admin", "admin");
export const canManageSystemSettings = () =>
  hasRole("super_admin", "admin");
export const canViewAnalytics = () => canAccessAdminPanel();

/** Request a password-reset email. */
export const forgotPassword = async (email) => {
  const response = await fetch(`${API_BASE}/forgot-password`, {
    method: "POST",
    headers: buildAuthHeaders({ includeJson: true }),
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Failed to send reset email.");
  return data;
};

/** Change password for an authenticated user. */
export const changePassword = async ({
  current_password,
  new_password,
  new_password_confirmation,
}) => {
  const response = await fetch(`${API_BASE}/change-password`, {
    method: "POST",
    headers: buildAuthHeaders({ includeJson: true }),
    body: JSON.stringify({ current_password, new_password, new_password_confirmation }),
  });
  handleUnauthorizedResponse(response);
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Failed to change password.");
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
    headers: buildAuthHeaders({ includeJson: true }),
    body: JSON.stringify({ token, email, password, password_confirmation }),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Failed to reset password.");
  return data;
};
