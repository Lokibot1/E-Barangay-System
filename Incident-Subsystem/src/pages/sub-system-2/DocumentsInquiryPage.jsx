import React, { useEffect, useState } from "react";
import themeTokens from "../../Themetokens";

const summaryCards = [
  {
    title: "Pending Verification",
    value: 67,
    subtitle: "Successfully verified documents",
    icon: "!",
    iconClass: "text-amber-500 border-amber-500",
  },
  {
    title: "Verified",
    value: 20,
    subtitle: "Registered documents",
    icon: "✓",
    iconClass: "text-green-500 border-green-500",
  },
  {
    title: "Rejected",
    value: 9,
    subtitle: "Rejected documents",
    icon: "✕",
    iconClass: "text-red-500 border-red-500",
  },
];

const documentCards = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  residentName: "Mateo Dela Cruz",
  status: "Pending",
  documentType: "Barangay ID",
  referenceNumber: "1110-2364-7968",
  dateSubmitted: "January 31, 2026",
}));

const DocumentsInquiryPage = () => {
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("appTheme") || "blue"
  );

  useEffect(() => {
    const handleThemeChange = (e) => setCurrentTheme(e.detail);
    window.addEventListener("themeChange", handleThemeChange);
    return () => window.removeEventListener("themeChange", handleThemeChange);
  }, []);

  const t = themeTokens[currentTheme];

  return (
    <div className={`${t.pageBg} min-h-full p-4 sm:p-6 lg:p-8`}>
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className={`font-spartan text-4xl sm:text-5xl font-bold ${t.cardText}`}>
          Documents Inquiry
        </h1>

        <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-4 sm:p-6 space-y-6`}>
          <h2 className={`font-spartan text-2xl font-bold ${t.cardText}`}>
            Document Submission
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {summaryCards.map((card) => (
              <div key={card.title} className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-5 shadow-sm`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`font-spartan text-sm font-semibold ${t.cardText}`}>{card.title}</p>
                    <p className={`font-spartan text-5xl font-bold ${t.cardText} mt-2`}>{card.value}</p>
                    <p className={`font-kumbh text-sm ${t.subtleText} mt-2`}>{card.subtitle}</p>
                  </div>
                  <span className={`h-7 w-7 rounded-full border-2 flex items-center justify-center text-sm font-bold ${card.iconClass}`}>
                    {card.icon}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-b border-slate-300">
            <div className="flex items-center gap-6 -mb-px">
              <button className={`font-kumbh text-2xl pb-2 border-b-2 border-blue-500 ${t.cardText}`}>Pending</button>
              <button className={`font-kumbh text-2xl pb-2 border-b-2 border-transparent ${t.subtleText}`}>Completed</button>
              <button className={`font-kumbh text-2xl pb-2 border-b-2 border-transparent ${t.subtleText}`}>Rejected</button>
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className={`font-spartan text-2xl font-bold ${t.cardText}`}>Filter by Status</p>
              <p className={`font-kumbh text-xl ${t.subtleText}`}>Showing: All Statuses</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select className={`h-10 min-w-[210px] rounded-lg border ${t.cardBorder} px-3 font-kumbh text-lg ${t.inputText} ${t.inputBg}`}>
                <option>All Statuses</option>
                <option>Pending</option>
                <option>Completed</option>
                <option>Rejected</option>
              </select>
              <div className={`h-10 rounded-lg border ${t.cardBorder} px-3 flex items-center font-kumbh text-lg ${t.subtleText} ${t.inputBg}`}>
                Feb 2026 &nbsp; - &nbsp; Jan 2026
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {documentCards.map((card) => (
              <div key={card.id} className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-4 shadow-sm`}>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <p className={`font-spartan text-sm font-semibold ${t.cardText}`}>{card.residentName}</p>
                  <span className="inline-flex items-center rounded-full bg-amber-200 text-amber-800 px-2 py-0.5 text-xs font-kumbh">
                    {card.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <InfoRow label="Document Type:" value={card.documentType} subtle={t.subtleText} text={t.cardText} />
                  <InfoRow label="Reference Number:" value={card.referenceNumber} subtle={t.subtleText} text={t.cardText} />
                  <InfoRow label="Date Submitted:" value={card.dateSubmitted} subtle={t.subtleText} text={t.cardText} />
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex-1 h-8 rounded-full bg-green-600 hover:bg-green-700 text-white font-kumbh text-xs">Accept</button>
                  <button className="flex-1 h-8 rounded-full bg-slate-400 hover:bg-slate-500 text-white font-kumbh text-xs">Preview</button>
                  <button className="flex-1 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white font-kumbh text-xs">Decline</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, subtle, text }) => (
  <div className="grid grid-cols-2 gap-2">
    <p className={`font-kumbh text-xs ${subtle}`}>{label}</p>
    <p className={`font-kumbh text-xs ${text}`}>{value}</p>
  </div>
);

export default DocumentsInquiryPage;
