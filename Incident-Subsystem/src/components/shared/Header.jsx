import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ThemeModal from "../../components/sub-system-3/ThemeModal";
import LogoutModal from "./LogoutModal";
import { logout, getUser, isAdmin } from "../../services/sub-system-3/loginService";
import { useLanguage } from "../../context/LanguageContext";
import { useRealTime } from "../../context/RealTimeContext";
import { useUserRealTime } from "../../context/UserRealTimeContext";
import themeTokens from "../../Themetokens";
import logo from "../../assets/images/logo.jpg";

// ── Notification sound using Web Audio API (no mp3 file needed) ─────────
const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    // First tone (higher pitch)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.15);

    // Second tone (even higher, slight delay)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1175, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.001, ctx.currentTime);
    gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.3);

    // Cleanup
    setTimeout(() => ctx.close(), 500);
  } catch {
    // Ignore — no audio support or blocked by autoplay policy
  }
};

// ── Relative time utility ───────────────────────────────────────────────
const getRelativeTime = (date) => {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
};

// ── Memoized notification list item ─────────────────────────────────────
const NotificationItem = memo(({ notification, isDark, onMarkAsRead }) => {
  const statusColor = notification.read ? "bg-gray-400" : "bg-amber-500";
  const statusLabel = notification.read ? "Read" : "New";
  const timeAgo = getRelativeTime(notification.timestamp);
  const isIncident = notification.source === "incident";
  const isStatusChange = !!notification.oldStatus;

  const capitalize = (str) =>
    str ? str.replace(/\b\w/g, (c) => c.toUpperCase()) : str;

  return (
    <div
      onClick={() => onMarkAsRead(notification.id)}
      className={`p-3 sm:p-4 border-b ${isDark ? "border-slate-700 hover:bg-slate-200 hover:text-slate-800" : "border-slate-100 hover:bg-slate-50"} transition-colors cursor-pointer group ${
        !notification.read
          ? isDark
            ? "bg-slate-700/50"
            : "bg-blue-50/50"
          : ""
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1 flex-wrap">
            <span
              className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-600"} font-kumbh uppercase`}
            >
              {isIncident ? "Incident" : "Complaint"}
            </span>
            <span
              className={`${statusColor} text-white text-xs font-semibold px-2 py-0.5 rounded-full font-kumbh`}
            >
              {statusLabel}
            </span>
            {isStatusChange && (
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full font-kumbh ${isDark ? "bg-slate-600 text-slate-300" : "bg-slate-200 text-slate-600"}`}
              >
                {capitalize(notification.oldStatus)} → {capitalize(notification.newStatus)}
              </span>
            )}
          </div>
          <p
            className={`font-semibold text-sm ${isDark ? "text-slate-100" : "text-slate-900"} font-kumbh mb-1`}
          >
            {notification.type}
          </p>
          <p
            className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"} font-kumbh line-clamp-2`}
          >
            {notification.description || "No description provided"}
          </p>
        </div>
      </div>
      <p
        className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"} font-kumbh mt-2`}
      >
        {timeAgo}{notification.reportedBy ? ` · Reported by ${notification.reportedBy}` : ""}
      </p>
    </div>
  );
});

// ── Header ──────────────────────────────────────────────────────────────
const Header = ({ currentTheme, onThemeChange }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, tr } = useLanguage();
  const isSubSystem2Route = location.pathname.startsWith("/sub-system-2") || location.pathname.startsWith("/incident-complaint");

  // Real-time notifications — merge admin and user contexts
  const adminRT = useRealTime();
  const userRT = useUserRealTime();
  const isAdminUser = isAdmin();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    isAdminUser ? adminRT : userRT;

  const user = getUser();
  const userName = user?.name || "User";
  const userEmail = user?.email || "";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const t = themeTokens[currentTheme];
  const isDark = currentTheme === "dark";

  // ── Notification sound on new unread items ────────────────────────────
  const prevUnreadRef = useRef(unreadCount);

  useEffect(() => {
    if (unreadCount > prevUnreadRef.current) {
      playNotificationSound();
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount]);

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsSettingsOpen(false);
    setIsProfileOpen(false);
  };

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
    setIsNotificationOpen(false);
    setIsProfileOpen(false);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsNotificationOpen(false);
    setIsSettingsOpen(false);
  };

  const openThemeModal = () => {
    setIsThemeModalOpen(true);
    setIsSettingsOpen(false);
  };

  const openLogoutModal = () => {
    setIsLogoutModalOpen(true);
    setIsProfileOpen(false);
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
    } catch {
      // Even if the API call fails, still clear local auth and redirect
    } finally {
      setLogoutLoading(false);
      setIsLogoutModalOpen(false);
      navigate("/login", { replace: true });
    }
  };

  const handleMarkAsRead = useCallback(
    (id) => {
      markAsRead(id);
    },
    [markAsRead],
  );

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  return (
    <>
      <header className={`${t.cardBg} border-b ${t.cardBorder} shadow-sm`}>
        <div className="container mx-auto px-4 sm:px-6 py-2 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img
                src={logo}
                alt="Barangay Gulod Logo"
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-full shadow-lg object-cover"
              />
              <div className="hidden sm:block">
                <h1
                  className={`font-spartan text-lg sm:text-xl font-bold ${t.cardText}`}
                >
                  Barangay Gulod
                </h1>
                <p className={`text-xs ${t.subtleText} font-kumbh`}>
                  {isSubSystem2Route
                    ? "Document Services"
                    : tr.header.incidentReporting}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 sm:space-x-3 relative">
              {/* Notification */}
              <div className="relative">
                <button
                  onClick={toggleNotifications}
                  className={`p-2 sm:p-2.5 ${t.subtleText} ${isDark ? "hover:text-slate-800 hover:bg-slate-200" : "hover:text-slate-800 hover:bg-slate-100"} rounded-full transition-all relative`}
                  title="Notifications"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {isNotificationOpen && (
                  <div
                    className={`fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-[4.5rem] sm:top-full mt-0 sm:mt-2 w-auto sm:w-96 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"} rounded-xl shadow-2xl border z-50 overflow-hidden animate-slideDown max-h-[80vh] sm:max-h-[600px]`}
                  >
                    <div
                      className={`bg-gradient-to-r ${t.primaryGrad} px-4 sm:px-5 py-3 sm:py-4`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-bold text-base sm:text-lg font-spartan">
                          {tr.header.reportUpdates}
                        </h3>
                        <span className="bg-white/20 text-white text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-kumbh">
                          {unreadCount} {tr.header.active}
                        </span>
                      </div>
                    </div>

                    <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 15).map((notification) => (
                          <NotificationItem
                            key={notification.id}
                            notification={notification}
                            isDark={isDark}
                            onMarkAsRead={handleMarkAsRead}
                          />
                        ))
                      ) : (
                        <div
                          className={`p-8 text-center ${t.subtleText}`}
                        >
                          <svg
                            className="w-12 h-12 mx-auto mb-3 opacity-30"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            />
                          </svg>
                          <p className="text-sm font-kumbh">
                            No notifications yet
                          </p>
                          <p className="text-xs mt-1 font-kumbh opacity-60">
                            New reports will appear here in real-time
                          </p>
                        </div>
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <div
                        className={`p-3 sm:p-4 border-t ${isDark ? "border-slate-700 bg-slate-800/50" : "border-slate-100 bg-slate-50"}`}
                      >
                        <button
                          onClick={handleMarkAllAsRead}
                          className={`w-full text-center text-sm font-semibold ${t.primaryText} hover:opacity-80 transition-opacity font-kumbh`}
                        >
                          Mark All as Read
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Settings */}
              <div className="relative">
                <button
                  onClick={toggleSettings}
                  className={`p-2 sm:p-2.5 ${t.subtleText} ${isDark ? "hover:text-slate-800 hover:bg-slate-200" : "hover:text-slate-800 hover:bg-slate-100"} rounded-full transition-all`}
                  title="Settings"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>

                {isSettingsOpen && (
                  <div
                    className={`fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-[4.5rem] sm:top-full mt-0 sm:mt-2 w-auto sm:w-64 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"} rounded-xl shadow-2xl border z-50 overflow-hidden animate-slideDown`}
                  >
                    <div className="p-2">
                      <button
                        onClick={openThemeModal}
                        className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 ${isDark ? "hover:bg-slate-200 hover:text-slate-800 text-slate-200" : "hover:bg-slate-50 text-slate-700"} rounded-lg transition-colors group`}
                      >
                        <svg
                          className="w-5 h-5 text-blue-500 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                          />
                        </svg>
                        <span className="font-semibold text-sm font-kumbh">
                          {tr.header.changeTheme}
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setLanguage(language === "en" ? "tl" : "en");
                          setIsSettingsOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 ${isDark ? "hover:bg-slate-200 hover:text-slate-800 text-slate-200" : "hover:bg-slate-50 text-slate-700"} rounded-lg transition-colors group`}
                      >
                        <svg
                          className="w-5 h-5 text-amber-500 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                          />
                        </svg>
                        <div className="flex-1 flex items-center justify-between">
                          <span className="font-semibold text-sm font-kumbh">
                            {tr.header.language}
                          </span>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${isDark ? "bg-slate-600 text-slate-300" : "bg-slate-100 text-slate-600"} font-kumbh`}
                          >
                            {language === "en" ? "EN" : "TL"}
                          </span>
                        </div>
                      </button>
                      <button
                        className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 ${isDark ? "hover:bg-slate-200 hover:text-slate-800 text-slate-200" : "hover:bg-slate-50 text-slate-700"} rounded-lg transition-colors group`}
                      >
                        <svg
                          className="w-5 h-5 text-green-500 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                        <span className="font-semibold text-sm font-kumbh">
                          {tr.header.privacySettings}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={toggleProfile}
                  className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full ${isDark ? "hover:bg-slate-200" : "hover:bg-slate-100"} transition-all`}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br ${t.primaryGrad} rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm`}
                  >
                    {userInitials}
                  </div>
                  <svg
                    className={`w-3 h-3 sm:w-4 sm:h-4 ${t.subtleText} hidden sm:block`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isProfileOpen && (
                  <div
                    className={`fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-[4.5rem] sm:top-full mt-0 sm:mt-2 w-auto sm:w-64 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"} rounded-xl shadow-2xl border z-50 overflow-hidden animate-slideDown`}
                  >
                    <div
                      className={`px-3 sm:px-4 py-3 sm:py-4 border-b ${isDark ? "border-slate-700" : "border-slate-100"}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${t.primaryGrad} rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0`}
                        >
                          {userInitials}
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`font-semibold text-sm ${isDark ? "text-slate-100" : "text-slate-900"} font-kumbh truncate`}
                          >
                            {userName}
                          </p>
                          <p
                            className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"} font-kumbh truncate`}
                          >
                            {userEmail}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <button
                        className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 ${isDark ? "hover:bg-slate-200 hover:text-slate-800 text-slate-200" : "hover:bg-slate-50 text-slate-700"} rounded-lg transition-colors`}
                      >
                        <svg
                          className="w-5 h-5 text-blue-500 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span className="font-semibold text-sm font-kumbh">
                          {tr.header.viewProfile}
                        </span>
                      </button>
                      <button
                        onClick={openLogoutModal}
                        className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 ${isDark ? "hover:bg-slate-200 hover:text-slate-800 text-slate-200" : "hover:bg-slate-50 text-slate-700"} rounded-lg transition-colors`}
                      >
                        <svg
                          className="w-5 h-5 text-red-500 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        <span className="font-semibold text-sm font-kumbh">
                          {tr.header.logout}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={currentTheme}
        onThemeChange={onThemeChange}
      />

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        loading={logoutLoading}
        currentTheme={currentTheme}
      />

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default Header;
