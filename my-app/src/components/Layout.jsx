import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import FAQChatbot from "./FAQChatbot";
import themeTokens from "../Themetokens";

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem("appTheme") || "blue";
  });

  const t = themeTokens[currentTheme];

  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
    localStorage.setItem("appTheme", theme);

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("themeChange", { detail: theme }));
  };

  return (
    <div className={`h-screen ${t.pageBg} flex overflow-hidden`}>
      <Sidebar
        currentTheme={currentTheme}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden">
        <Header currentTheme={currentTheme} onThemeChange={handleThemeChange} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* FAQ e-KAP Chatbot */}
      <FAQChatbot currentTheme={currentTheme} />
    </div>
  );
};

export default Layout;
