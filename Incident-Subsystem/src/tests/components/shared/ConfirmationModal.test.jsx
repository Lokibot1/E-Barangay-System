import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmationModal from "../../../components/shared/ConfirmationModal";

const defaults = {
  isOpen: true,
  title: "Delete Item",
  message: "Are you sure you want to delete this item?",
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
};

beforeEach(() => jest.resetAllMocks());

describe("ConfirmationModal", () => {
  describe("visibility", () => {
    it("renders nothing when isOpen=false", () => {
      const { container } = render(<ConfirmationModal {...defaults} isOpen={false} />);
      expect(container).toBeEmptyDOMElement();
    });

    it("renders the title when open", () => {
      render(<ConfirmationModal {...defaults} />);
      expect(screen.getByText("Delete Item")).toBeInTheDocument();
    });

    it("renders the message when open", () => {
      render(<ConfirmationModal {...defaults} />);
      expect(screen.getByText("Are you sure you want to delete this item?")).toBeInTheDocument();
    });
  });

  describe("button labels", () => {
    it("shows default confirmLabel 'Confirm'", () => {
      render(<ConfirmationModal {...defaults} />);
      expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
    });

    it("shows a custom confirmLabel", () => {
      render(<ConfirmationModal {...defaults} confirmLabel="Delete Forever" />);
      expect(screen.getByRole("button", { name: "Delete Forever" })).toBeInTheDocument();
    });

    it("shows default cancelLabel 'Cancel'", () => {
      render(<ConfirmationModal {...defaults} />);
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    });

    it("shows a custom cancelLabel", () => {
      render(<ConfirmationModal {...defaults} cancelLabel="Go Back" />);
      expect(screen.getByRole("button", { name: "Go Back" })).toBeInTheDocument();
    });
  });

  describe("button interactions", () => {
    it("calls onConfirm when the confirm button is clicked", () => {
      render(<ConfirmationModal {...defaults} />);
      fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
      expect(defaults.onConfirm).toHaveBeenCalledTimes(1);
    });

    it("calls onCancel when the cancel button is clicked", () => {
      render(<ConfirmationModal {...defaults} />);
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(defaults.onCancel).toHaveBeenCalledTimes(1);
    });

    it("does not call onConfirm when cancel is clicked", () => {
      render(<ConfirmationModal {...defaults} />);
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(defaults.onConfirm).not.toHaveBeenCalled();
    });

    it("does not call onCancel when confirm is clicked", () => {
      render(<ConfirmationModal {...defaults} />);
      fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
      expect(defaults.onCancel).not.toHaveBeenCalled();
    });
  });

  describe("loading state", () => {
    it("shows 'Processing…' instead of confirmLabel when loading=true", () => {
      render(<ConfirmationModal {...defaults} loading={true} />);
      expect(screen.getByText("Processing…")).toBeInTheDocument();
    });

    it("disables the confirm button when loading=true", () => {
      render(<ConfirmationModal {...defaults} loading={true} />);
      expect(screen.getByText("Processing…").closest("button")).toBeDisabled();
    });

    it("disables the cancel button when loading=true", () => {
      render(<ConfirmationModal {...defaults} loading={true} />);
      expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    });
  });

  describe("variants", () => {
    it("renders without error for danger variant", () => {
      render(<ConfirmationModal {...defaults} variant="danger" />);
      expect(screen.getByText("Delete Item")).toBeInTheDocument();
    });

    it("renders without error for warning variant", () => {
      render(<ConfirmationModal {...defaults} variant="warning" />);
      expect(screen.getByText("Delete Item")).toBeInTheDocument();
    });

    it("renders without error for success variant", () => {
      render(<ConfirmationModal {...defaults} variant="success" />);
      expect(screen.getByText("Delete Item")).toBeInTheDocument();
    });

    it("falls back to danger variant for unknown variant", () => {
      render(<ConfirmationModal {...defaults} variant="unknown" />);
      expect(screen.getByText("Delete Item")).toBeInTheDocument();
    });
  });
});
