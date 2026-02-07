import React, { useState, useEffect } from "react";
import Layout from "../../components/shared/Layout";
import MainMenuCards from "../../components/sub-system-3/MainMenuCards";
import ComplaintModal from "../../components/sub-system-3/ComplaintModal";
import themeTokens from "../../Themetokens";

const FileComplaintPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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
        <div className="flex-1 container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Header with illustration */}
          <div className="mb-8 sm:mb-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 flex-shrink-0">
                <svg
                  className="w-full h-full text-amber-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h2
                  className={`text-2xl sm:text-3xl font-bold ${t.cardText} mb-2 font-spartan`}
                >
                  FILING A COMPLAINT
                </h2>
                <div className="w-20 h-1 bg-amber-500 rounded-full"></div>
              </div>
            </div>

            <div
              className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-6 sm:p-8 shadow-lg`}
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 md:w-48">
                  <img
                    src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=80"
                    alt="Filing Complaint Illustration"
                    className="w-full h-auto rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <h3
                    className={`text-lg font-bold ${t.cardText} mb-3 font-spartan text-amber-500`}
                  >
                    WHAT HAPPENS WHEN YOU FILE A COMPLAINT?
                  </h3>
                  <p
                    className={`text-sm ${t.subtleText} font-kumbh leading-relaxed`}
                  >
                    Filing a formal complaint (<strong>Blotter</strong>)
                    initiates a community-based dispute resolution process. Its
                    primary goal is Amicable Settlement—helping both parties
                    reach a fair agreement without going to court.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How the Process Works */}
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3
                className={`text-xl sm:text-2xl font-bold ${t.cardText} font-spartan`}
              >
                HOW THE PROCESS WORKS?
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Step 1 */}
              <div
                className={`${t.cardBg} border ${t.cardBorder} rounded-xl p-6 shadow-md`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-spartan">
                    1
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`text-lg font-bold ${t.cardText} mb-2 font-spartan`}
                    >
                      DOCUMENTATION
                    </h4>
                    <p className={`text-sm ${t.subtleText} font-kumbh`}>
                      Your narration will be recorded in the official Barangay
                      Blotter. This serves as a permanent administrative record
                      of the incident.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div
                className={`${t.cardBg} border ${t.cardBorder} rounded-xl p-6 shadow-md`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-spartan">
                    2
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`text-lg font-bold ${t.cardText} mb-2 font-spartan`}
                    >
                      THE SUMMONS
                    </h4>
                    <p className={`text-sm ${t.subtleText} font-kumbh`}>
                      Within the next few days, the Barangay will issue a Notice
                      to Appear (Summons) to the person you are complaining
                      against (the Respondent).
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div
                className={`${t.cardBg} border ${t.cardBorder} rounded-xl p-6 shadow-md`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-spartan">
                    3
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`text-lg font-bold ${t.cardText} mb-2 font-spartan`}
                    >
                      MEDIATION
                    </h4>
                    <p className={`text-sm ${t.subtleText} font-kumbh`}>
                      You and the Respondent will be invited to a face-to-face
                      meeting moderated by the Barangay Captain or a member of
                      the Lupon Tagapamayapa.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div
                className={`${t.cardBg} border ${t.cardBorder} rounded-xl p-6 shadow-md`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-spartan">
                    4
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`text-lg font-bold ${t.cardText} mb-2 font-spartan`}
                    >
                      RESOLUTION / AGREEMENT
                    </h4>
                    <p className={`text-sm ${t.subtleText} font-kumbh mb-2`}>
                      If you settle, a written agreement is signed. This has the
                      force and effect of a court judgment.
                    </p>
                    <p className={`text-sm ${t.subtleText} font-kumbh`}>
                      <strong>No Agreement:</strong> If no settlement is
                      reached, the Barangay will issue a Certificate to File
                      Action (CFA). You need this document if you decide to
                      escalate the case to a higher court or the police.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What to Prepare */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
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
                className={`text-xl sm:text-2xl font-bold ${t.cardText} font-spartan`}
              >
                WHAT TO PREPARE?
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                className={`${t.inlineBg} border-l-4 border-amber-500 p-6 rounded-lg`}
              >
                <h4
                  className={`text-lg font-bold ${t.cardText} mb-3 font-spartan`}
                >
                  FACTS
                </h4>
                <p className={`text-sm ${t.subtleText} font-kumbh`}>
                  Clear details of the date, time, and location of the incident.
                </p>
              </div>

              <div
                className={`${t.inlineBg} border-l-4 border-amber-500 p-6 rounded-lg`}
              >
                <h4
                  className={`text-lg font-bold ${t.cardText} mb-3 font-spartan`}
                >
                  NAMES
                </h4>
                <p className={`text-sm ${t.subtleText} font-kumbh`}>
                  Full names and addresses of the parties involved (if known).
                </p>
              </div>

              <div
                className={`${t.inlineBg} border-l-4 border-amber-500 p-6 rounded-lg md:col-span-2`}
              >
                <h4
                  className={`text-lg font-bold ${t.cardText} mb-3 font-spartan`}
                >
                  EVIDENCE
                </h4>
                <p className={`text-sm ${t.subtleText} font-kumbh`}>
                  Photos, videos, screenshots, or names of witnesses that can
                  support your statement.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button
              onClick={openModal}
              className="inline-flex items-center gap-3 px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-lg sm:text-xl font-bold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-spartan"
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              FILE A COMPLAINT
            </button>
            <p className={`text-sm ${t.subtleText} mt-4 font-kumbh`}>
              © 2026 Barangay San Bartolome
            </p>
          </div>
        </div>
      </div>

      {/* Complaint Modal */}
      <ComplaintModal
        isOpen={isModalOpen}
        onClose={closeModal}
        currentTheme={currentTheme}
      />
    </Layout>
  );
};

export default FileComplaintPage;
