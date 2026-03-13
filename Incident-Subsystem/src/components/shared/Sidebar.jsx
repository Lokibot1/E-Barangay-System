import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { isAdmin } from "../../homepage/services/loginService";
import { useLanguage } from "../../context/LanguageContext";
import { useBranding } from "../../context/BrandingContext";
import themeTokens from "../../Themetokens";
import logo from "../../assets/images/logo.jpg";
import {
  House,
  Users,
  LayoutGrid,
  BarChart3,
  ShieldCheck,
  UserRound,
  Home,
  ClipboardList,
  AlertTriangle,
  Calendar,
  Wallet,
  FileText,
  Search,
  Settings,
  CircleHelp,
  FileWarning,
  MapPinned,
  ScanSearch,
  Menu,
} from "lucide-react";

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
  },
  {
    id: "resident-registry",
    label: s.residents,
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    path: "/admin/user-management",
    children: [
      {
        id: "reports",
        label: s.reports,
        icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
        path: "/admin/reports",
      },
      {
        id: "verification",
        label: s.userManagement,
        icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
        path: "/admin/user-management",
      },
      {
        id: "residents",
        label: s.residents,
        icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
        path: "/admin/residents",
      },
      {
        id: "households",
        label: s.households,
        icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001-1m-6 0h6",
        path: "/admin/households",
      },
    ],
  },
  {
    id: "requests",
    label: s.request,
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
    path: "/admin/requests",
  },
  {
    id: "incidents",
    label: s.caseManagement,
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    path: "/admin/incidents",
  },
  {
    id: "appointments",
    label: s.appointments,
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    path: "/admin/appointments",
  },
  {
    id: "payments",
    label: s.payments,
    icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
    path: "/admin/payments",
  },
  {
    id: "documents-inquiry",
    label: s.documentsInquiry || "Issuance Application",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    path: "/admin/documents-inquiry",
    children: [
      {
        id: "certificates",
        label: s.certificates,
        icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
        path: "/admin/certificates",
      },
      {
        id: "documents-inquiry-sub",
        label: s.documentsInquiry || "Issuance App.",
        icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
        path: "/admin/documents-inquiry",
      },
    ],
  },
  {
    id: "settings",
    label: s.settings,
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
    path: "/admin/settings",
    children: [
      {
        id: "settings-sub",
        label: s.settings,
        icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
        path: "/admin/settings",
      },
      {
        id: "support",
        label: s.support,
        icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
        path: "/admin/support",
      },
    ],
  },
];

