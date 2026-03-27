import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MainMenuCards from "../../components/sub-system-3/MainMenuCards";

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock LanguageContext — returns English translations
jest.mock("../../context/LanguageContext", () => ({
  useLanguage: () => ({
    tr: {
      menuCards: {
        fileComplaint: "FILE A COMPLAINT",
        reportIncident: "REPORT AN INCIDENT",
        incidentMap: "INCIDENT MAP",
        incidentStatus: "CASE TRACKER",
      },
    },
  }),
}));

const renderCards = (theme = "blue") =>
  render(
    <MemoryRouter>
      <MainMenuCards currentTheme={theme} />
    </MemoryRouter>
  );

beforeEach(() => jest.resetAllMocks());

// ─── Rendering ────────────────────────────────────────────────────────────────
describe("rendering", () => {
  it("renders all four menu card buttons", () => {
    renderCards();
    expect(screen.getAllByRole("button")).toHaveLength(4);
  });

  it("renders the File a Complaint card", () => {
    renderCards();
    expect(screen.getByText("FILE A COMPLAINT")).toBeInTheDocument();
  });

  it("renders the Report an Incident card", () => {
    renderCards();
    expect(screen.getByText("REPORT AN INCIDENT")).toBeInTheDocument();
  });

  it("renders the Incident Map card", () => {
    renderCards();
    expect(screen.getByText("INCIDENT MAP")).toBeInTheDocument();
  });

  it("renders the Case Tracker card", () => {
    renderCards();
    expect(screen.getByText("CASE TRACKER")).toBeInTheDocument();
  });
});

// ─── Navigation ───────────────────────────────────────────────────────────────
describe("navigation", () => {
  it("navigates to /incident-complaint/file-complaint when File a Complaint is clicked", () => {
    renderCards();
    fireEvent.click(screen.getByText("FILE A COMPLAINT"));
    expect(mockNavigate).toHaveBeenCalledWith(
      "/incident-complaint/file-complaint"
    );
  });

  it("navigates to /incident-complaint/incident-report when Report an Incident is clicked", () => {
    renderCards();
    fireEvent.click(screen.getByText("REPORT AN INCIDENT"));
    expect(mockNavigate).toHaveBeenCalledWith(
      "/incident-complaint/incident-report"
    );
  });

  it("navigates to /incident-complaint/incident-map when Incident Map is clicked", () => {
    renderCards();
    fireEvent.click(screen.getByText("INCIDENT MAP"));
    expect(mockNavigate).toHaveBeenCalledWith(
      "/incident-complaint/incident-map"
    );
  });

  it("navigates to /incident-complaint/case-management when Case Tracker is clicked", () => {
    renderCards();
    fireEvent.click(screen.getByText("CASE TRACKER"));
    expect(mockNavigate).toHaveBeenCalledWith(
      "/incident-complaint/case-management"
    );
  });

  it("calls navigate exactly once per card click", () => {
    renderCards();
    fireEvent.click(screen.getByText("FILE A COMPLAINT"));
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });
});

// ─── Theme variants ───────────────────────────────────────────────────────────
describe("theme variants", () => {
  it.each(["blue", "purple", "green", "dark", "modern"])(
    "renders without crashing for theme='%s'",
    (theme) => {
      renderCards(theme);
      expect(screen.getAllByRole("button")).toHaveLength(4);
    }
  );
});
