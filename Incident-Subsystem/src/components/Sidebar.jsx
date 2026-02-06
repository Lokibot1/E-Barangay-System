import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import themeTokens from "../Themetokens";

// ── Nav link definitions ────────────────────────────────────────────────────
const NAV_LINKS = [
  {
    id: "main",
    label: "Main",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001-1m-6 0h6",
    path: "/",
  },
  {
    id: "file-complaint",
    label: "File a Complaint",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    path: "/file-complaint",
  },
  {
    id: "incident-report",
    label: "Report an Incident",
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    path: "/incident-report",
  },
  {
    id: "incident-map",
    label: "Incident Map",
    icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
    path: "/incident-map",
  },
  {
    id: "case-management",
    label: "Case Management",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    path: "/case-management",
  },
  {
    id: "help",
    label: "Help",
    icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    path: "/help",
  },
];

// ── Sidebar ─────────────────────────────────────────────────────────────────
const Sidebar = ({ currentTheme, collapsed, onToggle }) => {
  const t = themeTokens[currentTheme];
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLinkClick = (link) => {
    navigate(link.path);
    setIsMobileMenuOpen(false);
  };

  const isLinkActive = (link) => {
    return location.pathname === link.path;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`fixed top-3 left-3 z-50 md:hidden p-2 ${t.cardBg} ${t.cardBorder} border rounded-lg shadow-lg`}
      >
        <svg
          className={`w-6 h-6 ${t.cardText}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isMobileMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${t.sidebarBg} border-r ${t.sidebarBorder}
          flex flex-col h-screen
          transition-all duration-300 ease-in-out
          flex-shrink-0
          fixed md:relative
          z-40
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        style={{ width: collapsed ? "72px" : "240px" }}
      >
        {/* ── Logo row ────────────────────────────────────────────────────── */}
        <div
          className={`
            flex items-center gap-3 px-3 py-3.5 border-b ${t.sidebarBorder}
            flex-shrink-0
          `}
        >
          {/* Logo mark — clickable, toggles collapse */}
          <button
            onClick={onToggle}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`w-8 h-8 bg-gradient-to-br ${t.primaryGrad} rounded-lg flex items-center justify-center shadow-md flex-shrink-0 cursor-pointer hover:opacity-80 hover:shadow-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 ${t.primaryRing}`}
          >
            <svg
              className="w-4 h-4 text-white"
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
          </button>

          {/* App name — fades out when collapsed */}
          <div
            className="overflow-hidden transition-all duration-300"
            style={{
              width: collapsed ? "0px" : "160px",
              opacity: collapsed ? 0 : 1,
            }}
          >
            <p
              className={`font-spartan text-sm font-bold ${t.sidebarAppName} whitespace-nowrap truncate`}
            >
              Logo wala pa
            </p>
            <p
              className={`font-kumbh text-xs ${t.sidebarText} whitespace-nowrap truncate`}
            >
              Incident Reporting
            </p>
          </div>
        </div>

        {/* ── Nav links ───────────────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <ul className="flex flex-col gap-0.5">
            {NAV_LINKS.map((link) => {
              const isActive = isLinkActive(link);

              return (
                <li key={link.id}>
                  <button
                    onClick={() => handleLinkClick(link)}
                    title={collapsed ? link.label : undefined}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-all duration-150 text-left
                      border-l-[3px]

                      ${
                        isActive
                          ? `${t.sidebarActiveBg} ${t.sidebarActiveText} ${t.sidebarActiveBorder}`
                          : `border-transparent ${t.sidebarText} ${t.sidebarHoverBg}`
                      }
                    `}
                  >
                    {/* Icon */}
                    <svg
                      className={`w-5 h-5 flex-shrink-0 transition-colors duration-150 ${
                        isActive ? t.sidebarIconActive : "text-current"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={link.icon}
                      />
                    </svg>

                    {/* Label — slides out when collapsed */}
                    <span
                      className="font-kumbh text-sm font-medium whitespace-nowrap truncate transition-all duration-300 flex-1"
                      style={{
                        width: collapsed ? "0px" : "120px",
                        opacity: collapsed ? 0 : 1,
                      }}
                    >
                      {link.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
