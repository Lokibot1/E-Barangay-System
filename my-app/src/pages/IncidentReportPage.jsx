import React, { useState } from "react";
import IncidentReportModal from "../components/modals/IncidentReportModal";
import ThemeModal from "../components/modals/ThemeModal";
import Sidebar from "../components/Sidebar";
import themeTokens from "../Themetokens";

const IncidentReportPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // ── Sidebar collapse ──────────────────────────────────────
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ── Persistence: read from localStorage on first render ──────
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem("appTheme") || "blue";
  });

  const t = themeTokens[currentTheme]; // shorthand used everywhere below
  const isDark = currentTheme === "dark";

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
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

  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
    localStorage.setItem("appTheme", theme);
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
    <div className={`h-screen ${t.pageBg} flex overflow-hidden`}>
      {/* Sidebar */}
      <Sidebar
        currentTheme={currentTheme}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />
      {/* Page content — header + main stack vertically, fills remaining width */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden">
        {/* Header */}
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
                  <h1
                    className={`font-spartan text-xl font-bold ${t.cardText}`}
                  >
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
                                    className={`font-bold ${isDark ? "text-slate-100" : "text-slate-800"} text-sm font-spartan`}
                                  >
                                    {notification.reportId}
                                  </span>
                                  <span
                                    className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${notification.statusColor} font-kumbh`}
                                  >
                                    {notification.status}
                                  </span>
                                </div>
                                <p
                                  className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"} font-kumbh mb-1`}
                                >
                                  {notification.type}
                                </p>
                                <p
                                  className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"} font-kumbh`}
                                >
                                  {notification.description}
                                </p>
                              </div>
                            </div>

                            {/* Progress Steps */}
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-2">
                                <span
                                  className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"} font-semibold font-kumbh`}
                                >
                                  Status Progress
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                {[1, 2, 3].map((step, idx) => (
                                  <React.Fragment key={step}>
                                    <div className="flex-1 flex flex-col items-center">
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                          notification.progressSteps >= step
                                            ? notification.statusColor +
                                              " text-white"
                                            : isDark
                                              ? "bg-slate-600 text-slate-400"
                                              : "bg-slate-200 text-slate-400"
                                        } transition-all duration-300`}
                                      >
                                        {notification.progressSteps >= step ? (
                                          <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M5 13l4 4L19 7"
                                            />
                                          </svg>
                                        ) : (
                                          <span className="text-xs font-bold">
                                            {step}
                                          </span>
                                        )}
                                      </div>
                                      <span
                                        className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-600"} mt-1 font-kumbh text-center`}
                                      >
                                        {
                                          ["Pending", "On Going", "Resolved"][
                                            idx
                                          ]
                                        }
                                      </span>
                                    </div>
                                    {idx < 2 && (
                                      <div
                                        className={`flex-1 h-1 rounded-full ${
                                          notification.progressSteps >= step + 1
                                            ? notification.progressColor
                                            : isDark
                                              ? "bg-slate-600"
                                              : "bg-slate-200"
                                        } transition-all duration-300`}
                                      />
                                    )}
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-3">
                              <span
                                className={`text-xs ${isDark ? "text-slate-600" : "text-slate-400"} font-kumbh`}
                              >
                                {notification.timestamp}
                              </span>
                              <button
                                className={`text-xs ${t.primaryText} hover:opacity-80 font-semibold font-kumbh opacity-0 group-hover:opacity-100 transition-opacity`}
                              >
                                View Details →
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div
                        className={`${isDark ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200"} px-5 py-3 text-center border-t`}
                      >
                        <button
                          className={`text-sm ${t.primaryText} hover:opacity-80 font-semibold font-kumbh transition-colors`}
                        >
                          View All Reports
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Settings */}
                <button
                  className={`p-2.5 ${t.subtleText} ${isDark ? "hover:text-slate-200 hover:bg-slate-700" : "hover:text-slate-800 hover:bg-slate-100"} rounded-full transition-all`}
                  title="Settings"
                  onClick={toggleSettings}
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

                {/* Settings Dropdown */}
                {isSettingsOpen && (
                  <div
                    className={`absolute right-0 top-full mt-2 w-72 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"} rounded-xl shadow-2xl border z-50 overflow-hidden animate-slideDown`}
                  >
                    <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-5 py-4">
                      <h3 className="text-white font-bold text-lg font-spartan">
                        Settings
                      </h3>
                    </div>
                    <div className="py-2">
                      {[
                        {
                          icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
                          label: "Account Settings",
                          sub: "Manage your account",
                          badgeBg: "bg-blue-100",
                          badgeBgDark: "bg-blue-900/40",
                          badgeIcon: "text-blue-600",
                          badgeIconDark: "text-blue-400",
                        },
                        {
                          icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
                          label: "Notifications",
                          sub: "Configure alerts",
                          badgeBg: "bg-indigo-100",
                          badgeBgDark: "bg-indigo-900/40",
                          badgeIcon: "text-indigo-600",
                          badgeIconDark: "text-indigo-400",
                        },
                        {
                          icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
                          label: "Privacy & Security",
                          sub: "Control your data",
                          badgeBg: "bg-green-100",
                          badgeBgDark: "bg-green-900/40",
                          badgeIcon: "text-green-600",
                          badgeIconDark: "text-green-400",
                        },
                      ].map((item) => (
                        <button
                          key={item.label}
                          className={`w-full px-5 py-3 flex items-center space-x-3 ${isDark ? "hover:bg-slate-700/40" : "hover:bg-slate-50"} transition-colors group`}
                        >
                          <div
                            className={`w-8 h-8 ${isDark ? item.badgeBgDark : item.badgeBg} rounded-lg flex items-center justify-center transition-colors`}
                          >
                            <svg
                              className={`w-4 h-4 ${isDark ? item.badgeIconDark : item.badgeIcon}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d={item.icon}
                              />
                            </svg>
                          </div>
                          <div className="flex-1 text-left">
                            <p
                              className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-800"} font-kumbh`}
                            >
                              {item.label}
                            </p>
                            <p
                              className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"} font-kumbh`}
                            >
                              {item.sub}
                            </p>
                          </div>
                        </button>
                      ))}

                      {/* Appearance — themed */}
                      <button
                        onClick={openThemeModal}
                        className={`w-full px-5 py-3 flex items-center space-x-3 ${isDark ? "hover:bg-slate-700/40" : "hover:bg-slate-50"} transition-colors group`}
                      >
                        <div
                          className={`w-8 h-8 ${isDark ? "bg-amber-900/40" : "bg-amber-100"} rounded-lg flex items-center justify-center transition-colors`}
                        >
                          <svg
                            className={`w-4 h-4 ${isDark ? "text-amber-400" : "text-amber-600"}`}
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
                        </div>
                        <div className="flex-1 text-left">
                          <p
                            className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-800"} font-kumbh`}
                          >
                            Appearance
                          </p>
                          <p
                            className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"} font-kumbh`}
                          >
                            Theme and display
                          </p>
                        </div>
                      </button>

                      <div
                        className={`border-t ${isDark ? "border-slate-700" : "border-slate-200"} my-2`}
                      />

                      <button
                        className={`w-full px-5 py-3 flex items-center space-x-3 ${isDark ? "hover:bg-slate-700/40" : "hover:bg-slate-50"} transition-colors group`}
                      >
                        <div
                          className={`w-8 h-8 ${isDark ? "bg-slate-700" : "bg-slate-100"} rounded-lg flex items-center justify-center transition-colors`}
                        >
                          <svg
                            className={`w-4 h-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 text-left">
                          <p
                            className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-800"} font-kumbh`}
                          >
                            Help & Support
                          </p>
                          <p
                            className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"} font-kumbh`}
                          >
                            Get assistance
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Profile */}
                <div className="relative">
                  <button
                    className={`p-2.5 ${t.subtleText} ${isDark ? "hover:text-slate-200 hover:bg-slate-700" : "hover:text-slate-800 hover:bg-slate-100"} rounded-full transition-all`}
                    title="Profile"
                    onClick={toggleProfile}
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </button>

                  {isProfileOpen && (
                    <div
                      className={`absolute right-0 top-full mt-2 w-80 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"} rounded-xl shadow-2xl border z-50 overflow-hidden animate-slideDown`}
                    >
                      <div
                        className={`bg-gradient-to-r ${t.primaryGrad} px-5 py-6`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <span
                              className={`text-2xl font-bold ${t.primaryText} font-spartan`}
                            >
                              JD
                            </span>
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-lg font-spartan">
                              John Doe
                            </h3>
                            <p className="text-white/70 text-sm font-kumbh">
                              john.doe@company.com
                            </p>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 text-white text-xs font-semibold rounded-full font-kumbh">
                              Safety Officer
                            </span>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`grid grid-cols-3 gap-3 p-4 ${isDark ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200"} border-b`}
                      >
                        {[
                          {
                            val: "12",
                            label: "Reports",
                            color: "text-blue-600",
                            colorDark: "text-blue-400",
                          },
                          {
                            val: "8",
                            label: "Resolved",
                            color: "text-green-600",
                            colorDark: "text-green-400",
                          },
                          {
                            val: "4",
                            label: "Pending",
                            color: "text-amber-600",
                            colorDark: "text-amber-400",
                          },
                        ].map((s) => (
                          <div key={s.label} className="text-center">
                            <div
                              className={`text-xl font-bold ${isDark ? s.colorDark : s.color} font-spartan`}
                            >
                              {s.val}
                            </div>
                            <div
                              className={`text-xs ${isDark ? "text-slate-500" : "text-slate-600"} font-kumbh`}
                            >
                              {s.label}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="py-2">
                        {[
                          {
                            icon: "M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                            label: "View Profile",
                            badgeBg: "bg-blue-100",
                            badgeBgDark: "bg-blue-900/40",
                            badgeIcon: "text-blue-600",
                            badgeIconDark: "text-blue-400",
                          },
                          {
                            icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
                            label: "My Reports",
                            badgeBg: "bg-indigo-100",
                            badgeBgDark: "bg-indigo-900/40",
                            badgeIcon: "text-indigo-600",
                            badgeIconDark: "text-indigo-400",
                          },
                          {
                            icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                            label: "Dashboard",
                            badgeBg: "bg-green-100",
                            badgeBgDark: "bg-green-900/40",
                            badgeIcon: "text-green-600",
                            badgeIconDark: "text-green-400",
                          },
                        ].map((item) => (
                          <button
                            key={item.label}
                            className={`w-full px-5 py-3 flex items-center space-x-3 ${isDark ? "hover:bg-slate-700/40" : "hover:bg-slate-50"} transition-colors group`}
                          >
                            <div
                              className={`w-8 h-8 ${isDark ? item.badgeBgDark : item.badgeBg} rounded-lg flex items-center justify-center transition-colors`}
                            >
                              <svg
                                className={`w-4 h-4 ${isDark ? item.badgeIconDark : item.badgeIcon}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d={item.icon}
                                />
                              </svg>
                            </div>
                            <div className="flex-1 text-left">
                              <p
                                className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-800"} font-kumbh`}
                              >
                                {item.label}
                              </p>
                            </div>
                            <svg
                              className={`w-4 h-4 ${isDark ? "text-slate-600" : "text-slate-400"}`}
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
                          </button>
                        ))}

                        <div
                          className={`border-t ${isDark ? "border-slate-700" : "border-slate-200"} my-2`}
                        />

                        <button
                          className={`w-full px-5 py-3 flex items-center space-x-3 ${isDark ? "hover:bg-red-900/20" : "hover:bg-red-50"} transition-colors group`}
                        >
                          <div
                            className={`w-8 h-8 ${isDark ? "bg-red-900/40" : "bg-red-100"} rounded-lg flex items-center justify-center transition-colors`}
                          >
                            <svg
                              className={`w-4 h-4 ${isDark ? "text-red-400" : "text-red-600"}`}
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
                          </div>
                          <div className="flex-1 text-left">
                            <p
                              className={`text-sm font-semibold ${isDark ? "text-red-400" : "text-red-600"} font-kumbh`}
                            >
                              Sign Out
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Help */}
                <button
                  className={`p-2.5 ${t.subtleText} ${isDark ? "hover:text-slate-200 hover:bg-slate-700" : "hover:text-slate-800 hover:bg-slate-100"} rounded-full transition-all`}
                  title="Help"
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
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Overlay */}
        {(isNotificationOpen || isSettingsOpen || isProfileOpen) && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsNotificationOpen(false);
              setIsSettingsOpen(false);
              setIsProfileOpen(false);
            }}
          />
        )}

        {/* Main */}
        <main className="container mx-auto px-6 py-12">
          {/* Hero */}
          <div className="text-center mb-12 animate-fadeIn">
            <div className="inline-block mb-4">
              <div
                className={`w-20 h-20 bg-gradient-to-br ${t.primaryGrad} rounded-2xl flex items-center justify-center shadow-xl mx-auto transform rotate-3`}
              >
                <svg
                  className="w-10 h-10 text-white -rotate-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            <h1
              className={`text-6xl font-bold ${t.cardText} mb-4 tracking-tight font-spartan`}
            >
              Incident Report
            </h1>
            <p
              className={`text-xl ${t.subtleText} mb-8 max-w-2xl mx-auto font-kumbh`}
            >
              Report workplace incidents quickly and securely. Your safety is
              our priority.
            </p>

            <button
              onClick={openModal}
              className={`font-kumbh group inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r ${t.primaryGrad} text-white text-lg font-semibold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}
            >
              <svg
                className="w-6 h-6 transition-transform group-hover:rotate-90 duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Report New Incident</span>
            </button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16">
            {[
              {
                delay: "0s",
                iconBg: "from-blue-100 to-blue-200",
                iconColor: "text-blue-600",
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
                title: "Fast & Easy",
                desc: "Submit reports in minutes with our simple multi-step form",
              },
              {
                delay: "0.1s",
                iconBg: "from-indigo-100 to-indigo-200",
                iconColor: "text-indigo-600",
                icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
                title: "Secure",
                desc: "All reports are encrypted and handled confidentially",
              },
              {
                delay: "0.2s",
                iconBg: "from-green-100 to-green-200",
                iconColor: "text-green-600",
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                title: "Track Status",
                desc: "Monitor your reports and receive updates in real-time",
              },
            ].map((card) => (
              <div
                key={card.title}
                className={`${t.cardBg} rounded-2xl p-6 shadow-lg border ${t.cardBorder} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-slideUp`}
                style={{ animationDelay: card.delay }}
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${card.iconBg} rounded-xl flex items-center justify-center mb-4`}
                >
                  <svg
                    className={`w-6 h-6 ${card.iconColor}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={card.icon}
                    />
                  </svg>
                </div>
                <h3
                  className={`text-2xl font-bold ${t.cardText} mb-2 font-spartan`}
                >
                  {card.title}
                </h3>
                <p className={`${t.subtleText} font-kumbh`}>{card.desc}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div
            className={`mt-20 ${t.cardBg} rounded-2xl shadow-lg border ${t.cardBorder} p-8`}
          >
            <h2
              className={`text-3xl font-bold text-center ${t.cardText} mb-8 font-spartan`}
            >
              Our Impact
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                {
                  val: "1,234",
                  label: "Reports Filed",
                  color: "text-blue-600",
                },
                { val: "95%", label: "Resolved", color: "text-green-600" },
                { val: "24h", label: "Avg Response", color: "text-indigo-600" },
                { val: "100%", label: "Confidential", color: "text-amber-600" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div
                    className={`text-4xl font-bold ${s.color} mb-2 font-spartan`}
                  >
                    {s.val}
                  </div>
                  <div className={`${t.subtleText} text-sm font-kumbh`}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Help */}
          <div className="mt-12 text-center font-kumbh">
            <p className={t.subtleText}>
              Need help? Contact the safety team at{" "}
              <a
                href="mailto:safety@company.com"
                className={`${t.primaryText} hover:opacity-80 underline font-medium`}
              >
                safety@company.com
              </a>
            </p>
          </div>
        </main>
      </div>{" "}
      {/* end flex-1 content column */}
      {/* Modals — both receive the theme id */}
      <IncidentReportModal
        isOpen={isModalOpen}
        onClose={closeModal}
        currentTheme={currentTheme}
      />
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
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
    </div>
  );
};

export default IncidentReportPage;
