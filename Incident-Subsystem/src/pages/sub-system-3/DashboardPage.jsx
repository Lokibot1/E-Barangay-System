import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import MainMenuCards from "../components/MainMenuCards";
import themeTokens from "../../Themetokens";

const DashboardPage = () => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem("appTheme") || "blue";
  });

  // Listen for theme changes
  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentTheme(localStorage.getItem("appTheme") || "blue");
    };

    window.addEventListener("storage", handleStorageChange);

    const handleThemeChange = (e) => {
      setCurrentTheme(e.detail);
    };
    window.addEventListener("themeChange", handleThemeChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("themeChange", handleThemeChange);
    };
  }, []);

  const t = themeTokens[currentTheme];

  return (
    <Layout>
      <div className="h-full flex flex-col">
        {/* Green Header Banner */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 py-12 sm:py-16 text-center px-4">
          <div className="max-w-4xl mx-auto">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-xl">
              {/* Placeholder for Barangay Seal */}
              <svg
                className="w-12 h-12 sm:w-14 sm:h-14 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 font-spartan uppercase tracking-tight">
              INCIDENT & COMPLAINT MANAGEMENT
            </h1>
            <p className="text-base sm:text-lg text-green-100 font-kumbh">
              Your voice matters. Report incidents and complaints with ease.
            </p>
          </div>
        </div>

        {/* Main Menu Cards */}
        <div className="flex-1 container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <MainMenuCards currentTheme={currentTheme} />
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
