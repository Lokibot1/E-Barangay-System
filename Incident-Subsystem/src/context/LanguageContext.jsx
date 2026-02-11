import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getLanguage,
  setLanguage as setLang,
  getTranslations,
} from "../services/shared/translateToTagalogService";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(getLanguage);

  // Listen for changes triggered from other tabs or direct service calls
  useEffect(() => {
    const onLanguageChange = (e) => setLanguageState(e.detail);
    const onStorage = () => setLanguageState(getLanguage());

    window.addEventListener("languageChange", onLanguageChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("languageChange", onLanguageChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const setLanguage = (lang) => {
    setLanguageState(lang);
    setLang(lang); // persists to localStorage + dispatches event
  };

  const tr = getTranslations(language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, tr }}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * Hook to access the current language and translations.
 * Returns { language, setLanguage, tr }
 */
export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
};

export default LanguageContext;
