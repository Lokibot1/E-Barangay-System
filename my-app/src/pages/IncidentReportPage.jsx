import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import IncidentReportModal from "../components/modals/IncidentReportModal";
import themeTokens from "../Themetokens";

const IncidentReportPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem("appTheme") || "blue";
  });

  // Listen for theme changes
  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentTheme(localStorage.getItem("appTheme") || "blue");
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom theme change event
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
      <div className="container mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12 animate-fadeIn">
          <div className="inline-block mb-4">
            <div
              className={`w-20 h-20 bg-gradient-to-br ${t.primaryGrad} rounded-2xl flex items-center justify-center shadow-xl mx-auto transform rotate-3`}
            >
              <svg
                className="w-10 h-10 text-white -rotate-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          <h1
            className={`text-6xl font-bold ${t.cardText} mb-4 tracking-tight font-spartan`}
          >
            Incident Report
          </h1>
          <p
            className={`text-xl ${t.subtleText} mb-8 max-w-2xl mx-auto font-kumbh`}
          >
            Report workplace incidents quickly and securely. Your safety is our
            priority.
          </p>

          <button
            onClick={openModal}
            className={`font-kumbh group inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r ${t.primaryGrad} text-white text-lg font-semibold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}
          >
            <svg
              className="w-6 h-6 transition-transform group-hover:rotate-90 duration-300"
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
            <span>Report New Incident</span>
          </button>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16">
          {[
            {
              delay: "0s",
              iconBg: "from-blue-100 to-blue-200",
              iconColor: "text-blue-600",
              icon: "M13 10V3L4 14h7v7l9-11h-7z",
              title: "Fast & Easy",
              desc: "Submit reports in minutes with our simple multi-step form",
            },
            {
              delay: "0.1s",
              iconBg: "from-indigo-100 to-indigo-200",
              iconColor: "text-indigo-600",
              icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
              title: "Secure",
              desc: "All reports are encrypted and handled confidentially",
            },
            {
              delay: "0.2s",
              iconBg: "from-green-100 to-green-200",
              iconColor: "text-green-600",
              icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
              title: "Track Status",
              desc: "Monitor your reports and receive updates in real-time",
            },
          ].map((card) => (
            <div
              key={card.title}
              className={`${t.cardBg} rounded-2xl p-6 shadow-lg border ${t.cardBorder} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-slideUp`}
              style={{ animationDelay: card.delay }}
            >
              <div
                className={`w-12 h-12 bg-gradient-to-br ${card.iconBg} rounded-xl flex items-center justify-center mb-4`}
              >
                <svg
                  className={`w-6 h-6 ${card.iconColor}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={card.icon}
                  />
                </svg>
              </div>
              <h3
                className={`text-2xl font-bold ${t.cardText} mb-2 font-spartan`}
              >
                {card.title}
              </h3>
              <p className={`${t.subtleText} font-kumbh`}>{card.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div
          className={`mt-20 ${t.cardBg} rounded-2xl shadow-lg border ${t.cardBorder} p-8`}
        >
          <h2
            className={`text-3xl font-bold text-center ${t.cardText} mb-8 font-spartan`}
          >
            Our Impact
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                val: "1,234",
                label: "Reports Filed",
                color: "text-blue-600",
              },
              { val: "95%", label: "Resolved", color: "text-green-600" },
              { val: "24h", label: "Avg Response", color: "text-indigo-600" },
              { val: "100%", label: "Confidential", color: "text-amber-600" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div
                  className={`text-4xl font-bold ${s.color} mb-2 font-spartan`}
                >
                  {s.val}
                </div>
                <div className={`${t.subtleText} text-sm font-kumbh`}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Help */}
        <div className="mt-12 text-center font-kumbh">
          <p className={t.subtleText}>
            Need help? Contact the safety team at{" "}
            <a
              href="mailto:safety@company.com"
              className={`${t.primaryText} hover:opacity-80 underline font-medium`}
            >
              safety@company.com
            </a>
          </p>
        </div>
      </div>

      <IncidentReportModal
        isOpen={isModalOpen}
        onClose={closeModal}
        currentTheme={currentTheme}
      />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }
      `}</style>
    </Layout>
  );
};

export default IncidentReportPage;
