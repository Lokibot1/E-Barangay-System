import React from "react";
import themeTokens from "../../Themetokens";

const LogoutModal = ({ isOpen, onClose, onConfirm, loading, currentTheme }) => {
  if (!isOpen) return null;

  const t = themeTokens[currentTheme] || themeTokens.modern;
  const isDark = currentTheme === "dark";

  return (
    <div className="fixed inset-0 z-[11000] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-[24rem] ${t.cardBg} rounded-[24px] shadow-[0_24px_60px_rgba(15,23,42,0.22)] border ${t.cardBorder} overflow-hidden animate-scaleIn`}
      >
        {/* Header */}
        <div className="flex flex-col items-center px-6 pt-8 pb-4 text-center sm:px-7">
          <div
            className={`mb-5 flex h-[60px] w-[60px] items-center justify-center rounded-full ${
              isDark ? "bg-red-950/40 ring-1 ring-red-900/40" : "bg-red-100 ring-1 ring-red-200/80"
            }`}
          >
            <svg
              className={`h-7 w-7 ${isDark ? "text-red-400" : "text-red-500"}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
          </div>
          <h3
            className={`font-spartan text-[1.2rem] font-bold leading-none ${t.cardText}`}
          >
            Confirm Logout
          </h3>
          <p
            className={`mt-4 max-w-[18rem] text-[14px] leading-6 ${t.subtleText} font-kumbh`}
          >
            Are you sure you want to log out?
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6 pt-1 sm:px-7">
          <button
            onClick={onClose}
            disabled={loading}
            className={`flex-1 rounded-[10px] border py-2.5 text-[14px] font-semibold font-kumbh transition-all duration-200 ${
              isDark
                ? "border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-700"
                : "border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-100"
            } disabled:opacity-50`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-[10px] bg-red-600 py-2.5 text-[14px] font-semibold font-kumbh text-white shadow-[0_10px_20px_rgba(220,38,38,0.2)] transition-all duration-200 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
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
                Logging out...
              </span>
            ) : (
              "Logout"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;

