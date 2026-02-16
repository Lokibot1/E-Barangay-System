import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../shared/Header";
import Sidebar from "../shared/Sidebar";
import DateTimeBar from "./DateTimeBar";
import FAQChatbot from "../../components/shared/FAQChatbot";
import AdminNotificationToast from "./AdminNotificationToast";
import UserNotificationToast from "./UserNotificationToast";
import themeTokens from "../../Themetokens";
import { isAdmin } from "../../services/sub-system-3/loginService";

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem("appTheme") || "blue";
  });
  const location = useLocation();

  // Scroll to main content section on route change
  useEffect(() => {
    const timer = setTimeout(() => {
      const el = document.getElementById("main-content");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [location.pathname]);

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
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <DateTimeBar currentTheme={currentTheme} />
        <Header currentTheme={currentTheme} onThemeChange={handleThemeChange} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* FAQ e-KAP Chatbot */}
      <FAQChatbot currentTheme={currentTheme} />

      {/* Real-time notification toasts */}
      {isAdmin() && <AdminNotificationToast currentTheme={currentTheme} />}
      {!isAdmin() && <UserNotificationToast currentTheme={currentTheme} />}
    </div>
  );
};

export default Layout;
