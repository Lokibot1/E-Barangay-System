import React from "react";
import themeTokens from "../../Themetokens";

const ReportDetailModal = ({ isOpen, onClose, report, currentTheme }) => {
  if (!isOpen || !report) return null;

  const t = themeTokens[currentTheme];
  const isDark = currentTheme === "dark";

  const statusConfig = {
    ongoing: {
      badge: "bg-blue-500",
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    resolved: {
      badge: "bg-green-500",
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    rejected: {
      badge: "bg-red-500",
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
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  };

  const config = statusConfig[report.status.toLowerCase()];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`relative ${t.modalBg} rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scaleIn`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 bg-gradient-to-r ${t.modalHeaderGrad} px-6 py-5 flex items-center justify-between border-b ${t.modalHeaderBorderBottom} rounded-t-2xl z-10`}
        >
          <div className="flex items-center gap-3">
            <div className={`${config.badge} text-white p-2 rounded-lg`}>
              {config.icon}
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${t.modalTitle} font-spartan`}>
                Report Details
              </h2>
              <p className={`text-sm ${t.modalSubtext} font-kumbh`}>
                {report.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 ${t.modalCloseBtnColor} ${t.modalCloseBtnHover} ${t.modalCloseBtnHoverBg} rounded-lg transition-all`}
          >
            <svg
              className="w-6 h-6"
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span
              className={`${config.badge} text-white px-4 py-2 rounded-full font-semibold font-kumbh`}
            >
              {report.status}
            </span>
            <span className={`text-sm ${t.subtleText} font-kumbh`}>
              {report.date}
            </span>
          </div>

          {/* Image */}
          {report.image && (
            <div className="rounded-xl overflow-hidden">
              <img
                src={report.image}
                alt={report.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Title & Category */}
          <div>
            <h3
              className={`text-3xl font-bold ${t.cardText} mb-2 font-spartan`}
            >
              {report.title}
            </h3>
            <p className={`text-lg ${t.subtleText} font-kumbh`}>
              {report.category}
            </p>
          </div>

          {/* Info Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <div
              className={`${isDark ? "bg-slate-700/50" : "bg-slate-50"} rounded-lg p-4`}
            >
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className={`w-5 h-5 ${t.primaryText}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span
                  className={`text-sm font-semibold ${t.subtleText} font-kumbh`}
                >
                  Location
                </span>
              </div>
              <p className={`${t.cardText} font-kumbh`}>{report.location}</p>
            </div>

            <div
              className={`${isDark ? "bg-slate-700/50" : "bg-slate-50"} rounded-lg p-4`}
            >
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className={`w-5 h-5 ${t.primaryText}`}
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
                <span
                  className={`text-sm font-semibold ${t.subtleText} font-kumbh`}
                >
                  Severity
                </span>
              </div>
              <p className={`${t.cardText} font-kumbh`}>{report.severity}</p>
            </div>

            <div
              className={`${isDark ? "bg-slate-700/50" : "bg-slate-50"} rounded-lg p-4`}
            >
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className={`w-5 h-5 ${t.primaryText}`}
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
                <span
                  className={`text-sm font-semibold ${t.subtleText} font-kumbh`}
                >
                  Submitted By
                </span>
              </div>
              <p className={`${t.cardText} font-kumbh`}>{report.submittedBy}</p>
            </div>

            <div
              className={`${isDark ? "bg-slate-700/50" : "bg-slate-50"} rounded-lg p-4`}
            >
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className={`w-5 h-5 ${t.primaryText}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span
                  className={`text-sm font-semibold ${t.subtleText} font-kumbh`}
                >
                  Date Submitted
                </span>
              </div>
              <p className={`${t.cardText} font-kumbh`}>{report.date}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className={`text-lg font-bold ${t.cardText} mb-3 font-spartan`}>
              Description
            </h4>
            <p className={`${t.subtleText} leading-relaxed font-kumbh`}>
              {report.description}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ReportDetailModal;
