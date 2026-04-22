import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CaseManagementPage from "../../../pages/sub-system-3/CaseManagementPage";

beforeAll(() => {
  global.IntersectionObserver = class {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const mockTr = {
  incidentMap: { title: "INCIDENT & COMPLAINT MANAGEMENT" },
  caseManagement: {
    title: "CASE TRACKER",
    myComplaints: "My Complaints",
    myIncidents: "My Incidents",
    searchPlaceholder: "Search cases…",
    noComplaints: "You have no complaints filed.",
    noIncidents: "You have no incidents reported.",
    status: "Status",
    date: "Date",
    type: "Type",
    location: "Location",
    severity: "Severity",
    viewDetails: "View Details",
    pending: "Pending",
    ongoing: "Ongoing",
    resolved: "Resolved",
    rejected: "Rejected",
    all: "All",
    loading: "Loading your cases…",
    appointmentsSubtitle: "Barangay hearing appointments",
    appointmentList: "Appointment List",
    total: "total",
    appointment: "Appointment",
    time: "Time",
    noAppointmentsFound: "No appointments found",
    noAppointmentsYet: "You have no barangay appointments yet.",
    allShown: "All {n} appointment(s) shown",
    whereToGo: "Where to Go",
    gulodBarangayHall: "Gulod Barangay Hall",
    complaintType: "Complaint Type",
    respondent: "Respondent",
    respondentAddress: "Respondent Address",
    appointmentId: "Appointment ID",
    complaintId: "Complaint ID",
    notes: "Notes",
    gridView: "Grid View",
    mapView: "Map View",
    onGoing: "On-Going",
    footer: "Barangay Incident & Complaint Management System. All rights reserved.",
  },
};

jest.mock("../../../context/LanguageContext", () => ({
  useLanguage: () => ({ language: "en", setLanguage: jest.fn(), tr: mockTr }),
}));

jest.mock("../../../context/UserRealTimeContext", () => ({
  useUserRealTime: () => ({ eventVersion: 0, latestBatch: [] }),
}));

jest.mock("../../../services/sub-system-3/incidentService", () => ({
  incidentService: {
    getMyIncidents: jest.fn(),
    getMyAppointments: jest.fn(),
  },
}));

jest.mock("../../../services/sub-system-3/complaintService", () => ({
  getMyComplaints: jest.fn(),
}));

jest.mock("../../../components/sub-system-3/MainMenuCards", () =>
  function MockMainMenuCards() { return <div data-testid="main-menu-cards" />; }
);

// TabsComponent manages its own tab labels internally — no `tabs` prop is passed
jest.mock("../../../components/sub-system-3/TabsComponent", () =>
  function MockTabsComponent({ activeTab, onTabChange }) {
    return (
      <div data-testid="tabs">
        <button onClick={() => onTabChange("complaints")}>My Complaints</button>
        <button onClick={() => onTabChange("incidents")}>My Incidents</button>
        <button onClick={() => onTabChange("appointments")}>Appointments</button>
      </div>
    );
  }
);

jest.mock("../../../components/sub-system-3/ReportCard", () =>
  function MockReportCard({ report }) {
    return <div data-testid="report-card">{report.id}</div>;
  }
);

jest.mock("../../../components/sub-system-3/Reportdetailmodal", () =>
  function MockReportDetailModal({ isOpen }) {
    if (!isOpen) return null;
    return <div data-testid="detail-modal" />;
  }
);

jest.mock("../../../components/shared/MapComponent", () =>
  function MockMapComponent() { return <div data-testid="map-component" />; }
);

import { incidentService } from "../../../services/sub-system-3/incidentService";
import { getMyComplaints } from "../../../services/sub-system-3/complaintService";

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  incidentService.getMyIncidents.mockResolvedValue([]);
  incidentService.getMyAppointments.mockResolvedValue([]);
  getMyComplaints.mockResolvedValue([]);
});

describe("CaseManagementPage", () => {
  describe("rendering", () => {
    it("renders the CASE TRACKER heading", async () => {
      render(<MemoryRouter><CaseManagementPage /></MemoryRouter>);
      await waitFor(() =>
        expect(screen.getByText("CASE TRACKER")).toBeInTheDocument()
      );
    });

    it("renders the MainMenuCards component", () => {
      render(<MemoryRouter><CaseManagementPage /></MemoryRouter>);
      expect(screen.getByTestId("main-menu-cards")).toBeInTheDocument();
    });

    it("renders the tabs component", async () => {
      render(<MemoryRouter><CaseManagementPage /></MemoryRouter>);
      await waitFor(() =>
        expect(screen.getByTestId("tabs")).toBeInTheDocument()
      );
    });
  });

  describe("tabs", () => {
    it("shows complaints tab as default active tab", async () => {
      render(<MemoryRouter><CaseManagementPage /></MemoryRouter>);
      await waitFor(() =>
        expect(screen.getAllByText("My Complaints").length).toBeGreaterThan(0)
      );
    });

    it("switches to incidents tab when clicked", async () => {
      render(<MemoryRouter><CaseManagementPage /></MemoryRouter>);
      await waitFor(() => screen.getByText("My Incidents"));
      fireEvent.click(screen.getByText("My Incidents"));
      // After switching, incidents tab is active — no crash
      expect(screen.getByTestId("tabs")).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("shows empty complaint message when no complaints exist", async () => {
      getMyComplaints.mockResolvedValue([]);
      render(<MemoryRouter><CaseManagementPage /></MemoryRouter>);
      await waitFor(() =>
        expect(screen.getAllByText("You have no complaints filed.").length).toBeGreaterThan(0)
      );
    });

    it("fetches complaints on mount", async () => {
      render(<MemoryRouter><CaseManagementPage /></MemoryRouter>);
      await waitFor(() => expect(getMyComplaints).toHaveBeenCalled());
    });

    it("fetches incidents when incidents tab is clicked", async () => {
      render(<MemoryRouter><CaseManagementPage /></MemoryRouter>);
      await waitFor(() => screen.getByText("My Incidents"));
      fireEvent.click(screen.getByText("My Incidents"));
      await waitFor(() => expect(incidentService.getMyIncidents).toHaveBeenCalled());
    });
  });

  describe("error handling", () => {
    it("shows an error toast when fetching complaints fails", async () => {
      getMyComplaints.mockRejectedValue(new Error("Network error"));
      render(<MemoryRouter><CaseManagementPage /></MemoryRouter>);
      await waitFor(() =>
        expect(screen.getByText("Load Failed")).toBeInTheDocument()
      );
    });

    it("shows an error toast when fetching incidents fails", async () => {
      incidentService.getMyIncidents.mockRejectedValue(new Error("Server error"));
      render(<MemoryRouter><CaseManagementPage /></MemoryRouter>);
      await waitFor(() => screen.getByText("My Incidents"));
      fireEvent.click(screen.getByText("My Incidents"));
      await waitFor(() =>
        expect(screen.getByText("Load Failed")).toBeInTheDocument()
      );
    });
  });

  describe("with data", () => {
    const makeComplaint = (id) => ({
      id,
      complaint_type: "Noise",
      location: "Test Location",
      status: "pending",
      created_at: "2024-01-01T00:00:00Z",
      description: "Test complaint",
    });

    it("renders a ReportCard for each complaint", async () => {
      getMyComplaints.mockResolvedValue([makeComplaint(1), makeComplaint(2)]);
      render(<MemoryRouter><CaseManagementPage /></MemoryRouter>);
      await waitFor(() =>
        expect(screen.getAllByTestId("report-card").length).toBe(2)
      );
    });
  });
});
