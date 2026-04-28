import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ThemeModal from "../../components/sub-system-3/ThemeModal";
import LogoutModal from "./LogoutModal";
import {
  canAccessAdminPanel,
  canAccessStaffPanel,
  canViewAppointments,
  canViewDocuments,
  canViewIncidentCases,
  canViewResidents,
  getProfilePath,
  logout,
  getUser,
  mapAdminPathToAccessiblePath,
  replaceCurrentHistoryPath,
} from "../../homepage/services/loginService";
import { useLanguage } from "../../context/LanguageContext";
import { useRealTime } from "../../context/RealTimeContext";
import { useUserRealTime } from "../../context/UserRealTimeContext";
import { useBranding } from "../../context/BrandingContext";
import themeTokens from "../../Themetokens";
import logo from "../../assets/images/logo.jpg";
import { getResidentProfilePhoto, syncResidentProfilePhoto } from "../../utils/profilePhoto";
import { residentService } from "../../services/sub-system-1/residents";
import { incidentService } from "../../services/sub-system-3/incidentService";
import { getAllComplaints } from "../../services/sub-system-3/complaintService";
import { DOCUMENTS_API_BASE_URL } from "../../config/runtimeApi";
import { requestJson } from "../../services/shared/http";

// ── Notification sound using Web Audio API (no mp3 file needed) ─────────
const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    // First tone (higher pitch)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.15);

    // Second tone (even higher, slight delay)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1175, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.001, ctx.currentTime);
    gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.3);

    // Cleanup
    setTimeout(() => ctx.close(), 500);
  } catch {
    // Ignore — no audio support or blocked by autoplay policy
  }
};

const SEARCH_RESULT_TYPE_STYLES = {
  resident: "border-emerald-200 bg-emerald-50 text-emerald-700",
  incident: "border-rose-200 bg-rose-50 text-rose-700",
  complaint: "border-amber-200 bg-amber-50 text-amber-700",
  document: "border-sky-200 bg-sky-50 text-sky-700",
  appointment: "border-violet-200 bg-violet-50 text-violet-700",
};

const normalizeSearchText = (value) => String(value || "").toLowerCase().trim();

const normalizeSearchCollection = (payload) =>
  Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];

const getSearchIncidentTypeLabel = (incident) => {
  if (typeof incident?.type === "string" && incident.type.trim()) {
    try {
      const parsed = JSON.parse(incident.type);
      if (Array.isArray(parsed)) return parsed.join(", ");
      return String(parsed);
    } catch {
      return incident.type;
    }
  }

  if (Array.isArray(incident?.types) && incident.types.length > 0) {
    return incident.types.map((type) => type?.name).filter(Boolean).join(", ");
  }

  return "Incident";
};

// ── Appointment detail helpers ──────────────────────────────────────────
const parseApptScheduledAt = (scheduledAt) => {
  if (!scheduledAt) return { date: null, time: null };
  const [datePart, timePart] = String(scheduledAt).split(/[T ]/);
  return { date: datePart || null, time: timePart ? timePart.substring(0, 5) : null };
};

const formatApptTime = (timeStr) => {
  if (!timeStr) return "—";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const mins = m || "00";
  const ampm = hour < 12 ? "AM" : "PM";
  const disp = hour % 12 || 12;
  return `${disp}:${mins} ${ampm}`;
};

const APPT_STATUS_BADGE = {
  scheduled:   "bg-blue-100 text-blue-700 border border-blue-200",
  rescheduled: "bg-amber-100 text-amber-700 border border-amber-200",
  completed:   "bg-green-100 text-green-700 border border-green-200",
  cancelled:   "bg-gray-100 text-gray-500 border border-gray-200",
  no_show:     "bg-red-100 text-red-700 border border-red-200",
};

