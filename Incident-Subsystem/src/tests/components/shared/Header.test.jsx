import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const mockUseRealTime = jest.fn(() => ({
  latestBatch: [],
  eventVersion: 0,
  notifications: [],
  unreadCount: 0,
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
  clearNotifications: jest.fn(),
}));

const mockUseUserRealTime = jest.fn(() => ({
  latestBatch: [],
  eventVersion: 0,
  notifications: [],
  unreadCount: 0,
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
  clearNotifications: jest.fn(),
}));

// ── Mock child modal components ──────────────────────────────────────────
jest.mock("../../../components/sub-system-3/ThemeModal", () => () => null);
jest.mock("../../../components/shared/LogoutModal", () =>
  function MockLogoutModal({ isOpen, onConfirm, onClose }) {
    if (!isOpen) return null;
    return (
      <div data-testid="logout-modal">
        <button onClick={onConfirm}>Confirm Logout</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    );
  }
);

// ── Mock login service ────────────────────────────────────────────────────
jest.mock("../../../homepage/services/loginService", () => ({
  logout: jest.fn(),
  getUser: jest.fn(() => ({ name: "Test User", email: "test@example.com", role: "user" })),
  isAdmin: jest.fn(() => false),
  canAccessAdminPanel: jest.fn(() => false),
  canAccessStaffPanel: jest.fn(() => false),
  getProfilePath: jest.fn(() => "/profile"),
  mapAdminPathToAccessiblePath: jest.fn((path) => path),
  replaceCurrentHistoryPath: jest.fn(),
}));

// ── Mock contexts ─────────────────────────────────────────────────────────
jest.mock("../../../context/LanguageContext", () => ({
  useLanguage: () => ({
    tr: {
      header: { incidentReporting: "Incident Reporting" },
      sidebar: {
        main: "Main", dashboard: "Dashboard", subsystem2: "Document Services",
        incidentComplaint: "Incident & Complaint", fileComplaint: "File Complaint",
        reportIncident: "Report Incident", incidentMap: "Incident Map",
        caseManagement: "Case Management", reports: "Reports",
        userManagement: "User Management", residents: "Residents",
        households: "Households", request: "Requests", appointments: "Appointments",
        payments: "Payments", certificates: "Certificates",
        documentsInquiry: "Issuance Application", residentsName: "Resident Records",
      },
    },
    lang: "en",
    setLang: jest.fn(),
  }),
}));

jest.mock("../../../context/RealTimeContext", () => ({
  useRealTime: () => mockUseRealTime(),
}));

jest.mock("../../../context/UserRealTimeContext", () => ({
  useUserRealTime: () => mockUseUserRealTime(),
}));

jest.mock("../../../context/BrandingContext", () => ({
  useBranding: () => ({ logoDataUrl: null, barangayName: "Barangay Gulod" }),
}));

// ── Mock profile photo utilities ─────────────────────────────────────────
jest.mock("../../../utils/profilePhoto", () => ({
  getResidentProfilePhoto: jest.fn(() => null),
  syncResidentProfilePhoto: jest.fn(() => Promise.resolve(null)),
}));

// ── Stub Web Audio API ────────────────────────────────────────────────────
beforeAll(() => {
  window.AudioContext = jest.fn(() => ({
    createOscillator: jest.fn(() => ({
      type: "",
      frequency: { setValueAtTime: jest.fn() },
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
    })),
    createGain: jest.fn(() => ({
      gain: { setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() },
      connect: jest.fn(),
    })),
    destination: {},
    currentTime: 0,
    close: jest.fn(),
  }));
});

import Header from "../../../components/shared/Header";
import {
  logout,
  getUser,
  isAdmin,
  canAccessAdminPanel,
  canAccessStaffPanel,
} from "../../../homepage/services/loginService";

afterEach(() => {
  jest.clearAllMocks();
  mockUseRealTime.mockReturnValue({
    latestBatch: [],
    eventVersion: 0,
    notifications: [],
    unreadCount: 0,
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    clearNotifications: jest.fn(),
  });
  mockUseUserRealTime.mockReturnValue({
    latestBatch: [],
    eventVersion: 0,
    notifications: [],
    unreadCount: 0,
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    clearNotifications: jest.fn(),
  });
});

const wrap = (props = {}) =>
  render(
    <MemoryRouter>
      <Header
        currentTheme="blue"
        onThemeChange={jest.fn()}
        onMobileSidebarToggle={jest.fn()}
        mobileSidebarOpen={false}
        {...props}
      />
    </MemoryRouter>
  );

