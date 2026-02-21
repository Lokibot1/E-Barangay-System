import React, { useState, useEffect } from "react";
import MainMenuCards from "../../components/sub-system-2/MainMenuCards";
import BIDRequestModal from "../../components/sub-system-2/BIDRequestModal";
import themeTokens from "../../Themetokens";

const Req_BIDPage = () => {
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
    <>
      <div className="h-full flex flex-col overflow-y-auto">
        {/* Header */}
        <div className={`${t.pageBg} py-8 sm:py-10 text-center px-4`}>
          <h1
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${t.cardText} mb-2 sm:mb-3 font-spartan uppercase tracking-tight`}
          >
            DOCUMENT SERVICES
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

        {/* Request Barangay ID Content Section */}
        <div id="main-content" className="flex-1 container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Header with icon */}
          <div className="mb-8 sm:mb-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 flex-shrink-0">
                <svg
                  className="w-full h-full text-blue-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h2
                  className={`text-2xl sm:text-3xl font-bold ${t.cardText} mb-2 font-spartan`}
                >
                  REQUEST FOR BARANGAY ID
                </h2>
                <div className="w-20 h-1 bg-blue-500 rounded-full"></div>
              </div>
            </div>

            <div
              className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-6 sm:p-8 shadow-lg`}
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 md:w-48">
                  <img
                    src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80"
                    alt="Barangay ID Illustration"
                    className="w-full h-auto rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <h3
                    className={`text-lg font-bold ${t.cardText} mb-3 font-spartan text-blue-500`}
                  >
                    WHAT IS A BARANGAY ID?
                  </h3>
                  <p
                    className={`text-sm ${t.subtleText} font-kumbh leading-relaxed`}
                  >
                    A Barangay ID is an official identification card issued by
                    your barangay. It serves as a valid secondary government ID
                    and proof that you are a registered resident of the
                    barangay. It can be used for various transactions such as
                    opening bank accounts, applying for jobs, and availing
                    government services.
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
                  <div className="w-12 h-12 flex-shrink-0 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-spartan">
                    1
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`text-lg font-bold ${t.cardText} mb-2 font-spartan`}
                    >
                      SUBMIT YOUR REQUEST
                    </h4>
                    <p className={`text-sm ${t.subtleText} font-kumbh`}>
                      Fill out the online request form with your personal
                      information, address details, and emergency contact. Make
                      sure all information is accurate.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div
                className={`${t.cardBg} border ${t.cardBorder} rounded-xl p-6 shadow-md`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-spartan">
                    2
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`text-lg font-bold ${t.cardText} mb-2 font-spartan`}
                    >
                      VERIFICATION
                    </h4>
                    <p className={`text-sm ${t.subtleText} font-kumbh`}>
                      The barangay staff will review and verify your submitted
                      information against their records. You will be notified
                      if any additional documents are needed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div
                className={`${t.cardBg} border ${t.cardBorder} rounded-xl p-6 shadow-md`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-spartan">
                    3
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`text-lg font-bold ${t.cardText} mb-2 font-spartan`}
                    >
                      PAYMENT & PROCESSING
                    </h4>
                    <p className={`text-sm ${t.subtleText} font-kumbh`}>
                      Once verified, you will be asked to pay the applicable
                      fee. Processing typically takes 1-3 business days after
                      payment is confirmed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div
                className={`${t.cardBg} border ${t.cardBorder} rounded-xl p-6 shadow-md`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-spartan">
                    4
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`text-lg font-bold ${t.cardText} mb-2 font-spartan`}
                    >
                      PICKUP YOUR ID
                    </h4>
                    <p className={`text-sm ${t.subtleText} font-kumbh`}>
                      You will receive a notification once your Barangay ID is
                      ready. Visit the Barangay Hall during office hours and
                      bring a valid government-issued ID for claiming.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What to Prepare */}
          <div className="mb-8">
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
                className={`${t.inlineBg} border-l-4 border-blue-500 p-6 rounded-lg`}
              >
                <h4
                  className={`text-lg font-bold ${t.cardText} mb-3 font-spartan`}
                >
                  VALID ID
                </h4>
                <p className={`text-sm ${t.subtleText} font-kumbh`}>
                  Any government-issued ID such as a birth certificate, voter's
                  ID, passport, driver's license, or school ID.
                </p>
              </div>

              <div
                className={`${t.inlineBg} border-l-4 border-blue-500 p-6 rounded-lg`}
              >
                <h4
                  className={`text-lg font-bold ${t.cardText} mb-3 font-spartan`}
                >
                  PROOF OF RESIDENCY
                </h4>
                <p className={`text-sm ${t.subtleText} font-kumbh`}>
                  Utility bill, rental contract, or any document that proves
                  you reside within the barangay jurisdiction.
                </p>
              </div>

              <div
                className={`${t.inlineBg} border-l-4 border-blue-500 p-6 rounded-lg`}
              >
                <h4
                  className={`text-lg font-bold ${t.cardText} mb-3 font-spartan`}
                >
                  FEES
                </h4>
                <p className={`text-sm ${t.subtleText} font-kumbh`}>
                  P20.00 for registered voters, P30.00 for non-voters.
                  The ID is valid for 1 year from the date of issuance.
                </p>
              </div>

              <div
                className={`${t.inlineBg} border-l-4 border-blue-500 p-6 rounded-lg`}
              >
                <h4
                  className={`text-lg font-bold ${t.cardText} mb-3 font-spartan`}
                >
                  PERSONAL APPEARANCE
                </h4>
                <p className={`text-sm ${t.subtleText} font-kumbh`}>
                  You must appear in person at the Barangay Hall for photo
                  capture and ID claiming. Representatives are not allowed.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button
              onClick={openModal}
              className="inline-flex items-center gap-3 px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-lg sm:text-xl font-bold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-spartan"
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
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0"
                />
              </svg>
              REQUEST BARANGAY ID
            </button>
          </div>

          {/* Bottom Bar */}
          <div className={`pt-6 mt-8 border-t ${t.dividerBorder} text-center`}>
            <p className={`text-sm ${t.subtleText} font-kumbh`}>
              © {new Date().getFullYear()} Barangay Document Services System. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* BID Request Modal */}
      <BIDRequestModal
        isOpen={isModalOpen}
        onClose={closeModal}
        currentTheme={currentTheme}
      />
    </>
  );
};

export default Req_BIDPage;
