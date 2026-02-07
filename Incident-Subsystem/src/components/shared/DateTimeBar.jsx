import React, { useState, useEffect } from "react";
import themeTokens from "../../Themetokens";

const DateTimeBar = ({ currentTheme }) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const t = themeTokens[currentTheme];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <div
      className={`${t.cardBg} border-b ${t.cardBorder} px-4 sm:px-6 py-2 flex items-center justify-between`}
    >
      <div className="flex items-center gap-2">
        <svg
          className={`w-4 h-4 ${t.subtleText}`}
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
          className={`text-sm font-medium ${t.cardText} font-kumbh hidden sm:inline`}
        >
          {formatDate(currentDateTime)}
        </span>
        <span
          className={`text-sm font-medium ${t.cardText} font-kumbh sm:hidden`}
        >
          {currentDateTime.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className={`text-xs ${t.subtleText} font-kumbh hidden sm:inline`}>
          {currentDateTime.toLocaleDateString("en-US", { weekday: "long" })}
        </span>
        <span className={`text-sm font-semibold ${t.primaryText} font-kumbh`}>
          {formatTime(currentDateTime)}
        </span>
      </div>
    </div>
  );
};

export default DateTimeBar;
