import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DiscardConfirmModal from "../../components/sub-system-3/DiscardConfirmModal";

const defaultProps = {
  isOpen: true,
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
  currentTheme: "blue",
  type: "incident",
};

beforeEach(() => {
  jest.resetAllMocks();
});

// ─── Visibility ───────────────────────────────────────────────────────────────
describe("visibility", () => {
  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <DiscardConfirmModal {...defaultProps} isOpen={false} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the dialog when isOpen is true", () => {
    render(<DiscardConfirmModal {...defaultProps} />);
    expect(screen.getByRole("button", { name: /discard/i })).toBeInTheDocument();
  });
});

// ─── Label copy based on type prop ───────────────────────────────────────────
describe("label copy", () => {
  it("shows 'Discard incident report?' for type='incident'", () => {
    render(<DiscardConfirmModal {...defaultProps} type="incident" />);
    expect(
      screen.getByText(/discard incident report\?/i)
    ).toBeInTheDocument();
  });

  it("shows 'Discard complaint?' for type='complaint'", () => {
    render(<DiscardConfirmModal {...defaultProps} type="complaint" />);
    expect(screen.getByText(/discard complaint\?/i)).toBeInTheDocument();
  });

  it("defaults to 'incident report' label when type prop is omitted", () => {
    const { onConfirm, onCancel, currentTheme, isOpen } = defaultProps;
    render(
      <DiscardConfirmModal
        isOpen={isOpen}
        onConfirm={onConfirm}
        onCancel={onCancel}
        currentTheme={currentTheme}
      />
    );
    expect(screen.getByText(/discard incident report\?/i)).toBeInTheDocument();
  });
});

// ─── Body text ────────────────────────────────────────────────────────────────
describe("body text", () => {
  it("informs the user that progress will be saved as a draft", () => {
    render(<DiscardConfirmModal {...defaultProps} />);
    expect(screen.getByText(/saved as a draft/i)).toBeInTheDocument();
  });
});

// ─── Button interactions ──────────────────────────────────────────────────────
describe("button interactions", () => {
  it("calls onCancel when the Stay button is clicked", () => {
    const onCancel = jest.fn();
    render(<DiscardConfirmModal {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: /stay/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm when the Discard button is clicked", () => {
    const onConfirm = jest.fn();
    render(<DiscardConfirmModal {...defaultProps} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole("button", { name: /discard/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("does not call onConfirm when Stay is clicked", () => {
    const onConfirm = jest.fn();
    render(<DiscardConfirmModal {...defaultProps} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole("button", { name: /stay/i }));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("does not call onCancel when Discard is clicked", () => {
    const onCancel = jest.fn();
    render(<DiscardConfirmModal {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: /discard/i }));
    expect(onCancel).not.toHaveBeenCalled();
  });
});

// ─── Click isolation ──────────────────────────────────────────────────────────
describe("click isolation", () => {
  it("does not bubble clicks from the dialog card to the backdrop", () => {
    const onCancel = jest.fn();
    render(<DiscardConfirmModal {...defaultProps} onCancel={onCancel} />);
    // Click the inner card — should NOT trigger backdrop handler
    fireEvent.click(screen.getByText(/saved as a draft/i));
    expect(onCancel).not.toHaveBeenCalled();
  });
});

// ─── Theme variants ───────────────────────────────────────────────────────────
describe("theme variants", () => {
  it.each(["blue", "purple", "green", "dark", "modern"])(
    "renders without crashing for theme='%s'",
    (theme) => {
      render(<DiscardConfirmModal {...defaultProps} currentTheme={theme} />);
      expect(screen.getByRole("button", { name: /stay/i })).toBeInTheDocument();
    }
  );

  it("falls back to blue theme tokens for an unknown theme", () => {
    render(
      <DiscardConfirmModal {...defaultProps} currentTheme="nonexistent" />
    );
    expect(screen.getByRole("button", { name: /stay/i })).toBeInTheDocument();
  });
});
