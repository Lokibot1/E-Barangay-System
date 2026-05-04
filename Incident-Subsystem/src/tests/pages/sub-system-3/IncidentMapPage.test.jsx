import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import IncidentMapPage from "../../../pages/sub-system-3/IncidentMapPage";

// JSDOM stub for IntersectionObserver
beforeAll(() => {
  global.IntersectionObserver = class {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

// ── Mock leaflet ──────────────────────────────────────────────────────────────
jest.mock("leaflet", () => ({
  Icon: { Default: { prototype: {}, mergeOptions: jest.fn() } },
  divIcon: jest.fn(() => ({})),
  latLngBounds: jest.fn(() => ({ pad: jest.fn(() => ({ isValid: () => true })) })),
}));
jest.mock("leaflet/dist/leaflet.css", () => {});

// ── Mock react-leaflet ────────────────────────────────────────────────────────
jest.mock("react-leaflet", () => {
  const React = require("react");
  return {
    MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
    TileLayer: () => null,
    Polygon: () => null,
    CircleMarker: () => null,
    Popup: ({ children }) => <div>{children}</div>,hat 
  };
});

const mockTr = {
  incidentMap: {
    title: "INCIDENT MAP",
    subtitle: "Real-time map of reported incidents in the barangay",
    filterByType: "Filter by Type",
    allTypes: "All Types",
    incidents: "Incidents",
    complaints: "Complaints",
    legend: "Legend",
    noData: "No incidents to display.",
    loading: "Loading map data…",
    viewReport: "View Report",
    exploreTitle: "EXPLORE THE LIVE INCIDENT MAP",
    exploreDesc: "See all the incidents and complaints you have filed.",
    incidentMapping: "INCIDENT MAPPING",
    legendNewActive: "NEW/ACTIVE",
    legendNewActiveDesc: "Issue recently reported and awaiting dispatch.",
    legendInProgress: "IN-PROGRESS",
    legendInProgressDesc: "Barangay officials are on-site.",
    legendResolved: "RESOLVED",
    legendResolvedDesc: "Issue has been cleared or fixed.",
    noLocationData: "None of your submitted reports include location data.",
    footer: "Barangay Incident & Complaint Management System. All rights reserved.",
  },
};

jest.mock("../../../context/LanguageContext", () => ({
  useLanguage: () => ({ language: "en", setLanguage: jest.fn(), tr: mockTr }),
}));

jest.mock("../../../services/sub-system-3/incidentService", () => ({
  incidentService: { getMyIncidents: jest.fn() },
}));

jest.mock("../../../services/sub-system-3/complaintService", () => ({
  getMyComplaints: jest.fn(),
}));

jest.mock("../../../components/sub-system-3/MainMenuCards", () =>
  function MockMainMenuCards() { return <div data-testid="main-menu-cards" />; }
);

import { incidentService } from "../../../services/sub-system-3/incidentService";
import { getMyComplaints } from "../../../services/sub-system-3/complaintService";

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  incidentService.getMyIncidents.mockResolvedValue([]);
  getMyComplaints.mockResolvedValue([]);
});

describe("IncidentMapPage", () => {
  describe("rendering", () => {
    it("renders the INCIDENT MAP heading", async () => {
      render(<IncidentMapPage />);
      await waitFor(() =>
        expect(screen.getByText("INCIDENT MAP")).toBeInTheDocument()
      );
    });

    it("renders the map container", async () => {
      render(<IncidentMapPage />);
      await waitFor(() =>
        expect(screen.getByTestId("map-container")).toBeInTheDocument()
      );
    });

    it("renders the MainMenuCards component", () => {
      render(<IncidentMapPage />);
      expect(screen.getByTestId("main-menu-cards")).toBeInTheDocument();
    });

    it("renders the legend section", async () => {
      render(<IncidentMapPage />);
      await waitFor(() =>
        expect(screen.getByText(/legend/i)).toBeInTheDocument()
      );
    });

    it("renders legend items", async () => {
      render(<IncidentMapPage />);
      await waitFor(() =>
        expect(screen.getByText("NEW/ACTIVE")).toBeInTheDocument()
      );
      expect(screen.getByText("IN-PROGRESS")).toBeInTheDocument();
      expect(screen.getByText("RESOLVED")).toBeInTheDocument();
    });
  });

  describe("data fetching", () => {
    it("fetches incidents on mount", async () => {
      render(<IncidentMapPage />);
      await waitFor(() => expect(incidentService.getMyIncidents).toHaveBeenCalled());
    });

    it("fetches complaints on mount", async () => {
      render(<IncidentMapPage />);
      await waitFor(() => expect(getMyComplaints).toHaveBeenCalled());
    });

    it("shows 'no location data' message when reports have no coordinates", async () => {
      incidentService.getMyIncidents.mockResolvedValue([
        { id: 1, latitude: null, longitude: null, status: "pending", incident_type: "Noise" },
      ]);
      render(<IncidentMapPage />);
      await waitFor(() =>
        expect(screen.getByText(/none of your submitted reports include location data/i)).toBeInTheDocument()
      );
    });
  });

  describe("error handling", () => {
    it("shows an error toast when map markers fail to load", async () => {
      incidentService.getMyIncidents.mockRejectedValue(new Error("Network error"));
      render(<IncidentMapPage />);
      await waitFor(() =>
        expect(screen.getByText("Map Load Failed")).toBeInTheDocument()
      );
    });
  });

  describe("explore section", () => {
    it("renders the 'INCIDENT MAPPING' sub-heading", async () => {
      render(<IncidentMapPage />);
      await waitFor(() =>
        expect(screen.getByText("INCIDENT MAPPING")).toBeInTheDocument()
      );
    });
  });
});
