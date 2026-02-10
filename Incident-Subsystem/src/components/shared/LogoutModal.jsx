import React from "react";
import themeTokens from "../../Themetokens";

const LogoutModal = ({ isOpen, onClose, onConfirm, loading, currentTheme }) => {
  if (!isOpen) return null;

  const t = themeTokens[currentTheme] || themeTokens.blue;
  const isDark = currentTheme === "dark";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-sm ${t.cardBg} rounded-2xl shadow-2xl border ${t.cardBorder} overflow-hidden animate-scaleIn`}
      >
        {/* Header */}
        <div className="flex flex-col items-center pt-8 pb-4 px-6">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
              isDark ? "bg-red-900/40" : "bg-red-100"
            }`}
          >
            <svg
              className={`w-7 h-7 ${isDark ? "text-red-400" : "text-red-600"}`}
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
            className={`text-lg font-bold ${t.cardText} font-spartan`}
          >
            Confirm Logout
          </h3>
          <p
            className={`text-sm ${t.subtleText} font-kumbh mt-2 text-center`}
          >
            Are you sure you want to sign out? You will need to log in again to
            access the system.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold font-kumbh border transition-all duration-200 ${
              isDark
                ? "border-slate-600 text-slate-300 hover:bg-slate-700"
                : "border-slate-300 text-slate-700 hover:bg-slate-100"
            } disabled:opacity-50`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold font-kumbh text-white bg-red-600 hover:bg-red-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-4 h-4 animate-spin"
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
              "Yes, Logout"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