// ── User Appointment Details Modal ───────────────────────────────────────
const UserAppointmentDetailsModal = ({ notification, onClose, isDark, t }) => {
  const data = notification.data || {};
  const { date, time } = parseApptScheduledAt(data.scheduled_at);

  const fullDate = date
    ? new Date(date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
      })
    : "—";

  const status = (data.status || "scheduled").toLowerCase().replace(/-/g, "_");
  const badgeCls = APPT_STATUS_BADGE[status] || APPT_STATUS_BADGE.scheduled;
  const title = data.title || notification.description || "Appointment";
  const description = data.description || notification.description || "";

  return (
    <div className="fixed inset-0 z-[1600] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className={`${t.cardBg} rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden`}>

        {/* Header */}
        <div className={`px-6 py-4 border-b ${isDark ? "border-slate-700 bg-slate-900" : "border-gray-200 bg-gray-50"} flex items-start gap-3`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? "bg-slate-700" : "bg-blue-100"}`}>
            <svg className={`w-5 h-5 ${isDark ? "text-slate-300" : "text-blue-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <h3 className={`text-sm font-bold ${t.cardText} font-spartan truncate`}>{title}</h3>
            {data.complaint_id && (
              <p className={`text-xs ${t.subtleText} font-kumbh`}>
                Complaint #{data.complaint_id}
                {data.appointment_id ? ` · Appointment #${data.appointment_id}` : ""}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${isDark ? "hover:bg-slate-700 text-slate-400" : "hover:bg-gray-200 text-gray-400"}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {/* Status */}
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold font-kumbh uppercase ${badgeCls}`}>
            {status.replace(/_/g, " ")}
          </span>

          {/* Date & Time */}
          <div className={`flex gap-3 p-4 rounded-xl ${isDark ? "bg-slate-700" : "bg-blue-50"} border ${isDark ? "border-slate-600" : "border-blue-100"}`}>
            <div className="flex-1">
              <p className={`text-[10px] font-bold uppercase tracking-wide mb-1 font-kumbh ${isDark ? "text-slate-400" : "text-blue-500"}`}>Date</p>
              <p className={`text-sm font-bold font-spartan ${t.cardText}`}>{fullDate}</p>
            </div>
            <div className={`w-px ${isDark ? "bg-slate-600" : "bg-blue-200"}`} />
            <div className="flex-shrink-0 text-right">
              <p className={`text-[10px] font-bold uppercase tracking-wide mb-1 font-kumbh ${isDark ? "text-slate-400" : "text-blue-500"}`}>Time</p>
              <p className={`text-sm font-bold font-spartan ${t.cardText}`}>{formatApptTime(time)}</p>
            </div>
          </div>

          {/* Detail rows */}
          <div className={`rounded-xl border ${t.cardBorder} divide-y ${isDark ? "divide-slate-700" : "divide-gray-100"} overflow-hidden`}>
            {data.complaint_id && (
              <div className={`flex items-center px-4 py-3 ${isDark ? "bg-slate-800" : "bg-white"}`}>
                <span className={`text-xs font-semibold w-36 flex-shrink-0 font-kumbh ${t.subtleText}`}>Complaint</span>
                <span className={`text-xs font-kumbh ${t.cardText}`}>#{data.complaint_id}</span>
              </div>
            )}
            {description && description !== title && (
              <div className={`px-4 py-3 ${isDark ? "bg-slate-800" : "bg-white"}`}>
                <span className={`text-xs font-semibold font-kumbh ${t.subtleText} block mb-1`}>Details</span>
                <span className={`text-xs font-kumbh ${t.cardText} leading-relaxed`}>{description}</span>
              </div>
            )}
            <div className={`flex items-center px-4 py-3 ${isDark ? "bg-slate-800" : "bg-white"}`}>
              <span className={`text-xs font-semibold w-36 flex-shrink-0 font-kumbh ${t.subtleText}`}>Received</span>
              <span className={`text-xs font-kumbh ${t.cardText}`}>
                {notification.timestamp
                  ? new Date(
                      typeof notification.timestamp === "string" &&
                      /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/.test(notification.timestamp)
                        ? notification.timestamp.replace(" ", "T") + "Z"
                        : notification.timestamp
                    ).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${isDark ? "border-slate-700 bg-slate-900" : "border-gray-100 bg-gray-50"} flex justify-end`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg text-sm font-kumbh font-semibold transition-colors ${
              isDark ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// â”€â”€ Resident Profile Update Details Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ProfileUpdateDetailsModal = ({ notification, onClose, isDark, t }) => {
  const data = notification?.data || {};
  const fields = Array.isArray(data.changed_fields) ? data.changed_fields : [];
  const details = Array.isArray(data.changed_details) ? data.changed_details : [];
  const updatedBy = data.editor_name || notification.reportedBy || "Staff";
  const changeCount = fields.length;
  const timestamp = formatNotificationDateTime(notification.timestamp) || "N/A";

  return (
    <div className="fixed inset-0 z-[1600] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className={`${t.cardBg} rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden`}>
        <div className={`px-6 py-4 border-b ${isDark ? "border-slate-700 bg-slate-900" : "border-gray-200 bg-gray-50"} flex items-center gap-3`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? "bg-slate-700" : "bg-blue-100"}`}>
            <svg className={`w-5 h-5 ${isDark ? "text-slate-300" : "text-blue-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 11a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <h3 className={`text-left text-sm font-bold ${t.cardText} font-spartan truncate`}>Profile Update Details</h3>
            <p className={`text-left text-xs ${t.subtleText} font-kumbh`}>Updated by {updatedBy}</p>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${isDark ? "hover:bg-slate-700 text-slate-400" : "hover:bg-gray-200 text-gray-400"}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className={`rounded-xl border ${t.cardBorder} overflow-hidden`}>
            <div className={`px-4 py-3 ${isDark ? "bg-slate-800" : "bg-white"} flex items-center justify-between`}>
              <span className={`text-xs font-semibold font-kumbh ${t.subtleText}`}>Changed fields</span>
              <span className={`text-xs font-bold font-kumbh ${t.cardText}`}>{changeCount || "—"}</span>
            </div>
            <div className={`px-4 py-3 ${isDark ? "bg-slate-800" : "bg-white"} border-t ${t.cardBorder}`}>
              {fields.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {fields.map((field, i) => (
                    <span
                      key={`${field}-${i}`}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold font-kumbh border ${
                        isDark
                          ? "border-slate-600 bg-slate-700 text-slate-200"
                          : "border-slate-200 bg-slate-100 text-slate-600"
                      }`}
                    >
                      {field}
                    </span>
                  ))}
                </div>
              ) : (
                <p className={`text-xs font-kumbh ${t.subtleText}`}>
                  No field list available for this update.
                </p>
              )}
            </div>
          </div>

          <div className={`rounded-xl border ${t.cardBorder} overflow-hidden`}>
            <div className={`px-4 py-3 ${isDark ? "bg-slate-800" : "bg-white"} flex items-center justify-between`}>
              <span className={`text-xs font-semibold font-kumbh ${t.subtleText}`}>Value changes</span>
              <span className={`text-xs font-bold font-kumbh ${t.cardText}`}>{details.length || "—"}</span>
            </div>
            <div className={`px-4 py-3 ${isDark ? "bg-slate-800" : "bg-white"} border-t ${t.cardBorder}`}>
              {details.length > 0 ? (
                <div className="space-y-2">
                  {details.map((item, i) => (
                    <div
                      key={`${item.field || "field"}-${i}`}
                      className={`flex items-start gap-3 rounded-lg border px-3 py-2 text-[11px] font-kumbh ${
                        isDark
                          ? "border-slate-700 bg-slate-700/70 text-slate-200"
                          : "border-slate-200 bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className={`w-28 flex-shrink-0 font-semibold ${isDark ? "text-slate-200" : "text-slate-600"}`}>
                        {item.field || "Field"}
                      </div>
                      <div className="flex-1">
                        <span className={`${isDark ? "text-slate-300" : "text-slate-600"}`}>
                          {item.old_value ?? "N/A"}
                        </span>
                        <span className={`mx-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>-&gt;</span>
                        <span className={`${isDark ? "text-white" : "text-slate-900"}`}>
                          {item.new_value ?? "N/A"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-xs font-kumbh ${t.subtleText}`}>
                  No value details available for this update.
                </p>
              )}
            </div>
          </div>

          <div className={`rounded-xl border ${t.cardBorder} overflow-hidden`}>
            <div className={`flex items-center px-4 py-3 ${isDark ? "bg-slate-800" : "bg-white"}`}>
              <span className={`text-xs font-semibold w-28 flex-shrink-0 font-kumbh ${t.subtleText}`}>Updated on</span>
              <span className={`text-xs font-kumbh ${t.cardText}`}>{timestamp}</span>
            </div>
          </div>
        </div>

        <div className={`px-6 py-4 border-t ${isDark ? "border-slate-700 bg-slate-900" : "border-gray-100 bg-gray-50"} flex justify-end`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg text-sm font-kumbh font-semibold transition-colors ${
              isDark ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Relative time utility ───────────────────────────────────────────────
// Laravel may return timestamps as "YYYY-MM-DD HH:MM:SS" or
// "YYYY-MM-DDTHH:MM:SS.ffffff" without a timezone indicator — these are UTC.
// Appending "Z" forces correct UTC interpretation in all browsers.
const normalizeTimestamp = (date) => {
  if (typeof date === "string" &&
    /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(date)) {
    // Only normalize the separator — do NOT append "Z".
    // Backend returns timestamps in server local time (PHT/UTC+8); treating them
    // as UTC causes all timestamps to appear 8 h in the future, resulting in a
    // negative diff that always falls into the "Just now" branch.
    return date.replace(" ", "T");
  }
  return date;
};

const formatNotificationDate = (date) => {
  if (!date) return "";
  const normalized = normalizeTimestamp(date);
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatNotificationDateTime = (date) => {
  if (!date) return "";
  const normalized = normalizeTimestamp(date);
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const getRelativeTime = (date) => {
  if (!date) return "";
  const now = new Date();
  const diff = Math.floor((now - new Date(normalizeTimestamp(date))) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
};

const buildRegistrationDescription = (newCount, pendingCount) =>
  `${newCount} new registration${newCount === 1 ? "" : "s"} submitted for review. Total pending: ${pendingCount}.`;

const getNotificationDescription = (notification) => {
  const fallback =
    notification?.description ||
    notification?.message ||
    "No description provided.";

  const isRegistrationNotification =
    notification?.source === "registration" ||
    notification?.type === "registration_pending";

  if (!isRegistrationNotification) return fallback;

  const dataNewCount = Number.parseInt(notification?.data?.newCount, 10);
  const dataPendingCount = Number.parseInt(notification?.data?.totalPending, 10);

  if (Number.isFinite(dataNewCount) && Number.isFinite(dataPendingCount)) {
    return buildRegistrationDescription(dataNewCount, dataPendingCount);
  }

  const shortPatternMatch = String(fallback).match(
    /(\d+)\s+for review,\s*(\d+)\s+pending total\.?/i,
  );

  if (shortPatternMatch) {
    return buildRegistrationDescription(
      Number.parseInt(shortPatternMatch[1], 10),
      Number.parseInt(shortPatternMatch[2], 10),
    );
  }

  return fallback;
};

const getNotificationSeverity = (notification) => {
  const source = String(notification?.source || "").toLowerCase();
  const type = String(notification?.type || "").toLowerCase();
  const nextStatus = String(
    notification?.newStatus ||
      notification?.data?.new_status ||
      "",
  ).toLowerCase();

  if (
    source === "incident" ||
    type === "incident_status_updated" ||
    nextStatus === "active" ||
    nextStatus === "dispatched"
  ) {
    return "critical";
  }

  if (
    source === "complaint" ||
    source === "registration" ||
    type === "complaint_status_updated" ||
    type === "registration_pending" ||
    nextStatus === "pending" ||
    nextStatus === "rejected"
  ) {
    return "warning";
  }

  return "info";
};

const BellOutlineIcon = ({ className = "", strokeWidth = 2 }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

// ── Memoized notification list item ─────────────────────────────────────
const NotificationItem = memo(({ notification, isDark, onMarkAsRead, onViewAppointment, onViewRegistration, onViewProfileUpdate, onCloseMenu }) => {
  const statusColor = notification.read ? "bg-gray-400" : "bg-amber-500";
  const statusLabel = notification.read ? "Read" : "New";
  const timeAgo = getRelativeTime(notification.timestamp);
  const absoluteDateTime = formatNotificationDateTime(notification.timestamp);
  const isIncident = notification.source === "incident";
  const isAppointment = notification.source === "appointment";
  const isRegistration = notification.source === "registration";
  const isResident = notification.source === "resident";
  const isStatusChange = !!notification.oldStatus;
  const byLabel = isResident ? "Updated by" : "Reported by";
  const descriptionText = getNotificationDescription(notification);

  const sourceLabel = isRegistration
    ? "Registration"
    : isAppointment
      ? "Appointment"
      : isResident
        ? "Resident"
        : isIncident
          ? "Incident"
          : "Complaint";
  const displayType = notification.type === "appointment_scheduled"
    ? "Appointment Scheduled"
    : notification.type === "registration_pending"
      ? "Resident Registration"
      : notification.type === "profile_updated"
        ? "Profile Updated"
      : notification.type === "incident_status_updated"
        ? "Incident Status Updated"
        : notification.type === "complaint_status_updated"
          ? "Complaint Status Updated"
          : notification.type;

  const capitalize = (str) =>
    str ? str.replace(/\b\w/g, (c) => c.toUpperCase()) : str;

  const handleClick = () => {
    onMarkAsRead(notification.id);
    if (isAppointment && onViewAppointment) {
      onCloseMenu?.();
      onViewAppointment(notification);
      return;
    }
    if (isRegistration && onViewRegistration) {
      onCloseMenu?.();
      onViewRegistration(notification);
      return;
    }
    if (isResident && onViewProfileUpdate) {
      onCloseMenu?.();
      onViewProfileUpdate(notification);
      return;
    }
    onCloseMenu?.();
  };

  const accentColor = isIncident
    ? "border-l-red-500"
    : isRegistration
      ? "border-l-emerald-500"
      : isAppointment
        ? "border-l-sky-500"
        : isResident
          ? "border-l-amber-500"
          : "border-l-violet-500";

  return (
    <div
      onClick={handleClick}
      className={`border-b border-l-4 ${accentColor} px-3 py-3 sm:px-4 ${
        isDark ? "border-b-slate-700 hover:bg-slate-700/60" : "border-b-slate-100 hover:bg-slate-50"
      } transition-colors cursor-pointer ${
        !notification.read
          ? isDark ? "bg-slate-700/40" : "bg-blue-50/40"
          : ""
      }`}
    >
      {/* Row 1 — source + status + status-change pill */}
      <div className="flex items-center gap-1.5 flex-wrap mb-1">
        <span className={`text-[10px] font-bold font-kumbh uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          {sourceLabel}
        </span>
        <span className={`${statusColor} text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full font-kumbh`}>
          {statusLabel}
        </span>
        {isStatusChange && (
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full font-kumbh ${isDark ? "bg-slate-600 text-slate-300" : "bg-slate-200 text-slate-600"}`}>
            {capitalize(notification.oldStatus)} → {capitalize(notification.newStatus)}
          </span>
        )}
      </div>

      {/* Row 2 — title */}
      <p className={`text-[13px] font-semibold font-kumbh leading-snug ${isDark ? "text-slate-100" : "text-slate-900"}`}>
        {displayType}
      </p>

      {/* Row 3 — description */}
      <p className={`mt-0.5 text-[11px] font-kumbh leading-relaxed line-clamp-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
        {descriptionText}
      </p>

      {/* Row 4 — timestamp */}
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="min-w-0 space-y-0.5">
          <p className={`text-[10px] font-kumbh flex items-center gap-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{timeAgo}</span>
            {absoluteDateTime && <span className={isDark ? "text-slate-600" : "text-slate-300"}>·</span>}
            {absoluteDateTime && <span>{absoluteDateTime}</span>}
          </p>
          {notification.reportedBy && (
            <p className={`text-[10px] font-kumbh flex items-center gap-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{byLabel} <span className={`font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>{notification.reportedBy}</span></span>
            </p>
          )}
        </div>
        {(isAppointment || isRegistration) && (
          <span className={`shrink-0 text-[10px] font-semibold font-kumbh ${isDark ? "text-blue-400" : "text-blue-500"}`}>
            {isRegistration ? "View pending list →" : "View details →"}
          </span>
        )}
      </div>
    </div>
  );
});

// ── Header ──────────────────────────────────────────────────────────────
const NotificationHistoryItem = memo(({ notification, isDark, onMarkAsRead, onViewAppointment, onViewRegistration, onViewProfileUpdate, onCloseMenu, onNavigateToAction }) => {
  const unread = !notification.read;
  const timeAgo = getRelativeTime(notification.timestamp);
  const absoluteDateTime = formatNotificationDateTime(notification.timestamp);
  const isIncident = notification.source === "incident";
  const isAppointment = notification.source === "appointment";
  const isRegistration = notification.source === "registration";
  const isResident = notification.source === "resident";
  const isStatusChange = !!notification.oldStatus;
  const byLabel = isResident ? "Updated by" : "Reported by";
  const descriptionText = getNotificationDescription(notification);

  const sourceLabel = isRegistration
    ? "Registration"
    : isAppointment
      ? "Appointment"
      : isResident
        ? "Resident"
        : isIncident
          ? "Incident"
          : "Complaint";

  const displayType = notification.type === "appointment_scheduled"
    ? "Appointment Scheduled"
    : notification.type === "registration_pending"
      ? "Resident Registration"
      : notification.type === "profile_updated"
        ? "Profile Updated"
      : notification.type === "incident_status_updated"
        ? "Incident Status Updated"
        : notification.type === "complaint_status_updated"
          ? "Complaint Status Updated"
          : notification.type;

  const actionLabel = isRegistration
    ? "View"
    : isAppointment
      ? "Open details"
      : isIncident || notification.type === "incident_status_updated"
        ? "View incident"
        : notification.source === "complaint" || notification.type === "complaint_status_updated"
          ? "View complaint"
          : null;

  const capitalize = (str) =>
    str ? str.replace(/\b\w/g, (c) => c.toUpperCase()) : str;

  const handleClick = () => {
    onMarkAsRead(notification.id);
    if (isAppointment && onViewAppointment) {
      onCloseMenu?.();
      onViewAppointment(notification);
      return;
    }
    if (isRegistration && onViewRegistration) {
      onCloseMenu?.();
      onViewRegistration(notification);
      return;
    }
    if (isResident && onViewProfileUpdate) {
      onCloseMenu?.();
      onViewProfileUpdate(notification);
      return;
    }
    if (onNavigateToAction) {
      onNavigateToAction(notification);
      return;
    }
    onCloseMenu?.();
  };

  const handleMarkReadOnly = (e) => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
  };

  const handleKeyDown = (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    handleClick();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`w-full rounded-xl border p-3 text-left transition-all ${
        unread
          ? isDark
            ? "border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/15"
            : "border-violet-200 bg-violet-50/80 hover:bg-violet-50"
          : isDark
            ? "border-slate-700 bg-slate-800/70 hover:bg-slate-800"
            : "border-slate-200 bg-white hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {/* Row 1 — source label + status-change pill + mark-read */}
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            {isStatusChange && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium font-kumbh ${
                isDark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"
              }`}>
                {capitalize(notification.oldStatus)} → {capitalize(notification.newStatus)}
              </span>
            )}
          </div>

          {/* Row 2 — title */}
          <p className={`text-[13px] font-semibold leading-snug font-kumbh ${
            isDark ? "text-slate-100" : "text-slate-900"
          }`}>
            {displayType}
          </p>

          {/* Row 3 — description */}
          <p className={`mt-0.5 text-[11px] leading-relaxed font-kumbh ${
            isDark ? "text-slate-400" : "text-slate-600"
          }`}>
            {descriptionText}
          </p>

          {/* Row 4 — timestamp + reporter + action */}
          <div className="mt-2 flex items-end justify-between gap-3">
            <div className="min-w-0 space-y-0.5">
              <p className={`text-[10px] font-kumbh flex items-center gap-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{timeAgo}</span>
                {absoluteDateTime && <span className={isDark ? "text-slate-600" : "text-slate-300"}>·</span>}
                {absoluteDateTime && <span>{absoluteDateTime}</span>}
              </p>
              {notification.reportedBy && (
                <p className={`text-[10px] font-kumbh flex items-center gap-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{byLabel} <span className={`font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>{notification.reportedBy}</span></span>
                </p>
              )}
            </div>

            {actionLabel && (
              <span className={`shrink-0 inline-flex items-center rounded-lg border px-3 py-1.5 text-[9px] font-semibold font-kumbh shadow-sm transition-colors ${
                isDark
                  ? "border-violet-400/30 bg-violet-500/20 text-violet-200"
                  : "border-violet-200 bg-violet-100 text-violet-700"
              }`}>
                {actionLabel}
              </span>
            )}
          </div>
        </div>

        {/* Mark as read button — right side, only for unread */}
        {unread && (
          <button
            type="button"
            onClick={handleMarkReadOnly}
            title="Mark as read"
            className={`flex-shrink-0 self-start mt-0.5 rounded-lg px-2 py-1 text-[10px] font-semibold font-kumbh transition-colors ${
              isDark
                ? "bg-violet-500/20 text-violet-300 hover:bg-violet-500/35"
                : "bg-violet-100 text-violet-600 hover:bg-violet-200"
            }`}
          >
            Mark read
          </button>
        )}
      </div>
    </div>
  );
});

const ModernNotificationHistoryItem = memo(({ notification, isDark, onMarkAsRead, onViewAppointment, onViewRegistration, onViewProfileUpdate, onCloseMenu, onNavigateToAction }) => {
  const unread = !notification.read;
  const timeAgo = getRelativeTime(notification.timestamp);
  const absoluteDateTime = formatNotificationDateTime(notification.timestamp);
  const isIncident = notification.source === "incident";
  const isAppointment = notification.source === "appointment";
  const isRegistration = notification.source === "registration";
  const isResident = notification.source === "resident";
  const isStatusChange = !!notification.oldStatus;
  const severity = getNotificationSeverity(notification);
  const byLabel = isResident ? "Updated by" : "Reported by";
  const descriptionText = getNotificationDescription(notification);

  const capitalize = (str) =>
    str ? str.replace(/\b\w/g, (c) => c.toUpperCase()) : str;

  const sourceLabel = isRegistration
    ? "Registration"
    : isAppointment
      ? "Appointment"
      : isResident
        ? "Resident"
        : isIncident
          ? "Incident"
          : "Complaint";

  const displayType = notification.type === "appointment_scheduled"
    ? "Appointment Scheduled"
    : notification.type === "registration_pending"
      ? "Resident Registration"
      : notification.type === "profile_updated"
        ? "Profile Updated"
        : notification.type === "incident_status_updated"
          ? "Incident Status Updated"
          : notification.type === "complaint_status_updated"
            ? "Complaint Status Updated"
            : capitalize(String(notification.type || "Notification").replace(/_/g, " "));

  const actionLabel = isRegistration
    ? "View"
    : isAppointment
      ? "Open details"
      : isIncident || notification.type === "incident_status_updated"
        ? "View incident"
        : notification.source === "complaint" || notification.type === "complaint_status_updated"
          ? "View complaint"
          : null;

  const severityLabel =
    severity === "critical"
      ? "Critical"
      : severity === "warning"
        ? "Warning"
        : "Info";

  const severityTone =
    severity === "critical"
      ? isDark
        ? "border-rose-500/20 bg-rose-500/10 text-rose-300"
        : "border-rose-200 bg-rose-50 text-rose-700"
      : severity === "warning"
        ? isDark
          ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
          : "border-amber-200 bg-amber-50 text-amber-700"
        : isDark
          ? "border-sky-500/20 bg-sky-500/10 text-sky-300"
          : "border-sky-200 bg-sky-50 text-sky-700";

  const sourceTone = isRegistration
    ? isDark
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
      : "border-emerald-200 bg-emerald-50 text-emerald-700"
    : isAppointment
      ? isDark
        ? "border-sky-500/20 bg-sky-500/10 text-sky-300"
        : "border-sky-200 bg-sky-50 text-sky-700"
      : isResident
        ? isDark
          ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
          : "border-amber-200 bg-amber-50 text-amber-700"
        : isIncident
          ? isDark
            ? "border-rose-500/20 bg-rose-500/10 text-rose-300"
            : "border-rose-200 bg-rose-50 text-rose-700"
          : isDark
            ? "border-slate-700 bg-slate-800 text-slate-300"
            : "border-slate-200 bg-slate-100 text-slate-700";

  const handleClick = () => {
    onMarkAsRead(notification.id);
    if (isAppointment && onViewAppointment) {
      onCloseMenu?.();
      onViewAppointment(notification);
      return;
    }
    if (isRegistration && onViewRegistration) {
      onCloseMenu?.();
      onViewRegistration(notification);
      return;
    }
    if (isResident && onViewProfileUpdate) {
      onCloseMenu?.();
      onViewProfileUpdate(notification);
      return;
    }
    if (onNavigateToAction) {
      onNavigateToAction(notification);
      return;
    }
    onCloseMenu?.();
  };

  const handleActionClick = (e) => {
    e.stopPropagation();
    handleClick();
  };

  const handleKeyDown = (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    handleClick();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`group relative w-full overflow-hidden rounded-[0.9rem] border text-left transition-all focus:outline-none ${
        unread
          ? isDark
            ? "border-slate-700 bg-slate-900 shadow-[0_10px_28px_rgba(15,23,42,0.24)] hover:border-slate-600"
            : "border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)] hover:border-slate-300"
          : isDark
            ? "border-slate-800 bg-slate-900/70 hover:border-slate-700"
            : "border-slate-200/80 bg-white/88 hover:border-slate-300"
      }`}
    >
      {unread && (
        <span className={`absolute bottom-2.5 left-0 top-2.5 w-1 rounded-r-full ${isDark ? "bg-emerald-400" : "bg-emerald-500"}`} />
      )}
      <div className="p-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold font-kumbh ${sourceTone}`}>
                  {sourceLabel}
                </span>
                <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold font-kumbh ${severityTone}`}>
                  {severityLabel}
                </span>
                {unread && (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold font-kumbh ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>
                    <span className={`h-1 w-1 rounded-full ${isDark ? "bg-emerald-300" : "bg-emerald-500"}`} />
                    Unread
                  </span>
                )}
                {isStatusChange && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium font-kumbh ${
                    isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"
                  }`}>
                    {capitalize(notification.oldStatus)} → {capitalize(notification.newStatus)}
                  </span>
                )}
              </div>

              {actionLabel && (
                <button
                  type="button"
                  onClick={handleActionClick}
                  title={actionLabel}
                  aria-label={actionLabel}
                  className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    isDark
                      ? "border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-600 hover:text-white"
                      : "border-slate-200 bg-slate-100 text-slate-700 hover:border-slate-300 hover:text-slate-900"
                  }`}
                >
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7S3.732 16.057 2.458 12z"
                    />
                  </svg>
                </button>
              )}
            </div>

            <p className={`mt-1.5 text-[13px] font-semibold leading-4.5 font-kumbh ${
              isDark ? "text-slate-100" : "text-slate-900"
            }`}>
              {displayType}
            </p>

            <p className={`mt-1 text-[11px] leading-4 font-kumbh ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}>
              {descriptionText}
            </p>

            <div className="mt-1.5 space-y-0.5">
              <p className={`text-[10px] font-kumbh flex items-center gap-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{timeAgo}</span>
                {absoluteDateTime && <span className={isDark ? "text-slate-600" : "text-slate-300"}>·</span>}
                {absoluteDateTime && <span>{absoluteDateTime}</span>}
              </p>
              {notification.reportedBy && (
                <p className={`text-[10px] font-kumbh flex items-center gap-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{byLabel} <span className={`font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>{notification.reportedBy}</span></span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const Header = ({ currentTheme, onThemeChange, onMobileSidebarToggle, mobileSidebarOpen }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isHeaderSearchOpen, setIsHeaderSearchOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  const [headerSearchLoading, setHeaderSearchLoading] = useState(false);
  const [headerSearchError, setHeaderSearchError] = useState("");
  const [hasHeaderSearchLoaded, setHasHeaderSearchLoaded] = useState(false);
  const [headerSearchDatasets, setHeaderSearchDatasets] = useState({
    residents: [],
    incidents: [],
    complaints: [],
    documents: [],
    appointments: [],
  });
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [appointmentDetail, setAppointmentDetail] = useState(null);
  const [profileUpdateDetail, setProfileUpdateDetail] = useState(null);
  const [notificationFilter, setNotificationFilter] = useState("all");
  const notificationRef = useRef(null);
  const settingsRef = useRef(null);
  const profileRef = useRef(null);
  const headerSearchRef = useRef(null);
  const headerSearchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, tr } = useLanguage();
  const isSubSystem2Route = location.pathname.startsWith("/sub-system-2") || location.pathname.startsWith("/incident-complaint");
  const { logoDataUrl } = useBranding();
  const logoSrc = logoDataUrl || logo;
  const user = getUser();
  const isAdminUser = canAccessAdminPanel();
  const isBackOfficeUser = canAccessStaffPanel();
  const isStaffUser = isBackOfficeUser && !isAdminUser;

  // Real-time notifications — merge admin and user contexts
  const adminRT = useRealTime();
  const userRT = useUserRealTime();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } =
    isBackOfficeUser ? adminRT : userRT;

  const userName = user?.name || "User";
  const userEmail = user?.email || "";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const [residentPhoto, setResidentPhoto] = useState(() =>
    isBackOfficeUser ? "" : getResidentProfilePhoto(user),
  );

  useEffect(() => {
    if (isBackOfficeUser) return;
    setResidentPhoto(getResidentProfilePhoto(user));
    syncResidentProfilePhoto(user)
      .then((remote) => {
        if (remote) setResidentPhoto(remote);
      })
      .catch(() => {});
  }, [isBackOfficeUser, user]);

  useEffect(() => {
    const handler = () => {
      if (!isBackOfficeUser) {
        setResidentPhoto(getResidentProfilePhoto(user));
      }
    };
    window.addEventListener("residentPhotoUpdated", handler);
    return () => window.removeEventListener("residentPhotoUpdated", handler);
  }, [isBackOfficeUser, user]);

  const t = themeTokens[currentTheme];
  const isDark = currentTheme === "dark";

  const loadHeaderSearchData = useCallback(async () => {
    setHeaderSearchLoading(true);
    setHeaderSearchError("");

    try {
      const [residentResult, incidentResult, complaintResult, documentResult] =
        await Promise.allSettled([
          residentService.getResidents(),
          incidentService.getAllIncidents(),
          getAllComplaints(),
          requestJson(`${DOCUMENTS_API_BASE_URL}/documents`, {
            errorMessage: "Failed to load document records.",
          }),
        ]);

      const residents =
        residentResult.status === "fulfilled" ? residentResult.value : [];
      const incidents =
        incidentResult.status === "fulfilled"
          ? normalizeSearchCollection(incidentResult.value)
          : [];
      const complaints =
        complaintResult.status === "fulfilled"
          ? normalizeSearchCollection(complaintResult.value)
          : [];
      const documents =
        documentResult.status === "fulfilled"
          ? normalizeSearchCollection(documentResult.value)
          : [];
      const appointments = complaints.flatMap((complaint) =>
        (complaint?.appointments || []).map((appointment) => ({
          ...appointment,
          complaint_id: appointment?.complaint_id ?? complaint?.id,
          complaint_type: complaint?.type || "",
          complainant_name: complaint?.complainant_name || "",
        })),
      );

      setHeaderSearchDatasets({
        residents,
        incidents,
        complaints,
        documents,
        appointments,
      });
      setHasHeaderSearchLoaded(true);

      if (
        residentResult.status === "rejected" &&
        incidentResult.status === "rejected" &&
        complaintResult.status === "rejected" &&
        documentResult.status === "rejected"
      ) {
        setHeaderSearchError("Unable to load searchable records right now.");
      }
    } catch (loadError) {
      setHeaderSearchError(
        loadError.message || "Unable to load searchable records.",
      );
    } finally {
      setHeaderSearchLoading(false);
    }
  }, []);

  const headerSearchResults = useMemo(() => {
    const normalizedQuery = normalizeSearchText(headerSearchQuery);
    if (!normalizedQuery) return [];

    const matches = (values) =>
      values.some((value) =>
        normalizeSearchText(value).includes(normalizedQuery),
      );

    const residentResults = canViewResidents()
      ? headerSearchDatasets.residents
          .filter((resident) =>
            matches([
              resident?.name,
              resident?.barangay_id,
              resident?.trackingNumber,
              resident?.resolved_purok,
              resident?.resolved_street,
              resident?.status,
            ]),
          )
          .slice(0, 6)
          .map((resident) => ({
            id: `resident-${resident.id}`,
            type: "resident",
            title: resident?.name || resident?.barangay_id || "Resident",
            subtitle: [
              resident?.barangay_id,
              resident?.status,
              resident?.resolved_purok,
            ]
              .filter(Boolean)
              .join(" - "),
            route: mapAdminPathToAccessiblePath("/admin/residents"),
            state: {
              openResidentId: String(resident.id),
              openResidentBarangayId: String(
                resident?.barangay_id || resident?.trackingNumber || "",
              ),
              openResidentMode: "view",
              openResidentTab: "basic",
              searchQuery:
                resident?.barangay_id ||
                resident?.name ||
                resident?.trackingNumber ||
                "",
            },
          }))
      : [];

    const incidentResults = canViewIncidentCases()
      ? headerSearchDatasets.incidents
          .filter((incident) =>
            matches([
              incident?.description,
              incident?.location,
              incident?.status,
              getSearchIncidentTypeLabel(incident),
              incident?.reported_by,
            ]),
          )
          .slice(0, 6)
          .map((incident) => ({
            id: `incident-${incident.id}`,
            type: "incident",
            title: getSearchIncidentTypeLabel(incident),
            subtitle: [
              incident?.location,
              incident?.status,
              incident?.reported_by,
            ]
              .filter(Boolean)
              .join(" - "),
            route: mapAdminPathToAccessiblePath("/admin/incidents"),
            state: {
              openId: String(incident.id),
              openType: "incident",
              defaultTab: "details",
            },
          }))
      : [];

    const complaintResults = canViewIncidentCases()
      ? headerSearchDatasets.complaints
          .filter((complaint) =>
            matches([
              complaint?.type,
              complaint?.description,
              complaint?.location,
              complaint?.status,
              complaint?.complainant_name,
            ]),
          )
          .slice(0, 6)
          .map((complaint) => ({
            id: `complaint-${complaint.id}`,
            type: "complaint",
            title: complaint?.type || "Complaint",
            subtitle: [
              complaint?.complainant_name,
              complaint?.status,
              complaint?.location,
            ]
              .filter(Boolean)
              .join(" - "),
            route: mapAdminPathToAccessiblePath("/admin/incidents"),
            state: {
              openId: String(complaint.id),
              openType: "complaint",
              defaultTab: "details",
            },
          }))
      : [];

    const documentResults = canViewDocuments()
      ? headerSearchDatasets.documents
          .filter((documentRecord) =>
            matches([
              documentRecord?.full_name,
              documentRecord?.documentType,
              documentRecord?.reference_number,
              documentRecord?.status,
            ]),
          )
          .slice(0, 6)
          .map((documentRecord) => ({
            id: `document-${documentRecord.reference_number}`,
            type: "document",
            title:
              documentRecord?.full_name || documentRecord?.reference_number,
            subtitle: [
              documentRecord?.documentType,
              documentRecord?.reference_number,
              documentRecord?.status,
            ]
              .filter(Boolean)
              .join(" - "),
            route: mapAdminPathToAccessiblePath("/admin/documents-inquiry"),
            state: {
              openReferenceNumber: String(
                documentRecord.reference_number || "",
              ),
              searchQuery:
                documentRecord?.reference_number ||
                documentRecord?.full_name ||
                "",
            },
          }))
      : [];

    const appointmentResults = canViewAppointments()
      ? headerSearchDatasets.appointments
          .filter((appointment) =>
            matches([
              appointment?.title,
              appointment?.description,
              appointment?.status,
              appointment?.complainant_name,
              appointment?.scheduled_at,
            ]),
          )
          .slice(0, 6)
          .map((appointment) => ({
            id: `appointment-${appointment.id}`,
            type: "appointment",
            title: appointment?.title || "Appointment",
            subtitle: [
              appointment?.complainant_name,
              appointment?.status,
              appointment?.scheduled_at,
            ]
              .filter(Boolean)
              .join(" - "),
            route: mapAdminPathToAccessiblePath("/admin/appointments"),
            state: {
              openAppointmentId: String(appointment.id),
              searchQuery:
                appointment?.complainant_name ||
                appointment?.title ||
                String(appointment.id),
            },
          }))
      : [];

    return [
      ...residentResults,
      ...incidentResults,
      ...complaintResults,
      ...documentResults,
      ...appointmentResults,
    ].slice(0, 12);
  }, [headerSearchDatasets, headerSearchQuery]);

  const headerSuggestionResults = useMemo(
    () => headerSearchResults.slice(0, 6),
    [headerSearchResults],
  );

  // ── Notification sound on new unread items ────────────────────────────
  const prevUnreadRef = useRef(unreadCount);

  const closeAllMenus = useCallback(() => {
    setIsNotificationOpen(false);
    setIsSettingsOpen(false);
    setIsProfileOpen(false);
  }, []);

  useEffect(() => {
    if (unreadCount > prevUnreadRef.current) {
      playNotificationSound();
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount]);

  useEffect(() => {
    if (!isBackOfficeUser) return undefined;

    const handleKeyDown = (event) => {
      const key = String(event.key || "").toLowerCase();
      if ((event.ctrlKey || event.metaKey) && key === "k") {
        event.preventDefault();
        closeAllMenus();
        setIsHeaderSearchOpen(true);
        window.requestAnimationFrame(() => {
          headerSearchInputRef.current?.focus();
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeAllMenus, isBackOfficeUser]);

  useEffect(() => {
    if (!isBackOfficeUser || !isHeaderSearchOpen || hasHeaderSearchLoaded) {
      return;
    }
    loadHeaderSearchData();
  }, [
    hasHeaderSearchLoaded,
    isBackOfficeUser,
    isHeaderSearchOpen,
    loadHeaderSearchData,
  ]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      const target = event.target;
      if (
        headerSearchRef.current?.contains(target) ||
        notificationRef.current?.contains(target) ||
        settingsRef.current?.contains(target) ||
        profileRef.current?.contains(target)
      ) {
        return;
      }
      closeAllMenus();
      setIsHeaderSearchOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [closeAllMenus]);

  useEffect(() => {
    closeAllMenus();
    setIsHeaderSearchOpen(false);
  }, [location.pathname, closeAllMenus]);

  const openHeaderSearchResult = useCallback(
    (result) => {
      setIsHeaderSearchOpen(false);
      setHeaderSearchQuery("");
      navigate(result.route, {
        state: {
          ...(result.state || {}),
          globalSearchQuery: headerSearchQuery,
        },
      });
    },
    [headerSearchQuery, navigate],
  );

  const handleHeaderSearchKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter" && headerSuggestionResults.length > 0) {
        event.preventDefault();
        openHeaderSearchResult(headerSuggestionResults[0]);
      }

      if (event.key === "Escape") {
        setIsHeaderSearchOpen(false);
      }
    },
    [headerSuggestionResults, openHeaderSearchResult],
  );

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsSettingsOpen(false);
    setIsProfileOpen(false);
    setIsHeaderSearchOpen(false);
  };

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
    setIsNotificationOpen(false);
    setIsProfileOpen(false);
    setIsHeaderSearchOpen(false);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsNotificationOpen(false);
    setIsSettingsOpen(false);
    setIsHeaderSearchOpen(false);
  };

  const openThemeModal = () => {
    setIsThemeModalOpen(true);
    setIsSettingsOpen(false);
  };

  const openLogoutModal = () => {
    setIsLogoutModalOpen(true);
    setIsProfileOpen(false);
  };

  const openProfilePage = () => {
    setIsProfileOpen(false);
    navigate(getProfilePath());
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
    } catch {
      // Even if the API call fails, still clear local auth and redirect
    } finally {
      setLogoutLoading(false);
      setIsLogoutModalOpen(false);
      replaceCurrentHistoryPath("/");
      navigate("/login", { state: { fromLogout: true } });
    }
  };

  const handleMarkAsRead = useCallback(
    (id) => {
      markAsRead(id);
    },
    [markAsRead],
  );

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  const handleClearHistory = useCallback(() => {
    clearNotifications();
    setIsNotificationOpen(false);
  }, [clearNotifications]);

  const filteredNotifications = useMemo(() => {
    const seenIds = new Set();

    return notifications.filter((notification) => {
      const notificationId = notification?.id;
      if (notificationId) {
        if (seenIds.has(notificationId)) {
          return false;
        }
        seenIds.add(notificationId);
      }

      if (notificationFilter === "unread") {
        return !notification.read;
      }

      if (notificationFilter === "critical") {
        return getNotificationSeverity(notification) === "critical";
      }

      if (notificationFilter === "warning") {
        return getNotificationSeverity(notification) === "warning";
      }

      if (notificationFilter === "info") {
        return getNotificationSeverity(notification) === "info";
      }

      return true;
    });
  }, [notificationFilter, notifications]);

  const handleViewRegistration = useCallback(
    (notification) => {
      const targetPath = mapAdminPathToAccessiblePath(
        notification?.data?.route || "/admin/user-management",
      );
      const targetTab = notification?.data?.switchToTab || "Pending";
      const isAlreadyOnPage = location.pathname === targetPath;

      if (isAlreadyOnPage) {
        window.dispatchEvent(
          new CustomEvent("refreshVerificationData", {
            detail: { switchToTab: targetTab },
          }),
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      navigate(targetPath);
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("refreshVerificationData", {
            detail: { switchToTab: targetTab },
          }),
        );
      }, 100);
    },
    [location.pathname, navigate],
  );

  const handleViewProfileUpdate = useCallback(
    (notification) => {
      if (isBackOfficeUser) {
        const data = notification?.data || {};
        navigate(mapAdminPathToAccessiblePath("/admin/residents"), {
          state: {
            openResidentId: data?.resident_id ? String(data.resident_id) : "",
            openResidentBarangayId: data?.barangay_id
              ? String(data.barangay_id)
              : "",
            openResidentMode: "view",
            openResidentTab: "history",
            searchQuery:
              data?.barangay_id || data?.resident_name || notification?.description || "",
          },
        });
        return;
      }

      setProfileUpdateDetail(notification);
    },
    [isBackOfficeUser, navigate],
  );

  const handleNotificationNavigate = useCallback(
    (notification) => {
      const source = notification?.source;
      const type = notification?.type;
      const data = notification?.data || {};
      const isIncidentType = source === "incident" || type === "incident_status_updated";
      const isComplaintType = source === "complaint" || type === "complaint_status_updated";

      if (isIncidentType || isComplaintType) {
        const openId =
          data?.id ||
          data?.incident_id ||
          data?.complaint_id ||
          data?.report_id;

        navigate(
          isBackOfficeUser
            ? mapAdminPathToAccessiblePath("/admin/incidents")
            : "/incident-complaint/case-management",
          openId
            ? {
                state: {
                  openId: String(openId),
                  openType: isComplaintType ? "complaint" : "incident",
                  defaultTab: "details",
                },
              }
            : undefined,
        );
      }
      closeAllMenus();
    },
    [navigate, isBackOfficeUser, closeAllMenus],
  );

  return (
    <>
      <header className={`${t.cardBg} border-b ${t.cardBorder} shadow-sm relative z-20`}>
        <div className="w-full px-4 sm:px-5 py-3 sm:py-4.5">
          <div className="relative flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-2.5">
              {/* Mobile sidebar burger */}
              {onMobileSidebarToggle && (
                <button
                  onClick={onMobileSidebarToggle}
                  className={`md:hidden flex-shrink-0 p-2 rounded-lg border ${t.cardBorder} ${t.cardBg} ${t.subtleText} hover:opacity-80 transition-all shadow-sm`}
                  aria-label="Toggle menu"
                >
                  {mobileSidebarOpen ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              )}
              <img
                src={logoSrc}
                alt="Barangay Gulod Logo"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-lg object-cover"
              />
              <div className="hidden sm:block text-left">
                <h1
                  className={`font-spartan text-base sm:text-lg font-bold text-left ${t.cardText}`}
                >
                  {isAdminUser
                    ? "Dashboard"
                    : isStaffUser
                    ? "Staff Dashboard"
                    : "Barangay Gulod"}
                </h1>
                <p className={`text-[11px] text-left ${t.subtleText} font-kumbh`}>
                  {isAdminUser
                    ? "Operations and analytics workspace"
                    : isStaffUser
                    ? "Operations workspace"
                    : isSubSystem2Route
                    ? "Document Services"
                    : tr.header.incidentReporting}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 sm:space-x-3 relative md:mr-4 lg:mr-5">
              {isBackOfficeUser && (
                <div ref={headerSearchRef} className="relative hidden sm:block">
                  <div
                    className={`flex w-[15.5rem] items-center gap-2.5 rounded-xl border px-3.5 py-2 transition-all ${
                      isDark
                        ? "border-slate-700 bg-slate-900 text-slate-300"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    <svg
                      className="h-3.5 w-3.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.9}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m21 21-4.35-4.35m1.6-5.15a6.75 6.75 0 1 1-13.5 0 6.75 6.75 0 0 1 13.5 0Z"
                      />
                    </svg>
                    <input
                      ref={headerSearchInputRef}
                      type="text"
                      value={headerSearchQuery}
                      onFocus={() => {
                        closeAllMenus();
                        setIsHeaderSearchOpen(true);
                      }}
                      onChange={(event) => {
                        setHeaderSearchQuery(event.target.value);
                        setIsHeaderSearchOpen(true);
                      }}
                      onKeyDown={handleHeaderSearchKeyDown}
                      placeholder="Search"
                      title="Smart Search"
                      className={`w-full bg-transparent text-left text-[13px] font-normal font-kumbh outline-none ${
                        isDark
                          ? "placeholder:text-slate-500"
                          : "placeholder:text-slate-400"
                      }`}
                    />
                    {headerSearchQuery.trim() && (
                      <button
                        type="button"
                        onClick={() => {
                          setHeaderSearchQuery("");
                          setIsHeaderSearchOpen(false);
                          headerSearchInputRef.current?.focus();
                        }}
                        className={`inline-flex h-5.5 w-5.5 items-center justify-center rounded-full transition-colors ${
                          isDark
                            ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                            : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        }`}
                        aria-label="Clear search"
                      >
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 6l12 12M6 18 18 6"
                          />
                        </svg>
                      </button>
                    )}
                  </div>

                  {isHeaderSearchOpen && headerSearchQuery.trim() && (
                    <div
                      className={`absolute right-0 top-full z-50 mt-2.5 w-[20.5rem] overflow-hidden rounded-[20px] border shadow-[0_18px_42px_rgba(15,23,42,0.14)] ${
                        isDark
                          ? "border-slate-700 bg-slate-900"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      {headerSearchLoading ? (
                        <div className="px-3.5 py-4 text-left">
                          <p className={`text-[13px] font-semibold ${t.cardText}`}>
                            Loading matches...
                          </p>
                          <p className={`mt-1 text-[11px] ${t.subtleText}`}>
                            Preparing searchable records for this workspace.
                          </p>
                        </div>
                      ) : headerSearchError ? (
                        <div className="px-3.5 py-4 text-left">
                          <p
                            className={`text-[13px] font-semibold ${
                              isDark ? "text-rose-300" : "text-rose-700"
                            }`}
                          >
                            {headerSearchError}
                          </p>
                          <button
                            type="button"
                            onClick={loadHeaderSearchData}
                            className={`mt-3 rounded-full px-3 py-1.5 text-xs font-semibold ${
                              isDark
                                ? "bg-rose-300 text-slate-950 hover:bg-rose-200"
                                : "bg-rose-600 text-white hover:bg-rose-700"
                            }`}
                          >
                            Retry
                          </button>
                        </div>
                      ) : headerSuggestionResults.length > 0 ? (
                        headerSuggestionResults.map((result) => (
                          <button
                            key={`header-search-${result.id}`}
                            type="button"
                            onClick={() => openHeaderSearchResult(result)}
                            className={`flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left transition-colors ${
                              isDark
                                ? "border-b border-slate-800 last:border-b-0 hover:bg-slate-800"
                                : "border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                            }`}
                          >
                            <div
                              className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
                                isDark
                                  ? "bg-slate-800 text-slate-300"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth="1.9"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m21 21-4.35-4.35m1.6-5.15a6.75 6.75 0 1 1-13.5 0 6.75 6.75 0 0 1 13.5 0Z"
                                />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p
                                className={`truncate text-[13px] font-semibold ${t.cardText}`}
                              >
                                {result.title}
                              </p>
                              <p
                                className={`mt-0.5 truncate text-[11px] ${t.subtleText}`}
                              >
                                {result.subtitle || "Open module"}
                              </p>
                            </div>
                            <span
                              className={`mt-0.5 shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${
                                SEARCH_RESULT_TYPE_STYLES[result.type] ||
                                "border-slate-200 bg-slate-100 text-slate-700"
                              }`}
                            >
                              {result.type}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="px-3.5 py-4 text-left">
                          <p className={`text-[13px] font-semibold ${t.cardText}`}>
                            No matching results
                          </p>
                          <p className={`mt-1 text-[11px] ${t.subtleText}`}>
                            Try a different resident name, reference number, or status.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Notification */}
              <div ref={notificationRef} className="relative">
                <button
                  onClick={toggleNotifications}
                  className={`relative flex h-10 w-10 items-center justify-center ${t.subtleText} ${isDark ? "hover:bg-slate-700" : "hover:text-slate-800 hover:bg-slate-100"} ${isBackOfficeUser ? `rounded-xl border ${t.cardBorder}` : "rounded-full"} transition-all`}
                  title="Notifications"
                >
                  <BellOutlineIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {isNotificationOpen && (
                  <div
                    className={`fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-[4.5rem] sm:top-full mt-0 sm:mt-3 w-auto sm:w-[21.75rem] rounded-[1.35rem] border z-40 overflow-hidden animate-slideDown backdrop-blur-xl ${
                      isDark
                        ? "border-slate-800 bg-slate-900/95 shadow-[0_30px_80px_rgba(2,8,23,0.5)]"
                        : "border-slate-200 bg-white/95 shadow-[0_28px_70px_rgba(15,23,42,0.14)]"
                    }`}
                  >
                    <div
                      className={`border-b border-white/15 bg-gradient-to-r px-4 py-2.5 ${t.primaryGrad}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-white/60 shadow-sm ring-[0.5px] ring-inset ring-white/60 backdrop-blur-sm ${
                            isDark ? "text-slate-700" : t.modalHeaderIcon
                          }`}>
                            <BellOutlineIcon className="h-3 w-3" strokeWidth={1.9} />
                          </div>
                          <div className="min-w-0 text-left">
                            <h3 className="text-[12px] font-semibold font-spartan text-white sm:text-[13px]">
                              Notifications
                            </h3>
                          </div>
                        </div>
                        <span className="inline-flex shrink-0 self-start whitespace-nowrap rounded-full border border-white/20 bg-white/16 px-2 py-0.5 text-[9px] font-semibold font-kumbh text-white shadow-sm backdrop-blur-sm">
                          {unreadCount} unread
                        </span>
                      </div>
                    </div>

                    <div
                      className={`flex flex-wrap items-center gap-2 border-b px-4 py-2 ${
                        isDark ? "border-slate-800 bg-slate-900" : "border-slate-100 bg-white"
                      }`}
                    >
                      {[
                        { key: "all", label: "All" },
                        { key: "unread", label: "Unread" },
                        { key: "critical", label: "Critical" },
                        { key: "warning", label: "Warning" },
                        { key: "info", label: "Info" },
                      ].map((filterOption) => {
                        const active = notificationFilter === filterOption.key;
                        return (
                          <button
                            key={filterOption.key}
                            type="button"
                            onClick={() => setNotificationFilter(filterOption.key)}
                            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold font-kumbh transition-colors ${
                              active
                                ? isDark
                                  ? "bg-slate-100 text-slate-900"
                                  : "bg-slate-900 text-white"
                                : isDark
                                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {filterOption.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className={`max-h-[60vh] sm:max-h-[22rem] overflow-y-auto px-4 py-3.5 space-y-2.5 ${
                      isDark ? "bg-slate-950/40" : "bg-slate-50/75"
                    }`}>
                      {filteredNotifications.length > 0 ? (
                        filteredNotifications.slice(0, 15).map((notification) => (
                          <ModernNotificationHistoryItem
                            key={notification.id}
                            notification={notification}
                            isDark={isDark}
                            onMarkAsRead={handleMarkAsRead}
                            onViewAppointment={setAppointmentDetail}
                            onViewRegistration={handleViewRegistration}
                            onViewProfileUpdate={handleViewProfileUpdate}
                            onCloseMenu={closeAllMenus}
                            onNavigateToAction={handleNotificationNavigate}
                          />
                        ))
                      ) : (
                        <div
                          className={`rounded-[1.15rem] border px-5 py-8 text-center ${
                            isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"
                          }`}
                        >
                          <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${
                            isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-400"
                          }`}>
                            <BellOutlineIcon className="h-4 w-4" strokeWidth={1.7} />
                          </div>
                          <p className={`text-sm font-semibold font-kumbh ${t.cardText}`}>
                            No matching notifications
                          </p>
                          <p className={`mt-1 text-xs font-kumbh ${t.subtleText}`}>
                            Try switching the filter or wait for new activity.
                          </p>
                        </div>
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <div
                        className={`flex items-center gap-2 border-t px-3.5 py-2.5 ${
                          isDark ? "border-slate-800 bg-slate-900" : "border-slate-100 bg-white"
                        }`}
                      >
                        <button
                          onClick={handleMarkAllAsRead}
                          className={`flex-1 rounded-[0.85rem] px-3 py-2 text-[10px] font-semibold transition-colors font-kumbh ${
                            isDark
                              ? "bg-slate-100 text-slate-900 hover:bg-white"
                              : "bg-slate-900 text-white hover:bg-slate-800"
                          }`}
                        >
                          Mark all as read
                        </button>
                        <button
                          onClick={handleClearHistory}
                          className={`rounded-[0.85rem] border px-3 py-2 text-[10px] font-semibold transition-colors font-kumbh ${
                            isDark
                              ? "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600 hover:text-white"
                              : "border-slate-200 bg-slate-100 text-slate-600 hover:border-slate-300 hover:text-slate-800"
                          }`}
                        >
                          Clear all
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Settings */}
              <div ref={settingsRef} className="relative">
                <button
                  onClick={toggleSettings}
                  className={`flex h-10 w-10 items-center justify-center ${t.subtleText} ${isDark ? "hover:bg-slate-700" : "hover:text-slate-800 hover:bg-slate-100"} ${isBackOfficeUser ? `rounded-xl border ${t.cardBorder}` : "rounded-full"} transition-all`}
                  title="Settings"
                >
                  <svg
                    className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>

                {isSettingsOpen && (
                  <div
                    className={`fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-[4.5rem] sm:top-full mt-0 sm:mt-2 w-auto sm:w-[15.25rem] ${t.cardBg} ${t.cardBorder} rounded-[20px] shadow-[0_14px_30px_rgba(15,23,42,0.1)] border z-40 overflow-hidden animate-slideDown`}
                  >
                    <div className="p-1.5">
                      <button
                        onClick={openThemeModal}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 ${isDark ? "hover:bg-slate-800 text-slate-200" : "hover:bg-slate-50 text-slate-700"} rounded-[16px] transition-colors group text-left`}
                      >
                        <span
                          className={`w-8 h-8 rounded-[14px] flex items-center justify-center flex-shrink-0 ${isDark ? "bg-slate-700/80" : "bg-blue-50"}`}
                        >
                          <svg
                            className="w-3.5 h-3.5 text-blue-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                            />
                          </svg>
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className={`block text-[13px] font-medium font-kumbh ${t.cardText}`}>
                            {tr.header.changeTheme}
                          </span>
                          <span className={`block text-[10px] leading-4 font-kumbh ${t.subtleText}`}>
                            Update colors and appearance
                          </span>
                        </div>
                        <svg
                          className={`w-3 h-3 ${t.subtleText} flex-shrink-0`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          setLanguage(language === "en" ? "tl" : "en");
                          setIsSettingsOpen(false);
                        }}
                        className={`mt-0.5 w-full flex items-center gap-2.5 px-2.5 py-1.5 ${isDark ? "hover:bg-slate-800 text-slate-200" : "hover:bg-slate-50 text-slate-700"} rounded-[16px] transition-colors group text-left`}
                      >
                        <span
                          className={`w-8 h-8 rounded-[14px] flex items-center justify-center flex-shrink-0 ${isDark ? "bg-slate-700/80" : "bg-amber-50"}`}
                        >
                          <svg
                            className="w-3.5 h-3.5 text-amber-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                            />
                          </svg>
                        </span>
                        <div className="flex-1 flex items-center justify-between">
                          <div className="min-w-0">
                            <span className={`block text-[13px] font-medium font-kumbh ${t.cardText}`}>
                              {tr.header.language}
                            </span>
                            <span className={`block text-[10px] leading-4 font-kumbh ${t.subtleText}`}>
                              Switch between English and Filipino
                            </span>
                          </div>
                          <span
                            className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${isDark ? "bg-slate-700 text-slate-200" : "bg-slate-100 text-slate-600"} font-kumbh`}
                          >
                            {language === "en" ? "EN" : "TL"}
                          </span>
                        </div>
                      </button>
                      <button
                        className={`mt-0.5 w-full flex items-center gap-2.5 px-2.5 py-1.5 ${isDark ? "hover:bg-slate-800 text-slate-200" : "hover:bg-slate-50 text-slate-700"} rounded-[16px] transition-colors group text-left`}
                      >
                        <span
                          className={`w-8 h-8 rounded-[14px] flex items-center justify-center flex-shrink-0 ${isDark ? "bg-slate-700/80" : "bg-emerald-50"}`}
                        >
                          <svg
                            className="w-3.5 h-3.5 text-emerald-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className={`block text-[13px] font-medium font-kumbh ${t.cardText}`}>
                            {tr.header.privacySettings}
                          </span>
                          <span className={`block text-[10px] leading-4 font-kumbh ${t.subtleText}`}>
                            Manage access, privacy, and security
                          </span>
                        </div>
                        <svg
                          className={`w-3 h-3 ${t.subtleText} flex-shrink-0`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div ref={profileRef} className="relative">
                <button
                  onClick={toggleProfile}
                  className={`flex h-10 items-center space-x-1 sm:space-x-1.5 px-1 sm:px-1.5 ${isBackOfficeUser ? "rounded-lg border border-transparent bg-transparent" : "rounded-full"} ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-100"} transition-all`}
                >
                  <div
                    className={`w-7 h-7 bg-gradient-to-br ${t.primaryGrad} rounded-full flex items-center justify-center text-white font-bold text-xs`}
                  >
                    {residentPhoto ? (
                      <img
                        src={residentPhoto}
                        alt="Resident profile"
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      userInitials
                    )}
                  </div>
                  <svg
                    className={`w-3 h-3 ${t.subtleText} hidden sm:block`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isProfileOpen && (
                  <div
                    className={`fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-[4.5rem] sm:top-full mt-0 sm:mt-2 w-auto sm:w-[14.5rem] ${t.cardBg} ${t.cardBorder} rounded-[20px] shadow-[0_14px_30px_rgba(15,23,42,0.1)] border z-40 overflow-hidden animate-slideDown`}
                  >
                    <div
                      className={`px-3 py-3 border-b ${t.cardBorder} ${isDark ? "bg-slate-900/70" : "bg-slate-50/80"}`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-9 h-9 bg-gradient-to-br ${t.primaryGrad} rounded-[14px] flex items-center justify-center text-white font-bold text-[13px] flex-shrink-0 shadow-lg`}
                        >
                          {residentPhoto ? (
                            <img
                              src={residentPhoto}
                              alt="Resident profile"
                              className="h-full w-full rounded-[14px] object-cover"
                            />
                          ) : (
                            userInitials
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p
                            className={`font-semibold text-[14px] ${t.cardText} font-spartan truncate`}
                          >
                            {userName}
                          </p>
                          <p
                            className={`text-[11px] ${t.subtleText} font-kumbh truncate`}
                          >
                            {userEmail}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-1.5">
                      <button
                        onClick={openProfilePage}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 ${isDark ? "hover:bg-slate-800 text-slate-200" : "hover:bg-slate-100 text-slate-700"} rounded-[16px] transition-colors text-left`}
                      >
                        <span
                          className={`w-8 h-8 rounded-[14px] flex items-center justify-center flex-shrink-0 ${isDark ? "bg-slate-700/80" : "bg-blue-50"}`}
                        >
                          <svg
                            className="w-3.5 h-3.5 text-blue-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className={`block text-[13px] font-medium font-kumbh ${t.cardText}`}>
                            {tr.header.viewProfile}
                          </span>
                          <span className={`block text-[10px] leading-4 font-kumbh ${t.subtleText}`}>
                            Account details and access
                          </span>
                        </div>
                      </button>
                      <button
                        onClick={openLogoutModal}
                        className={`mt-0.5 w-full flex items-center gap-2.5 px-2.5 py-1.5 ${isDark ? "hover:bg-slate-800 text-slate-200" : "hover:bg-slate-100 text-slate-700"} rounded-[16px] transition-colors text-left`}
                      >
                        <span
                          className={`w-8 h-8 rounded-[14px] flex items-center justify-center flex-shrink-0 ${isDark ? "bg-slate-700/80" : "bg-red-50"}`}
                        >
                          <svg
                            className="w-3.5 h-3.5 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className={`block text-[13px] font-medium font-kumbh ${t.cardText}`}>
                            {tr.header.logout}
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {appointmentDetail && (
        <UserAppointmentDetailsModal
          notification={appointmentDetail}
          onClose={() => setAppointmentDetail(null)}
          isDark={isDark}
          t={t}
        />
      )}

      {profileUpdateDetail && !isBackOfficeUser && (
        <ProfileUpdateDetailsModal
          notification={profileUpdateDetail}
          onClose={() => setProfileUpdateDetail(null)}
          isDark={isDark}
          t={t}
        />
      )}

      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={currentTheme}
        onThemeChange={onThemeChange}
      />

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        loading={logoutLoading}
        currentTheme={currentTheme}
      />

      <style >{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default Header;
