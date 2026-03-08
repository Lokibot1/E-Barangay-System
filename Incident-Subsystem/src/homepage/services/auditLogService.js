const API_BASE = "http://localhost:8000/api";

export const fetchAuditLogs = async (params = {}) => {
  const token = localStorage.getItem("authToken");
  const url = new URL(`${API_BASE}/audit-logs`);

  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      url.searchParams.set(key, String(val));
    }
  });

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch audit logs.");
  return data;
};
