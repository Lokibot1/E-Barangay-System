import React, { useState, useEffect } from "react";
import MainMenuCards from "../../components/sub-system-3/MainMenuCards";
import Footer from "../../components/sub-system-3/Footer";
import { useLanguage } from "../../context/LanguageContext";
import themeTokens from "../../Themetokens";

const MainPage = () => {
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
  const { tr } = useLanguage();

  return (
    <div className="h-full flex flex-col">
      {/* White Space */}
      <div className={`${t.pageBg} py-8 sm:py-10 text-center px-4`}>
        <h1
          className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${t.cardText} mb-2 sm:mb-3 font-spartan uppercase tracking-tight`}
        >
          {tr.mainPage.title}
        </h1>
      </div>

      {/* Dynamic Theme Section with MainMenuCards */}
      <div className={`bg-gradient-to-r ${t.primaryGrad} py-12 sm:py-16 px-4`}>
        <div className="container mx-auto px-4 sm:px-6">
          <MainMenuCards currentTheme={currentTheme} />
        </div>
      </div>

      {/* Bottom White Space */}
      <div className="flex-1"></div>

      {/* Footer */}
      <Footer currentTheme={currentTheme} />
    </div>
  );
};

export default MainPage;
