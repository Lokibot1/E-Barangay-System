import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useRealTime } from "../../context/RealTimeContext";
import themeTokens from "../../Themetokens";

const TOAST_DURATION = 5000;

// ── Single toast item (memoized) ────────────────────────────────────────
const SingleToast = memo(({ event, onDismiss, currentTheme }) => {
  const [exiting, setExiting] = useState(false);
  const navigate = useNavigate();
  const t = themeTokens[currentTheme] || themeTokens.blue;
  const isDark = currentTheme === "dark";

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
    navigate("/admin/incidents");
    onDismiss(event.id);
  }, [navigate, event.id, onDismiss]);

  const isIncident = event.source === "incident";
  const borderColor = isIncident ? "border-l-red-500" : "border-l-amber-500";
  const iconBg = isIncident
    ? isDark
      ? "bg-red-900/60"
      : "bg-red-100"
    : isDark
      ? "bg-amber-900/60"
      : "bg-amber-100";
  const iconColor = isIncident
    ? isDark
      ? "text-red-400"
      : "text-red-600"
    : isDark
      ? "text-amber-400"
      : "text-amber-600";

  return (
    <div
      onClick={handleClick}
      className={`relative overflow-hidden flex items-start gap-3 p-4 rounded-xl border-l-4 ${borderColor} shadow-lg cursor-pointer transition-all duration-300 ${
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
        className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}
      >
        <svg
          className={`w-5 h-5 ${iconColor}`}
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

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`font-semibold text-sm ${isDark ? "text-slate-100" : "text-slate-900"} font-kumbh`}
        >
          New {isIncident ? "Incident" : "Complaint"} Reported
        </p>
        <p
          className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-600"} font-kumbh line-clamp-1`}
        >
          {event.type}
          {event.data?.description
            ? ` — ${event.data.description.substring(0, 80)}`
            : ""}
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
const AdminNotificationToast = ({ currentTheme }) => {
  const { latestBatch, eventVersion } = useRealTime();
  const [visibleToasts, setVisibleToasts] = useState([]);
  const prevEventVersionRef = useRef(0);

  // Show toasts ONLY when a new batch arrives (eventVersion increments)
  useEffect(() => {
    if (eventVersion === 0 || eventVersion === prevEventVersionRef.current)
      return;
    prevEventVersionRef.current = eventVersion;

    if (!latestBatch || latestBatch.length === 0) return;

    // Cap at 3 new toasts per batch, 5 visible total
    const toastEvents = latestBatch.slice(0, 3).map((n) => ({
      id: n.id,
      source: n.source,
      type: n.type,
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

export default AdminNotificationToast;
