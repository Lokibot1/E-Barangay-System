import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// ── Mock context ─────────────────────────────────────────────────────────
let mockMarkAsRead = jest.fn();
let mockUserRealTime = { latestBatch: [], eventVersion: 0, markAsRead: mockMarkAsRead };
jest.mock("../../../context/UserRealTimeContext", () => ({
  useUserRealTime: () => mockUserRealTime,
}));

import UserNotificationToast from "../../../components/shared/UserNotificationToast";

beforeEach(() => {
  jest.useFakeTimers();
  mockMarkAsRead = jest.fn();
  mockUserRealTime = { latestBatch: [], eventVersion: 0, markAsRead: mockMarkAsRead };
});
afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

const makeEvent = (overrides = {}) => ({
  id: "evt-1",
  source: "incident",
  type: "status_update",
  oldStatus: "pending",
  newStatus: "resolved",
  data: {},
  ...overrides,
});

describe("UserNotificationToast", () => {
  describe("empty state", () => {
    it("renders nothing when there are no visible toasts", () => {
      const { container } = wrap(<UserNotificationToast currentTheme="blue" />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("status update toast", () => {
    it("shows 'Incident Status Updated' for incident source", () => {
      mockUserRealTime = {
        latestBatch: [makeEvent({ source: "incident" })],
        eventVersion: 1,
        markAsRead: mockMarkAsRead,
      };
      wrap(<UserNotificationToast currentTheme="blue" />);
      expect(screen.getByText("Incident Status Updated")).toBeInTheDocument();
    });

    it("shows 'Complaint Status Updated' for complaint source", () => {
      mockUserRealTime = {
        latestBatch: [makeEvent({ source: "complaint", id: "evt-2" })],
        eventVersion: 1,
        markAsRead: mockMarkAsRead,
      };
      wrap(<UserNotificationToast currentTheme="blue" />);
      expect(screen.getByText("Complaint Status Updated")).toBeInTheDocument();
    });

    it("shows old → new status transition text", () => {
      mockUserRealTime = {
        latestBatch: [makeEvent({ oldStatus: "pending", newStatus: "resolved" })],
        eventVersion: 1,
        markAsRead: mockMarkAsRead,
      };
      wrap(<UserNotificationToast currentTheme="blue" />);
      expect(screen.getByText(/pending.*resolved/i)).toBeInTheDocument();
    });

    it("shows 'Click to view details' prompt", () => {
      mockUserRealTime = {
        latestBatch: [makeEvent()],
        eventVersion: 1,
        markAsRead: mockMarkAsRead,
      };
      wrap(<UserNotificationToast currentTheme="blue" />);
      expect(screen.getByText("Click to view details")).toBeInTheDocument();
    });
  });

  describe("appointment toast", () => {
    it("shows 'Appointment Scheduled' for appointment_scheduled type", () => {
      mockUserRealTime = {
        latestBatch: [makeEvent({ type: "appointment_scheduled", source: "system" })],
        eventVersion: 1,
        markAsRead: mockMarkAsRead,
      };
      wrap(<UserNotificationToast currentTheme="blue" />);
      expect(screen.getByText("Appointment Scheduled")).toBeInTheDocument();
    });

    it("shows fallback text when scheduled_at is missing", () => {
      mockUserRealTime = {
        latestBatch: [makeEvent({ type: "appointment_scheduled", source: "system", data: {} })],
        eventVersion: 1,
        markAsRead: mockMarkAsRead,
      };
      wrap(<UserNotificationToast currentTheme="blue" />);
      expect(screen.getByText(/Your complaint appointment has been set/i)).toBeInTheDocument();
    });
  });

  describe("profile update toast", () => {
    it("shows 'Profile Updated' for resident source", () => {
      mockUserRealTime = {
        latestBatch: [makeEvent({ source: "resident", type: "profile_updated" })],
        eventVersion: 1,
        markAsRead: mockMarkAsRead,
      };
      wrap(<UserNotificationToast currentTheme="blue" />);
      expect(screen.getByText("Profile Updated")).toBeInTheDocument();
    });

    it("shows 'Click to view profile' for resident events", () => {
      mockUserRealTime = {
        latestBatch: [makeEvent({ source: "resident", type: "profile_updated" })],
        eventVersion: 1,
        markAsRead: mockMarkAsRead,
      };
      wrap(<UserNotificationToast currentTheme="blue" />);
      expect(screen.getByText("Click to view profile")).toBeInTheDocument();
    });

    it("shows editor name when provided in data", () => {
      mockUserRealTime = {
        latestBatch: [
          makeEvent({
            source: "resident",
            type: "profile_updated",
            data: { editor_name: "Admin User" },
          }),
        ],
        eventVersion: 1,
        markAsRead: mockMarkAsRead,
      };
      wrap(<UserNotificationToast currentTheme="blue" />);
      expect(screen.getByText(/updated by admin user/i)).toBeInTheDocument();
    });
  });

  describe("dismiss", () => {
    it("removes the toast after dismiss button click and exit animation", () => {
      mockUserRealTime = {
        latestBatch: [makeEvent()],
        eventVersion: 1,
        markAsRead: mockMarkAsRead,
      };
      wrap(<UserNotificationToast currentTheme="blue" />);
      expect(screen.getByText("Incident Status Updated")).toBeInTheDocument();

      fireEvent.click(screen.getAllByRole("button")[0]);
      act(() => { jest.advanceTimersByTime(300); });
      expect(screen.queryByText("Incident Status Updated")).not.toBeInTheDocument();
    });

    it("auto-dismisses after 5000ms + 300ms exit animation", () => {
      mockUserRealTime = {
        latestBatch: [makeEvent()],
        eventVersion: 1,
        markAsRead: mockMarkAsRead,
      };
      wrap(<UserNotificationToast currentTheme="blue" />);
      act(() => { jest.advanceTimersByTime(5000); });
      act(() => { jest.advanceTimersByTime(300); });
      expect(screen.queryByText("Incident Status Updated")).not.toBeInTheDocument();
    });
  });

  describe("dark theme", () => {
    it("renders without error in dark theme", () => {
      mockUserRealTime = {
        latestBatch: [makeEvent()],
        eventVersion: 1,
        markAsRead: mockMarkAsRead,
      };
      wrap(<UserNotificationToast currentTheme="dark" />);
      expect(screen.getByText("Incident Status Updated")).toBeInTheDocument();
    });
  });
});
