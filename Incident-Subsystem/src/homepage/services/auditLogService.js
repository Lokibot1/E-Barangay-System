const PORTS = [8000, 8001, 8002];

const buildUrl = (port, params) => {
  const url = new URL(`http://localhost:${port}/api/audit-logs`);
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      url.searchParams.set(key, String(val));
    }
  });
  return url.toString();
};

const fetchFromPort = async (port, params) => {
  const token = localStorage.getItem("authToken");
  const response = await fetch(buildUrl(port, params), {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `Port ${port}: request failed.`);
  return data;
};

export const fetchAuditLogs = async (params = {}) => {
  const results = await Promise.allSettled(PORTS.map((port) => fetchFromPort(port, params)));

  const allItems = [];
  let maxLastPage = 1;
  let allFailed = true;
  let firstError = null;

  results.forEach((result) => {
    if (result.status === "fulfilled") {
      allFailed = false;
      allItems.push(...(result.value.data || []));
      const lp = result.value.meta?.last_page ?? 1;
      if (lp > maxLastPage) maxLastPage = lp;
    } else if (!firstError) {
      firstError = result.reason;
    }
  });

  if (allFailed) {
    throw new Error(firstError?.message || "Failed to fetch audit logs.");
  }

  // Deduplicate by id
  const seen = new Set();
  const unique = allItems.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });

  // Sort by created_at descending (most recent first, LIFO)
  unique.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return { data: unique, meta: { last_page: maxLastPage } };
};
