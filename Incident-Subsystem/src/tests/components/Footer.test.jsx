import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "../../components/sub-system-3/Footer";

const renderFooter = (theme = "blue") =>
  render(
    <MemoryRouter>
      <Footer currentTheme={theme} />
    </MemoryRouter>
  );

// ─── Section headings ─────────────────────────────────────────────────────────
describe("section headings", () => {
  it("renders the About Us heading", () => {
    renderFooter();
    expect(screen.getByText("About Us")).toBeInTheDocument();
  });

  it("renders the Quick Links heading", () => {
    renderFooter();
    expect(screen.getByText("Quick Links")).toBeInTheDocument();
  });

  it("renders the Contact Us heading", () => {
    renderFooter();
    expect(screen.getByText("Contact Us")).toBeInTheDocument();
  });
});

// ─── Quick links ──────────────────────────────────────────────────────────────
describe("quick links", () => {
  it("renders a 'File a Complaint' link", () => {
    renderFooter();
    expect(screen.getByRole("link", { name: /file a complaint/i })).toBeInTheDocument();
  });

  it("'File a Complaint' points to the correct route", () => {
    renderFooter();
    expect(
      screen.getByRole("link", { name: /file a complaint/i })
    ).toHaveAttribute("href", "/incident-complaint/file-complaint");
  });

  it("renders a 'Report an Incident' link", () => {
    renderFooter();
    expect(screen.getByRole("link", { name: /report an incident/i })).toBeInTheDocument();
  });

  it("'Report an Incident' points to the correct route", () => {
    renderFooter();
    expect(
      screen.getByRole("link", { name: /report an incident/i })
    ).toHaveAttribute("href", "/incident-complaint/incident-report");
  });

  it("renders an 'Incident Map' link", () => {
    renderFooter();
    expect(screen.getByRole("link", { name: /incident map/i })).toBeInTheDocument();
  });

  it("'Incident Map' points to the correct route", () => {
    renderFooter();
    expect(
      screen.getByRole("link", { name: /incident map/i })
    ).toHaveAttribute("href", "/incident-complaint/incident-map");
  });

  it("renders a 'Track Your Reports' link", () => {
    renderFooter();
    expect(screen.getByRole("link", { name: /track your reports/i })).toBeInTheDocument();
  });

  it("'Track Your Reports' points to the correct route", () => {
    renderFooter();
    expect(
      screen.getByRole("link", { name: /track your reports/i })
    ).toHaveAttribute("href", "/incident-complaint/case-management");
  });
});

// ─── Contact info ─────────────────────────────────────────────────────────────
describe("contact info", () => {
  it("displays the barangay email address", () => {
    renderFooter();
    expect(screen.getByText(/barangay@example\.com/i)).toBeInTheDocument();
  });

  it("displays the phone number", () => {
    renderFooter();
    expect(screen.getByText(/\(02\) 1234-5678/i)).toBeInTheDocument();
  });

  it("displays the barangay address", () => {
    renderFooter();
    expect(screen.getByText(/Barangay Hall, Quezon City/i)).toBeInTheDocument();
  });
});

// ─── Copyright ────────────────────────────────────────────────────────────────
describe("copyright", () => {
  it("includes the current year in the copyright notice", () => {
    renderFooter();
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });

  it("includes 'All rights reserved' in the copyright notice", () => {
    renderFooter();
    expect(screen.getByText(/all rights reserved/i)).toBeInTheDocument();
  });
});

// ─── Theme variants ───────────────────────────────────────────────────────────
describe("theme variants", () => {
  it.each(["blue", "purple", "green", "dark", "modern"])(
    "renders without crashing for theme='%s'",
    (theme) => {
      renderFooter(theme);
      expect(screen.getByText("About Us")).toBeInTheDocument();
    }
  );
});
