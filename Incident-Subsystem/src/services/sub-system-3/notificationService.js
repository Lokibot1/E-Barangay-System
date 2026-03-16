const resolveHost = () => {
  if (import.meta.env.VITE_NOTIF_API_HOST) return import.meta.env.VITE_NOTIF_API_HOST;
  if (typeof window !== "undefined" && window.location?.hostname) {
    return window.location.hostname;
  }
  return "127.0.0.1";
};

const NOTIF_API_BASE = import.meta.env.VITE_NOTIF_API_BASE;
const API_MODE = NOTIF_API_BASE ? "rest" : "php";
const API_HOST = resolveHost();
const API_BASE = NOTIF_API_BASE || `http://${API_HOST}/E-Barangay-System/api`;
const NOTIF_ENDPOINT = API_MODE === "php"
  ? `${API_BASE}/notifications/notifications.php`
  : `${API_BASE}/notifications`;
const APPT_NOTIFY_ENDPOINT = API_MODE === "php"
  ? `${API_BASE}/appointments/notify-reschedule.php`
  : null;

const getAuthUser = () => {
  try {
    return JSON.parse(localStorage.getItem("authUser") || "{}");
  } catch {
    return {};
  }
};

const resolveUserContext = ({ scope, userId, user_id } = {}) => {
  const user = getAuthUser();
  const resolvedScope = scope || (user?.role === "admin" ? "admin" : "user");
  const fallbackId = user?.id ?? user?.resident_id ?? user?.residentId ?? null;
  const resolvedUserId =
    userId !== undefined
      ? userId
      : user_id !== undefined
        ? user_id
        : fallbackId;
  return { scope: resolvedScope, userId: resolvedUserId };
};

const resolveTimestamp = (value) => {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

const deriveExternalId = (notification) => {
  if (!notification) return "";
  if (notification.externalId) return notification.externalId;

  const data = notification.data || {};
  const source = notification.source || "";
  const oldStatus = notification.oldStatus || data.old_status || "";
  const newStatus = notification.newStatus || data.new_status || "";
  const baseId =
    data.id ??
    data.incident_id ??
    data.complaint_id ??
    data.report_id ??
    data.appointment_id ??
    null;

  if (oldStatus || newStatus) {
    if (baseId !== null && baseId !== undefined && baseId !== "") {
      return `status-${source || "report"}-${baseId}-${oldStatus}-${newStatus}`;
    }
  }

  if (source === "appointment" || notification.type === "appointment_scheduled") {
    const apptId = data.appointment?.id || data.appointment_id || data.id;
    const complaintId = data.complaint_id || data.complaintId || "x";
    if (apptId) return `appointment-${complaintId}-${apptId}`;
  }

  if (notification.id) return notification.id;
  return "";
};

const buildNotificationPayload = (notification, overrides = {}) => {
  const { scope, userId } = resolveUserContext(overrides);
  const externalId =
    overrides.externalId ??
    overrides.external_id ??
    deriveExternalId(notification);
  const message =
    notification?.description ||
    notification?.message ||
    notification?.type ||
    "Notification";
  const data = {
    ...(notification?.data || {}),
    ...(notification?.oldStatus ? { old_status: notification.oldStatus } : {}),
    ...(notification?.newStatus ? { new_status: notification.newStatus } : {}),
    ...(notification?.reportedBy ? { reported_by: notification.reportedBy } : {}),
  };

  if (notification?.description && !data.description) {
    data.description = notification.description;
  }

  return {
    type: notification?.type || "notification",
    message,
    data,
    source: notification?.source || "",
    external_id: externalId,
    created_at: resolveTimestamp(notification?.timestamp),
    scope,
    user_id: userId,
  };
};

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
    const { scope, userId } = resolveUserContext();
    const url = API_MODE === "php"
      ? `${APPT_NOTIFY_ENDPOINT}?appointment_id=${encodeURIComponent(appointmentId)}`
      : `${API_BASE}/appointments/${appointmentId}/notify-reschedule`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        appointment_id: appointmentId,
        scope,
        user_id: userId,
      }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
};

/**
 * Mark one, several, or all notifications as read/unread.
 *
 * @param {object} options
 * @param {number[]} [options.ids]      - Specific notification IDs to update
 * @param {boolean}  [options.markAll]  - When true, update every notification
 * @param {boolean}  [options.read]     - true = mark read, false = mark unread
 * @param {string[]} [options.externalIds] - External notification IDs
 * @param {string}   [options.scope]    - "admin" or "user"
 * @param {string|number} [options.userId] - User id for scoped updates
 * @returns {Promise<object|null>}
 */
export const markNotificationsRead = async ({
  ids,
  externalIds,
  markAll = false,
  read = true,
  scope,
  userId,
} = {}) => {
  const token = localStorage.getItem("authToken");
  if (!token) return null;

  const { scope: resolvedScope, userId: resolvedUserId } = resolveUserContext({
    scope,
    userId,
  });

  const body = markAll
    ? { mark_all: true, read }
    : { ids, external_ids: externalIds, read };

  if (resolvedScope) body.scope = resolvedScope;
  if (resolvedUserId !== null && resolvedUserId !== undefined) {
    body.user_id = resolvedUserId;
  }

  try {
    const res = await fetch(NOTIF_ENDPOINT, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
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
 * @param {string} [options.scope]      - "admin" or "user"
 * @param {string|number} [options.userId] - User id for scoped queries
 * @returns {Promise<object|null>} Paginated response or null on failure
 */
export const fetchNotifications = async ({ perPage = 50, scope, userId } = {}) => {
  const token = localStorage.getItem("authToken");
  if (!token) return null;

  const { scope: resolvedScope, userId: resolvedUserId } = resolveUserContext({
    scope,
    userId,
  });
  const params = new URLSearchParams({ per_page: String(perPage) });
  if (resolvedScope) params.set("scope", resolvedScope);
  if (resolvedUserId !== null && resolvedUserId !== undefined) {
    params.set("user_id", String(resolvedUserId));
  }

  try {
    const res = await fetch(`${NOTIF_ENDPOINT}?${params}`, {
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

/**
 * Persist a notification to the backend (optional for local fallback).
 *
 * @param {object} notification - Local notification shape
 * @param {object} [options]
 * @param {string} [options.scope] - "admin" or "user"
 * @param {string|number} [options.userId] - user id for the notification
 * @returns {Promise<object|null>}
 */
export const createNotification = async (notification, options = {}) => {
  if (!notification) return null;
  const token = localStorage.getItem("authToken");
  if (!token) return null;

  const payload = buildNotificationPayload(notification, options);

  try {
    const res = await fetch(NOTIF_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
};

/**
 * Persist a batch of notifications.
 *
 * @param {object[]} notifications
 * @param {object} [options]
 * @returns {Promise<object[]>}
 */
export const createNotifications = async (notifications, options = {}) => {
  if (!Array.isArray(notifications) || notifications.length === 0) return [];
  const results = await Promise.all(
    notifications.map((notification) => createNotification(notification, options)),
  );
  return results.filter(Boolean);
};
