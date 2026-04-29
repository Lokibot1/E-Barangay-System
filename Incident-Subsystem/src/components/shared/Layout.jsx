import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../shared/Header";
import Sidebar from "../shared/Sidebar";
import DateTimeBar from "./DateTimeBar";
import FAQChatbot from "../../components/shared/FAQChatbot";
import AdminNotificationToast from "./AdminNotificationToast";
import UserNotificationToast from "./UserNotificationToast";
import NetworkStatusBanner from "./NetworkStatusBanner";
import themeTokens from "../../Themetokens";
import { canAccessAdminPanel, canAccessStaffPanel } from "../../homepage/services/loginService";

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("sidebarCollapsed") === "true"
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("appTheme") || "modern"
  );
  const [forbiddenMessage, setForbiddenMessage] = useState("");

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

  // Handle forbidden route message
  useEffect(() => {
    const message = location.state?.forbidden
      ? String(location.state?.message || "403 Forbidden")
      : "";

    if (!message) return;

    setForbiddenMessage(message);

    const timer = setTimeout(() => setForbiddenMessage(""), 4500);
    return () => clearTimeout(timer);
  }, [location.state?.forbidden, location.state?.message]);

  const t = themeTokens[currentTheme];

  // Sync dark mode with Tailwind
  useEffect(() => {
    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [currentTheme]);

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
    localStorage.setItem("appTheme", theme);

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
        onMobileToggle={(val) =>
          setMobileSidebarOpen(
            typeof val === "boolean" ? val : (prev) => !prev
          )
        }
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-all duration-300 ease-in-out">
        <DateTimeBar currentTheme={currentTheme} />

        <NetworkStatusBanner
          currentTheme={currentTheme}
          subtleTextClass={t.subtleText}
        />

        <Header
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
          onMobileSidebarToggle={() =>
            setMobileSidebarOpen((prev) => !prev)
          }
          mobileSidebarOpen={mobileSidebarOpen}
        />

        <main id="main-content" className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* FAQ Chatbot */}
      <FAQChatbot currentTheme={currentTheme} />

      {/* Notification Logic (combined) */}
      {(canAccessAdminPanel() || canAccessStaffPanel()) ? (
        <AdminNotificationToast currentTheme={currentTheme} />
      ) : (
        <UserNotificationToast currentTheme={currentTheme} />
      )}

      {/* Forbidden Toast */}
      {forbiddenMessage && (
        <div className="fixed bottom-5 left-1/2 z-[1700] w-[92vw] max-w-md -translate-x-1/2">
          <div
            className={`rounded-2xl border px-4 py-3 shadow-xl ${
              currentTheme === "dark"
                ? "border-rose-800 bg-rose-950/80 text-rose-200"
                : "border-rose-200 bg-white text-rose-700"
            }`}
          >
            <p className="text-xs font-semibold">403 Forbidden</p>
            <p className="mt-0.5 text-[11px] opacity-90">
              {forbiddenMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;