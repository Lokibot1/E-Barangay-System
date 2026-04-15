import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LogoutModal from "../../../components/shared/LogoutModal";

const defaults = {
  isOpen: true,
  onClose: jest.fn(),
  onConfirm: jest.fn(),
  loading: false,
  currentTheme: "blue",
};

beforeEach(() => jest.resetAllMocks());

describe("LogoutModal", () => {
  describe("visibility", () => {
    it("renders nothing when isOpen=false", () => {
      const { container } = render(<LogoutModal {...defaults} isOpen={false} />);
      expect(container).toBeEmptyDOMElement();
    });

    it("renders 'Confirm Logout' heading when open", () => {
      render(<LogoutModal {...defaults} />);
      expect(screen.getByText("Confirm Logout")).toBeInTheDocument();
    });

    it("renders the confirmation message", () => {
      render(<LogoutModal {...defaults} />);
      expect(screen.getByText(/Are you sure you want to log out/i)).toBeInTheDocument();
    });
  });

  describe("button interactions", () => {
    it("calls onClose when Cancel is clicked", () => {
      render(<LogoutModal {...defaults} />);
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(defaults.onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onConfirm when Logout is clicked", () => {
      render(<LogoutModal {...defaults} />);
      fireEvent.click(screen.getByRole("button", { name: "Logout" }));
      expect(defaults.onConfirm).toHaveBeenCalledTimes(1);
    });

    it("does not call onConfirm when Cancel is clicked", () => {
      render(<LogoutModal {...defaults} />);
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(defaults.onConfirm).not.toHaveBeenCalled();
    });

    it("does not call onClose when Logout is clicked", () => {
      render(<LogoutModal {...defaults} />);
      fireEvent.click(screen.getByRole("button", { name: "Logout" }));
      expect(defaults.onClose).not.toHaveBeenCalled();
    });
  });

  describe("loading state", () => {
    it("shows 'Logging out...' instead of 'Logout' when loading=true", () => {
      render(<LogoutModal {...defaults} loading={true} />);
      expect(screen.getByText("Logging out...")).toBeInTheDocument();
      expect(screen.queryByText("Logout")).not.toBeInTheDocument();
    });

    it("disables the Cancel button when loading=true", () => {
      render(<LogoutModal {...defaults} loading={true} />);
      expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    });
  });

  describe("themes", () => {
    it("renders without error for dark theme", () => {
      render(<LogoutModal {...defaults} currentTheme="dark" />);
      expect(screen.getByText("Confirm Logout")).toBeInTheDocument();
    });

    it("renders without error for all valid themes", () => {
      ["blue", "green", "purple", "dark", "modern"].forEach((theme) => {
        const { unmount } = render(<LogoutModal {...defaults} currentTheme={theme} />);
        unmount();
      });
    });
  });
});
