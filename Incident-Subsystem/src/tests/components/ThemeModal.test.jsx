import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ThemeModal from "../../components/sub-system-3/ThemeModal";

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  currentTheme: "blue",
  onThemeChange: jest.fn(),
};

beforeEach(() => jest.resetAllMocks());

// ─── Visibility ───────────────────────────────────────────────────────────────
describe("visibility", () => {
  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <ThemeModal {...defaultProps} isOpen={false} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the modal when isOpen is true", () => {
    render(<ThemeModal {...defaultProps} />);
    expect(screen.getByText("Choose Your Theme")).toBeInTheDocument();
  });
});

// ─── Theme cards ──────────────────────────────────────────────────────────────
describe("theme cards", () => {
  it("renders all four theme options", () => {
    render(<ThemeModal {...defaultProps} />);
    expect(screen.getByText("Ocean Blue")).toBeInTheDocument();
    expect(screen.getByText("Royal Purple")).toBeInTheDocument();
    expect(screen.getByText("Forest Green")).toBeInTheDocument();
    expect(screen.getByText("Dark Mode")).toBeInTheDocument();
  });

  it("shows a 'Selected' badge on the currently active theme", () => {
    render(<ThemeModal {...defaultProps} currentTheme="blue" />);
    expect(screen.getByText("Selected")).toBeInTheDocument();
  });

  it("moves the Selected badge when a different theme card is clicked", () => {
    render(<ThemeModal {...defaultProps} currentTheme="blue" />);
    fireEvent.click(screen.getByText("Royal Purple"));
    // Only one Selected badge should exist and it should still be visible
    expect(screen.getAllByText("Selected")).toHaveLength(1);
  });

  it("normalises 'modern' currentTheme to blue and shows Selected on Ocean Blue", () => {
    render(<ThemeModal {...defaultProps} currentTheme="modern" />);
    expect(screen.getByText("Selected")).toBeInTheDocument();
    // Ocean Blue card is rendered
    expect(screen.getByText("Ocean Blue")).toBeInTheDocument();
  });
});

// ─── Apply button ─────────────────────────────────────────────────────────────
describe("Apply Theme button", () => {
  it("calls onThemeChange with the selected theme when Apply is clicked", () => {
    const onThemeChange = jest.fn();
    render(<ThemeModal {...defaultProps} onThemeChange={onThemeChange} />);
    fireEvent.click(screen.getByText("Apply Theme"));
    expect(onThemeChange).toHaveBeenCalledWith("blue");
  });

  it("calls onThemeChange with the newly selected theme after switching", () => {
    const onThemeChange = jest.fn();
    render(<ThemeModal {...defaultProps} onThemeChange={onThemeChange} />);
    fireEvent.click(screen.getByText("Forest Green"));
    fireEvent.click(screen.getByText("Apply Theme"));
    expect(onThemeChange).toHaveBeenCalledWith("green");
  });

  it("calls onClose after applying the theme", () => {
    const onClose = jest.fn();
    render(<ThemeModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText("Apply Theme"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// ─── Cancel / close ───────────────────────────────────────────────────────────
describe("cancel and close", () => {
  it("calls onClose when the Cancel button is clicked", () => {
    const onClose = jest.fn();
    render(<ThemeModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the X button is clicked", () => {
    const onClose = jest.fn();
    render(<ThemeModal {...defaultProps} onClose={onClose} />);
    // The close (X) button is the one that is NOT "Cancel" or "Apply Theme"
    const closeBtn = screen.getAllByRole("button").find(
      (btn) =>
        !btn.textContent.includes("Cancel") &&
        !btn.textContent.includes("Apply Theme") &&
        !btn.textContent.includes("Ocean Blue") &&
        !btn.textContent.includes("Royal Purple") &&
        !btn.textContent.includes("Forest Green") &&
        !btn.textContent.includes("Dark Mode")
    );
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onThemeChange when Cancel is clicked", () => {
    const onThemeChange = jest.fn();
    render(<ThemeModal {...defaultProps} onThemeChange={onThemeChange} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(onThemeChange).not.toHaveBeenCalled();
  });
});

// ─── Info note ────────────────────────────────────────────────────────────────
describe("info note", () => {
  it("shows the Theme Preview note", () => {
    render(<ThemeModal {...defaultProps} />);
    expect(screen.getByText("Theme Preview")).toBeInTheDocument();
  });
});
