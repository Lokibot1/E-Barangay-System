import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { isAdmin } from "../../services/sub-system-3/loginService";
import { useLanguage } from "../../context/LanguageContext";
import themeTokens from "../../Themetokens";
import logo from "../../assets/images/logo.jpg";

const documentServiceChildren = [
  {
    id: "request-barangay-id",
    label: "Request Barangay ID",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    path: "/sub-system-2/req-bid",
  },
  {
    id: "request-indigency",
    label: "Request Certificate of Indigency",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    path: "/sub-system-2/req-coi",
  },
  {
    id: "request-residency",
    label: "Request Certificate of Residency",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    path: "/sub-system-2/req-cor",
  },
];

// ── Nav structure factories (labels come from translations) ─────────────────
const getUserNavItems = (s) => [
  {
    id: "main",
    label: s.main,
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001-1m-6 0h6",
    path: "/",
  },
  {
    id: "subsystem-1",
    label: s.subsystem1,
    icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
  },
  {
    id: "subsystem-2",
    label: s.subsystem2,
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    path: "/sub-system-2",
  },
  {
    id: "incident-complaint",
    label: s.incidentComplaint,
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    path: "/incident-complaint",
    children: [
      {
        id: "file-complaint",
        label: s.fileComplaint,
        icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
        path: "/incident-complaint/file-complaint",
      },
      {
        id: "incident-report",
        label: s.reportIncident,
        icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
        path: "/incident-complaint/incident-report",
      },
      {
        id: "incident-map",
        label: s.incidentMap,
        icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
        path: "/incident-complaint/incident-map",
      },
      {
        id: "case-management",
        label: s.caseManagement,
        icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
        path: "/incident-complaint/case-management",
      },
    ],
  },
];

const getAdminNavItems = (s) => [
  {
    id: "dashboard",
    label: s.dashboard,
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001-1m-6 0h6",
    path: "/admin",
    badge: "15",
  },
  {
    id: "residents",
    label: s.residents,
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    path: "/admin/residents",
    badge: "15",
  },
  {
    id: "requests",
    label: s.request,
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
    path: "/admin/requests",
    badge: "99+",
  },
  {
    id: "incidents",
    label: s.incidents,
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    path: "/admin/incidents",
    badge: "99+",
  },
  {
    id: "appointments",
    label: s.appointments,
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    path: "/admin/appointments",
    badge: "99+",
  },
  {
    id: "payments",
    label: s.payments,
    icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
    path: "/admin/payments",
    badge: "99+",
  },
  {
    id: "reports",
    label: s.reports,
    icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    path: "/admin/reports",
    badge: "99+",
  },
  {
    id: "documents-inquiry",
    label: s.documentsInquiry || "Issuance Application",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    path: "/admin/documents-inquiry",
    badge: "99+",
  },
  {
    id: "user-management",
    label: s.userManagement,
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    path: "/admin/user-management",
    badge: "99+",
  },
  {
    id: "settings",
    label: s.settings,
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
    path: "/admin/settings",
    badge: "99+",
  },
];

