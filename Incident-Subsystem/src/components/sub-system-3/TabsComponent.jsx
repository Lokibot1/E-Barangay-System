import React, { useRef, useState, useEffect } from "react";
import themeTokens from "../../Themetokens";

const TabsComponent = ({ activeTab, onTabChange, currentTheme }) => {
  const t = themeTokens[currentTheme] || themeTokens.blue;
  const isDark = currentTheme === "dark";
  const containerRef = useRef(null);
  const [sliderStyle, setSliderStyle] = useState({});

  const tabs = [
    {
      key: "complaints",
      label: "Submitted Complaints",
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
    <div className="mb-6 sm:mb-8">
      <div
        ref={containerRef}
        className={`relative inline-flex ${t.cardBg} rounded-lg p-1 shadow-md border ${t.cardBorder}`}
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
            className={`relative z-10 flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-md font-semibold text-sm transition-colors duration-300 font-kumbh whitespace-nowrap ${
              activeTab === tab.key
                ? "text-white"
                : `${t.subtleText} ${isDark ? "hover:text-slate-300" : "hover:text-slate-700"}`
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabsComponent;
