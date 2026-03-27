import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TabsComponent from "../../components/sub-system-3/TabsComponent";

const defaultProps = {
  activeTab: "complaints",
  onTabChange: jest.fn(),
  currentTheme: "blue",
};

beforeEach(() => {
  jest.resetAllMocks();
});

// ─── Rendering ────────────────────────────────────────────────────────────────
describe("rendering", () => {
  it("renders all three tab buttons", () => {
    render(<TabsComponent {...defaultProps} />);
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  it("renders the Complaints short label", () => {
    render(<TabsComponent {...defaultProps} />);
    expect(screen.getByText("Complaints")).toBeInTheDocument();
  });

  it("renders the Incidents short label", () => {
    render(<TabsComponent {...defaultProps} />);
    expect(screen.getByText("Incidents")).toBeInTheDocument();
  });

  it("renders the Appointments short label", () => {
    render(<TabsComponent {...defaultProps} />);
    expect(screen.getByText("Appointments")).toBeInTheDocument();
  });

  it("renders the full 'Submitted Complaints' label (hidden on mobile)", () => {
    render(<TabsComponent {...defaultProps} />);
    expect(screen.getByText("Submitted Complaints")).toBeInTheDocument();
  });

  it("renders the full 'Submitted Incidents' label (hidden on mobile)", () => {
    render(<TabsComponent {...defaultProps} />);
    expect(screen.getByText("Submitted Incidents")).toBeInTheDocument();
  });

  it("renders the full 'My Appointments' label (hidden on mobile)", () => {
    render(<TabsComponent {...defaultProps} />);
    expect(screen.getByText("My Appointments")).toBeInTheDocument();
  });
});

// ─── Tab click interactions ───────────────────────────────────────────────────
describe("tab click interactions", () => {
  it("calls onTabChange with 'complaints' when the Complaints tab is clicked", () => {
    const onTabChange = jest.fn();
    render(<TabsComponent {...defaultProps} onTabChange={onTabChange} />);
    fireEvent.click(screen.getByText("Complaints"));
    expect(onTabChange).toHaveBeenCalledWith("complaints");
  });

  it("calls onTabChange with 'incidents' when the Incidents tab is clicked", () => {
    const onTabChange = jest.fn();
    render(<TabsComponent {...defaultProps} onTabChange={onTabChange} />);
    fireEvent.click(screen.getByText("Incidents"));
    expect(onTabChange).toHaveBeenCalledWith("incidents");
  });

  it("calls onTabChange with 'appointments' when the Appointments tab is clicked", () => {
    const onTabChange = jest.fn();
    render(<TabsComponent {...defaultProps} onTabChange={onTabChange} />);
    fireEvent.click(screen.getByText("Appointments"));
    expect(onTabChange).toHaveBeenCalledWith("appointments");
  });

  it("calls onTabChange exactly once per click", () => {
    const onTabChange = jest.fn();
    render(<TabsComponent {...defaultProps} onTabChange={onTabChange} />);
    fireEvent.click(screen.getByText("Incidents"));
    expect(onTabChange).toHaveBeenCalledTimes(1);
  });
});

// ─── Active tab styling ───────────────────────────────────────────────────────
describe("active tab styling", () => {
  it("applies white text to the active tab button", () => {
    render(<TabsComponent {...defaultProps} activeTab="complaints" />);
    // The complaints button contains both the short and full label spans
    const buttons = screen.getAllByRole("button");
    const complaintsBtn = buttons[0];
    expect(complaintsBtn.className).toContain("text-white");
  });

  it("does not apply white text to inactive tab buttons", () => {
    render(<TabsComponent {...defaultProps} activeTab="complaints" />);
    const buttons = screen.getAllByRole("button");
    const incidentsBtn = buttons[1];
    expect(incidentsBtn.className).not.toContain("text-white");
  });

  it("updates active styling when activeTab prop changes", () => {
    const { rerender } = render(
      <TabsComponent {...defaultProps} activeTab="complaints" />
    );
    let buttons = screen.getAllByRole("button");
    expect(buttons[0].className).toContain("text-white");
    expect(buttons[1].className).not.toContain("text-white");

    rerender(
      <TabsComponent {...defaultProps} activeTab="incidents" />
    );
    buttons = screen.getAllByRole("button");
    expect(buttons[1].className).toContain("text-white");
    expect(buttons[0].className).not.toContain("text-white");
  });
});

// ─── Theme variants ───────────────────────────────────────────────────────────
describe("theme variants", () => {
  it.each(["blue", "purple", "green", "dark", "modern"])(
    "renders without crashing for theme='%s'",
    (theme) => {
      render(<TabsComponent {...defaultProps} currentTheme={theme} />);
      expect(screen.getAllByRole("button")).toHaveLength(3);
    }
  );

  it("falls back to modern theme tokens for an unknown theme", () => {
    render(<TabsComponent {...defaultProps} currentTheme="nonexistent" />);
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });
});
