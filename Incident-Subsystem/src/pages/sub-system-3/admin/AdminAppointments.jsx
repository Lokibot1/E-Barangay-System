import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import themeTokens from "../../../Themetokens";
import Toast from "../../../components/shared/modals/Toast";
import {
  rescheduleAppointment,
  createAppointment,
  completeAppointment,
  markNoShow,
  getTimeSlots,
  getAvailability,
} from "../../../services/sub-system-3/appointmentService";
import { getAllComplaints } from "../../../services/sub-system-3/complaintService";
import ConfirmationModal from "../../../components/shared/ConfirmationModal";

const ROWS_PER_PAGE = 5;

const STATUS_CFG = {
  all:         { label: "ALL",         color: "#16a34a" },
  scheduled:   { label: "SCHEDULED",   color: "#2563eb" },
  rescheduled: { label: "RESCHEDULED", color: "#f59e0b" },
  completed:   { label: "COMPLETED",   color: "#16a34a" },
  cancelled:   { label: "CANCELLED",   color: "#dc2626" },
  no_show:     { label: "NO SHOW",     color: "#64748b" },
  all: { label: "ALL", tabBg: "bg-gray-700" },
  scheduled: { label: "SCHEDULED", tabBg: "bg-blue-600" },
  rescheduled: { label: "RESCHEDULED", tabBg: "bg-amber-500" },
  completed: { label: "COMPLETED", tabBg: "bg-green-600" },
  cancelled: { label: "CANCELLED", tabBg: "bg-gray-500" },
  no_show: { label: "NO SHOW", tabBg: "bg-red-600" },
};

const TIME_SLOTS = getTimeSlots();

