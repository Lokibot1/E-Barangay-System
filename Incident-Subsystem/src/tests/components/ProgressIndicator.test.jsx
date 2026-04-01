import React from "react";
import { render, screen } from "@testing-library/react";
import ProgressIndicator from "../../components/sub-system-3/ProgressIndicator";

const defaultProps = {
  currentStep: 1,
  totalSteps: 4,
  currentTheme: "blue",
};

// ─── Step labels ──────────────────────────────────────────────────────────────
describe("step labels", () => {
  it("renders the default labels when stepLabels is not provided", () => {
    render(<ProgressIndicator {...defaultProps} />);
    expect(screen.getAllByText("Basic Info")).toHaveLength(2); // desktop + mobile
    expect(screen.getAllByText("Details")).toHaveLength(1);
    expect(screen.getAllByText("People")).toHaveLength(1);
    expect(screen.getAllByText("Additional")).toHaveLength(1);
  });

  it("renders custom labels when stepLabels is provided", () => {
    const stepLabels = ["Step A", "Step B", "Step C", "Step D"];
    render(<ProgressIndicator {...defaultProps} stepLabels={stepLabels} />);
    expect(screen.getAllByText("Step A")).toHaveLength(2); // desktop + mobile
    expect(screen.getByText("Step B")).toBeInTheDocument();
    expect(screen.getByText("Step C")).toBeInTheDocument();
    expect(screen.getByText("Step D")).toBeInTheDocument();
  });

  it("only renders steps up to totalSteps", () => {
    render(
      <ProgressIndicator {...defaultProps} totalSteps={2} currentStep={1} />
    );
    expect(screen.getAllByText("Basic Info")).toHaveLength(2);
    expect(screen.getByText("Details")).toBeInTheDocument();
    expect(screen.queryByText("People")).not.toBeInTheDocument();
    expect(screen.queryByText("Additional")).not.toBeInTheDocument();
  });
});

// ─── Mobile step counter ──────────────────────────────────────────────────────
describe("mobile step counter", () => {
  it("shows 'Step X of Y' text", () => {
    render(<ProgressIndicator {...defaultProps} currentStep={2} totalSteps={4} />);
    expect(screen.getByText("Step 2 of 4")).toBeInTheDocument();
  });

  it("shows the current step title on mobile", () => {
    render(<ProgressIndicator {...defaultProps} currentStep={3} totalSteps={4} />);
    // "People" is the label for step 3 — appears as the mobile subtitle
    const mobileTitle = screen.getAllByText("People");
    expect(mobileTitle.length).toBeGreaterThanOrEqual(1);
  });

  it("updates the step counter when currentStep changes", () => {
    const { rerender } = render(
      <ProgressIndicator {...defaultProps} currentStep={1} totalSteps={3} />
    );
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();

    rerender(
      <ProgressIndicator {...defaultProps} currentStep={2} totalSteps={3} />
    );
    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
  });
});

// ─── Progress bar width ───────────────────────────────────────────────────────
describe("progress bar width", () => {
  it("sets desktop progress bar to 0% on step 1 of 4", () => {
    const { container } = render(
      <ProgressIndicator {...defaultProps} currentStep={1} totalSteps={4} />
    );
    // desktop progress fill: first div with a % width style inside the track
    const fills = container.querySelectorAll("[style*='width']");
    const desktopFill = fills[0];
    expect(desktopFill.style.width).toBe("0%");
  });

  it("sets desktop progress bar to 100% on the last step", () => {
    const { container } = render(
      <ProgressIndicator {...defaultProps} currentStep={4} totalSteps={4} />
    );
    const fills = container.querySelectorAll("[style*='width']");
    const desktopFill = fills[0];
    expect(desktopFill.style.width).toBe("100%");
  });

  it("sets mobile progress bar to 25% on step 1 of 4", () => {
    const { container } = render(
      <ProgressIndicator {...defaultProps} currentStep={1} totalSteps={4} />
    );
    const fills = container.querySelectorAll("[style*='width']");
    const mobileFill = fills[1];
    expect(mobileFill.style.width).toBe("25%");
  });

  it("sets mobile progress bar to 100% on step 4 of 4", () => {
    const { container } = render(
      <ProgressIndicator {...defaultProps} currentStep={4} totalSteps={4} />
    );
    const fills = container.querySelectorAll("[style*='width']");
    const mobileFill = fills[1];
    expect(mobileFill.style.width).toBe("100%");
  });
});

// ─── Checkmark for completed steps ───────────────────────────────────────────
describe("checkmark for completed steps", () => {
  it("renders a checkmark SVG for steps before the current step", () => {
    const { container } = render(
      <ProgressIndicator {...defaultProps} currentStep={3} totalSteps={4} />
    );
    // Checkmark path is the M5 13l4 4L19 7 path
    const checkmarks = container.querySelectorAll(
      "path[d='M5 13l4 4L19 7']"
    );
    // Steps 1 and 2 are completed when currentStep=3
    expect(checkmarks.length).toBe(2);
  });

  it("renders no checkmarks when on step 1", () => {
    const { container } = render(
      <ProgressIndicator {...defaultProps} currentStep={1} totalSteps={4} />
    );
    const checkmarks = container.querySelectorAll("path[d='M5 13l4 4L19 7']");
    expect(checkmarks.length).toBe(0);
  });
});

// ─── Theme variants ───────────────────────────────────────────────────────────
describe("theme variants", () => {
  it.each(["blue", "purple", "green", "dark", "modern"])(
    "renders without crashing for theme='%s'",
    (theme) => {
      render(<ProgressIndicator {...defaultProps} currentTheme={theme} />);
      expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
    }
  );

  it("falls back to modern theme tokens for an unknown theme", () => {
    render(
      <ProgressIndicator {...defaultProps} currentTheme="nonexistent" />
    );
    expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
  });
});