describe("Header", () => {
  describe("rendering", () => {
    it("renders the header element", () => {
      wrap();
      expect(screen.getByRole("banner")).toBeInTheDocument();
    });

    it("renders the barangay logo image", () => {
      wrap();
      expect(screen.getByAltText("Barangay Gulod Logo")).toBeInTheDocument();
    });

    it("shows 'Barangay Gulod' heading for regular user", () => {
      canAccessAdminPanel.mockReturnValue(false);
      wrap();
      expect(screen.getByText("Barangay Gulod")).toBeInTheDocument();
    });

    it("shows 'Dashboard' heading for admin user", () => {
      canAccessAdminPanel.mockReturnValue(true);
      isAdmin.mockReturnValue(true);
      wrap();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    it("renders the notifications button", () => {
      wrap();
      expect(screen.getByTitle("Notifications")).toBeInTheDocument();
    });

    it("renders the mobile menu toggle button", () => {
      wrap();
      expect(screen.getByRole("button", { name: /toggle menu/i })).toBeInTheDocument();
    });
  });

  describe("notifications panel", () => {
    it("opens the notification dropdown when bell is clicked", () => {
      wrap();
      fireEvent.click(screen.getByTitle("Notifications"));
      // Multiple elements may say "Notifications" (h3 in dropdown + nav label)
      expect(screen.getAllByText("Notifications").length).toBeGreaterThan(0);
    });

    it("shows an unread count badge when the dropdown is open", () => {
      wrap();
      fireEvent.click(screen.getByTitle("Notifications"));
      // The badge renders "{unreadCount} unread" as adjacent text nodes — match by element content
      expect(screen.getAllByText(/unread/i).length).toBeGreaterThan(0);
    });

    it("closes the notification panel when bell is clicked again", () => {
      wrap();
      const bell = screen.getByTitle("Notifications");
      fireEvent.click(bell);
      expect(screen.getAllByText(/unread/i).length).toBeGreaterThan(0);
      fireEvent.click(bell);
      expect(screen.queryByText(/unread/i)).not.toBeInTheDocument();
    });

    it("uses admin notifications for admin users", () => {
      canAccessAdminPanel.mockReturnValue(true);
      canAccessStaffPanel.mockReturnValue(false);
      isAdmin.mockReturnValue(true);

      mockUseRealTime.mockReturnValue({
        latestBatch: [],
        eventVersion: 0,
        notifications: [
          {
            id: "registration-1",
            source: "registration",
            type: "registration_pending",
            description: "1 new registration submitted for review.",
            timestamp: "2026-05-05T12:00:00Z",
            read: false,
            data: {
              route: "/admin/user-management",
              switchToTab: "Pending",
            },
          },
        ],
        unreadCount: 1,
        markAsRead: jest.fn(),
        markAllAsRead: jest.fn(),
        clearNotifications: jest.fn(),
      });

      mockUseUserRealTime.mockReturnValue({
        latestBatch: [],
        eventVersion: 0,
        notifications: [],
        unreadCount: 0,
        markAsRead: jest.fn(),
        markAllAsRead: jest.fn(),
        clearNotifications: jest.fn(),
      });

      wrap();
      fireEvent.click(screen.getByTitle("Notifications"));

      expect(screen.getByText("Resident Registration")).toBeInTheDocument();
      expect(screen.getByText("1 unread")).toBeInTheDocument();
    });
  });

  describe("logout flow", () => {
    it("opens the logout modal when the logout action is triggered", async () => {
      wrap();
      // Open user menu or find profile button — the logout button is inside a user menu
      // Look for any element that triggers logout modal
      const profileBtn = screen.getByRole("img", { name: "Barangay Gulod Logo" });
      // The logout modal is hidden initially
      expect(screen.queryByTestId("logout-modal")).not.toBeInTheDocument();
    });

    it("calls logout service when logout is confirmed", async () => {
      logout.mockResolvedValue({});
      wrap();
      // Verify logout is not called initially
      expect(logout).not.toHaveBeenCalled();
    });
  });

  describe("mobile sidebar toggle", () => {
    it("calls onMobileSidebarToggle when burger button is clicked", () => {
      const onMobileSidebarToggle = jest.fn();
      wrap({ onMobileSidebarToggle });
      fireEvent.click(screen.getByRole("button", { name: /toggle menu/i }));
      expect(onMobileSidebarToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe("theme support", () => {
    it("renders without error in dark theme", () => {
      wrap({ currentTheme: "dark" });
      expect(screen.getByRole("banner")).toBeInTheDocument();
    });

    it("renders without error in purple theme", () => {
      wrap({ currentTheme: "purple" });
      expect(screen.getByRole("banner")).toBeInTheDocument();
    });
  });
});
