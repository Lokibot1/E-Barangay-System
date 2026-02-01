import React, { useState } from "react";
import ThemeModal from "./modals/ThemeModal";
import themeTokens from "../Themetokens";

const Header = ({ currentTheme, onThemeChange }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  const t = themeTokens[currentTheme];
  const isDark = currentTheme === "dark";

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

  // Mock notification data
  const notifications = [
    {
      id: 1,
      reportId: "INC-2025-0127",
      type: "Workplace Injury",
      status: "Pending",
      statusColor: "bg-amber-500",
      progressColor: "bg-amber-500",
      progressSteps: 1,
      timestamp: "2 hours ago",
      description: "Slip and fall incident in warehouse",
    },
    {
      id: 2,
      reportId: "INC-2025-0125",
      type: "Equipment Damage",
      status: "On Going",
      statusColor: "bg-blue-500",
      progressColor: "bg-blue-500",
      progressSteps: 2,
      timestamp: "1 day ago",
      description: "Forklift collision with storage rack",
    },
    {
      id: 3,
      reportId: "INC-2025-0123",
      type: "Safety Hazard",
      status: "Resolved",
      statusColor: "bg-green-500",
      progressColor: "bg-green-500",
      progressSteps: 3,
      timestamp: "3 days ago",
      description: "Exposed electrical wiring in break room",
    },
    {
      id: 4,
      reportId: "INC-2025-0120",
      type: "Near Miss",
      status: "Pending",
      statusColor: "bg-amber-500",
      progressColor: "bg-amber-500",
      progressSteps: 1,
      timestamp: "5 days ago",
      description: "Close call with overhead crane",
    },
  ];

  const unreadCount = notifications.filter(
    (n) => n.status !== "Resolved",
  ).length;

  return (
    <>
      <header className={`${t.cardBg} border-b ${t.cardBorder} shadow-sm`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 bg-gradient-to-br ${t.primaryGrad} rounded-lg flex items-center justify-center shadow-lg`}
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className={`font-spartan text-xl font-bold ${t.cardText}`}>
                  Logo wala pa
                </h1>
                <p className={`text-xs ${t.subtleText} font-kumbh`}>
                  Incident Reporting System
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 relative">
              {/* Notification */}
              <div className="relative">
                <button
                  onClick={toggleNotifications}
                  className={`p-2.5 ${t.subtleText} ${isDark ? "hover:text-slate-200 hover:bg-slate-700" : "hover:text-slate-800 hover:bg-slate-100"} rounded-full transition-all relative`}
                  title="Notifications"
                >
                  <svg
                    className="w-5 h-5"
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
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {isNotificationOpen && (
                  <div
                    className={`absolute right-0 top-full mt-2 w-96 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"} rounded-xl shadow-2xl border z-50 overflow-hidden animate-slideDown`}
                  >
                    <div
                      className={`bg-gradient-to-r ${t.primaryGrad} px-5 py-4`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-bold text-lg font-spartan">
                          Report Updates
                        </h3>
                        <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full font-kumbh">
                          {unreadCount} Active
                        </span>
                      </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b ${isDark ? "border-slate-700 hover:bg-slate-700/40" : "border-slate-100 hover:bg-slate-50"} transition-colors cursor-pointer group`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span
                                  className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-600"} font-kumbh`}
                                >
                                  {notification.reportId}
                                </span>
                                <span
                                  className={`${notification.statusColor} text-white text-xs font-semibold px-2 py-0.5 rounded-full font-kumbh`}
                                >
                                  {notification.status}
                                </span>
                              </div>
                              <p
                                className={`font-semibold text-sm ${isDark ? "text-slate-100" : "text-slate-900"} font-kumbh`}
                              >
                                {notification.type}
                              </p>
                              <p
                                className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"} mt-1 font-kumbh`}
                              >
                                {notification.description}
                              </p>
                            </div>
                            <svg
                              className={`w-4 h-4 ${isDark ? "text-slate-600" : "text-slate-400"} group-hover:text-blue-500 transition-colors flex-shrink-0 ml-2`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>

                          {/* Progress */}
                          <div className="flex items-center space-x-2 mt-3">
                            <div className="flex-1 flex space-x-1">
                              {[1, 2, 3].map((step) => (
                                <div
                                  key={step}
                                  className={`h-1.5 flex-1 rounded-full ${
                                    step <= notification.progressSteps
                                      ? notification.progressColor
                                      : isDark
                                        ? "bg-slate-700"
                                        : "bg-slate-200"
                                  } transition-all`}
                                />
                              ))}
                            </div>
                            <span
                              className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"} font-kumbh`}
                            >
                              {notification.timestamp}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div
                      className={`${isDark ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-100"} px-4 py-3 border-t`}
                    >
                      <button
                        className={`w-full text-center text-sm font-semibold ${t.primaryText} hover:opacity-80 transition-opacity font-kumbh`}
                      >
                        View All Reports
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Settings */}
              <div className="relative">
                <button
                  onClick={toggleSettings}
                  className={`p-2.5 ${t.subtleText} ${isDark ? "hover:text-slate-200 hover:bg-slate-700" : "hover:text-slate-800 hover:bg-slate-100"} rounded-full transition-all`}
                  title="Settings"
                >
                  <svg
                    className="w-5 h-5"
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
                    className={`absolute right-0 top-full mt-2 w-64 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"} rounded-xl shadow-2xl border z-50 overflow-hidden animate-slideDown`}
                  >
                    <div className="p-2">
                      <button
                        onClick={openThemeModal}
                        className={`w-full flex items-center space-x-3 px-4 py-3 ${isDark ? "hover:bg-slate-700 text-slate-200" : "hover:bg-slate-50 text-slate-700"} rounded-lg transition-colors group`}
                      >
                        <svg
                          className="w-5 h-5 text-blue-500"
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
                          Change Theme
                        </span>
                      </button>
                      <button
                        className={`w-full flex items-center space-x-3 px-4 py-3 ${isDark ? "hover:bg-slate-700 text-slate-200" : "hover:bg-slate-50 text-slate-700"} rounded-lg transition-colors group`}
                      >
                        <svg
                          className="w-5 h-5 text-green-500"
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
                          Privacy Settings
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
                  className={`flex items-center space-x-2 px-3 py-2 rounded-full ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-100"} transition-all`}
                >
                  <div
                    className={`w-8 h-8 bg-gradient-to-br ${t.primaryGrad} rounded-full flex items-center justify-center text-white font-bold text-sm`}
                  >
                    JD
                  </div>
                  <svg
                    className={`w-4 h-4 ${t.subtleText}`}
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
                    className={`absolute right-0 top-full mt-2 w-64 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"} rounded-xl shadow-2xl border z-50 overflow-hidden animate-slideDown`}
                  >
                    <div
                      className={`px-4 py-4 border-b ${isDark ? "border-slate-700" : "border-slate-100"}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-12 h-12 bg-gradient-to-br ${t.primaryGrad} rounded-full flex items-center justify-center text-white font-bold text-lg`}
                        >
                          JD
                        </div>
                        <div>
                          <p
                            className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-900"} font-kumbh`}
                          >
                            John Doe
                          </p>
                          <p
                            className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"} font-kumbh`}
                          >
                            john.doe@company.com
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <button
                        className={`w-full flex items-center space-x-3 px-4 py-3 ${isDark ? "hover:bg-slate-700 text-slate-200" : "hover:bg-slate-50 text-slate-700"} rounded-lg transition-colors`}
                      >
                        <svg
                          className="w-5 h-5 text-blue-500"
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
                          View Profile
                        </span>
                      </button>
                      <button
                        className={`w-full flex items-center space-x-3 px-4 py-3 ${isDark ? "hover:bg-slate-700 text-slate-200" : "hover:bg-slate-50 text-slate-700"} rounded-lg transition-colors`}
                      >
                        <svg
                          className="w-5 h-5 text-red-500"
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
                          Logout
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
