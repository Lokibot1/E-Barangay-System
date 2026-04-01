import React, { useEffect, useState } from "react";

export default function NetworkStatusBanner({ currentTheme, subtleTextClass }) {
  const isDark = currentTheme === "dark";
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const [showRecovered, setShowRecovered] = useState(false);

  useEffect(() => {
    let recoveredTimerId;

    const handleOnline = () => {
      setIsOnline(true);
      setShowRecovered(true);

      window.clearTimeout(recoveredTimerId);
      recoveredTimerId = window.setTimeout(() => {
        setShowRecovered(false);
      }, 2600);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRecovered(false);
      window.clearTimeout(recoveredTimerId);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.clearTimeout(recoveredTimerId);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showRecovered) {
    return null;
  }

  const isRecovered = isOnline && showRecovered;

  return (
    <div
      className={`border-b px-4 py-2.5 ${
        isRecovered
          ? isDark
            ? "border-emerald-900/60 bg-emerald-950/40"
            : "border-emerald-200 bg-emerald-50"
          : isDark
            ? "border-amber-900/60 bg-amber-950/40"
            : "border-amber-200 bg-amber-50"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="min-w-0">
          <p
            className={`text-xs font-bold uppercase tracking-[0.2em] ${
              isRecovered
                ? isDark
                  ? "text-emerald-300"
                  : "text-emerald-700"
                : isDark
                  ? "text-amber-300"
                  : "text-amber-700"
            }`}
          >
            {isRecovered ? "Back Online" : "Offline Mode"}
          </p>
          <p className={`mt-0.5 text-xs sm:text-sm ${subtleTextClass}`}>
            {isRecovered
              ? "Connection restored. You can continue working."
              : "Connection lost. Some requests may fail until the network comes back."}
          </p>
        </div>

        {!isRecovered && (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
              isDark
                ? "bg-amber-300 text-slate-950 hover:bg-amber-200"
                : "bg-amber-600 text-white hover:bg-amber-700"
            }`}
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
