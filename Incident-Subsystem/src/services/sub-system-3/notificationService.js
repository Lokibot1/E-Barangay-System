const API_BASE = "http://localhost:8000/api";

/**
 * Fetch notifications from the backend for the authenticated user.
 *
 * @param {object} options
 * @param {number} [options.perPage=50] - Max notifications to retrieve
 * @returns {Promise<object|null>} Paginated response or null on failure
 */
export const fetchNotifications = async ({ perPage = 50 } = {}) => {
  const token = localStorage.getItem("authToken");
  if (!token) return null;

  const params = new URLSearchParams({ per_page: String(perPage) });

  try {
    const res = await fetch(`${API_BASE}/notifications?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
};
