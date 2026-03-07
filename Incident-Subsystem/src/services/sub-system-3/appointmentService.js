import { getToken, isAuthenticated } from "../../homepage/services/loginService";

const API_BASE = "http://localhost:8000/api";

// ── Business hours config ─────────────────────────────────────────────────────
export const BUSINESS_DAYS = [1, 2, 3, 4, 5]; // Mon–Fri (0=Sun, 6=Sat)
export const BUSINESS_START_HOUR = 7;          // 7 AM
export const BUSINESS_END_HOUR = 17;           // 5 PM — last 1-hour slot starts at 16:00

// Valid statuses from UpdateAppointmentRequest
export const APPOINTMENT_STATUSES = ["scheduled", "rescheduled", "completed", "cancelled", "no-show"];

const authHeaders = () => ({
  Accept: "application/json",
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json",
});

// ── Complaint-scoped appointment CRUD ─────────────────────────────────────────

/**
 * GET /api/complaints/{complaintId}/appointments
 * Returns all appointments for a complaint (no pagination — backend returns full collection).
 */
export const getComplaintAppointments = async (complaintId) => {
  if (!isAuthenticated()) throw new Error("Not authenticated.");
  const res = await fetch(`${API_BASE}/complaints/${complaintId}/appointments`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch appointments.");
  return Array.isArray(data) ? data : data.data || [];
};

/**
 * GET /api/complaints/{complaintId}/appointments/{appointmentId}
 * Returns a single appointment belonging to a complaint.
 */
export const getComplaintAppointment = async (complaintId, appointmentId) => {
  if (!isAuthenticated()) throw new Error("Not authenticated.");
  const res = await fetch(
    `${API_BASE}/complaints/${complaintId}/appointments/${appointmentId}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch appointment.");
  return data.data ?? data;
};

/**
 * POST /api/complaints/{complaintId}/appointments
 * Required: title, scheduled_at (ISO datetime, 7AM–5PM, no conflict)
 * Optional: description, status
 */
export const createAppointment = async (complaintId, appointmentData) => {
  if (!isAuthenticated()) throw new Error("Not authenticated.");
  const res = await fetch(`${API_BASE}/complaints/${complaintId}/appointments`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(appointmentData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create appointment.");
  return data;
};

/**
 * PATCH /api/complaints/{complaintId}/appointments/{appointmentId}
 * Partial update — primarily used for status changes.
 * Valid statuses: scheduled, rescheduled, completed, cancelled, no-show.
 */
export const updateAppointment = async (complaintId, appointmentId, updates) => {
  if (!isAuthenticated()) throw new Error("Not authenticated.");
  const res = await fetch(
    `${API_BASE}/complaints/${complaintId}/appointments/${appointmentId}`,
    {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(updates),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update appointment.");
  return data;
};

// ── Status helpers ────────────────────────────────────────────────────────────

/**
 * Reschedule an appointment.
 * Creates a new appointment (POST) with the updated schedule, then marks the
 * original as "rescheduled" via PATCH.
 *
 * @param {string} complaintId  - complaint the appointment belongs to
 * @param {object} appointment  - full original appointment object (needs .id, .title, .description)
 * @param {string} scheduledAt  - ISO datetime string e.g. "2025-03-10T09:00:00"
 */
export const rescheduleAppointment = async (complaintId, appointment, scheduledAt) => {
  const newAppt = await createAppointment(complaintId, {
    title: appointment.title || "Rescheduled Hearing",
    ...(appointment.description ? { description: appointment.description } : {}),
    scheduled_at: scheduledAt,
  });
  await updateAppointment(complaintId, appointment.id, { status: "rescheduled" });
  return newAppt;
};

export const completeAppointment = async (complaintId, appointmentId) =>
  updateAppointment(complaintId, appointmentId, { status: "completed" });

export const cancelAppointment = async (complaintId, appointmentId) =>
  updateAppointment(complaintId, appointmentId, { status: "cancelled" });

export const markNoShow = async (complaintId, appointmentId) =>
  updateAppointment(complaintId, appointmentId, { status: "no-show" });

// ── Availability ──────────────────────────────────────────────────────────────

/**
 * GET /api/appointments/availability?start=YYYY-MM-DD&end=YYYY-MM-DD
 * Returns days with hourly slots (07:00–16:00) and their availability.
 * Response shape: { days: [{ date, is_full, slots: [{ time, available }] }] }
 */
export const getAvailability = async (start, end) => {
  if (!isAuthenticated()) throw new Error("Not authenticated.");
  const params = new URLSearchParams({ start, end }).toString();
  const res = await fetch(`${API_BASE}/appointments/availability?${params}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch availability.");
  return data.days || [];
};

// ── Time-slot options for pickers ─────────────────────────────────────────────

/**
 * Returns label/value pairs for hours 07:00–16:00 (last slot ends at 17:00).
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