// ── Sidebar ─────────────────────────────────────────────────────────────────
const Sidebar = ({ currentTheme, collapsed, onToggle }) => {
  const t = themeTokens[currentTheme];
  const { tr } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const adminMode = isAdmin();
  const isSubSystem2Route = location.pathname.startsWith("/sub-system-2");
  const isIncidentRoute = location.pathname.startsWith("/incident-complaint");
  const showDocumentServices = isSubSystem2Route || isIncidentRoute;
  const userNavItems = getUserNavItems(tr.sidebar);
  const NAV_ITEMS = adminMode
    ? getAdminNavItems(tr.sidebar)
    : showDocumentServices
      ? userNavItems.map((item) => {
          if (item.id === "subsystem-2") {
            return {
              ...item,
              label: "Document Services",
              children: documentServiceChildren,
            };
          }

          if (item.id === "incident-complaint" && isSubSystem2Route) {
            return {
              ...item,
              children: [],
            };
          }

          return item;
        })
      : userNavItems;

  // Auto-expand the active parent based on current route
  const getExpandedFromPath = () => {
    const expanded = {};
    NAV_ITEMS.forEach((item) => {
      if (item.children && item.children.length > 0) {
        const isChildActive = item.children.some(
          (child) => location.pathname === child.path,
        );
        if (isChildActive || location.pathname === item.path) {
          expanded[item.id] = true;
        }
      }
    });
    return expanded;
  };

  const [expandedItems, setExpandedItems] = useState(getExpandedFromPath);

  // Update expanded state when route changes
  React.useEffect(() => {
    setExpandedItems(getExpandedFromPath());
  }, [location.pathname]);

  const handleItemClick = (item) => {
    if (item.children && item.children.length > 0) {
      if (item.path) navigate(item.path);
      // Expand clicked item, collapse others
      setExpandedItems((prev) => {
        const next = {};
        NAV_ITEMS.forEach((navItem) => {
          if (navItem.children && navItem.children.length > 0) {
            next[navItem.id] = navItem.id === item.id ? !prev[item.id] : false;
          }
        });
        return next;
      });
    } else if (item.path) {
      navigate(item.path);
      // Collapse all dropdowns when clicking a non-parent link
      setExpandedItems({});
    }
    setIsMobileMenuOpen(false);
  };

  const handleSubItemClick = (e, subItem) => {
    e.stopPropagation();
    navigate(subItem.path);
    setIsMobileMenuOpen(false);
  };

  const isPathActive = (path) => location.pathname === path;

  const isParentActive = (item) => {
    if (item.path && isPathActive(item.path)) return true;
    if (item.children) {
      return item.children.some((child) => isPathActive(child.path));
    }
    return false;
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
            className="w-9 h-9 rounded-full shadow-md flex-shrink-0 cursor-pointer hover:opacity-80 hover:shadow-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 overflow-hidden"
          >
            <img
              src={logo}
              alt="Barangay Gulod Logo"
              className="w-full h-full object-cover"
            />
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
              {adminMode ? tr.sidebar.adminPanel : "Barangay Gulod"}
            </p>
            <p
              className={`font-kumbh text-xs ${t.sidebarText} whitespace-nowrap truncate`}
            >
              {adminMode
                ? tr.sidebar.eBarangaySystem
                : showDocumentServices
                  ? "Document Services"
                  : tr.sidebar.incidentReporting}
            </p>
          </div>
        </div>

        {/* ── Nav links ───────────────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <ul className="flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => {
              const active = item.path ? isParentActive(item) : false;
              const expanded = expandedItems[item.id];
              const hasChildren = item.children && item.children.length > 0;
              const isPlaceholder = !item.path && !hasChildren;

              return (
                <li key={item.id}>
                  {/* Main item */}
                  <button
                    onClick={() => handleItemClick(item)}
                    title={collapsed ? item.label : undefined}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-all duration-150 text-left
                      border-l-[3px]
                      ${
                        active
                          ? `${t.sidebarActiveBg} ${t.sidebarActiveText} ${t.sidebarActiveBorder}`
                          : `border-transparent ${t.sidebarText} ${!isPlaceholder ? t.sidebarHoverBg : ""}`
                      }
                      ${isPlaceholder ? "opacity-50 cursor-default" : ""}
                    `}
                  >
                    {/* Icon */}
                    <svg
                      className={`w-5 h-5 flex-shrink-0 transition-colors duration-150 ${
                        active ? t.sidebarIconActive : "text-current"
                      }`}
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

                    {/* Label — slides out when collapsed */}
                    <span
                      className="font-kumbh text-sm font-medium whitespace-nowrap truncate transition-all duration-300 flex-1"
                      style={{
                        width: collapsed ? "0px" : "120px",
                        opacity: collapsed ? 0 : 1,
                      }}
                    >
                      {item.label}
                    </span>

                    {/* Badge (admin items) */}
                    {item.badge && !collapsed && (
                      <span
                        className={`text-xs font-semibold font-kumbh px-2 py-0.5 rounded-md flex-shrink-0 ${
                          active
                            ? "bg-green-600 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Chevron for expandable items */}
                    {hasChildren && !collapsed && (
                      <svg
                        className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
                          expanded ? "rotate-180" : ""
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

                  {/* Sublinks */}
                  {hasChildren && expanded && !collapsed && (
                    <ul className="mt-0.5 ml-4 pl-3 border-l border-gray-300/30">
                      {item.children.map((child) => {
                        const childActive = isPathActive(child.path);

                        return (
                          <li key={child.id}>
                            <button
                              onClick={(e) => handleSubItemClick(e, child)}
                              className={`
                                w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg
                                transition-all duration-150 text-left
                                ${
                                  childActive
                                    ? `${t.sidebarActiveBg} ${t.sidebarActiveText}`
                                    : `${t.sidebarText} ${t.sidebarHoverBg}`
                                }
                              `}
                            >
                              <svg
                                className={`w-4 h-4 flex-shrink-0 transition-colors duration-150 ${
                                  childActive
                                    ? t.sidebarIconActive
                                    : "text-current"
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d={child.icon}
                                />
                              </svg>

                              <span className="font-kumbh text-xs font-medium whitespace-nowrap truncate">
                                {child.label}
                              </span>
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
