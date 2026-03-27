import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// ── Mock context and hook ────────────────────────────────────────────────
let mockRealTime = { latestBatch: [], eventVersion: 0 };
jest.mock("../../../context/RealTimeContext", () => ({
  useRealTime: () => mockRealTime,
}));

let mockPlayFeedback = jest.fn();
jest.mock("../../../hooks/shared/useSound", () => ({
  useSound: () => ({ playFeedback: mockPlayFeedback }),
}));

import AdminNotificationToast from "../../../components/shared/AdminNotificationToast";

beforeEach(() => {
  jest.useFakeTimers();
  mockRealTime = { latestBatch: [], eventVersion: 0 };
  mockPlayFeedback = jest.fn();
});
afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

const makeEvent = (overrides = {}) => ({
  id: "evt-1",
  source: "incident",
  type: "Theft",
  data: { description: "A theft was reported." },
  ...overrides,
});

describe("AdminNotificationToast", () => {
  describe("empty state", () => {
    it("renders nothing when there are no visible toasts", () => {
      const { container } = wrap(<AdminNotificationToast currentTheme="blue" />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("new batch arrives", () => {
    it("shows 'New Incident Reported' for an incident event", () => {
      mockRealTime = {
        latestBatch: [makeEvent({ source: "incident" })],
        eventVersion: 1,
      };
      wrap(<AdminNotificationToast currentTheme="blue" />);
      expect(screen.getByText("New Incident Reported")).toBeInTheDocument();
    });

    it("shows 'New Complaint Reported' for a complaint event", () => {
      mockRealTime = {
        latestBatch: [makeEvent({ source: "complaint", id: "evt-2" })],
        eventVersion: 1,
      };
      wrap(<AdminNotificationToast currentTheme="blue" />);
      expect(screen.getByText("New Complaint Reported")).toBeInTheDocument();
    });

    it("shows 'Resident Profile Updated' for a resident event", () => {
      mockRealTime = {
        latestBatch: [makeEvent({ source: "resident", id: "evt-3" })],
        eventVersion: 1,
      };
      wrap(<AdminNotificationToast currentTheme="blue" />);
      expect(screen.getByText("Resident Profile Updated")).toBeInTheDocument();
    });

    it("calls playFeedback('notify') when a batch arrives", () => {
      mockRealTime = {
        latestBatch: [makeEvent()],
        eventVersion: 1,
      };
      wrap(<AdminNotificationToast currentTheme="blue" />);
      expect(mockPlayFeedback).toHaveBeenCalledWith("notify");
    });

    it("shows 'Click to view details' prompt on each toast", () => {
      mockRealTime = {
        latestBatch: [makeEvent()],
        eventVersion: 1,
      };
      wrap(<AdminNotificationToast currentTheme="blue" />);
      expect(screen.getByText("Click to view details")).toBeInTheDocument();
    });

    it("shows the event type text on the toast", () => {
      mockRealTime = {
        latestBatch: [makeEvent({ type: "Fire Hazard" })],
        eventVersion: 1,
      };
      wrap(<AdminNotificationToast currentTheme="blue" />);
      expect(screen.getByText(/fire hazard/i)).toBeInTheDocument();
    });
  });

  describe("dismiss", () => {
    it("removes the toast after the dismiss button is clicked and exit animation completes", () => {
      mockRealTime = {
        latestBatch: [makeEvent()],
        eventVersion: 1,
      };
      wrap(<AdminNotificationToast currentTheme="blue" />);
      expect(screen.getByText("New Incident Reported")).toBeInTheDocument();

      const closeBtns = screen.getAllByRole("button");
      fireEvent.click(closeBtns[0]);
      act(() => { jest.advanceTimersByTime(300); });
      expect(screen.queryByText("New Incident Reported")).not.toBeInTheDocument();
    });

    it("auto-dismisses after 5000ms + 300ms exit animation", () => {
      mockRealTime = {
        latestBatch: [makeEvent()],
        eventVersion: 1,
      };
      wrap(<AdminNotificationToast currentTheme="blue" />);
      expect(screen.getByText("New Incident Reported")).toBeInTheDocument();
      act(() => { jest.advanceTimersByTime(5000); }); // starts exit
      act(() => { jest.advanceTimersByTime(300); });  // completes removal
      expect(screen.queryByText("New Incident Reported")).not.toBeInTheDocument();
    });
  });

  describe("batch cap", () => {
    it("shows at most 3 toasts from a batch with more than 3 events", () => {
      mockRealTime = {
        latestBatch: [
          makeEvent({ id: "a", source: "incident" }),
          makeEvent({ id: "b", source: "incident" }),
          makeEvent({ id: "c", source: "incident" }),
          makeEvent({ id: "d", source: "incident" }),
        ],
        eventVersion: 1,
      };
      wrap(<AdminNotificationToast currentTheme="blue" />);
      // Only 3 should render even though 4 were in the batch
      const titles = screen.getAllByText("New Incident Reported");
      expect(titles.length).toBe(3);
    });
  });

  describe("dark theme", () => {
    it("renders without error in dark theme", () => {
      mockRealTime = {
        latestBatch: [makeEvent()],
        eventVersion: 1,
      };
      wrap(<AdminNotificationToast currentTheme="dark" />);
      expect(screen.getByText("New Incident Reported")).toBeInTheDocument();
    });
  });
});
