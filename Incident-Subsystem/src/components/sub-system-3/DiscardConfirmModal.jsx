import React from "react";
import themeTokens from "../../Themetokens";

/**
 * Reusable discard confirmation dialog.
 *
 * Props:
 *   isOpen      {boolean}  – whether the dialog is visible
 *   onConfirm   {fn}       – called when the user chooses to discard / exit
 *   onCancel    {fn}       – called when the user chooses to stay
 *   currentTheme {string}  – theme key from themeTokens
 *   type        {string}   – "complaint" | "incident" (used for the label copy)
 */
const DiscardConfirmModal = ({ isOpen, onConfirm, onCancel, currentTheme, type = "incident" }) => {
  const t = themeTokens[currentTheme] || themeTokens.blue;
  const isDark = currentTheme === "dark";

  if (!isOpen) return null;

  const label = type === "complaint" ? "complaint" : "incident report";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className={`${t.cardBg} rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scaleIn`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon + title */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              isDark ? "bg-red-500/20" : "bg-red-100"
            }`}
          >
            <svg
              className={`w-5 h-5 ${isDark ? "text-red-400" : "text-red-600"}`}
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
          <h3
            className={`text-[17px] font-bold font-spartan ${
              isDark ? "text-slate-100" : "text-slate-900"
            }`}
          >
            Discard {label}?
          </h3>
        </div>

        {/* Body */}
        <p
          className={`text-sm font-kumbh mb-5 leading-relaxed ${
            isDark ? "text-slate-400" : "text-slate-600"
          }`}
        >
          Are you sure you want to exit? Your progress will be saved as a draft
          and you can continue where you left off next time.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold font-kumbh border transition-colors ${
              isDark
                ? "border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600"
                : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Stay
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold font-kumbh text-white bg-red-500 hover:bg-red-600 transition-colors"
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscardConfirmModal;
