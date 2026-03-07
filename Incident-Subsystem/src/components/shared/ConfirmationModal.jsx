import React from "react";

const VARIANTS = {
  danger: {
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    confirmCls: "bg-red-600 hover:bg-red-700 text-white",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  warning: {
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    confirmCls: "bg-amber-500 hover:bg-amber-600 text-white",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  success: {
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    confirmCls: "bg-green-600 hover:bg-green-700 text-white",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
};

/**
 * Generic confirmation modal.
 *
 * Props:
 *  isOpen        boolean
 *  title         string
 *  message       string | ReactNode
 *  confirmLabel  string   (default "Confirm")
 *  cancelLabel   string   (default "Cancel")
 *  variant       "danger" | "warning" | "success"  (default "danger")
 *  loading       boolean  (disables buttons while a request is in-flight)
 *  onConfirm     () => void
 *  onCancel      () => void
 */
const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel  = "Cancel",
  variant      = "danger",
  loading      = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const v = VARIANTS[variant] || VARIANTS.danger;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={!loading ? onCancel : undefined}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Body */}
        <div className="px-6 pt-6 pb-5 flex gap-4">
          {/* Icon */}
          <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${v.iconBg} ${v.iconColor}`}>
            {v.icon}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 font-spartan">
              {title}
            </h3>
            <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400 font-kumbh leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 dark:border-gray-700" />

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3 justify-end bg-gray-50 dark:bg-gray-800/60">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2 rounded-lg text-sm font-kumbh font-semibold border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2 rounded-lg text-sm font-kumbh font-semibold transition-colors disabled:opacity-60 disabled:cursor-wait flex items-center gap-2 ${v.confirmCls}`}
          >
            {loading && (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {loading ? "Processing…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
