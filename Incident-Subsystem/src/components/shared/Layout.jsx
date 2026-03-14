import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../shared/Header";
import Sidebar from "../shared/Sidebar";
import DateTimeBar from "./DateTimeBar";
import FAQChatbot from "../../components/shared/FAQChatbot";
import AdminNotificationToast from "./AdminNotificationToast";
import UserNotificationToast from "./UserNotificationToast";
import themeTokens from "../../Themetokens";
import { isAdmin } from "../../homepage/services/loginService";

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("sidebarCollapsed") === "true",
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("appTheme") || "modern",
  );
  const location = useLocation();

  // Close mobile sidebar and scroll to top on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
    const timer = setTimeout(() => {
      const el = document.getElementById("main-content");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const t = themeTokens[currentTheme];

  // Sync <html> dark class so Tailwind dark: utilities match the app theme
  useEffect(() => {
    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
    localStorage.setItem("appTheme", theme);

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("themeChange", { detail: theme }));
  };

  return (
    <div
      data-theme={currentTheme}
      className={`theme-scope h-screen ${t.pageBg} flex overflow-hidden font-kumbh [&_h1]:font-spartan [&_h2]:font-spartan [&_h3]:font-spartan`}
    >
      <Sidebar
        currentTheme={currentTheme}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
        mobileOpen={mobileSidebarOpen}
        onMobileToggle={(val) => setMobileSidebarOpen(typeof val === "boolean" ? val : (prev) => !prev)}
      />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-all duration-300 ease-in-out">
        <DateTimeBar currentTheme={currentTheme} />
        <Header
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
          onMobileSidebarToggle={() => setMobileSidebarOpen((prev) => !prev)}
          mobileSidebarOpen={mobileSidebarOpen}
        />
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
