import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminIncidentReports from "../../../../pages/sub-system-3/admin/AdminIncidentReports";

// ── Mock leaflet ──────────────────────────────────────────────────────────────
jest.mock("leaflet", () => ({
  Icon: { Default: { prototype: {}, mergeOptions: jest.fn() } },
  divIcon: jest.fn(() => ({})),
  latLngBounds: jest.fn(() => ({ pad: jest.fn(() => ({ isValid: () => true })) })),
}));
jest.mock("leaflet/dist/leaflet.css", () => {});

jest.mock("react-leaflet", () => {
  const React = require("react");
  return {
    MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
    TileLayer: () => null,
    Polygon: () => null,
    CircleMarker: () => null,
    Popup: ({ children }) => <div>{children}</div>,
  };
});

// ── Mock jsPDF ────────────────────────────────────────────────────────────────
jest.mock("jspdf", () => {
  return jest.fn().mockImplementation(() => ({
    addImage: jest.fn(),
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    setTextColor: jest.fn(),
    text: jest.fn(),
    line: jest.fn(),
    autoTable: jest.fn(),
    save: jest.fn(),
    internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } },
  }));
});

const mockTr = {
  sub1: { search: "Search…", filter: "Filter" },
  adminIncidents: {
    title: "Incident & Complaint Management",
    incidents: "Incidents",
    complaints: "Complaints",
    searchPlaceholder: "Search by description, location, type…",
    filter: "Filter",
    all: "All",
    pending: "Pending",
    ongoing: "Ongoing",
    resolved: "Resolved",
    rejected: "Rejected",
    downloadAsPDF: "Download as PDF",
    downloadAsPNG: "Download as PNG",
    noReportsFound: "No records found.",
    id: "ID",
    date: "Date",
    type: "Type",
    location: "Location",
    severity: "Severity",
    status: "Status",
    actions: "Actions",
    viewDetails: "View Details",
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
    updateStatus: "Update Status",
    generateInsights: "Generate Insights",
    reportDetails: "Report Details",
    loading: "Loading…",
    startDate: "Start Date",
    endDate: "End Date",
    fileComplaint: "File Complaint",
    typeOfIncident: "Type of Incident",
    typeOfComplaint: "Type of Complaint",
    reportedBy: "Reported By",
    showingResults: "{from}–{to} of {total}",
    incidentId: "Incident ID",
    complaintId: "Complaint ID",
    updateIncidentForm: "Update Incident",
    updateComplaintForm: "Update Complaint",
    mapLegend: "Map Legend",
    legendNewActive: "NEW/ACTIVE",
    legendNewActiveDesc: "Recently reported.",
    legendInProgress: "IN-PROGRESS",
    legendInProgressDesc: "Officials on-site.",
    legendResolved: "RESOLVED",
    legendResolvedDesc: "Issue cleared.",
    legendDispatched: "DISPATCHED",
    legendDispatchedDesc: "Dispatched.",
    legendRejected: "REJECTED",
    legendRejectedDesc: "Rejected.",
    prev: "Prev",
    next: "Next",
  },
};

jest.mock("../../../../context/LanguageContext", () => ({
  useLanguage: () => ({ language: "en", setLanguage: jest.fn(), tr: mockTr }),
}));

jest.mock("../../../../context/RealTimeContext", () => ({
  useRealTime: () => ({ latestBatch: [], eventVersion: 0 }),
}));

jest.mock("../../../../services/sub-system-3/incidentService", () => ({
  incidentService: { getAllIncidents: jest.fn() },
}));

jest.mock("../../../../services/sub-system-3/complaintService", () => ({
  getAllComplaints: jest.fn(),
}));

jest.mock("../../../../components/sub-system-3/AdminReportDetailsModal", () =>
  function MockAdminReportDetailsModal({ isOpen }) {
    if (!isOpen) return null;
    return <div data-testid="admin-report-details-modal" />;
  }
);

jest.mock("../../../../components/sub-system-3/InsightsModal", () =>
  function MockInsightsModal({ isOpen }) {
    if (!isOpen) return null;
    return <div data-testid="insights-modal" />;
  }
);

