import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ThemeModal from "../../components/sub-system-3/ThemeModal";
import LogoutModal from "./LogoutModal";
import { logout, getUser, isAdmin } from "../../homepage/services/loginService";
import { useLanguage } from "../../context/LanguageContext";
import { useRealTime } from "../../context/RealTimeContext";
import { useUserRealTime } from "../../context/UserRealTimeContext";
import { useBranding } from "../../context/BrandingContext";
import themeTokens from "../../Themetokens";
import logo from "../../assets/images/logo.jpg";
import { getResidentProfilePhoto, syncResidentProfilePhoto } from "../../utils/profilePhoto";

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
        <div className={`px-6 py-4 border-b ${isDark ? "border-slate-700 bg-slate-900" : "border-gray-200 bg-gray-50"} flex items-center gap-3`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? "bg-slate-700" : "bg-blue-100"}`}>
            <svg className={`w-5 h-5 ${isDark ? "text-slate-300" : "text-blue-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
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

// ── Relative time utility ───────────────────────────────────────────────
// Laravel may return timestamps as "YYYY-MM-DD HH:MM:SS" or
// "YYYY-MM-DDTHH:MM:SS.ffffff" without a timezone indicator — these are UTC.
// Appending "Z" forces correct UTC interpretation in all browsers.
const normalizeTimestamp = (date) => {
  if (typeof date === "string" &&
    /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(date)) {
    return date.replace(" ", "T") + "Z";
  }
  return date;
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
const NotificationItem = memo(({ notification, isDark, onMarkAsRead, onViewAppointment, onViewRegistration, onCloseMenu }) => {
  const statusColor = notification.read ? "bg-gray-400" : "bg-amber-500";
  const statusLabel = notification.read ? "Read" : "New";
  const timeAgo = getRelativeTime(notification.timestamp);
  const isIncident = notification.source === "incident";
  const isAppointment = notification.source === "appointment";
  const isRegistration = notification.source === "registration";
  const isStatusChange = !!notification.oldStatus;

  const sourceLabel = isRegistration
    ? "Registration"
    : isAppointment
      ? "Appointment"
      : isIncident
        ? "Incident"
        : "Complaint";
  const displayType = notification.type === "appointment_scheduled"
    ? "Appointment Scheduled"
    : notification.type === "registration_pending"
      ? "New Resident Registration"
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
    onCloseMenu?.();
  };

  return (
    <div
      onClick={handleClick}
      className={`p-3 sm:p-4 border-b ${isDark ? "border-slate-700 hover:bg-slate-700" : "border-slate-100 hover:bg-slate-50"} transition-colors cursor-pointer group ${
        !notification.read
          ? isDark
            ? "bg-slate-700/50"
            : "bg-blue-50/50"
          : ""
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1 flex-wrap">
            <span
              className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-600"} font-kumbh uppercase`}
            >
              {sourceLabel}
            </span>
            <span
              className={`${statusColor} text-white text-xs font-semibold px-2 py-0.5 rounded-full font-kumbh`}
            >
              {statusLabel}
            </span>
            {isStatusChange && (
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full font-kumbh ${isDark ? "bg-slate-600 text-slate-300" : "bg-slate-200 text-slate-600"}`}
              >
                {capitalize(notification.oldStatus)} → {capitalize(notification.newStatus)}
              </span>
            )}
          </div>
          <p
            className={`font-semibold text-sm ${isDark ? "text-slate-100" : "text-slate-900"} font-kumbh mb-1`}
          >
            {displayType}
          </p>
          <p
            className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"} font-kumbh line-clamp-2`}
          >
            {notification.description || "No description provided"}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"} font-kumbh`}>
          {timeAgo}{notification.reportedBy ? ` · Reported by ${notification.reportedBy}` : ""}
        </p>
        {(isAppointment || isRegistration) && (
          <span className={`text-[10px] font-semibold font-kumbh ${isDark ? "text-blue-400" : "text-blue-500"}`}>
            {isRegistration ? "View pending list →" : "View details →"}
          </span>
        )}
      </div>
    </div>
  );
});

// ── Header ──────────────────────────────────────────────────────────────
const NotificationHistoryItem = memo(({ notification, isDark, onMarkAsRead, onViewAppointment, onViewRegistration, onCloseMenu }) => {
  const unread = !notification.read;
  const timeAgo = getRelativeTime(notification.timestamp);
  const isIncident = notification.source === "incident";
  const isAppointment = notification.source === "appointment";
  const isRegistration = notification.source === "registration";
  const isStatusChange = !!notification.oldStatus;

  const sourceLabel = isRegistration
    ? "Registration"
    : isAppointment
      ? "Appointment"
      : isIncident
        ? "Incident"
        : "Complaint";

  const displayType = notification.type === "appointment_scheduled"
    ? "Appointment Scheduled"
    : notification.type === "registration_pending"
      ? "New Resident Registration"
      : notification.type === "incident_status_updated"
        ? "Incident Status Updated"
        : notification.type === "complaint_status_updated"
          ? "Complaint Status Updated"
          : notification.type;

  const actionLabel = isRegistration
    ? "View"
    : isAppointment
      ? "Open details"
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
    onCloseMenu?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
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
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {isStatusChange && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`rounded-full px-2 py-1 text-[10px] font-medium font-kumbh ${
                isDark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"
              }`}>
                {capitalize(notification.oldStatus)} {"->"} {capitalize(notification.newStatus)}
              </span>
            </div>
          )}

          <p className={`${isStatusChange ? "mt-2.5" : ""} text-[13px] font-semibold leading-4.5 font-kumbh ${
            isDark ? "text-slate-100" : "text-slate-900"
          }`}>
            {displayType}
          </p>

          <p className={`mt-1 text-[11px] leading-4.5 font-kumbh ${
            isDark ? "text-slate-400" : "text-slate-600"
          }`}>
            {notification.description || "No description provided"}
          </p>

          <div className="mt-2.5 flex items-center justify-between gap-3">
            <p className={`text-[10px] font-kumbh ${
              isDark ? "text-slate-500" : "text-slate-500"
            }`}>
              {timeAgo}{notification.reportedBy ? ` · Reported by ${notification.reportedBy}` : ""}
            </p>

            {actionLabel && (
              <span className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-[9px] font-semibold font-kumbh shadow-sm transition-colors ${
                isDark
                  ? "border-violet-400/30 bg-violet-500/20 text-violet-200"
                  : "border-violet-200 bg-violet-100 text-violet-700"
              }`}>
                {actionLabel}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
});

const Header = ({ currentTheme, onThemeChange }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [appointmentDetail, setAppointmentDetail] = useState(null);
  const notificationRef = useRef(null);
  const settingsRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, tr } = useLanguage();
  const isSubSystem2Route = location.pathname.startsWith("/sub-system-2") || location.pathname.startsWith("/incident-complaint");
  const { logoDataUrl } = useBranding();
  const logoSrc = logoDataUrl || logo;

  // Real-time notifications — merge admin and user contexts
  const adminRT = useRealTime();
  const userRT = useUserRealTime();
  const isAdminUser = isAdmin();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } =
    isAdminUser ? adminRT : userRT;

  const user = getUser();
  const userName = user?.name || "User";
  const userEmail = user?.email || "";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const [residentPhoto, setResidentPhoto] = useState(() =>
    isAdminUser ? "" : getResidentProfilePhoto(user),
  );

  useEffect(() => {
    if (isAdminUser) return;
    setResidentPhoto(getResidentProfilePhoto(user));
    syncResidentProfilePhoto(user)
      .then((remote) => {
        if (remote) setResidentPhoto(remote);
      })
      .catch(() => {});
  }, [isAdminUser, user]);

  useEffect(() => {
    const handler = () => {
      if (!isAdminUser) {
        setResidentPhoto(getResidentProfilePhoto(user));
      }
    };
    window.addEventListener("residentPhotoUpdated", handler);
    return () => window.removeEventListener("residentPhotoUpdated", handler);
  }, [isAdminUser, user]);

  const t = themeTokens[currentTheme];
  const isDark = currentTheme === "dark";

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
    const handlePointerDown = (event) => {
      const target = event.target;
      if (
        notificationRef.current?.contains(target) ||
        settingsRef.current?.contains(target) ||
        profileRef.current?.contains(target)
      ) {
        return;
      }
      closeAllMenus();
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
  }, [location.pathname, closeAllMenus]);

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsSettingsOpen(false);
    setIsProfileOpen(false);
  };

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
    setIsNotificationOpen(false);
    setIsProfileOpen(false);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsNotificationOpen(false);
    setIsSettingsOpen(false);
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
    navigate(isAdminUser ? "/admin/profile" : "/profile");
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
      navigate("/login", { replace: true });
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

  const handleViewRegistration = useCallback(
    (notification) => {
      const targetPath = notification?.data?.route || "/admin/user-management";
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

  return (
    <>
      <header className={`${t.cardBg} border-b ${t.cardBorder} shadow-sm relative z-20`}>
        <div className="w-full px-4 sm:px-5 py-2 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img
                src={logoSrc}
                alt="Barangay Gulod Logo"
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-full shadow-lg object-cover"
              />
              <div className="hidden sm:block text-left">
                <h1
                  className={`font-spartan text-lg sm:text-xl font-bold text-left ${t.cardText}`}
                >
                  {isAdminUser ? "Dashboard" : "Barangay Gulod"}
                </h1>
                <p className={`text-xs text-left ${t.subtleText} font-kumbh`}>
                  {isAdminUser
                    ? "Operations and analytics workspace"
                    : isSubSystem2Route
                    ? "Document Services"
                    : tr.header.incidentReporting}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 sm:space-x-3 relative md:mr-4 lg:mr-5">
              {/* Notification */}
              <div ref={notificationRef} className="relative">
                <button
                  onClick={toggleNotifications}
                  className={`p-2 sm:p-2.5 ${t.subtleText} ${isDark ? "hover:bg-slate-700" : "hover:text-slate-800 hover:bg-slate-100"} ${isAdminUser ? `rounded-xl border ${t.cardBorder}` : "rounded-full"} transition-all relative`}
                  title="Notifications"
                >
                  <BellOutlineIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {isNotificationOpen && (
                  <div
                    className={`fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-[4.5rem] sm:top-full mt-0 sm:mt-2 w-auto sm:w-[22rem] ${t.cardBg} ${t.cardBorder} rounded-xl shadow-2xl border z-40 overflow-hidden animate-slideDown max-h-[80vh] sm:max-h-[540px]`}
                  >
                    <div
                      className={`bg-gradient-to-r ${t.primaryGrad} px-4 py-3.5`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-left">
                          <h3 className="text-white font-bold text-[15px] sm:text-base font-spartan">
                            Notifications
                          </h3>
                        </div>
                        <span className="bg-white/20 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full font-kumbh whitespace-nowrap">
                          {unreadCount} unread
                        </span>
                      </div>
                    </div>

                    <div className={`max-h-[60vh] sm:max-h-[20rem] overflow-y-auto p-3 space-y-2.5 ${isDark ? "bg-slate-900/40" : "bg-slate-50/70"}`}>
                      {notifications.length > 0 ? (
                        notifications.slice(0, 15).map((notification) => (
                          <NotificationHistoryItem
                            key={notification.id}
                            notification={notification}
                            isDark={isDark}
                            onMarkAsRead={handleMarkAsRead}
                            onViewAppointment={setAppointmentDetail}
                            onViewRegistration={handleViewRegistration}
                            onCloseMenu={closeAllMenus}
                          />
                        ))
                      ) : (
                        <div
                          className={`rounded-2xl border p-8 text-center ${t.subtleText} ${isDark ? "border-slate-700 bg-slate-800/60" : "border-slate-200 bg-white"}`}
                        >
                          <BellOutlineIcon className="w-12 h-12 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
                          <p className="text-sm font-kumbh font-semibold">
                            No history yet
                          </p>
                          <p className="text-xs mt-1 font-kumbh opacity-60">
                            New updates will be saved here automatically.
                          </p>
                        </div>
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <div
                        className={`p-3 border-t ${isDark ? "border-slate-700 bg-slate-900/70" : "border-slate-200 bg-white"} flex items-center gap-2`}
                      >
                        <button
                          onClick={handleMarkAllAsRead}
                          className={`flex-1 rounded-xl px-3 py-2 text-[12px] font-semibold transition-colors font-kumbh ${
                            isDark
                              ? "bg-violet-500/15 text-violet-200 hover:bg-violet-500/25"
                              : "bg-violet-50 text-violet-700 hover:bg-violet-100"
                          }`}
                        >
                          Mark all as read
                        </button>
                        <button
                          onClick={handleClearHistory}
                          className={`rounded-xl px-3 py-2 text-[12px] font-semibold transition-colors font-kumbh ${
                            isDark
                              ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
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
                  className={`p-2 sm:p-2.5 ${t.subtleText} ${isDark ? "hover:bg-slate-700" : "hover:text-slate-800 hover:bg-slate-100"} ${isAdminUser ? `rounded-xl border ${t.cardBorder}` : "rounded-full"} transition-all`}
                  title="Settings"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
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
                    className={`fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-[4.5rem] sm:top-full mt-0 sm:mt-2 w-auto sm:w-[17.5rem] ${t.cardBg} ${t.cardBorder} rounded-[22px] shadow-[0_18px_36px_rgba(15,23,42,0.12)] border z-40 overflow-hidden animate-slideDown`}
                  >
                    <div className="p-2">
                      <button
                        onClick={openThemeModal}
                        className={`w-full flex items-center gap-3 px-3 py-2 ${isDark ? "hover:bg-slate-800 text-slate-200" : "hover:bg-slate-50 text-slate-700"} rounded-[18px] transition-colors group text-left`}
                      >
                        <span
                          className={`w-9 h-9 rounded-[16px] flex items-center justify-center flex-shrink-0 ${isDark ? "bg-slate-700/80" : "bg-blue-50"}`}
                        >
                          <svg
                            className="w-4 h-4 text-blue-500"
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
                          <span className={`block text-sm font-medium font-kumbh ${t.cardText}`}>
                            {tr.header.changeTheme}
                          </span>
                          <span className={`block text-[11px] leading-4.5 font-kumbh ${t.subtleText}`}>
                            Update colors and appearance
                          </span>
                        </div>
                        <svg
                          className={`w-3.5 h-3.5 ${t.subtleText} flex-shrink-0`}
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
                        className={`mt-1 w-full flex items-center gap-3 px-3 py-2 ${isDark ? "hover:bg-slate-800 text-slate-200" : "hover:bg-slate-50 text-slate-700"} rounded-[18px] transition-colors group text-left`}
                      >
                        <span
                          className={`w-9 h-9 rounded-[16px] flex items-center justify-center flex-shrink-0 ${isDark ? "bg-slate-700/80" : "bg-amber-50"}`}
                        >
                          <svg
                            className="w-4 h-4 text-amber-500"
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
                            <span className={`block text-sm font-medium font-kumbh ${t.cardText}`}>
                              {tr.header.language}
                            </span>
                            <span className={`block text-[11px] leading-4.5 font-kumbh ${t.subtleText}`}>
                              Switch between English and Filipino
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${isDark ? "bg-slate-700 text-slate-200" : "bg-slate-100 text-slate-600"} font-kumbh`}
                          >
                            {language === "en" ? "EN" : "TL"}
                          </span>
                        </div>
                      </button>
                      <button
                        className={`mt-1 w-full flex items-center gap-3 px-3 py-2 ${isDark ? "hover:bg-slate-800 text-slate-200" : "hover:bg-slate-50 text-slate-700"} rounded-[18px] transition-colors group text-left`}
                      >
                        <span
                          className={`w-9 h-9 rounded-[16px] flex items-center justify-center flex-shrink-0 ${isDark ? "bg-slate-700/80" : "bg-emerald-50"}`}
                        >
                          <svg
                            className="w-4 h-4 text-emerald-500"
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
                          <span className={`block text-sm font-medium font-kumbh ${t.cardText}`}>
                            {tr.header.privacySettings}
                          </span>
                          <span className={`block text-[11px] leading-4.5 font-kumbh ${t.subtleText}`}>
                            Manage access, privacy, and security
                          </span>
                        </div>
                        <svg
                          className={`w-3.5 h-3.5 ${t.subtleText} flex-shrink-0`}
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
                  className={`flex items-center space-x-1 sm:space-x-2 px-1 sm:px-1.5 py-1 ${isAdminUser ? "rounded-lg border border-transparent bg-transparent" : "rounded-full"} ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-100"} transition-all`}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br ${t.primaryGrad} rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm`}
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
                    className={`w-3 h-3 sm:w-4 sm:h-4 ${t.subtleText} hidden sm:block`}
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
                    className={`fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-[4.5rem] sm:top-full mt-0 sm:mt-2 w-auto sm:w-60 ${t.cardBg} ${t.cardBorder} rounded-[22px] shadow-[0_18px_36px_rgba(15,23,42,0.12)] border z-40 overflow-hidden animate-slideDown`}
                  >
                    <div
                      className={`px-3.5 py-3.5 border-b ${t.cardBorder} ${isDark ? "bg-slate-900/70" : "bg-slate-50/80"}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-10 h-10 bg-gradient-to-br ${t.primaryGrad} rounded-[16px] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg`}
                        >
                          {residentPhoto ? (
                            <img
                              src={residentPhoto}
                              alt="Resident profile"
                              className="h-full w-full rounded-[16px] object-cover"
                            />
                          ) : (
                            userInitials
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p
                            className={`font-semibold text-[15px] ${t.cardText} font-spartan truncate`}
                          >
                            {userName}
                          </p>
                          <p
                            className={`text-xs ${t.subtleText} font-kumbh truncate`}
                          >
                            {userEmail}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-1.5">
                      <button
                        onClick={openProfilePage}
                        className={`w-full flex items-center gap-3 px-3 py-2 ${isDark ? "hover:bg-slate-800 text-slate-200" : "hover:bg-slate-100 text-slate-700"} rounded-[18px] transition-colors text-left`}
                      >
                        <span
                          className={`w-9 h-9 rounded-[16px] flex items-center justify-center flex-shrink-0 ${isDark ? "bg-slate-700/80" : "bg-blue-50"}`}
                        >
                          <svg
                            className="w-4 h-4 text-blue-500"
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
                          <span className={`block text-sm font-medium font-kumbh ${t.cardText}`}>
                            {tr.header.viewProfile}
                          </span>
                          <span className={`block text-[11px] font-kumbh ${t.subtleText}`}>
                            Account details and access
                          </span>
                        </div>
                      </button>
                      <button
                        onClick={openLogoutModal}
                        className={`mt-1 w-full flex items-center gap-3 px-3 py-2 ${isDark ? "hover:bg-slate-800 text-slate-200" : "hover:bg-slate-100 text-slate-700"} rounded-[18px] transition-colors text-left`}
                      >
                        <span
                          className={`w-9 h-9 rounded-[16px] flex items-center justify-center flex-shrink-0 ${isDark ? "bg-slate-700/80" : "bg-red-50"}`}
                        >
                          <svg
                            className="w-4 h-4 text-red-500"
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
                          <span className={`block text-sm font-medium font-kumbh ${t.cardText}`}>
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
