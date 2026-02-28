const API_BASE = "http://localhost:8000/api";

/**
 * Notify a user that their appointment has been rescheduled.
 * Called automatically by the backend when notify_user: true is passed
 * to the appointment update endpoint; this helper is provided for cases
 * where a direct front-end trigger is needed.
 *
 * @param {number|string} appointmentId
 * @returns {Promise<object|null>}
 */
export const notifyAppointmentReschedule = async (appointmentId) => {
  const token = localStorage.getItem("authToken");
  if (!token) return null;

  try {
    const res = await fetch(
      `${API_BASE}/appointments/${appointmentId}/notify-reschedule`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
};

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