jest.mock("../../../../components/sub-system-3/UpdateFormModal", () =>
  function MockUpdateFormModal({ isOpen }) {
    if (!isOpen) return null;
    return <div data-testid="update-form-modal" />;
  }
);

jest.mock("../../../../components/sub-system-3/ComplaintModal", () =>
  function MockComplaintModal({ isOpen }) {
    if (!isOpen) return null;
    return <div data-testid="complaint-modal" />;
  }
);

jest.mock("../../../../components/shared/modals/Toast", () =>
  function MockToast({ toasts = [] }) {
    return (
      <div data-testid="toast-container">
        {toasts.map((t) => (
          <div key={t.id} data-testid="toast" role="alert">
            <span>{t.title}</span>
            {t.message && <span>{t.message}</span>}
          </div>
        ))}
      </div>
    );
  }
);

jest.mock("../../../../components/shared/DatePickerField", () => {
  const React = require("react");
  return function MockDatePickerField({ placeholder }) {
    return <input placeholder={placeholder} />;
  };
});

import { incidentService } from "../../../../services/sub-system-3/incidentService";
import { getAllComplaints } from "../../../../services/sub-system-3/complaintService";

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  incidentService.getAllIncidents.mockResolvedValue([]);
  getAllComplaints.mockResolvedValue([]);
});

const wrap = () =>
  render(
    <MemoryRouter>
      <AdminIncidentReports />
    </MemoryRouter>
  );

describe("AdminIncidentReports", () => {
  describe("rendering", () => {
    it("renders the page title", async () => {
      wrap();
      await waitFor(() =>
        expect(screen.getByText("Incident & Complaint Management")).toBeInTheDocument()
      );
    });

    it("renders the Incidents tab", async () => {
      wrap();
      await waitFor(() =>
        expect(screen.getByRole("button", { name: /^incidents$/i })).toBeInTheDocument()
      );
    });

    it("renders the Complaints tab", async () => {
      wrap();
      await waitFor(() =>
        expect(screen.getByRole("button", { name: /^complaints$/i })).toBeInTheDocument()
      );
    });

    it("renders the search input", async () => {
      wrap();
      await waitFor(() =>
        expect(
          screen.getByPlaceholderText(/search by description/i)
        ).toBeInTheDocument()
      );
    });

    it("renders the map download toggle button", async () => {
      wrap();
      // The download dropdown toggle is always visible (title="Download Map")
      await waitFor(() =>
        expect(screen.getByTitle("Download Map")).toBeInTheDocument()
      );
    });
  });

  describe("data fetching", () => {
    it("fetches all incidents on mount", async () => {
      wrap();
      await waitFor(() => expect(incidentService.getAllIncidents).toHaveBeenCalled());
    });

    it("fetches all complaints on mount", async () => {
      wrap();
      await waitFor(() => expect(getAllComplaints).toHaveBeenCalled());
    });
  });

  describe("empty state", () => {
    it("shows 'No records found.' when no incidents exist", async () => {
      wrap();
      await waitFor(() =>
        expect(screen.getByText("No records found.")).toBeInTheDocument()
      );
    });
  });

  describe("error handling", () => {
    it("shows an error toast when reports fail to load", async () => {
      incidentService.getAllIncidents.mockRejectedValue(new Error("Network error"));
      wrap();
      await waitFor(() =>
        expect(screen.getByText("Load Failed")).toBeInTheDocument()
      );
    });
  });

  describe("with data", () => {
    const makeIncident = (id) => ({
      id,
      incident_type: "Flooding",
      location: "Test St.",
      severity: "medium",
      status: "pending",
      description: "Water overflowing",
      created_at: "2024-01-01T00:00:00Z",
    });

    it("renders incident rows when data is loaded", async () => {
      incidentService.getAllIncidents.mockResolvedValue([makeIncident(1), makeIncident(2)]);
      wrap();
      // The row renders inc.type ("Flooding"), not location — location has no table column
      await waitFor(() =>
        expect(screen.getAllByText(/flooding/i).length).toBeGreaterThan(0)
      );
    });
  });
});
