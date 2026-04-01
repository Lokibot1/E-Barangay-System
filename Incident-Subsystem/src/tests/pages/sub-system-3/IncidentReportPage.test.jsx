import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import IncidentReportPage from "../../../pages/sub-system-3/IncidentReportPage";

// JSDOM stub for IntersectionObserver
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
  incidentReportPage: {
    title: "REPORT A COMMUNITY INCIDENT",
    heroTitle: "HELP US MAINTAIN ORDER AND SAFETY IN OUR STREETS.",
    heroDesc: "Use this platform to alert the Barangay.",
    whatToReport: "WHAT TO REPORT?",
    publicSafety: "PUBLIC SAFETY & TRAFFIC",
    publicSafetyDesc: "Illegal parking, street obstructions.",
    publicNuisance: "PUBLIC NUISANCE",
    publicNuisanceDesc: "Excessive noise, stray animals.",
    environmental: "ENVIRONMENTAL HAZARDS",
    environmentalDesc: "Sudden flooding, illegal dumping.",
    health: "HEALTH HAZARDS",
    healthDesc: "Standing water, unsanitary areas.",
    howToFile: "HOW TO FILE?",
    pinLocation: "PIN THE LOCATION",
    pinLocationDesc: "Use the map to mark the spot.",
    provideDesc: "PROVIDE A BRIEF DESCRIPTION",
    provideDescDesc: "Tell us what is happening.",
    attachProof: "ATTACH PROOF",
    attachProofDesc: "A clear photo is essential.",
    ctaButton: "REPORT AN INCIDENT",
    footer: "Barangay Incident & Complaint Management System. All rights reserved.",
  },
};

jest.mock("../../../context/LanguageContext", () => ({
  useLanguage: () => ({ language: "en", setLanguage: jest.fn(), tr: mockTr }),
}));

jest.mock("../../../components/sub-system-3/MainMenuCards", () =>
  function MockMainMenuCards() { return <div data-testid="main-menu-cards" />; }
);

jest.mock("../../../components/sub-system-3/TwoStepIncidentReportModal", () =>
  function MockModal({ isOpen, onClose }) {
    if (!isOpen) return null;
    return (
      <div data-testid="incident-modal">
        <button onClick={onClose}>Close</button>
      </div>
    );
  }
);

beforeEach(() => localStorage.clear());

describe("IncidentReportPage", () => {
  describe("rendering", () => {
    it("renders the page heading", () => {
      render(<IncidentReportPage />);
      expect(screen.getByRole("heading", { name: /incident & complaint management/i })).toBeInTheDocument();
    });

    it("renders the incident report section title", () => {
      render(<IncidentReportPage />);
      expect(screen.getByText("REPORT A COMMUNITY INCIDENT")).toBeInTheDocument();
    });

    it("renders 'WHAT TO REPORT?' section", () => {
      render(<IncidentReportPage />);
      expect(screen.getByText("WHAT TO REPORT?")).toBeInTheDocument();
    });

    it("renders 4 incident category cards", () => {
      render(<IncidentReportPage />);
      expect(screen.getByText("PUBLIC SAFETY & TRAFFIC")).toBeInTheDocument();
      expect(screen.getByText("PUBLIC NUISANCE")).toBeInTheDocument();
      expect(screen.getByText("ENVIRONMENTAL HAZARDS")).toBeInTheDocument();
      expect(screen.getByText("HEALTH HAZARDS")).toBeInTheDocument();
    });

    it("renders 'HOW TO FILE?' section with 3 steps", () => {
      render(<IncidentReportPage />);
      expect(screen.getByText("HOW TO FILE?")).toBeInTheDocument();
      expect(screen.getByText("PIN THE LOCATION")).toBeInTheDocument();
      expect(screen.getByText("PROVIDE A BRIEF DESCRIPTION")).toBeInTheDocument();
      expect(screen.getByText("ATTACH PROOF")).toBeInTheDocument();
    });

    it("renders the CTA button", () => {
      render(<IncidentReportPage />);
      expect(screen.getByRole("button", { name: /report an incident/i })).toBeInTheDocument();
    });

    it("renders the MainMenuCards component", () => {
      render(<IncidentReportPage />);
      expect(screen.getByTestId("main-menu-cards")).toBeInTheDocument();
    });
  });

  describe("modal interaction", () => {
    it("modal is not visible on initial render", () => {
      render(<IncidentReportPage />);
      expect(screen.queryByTestId("incident-modal")).not.toBeInTheDocument();
    });

    it("opens the TwoStepIncidentReportModal when CTA is clicked", () => {
      render(<IncidentReportPage />);
      fireEvent.click(screen.getByRole("button", { name: /report an incident/i }));
      expect(screen.getByTestId("incident-modal")).toBeInTheDocument();
    });

    it("closes the modal when onClose is called", () => {
      render(<IncidentReportPage />);
      fireEvent.click(screen.getByRole("button", { name: /report an incident/i }));
      expect(screen.getByTestId("incident-modal")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: /close/i }));
      expect(screen.queryByTestId("incident-modal")).not.toBeInTheDocument();
    });
  });

  describe("theme", () => {
    it("defaults to modern theme when localStorage is empty", () => {
      render(<IncidentReportPage />);
      // Page renders without crash with default theme
      expect(screen.getByText("REPORT AN INCIDENT")).toBeInTheDocument();
    });

    it("reads stored theme from localStorage", () => {
      localStorage.setItem("appTheme", "blue");
      render(<IncidentReportPage />);
      expect(screen.getByText("REPORT AN INCIDENT")).toBeInTheDocument();
    });
  });
});
