import React, { useState, useEffect } from "react";
import MainMenuCards from "../../components/sub-system-2/MainMenuCards";
import COIRequestModal from "../../components/sub-system-2/COIRequestModal";
import themeTokens from "../../Themetokens";

const Req_COIPage = () => {
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

        {/* Request Certificate of Indigency Content Section */}
        <div id="main-content" className="flex-1 container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Header with icon */}
          <div className="mb-8 sm:mb-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 flex-shrink-0">
                <svg
                  className="w-full h-full text-green-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h2
                  className={`text-2xl sm:text-3xl font-bold ${t.cardText} mb-2 font-spartan`}
                >
                  REQUEST FOR CERTIFICATE OF INDIGENCY
                </h2>
                <div className="w-20 h-1 bg-green-500 rounded-full"></div>
              </div>
            </div>

            <div
              className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-6 sm:p-8 shadow-lg`}
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 md:w-48">
                  <img
                    src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&q=80"
                    alt="Certificate of Indigency Illustration"
                    className="w-full h-auto rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <h3
                    className={`text-lg font-bold ${t.cardText} mb-3 font-spartan text-green-500`}
                  >
                    WHAT IS A CERTIFICATE OF INDIGENCY?
                  </h3>
                  <p
                    className={`text-sm ${t.subtleText} font-kumbh leading-relaxed`}
                  >
                    A Certificate of Indigency is an official document issued by
                    the barangay certifying that a resident belongs to an
                    indigent family or has a low income status. It is commonly
                    used to avail free medical assistance, scholarship programs,
                    legal aid, and other government social services and
                    financial assistance programs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How the Process Works */}
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
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
                  <div className="w-12 h-12 flex-shrink-0 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-spartan">
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
                      information, address, and the purpose for requesting the
                      certificate. Make sure all details are accurate.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div
                className={`${t.cardBg} border ${t.cardBorder} rounded-xl p-6 shadow-md`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-spartan">
                    2
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`text-lg font-bold ${t.cardText} mb-2 font-spartan`}
                    >
                      VERIFICATION
                    </h4>
                    <p className={`text-sm ${t.subtleText} font-kumbh`}>
                      The barangay staff will verify your residency and
                      indigency status based on their records. You may be asked
                      to provide additional supporting documents if needed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div
                className={`${t.cardBg} border ${t.cardBorder} rounded-xl p-6 shadow-md`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-spartan">
                    3
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`text-lg font-bold ${t.cardText} mb-2 font-spartan`}
                    >
                      PROCESSING
                    </h4>
                    <p className={`text-sm ${t.subtleText} font-kumbh`}>
                      Once your information is verified, the certificate will be
                      prepared and signed by the Barangay Captain. Processing
                      typically takes 1-3 business days.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div
                className={`${t.cardBg} border ${t.cardBorder} rounded-xl p-6 shadow-md`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-spartan">
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
                      valid ID for claiming. This certificate is issued free of
                      charge.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What to Prepare */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
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
                className={`${t.inlineBg} border-l-4 border-green-500 p-6 rounded-lg`}
              >
                <h4
                  className={`text-lg font-bold ${t.cardText} mb-3 font-spartan`}
                >
                  VALID ID
                </h4>
                <p className={`text-sm ${t.subtleText} font-kumbh`}>
                  Any government-issued ID such as a birth certificate, voter's
                  ID, passport, driver's license, or school ID for verification.
                </p>
              </div>

              <div
                className={`${t.inlineBg} border-l-4 border-green-500 p-6 rounded-lg`}
              >
                <h4
                  className={`text-lg font-bold ${t.cardText} mb-3 font-spartan`}
                >
                  PURPOSE DOCUMENTATION
                </h4>
                <p className={`text-sm ${t.subtleText} font-kumbh`}>
                  Any supporting document related to your purpose such as
                  hospital bills, school enrollment forms, or court documents.
                </p>
              </div>

              <div
                className={`${t.inlineBg} border-l-4 border-green-500 p-6 rounded-lg`}
              >
                <h4
                  className={`text-lg font-bold ${t.cardText} mb-3 font-spartan`}
                >
                  FEES
                </h4>
                <p className={`text-sm ${t.subtleText} font-kumbh`}>
                  This certificate is issued free of charge (P0.00). No payment
                  is required for the Certificate of Indigency.
                </p>
              </div>

              <div
                className={`${t.inlineBg} border-l-4 border-green-500 p-6 rounded-lg`}
              >
                <h4
                  className={`text-lg font-bold ${t.cardText} mb-3 font-spartan`}
                >
                  PERSONAL APPEARANCE
                </h4>
                <p className={`text-sm ${t.subtleText} font-kumbh`}>
                  You must appear in person at the Barangay Hall for claiming
                  the certificate. Representatives are not allowed unless
                  authorized in writing.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button
              onClick={openModal}
              className="inline-flex items-center gap-3 px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg sm:text-xl font-bold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-spartan"
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
              REQUEST CERTIFICATE OF INDIGENCY
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

      {/* COI Request Modal */}
      <COIRequestModal
        isOpen={isModalOpen}
        onClose={closeModal}
        currentTheme={currentTheme}
      />
    </>
  );
};

export default Req_COIPage;
