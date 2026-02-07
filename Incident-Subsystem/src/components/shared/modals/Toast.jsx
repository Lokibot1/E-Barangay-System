import React, { useState, useEffect } from "react";
import themeTokens from "../../../Themetokens";

const Toast = ({ toasts, onRemove, currentTheme }) => {
  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 w-full max-w-sm">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
          currentTheme={currentTheme}
        />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onRemove, currentTheme }) => {
  const [exiting, setExiting] = useState(false);
  const t = themeTokens[currentTheme] || themeTokens.blue;
  const isDark = currentTheme === "dark";

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast.duration]);

  useEffect(() => {
    if (!exiting) return;
    const timer = setTimeout(() => onRemove(toast.id), 300);
    return () => clearTimeout(timer);
  }, [exiting, toast.id, onRemove]);

  const config = {
    success: {
      bg: isDark ? "bg-slate-800" : "bg-green-50",
      border: isDark ? "border-green-800" : "border-green-200",
      iconBg: isDark ? "bg-green-900" : "bg-green-100",
      iconColor: isDark ? "text-green-400" : "text-green-600",
      titleColor: isDark ? "text-green-300" : "text-green-800",
      textColor: isDark ? "text-slate-300" : "text-green-700",
      progressBg: isDark ? "bg-green-500" : "bg-green-500",
      icon: (
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
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
    },
    error: {
      bg: isDark ? "bg-slate-800" : "bg-red-50",
      border: isDark ? "border-red-800" : "border-red-200",
      iconBg: isDark ? "bg-red-900" : "bg-red-100",
      iconColor: isDark ? "text-red-400" : "text-red-600",
      titleColor: isDark ? "text-red-300" : "text-red-800",
      textColor: isDark ? "text-slate-300" : "text-red-700",
      progressBg: isDark ? "bg-red-500" : "bg-red-500",
      icon: (
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
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
  };

  const c = config[toast.type] || config.error;

  return (
    <div
      className={`relative overflow-hidden flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 ${c.bg} ${c.border} ${
        exiting ? "opacity-0 translate-x-full" : "opacity-100 translate-x-0"
      }`}
    >
      {/* Icon */}
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${c.iconBg} ${c.iconColor}`}
      >
        {c.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${c.titleColor}`}>{toast.title}</p>
        {toast.message && (
          <p className={`text-sm mt-0.5 ${c.textColor}`}>{toast.message}</p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => setExiting(true)}
        className={`flex-shrink-0 ${t.toastCloseBtn} ${t.toastCloseBtnHover} transition-colors`}
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

      {/* Auto-dismiss progress bar */}
      <div className="absolute bottom-0 left-0 h-1 w-full bg-black/5">
        <div
          className={`h-full ${c.progressBg} transition-all ease-linear`}
          style={{
            width: exiting ? "0%" : "100%",
            transitionDuration: exiting
              ? "300ms"
              : `${toast.duration || 4000}ms`,
          }}
        />
      </div>
    </div>
  );
};

export default Toast;
