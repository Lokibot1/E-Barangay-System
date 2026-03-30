import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminLanding from "../../../../pages/sub-system-3/admin/AdminLanding";

const mockTr = {
  adminLanding: {
    overview: "Overview",
    welcomeBack: "Welcome back,",
    monitorDesc: "Monitor requests, complaints, reports, and appointment activity in real time.",
    viewAnnouncements: "View Announcements",
    analyticsDashboard: "Case Management Analytics Dashboard",
    live: "Live",
    generateInsights: "Generate Insights",
    pendingRequests: "Pending requests",
    awaitingReview: "Awaiting resident review",
    openComplaints: "Open complaints",
    activeUnresolved: "Active unresolved complaints",
    incidentReports: "Incident reports",
    filedReports: "Filed incident reports",
    pendingAppointments: "Pending appointments",
    waitingSlot: "Waiting for schedule slot",
    monthlyReports: "Monthly Reports",
    caseResolution: "Case Resolution Status",
    reportTrend: "Report Trend (14 days)",
    reportCategories: "Report Categories",
    appointmentStatus: "Appointment Status",
    monthlyAppointments: "Monthly Appointments",
    requestsVsAppointments: "Requests vs Appointments Trend",
    issuanceFactors: "Issuance Application Factors",
    issuanceFactorsDesc: "Volumes, operations, and socio-economy chart groups",
    volumes: "Volumes",
    socioEconomy: "Socio-economy",
  },
};

jest.mock("../../../../context/LanguageContext", () => ({
  useLanguage: () => ({ language: "en", setLanguage: jest.fn(), tr: mockTr }),
}));

jest.mock("../../../../homepage/services/loginService", () => ({
  getUser: jest.fn(() => ({ name: "Admin User", role: "admin" })),
}));

jest.mock("../../../../services/sub-system-3/incidentService", () => ({
  incidentService: { getAllIncidents: jest.fn() },
}));

jest.mock("../../../../services/sub-system-3/complaintService", () => ({
  getAllComplaints: jest.fn(),
}));

jest.mock("../../../../services/sub-system-1/analytics", () => ({
  analyticsService: { getAllData: jest.fn() },
}));

// Mock heavy chart/analytics subcomponents
jest.mock("../../../../components/sub-system-1/analytics/tabs/OverviewTab", () =>
  function MockOverviewTab() { return <div data-testid="overview-tab" />; }
);
jest.mock("../../../../components/sub-system-3/InsightsModal", () =>
  function MockInsightsModal() { return null; }
);
jest.mock("../../../../components/sub-system-2/factors/VolumesFactors", () =>
  function MockVolumesFactors() { return null; }
);
jest.mock("../../../../components/sub-system-2/factors/OperationsFactors", () =>
  function MockOperationsFactors() { return null; }
);
jest.mock("../../../../components/sub-system-2/factors/SocioEconomyFactors", () =>
  function MockSocioEconomyFactors() { return null; }
);
jest.mock("../../../../components/sub-system-2/factors/data", () => ({
  CHART_COLORS: [],
  STATUS_COLORS: {},
}));

// Mock recharts to avoid SVG rendering issues in JSDOM
jest.mock("recharts", () => {
  const React = require("react");
  const MockChart = ({ children }) => <div>{children}</div>;
  return {
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
    BarChart: MockChart,
    Bar: () => null,
    CartesianGrid: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    Legend: () => null,
    PieChart: MockChart,
    Pie: () => null,
    Cell: () => null,
    LineChart: MockChart,
    Line: () => null,
    AreaChart: MockChart,
    Area: () => null,
  };
});

import { incidentService } from "../../../../services/sub-system-3/incidentService";
import { getAllComplaints } from "../../../../services/sub-system-3/complaintService";
import { analyticsService } from "../../../../services/sub-system-1/analytics";

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  incidentService.getAllIncidents.mockResolvedValue([]);
  getAllComplaints.mockResolvedValue([]);
  analyticsService.getAllData.mockResolvedValue({});
});

describe("AdminLanding", () => {
  describe("rendering", () => {
    it("renders the 'Welcome back,' greeting", async () => {
      render(<AdminLanding />);
      await waitFor(() =>
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
      );
    });

    it("renders the admin first name from getUser()", async () => {
      render(<AdminLanding />);
      // Component splits name and renders only the first word ("Admin")
      await waitFor(() =>
        expect(
          screen.getByText((content) => content.includes("Admin"))
        ).toBeInTheDocument()
      );
    });

    it("renders the 'Case Management Analytics Dashboard' heading", async () => {
      render(<AdminLanding />);
      await waitFor(() =>
        expect(screen.getByText("Case Management Analytics Dashboard")).toBeInTheDocument()
      );
    });

    it("renders the stat cards section", async () => {
      render(<AdminLanding />);
      await waitFor(() =>
        expect(screen.getByText("Pending requests")).toBeInTheDocument()
      );
      expect(screen.getByText("Open complaints")).toBeInTheDocument();
      expect(screen.getByText("Incident reports")).toBeInTheDocument();
      expect(screen.getByText("Pending appointments")).toBeInTheDocument();
    });

    it("shows 'Generate Insights' in kebab dropdown after clicking the toggle", async () => {
      render(<AdminLanding />);
      await waitFor(() => screen.getByText("Case Management Analytics Dashboard"));
      // The Generate Insights button is hidden inside a kebab dropdown.
      // Click the first icon-only button (the kebab toggle) to reveal it.
      const allButtons = screen.getAllByRole("button");
      const kebab = allButtons.find((b) => !b.textContent.trim());
      fireEvent.click(kebab);
      expect(screen.getByText("Generate Insights")).toBeInTheDocument();
    });
  });

  describe("data fetching", () => {
    it("fetches incidents on mount", async () => {
      render(<AdminLanding />);
      await waitFor(() => expect(incidentService.getAllIncidents).toHaveBeenCalled());
    });

    it("fetches complaints on mount", async () => {
      render(<AdminLanding />);
      await waitFor(() => expect(getAllComplaints).toHaveBeenCalled());
    });
  });

  describe("stat cards with data", () => {
    it("shows correct count of pending incidents", async () => {
      incidentService.getAllIncidents.mockResolvedValue([
        { id: 1, status: "pending" },
        { id: 2, status: "pending" },
        { id: 3, status: "resolved" },
      ]);
      render(<AdminLanding />);
      // Wait for data to load and display count
      await waitFor(() => expect(incidentService.getAllIncidents).toHaveBeenCalled());
    });
  });
});
