import { getToken, isAuthenticated } from "../../homepage/services/loginService";

const API_BASE = "http://localhost:8000/api";

// ── Business hours config ─────────────────────────────────────────────────────
export const BUSINESS_DAYS = [1, 2, 3, 4, 5]; // Mon–Fri (0=Sun, 6=Sat)
export const BUSINESS_START_HOUR = 7; // 7 AM
export const BUSINESS_END_HOUR = 17; // 5 PM — last 1-hour slot starts at 16:00

const authHeaders = () => ({
  Accept: "application/json",
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json",
});

// ── CRUD ──────────────────────────────────────────────────────────────────────

export const getAllAppointments = async () => {
  if (!isAuthenticated()) throw new Error("Not authenticated.");
  const res = await fetch(`${API_BASE}/appointments`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch appointments.");
  return Array.isArray(data) ? data : data.data || [];
};

export const createAppointment = async (appointmentData) => {
  if (!isAuthenticated()) throw new Error("Not authenticated.");
  const res = await fetch(`${API_BASE}/appointments`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(appointmentData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create appointment.");
  return data;
};

export const updateAppointment = async (id, updates) => {
  if (!isAuthenticated()) throw new Error("Not authenticated.");
  const res = await fetch(`${API_BASE}/appointments/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update appointment.");
  return data;
};

export const approveAppointment = async (id) =>
  updateAppointment(id, { status: "approved" });

export const rejectAppointment = async (id) =>
  updateAppointment(id, { status: "rejected" });

/**
 * Reschedule an appointment.
 * Passes notify_user: true so the backend can send a push/email notification.
 */
export const rescheduleAppointment = async (id, date, time) =>
  updateAppointment(id, { date, time, notify_user: true });

// ── Scheduling helpers ────────────────────────────────────────────────────────

/**
 * Find the next available Mon–Fri 7 AM–5 PM 1-hour slot that is not already taken.
 * Skips appointments with status "rejected".
 */
export const findNextAvailableSlot = (existingAppointments = []) => {
  const taken = new Set(
    existingAppointments
      .filter((a) => (a.status || "").toLowerCase() !== "rejected")
      .map((a) => `${a.date}|${(a.time || "").substring(0, 5)}`),
  );

  const now = new Date();
  let candidate = new Date(now);
  candidate.setMinutes(0, 0, 0);

  // Advance to a valid starting hour
  if (candidate.getHours() < BUSINESS_START_HOUR) {
    candidate.setHours(BUSINESS_START_HOUR, 0, 0, 0);
  } else if (candidate.getHours() >= BUSINESS_END_HOUR) {
    candidate.setDate(candidate.getDate() + 1);
    candidate.setHours(BUSINESS_START_HOUR, 0, 0, 0);
  } else {
    // Start from the next whole hour
    candidate.setHours(candidate.getHours() + 1, 0, 0, 0);
  }

  // Search up to 300 hour-increments (≈60 working days)
  for (let attempt = 0; attempt < 300; attempt++) {
    const dow = candidate.getDay();

    // Skip weekends
    if (!BUSINESS_DAYS.includes(dow)) {
      candidate.setDate(candidate.getDate() + 1);
      candidate.setHours(BUSINESS_START_HOUR, 0, 0, 0);
      continue;
    }

    const h = candidate.getHours();

    // Past end of business — jump to next day
    if (h >= BUSINESS_END_HOUR) {
      candidate.setDate(candidate.getDate() + 1);
      candidate.setHours(BUSINESS_START_HOUR, 0, 0, 0);
      continue;
    }

    const dateStr = candidate.toISOString().split("T")[0];
    const timeStr = `${String(h).padStart(2, "0")}:00`;
    const key = `${dateStr}|${timeStr}`;

    if (!taken.has(key)) {
      return { date: dateStr, time: timeStr };
    }

    // Try next hour
    candidate.setHours(h + 1, 0, 0, 0);
  }

  return null; // no slot found within search window
};

/**
 * Returns true when the given date+time slot has no conflicting appointment.
 * Pass excludeId to ignore the appointment currently being edited.
 */
export const isSlotAvailable = (date, time, existingAppointments, excludeId = null) => {
  const timeKey = (time || "").substring(0, 5);
  return !existingAppointments.some(
    (a) =>
      a.date === date &&
      (a.time || "").substring(0, 5) === timeKey &&
      (a.status || "").toLowerCase() !== "rejected" &&
      String(a.id) !== String(excludeId),
  );
};

/**
 * Time-slot options for the reschedule picker.
 * Hours 07:00 – 16:00 (last slot ends at 17:00).
 */
export const getTimeSlots = () => {
  const slots = [];
  for (let h = BUSINESS_START_HOUR; h < BUSINESS_END_HOUR; h++) {
    const val = `${String(h).padStart(2, "0")}:00`;
    const label =
      h < 12
        ? `${h}:00 AM`
        : h === 12
          ? "12:00 PM"
          : `${h - 12}:00 PM`;
    slots.push({ value: val, label });
  }
  return slots;
};
