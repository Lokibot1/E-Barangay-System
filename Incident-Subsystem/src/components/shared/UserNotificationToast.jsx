import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRealTime } from "../../context/UserRealTimeContext";
import themeTokens from "../../Themetokens";

const TOAST_DURATION = 5000;

const capitalize = (str) =>
  str ? str.replace(/\b\w/g, (c) => c.toUpperCase()) : str;

// ── Status-based styling ─────────────────────────────────────────────────
const getStatusStyle = (newStatus) => {
  const s = (newStatus || "").toLowerCase();
  if (s === "resolved" || s === "completed" || s === "closed") {
    return { border: "border-l-green-500", bg: "bg-green-100", bgDark: "bg-green-900/60", text: "text-green-600", textDark: "text-green-400" };
  }
  if (s === "in_progress" || s === "in progress" || s === "ongoing") {
    return { border: "border-l-blue-500", bg: "bg-blue-100", bgDark: "bg-blue-900/60", text: "text-blue-600", textDark: "text-blue-400" };
  }
  if (s === "rejected" || s === "dismissed" || s === "denied") {
    return { border: "border-l-red-500", bg: "bg-red-100", bgDark: "bg-red-900/60", text: "text-red-600", textDark: "text-red-400" };
  }
  return { border: "border-l-gray-500", bg: "bg-gray-100", bgDark: "bg-gray-900/60", text: "text-gray-600", textDark: "text-gray-400" };
};

// ── Status icon SVG path ─────────────────────────────────────────────────
const StatusIcon = ({ newStatus, className }) => {
  const s = (newStatus || "").toLowerCase();
  if (s === "resolved" || s === "completed" || s === "closed") {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (s === "rejected" || s === "dismissed" || s === "denied") {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
};

// ── Single toast item (memoized) ────────────────────────────────────────
const SingleToast = memo(({ event, onDismiss, currentTheme }) => {
  const [exiting, setExiting] = useState(false);
  const navigate = useNavigate();
  const isDark = currentTheme === "dark";
  const style = getStatusStyle(event.newStatus);

  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), TOAST_DURATION);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!exiting) return;
    const timer = setTimeout(() => onDismiss(event.id), 300);
    return () => clearTimeout(timer);
  }, [exiting, event.id, onDismiss]);

  const handleClick = useCallback(() => {
    navigate("/incident-complaint/case-management");
    onDismiss(event.id);
  }, [navigate, event.id, onDismiss]);

  const isIncident = event.source === "incident";

  return (
    <div
      onClick={handleClick}
      className={`relative overflow-hidden flex items-start gap-3 p-4 rounded-xl border-l-4 ${style.border} shadow-lg cursor-pointer transition-all duration-300 ${
        isDark
          ? "bg-slate-800 border border-slate-700"
          : "bg-white border border-slate-200"
      } ${exiting ? "opacity-0 translate-x-full" : "opacity-100 translate-x-0"}`}
      style={{
        animation: exiting ? undefined : "slideInRight 0.3s ease-out",
      }}
    >
      {/* Icon */}
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${isDark ? style.bgDark : style.bg}`}
      >
        <StatusIcon
          newStatus={event.newStatus}
          className={`w-5 h-5 ${isDark ? style.textDark : style.text}`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`font-semibold text-sm ${isDark ? "text-slate-100" : "text-slate-900"} font-kumbh`}
        >
          {isIncident ? "Incident" : "Complaint"} Status Updated
        </p>
        <p
          className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-600"} font-kumbh line-clamp-1`}
        >
          {capitalize(event.oldStatus)} → {capitalize(event.newStatus)}
        </p>
        <p
          className={`text-xs mt-1 ${isDark ? "text-slate-500" : "text-slate-400"} font-kumbh`}
        >
          Click to view details
        </p>
      </div>

      {/* Close */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setExiting(true);
        }}
        className={`flex-shrink-0 p-1 rounded ${isDark ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"} transition-colors`}
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
  );
});

// ── Toast container ─────────────────────────────────────────────────────
const UserNotificationToast = ({ currentTheme }) => {
  const { latestBatch, eventVersion } = useUserRealTime();
  const [visibleToasts, setVisibleToasts] = useState([]);
  const prevEventVersionRef = useRef(0);

  useEffect(() => {
    if (eventVersion === 0 || eventVersion === prevEventVersionRef.current)
      return;
    prevEventVersionRef.current = eventVersion;

    if (!latestBatch || latestBatch.length === 0) return;

    const toastEvents = latestBatch.slice(0, 3).map((n) => ({
      id: n.id,
      source: n.source,
      type: n.type,
      oldStatus: n.oldStatus,
      newStatus: n.newStatus,
      data: n.data,
    }));
    setVisibleToasts((prev) => [...toastEvents, ...prev].slice(0, 5));
  }, [eventVersion, latestBatch]);

  const handleDismiss = useCallback((id) => {
    setVisibleToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (visibleToasts.length === 0) return null;

  return (
    <>
      <div className="fixed top-20 right-6 z-[110] flex flex-col gap-3 w-full max-w-sm pointer-events-auto">
        {visibleToasts.map((event) => (
          <SingleToast
            key={event.id}
            event={event}
            onDismiss={handleDismiss}
            currentTheme={currentTheme}
          />
        ))}
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default UserNotificationToast;
