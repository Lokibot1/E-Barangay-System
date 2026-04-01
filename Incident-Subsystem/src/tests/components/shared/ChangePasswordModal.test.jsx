import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChangePasswordModal from "../../../components/shared/ChangePasswordModal";

jest.mock("../../../homepage/services/loginService", () => ({
  changePassword: jest.fn(),
}));

import { changePassword } from "../../../homepage/services/loginService";

const defaults = {
  isOpen: true,
  onClose: jest.fn(),
  onToast: jest.fn(),
  onLogout: jest.fn(),
  currentTheme: "blue",
};

// A password that satisfies all 4 strength rules
const STRONG = "NewPass1!";

beforeEach(() => jest.resetAllMocks());

describe("ChangePasswordModal", () => {
  describe("visibility", () => {
    it("renders nothing when isOpen=false", () => {
      const { container } = render(<ChangePasswordModal {...defaults} isOpen={false} />);
      expect(container).toBeEmptyDOMElement();
    });

    it("renders 'Change Password' heading when open", () => {
      render(<ChangePasswordModal {...defaults} />);
      expect(screen.getByText("Change Password")).toBeInTheDocument();
    });
  });

  describe("password inputs", () => {
    it("renders all three password inputs", () => {
      render(<ChangePasswordModal {...defaults} />);
      expect(screen.getByPlaceholderText("Enter current password")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter new password")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter confirm new password")).toBeInTheDocument();
    });

    it("shows the strength checklist when typing in the new password field", () => {
      render(<ChangePasswordModal {...defaults} />);
      fireEvent.change(screen.getByPlaceholderText("Enter new password"), {
        target: { value: "abc" },
      });
      expect(screen.getByText("At least 8 characters")).toBeInTheDocument();
      expect(screen.getByText("One uppercase letter")).toBeInTheDocument();
      expect(screen.getByText("One number")).toBeInTheDocument();
      expect(screen.getByText("One special character")).toBeInTheDocument();
    });

    it("submit button is disabled when all fields are empty", () => {
      render(<ChangePasswordModal {...defaults} />);
      expect(screen.getByRole("button", { name: /update password/i })).toBeDisabled();
    });
  });

  describe("validation", () => {
    it("shows 'Current password is required.' after touching and clearing the field", async () => {
      render(<ChangePasswordModal {...defaults} />);
      const input = screen.getByPlaceholderText("Enter current password");
      fireEvent.change(input, { target: { value: "x" } });
      fireEvent.change(input, { target: { value: "" } });
      await waitFor(() =>
        expect(screen.getByText("Current password is required.")).toBeInTheDocument()
      );
    });

    it("shows 'Passwords do not match.' when confirm differs from new password", async () => {
      render(<ChangePasswordModal {...defaults} />);
      fireEvent.change(screen.getByPlaceholderText("Enter new password"), {
        target: { value: STRONG },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter confirm new password"), {
        target: { value: "Different1!" },
      });
      await waitFor(() =>
        expect(screen.getByText("Passwords do not match.")).toBeInTheDocument()
      );
    });

    it("shows 'Password does not meet all requirements.' for a weak new password", async () => {
      render(<ChangePasswordModal {...defaults} />);
      const input = screen.getByPlaceholderText("Enter new password");
      fireEvent.change(input, { target: { value: "weak" } });
      fireEvent.change(input, { target: { value: "weak" } }); // keep it touched
      await waitFor(() =>
        expect(screen.getByText("Password does not meet all requirements.")).toBeInTheDocument()
      );
    });
  });

  describe("submission", () => {
    const fillValidForm = () => {
      fireEvent.change(screen.getByPlaceholderText("Enter current password"), {
        target: { value: "OldPass1!" },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter new password"), {
        target: { value: STRONG },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter confirm new password"), {
        target: { value: STRONG },
      });
    };

    it("enables the submit button when all fields are valid", () => {
      render(<ChangePasswordModal {...defaults} />);
      fillValidForm();
      expect(screen.getByRole("button", { name: /update password/i })).not.toBeDisabled();
    });

    it("calls changePassword with the correct payload", async () => {
      changePassword.mockResolvedValue({});
      render(<ChangePasswordModal {...defaults} />);
      fillValidForm();
      fireEvent.click(screen.getByRole("button", { name: /update password/i }));
      await waitFor(() =>
        expect(changePassword).toHaveBeenCalledWith({
          current_password: "OldPass1!",
          new_password: STRONG,
          new_password_confirmation: STRONG,
        })
      );
    });

    it("calls onToast with type 'success' on successful submit", async () => {
      changePassword.mockResolvedValue({});
      render(<ChangePasswordModal {...defaults} />);
      fillValidForm();
      fireEvent.click(screen.getByRole("button", { name: /update password/i }));
      await waitFor(() =>
        expect(defaults.onToast).toHaveBeenCalledWith(
          expect.objectContaining({ type: "success" })
        )
      );
    });

    it("calls onClose after a successful submit", async () => {
      changePassword.mockResolvedValue({});
      render(<ChangePasswordModal {...defaults} />);
      fillValidForm();
      fireEvent.click(screen.getByRole("button", { name: /update password/i }));
      await waitFor(() => expect(defaults.onClose).toHaveBeenCalledTimes(1));
    });

    it("shows the API error message when changePassword rejects", async () => {
      changePassword.mockRejectedValue(new Error("Incorrect current password."));
      render(<ChangePasswordModal {...defaults} />);
      fillValidForm();
      fireEvent.click(screen.getByRole("button", { name: /update password/i }));
      await waitFor(() =>
        expect(screen.getByText("Incorrect current password.")).toBeInTheDocument()
      );
    });

    it("does not call onClose when the request fails", async () => {
      changePassword.mockRejectedValue(new Error("Server error"));
      render(<ChangePasswordModal {...defaults} />);
      fillValidForm();
      fireEvent.click(screen.getByRole("button", { name: /update password/i }));
      await waitFor(() => expect(changePassword).toHaveBeenCalled());
      expect(defaults.onClose).not.toHaveBeenCalled();
    });
  });

  describe("cancel", () => {
    it("calls onClose when Cancel is clicked", () => {
      render(<ChangePasswordModal {...defaults} />);
      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
      expect(defaults.onClose).toHaveBeenCalledTimes(1);
    });
  });
});
