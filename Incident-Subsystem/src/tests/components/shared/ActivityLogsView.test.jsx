import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import themeTokens from "../../../Themetokens";

// ── Mock IntersectionObserver (not in JSDOM) ─────────────────────────────
beforeAll(() => {
  global.IntersectionObserver = class {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

// ── Mock services ────────────────────────────────────────────────────────
jest.mock("../../../homepage/services/auditLogService", () => ({
  fetchAuditLogs: jest.fn(),
  fetchVerificationAdminLogs: jest.fn(),
}));
jest.mock("../../../services/shared/cache", () => ({
  memCache: { get: jest.fn(() => null), set: jest.fn() },
}));
jest.mock("../../../services/sub-system-1/residents", () => ({
  residentService: { getAllLogs: jest.fn() },
}));
jest.mock("../../../services/sub-system-1/household", () => ({
  householdService: { getAllLogs: jest.fn() },
}));

// ── Mock DatePickerField to a simple input ───────────────────────────────
jest.mock("../../../components/shared/DatePickerField", () => {
  const React = require("react");
  return function MockDatePickerField({ value, onChange, placeholder }) {
    return (
      <input
        data-testid="date-picker"
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  };
});

import {
  fetchAuditLogs,
  fetchVerificationAdminLogs,
} from "../../../homepage/services/auditLogService";
import { residentService } from "../../../services/sub-system-1/residents";
import { householdService } from "../../../services/sub-system-1/household";
import ActivityLogsView from "../../../components/shared/ActivityLogsView";

const t = themeTokens.blue;

beforeEach(() => {
  fetchAuditLogs.mockResolvedValue({ data: [], meta: { last_page: 1 } });
  fetchVerificationAdminLogs.mockResolvedValue({ data: [] });
  residentService.getAllLogs.mockResolvedValue([]);
  householdService.getAllLogs.mockResolvedValue([]);
});
afterEach(() => jest.clearAllMocks());

const wrap = (props = {}) =>
  render(
    <MemoryRouter>
      <ActivityLogsView t={t} isDark={false} {...props} />
    </MemoryRouter>
  );

const makeLog = (overrides = {}) => ({
  id: "log-1",
  action: "updated",
  auditable_type: "incident",
  auditable_id: "INC-001",
  user: { name: "Admin User", role: "admin" },
  old_values: { status: "pending" },
  new_values: { status: "resolved" },
  created_at: "2024-03-01T10:00:00Z",
  subject_name: "Alice",
  ip_address: "127.0.0.1",
  source: "system",
  ...overrides,
});

describe("ActivityLogsView", () => {
  describe("initial load", () => {
    it("fetches audit logs on mount", async () => {
      wrap();
      await waitFor(() => expect(fetchAuditLogs).toHaveBeenCalled());
    });

    it("fetches verification logs on mount", async () => {
      wrap();
      await waitFor(() => expect(fetchVerificationAdminLogs).toHaveBeenCalled());
    });

    it("fetches resident logs on mount", async () => {
      wrap();
      await waitFor(() => expect(residentService.getAllLogs).toHaveBeenCalled());
    });

    it("fetches household logs on mount", async () => {
      wrap();
      await waitFor(() => expect(householdService.getAllLogs).toHaveBeenCalled());
    });

    it("renders a search input", async () => {
      wrap();
      await waitFor(() =>
        expect(screen.getByPlaceholderText(/search by user/i)).toBeInTheDocument()
      );
    });
  });

  describe("with log entries", () => {
    beforeEach(() => {
      fetchAuditLogs.mockResolvedValue({
        data: [makeLog()],
        meta: { last_page: 1 },
      });
    });

    it("shows the actor name in the log entry", async () => {
      wrap();
      await waitFor(() =>
        expect(screen.getByText("Admin User")).toBeInTheDocument()
      );
    });

    it("shows the 'Updated' action badge", async () => {
      wrap();
      await waitFor(() =>
        expect(screen.getByText("Updated")).toBeInTheDocument()
      );
    });

    it("shows the record type label 'Incident Report'", async () => {
      wrap();
      await waitFor(() =>
        expect(screen.getByText("Incident Report")).toBeInTheDocument()
      );
    });
  });

  describe("search filter", () => {
    beforeEach(() => {
      fetchAuditLogs.mockResolvedValue({
        data: [
          makeLog({ user: { name: "Alice", role: "admin" }, id: "log-a" }),
          makeLog({ user: { name: "Bob", role: "admin" }, id: "log-b" }),
        ],
        meta: { last_page: 1 },
      });
    });

    it("filters log entries by actor name", async () => {
      wrap();
      await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument());

      fireEvent.change(screen.getByPlaceholderText(/search by user/i), {
        target: { value: "Bob" },
      });
      // Wait for the 250ms debounce to apply the filter
      await waitFor(() =>
        expect(screen.queryByText("Alice")).not.toBeInTheDocument(),
        { timeout: 1000 }
      );
      expect(screen.getByText("Bob")).toBeInTheDocument();
    });

    it("shows all entries when search is cleared", async () => {
      wrap();
      await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument());

      const input = screen.getByPlaceholderText(/search by user/i);
      fireEvent.change(input, { target: { value: "Bob" } });
      await waitFor(() => expect(screen.queryByText("Alice")).not.toBeInTheDocument(), { timeout: 1000 });
      fireEvent.change(input, { target: { value: "" } });
      await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument(), { timeout: 1000 });
      expect(screen.getByText("Bob")).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("shows 'No activity logs found' when there are no logs", async () => {
      wrap();
      await waitFor(() =>
        expect(screen.getByText("No activity logs found")).toBeInTheDocument()
      );
    });

    it("shows 'No logs match your filters' after filtering with no results", async () => {
      fetchAuditLogs.mockResolvedValue({
        data: [makeLog()],
        meta: { last_page: 1 },
      });
      wrap();
      await waitFor(() => expect(screen.getByText("Admin User")).toBeInTheDocument());

      fireEvent.change(screen.getByPlaceholderText(/search by user/i), {
        target: { value: "zzznomatch" },
      });
      await waitFor(() =>
        expect(screen.getByText("No logs match your filters")).toBeInTheDocument(),
        { timeout: 1000 }
      );
    });
  });

  describe("back button", () => {
    it("renders a 'Back to Profile' button when onBack is provided", async () => {
      wrap({ onBack: jest.fn() });
      await waitFor(() =>
        expect(screen.getByRole("button", { name: /back to profile/i })).toBeInTheDocument()
      );
    });

    it("does not render a back button when onBack is not provided", async () => {
      wrap();
      await waitFor(() => expect(fetchAuditLogs).toHaveBeenCalled());
      expect(screen.queryByRole("button", { name: /back to profile/i })).not.toBeInTheDocument();
    });

    it("calls onBack when the back button is clicked", async () => {
      const onBack = jest.fn();
      wrap({ onBack });
      await waitFor(() =>
        expect(screen.getByRole("button", { name: /back to profile/i })).toBeInTheDocument()
      );
      fireEvent.click(screen.getByRole("button", { name: /back to profile/i }));
      expect(onBack).toHaveBeenCalledTimes(1);
    });
  });

  describe("date filter", () => {
    it("renders date picker fields for 'From date' and 'To date'", async () => {
      wrap();
      await waitFor(() =>
        expect(screen.getByPlaceholderText("From date")).toBeInTheDocument()
      );
      expect(screen.getByPlaceholderText("To date")).toBeInTheDocument();
    });
  });

  describe("dark theme", () => {
    it("renders without error in dark theme", async () => {
      wrap({ t: themeTokens.dark, isDark: true });
      await waitFor(() =>
        expect(screen.getByPlaceholderText(/search by user/i)).toBeInTheDocument()
      );
    });
  });
});
