import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import themeTokens from "../Themetokens";

// ── Nav link definitions ────────────────────────────────────────────────────
const NAV_LINKS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1m-2 0h2",
    path: "/",
  },
  {
    id: "reports",
    label: "Reports",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    path: "/reports",
    subLinks: [
      {
        id: "incident-report",
        label: "Incident Report",
        path: "/reports",
      },
      {
        id: "case-management",
        label: "Case Management",
        path: "/reports/case-management",
      },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    path: "/analytics",
  },
  {
    id: "team",
    label: "Team",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    path: "/team",
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
  const [expandedLink, setExpandedLink] = useState("reports");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLinkClick = (link) => {
    if (link.subLinks) {
      // If it has sublinks, toggle expansion and navigate to main path
      setExpandedLink(expandedLink === link.id ? null : link.id);
      navigate(link.path);
    } else {
      // Navigate normally
      navigate(link.path);
    }
    // Close mobile menu after navigation
    setIsMobileMenuOpen(false);
  };

  const handleSubLinkClick = (e, subLink) => {
    e.stopPropagation();
    navigate(subLink.path);
    // Close mobile menu after navigation
    setIsMobileMenuOpen(false);
  };

  const isLinkActive = (link) => {
    if (link.subLinks) {
      return link.subLinks.some((sub) => location.pathname === sub.path);
    }
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
              const isExpanded = expandedLink === link.id;

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

                    {/* Expand arrow for links with sublinks */}
                    {link.subLinks && !collapsed && (
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
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
                    )}
                  </button>

                  {/* Sub-links */}
                  {link.subLinks && isExpanded && !collapsed && (
                    <ul className="ml-8 mt-1 space-y-0.5">
                      {link.subLinks.map((subLink) => {
                        const isSubActive = location.pathname === subLink.path;
                        return (
                          <li key={subLink.id}>
                            <button
                              onClick={(e) => handleSubLinkClick(e, subLink)}
                              className={`
                                w-full flex items-center gap-2 px-3 py-2 rounded-lg
                                text-sm font-kumbh transition-all duration-150 text-left
                                ${
                                  isSubActive
                                    ? `${t.sidebarActiveText} font-semibold`
                                    : `${t.sidebarText} ${t.sidebarHoverBg}`
                                }
                              `}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSubActive
                                    ? t.sidebarActiveBorder.replace(
                                        "border-l-",
                                        "bg-",
                                      )
                                    : "bg-slate-400"
                                }`}
                              />
                              {subLink.label}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
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
