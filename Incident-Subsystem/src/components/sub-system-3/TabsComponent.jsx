import React, { useRef, useState, useEffect } from "react";
import themeTokens from "../../Themetokens";

const TabsComponent = ({ activeTab, onTabChange, currentTheme }) => {
  const t = themeTokens[currentTheme] || themeTokens.modern;
  const isDark = currentTheme === "dark";
  const containerRef = useRef(null);
  const [sliderStyle, setSliderStyle] = useState({});

  const tabs = [
    {
      key: "complaints",
      label: "Submitted Complaints",
      shortLabel: "Complaints",
      icon: (
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      key: "incidents",
      label: "Submitted Incidents",
      shortLabel: "Incidents",
      icon: (
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
            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      key: "appointments",
      label: "My Appointments",
      shortLabel: "Appointments",
      icon: (
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const activeIndex = tabs.findIndex((tab) => tab.key === activeTab);
    const buttons = container.querySelectorAll("button");
    const activeButton = buttons[activeIndex];

    if (activeButton) {
      setSliderStyle({
        width: activeButton.offsetWidth,
        left: activeButton.offsetLeft,
      });
    }
  }, [activeTab]);

  return (
    <div className="mb-6 sm:mb-8 overflow-x-auto">
      <div
        ref={containerRef}
        className={`relative inline-flex min-w-full sm:min-w-0 ${t.cardBg} rounded-lg p-1 shadow-md border ${t.cardBorder}`}
      >
        {/* Sliding background */}
        <div
          className={`absolute top-1 bottom-1 rounded-md bg-gradient-to-r ${t.primaryGrad} shadow-lg transition-all duration-300 ease-in-out`}
          style={{
            width: sliderStyle.width || 0,
            left: sliderStyle.left || 0,
          }}
        />

        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`relative z-10 flex items-center justify-center gap-1.5 sm:gap-2 flex-1 sm:flex-none px-3 sm:px-5 py-2 sm:py-2.5 rounded-md font-semibold text-xs sm:text-sm transition-colors duration-300 font-kumbh whitespace-nowrap ${
              activeTab === tab.key
                ? "text-white"
                : `${t.subtleText} ${isDark ? "hover:text-slate-300" : "hover:text-slate-700"}`
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabsComponent;

