import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import MainMenuCards from "../components/MainMenuCards";
import themeTokens from "../Themetokens";

const FileComplaintPage = () => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem("appTheme") || "blue";
  });

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
      <div className="h-full flex flex-col overflow-y-auto">
        {/* White Space */}
        <div className={`${t.pageBg} py-8 sm:py-12 text-center px-4`}>
          <h1
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${t.cardText} mb-2 sm:mb-3 font-spartan uppercase tracking-tight`}
          >
            INCIDENT & COMPLAINT MANAGEMENT
          </h1>
        </div>

        {/* Dynamic Theme Section with MainMenuCards */}
        <div
          className={`bg-gradient-to-r ${t.primaryGrad} py-12 sm:py-16 px-4`}
        >
          <div className="container mx-auto px-4 sm:px-6">
            <MainMenuCards currentTheme={currentTheme} />
          </div>
        </div>

        {/* File Complaint Content Section */}
        <div className="flex-1 container mx-auto px-4 sm:px-6 py-8">
          <div
            className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-6 sm:p-10 shadow-xl`}
          >
            {/* Page Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg
                  className="w-9 h-9 text-white"
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
              </div>
              <h2
                className={`text-3xl sm:text-4xl font-bold ${t.cardText} mb-3 font-spartan`}
              >
                File a Complaint
              </h2>
              <p
                className={`text-base sm:text-lg ${t.subtleText} max-w-2xl mx-auto font-kumbh`}
              >
                Submit your complaints regarding barangay matters, noise
                disturbances, property disputes, or other community concerns.
              </p>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div
                className={`${t.inlineBg} border ${t.dividerBorder} rounded-xl p-6 text-center`}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-blue-600"
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
                </div>
                <h3
                  className={`text-lg font-bold ${t.cardText} mb-2 font-spartan`}
                >
                  Easy Process
                </h3>
                <p className={`text-sm ${t.subtleText} font-kumbh`}>
                  Simple multi-step form to file your complaint
                </p>
              </div>

              <div
                className={`${t.inlineBg} border ${t.dividerBorder} rounded-xl p-6 text-center`}
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3
                  className={`text-lg font-bold ${t.cardText} mb-2 font-spartan`}
                >
                  Confidential
                </h3>
                <p className={`text-sm ${t.subtleText} font-kumbh`}>
                  Your information is kept secure and private
                </p>
              </div>

              <div
                className={`${t.inlineBg} border ${t.dividerBorder} rounded-xl p-6 text-center`}
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-green-600"
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
                </div>
                <h3
                  className={`text-lg font-bold ${t.cardText} mb-2 font-spartan`}
                >
                  Track Progress
                </h3>
                <p className={`text-sm ${t.subtleText} font-kumbh`}>
                  Monitor the status of your complaint
                </p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <button
                className={`font-kumbh inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-lg font-semibold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Start Filing Complaint</span>
              </button>
              <p className={`text-sm ${t.subtleText} mt-4 font-kumbh`}>
                Need assistance? Contact us at{" "}
                <a
                  href="mailto:barangay@example.com"
                  className={`${t.primaryText} hover:opacity-80 underline font-medium`}
                >
                  barangay@example.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FileComplaintPage;
