import React, { useState, useEffect } from "react";
import MainMenuCards from "../../components/sub-system-2/MainMenuCards";
import CORRequestModal from "../../components/sub-system-2/CORRequestModal";
import themeTokens from "../../Themetokens";

const Req_CORPage = () => {
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

        {/* Request Certificate of Residency Content Section */}
        <div id="main-content" className="flex-1 container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Header with icon */}
          <div className="mb-8 sm:mb-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 flex-shrink-0">
                <svg
                  className="w-full h-full text-indigo-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h2
                  className={`text-2xl sm:text-3xl font-bold ${t.cardText} mb-2 font-spartan`}
                >
                  REQUEST FOR CERTIFICATE OF RESIDENCY
                </h2>
                <div className="w-20 h-1 bg-indigo-500 rounded-full"></div>
              </div>
            </div>

            <div
              className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-6 sm:p-8 shadow-lg`}
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 md:w-48">
                  <img
                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80"
                    alt="Certificate of Residency Illustration"
                    className="w-full h-auto rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <h3
                    className={`text-lg font-bold ${t.cardText} mb-3 font-spartan text-indigo-500`}
                  >
                    WHAT IS A CERTIFICATE OF RESIDENCY?
                  </h3>
                  <p
                    className={`text-sm ${t.subtleText} font-kumbh leading-relaxed`}
                  >
                    A Certificate of Residency is an official document issued by
                    the barangay certifying that you are a bonafide resident of
                    the barangay. It is commonly required for employment
                    applications, school enrollment, bank transactions, visa
                    applications, and other legal or government-related
                    proceedings that require proof of address.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How the Process Works */}
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
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
                  <div className="w-12 h-12 flex-shrink-0 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-spartan">
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
                      information, address, purpose, and years of residency
                      in the barangay. Ensure all details are accurate.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div
                className={`${t.cardBg} border ${t.cardBorder} rounded-xl p-6 shadow-md`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-spartan">
                    2
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`text-lg font-bold ${t.cardText} mb-2 font-spartan`}
                    >
                      VERIFICATION
                    </h4>
                    <p className={`text-sm ${t.subtleText} font-kumbh`}>
                      The barangay staff will verify your residency status
                      against their records. You may be contacted for
                      additional documentation or clarification if needed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div
                className={`${t.cardBg} border ${t.cardBorder} rounded-xl p-6 shadow-md`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-spartan">
                    3
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`text-lg font-bold ${t.cardText} mb-2 font-spartan`}
                    >
                      PROCESSING
                    </h4>
                    <p className={`text-sm ${t.subtleText} font-kumbh`}>
                      Once verified, the certificate will be prepared and
                      signed by the Barangay Captain. Processing typically
                      takes 1-3 business days after verification.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div
                className={`${t.cardBg} border ${t.cardBorder} rounded-xl p-6 shadow-md`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-spartan">
                    4
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`text-lg font-bold ${t.cardText} mb-2 font-spartan`}
                    >
                      PICKUP YOUR CERTIFICATE
                    </h4>
                    <p className={`text-sm ${t.subtleText} font-kumbh`}>
                      You will be notified once your certificate is ready.
                      Visit the Barangay Hall during office hours and bring a
                      valid ID for claiming. The certificate is valid for 6
                      months.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What to Prepare */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
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
                className={`${t.inlineBg} border-l-4 border-indigo-500 p-6 rounded-lg`}
              >
                <h4
                  className={`text-lg font-bold ${t.cardText} mb-3 font-spartan`}
                >
                  VALID ID
                </h4>
                <p className={`text-sm ${t.subtleText} font-kumbh`}>
                  Any government-issued ID such as a voter's ID, passport,
                  driver's license, or any valid identification for verification
                  purposes.
                </p>
              </div>

              <div
                className={`${t.inlineBg} border-l-4 border-indigo-500 p-6 rounded-lg`}
              >
                <h4
                  className={`text-lg font-bold ${t.cardText} mb-3 font-spartan`}
                >
                  PROOF OF ADDRESS
                </h4>
                <p className={`text-sm ${t.subtleText} font-kumbh`}>
                  Utility bills (electricity, water), rental contract, or any
                  official document that shows your current address within the
                  barangay.
                </p>
              </div>

              <div
                className={`${t.inlineBg} border-l-4 border-indigo-500 p-6 rounded-lg`}
              >
                <h4
                  className={`text-lg font-bold ${t.cardText} mb-3 font-spartan`}
                >
                  FEES & VALIDITY
                </h4>
                <p className={`text-sm ${t.subtleText} font-kumbh`}>
                  This certificate is issued free of charge (P0.00). The
                  Certificate of Residency is valid for 6 months from the date
                  of issuance.
                </p>
              </div>

              <div
                className={`${t.inlineBg} border-l-4 border-indigo-500 p-6 rounded-lg`}
              >
                <h4
                  className={`text-lg font-bold ${t.cardText} mb-3 font-spartan`}
                >
                  PERSONAL APPEARANCE
                </h4>
                <p className={`text-sm ${t.subtleText} font-kumbh`}>
                  You must appear in person at the Barangay Hall for claiming.
                  An authorized representative may claim on your behalf with a
                  signed authorization letter and valid IDs of both parties.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button
              onClick={openModal}
              className="inline-flex items-center gap-3 px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-lg sm:text-xl font-bold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-spartan"
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              REQUEST CERTIFICATE OF RESIDENCY
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

      {/* COR Request Modal */}
      <CORRequestModal
        isOpen={isModalOpen}
        onClose={closeModal}
        currentTheme={currentTheme}
      />
    </>
  );
};

export default Req_CORPage;
