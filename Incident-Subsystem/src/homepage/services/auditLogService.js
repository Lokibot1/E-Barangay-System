import { INCIDENT_API_BASE_URL } from "../../config/runtimeApi";

const buildUrl = (params) => {
  const url = new URL(`${INCIDENT_API_BASE_URL}/audit-logs`);
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      url.searchParams.set(key, String(val));
    }
  });
  return url.toString();
};

export const fetchAuditLogs = async (params = {}) => {
  const token = localStorage.getItem("authToken");
  try {
    const response = await fetch(buildUrl(params), {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
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
