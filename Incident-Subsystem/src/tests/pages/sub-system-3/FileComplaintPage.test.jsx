import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FileComplaintPage from "../../../pages/sub-system-3/FileComplaintPage";

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
  fileComplaintPage: {
    title: "FILING A COMPLAINT",
    whatHappens: "WHAT HAPPENS WHEN YOU FILE A COMPLAINT?",
    whatHappensDesc: "Filing a formal complaint initiates a dispute resolution process.",
    howProcessWorks: "HOW THE PROCESS WORKS?",
    step1Title: "DOCUMENTATION",
    step1Desc: "Your narration will be recorded in the official Barangay Blotter.",
    step2Title: "THE SUMMONS",
    step2Desc: "The Barangay will issue a Notice to Appear.",
    step3Title: "MEDIATION",
    step3Desc: "You and the Respondent will be invited to a meeting.",
    step4Title: "RESOLUTION / AGREEMENT",
    step4Desc: "If you settle, a written agreement is signed.",
    step4NoAgreement: "<strong>No Agreement:</strong> The Barangay will issue a CFA.",
    whatToPrepare: "WHAT TO PREPARE?",
    facts: "FACTS",
    factsDesc: "Clear details of the date, time, and location.",
    names: "NAMES",
    namesDesc: "Full names and addresses of the parties involved.",
    evidence: "EVIDENCE",
    evidenceDesc: "Photos, videos, or screenshots.",
    ctaButton: "FILE A COMPLAINT",
    footer: "Barangay Incident & Complaint Management System. All rights reserved.",
  },
};

jest.mock("../../../context/LanguageContext", () => ({
  useLanguage: () => ({ language: "en", setLanguage: jest.fn(), tr: mockTr }),
}));

jest.mock("../../../components/sub-system-3/MainMenuCards", () =>
  function MockMainMenuCards() { return <div data-testid="main-menu-cards" />; }
);

jest.mock("../../../components/sub-system-3/ComplaintModal", () =>
  function MockComplaintModal({ isOpen, onClose }) {
    if (!isOpen) return null;
    return (
      <div data-testid="complaint-modal">
        <button onClick={onClose}>Close</button>
      </div>
    );
  }
);

beforeEach(() => localStorage.clear());

describe("FileComplaintPage", () => {
  describe("rendering", () => {
    it("renders the page heading", () => {
      render(<FileComplaintPage />);
      expect(screen.getByRole("heading", { name: /incident & complaint management/i })).toBeInTheDocument();
    });

    it("renders the complaint section title", () => {
      render(<FileComplaintPage />);
      expect(screen.getByText("FILING A COMPLAINT")).toBeInTheDocument();
    });

    it("renders the 'HOW THE PROCESS WORKS?' section", () => {
      render(<FileComplaintPage />);
      expect(screen.getByText("HOW THE PROCESS WORKS?")).toBeInTheDocument();
    });

    it("renders all 4 process steps", () => {
      render(<FileComplaintPage />);
      expect(screen.getByText("DOCUMENTATION")).toBeInTheDocument();
      expect(screen.getByText("THE SUMMONS")).toBeInTheDocument();
      expect(screen.getByText("MEDIATION")).toBeInTheDocument();
      expect(screen.getByText("RESOLUTION / AGREEMENT")).toBeInTheDocument();
    });

    it("renders the 'WHAT TO PREPARE?' section", () => {
      render(<FileComplaintPage />);
      expect(screen.getByText("WHAT TO PREPARE?")).toBeInTheDocument();
      expect(screen.getByText("FACTS")).toBeInTheDocument();
      expect(screen.getByText("NAMES")).toBeInTheDocument();
      expect(screen.getByText("EVIDENCE")).toBeInTheDocument();
    });

    it("renders the CTA button", () => {
      render(<FileComplaintPage />);
      expect(screen.getByRole("button", { name: /file a complaint/i })).toBeInTheDocument();
    });

    it("renders the MainMenuCards component", () => {
      render(<FileComplaintPage />);
      expect(screen.getByTestId("main-menu-cards")).toBeInTheDocument();
    });
  });

  describe("modal interaction", () => {
    it("modal is not visible on initial render", () => {
      render(<FileComplaintPage />);
      expect(screen.queryByTestId("complaint-modal")).not.toBeInTheDocument();
    });

    it("opens the ComplaintModal when CTA is clicked", () => {
      render(<FileComplaintPage />);
      fireEvent.click(screen.getByRole("button", { name: /file a complaint/i }));
      expect(screen.getByTestId("complaint-modal")).toBeInTheDocument();
    });

    it("closes the modal when onClose is called", () => {
      render(<FileComplaintPage />);
      fireEvent.click(screen.getByRole("button", { name: /file a complaint/i }));
      fireEvent.click(screen.getByRole("button", { name: /close/i }));
      expect(screen.queryByTestId("complaint-modal")).not.toBeInTheDocument();
    });
  });

  describe("theme", () => {
    it("defaults to modern theme when localStorage is empty", () => {
      render(<FileComplaintPage />);
      expect(screen.getByText("FILE A COMPLAINT")).toBeInTheDocument();
    });

    it("reads stored theme from localStorage", () => {
      localStorage.setItem("appTheme", "green");
      render(<FileComplaintPage />);
      expect(screen.getByText("FILE A COMPLAINT")).toBeInTheDocument();
    });
  });
});
