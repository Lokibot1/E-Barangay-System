import { INCIDENT_API_BASE_URL, PHP_API_BASE_URL } from "../../config/runtimeApi";

const buildUrl = (params) => {
  const url = new URL(`${INCIDENT_API_BASE_URL}/audit-logs`);
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      url.searchParams.set(key, String(val));
    }
  });
  return url.toString();
};

const buildVerificationLogUrl = (params = {}) => {
  const url = new URL(`${PHP_API_BASE_URL}/shared/verification-admin-logs.php`);
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      url.searchParams.set(key, String(val));
    }
  });
  return url.toString();
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const fetchAuditLogs = async (params = {}) => {
  try {
    const response = await fetch(buildUrl(params), {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch audit logs.");
    }
    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Audit log backend is unavailable.");
    }
    throw error;
  }
};

export const fetchVerificationAdminLogs = async (params = {}) => {
  try {
    const response = await fetch(buildVerificationLogUrl(params), {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch verification logs.");
    }
    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Verification log backend is unavailable.");
    }
    throw error;
  }
};

export const createVerificationAdminLog = async (payload) => {
  try {
    const response = await fetch(buildVerificationLogUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to save verification log.");
    }
    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Verification log backend is unavailable.");
    }
    throw error;
  }
};
