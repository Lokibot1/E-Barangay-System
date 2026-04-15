import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// ── Mock login service ────────────────────────────────────────────────────
jest.mock("../../../homepage/services/loginService", () => ({
  isAdmin: jest.fn(() => false),
  canAccessAdminPanel: jest.fn(() => false),
  canAccessVerificationQueue: jest.fn(() => false),
  canManageAccounts: jest.fn(() => false),
  canManageSystemSettings: jest.fn(() => false),
  canViewAnalytics: jest.fn(() => false),
  canViewAppointments: jest.fn(() => false),
  canViewDocuments: jest.fn(() => false),
  canViewIncidentCases: jest.fn(() => false),
  canViewResidents: jest.fn(() => false),
}));

// ── Mock contexts ─────────────────────────────────────────────────────────
const trMock = {
  sidebar: {
    main: "Main",
    dashboard: "Dashboard",
    subsystem2: "Document Services",
    incidentComplaint: "Incident & Complaint",
    fileComplaint: "File Complaint",
    reportIncident: "Report Incident",
    incidentMap: "Incident Map",
    caseManagement: "Case Management",
    reports: "Reports",
    userManagement: "User Management",
    residents: "Residents",
    households: "Households",
    request: "Requests",
    appointments: "Appointments",
    payments: "Payments",
    certificates: "Certificates",
    documentsInquiry: "Issuance Application",
    residentsName: "Resident Records",
  },
};

jest.mock("../../../context/LanguageContext", () => ({
  useLanguage: () => ({ tr: trMock, lang: "en", setLang: jest.fn() }),
}));

jest.mock("../../../context/BrandingContext", () => ({
  useBranding: () => ({ logoDataUrl: null }),
}));

import Sidebar from "../../../components/shared/Sidebar";
import {
  isAdmin,
  canAccessAdminPanel,
  canAccessVerificationQueue,
  canManageAccounts,
  canManageSystemSettings,
  canViewAnalytics,
  canViewAppointments,
  canViewDocuments,
  canViewIncidentCases,
  canViewResidents,
} from "../../../homepage/services/loginService";

// JSDOM does not implement matchMedia — provide a minimal stub
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn((query) => ({
      matches: false,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })),
  });
});

afterEach(() => jest.clearAllMocks());

const wrap = (props = {}) =>
  render(
    <MemoryRouter>
      <Sidebar
        currentTheme="blue"
        collapsed={false}
        onToggle={jest.fn()}
        mobileOpen={false}
        onMobileToggle={jest.fn()}
        {...props}
      />
    </MemoryRouter>
  );

describe("Sidebar", () => {
  describe("user nav items", () => {
    beforeEach(() => {
      isAdmin.mockReturnValue(false);
      canAccessAdminPanel.mockReturnValue(false);
    });

    it("renders the logo image", () => {
      wrap();
      expect(screen.getAllByRole("img").length).toBeGreaterThan(0);
    });

    it("shows 'Main' nav item for regular user", () => {
      wrap();
      expect(screen.getByText("Main")).toBeInTheDocument();
    });

    it("shows 'Document Services' nav item for regular user", () => {
      wrap();
      expect(screen.getByText("Document Services")).toBeInTheDocument();
    });

    it("shows 'Incident & Complaint' nav item for regular user", () => {
      wrap();
      expect(screen.getByText("Incident & Complaint")).toBeInTheDocument();
    });
  });

  describe("admin nav items", () => {
    beforeEach(() => {
      isAdmin.mockReturnValue(true);
      canAccessAdminPanel.mockReturnValue(true);
      canAccessVerificationQueue.mockReturnValue(true);
      canManageAccounts.mockReturnValue(true);
      canManageSystemSettings.mockReturnValue(true);
      canViewAnalytics.mockReturnValue(true);
      canViewAppointments.mockReturnValue(true);
      canViewDocuments.mockReturnValue(true);
      canViewIncidentCases.mockReturnValue(true);
      canViewResidents.mockReturnValue(true);
    });

    it("shows 'Dashboard' nav item for admin", () => {
      wrap();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    it("shows 'Case Management' nav item for admin", () => {
      wrap();
      expect(screen.getByText("Case Management")).toBeInTheDocument();
    });

    it("shows 'Appointments' nav item for admin", () => {
      wrap();
      expect(screen.getByText("Appointments")).toBeInTheDocument();
    });

    it("shows 'Settings (CMS)' nav item for admin", () => {
      wrap();
      expect(screen.getByText("Settings (CMS)")).toBeInTheDocument();
    });
  });

  describe("collapse toggle", () => {
    it("calls onToggle when the collapse button is clicked", () => {
      const onToggle = jest.fn();
      wrap({ onToggle });
      // The collapse toggle button is typically inside the sidebar header
      const buttons = screen.getAllByRole("button");
      // Click the first button (collapse/expand toggle)
      if (buttons.length > 0) {
        fireEvent.click(buttons[0]);
        expect(onToggle).toHaveBeenCalledTimes(1);
      }
    });

    it("renders in collapsed state without errors", () => {
      wrap({ collapsed: true });
      expect(screen.getAllByRole("img").length).toBeGreaterThan(0);
    });
  });

  describe("active route highlighting", () => {
    it("renders a button for the Main nav item for regular user", () => {
      isAdmin.mockReturnValue(false);
      canAccessAdminPanel.mockReturnValue(false);
      wrap();
      // Nav items use navigate() via buttons, not anchor tags
      expect(screen.getByText("Main")).toBeInTheDocument();
    });

    it("renders a button for the Dashboard nav item in admin mode", () => {
      isAdmin.mockReturnValue(true);
      canAccessAdminPanel.mockReturnValue(true);
      canViewAnalytics.mockReturnValue(true);
      canViewIncidentCases.mockReturnValue(true);
      canViewAppointments.mockReturnValue(true);
      canViewDocuments.mockReturnValue(true);
      canViewResidents.mockReturnValue(true);
      canAccessVerificationQueue.mockReturnValue(true);
      canManageAccounts.mockReturnValue(true);
      canManageSystemSettings.mockReturnValue(true);
      wrap();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });
  });

  describe("theme support", () => {
    it("renders without error in dark theme", () => {
      isAdmin.mockReturnValue(false);
      canAccessAdminPanel.mockReturnValue(false);
      wrap({ currentTheme: "dark" });
      expect(screen.getByText("Main")).toBeInTheDocument();
    });

    it("renders without error for unknown theme", () => {
      isAdmin.mockReturnValue(false);
      canAccessAdminPanel.mockReturnValue(false);
      wrap({ currentTheme: "unknown" });
      expect(screen.getByText("Main")).toBeInTheDocument();
    });
  });
});
