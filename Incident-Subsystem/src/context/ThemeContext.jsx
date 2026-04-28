import React, { createContext, useContext, useEffect, useState } from 'react';

const noop = () => {};
const DEFAULT_THEME_CONTEXT = {
  isDark: false,
  toggleTheme: noop,
};

const ThemeContext = createContext(DEFAULT_THEME_CONTEXT);

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext) || DEFAULT_THEME_CONTEXT;
