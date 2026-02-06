import React from "react";
import themeTokens from "../Themetokens";

const ReportCard = ({ report, currentTheme, onClick }) => {
  const t = themeTokens[currentTheme];
  const isDark = currentTheme === "dark";

  const statusConfig = {
    ongoing: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      darkBg: "bg-blue-900/30",
      darkText: "text-blue-400",
      badge: "bg-blue-500",
    },
    resolved: {
      bg: "bg-green-100",
      text: "text-green-700",
      darkBg: "bg-green-900/30",
      darkText: "text-green-400",
      badge: "bg-green-500",
    },
    rejected: {
      bg: "bg-red-100",
      text: "text-red-700",
      darkBg: "bg-red-900/30",
      darkText: "text-red-400",
      badge: "bg-red-500",
    },
  };

  const config = statusConfig[report.status.toLowerCase()];

  return (
    <div
      onClick={onClick}
      className={`${t.cardBg} border ${t.cardBorder} rounded-lg p-4 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 group`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-600"} font-kumbh`}
            >
              {report.id}
            </span>
            <span
              className={`${config.badge} text-white text-xs font-semibold px-2 py-0.5 rounded-full font-kumbh`}
            >
              {report.status}
            </span>
          </div>
          <h3
            className={`text-lg font-bold ${t.cardText} mb-1 font-spartan group-hover:${t.primaryText} transition-colors line-clamp-1`}
          >
            {report.title}
          </h3>
          <p className={`text-xs ${t.subtleText} font-kumbh`}>
            {report.category}
          </p>
        </div>
        <svg
          className={`w-4 h-4 ${t.subtleText} group-hover:${t.primaryText} transition-all transform group-hover:translate-x-1 flex-shrink-0 ml-2`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>

      {/* Image/Thumbnail */}
      {report.image && (
        <div className="mb-3 rounded-md overflow-hidden">
          <img
            src={report.image}
            alt={report.title}
            className="w-full h-32 object-cover"
          />
        </div>
      )}

      {/* Details */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-start gap-2">
          <svg
            className={`w-3.5 h-3.5 ${t.subtleText} mt-0.5 flex-shrink-0`}
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
          <p
            className={`text-xs ${t.subtleText} font-kumbh flex-1 line-clamp-1`}
          >
            {report.location}
          </p>
        </div>
      </div>

      {/* Description */}
      <p
        className={`text-xs ${isDark ? "text-slate-300" : "text-slate-600"} mb-3 font-kumbh line-clamp-2`}
      >
        {report.description}
      </p>

      {/* Footer */}
      <div
        className={`flex items-center justify-between pt-3 border-t ${t.dividerBorder}`}
      >
        <div className="flex items-center gap-1.5">
          <svg
            className={`w-3.5 h-3.5 ${t.subtleText}`}
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
          <span className={`text-xs ${t.subtleText} font-kumbh`}>
            {report.date}
          </span>
        </div>
        <div
          className={`px-2 py-1 ${isDark ? config.darkBg : config.bg} ${isDark ? config.darkText : config.text} text-xs font-semibold rounded-full font-kumbh`}
        >
          {report.severity}
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
