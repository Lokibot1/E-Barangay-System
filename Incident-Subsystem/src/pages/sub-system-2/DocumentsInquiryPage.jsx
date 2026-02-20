import React, { useEffect, useState } from "react";
import themeTokens from "../../Themetokens";
import ReportsSection from "../../components/sub-system-2/reports/ReportsSection";

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
      <div className="max-w-7xl mx-auto">
        <h1 className={`font-spartan text-4xl sm:text-5xl font-bold ${t.cardText} mb-6`}>
          Documents Inquiry
        </h1>
        <ReportsSection />
      </div>
    </div>
  );
};

export default DocumentsInquiryPage;
