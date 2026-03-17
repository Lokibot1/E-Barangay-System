import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "../../context/LanguageContext";
import MainMenuCards from "../../components/sub-system-3/MainMenuCards";
import ComplaintModal from "../../components/sub-system-3/ComplaintModal";
import themeTokens from "../../Themetokens";

const FileComplaintPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem("appTheme") || "modern";
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentTheme(localStorage.getItem("appTheme") || "modern");
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

  // ── Bidirectional scroll reveal ────────────────────────────────────────────
  const containerRef = useRef(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let lastScrollY = container.scrollTop;
    const handleScroll = () => {
      const currentScrollY = container.scrollTop;
      container.classList.toggle("scrolling-up", currentScrollY < lastScrollY);
      lastScrollY = currentScrollY;
    };
    container.addEventListener("scroll", handleScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("visible", entry.isIntersecting);
        });
      },
      { root: container, threshold: 0.1 }
    );

    container
      .querySelectorAll(".sr-elem, .sr-elem-left, .sr-elem-scale")
      .forEach((el) => observer.observe(el));

    return () => {
      container.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  const { tr } = useLanguage();
  const t = themeTokens[currentTheme];

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <div ref={containerRef} className="h-full flex flex-col overflow-y-auto">
        {/* White Space */}
        <div className={`${t.pageBg} py-8 sm:py-10 text-center px-4`}>
          <h1
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${t.cardText} mb-2 sm:mb-3 font-spartan uppercase tracking-tight`}
          >
            {tr.incidentMap?.title || 'INCIDENT & COMPLAINT MANAGEMENT'}
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
        <div id="main-content" className="flex-1 container mx-auto px-4 sm:px-6 py-8 sm:py-12">

          {/* Header with illustration */}
          <div className="mb-8 sm:mb-12">
            <div className="sr-elem flex items-start gap-4 mb-6">
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
                  {tr.fileComplaintPage.title}
                </h2>
                <div className="w-20 h-1 bg-amber-500 rounded-full"></div>
              </div>
            </div>

            <div
              className={`sr-elem ${t.cardBg} border ${t.cardBorder} rounded-2xl p-6 sm:p-8 shadow-lg`}
              style={{ transitionDelay: "0.15s" }}
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
                    {tr.fileComplaintPage.whatHappens}
                  </h3>
                  <p
                    className={`text-sm ${t.subtleText} font-kumbh leading-relaxed`}
                    dangerouslySetInnerHTML={{ __html: tr.fileComplaintPage.whatHappensDesc }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* How the Process Works */}
          <div className="mb-8 sm:mb-12">
            <div className="sr-elem-left flex items-center gap-3 mb-6">
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
                {tr.fileComplaintPage.howProcessWorks}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Step 1 */}
              <div
                className={`sr-elem ${t.cardBg} border ${t.cardBorder} rounded-xl p-6 shadow-md`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-spartan">
                    1
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`text-lg font-bold ${t.cardText} mb-2 font-spartan`}
                    >
                      {tr.fileComplaintPage.step1Title}
                    </h4>
                    <p className={`text-sm ${t.subtleText} font-kumbh`}>
                      {tr.fileComplaintPage.step1Desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div
                className={`sr-elem ${t.cardBg} border ${t.cardBorder} rounded-xl p-6 shadow-md`}
                style={{ transitionDelay: "0.1s" }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-spartan">
                    2
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`text-lg font-bold ${t.cardText} mb-2 font-spartan`}
                    >
                      {tr.fileComplaintPage.step2Title}
                    </h4>
                    <p className={`text-sm ${t.subtleText} font-kumbh`}>
                      {tr.fileComplaintPage.step2Desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div
                className={`sr-elem ${t.cardBg} border ${t.cardBorder} rounded-xl p-6 shadow-md`}
                style={{ transitionDelay: "0.2s" }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-spartan">
                    3
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`text-lg font-bold ${t.cardText} mb-2 font-spartan`}
                    >
                      {tr.fileComplaintPage.step3Title}
                    </h4>
                    <p className={`text-sm ${t.subtleText} font-kumbh`}>
                      {tr.fileComplaintPage.step3Desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div
                className={`sr-elem ${t.cardBg} border ${t.cardBorder} rounded-xl p-6 shadow-md`}
                style={{ transitionDelay: "0.3s" }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl font-spartan">
                    4
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`text-lg font-bold ${t.cardText} mb-2 font-spartan`}
                    >
                      {tr.fileComplaintPage.step4Title}
                    </h4>
                    <p className={`text-sm ${t.subtleText} font-kumbh mb-2`}>
                      {tr.fileComplaintPage.step4Desc}
                    </p>
                    <p
                      className={`text-sm ${t.subtleText} font-kumbh`}
                      dangerouslySetInnerHTML={{ __html: tr.fileComplaintPage.step4NoAgreement }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What to Prepare */}
          <div className="mb-8">
            <div className="sr-elem-left flex items-center gap-3 mb-6">
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
                {tr.fileComplaintPage.whatToPrepare}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                className={`sr-elem ${t.inlineBg} border-l-4 border-amber-500 p-6 rounded-lg`}
              >
                <h4
                  className={`text-lg font-bold ${t.cardText} mb-3 font-spartan`}
                >
                  {tr.fileComplaintPage.facts}
                </h4>
                <p className={`text-sm ${t.subtleText} font-kumbh`}>
                  {tr.fileComplaintPage.factsDesc}
                </p>
              </div>

              <div
                className={`sr-elem ${t.inlineBg} border-l-4 border-amber-500 p-6 rounded-lg`}
                style={{ transitionDelay: "0.1s" }}
              >
                <h4
                  className={`text-lg font-bold ${t.cardText} mb-3 font-spartan`}
                >
                  {tr.fileComplaintPage.names}
                </h4>
                <p className={`text-sm ${t.subtleText} font-kumbh`}>
                  {tr.fileComplaintPage.namesDesc}
                </p>
              </div>

              <div
                className={`sr-elem ${t.inlineBg} border-l-4 border-amber-500 p-6 rounded-lg md:col-span-2`}
                style={{ transitionDelay: "0.2s" }}
              >
                <h4
                  className={`text-lg font-bold ${t.cardText} mb-3 font-spartan`}
                >
                  {tr.fileComplaintPage.evidence}
                </h4>
                <p className={`text-sm ${t.subtleText} font-kumbh`}>
                  {tr.fileComplaintPage.evidenceDesc}
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="sr-elem-scale text-center">
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
              {tr.fileComplaintPage.ctaButton}
            </button>
          </div>

          {/* Bottom Bar */}
          <div className={`pt-6 mt-8 border-t ${t.dividerBorder} text-center`}>
            <p className={`text-sm ${t.subtleText} font-kumbh`}>
              © {new Date().getFullYear()} {tr.fileComplaintPage.footer}
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

      <style>{`
        .sr-elem {
          opacity: 0;
          transform: translateY(36px);
          transition: opacity 0.55s cubic-bezier(0.4, 0, 0.2, 1),
                      transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sr-elem.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .scrolling-up .sr-elem:not(.visible) {
          transform: translateY(-36px);
        }
        .sr-elem-left {
          opacity: 0;
          transform: translateX(-36px);
          transition: opacity 0.55s cubic-bezier(0.4, 0, 0.2, 1),
                      transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sr-elem-left.visible {
          opacity: 1;
          transform: translateX(0);
        }
        .sr-elem-scale {
          opacity: 0;
          transform: scale(0.92);
          transition: opacity 0.55s cubic-bezier(0.4, 0, 0.2, 1),
                      transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sr-elem-scale.visible {
          opacity: 1;
          transform: scale(1);
        }
      `}</style>
    </>
  );
};

export default FileComplaintPage;

