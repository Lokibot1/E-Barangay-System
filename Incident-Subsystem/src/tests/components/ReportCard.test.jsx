import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ReportCard from "../../components/sub-system-3/ReportCard";

const baseReport = {
  status: "ongoing",
  title: "Flooding near hall",
  category: "Natural Disaster",
  location: "Barangay Hall",
  description: "Water level rising near the barangay hall entrance.",
  date: "2025-01-15",
  severity: "High",
  image: null,
};

const renderCard = (overrides = {}, props = {}) =>
  render(
    <ReportCard
      report={{ ...baseReport, ...overrides }}
      currentTheme="blue"
      onClick={jest.fn()}
      {...props}
    />
  );

beforeEach(() => jest.resetAllMocks());

// ─── Content rendering ────────────────────────────────────────────────────────
describe("content rendering", () => {
  it("renders the report title", () => {
    renderCard();
    expect(screen.getByText("Flooding near hall")).toBeInTheDocument();
  });

  it("renders the category", () => {
    renderCard();
    expect(screen.getByText("Natural Disaster")).toBeInTheDocument();
  });

  it("renders the location", () => {
    renderCard();
    expect(screen.getByText("Barangay Hall")).toBeInTheDocument();
  });

  it("renders the description", () => {
    renderCard();
    expect(
      screen.getByText(/Water level rising near the barangay hall/i)
    ).toBeInTheDocument();
  });

  it("renders the date", () => {
    renderCard();
    expect(screen.getByText("2025-01-15")).toBeInTheDocument();
  });
});

// ─── Status badge ─────────────────────────────────────────────────────────────
describe("status badge", () => {
  it("renders 'ongoing' status badge", () => {
    renderCard({ status: "ongoing" });
    expect(screen.getByText("ongoing")).toBeInTheDocument();
  });

  it("renders 'resolved' status badge", () => {
    renderCard({ status: "resolved" });
    expect(screen.getByText("resolved")).toBeInTheDocument();
  });

  it("renders 'rejected' status badge", () => {
    renderCard({ status: "rejected" });
    expect(screen.getByText("rejected")).toBeInTheDocument();
  });
});

// ─── Severity ─────────────────────────────────────────────────────────────────
describe("severity", () => {
  it("renders the severity label when showSeverity is true", () => {
    renderCard({}, { showSeverity: true });
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("hides the severity label when showSeverity is false", () => {
    renderCard({}, { showSeverity: false });
    expect(screen.queryByText("High")).not.toBeInTheDocument();
  });

  it("shows severity by default when showSeverity prop is omitted", () => {
    render(
      <ReportCard report={baseReport} currentTheme="blue" onClick={jest.fn()} />
    );
    expect(screen.getByText("High")).toBeInTheDocument();
  });
});

// ─── Media rendering ──────────────────────────────────────────────────────────
describe("media rendering", () => {
  it("renders an img tag for image URLs", () => {
    renderCard({ image: "https://example.com/photo.jpg" });
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("renders a video element for .mp4 URLs", () => {
    const { container } = renderCard({ image: "https://example.com/clip.mp4" });
    expect(container.querySelector("video")).toBeInTheDocument();
  });

  it("renders a video element for .webm URLs", () => {
    const { container } = renderCard({ image: "https://example.com/clip.webm" });
    expect(container.querySelector("video")).toBeInTheDocument();
  });

  it("renders a video element for .mov URLs", () => {
    const { container } = renderCard({ image: "https://example.com/clip.mov" });
    expect(container.querySelector("video")).toBeInTheDocument();
  });

  it("renders an img tag (default image) when image is null", () => {
    renderCard({ image: null });
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("shows a play-button overlay for video URLs", () => {
    const { container } = renderCard({ image: "https://example.com/clip.mp4" });
    // Play button is an SVG path with d="M8 5v14l11-7z"
    expect(
      container.querySelector("path[d='M8 5v14l11-7z']")
    ).toBeInTheDocument();
  });

  it("does not show a play-button overlay for image URLs", () => {
    const { container } = renderCard({ image: "https://example.com/photo.jpg" });
    expect(
      container.querySelector("path[d='M8 5v14l11-7z']")
    ).not.toBeInTheDocument();
  });
});

// ─── Click handler ────────────────────────────────────────────────────────────
describe("click handler", () => {
  it("calls onClick when the card is clicked", () => {
    const onClick = jest.fn();
    render(
      <ReportCard report={baseReport} currentTheme="blue" onClick={onClick} />
    );
    fireEvent.click(screen.getByText("Flooding near hall"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

// ─── Theme variants ───────────────────────────────────────────────────────────
describe("theme variants", () => {
  it.each(["blue", "purple", "green", "dark", "modern"])(
    "renders without crashing for theme='%s'",
    (theme) => {
      render(
        <ReportCard
          report={baseReport}
          currentTheme={theme}
          onClick={jest.fn()}
        />
      );
      expect(screen.getByText("Flooding near hall")).toBeInTheDocument();
    }
  );
});