// ── Mini Calendar ─────────────────────────────────────────────────────────────
const MiniCalendar = ({
  appointments,
  selectedDate,
  onSelectDate,
  currentTheme,
  availability = {},
}) => {
  const t = themeTokens[currentTheme] || themeTokens.blue;
  const isDark = currentTheme === "dark";
  const [viewMonth, setViewMonth] = useState(() => new Date());

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMon = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split("T")[0];

  const apptDates = useMemo(() => {
    const s = new Set();
    appointments.forEach((a) => {
      if (a.date) s.add(a.date);
    });
    return s;
  }, [appointments]);

  const fullDates = useMemo(() => {
    const s = new Set();
    Object.values(availability).forEach((d) => {
      if (d.is_full) s.add(d.date);
    });
    return s;
  }, [availability]);

  const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMon; d++) cells.push(d);

  const handleDay = (day) => {
    const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onSelectDate(selectedDate === ds ? null : ds);
  };

  return (
    <div className={`${t.cardBg} rounded-xl border ${t.cardBorder} p-3`}>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setViewMonth(new Date(year, month - 1, 1))}
          className={`p-1 rounded-lg transition-colors ${isDark ? "hover:bg-slate-700 text-slate-300" : "hover:bg-gray-100 text-gray-600"}`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <span className={`text-xs font-bold ${t.cardText} font-spartan`}>
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={() => setViewMonth(new Date(year, month + 1, 1))}
          className={`p-1 rounded-lg transition-colors ${isDark ? "hover:bg-slate-700 text-slate-300" : "hover:bg-gray-100 text-gray-600"}`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Day-name headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className={`text-center text-[10px] font-bold ${t.subtleText} font-kumbh py-0.5`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const sel = selectedDate === ds;
          const tod = ds === today;
          const has = apptDates.has(ds);
          const dow = new Date(year, month, day).getDay();
          const wkd = dow === 0 || dow === 6;

          return (
            <button
              key={day}
              onClick={() => handleDay(day)}
              className={`relative w-full aspect-square flex items-center justify-center rounded-lg text-[11px] font-kumbh font-medium transition-all ${
                sel
                  ? "bg-green-600 text-white shadow"
                  : tod
                    ? isDark
                      ? "bg-slate-600 text-slate-100 font-bold"
                      : "bg-blue-50 text-blue-700 font-bold border border-blue-300"
                    : wkd
                      ? isDark
                        ? "text-slate-600"
                        : "text-gray-300"
                      : isDark
                        ? "text-slate-300 hover:bg-slate-700"
                        : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {day}
              {has && !sel && !fullDates.has(ds) && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500" />
              )}
              {fullDates.has(ds) && !sel && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-500" />
              )}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div
          className={`mt-3 pt-2 border-t ${isDark ? "border-slate-700" : "border-gray-200"} flex items-center justify-between`}
        >
          <span className={`text-[10px] ${t.subtleText} font-kumbh`}>
            Filtered: {selectedDate}
          </span>
          <button
            onClick={() => onSelectDate(null)}
            className="text-[10px] text-red-500 hover:text-red-700 font-kumbh font-semibold"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};

// ── Time Slot Picker ──────────────────────────────────────────────────────────
const TimeSlotPicker = ({ date, value, onChange, availability = {}, isDark, t }) => {
  const slots = useMemo(() => {
    if (date && availability[date]?.slots) {
      return availability[date].slots.map((s) => ({
        value: s.time,
        label: formatTime(s.time),
        available: s.available,
      }));
    }
    return TIME_SLOTS.map((s) => ({ value: s.value, label: s.label, available: true }));
  }, [date, availability]);

  if (!date) {
    return (
      <p className={`text-xs ${t.subtleText} font-kumbh italic py-2`}>
        Select a date first to see available slots.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-1.5">
      {slots.map((slot) => {
        const selected = value === slot.value;
        const taken = !slot.available;
        return (
          <button
            key={slot.value}
            type="button"
            disabled={taken}
            onClick={() => !taken && onChange(slot.value)}
            title={taken ? "Slot already taken" : slot.label}
            className={`py-1.5 rounded-lg text-[11px] font-kumbh font-semibold text-center transition-all ${
              taken
                ? `cursor-not-allowed line-through ${isDark ? "bg-slate-700 text-slate-600" : "bg-gray-100 text-gray-400"}`
                : selected
                  ? "bg-green-600 text-white shadow-sm"
                  : isDark
                    ? "bg-slate-700 text-slate-200 hover:bg-green-700/60 hover:text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:border-green-400 hover:text-green-700"
            }`}
          >
            {slot.label}
          </button>
        );
      })}
    </div>
  );
};

// ── Reschedule Modal ──────────────────────────────────────────────────────────
// ── Inline weekday-only date picker used by RescheduleModal ───────────────────
const WeekdayPicker = ({ value, onChange, isDark, t, availability = {} }) => {
  const today = new Date().toISOString().split("T")[0];
  const [viewMonth, setViewMonth] = useState(() => {
    if (value) return new Date(value + "T00:00:00");
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMon = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMon; d++) cells.push(d);

  return (
    <div
      className={`rounded-xl border ${t.cardBorder} p-3 ${isDark ? "bg-slate-800" : "bg-white"}`}
    >
      {/* Month nav */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => setViewMonth(new Date(year, month - 1, 1))}
          className={`p-1 rounded-lg transition-colors ${isDark ? "hover:bg-slate-700 text-slate-300" : "hover:bg-gray-100 text-gray-600"}`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <span className={`text-xs font-bold font-spartan ${t.cardText}`}>
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          type="button"
          onClick={() => setViewMonth(new Date(year, month + 1, 1))}
          className={`p-1 rounded-lg transition-colors ${isDark ? "hover:bg-slate-700 text-slate-300" : "hover:bg-gray-100 text-gray-600"}`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Day-name headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className={`text-center text-[10px] font-bold font-kumbh py-0.5 ${t.subtleText}`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dow = new Date(year, month, day).getDay();
          const isWeekend = dow === 0 || dow === 6;
          const isPast = ds < today;
          const isFull = !isWeekend && !isPast && availability[ds]?.is_full === true;
          const disabled = isWeekend || isPast || isFull;
          const selected = value === ds;
          const isToday = ds === today;

          return (
            <button
              key={day}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onChange(ds)}
              title={isFull ? "Fully booked" : undefined}
              className={`relative w-full aspect-square flex items-center justify-center rounded-lg text-[11px] font-kumbh font-medium transition-all ${
                selected
                  ? "bg-green-600 text-white shadow"
                  : isFull
                    ? isDark
                      ? "bg-red-900/30 text-red-400 cursor-not-allowed"
                      : "bg-red-50 text-red-400 cursor-not-allowed"
                    : disabled
                      ? `opacity-30 cursor-not-allowed ${isDark ? "text-slate-500" : "text-gray-400"}`
                      : isToday
                        ? isDark
                          ? "bg-slate-600 text-slate-100 font-bold hover:bg-slate-500"
                          : "bg-blue-50 text-blue-700 font-bold border border-blue-300 hover:bg-blue-100"
                        : isDark
                          ? "text-slate-300 hover:bg-slate-700"
                          : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {day}
              {isFull && !selected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const RescheduleModal = ({
  appointment,
  appointments,
  onSave,
  onClose,
  isDark,
  t,
  availability = {},
}) => {
  const { date: initDate, time: initTime } = parseScheduledAt(
    appointment.scheduled_at,
  );
  const [date, setDate] = useState(initDate || appointment.date || "");
  const [time, setTime] = useState(
    initTime || (appointment.time || "").substring(0, 5),
  );
  const [saving, setSaving] = useState(false);

  const conflict = (() => {
    if (!date || !time) return false;
    if (availability[date]?.slots) {
      const slot = availability[date].slots.find((s) => s.time === time);
      if (slot) return !slot.available;
    }
    return appointments.some(
      (a) =>
        (a.date || "") === date &&
        (a.time || "").substring(0, 5) === time &&
        (a.status || "").toLowerCase().replace(/-/g, "_") !== "cancelled" &&
        String(a.id) !== String(appointment.id),
    );
  })();

  const canSave = date && time && !conflict;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave(appointment, date, time);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className={`${t.cardBg} rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b ${isDark ? "border-slate-700 bg-slate-900" : "border-gray-200 bg-gray-50"}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className={`text-sm font-bold ${t.cardText} font-spartan`}>
                Reschedule Appointment
              </h3>
              <p className={`text-xs ${t.subtleText} font-kumbh`}>
                {(() => {
                  const { date: d, time: tm } = parseScheduledAt(
                    appointment.scheduled_at,
                  );
                  return `Complaint #${appointment.complaint_id} · Current: ${formatDate(d)} ${formatTime(tm)}`;
                })()}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors ${isDark ? "hover:bg-slate-700 text-slate-400" : "hover:bg-gray-200 text-gray-400"}`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Body — two-column layout matching CreateAppointmentModal */}
        <div className="px-6 py-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {/* LEFT — Date picker */}
            <div className="flex flex-col gap-3">
              <div>
                <label
                  className={`block text-xs font-semibold ${t.subtleText} mb-1.5 font-kumbh uppercase`}
                >
                  New Date{" "}
                  <span className={`normal-case font-normal ${t.subtleText}`}>
                    (Mon – Fri only)
                  </span>
                </label>
                <WeekdayPicker
                  value={date}
                  onChange={(d) => { setDate(d); setTime(""); }}
                  isDark={isDark}
                  t={t}
                  availability={availability}
                />
                {date && (
                  <p className={`text-xs mt-1.5 font-kumbh ${t.subtleText}`}>
                    Selected:{" "}
                    <span className={`font-semibold ${t.cardText}`}>
                      {formatDate(date)}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* RIGHT — Time slots + notes */}
            <div className="flex flex-col gap-4">
              <div>
                <label
                  className={`block text-xs font-semibold ${t.subtleText} mb-1.5 font-kumbh uppercase`}
                >
                  New Time{" "}
                  <span className={`normal-case font-normal ${t.subtleText}`}>
                    (7:00 AM – 5:00 PM)
                  </span>
                </label>
                <TimeSlotPicker
                  date={date}
                  value={time}
                  onChange={setTime}
                  availability={availability}
                  isDark={isDark}
                  t={t}
                />
              </div>

              {/* Conflict warning */}
              {conflict && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <svg
                    className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <p className="text-xs text-red-600 font-kumbh">
                    This slot is already booked. Please choose a different date or time.
                  </p>
                </div>
              )}

              {/* Info note */}
              <div
                className={`flex items-start gap-2 p-3 rounded-lg border ${isDark ? "bg-slate-700 border-slate-600" : "bg-blue-50 border-blue-200"}`}
              >
                <svg
                  className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isDark ? "text-slate-300" : "text-blue-500"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p
                  className={`text-xs ${isDark ? "text-slate-300" : "text-blue-700"} font-kumbh`}
                >
                  The complainant will be notified of this schedule change automatically.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-4 border-t ${isDark ? "border-slate-700 bg-slate-900" : "border-gray-100 bg-gray-50"} flex gap-3 justify-end`}
        >
          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-lg text-sm font-kumbh font-semibold transition-colors ${isDark ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"}`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className={`px-5 py-2 rounded-lg text-sm font-kumbh font-semibold transition-colors ${
              !canSave || saving
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-amber-500 text-white hover:bg-amber-600 shadow-sm"
            }`}
          >
            {saving ? "Saving…" : "Confirm Reschedule"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Split "2026-03-05 08:00:00" (or ISO) into { date: "2026-03-05", time: "08:00" }.
 * Treats the stored value as local time — no UTC conversion.
 */
const parseScheduledAt = (scheduledAt) => {
  if (!scheduledAt) return { date: null, time: null };
  const [datePart, timePart] = String(scheduledAt).split(/[T ]/);
  return {
    date: datePart || null,
    time: timePart ? timePart.substring(0, 5) : null,
  };
};

const statusBadgeCls = (status) => {
  const s = (status || "scheduled").toLowerCase().replace(/-/g, "_");
  if (s === "completed")
    return "bg-green-100 text-green-700 border border-green-200";
  if (s === "cancelled")
    return "bg-gray-100 text-gray-500 border border-gray-200";
  if (s === "rescheduled")
    return "bg-amber-100 text-amber-700 border border-amber-200";
  if (s === "no_show") return "bg-red-100 text-red-700 border border-red-200";
  return "bg-blue-100 text-blue-700 border border-blue-200"; // scheduled (default)
};

const formatTime = (timeStr) => {
  if (!timeStr) return "—";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const mins = m || "00";
  const ampm = hour < 12 ? "AM" : "PM";
  const disp = hour % 12 || 12;
  return `${disp}:${mins} ${ampm}`;
};

const formatDate = (ds) => {
  if (!ds) return "—";
  return new Date(ds + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// ── Appointment Details Modal ─────────────────────────────────────────────────
const AppointmentDetailsModal = ({
  appointment,
  onClose,
  onReschedule,
  onStatusChange,
  isDark,
  t,
}) => {
  const { date, time } = parseScheduledAt(appointment.scheduled_at);
  const status = (appointment.status || "scheduled")
    .toLowerCase()
    .replace(/-/g, "_");
  const canReschedule = status === "scheduled";
  const canAct = status === "scheduled" || status === "rescheduled";

  const [confirm, setConfirm] = useState({
    open: false,
    action: null,
    loading: false,
  });

  const openConfirm = (action) =>
    setConfirm({ open: true, action, loading: false });
  const closeConfirm = () =>
    setConfirm({ open: false, action: null, loading: false });

  const handleConfirm = async () => {
    setConfirm((s) => ({ ...s, loading: true }));
    try {
      await onStatusChange(appointment, confirm.action);
      closeConfirm();
      onClose();
    } catch {
      setConfirm((s) => ({ ...s, loading: false }));
    }
  };

  const fullDate = date
    ? new Date(date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className={`${t.cardBg} rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b ${isDark ? "border-slate-700 bg-slate-900" : "border-gray-200 bg-gray-50"} flex items-center gap-3`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? "bg-slate-700" : "bg-blue-100"}`}
          >
            <svg
              className={`w-5 h-5 ${isDark ? "text-slate-300" : "text-blue-600"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className={`text-sm font-bold ${t.cardText} font-spartan truncate`}
            >
              {appointment.title || `Appointment #${appointment.id}`}
            </h3>
            <p className={`text-xs ${t.subtleText} font-kumbh`}>
              Appointment #{appointment.id} · Complaint #
              {appointment.complaint_id}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${isDark ? "hover:bg-slate-700 text-slate-400" : "hover:bg-gray-200 text-gray-400"}`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold font-kumbh uppercase ${statusBadgeCls(status)}`}
            >
              {status.replace(/_/g, " ")}
            </span>
          </div>

          {/* Date & Time — prominent display */}
          <div
            className={`flex gap-3 p-4 rounded-xl ${isDark ? "bg-slate-700" : "bg-blue-50"} border ${isDark ? "border-slate-600" : "border-blue-100"}`}
          >
            <div className="flex-1">
              <p
                className={`text-[10px] font-bold uppercase tracking-wide mb-1 font-kumbh ${isDark ? "text-slate-400" : "text-blue-500"}`}
              >
                Date
              </p>
              <p className={`text-sm font-bold font-spartan ${t.cardText}`}>
                {fullDate}
              </p>
            </div>
            <div
              className={`w-px ${isDark ? "bg-slate-600" : "bg-blue-200"}`}
            />
            <div className="flex-shrink-0 text-right">
              <p
                className={`text-[10px] font-bold uppercase tracking-wide mb-1 font-kumbh ${isDark ? "text-slate-400" : "text-blue-500"}`}
              >
                Time
              </p>
              <p className={`text-sm font-bold font-spartan ${t.cardText}`}>
                {formatTime(time)}
              </p>
            </div>
          </div>

          {/* Detail rows */}
          <div
            className={`rounded-xl border ${t.cardBorder} divide-y ${isDark ? "divide-slate-700" : "divide-gray-100"} overflow-hidden`}
          >
            {[
              {
                label: "Complainant",
                value: appointment.complainant_name || "—",
              },
              {
                label: "Respondent",
                value: appointment.respondent_name || "—",
              },
              {
                label: "Respondent Address",
                value: appointment.respondent_address || "—",
              },
              { label: "Appointment ID", value: `#${appointment.id}` },
              {
                label: "Complaint ID",
                value: `#${appointment.complaint_id || "—"}`,
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className={`flex items-center px-4 py-3 ${isDark ? "bg-slate-800" : "bg-white"}`}
              >
                <span
                  className={`text-xs font-semibold w-36 flex-shrink-0 font-kumbh ${t.subtleText}`}
                >
                  {label}
                </span>
                <span className={`text-xs font-kumbh ${t.cardText} truncate`}>
                  {value}
                </span>
              </div>
            ))}
            {appointment.description && (
              <div
                className={`px-4 py-3 ${isDark ? "bg-slate-800" : "bg-white"}`}
              >
                <span
                  className={`text-xs font-semibold font-kumbh ${t.subtleText} block mb-1`}
                >
                  Description
                </span>
                <span
                  className={`text-xs font-kumbh ${t.cardText} leading-relaxed`}
                >
                  {appointment.description}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-4 border-t ${isDark ? "border-slate-700 bg-slate-900" : "border-gray-100 bg-gray-50"} flex flex-wrap gap-2 justify-end`}
        >
          {canAct && (
            <>
              <button
                onClick={() => openConfirm("completed")}
                className="px-4 py-2 rounded-lg text-sm font-kumbh font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm"
              >
                Mark as Completed
              </button>
              <button
                onClick={() => openConfirm("no-show")}
                className="px-4 py-2 rounded-lg text-sm font-kumbh font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm"
              >
                Mark as No Show
              </button>
            </>
          )}
          {canReschedule && (
            <button
              onClick={() => {
                onClose();
                onReschedule(appointment);
              }}
              className="px-4 py-2 rounded-lg text-sm font-kumbh font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-sm"
            >
              Reschedule
            </button>
          )}
        </div>
      </div>

      {/* Confirmation modal */}
      <ConfirmationModal
        isOpen={confirm.open}
        loading={confirm.loading}
        variant={confirm.action === "completed" ? "success" : "danger"}
        title={
          confirm.action === "completed"
            ? "Mark as Completed?"
            : "Mark as No Show?"
        }
        message={
          confirm.action === "completed"
            ? `This will mark Appointment #${appointment.id} as completed. This action cannot be undone.`
            : `This will mark Appointment #${appointment.id} as no-show. This action cannot be undone.`
        }
        confirmLabel={
          confirm.action === "completed"
            ? "Yes, Mark Completed"
            : "Yes, Mark No Show"
        }
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
};

// ── Create Appointment Modal ──────────────────────────────────────────────────
const CreateAppointmentModal = ({
  appointments,
  onSave,
  onClose,
  isDark,
  t,
  availability = {},
}) => {
  const [complaints, setComplaints] = useState([]);
  const [loadingC, setLoadingC] = useState(true);
  const [complaintId, setComplaintId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);

  // Load complaints for the dropdown on mount
  useEffect(() => {
    getAllComplaints()
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.data || [];
        setComplaints(arr);
      })
      .catch(() => setComplaints([]))
      .finally(() => setLoadingC(false));
  }, []);

  const conflict = (() => {
    if (!date || !time) return false;
    if (availability[date]?.slots) {
      const slot = availability[date].slots.find((s) => s.time === time);
      if (slot) return !slot.available;
    }
    return appointments.some(
      (a) =>
        (a.date || "") === date &&
        (a.time || "").substring(0, 5) === time &&
        (a.status || "").toLowerCase().replace(/-/g, "_") !== "cancelled",
    );
  })();

  const canSave = complaintId && title.trim() && date && time && !conflict;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave(complaintId, {
        title: title.trim(),
        description: description.trim() || undefined,
        scheduled_at: `${date}T${time}:00`,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const selectCls = `w-full px-4 py-2.5 rounded-lg border ${t.cardBorder} ${isDark ? "bg-slate-700 text-slate-200" : "bg-white text-gray-800"} text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-kumbh`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className={`${t.cardBg} rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b ${isDark ? "border-slate-700 bg-slate-900" : "border-gray-200 bg-gray-50"}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className={`text-sm font-bold ${t.cardText} font-spartan`}>
                Create New Appointment
              </h3>
              <p className={`text-xs ${t.subtleText} font-kumbh`}>
                Mon – Fri · 7:00 AM – 5:00 PM · 1 slot per hour
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors ${isDark ? "hover:bg-slate-700 text-slate-400" : "hover:bg-gray-200 text-gray-400"}`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {/* LEFT COLUMN */}
            <div className="flex flex-col gap-4">
              {/* Complaint select */}
              <div>
                <label
                  className={`block text-xs font-semibold ${t.subtleText} mb-1.5 font-kumbh uppercase`}
                >
                  Complaint <span className="text-red-500">*</span>
                </label>
                {loadingC ? (
                  <div
                    className={`${selectCls} flex items-center gap-2 text-sm opacity-60`}
                  >
                    <div className="w-3.5 h-3.5 border-2 border-green-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    Loading complaints…
                  </div>
                ) : (
                  <select
                    value={complaintId}
                    onChange={(e) => setComplaintId(e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Select a complaint…</option>
                    {complaints.map((c) => (
                      <option key={c.id} value={c.id}>
                        #{c.id} — {c.complainant_name || "Unknown"} vs{" "}
                        {c.respondent_name || "Unknown"}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Title */}
              <div>
                <label
                  className={`block text-xs font-semibold ${t.subtleText} mb-1.5 font-kumbh uppercase`}
                >
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={255}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Follow-up Hearing for Complaint #7"
                  className={selectCls}
                />
              </div>

              {/* Description */}
              <div className="flex-1">
                <label
                  className={`block text-xs font-semibold ${t.subtleText} mb-1.5 font-kumbh uppercase`}
                >
                  Description{" "}
                  <span className={`normal-case font-normal ${t.subtleText}`}>
                    (optional)
                  </span>
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the appointment purpose…"
                  className={`${selectCls} resize-none`}
                />
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col gap-4">
              {/* Date picker */}
              <div>
                <label
                  className={`block text-xs font-semibold ${t.subtleText} mb-1.5 font-kumbh uppercase`}
                >
                  Date <span className="text-red-500">*</span>{" "}
                  <span className={`normal-case font-normal ${t.subtleText}`}>
                    (Mon – Fri only)
                  </span>
                </label>
                <WeekdayPicker
                  value={date}
                  onChange={(d) => { setDate(d); setTime(""); }}
                  isDark={isDark}
                  t={t}
                  availability={availability}
                />
                {date && (
                  <p className={`text-xs mt-1.5 font-kumbh ${t.subtleText}`}>
                    Selected:{" "}
                    <span className={`font-semibold ${t.cardText}`}>
                      {formatDate(date)}
                    </span>
                  </p>
                )}
              </div>

              {/* Time */}
              <div>
                <label
                  className={`block text-xs font-semibold ${t.subtleText} mb-1.5 font-kumbh uppercase`}
                >
                  Time <span className="text-red-500">*</span>{" "}
                  <span className={`normal-case font-normal ${t.subtleText}`}>
                    (7:00 AM – 5:00 PM)
                  </span>
                </label>
                <TimeSlotPicker
                  date={date}
                  value={time}
                  onChange={setTime}
                  availability={availability}
                  isDark={isDark}
                  t={t}
                />
              </div>

              {/* Conflict warning */}
              {conflict && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <svg
                    className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <p className="text-xs text-red-600 font-kumbh">
                    This slot is already booked. Please choose a different date
                    or time.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-4 border-t ${isDark ? "border-slate-700 bg-slate-900" : "border-gray-100 bg-gray-50"} flex gap-3 justify-end`}
        >
          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-lg text-sm font-kumbh font-semibold transition-colors ${isDark ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"}`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className={`px-5 py-2 rounded-lg text-sm font-kumbh font-semibold transition-colors ${
              !canSave || saving
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700 shadow-sm"
            }`}
          >
            {saving ? "Creating…" : "Create Appointment"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Overdue Alert Modal ───────────────────────────────────────────────────────
const OverdueAlertModal = ({ appointments, onAction, onClose, isDark, t }) => {
  const [actioning, setActioning] = useState({});
  const [done, setDone] = useState(new Set());

  const remaining = appointments.filter((a) => !done.has(a.id));

  useEffect(() => {
    if (appointments.length > 0 && done.size === appointments.length) onClose();
  }, [done, appointments.length, onClose]);

  const handleAction = async (appt, action) => {
    setActioning((s) => ({ ...s, [appt.id]: action }));
    try {
      await onAction(appt, action);
      setDone((s) => new Set([...s, appt.id]));
    } catch {
      /* error toast handled upstream */
    } finally {
      setActioning((s) => ({ ...s, [appt.id]: null }));
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className={`${t.cardBg} rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b ${isDark ? "border-slate-700 bg-slate-900" : "border-gray-200 bg-gray-50"} flex items-center gap-3`}
        >
          <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-bold ${t.cardText} font-spartan`}>
              Appointments Requiring Action
            </h3>
            <p className={`text-xs ${t.subtleText} font-kumbh`}>
              {remaining.length} appointment{remaining.length !== 1 ? "s" : ""}{" "}
              past their scheduled date
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${isDark ? "hover:bg-slate-700 text-slate-400" : "hover:bg-gray-200 text-gray-400"}`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* List */}
        <div className="px-6 py-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {remaining.map((appt) => {
            const { date, time } = parseScheduledAt(appt.scheduled_at);
            const busy = actioning[appt.id];
            return (
              <div
                key={appt.id}
                className={`rounded-xl border ${t.cardBorder} overflow-hidden`}
              >
                {/* Info rows */}
                <div
                  className={`divide-y ${isDark ? "divide-slate-700" : "divide-gray-100"}`}
                >
                  {/* Title + status */}
                  <div
                    className={`flex items-center gap-3 px-4 py-3 ${isDark ? "bg-slate-800" : "bg-white"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? "bg-slate-700" : "bg-blue-50"}`}
                    >
                      <svg
                        className={`w-4 h-4 ${isDark ? "text-slate-300" : "text-blue-500"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-bold font-spartan ${t.cardText} truncate`}
                      >
                        {appt.title || `Appointment #${appt.id}`}
                      </p>
                      <p className={`text-xs font-kumbh ${t.subtleText}`}>
                        Appointment #{appt.id} · Complaint #{appt.complaint_id}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold font-kumbh uppercase flex-shrink-0 ${statusBadgeCls(appt.status)}`}
                    >
                      {(appt.status || "scheduled").replace(/-/g, " ")}
                    </span>
                  </div>

                  {/* Detail fields */}
                  {[
                    {
                      label: "Scheduled",
                      value: `${formatDate(date)} at ${formatTime(time)}`,
                    },
                    {
                      label: "Complainant",
                      value: appt.complainant_name || "—",
                    },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className={`flex items-center px-4 py-2.5 ${isDark ? "bg-slate-800" : "bg-white"}`}
                    >
                      <span
                        className={`text-xs font-semibold w-28 flex-shrink-0 font-kumbh ${t.subtleText}`}
                      >
                        {label}
                      </span>
                      <span className={`text-xs font-kumbh ${t.cardText}`}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div
                  className={`flex gap-2 px-4 py-3 border-t ${isDark ? "border-slate-700 bg-slate-900" : "border-gray-100 bg-gray-50"}`}
                >
                  <button
                    onClick={() => handleAction(appt, "completed")}
                    disabled={!!busy}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-kumbh font-semibold transition-colors ${
                      busy === "completed"
                        ? "bg-green-200 text-green-600 cursor-wait"
                        : "bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    }`}
                  >
                    {busy === "completed" && (
                      <svg
                        className="w-3 h-3 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    )}
                    {busy === "completed" ? "Processing…" : "Mark as Completed"}
                  </button>
                  <button
                    onClick={() => handleAction(appt, "no-show")}
                    disabled={!!busy}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-kumbh font-semibold transition-colors ${
                      busy === "no-show"
                        ? "bg-red-200 text-red-600 cursor-wait"
                        : "bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    }`}
                  >
                    {busy === "no-show" && (
                      <svg
                        className="w-3 h-3 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    )}
                    {busy === "no-show" ? "Processing…" : "Mark as No Show"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-4 border-t ${isDark ? "border-slate-700 bg-slate-900" : "border-gray-100 bg-gray-50"} flex justify-end`}
        >
          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-lg text-sm font-kumbh font-semibold border transition-colors ${
              isDark
                ? "border-slate-600 text-slate-300 hover:bg-slate-700"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const AdminAppointments = () => {
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("appTheme") || "modern",
  );

  useEffect(() => {
    const h = (e) => setCurrentTheme(e.detail);
    window.addEventListener("themeChange", h);
    return () => window.removeEventListener("themeChange", h);
  }, []);

  const t = themeTokens[currentTheme] || themeTokens.blue;
  const isDark = currentTheme === "dark";

  // ── data ───────────────────────────────────────────────────────────────────
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState({});

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllComplaints();
      const compArray = Array.isArray(data) ? data : data.data || [];

      // Flatten appointments nested inside each complaint, enriched with complainant info
      const allAppts = [];
      compArray.forEach((complaint) => {
        if (
          !Array.isArray(complaint.appointments) ||
          complaint.appointments.length === 0
        )
          return;
        const complainantName =
          complaint.complainant_name ||
          (complaint.user
            ? `${complaint.user.last_name || ""}, ${complaint.user.first_name || ""}`.trim()
            : "—");
        complaint.appointments.forEach((appt) => {
          const { date: parsedDate, time: parsedTime } = parseScheduledAt(
            appt.scheduled_at,
          );
          allAppts.push({
            ...appt,
            complaint_id: appt.complaint_id ?? complaint.id,
            complainant_name: appt.complainant_name || complainantName,
            respondent_name:
              appt.respondent_name || complaint.respondent_name || "—",
            respondent_address:
              appt.respondent_address || complaint.respondent_address || "—",
            // Normalised date/time so existing helpers (calendar, isSlotAvailable) work
            date: appt.date || parsedDate,
            time: appt.time || parsedTime,
          });
        });
      });

      setAppointments(allAppts);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to load appointments.",
      });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAvailability = useCallback(async () => {
    try {
      const start = new Date().toISOString().split("T")[0];
      const end = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      const days = await getAvailability(start, end);
      const map = {};
      days.forEach((d) => { map[d.date] = d; });
      setAvailability(map);
    } catch (err) {
      console.error("Failed to fetch availability:", err);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
    fetchAvailability();
  }, [fetchAppointments, fetchAvailability]);

  // ── overdue alert (show once per session after first load) ─────────────────
  useEffect(() => {
    if (loading || hasShownOverdueAlert.current) return;
    const today = new Date().toISOString().split("T")[0];
    const overdue = appointments.filter((a) => {
      const s = (a.status || "scheduled").toLowerCase().replace(/-/g, "_");
      return (
        (s === "scheduled" || s === "rescheduled") && a.date && a.date <= today
      );
    });
    if (overdue.length > 0) {
      hasShownOverdueAlert.current = true;
      setOverdueModal({ open: true, appointments: overdue });
    }
  }, [loading, appointments]);

  // ── toasts ─────────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((toast) => {
    setToasts((prev) => [
      ...prev,
      { id: Date.now(), duration: 4000, ...toast },
    ]);
  }, []);
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [calendarOpen, setCalendarOpen] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [detailsTarget, setDetailsTarget] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [overdueModal, setOverdueModal] = useState({
    open: false,
    appointments: [],
  });
  const hasShownOverdueAlert = useRef(false);

  // ── tab sliding indicator ──────────────────────────────────────────────────
  const statusTabsRef = useRef(null);
  const [tabInd, setTabInd] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    init: false,
  });

  useLayoutEffect(() => {
    const container = statusTabsRef.current;
    if (!container) return;
    const btn = container.querySelector(`[data-tab="${activeTab}"]`);
    if (!btn) return;
    const cR = container.getBoundingClientRect();
    const bR = btn.getBoundingClientRect();
    setTabInd({
      left: bR.left - cR.left,
      top: bR.top - cR.top,
      width: bR.width,
      height: bR.height,
      init: true,
    });
  }, [activeTab]);

  // ── derived counts ─────────────────────────────────────────────────────────
  const statusCounts = useMemo(() => {
    const c = {
      all: appointments.length,
      scheduled: 0,
      rescheduled: 0,
      completed: 0,
      cancelled: 0,
      no_show: 0,
    };
    appointments.forEach((a) => {
      const s = (a.status || "scheduled").toLowerCase().replace(/-/g, "_");
      if (c[s] !== undefined) c[s]++;
    });
    return c;
  }, [appointments]);

  // ── filtered + paginated data ──────────────────────────────────────────────
  const filteredData = useMemo(() => {
    return appointments.filter((a) => {
      const s = (a.status || "scheduled").toLowerCase().replace(/-/g, "_");
      if (activeTab !== "all" && s !== activeTab) return false;
      if (selectedDate && a.date !== selectedDate) return false;
      if (startDate && a.date < startDate) return false;
      if (endDate && a.date > endDate) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const ok =
          String(a.complaint_id || "")
            .toLowerCase()
            .includes(q) ||
          String(a.id || "")
            .toLowerCase()
            .includes(q) ||
          (a.complainant_name || "").toLowerCase().includes(q);
        if (!ok) return false;
      }
      return true;
    });
  }, [appointments, activeTab, selectedDate, startDate, endDate, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / ROWS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const s = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredData.slice(s, s + ROWS_PER_PAGE);
  }, [filteredData, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, selectedDate, searchQuery, startDate, endDate]);

  // ── actions ────────────────────────────────────────────────────────────────
  const handleReschedule = async (appt, date, time) => {
    try {
      const scheduledAt = `${date}T${time}:00`;
      await rescheduleAppointment(appt.complaint_id, appt, scheduledAt);
      addToast({
        type: "success",
        title: "Rescheduled",
        message: `Appointment rescheduled to ${formatDate(date)} at ${formatTime(time)}. Complainant notified.`,
      });
      fetchAppointments();
      fetchAvailability();
    } catch (err) {
      addToast({ type: "error", title: "Error", message: err.message });
      throw err;
    }
  };

  const handleCreate = async (complaintId, appointmentData) => {
    try {
      await createAppointment(complaintId, appointmentData);
      addToast({
        type: "success",
        title: "Created",
        message: "Appointment created successfully. Complainant notified.",
      });
      fetchAppointments();
      fetchAvailability();
    } catch (err) {
      addToast({ type: "error", title: "Error", message: err.message });
      throw err;
    }
  };

  const handleStatusChange = async (appt, status) => {
    try {
      if (status === "completed") {
        await completeAppointment(appt.complaint_id, appt.id);
      } else if (status === "no-show") {
        await markNoShow(appt.complaint_id, appt.id);
      }
      const label = status === "completed" ? "Completed" : "No Show";
      addToast({
        type: "success",
        title: label,
        message: `Appointment #${appt.id} marked as ${label.toLowerCase()}.`,
      });
      fetchAppointments();
    } catch (err) {
      addToast({ type: "error", title: "Action Failed", message: err.message });
      throw err;
    }
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-full ${t.pageBg} flex`}>
      {/* ── Left Calendar Panel ─────────────────────────────────────────── */}
      <div
        className={`flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden border-r ${
          calendarOpen ? "w-[268px]" : "w-[48px]"
        } ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}
      >
        {calendarOpen ? (
          <div className="p-4 flex flex-col gap-4 h-full">
            {/* Panel header */}
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold ${t.cardText} font-spartan uppercase tracking-wide`}
              >
                Calendar
              </span>
              <button
                onClick={() => setCalendarOpen(false)}
                title="Minimize calendar"
                className={`p-1.5 rounded-lg transition-colors ${isDark ? "hover:bg-slate-700 text-slate-400" : "hover:bg-gray-100 text-gray-400"}`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                  />
                </svg>
              </button>
            </div>

            <MiniCalendar
              appointments={appointments}
              selectedDate={selectedDate}
              onSelectDate={(d) => {
                setSelectedDate(d);
                setCurrentPage(1);
              }}
              currentTheme={currentTheme}
              availability={availability}
            />

            {/* Legend */}
            <div className="space-y-2">
              <p
                className={`text-[10px] font-bold ${t.subtleText} font-kumbh uppercase tracking-wide`}
              >
                Legend
              </p>
              {[
                { label: "Has Appointment", dot: "bg-amber-400" },
                { label: "Fully Booked", dot: "bg-red-500" },
                { label: "Selected", dot: "bg-green-500" },
                { label: "Today", dot: "bg-blue-400" },
              ].map((x) => (
                <div key={x.label} className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${x.dot}`}
                  />
                  <span className={`text-xs ${t.subtleText} font-kumbh`}>
                    {x.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Business hours note */}
            <div
              className={`mt-auto p-3 rounded-xl ${isDark ? "bg-slate-700" : "bg-green-50"} border ${isDark ? "border-slate-600" : "border-green-200"}`}
            >
              <p
                className={`text-[10px] font-kumbh ${isDark ? "text-slate-300" : "text-green-700"} leading-relaxed`}
              >
                <span className="font-bold block mb-0.5">Available Hours</span>
                Mon – Fri, 7:00 AM – 5:00 PM
                <br />1 appointment per hour slot
              </p>
            </div>
          </div>
        ) : (
          /* Collapsed: just show the toggle button */
          <div className="flex flex-col items-center pt-4">
            <button
              onClick={() => setCalendarOpen(true)}
              title="Show calendar"
              className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-slate-700 text-slate-400" : "hover:bg-gray-100 text-gray-500"}`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 overflow-x-auto">
        <div className="px-6 py-6 max-w-full">
          {/* Page header */}
          <div className="flex items-center gap-4 mb-6">
            <div
              className={`w-12 h-12 ${isDark ? "bg-slate-700" : "bg-gray-200"} rounded-xl flex items-center justify-center flex-shrink-0`}
            >
              <svg
                className={`w-6 h-6 ${isDark ? "text-slate-300" : "text-gray-600"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h1
                className={`text-2xl font-bold ${t.cardText} font-spartan uppercase`}
              >
                Appointment Management
              </h1>
              <p className={`text-xs ${t.subtleText} font-kumbh mt-0.5`}>
                Complaint hearing appointments · Mon – Fri · 7:00 AM – 5:00 PM
              </p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              {
                key: "all",
                label: "TOTAL",
                border: "border-blue-500",
                bg: "bg-blue-100",
                ic: "text-blue-600",
                icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
              },
              {
                key: "scheduled",
                label: "SCHEDULED",
                border: "border-blue-400",
                bg: "bg-blue-50",
                ic: "text-blue-500",
                icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
              },
              {
                key: "completed",
                label: "COMPLETED",
                border: "border-green-500",
                bg: "bg-green-100",
                ic: "text-green-600",
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
              },
              {
                key: "cancelled",
                label: "CANCELLED",
                border: "border-gray-400",
                bg: "bg-gray-100",
                ic: "text-gray-500",
                icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
              },
            ].map((s) => (
              <div
                key={s.key}
                onClick={() => setActiveTab(s.key)}
                className={`${t.cardBg} border-l-4 ${s.border} rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm cursor-pointer hover:shadow-md transition-all ${
                  activeTab === s.key
                    ? "ring-2 ring-offset-1 ring-green-400"
                    : ""
                }`}
              >
                <div
                  className={`w-10 h-10 ${s.bg} rounded-full flex items-center justify-center flex-shrink-0`}
                >
                  <svg
                    className={`w-5 h-5 ${s.ic}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={s.icon}
                    />
                  </svg>
                </div>
                <div>
                  <p
                    className={`text-[10px] font-semibold ${t.subtleText} font-kumbh uppercase tracking-wide`}
                  >
                    {s.label}
                  </p>
                  <p
                    className={`text-2xl font-bold ${t.cardText} font-spartan leading-tight`}
                  >
                    {loading ? "—" : statusCounts[s.key]}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Table card */}
          <div
            className={`${t.cardBg} border ${t.cardBorder} rounded-2xl shadow-lg overflow-hidden`}
          >
            {/* Status tabs + Create button */}
            <div className="px-5 pt-5 flex items-start justify-between gap-3">
              <div
                ref={statusTabsRef}
                className="relative flex flex-wrap gap-2 flex-1"
              >
                {/* Sliding indicator */}
                <div
                  className={`absolute rounded-lg pointer-events-none shadow-md ${STATUS_CFG[activeTab]?.tabBg || "bg-gray-700"}`}
                  style={{
                    left: tabInd.left,
                    top: tabInd.top,
                    width: tabInd.width,
                    height: tabInd.height,
                    opacity: tabInd.init ? 1 : 0,
                    transition: tabInd.init
                      ? "left 0.28s ease, top 0.28s ease, width 0.28s ease, background-color 0.28s ease"
                      : "none",
                  }}
                />
                {Object.entries(STATUS_CFG).map(([key, cfg]) => (
                  <button
                    key={key}
                    data-tab={key}
                    onClick={() => setActiveTab(key)}
                    className={`relative z-10 px-4 py-2 rounded-lg text-xs font-bold font-kumbh uppercase tracking-wide border-2 transition-colors duration-200 ${
                      activeTab === key
                        ? "text-white border-transparent"
                        : isDark
                          ? "bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-200 hover:text-slate-800"
                          : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {cfg.label} ({statusCounts[key] ?? 0})
                  </button>
                ))}
              </div>

              {/* Create New Appointment button */}
              <button
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-kumbh bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm whitespace-nowrap flex-shrink-0"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create New Appointment
              </button>
            </div>

            {/* Filters */}
            <div className="px-5 pt-4 pb-3">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="flex-1">
                  <label
                    className={`block text-xs font-semibold ${t.subtleText} mb-1.5 font-kumbh uppercase`}
                  >
                    Search
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Complaint ID, appointment ID, or complainant…"
                    className={`w-full px-4 py-2.5 rounded-lg border ${t.cardBorder} ${t.cardBg} ${t.cardText} text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-kumbh`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-semibold ${t.subtleText} mb-1.5 font-kumbh uppercase`}
                  >
                    From
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`px-4 py-2.5 rounded-lg border ${t.cardBorder} ${t.cardBg} ${t.cardText} text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-kumbh`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-semibold ${t.subtleText} mb-1.5 font-kumbh uppercase`}
                  >
                    To
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`px-4 py-2.5 rounded-lg border ${t.cardBorder} ${t.cardBg} ${t.cardText} text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-kumbh`}
                  />
                </div>
                {(selectedDate || startDate || endDate || searchQuery) && (
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSelectedDate(null);
                        setStartDate("");
                        setEndDate("");
                        setSearchQuery("");
                      }}
                      className="px-4 py-2.5 text-xs font-kumbh font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>

              {selectedDate && (
                <div className="mt-2 flex items-center gap-2">
                  <svg
                    className="w-3.5 h-3.5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className={`text-xs ${t.subtleText} font-kumbh`}>
                    Showing appointments for{" "}
                    <strong>{formatDate(selectedDate)}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto px-5 pb-5">
              <table className="w-full text-sm font-kumbh table-fixed">
                <thead>
                  <tr
                    className={`${isDark ? "bg-slate-700 border-y border-slate-600" : "bg-gray-100 border-y border-gray-200"}`}
                  >
                    <th
                      className={`px-3 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase text-center w-[5%]`}
                    >
                      #
                    </th>
                    <th
                      className={`px-4 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase text-left w-[12%]`}
                    >
                      Appt ID
                    </th>
                    <th
                      className={`px-4 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase text-left w-[12%]`}
                    >
                      Complaint
                    </th>
                    <th
                      className={`px-4 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase text-left w-[20%]`}
                    >
                      Complainant
                    </th>
                    <th
                      className={`px-4 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase text-left w-[14%]`}
                    >
                      Date
                    </th>
                    <th
                      className={`px-4 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase text-left w-[11%]`}
                    >
                      Time
                    </th>
                    <th
                      className={`px-4 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase text-left w-[12%]`}
                    >
                      Status
                    </th>
                    <th
                      className={`px-4 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase text-left w-[14%]`}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className={`px-4 py-12 text-center ${t.subtleText}`}
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
                          <span className="text-sm font-kumbh">
                            Loading appointments…
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedData.length > 0 ? (
                    paginatedData.map((appt, idx) => {
                      const status = (appt.status || "scheduled")
                        .toLowerCase()
                        .replace(/-/g, "_");

                      return (
                        <tr
                          key={appt.id}
                          onClick={() => setDetailsTarget(appt)}
                          className={`border-b ${t.cardBorder} ${isDark ? "hover:bg-slate-700" : "hover:bg-gray-50"} transition-colors cursor-pointer`}
                        >
                          {/* # — center */}
                          <td
                            className={`px-3 py-3 text-xs text-center ${t.cardText}`}
                          >
                            {(currentPage - 1) * ROWS_PER_PAGE + idx + 1}
                          </td>
                          {/* Appt ID — left */}
                          <td
                            className={`px-4 py-3 text-xs text-left font-semibold ${t.cardText}`}
                          >
                            #{appt.id}
                          </td>
                          {/* Complaint — left */}
                          <td
                            className={`px-4 py-3 text-xs text-left font-semibold ${t.cardText}`}
                          >
                            #{appt.complaint_id || "—"}
                          </td>
                          {/* Complainant — left */}
                          <td
                            className={`px-4 py-3 text-xs text-left ${t.cardText} truncate`}
                            title={appt.complainant_name}
                          >
                            {appt.complainant_name || "—"}
                          </td>
                          {/* Date — left */}
                          <td
                            className={`px-4 py-3 text-xs text-left ${t.cardText} whitespace-nowrap`}
                          >
                            {formatDate(appt.date)}
                          </td>
                          {/* Time — left */}
                          <td
                            className={`px-4 py-3 text-xs text-left ${t.cardText} whitespace-nowrap`}
                          >
                            {formatTime(appt.time)}
                          </td>
                          {/* Status — left */}
                          <td className="px-4 py-3 text-left">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold font-kumbh uppercase ${statusBadgeCls(status)}`}
                            >
                              {status.replace(/_/g, " ")}
                            </span>
                          </td>
                          {/* Actions — left (stop propagation so row-click doesn't fire) */}
                          <td
                            className="px-4 py-3 text-left"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center gap-1 flex-wrap">
                              {status === "scheduled" && (
                                <button
                                  onClick={() => setRescheduleTarget(appt)}
                                  className={`px-2 py-1 text-[10px] font-kumbh font-bold rounded-lg transition-colors ${
                                    isDark
                                      ? "bg-slate-600 text-slate-200 hover:bg-slate-500"
                                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  }`}
                                >
                                  Reschedule
                                </button>
                              )}
                              {status !== "scheduled" && (
                                <span
                                  className={`text-[10px] font-kumbh ${isDark ? "text-slate-500" : "text-gray-400"}`}
                                >
                                  —
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className={`px-4 py-14 text-center ${t.subtleText}`}
                      >
                        <svg
                          className="w-12 h-12 mx-auto mb-3 opacity-30"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-sm font-kumbh">
                          No appointments found for the selected filters.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  className={`flex items-center justify-between pt-3 border-t ${isDark ? "border-slate-700" : "border-gray-100"} mt-2`}
                >
                  <p className={`text-xs ${t.subtleText} font-kumbh`}>
                    Showing {(currentPage - 1) * ROWS_PER_PAGE + 1}–
                    {Math.min(currentPage * ROWS_PER_PAGE, filteredData.length)}{" "}
                    of {filteredData.length} results
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1.5 rounded-lg text-xs font-kumbh font-semibold transition-colors ${
                        currentPage === 1
                          ? isDark
                            ? "text-slate-600 cursor-not-allowed"
                            : "text-gray-300 cursor-not-allowed"
                          : isDark
                            ? "text-slate-300 hover:bg-slate-200 hover:text-slate-800"
                            : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Prev
                    </button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      // Show pages around current page
                      let page;
                      if (totalPages <= 7) {
                        page = i + 1;
                      } else if (currentPage <= 4) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 3) {
                        page = totalPages - 6 + i;
                      } else {
                        page = currentPage - 3 + i;
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg text-xs font-kumbh font-bold transition-colors ${
                            page === currentPage
                              ? "bg-green-700 text-white"
                              : isDark
                                ? "text-slate-300 hover:bg-slate-200 hover:text-slate-800"
                                : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1.5 rounded-lg text-xs font-kumbh font-semibold transition-colors ${
                        currentPage === totalPages
                          ? isDark
                            ? "text-slate-600 cursor-not-allowed"
                            : "text-gray-300 cursor-not-allowed"
                          : isDark
                            ? "text-slate-300 hover:bg-slate-200 hover:text-slate-800"
                            : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create appointment modal */}
      {createOpen && (
        <CreateAppointmentModal
          appointments={appointments}
          onSave={handleCreate}
          onClose={() => setCreateOpen(false)}
          isDark={isDark}
          t={t}
          availability={availability}
        />
      )}

      {/* Appointment details modal */}
      {detailsTarget && (
        <AppointmentDetailsModal
          appointment={detailsTarget}
          onClose={() => setDetailsTarget(null)}
          onReschedule={(appt) => setRescheduleTarget(appt)}
          onStatusChange={handleStatusChange}
          isDark={isDark}
          t={t}
        />
      )}

      {/* Reschedule modal */}
      {rescheduleTarget && (
        <RescheduleModal
          appointment={rescheduleTarget}
          appointments={appointments}
          onSave={handleReschedule}
          onClose={() => setRescheduleTarget(null)}
          isDark={isDark}
          t={t}
          availability={availability}
        />
      )}

      {/* Overdue alert modal */}
      {overdueModal.open && (
        <OverdueAlertModal
          appointments={overdueModal.appointments}
          onAction={handleStatusChange}
          onClose={() => setOverdueModal({ open: false, appointments: [] })}
          isDark={isDark}
          t={t}
        />
      )}

      {/* Toasts */}
      <Toast
        toasts={toasts}
        onRemove={removeToast}
        currentTheme={currentTheme}
      />
    </div>
  );
};

export default AdminAppointments;