// ── Sidebar ─────────────────────────────────────────────────────────────────
const Sidebar = ({ currentTheme, collapsed, onToggle }) => {
  const t = themeTokens[currentTheme] || themeTokens.modern || themeTokens.blue;
  const isDark = currentTheme === "dark";
  const { tr } = useLanguage();
  const { logoDataUrl } = useBranding();
  const logoSrc = logoDataUrl || logo;
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [flyoutMenu, setFlyoutMenu] = useState(null);
  const itemButtonRefs = React.useRef({});
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

  React.useEffect(() => {
    if (!collapsed) {
      setFlyoutMenu(null);
    }
  }, [collapsed, location.pathname]);

  React.useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!collapsed) return;
      const target = event.target;
      if (
        target.closest("[data-flyout-menu]") ||
        target.closest("[data-flyout-trigger]")
      ) {
        return;
      }
      setFlyoutMenu(null);
      setExpandedItems({});
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [collapsed]);

  const handleItemClick = (item) => {
    if (item.children && item.children.length > 0) {
      // Collapsed mode: show floating submenu (no full sidebar expansion).
      if (collapsed) {
        const buttonEl = itemButtonRefs.current[item.id];
        const rect = buttonEl?.getBoundingClientRect();
        const nextFlyout = {
          itemId: item.id,
          left: (rect?.right || 72) + 10,
          top: Math.max((rect?.top || 120) - 8, 12),
        };

        setExpandedItems((prev) => {
          const next = {};
          NAV_ITEMS.forEach((navItem) => {
            if (navItem.children && navItem.children.length > 0) {
              next[navItem.id] =
                navItem.id === item.id ? !prev[item.id] : false;
            }
          });
          return next;
        });

        setFlyoutMenu((prev) => (prev?.itemId === item.id ? null : nextFlyout));
        return;
      }

      if (item.path) navigate(item.path);
      // Expanded mode: inline submenu behavior.
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
      setFlyoutMenu(null);
    }
    setIsMobileMenuOpen(false);
  };

  const handleSubItemClick = (e, subItem) => {
    e.stopPropagation();
    navigate(subItem.path);
    setFlyoutMenu(null);
    if (collapsed) setExpandedItems({});
    setIsMobileMenuOpen(false);
  };

  const normalizePath = (value = "") => {
    if (!value) return "/";
    const cleaned = value.replace(/\/+$/, "");
    return cleaned === "" ? "/" : cleaned;
  };

  const isPathActive = (path) => {
    const current = normalizePath(location.pathname);
    const target = normalizePath(path);
    return current === target;
  };

  const isPathWithin = (path) => {
    const current = normalizePath(location.pathname);
    const target = normalizePath(path);
    return current === target || current.startsWith(`${target}/`);
  };
  const iconMap = {
    main: House,
    dashboard: House,
    "subsystem-1": LayoutGrid,
    "subsystem-2": FileText,
    "incident-complaint": AlertTriangle,
    "file-complaint": FileWarning,
    "incident-report": AlertTriangle,
    "incident-map": MapPinned,
    "case-management": ScanSearch,
    "resident-registry": Users,
    reports: BarChart3,
    verification: ShieldCheck,
    residents: UserRound,
    households: Home,
    requests: ClipboardList,
    incidents: AlertTriangle,
    appointments: Calendar,
    payments: Wallet,
    "documents-inquiry": FileText,
    certificates: FileText,
    "documents-inquiry-sub": Search,
    settings: Settings,
    "settings-sub": Settings,
    support: CircleHelp,
    "request-barangay-id": FileText,
    "request-indigency": FileText,
    "request-residency": FileText,
  };

  const renderMenuIcon = (itemId, pathData, className = "w-4 h-4") => {
    const Icon = iconMap[itemId];
    if (Icon) return <Icon className={className} strokeWidth={2} />;
    return (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={pathData}
        />
      </svg>
    );
  };

  const isParentActive = (item) => {
    // Leaf routes should only be active on exact match.
    if ((!item.children || item.children.length === 0) && item.path) {
      return isPathActive(item.path);
    }

    // Parent routes with children can stay active on nested paths.
    if (item.path && isPathWithin(item.path)) return true;
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
          ${t.sidebarBg} ${t.sidebarBorder} border-r
          flex flex-col h-screen
          transition-all duration-300 ease-in-out
          flex-shrink-0
          relative overflow-visible
          fixed md:relative
          z-40
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        style={{ width: collapsed ? "72px" : "224px" }}
      >
        {/* ── Logo row ────────────────────────────────────────────────────── */}
        <div
          className={`
            flex items-center border-b ${t.sidebarBorder}
            flex-shrink-0
            ${collapsed ? "justify-center px-0 py-3" : "gap-1.5 px-3 py-3"}
          `}
        >
          <button
            onClick={() => {
              setFlyoutMenu(null);
              setExpandedItems({});
              onToggle();
            }}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`hidden md:inline-flex flex-shrink-0 items-center justify-center ${t.subtleText} transition-colors ${
              collapsed ? "h-7 w-7" : "h-8 w-8"
            } ${isDark ? "hover:text-slate-200" : "hover:text-slate-700"}`}
          >
            <Menu className={collapsed ? "h-3.5 w-3.5" : "h-[14px] w-[14px]"} />
          </button>

          {!collapsed && (
            <>
              {/* Logo mark */}
              <button className="w-8 h-8 rounded-full shadow-sm flex-shrink-0 overflow-hidden">
                <img
                  src={logoSrc}
                  alt="Barangay Gulod Logo"
                  className="w-full h-full object-cover"
                />
              </button>

              {/* App name — fades out when collapsed */}
              <div className="min-w-0 flex-1 overflow-hidden text-left">
                <p
                  className={`font-spartan text-[14px] font-bold leading-none ${t.sidebarAppName || t.cardText} whitespace-nowrap truncate text-left`}
                >
                  {adminMode ? tr.sidebar.adminPanel : "Barangay Gulod"}
                </p>
                <p
                  className={`mt-1 font-kumbh text-[11px] leading-none ${t.sidebarText} whitespace-nowrap truncate text-left`}
                >
                  {adminMode
                    ? tr.sidebar.eBarangaySystem
                    : showDocumentServices
                      ? "Document Services"
                      : tr.sidebar.incidentReporting}
                </p>
              </div>
            </>
          )}
        </div>

        {/* ── Nav links ───────────────────────────────────────────────────── */}
        <nav
          className={`flex-1 overflow-y-auto ${collapsed ? "py-3 px-2" : "py-3 px-2"}`}
        >
          <ul className={`flex flex-col ${collapsed ? "gap-2" : "gap-1"}`}>
            {NAV_ITEMS.map((item) => {
              const active = item.path ? isParentActive(item) : false;
              const expanded = expandedItems[item.id];
              const hasChildren = item.children && item.children.length > 0;
              const isPlaceholder = !item.path && !hasChildren;

              return (
                <li
                  key={item.id}
                  className={`relative ${
                    item.id === "settings"
                      ? collapsed
                        ? `mt-3 pt-3 border-t ${t.sidebarBorder}`
                        : "mt-1 pt-1"
                      : ""
                  }`}
                >
                  {/* Main item */}
                  <button
                    ref={(el) => {
                      itemButtonRefs.current[item.id] = el;
                    }}
                    data-flyout-trigger="true"
                    onClick={() => handleItemClick(item)}
                    title={collapsed ? item.label : undefined}
                    className={`
                      w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl
                      transition-all duration-150 text-left
                      border
                      ${collapsed ? "inline-flex items-center justify-center gap-0 px-0 py-0 w-9 h-9 mx-auto text-center rounded-lg" : ""}
                      ${
                        active
                          ? `${t.sidebarActiveBg} ${t.sidebarActiveText} ${t.sidebarActiveBorder} shadow-sm`
                          : `border-transparent ${t.sidebarText} ${!isPlaceholder ? t.sidebarHoverBg : ""}`
                      }
                      ${isPlaceholder ? "opacity-50 cursor-default" : ""}
                    `}
                  >
                    {/* Icon */}
                    <span
                      className={`inline-flex items-center justify-center flex-shrink-0 transition-colors duration-150 ${
                        collapsed
                          ? `h-8 w-8 ${active ? t.sidebarIconActive : isDark ? "text-slate-300" : "text-slate-500"}`
                          : `w-8 h-8 rounded-lg ${
                              active
                                ? `${t.primaryLight} ${t.sidebarIconActive}`
                                : `${isDark ? "bg-slate-800/80 text-slate-400" : "bg-slate-100 text-slate-500"}`
                            }`
                      } ${collapsed ? "mx-auto" : ""}`}
                    >
                      <span
                        className={`transition-colors duration-150 ${active ? t.sidebarIconActive : "text-current"}`}
                      >
                        {renderMenuIcon(item.id, item.icon, "w-4 h-4")}
                      </span>
                    </span>

                    {/* Label — slides out when collapsed */}
                    {!collapsed && (
                      <span
                        className="font-kumbh text-[13px] font-medium whitespace-nowrap truncate transition-all duration-300 flex-1"
                        style={{ width: "112px", opacity: 1 }}
                      >
                        {item.label}
                      </span>
                    )}

                    {/* Badge (admin items) */}
                    {item.badge && !collapsed && (
                      <span
                        className={`text-xs font-semibold font-kumbh px-2 py-0.5 rounded-md flex-shrink-0 ${
                          active
                            ? `${t.primarySolid} text-white`
                            : `${isDark ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-600"}`
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Chevron for expandable items */}
                    {hasChildren && !collapsed && (
                      <svg
                        className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${t.subtleText} ${
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
                    <div className="relative mt-1 ml-3 pl-4">
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none absolute bottom-4 left-0 top-2 w-px rounded-full ${
                          isDark ? "bg-slate-700/80" : "bg-slate-300"
                        }`}
                      />
                      <ul className="space-y-0.5">
                        {item.children.map((child) => {
                          const childActive = isPathActive(child.path);

                          return (
                            <li key={child.id} className="relative">
                              <span
                                aria-hidden="true"
                                className={`pointer-events-none absolute -left-4 top-1/2 h-4 w-3 -translate-y-1/2 rounded-bl-[10px] border-b border-l ${
                                  isDark
                                    ? "border-slate-700/80"
                                    : "border-slate-300"
                                }`}
                              />
                              <button
                                onClick={(e) => handleSubItemClick(e, child)}
                                className={`
                                  w-full flex items-center gap-2 px-2 py-1.5 rounded-xl border border-transparent
                                  transition-all duration-150 text-left
                                  ${
                                    childActive
                                      ? `${t.sidebarActiveBg} ${t.sidebarActiveText} ${t.sidebarActiveBorder}`
                                      : `${t.sidebarText} ${t.sidebarHoverBg}`
                                  }
                                `}
                              >
                                <span
                                  className={`flex-shrink-0 transition-colors duration-150 ${childActive ? t.sidebarIconActive : "text-current"}`}
                                >
                                  {renderMenuIcon(
                                    child.id,
                                    child.icon,
                                    "w-3.5 h-3.5",
                                  )}
                                </span>

                                <span className="font-kumbh text-xs font-medium whitespace-nowrap truncate">
                                  {child.label}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Floating sublinks (collapsed mode) - portal layer to stay above page content */}
        {collapsed &&
          flyoutMenu &&
          typeof document !== "undefined" &&
          (() => {
            const parent = NAV_ITEMS.find((i) => i.id === flyoutMenu.itemId);
            if (!parent || !parent.children || parent.children.length === 0)
              return null;

            return createPortal(
              <div
                data-flyout-menu="true"
                className={`hidden md:block fixed z-[1300] w-[200px] rounded-2xl border ${t.cardBorder} ${t.cardBg} shadow-2xl p-2`}
                style={{
                  left: `${flyoutMenu.left}px`,
                  top: `${flyoutMenu.top}px`,
                }}
              >
                <p
                  className={`px-2 py-1 text-[10px] font-kumbh font-bold uppercase tracking-wide ${t.subtleText}`}
                >
                  {parent.label}
                </p>
                <ul className="mt-1 space-y-1">
                  {parent.children.map((child) => {
                    const childActive = isPathActive(child.path);
                    return (
                      <li key={child.id}>
                        <button
                          onClick={(e) => handleSubItemClick(e, child)}
                          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors ${
                            childActive
                              ? `${t.sidebarActiveBg} ${t.sidebarActiveText}`
                              : `${t.sidebarText} ${t.sidebarHoverBg}`
                          }`}
                        >
                          <span className="flex-shrink-0">
                            {renderMenuIcon(
                              child.id,
                              child.icon,
                              "w-3.5 h-3.5",
                            )}
                          </span>
                          <span className="font-kumbh text-xs font-medium whitespace-nowrap truncate">
                            {child.label}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>,
              document.body,
            );
          })()}
      </aside>
    </>
  );
};

export default Sidebar;
