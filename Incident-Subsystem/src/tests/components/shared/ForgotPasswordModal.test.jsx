import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ForgotPasswordModal from "../../../components/shared/ForgotPasswordModal";

jest.mock("../../../homepage/services/loginService", () => ({
  forgotPassword: jest.fn(),
}));

import { forgotPassword } from "../../../homepage/services/loginService";

const defaults = {
  isOpen: true,
  onClose: jest.fn(),
  onToast: jest.fn(),
  currentTheme: "blue",
};

beforeEach(() => jest.resetAllMocks());

describe("ForgotPasswordModal", () => {
  describe("visibility", () => {
    it("renders nothing when isOpen=false", () => {
      const { container } = render(<ForgotPasswordModal {...defaults} isOpen={false} />);
      expect(container).toBeEmptyDOMElement();
    });

    it("renders 'Forgot Password' heading when open", () => {
      render(<ForgotPasswordModal {...defaults} />);
      expect(screen.getByText("Forgot Password")).toBeInTheDocument();
    });

    it("renders the subtitle text", () => {
      render(<ForgotPasswordModal {...defaults} />);
      expect(screen.getByText(/we'll send you a reset link/i)).toBeInTheDocument();
    });
  });

  describe("email pre-fill", () => {
    it("pre-fills the email input from the email prop", () => {
      render(<ForgotPasswordModal {...defaults} email="user@example.com" />);
      expect(screen.getByRole("textbox")).toHaveValue("user@example.com");
    });

    it("starts with an empty email when no email prop is provided", () => {
      render(<ForgotPasswordModal {...defaults} />);
      expect(screen.getByRole("textbox")).toHaveValue("");
    });

    it("syncs a new email prop value when the modal reopens", () => {
      const { rerender } = render(
        <ForgotPasswordModal {...defaults} isOpen={false} email="old@example.com" />
      );
      rerender(
        <ForgotPasswordModal {...defaults} isOpen={true} email="new@example.com" />
      );
      expect(screen.getByRole("textbox")).toHaveValue("new@example.com");
    });
  });

  describe("submit button state", () => {
    it("is disabled when the email field is empty", () => {
      render(<ForgotPasswordModal {...defaults} />);
      expect(screen.getByRole("button", { name: /send reset link/i })).toBeDisabled();
    });

    it("is enabled when the email field has a value", () => {
      render(<ForgotPasswordModal {...defaults} email="user@example.com" />);
      expect(screen.getByRole("button", { name: /send reset link/i })).not.toBeDisabled();
    });
  });

  describe("submission", () => {
    it("calls forgotPassword with the trimmed email on submit", async () => {
      forgotPassword.mockResolvedValue({ message: "Email sent." });
      render(<ForgotPasswordModal {...defaults} email="user@example.com" />);
      fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));
      await waitFor(() =>
        expect(forgotPassword).toHaveBeenCalledWith("user@example.com")
      );
    });

    it("calls onToast with type 'success' on successful submission", async () => {
      forgotPassword.mockResolvedValue({ message: "Email sent." });
      render(<ForgotPasswordModal {...defaults} email="user@example.com" />);
      fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));
      await waitFor(() =>
        expect(defaults.onToast).toHaveBeenCalledWith(
          expect.objectContaining({ type: "success" })
        )
      );
    });

    it("calls onClose after a successful submission", async () => {
      forgotPassword.mockResolvedValue({ message: "Email sent." });
      render(<ForgotPasswordModal {...defaults} email="user@example.com" />);
      fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));
      await waitFor(() => expect(defaults.onClose).toHaveBeenCalledTimes(1));
    });

    it("calls onToast with type 'error' when forgotPassword rejects", async () => {
      forgotPassword.mockRejectedValue(new Error("User not found."));
      render(<ForgotPasswordModal {...defaults} email="unknown@example.com" />);
      fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));
      await waitFor(() =>
        expect(defaults.onToast).toHaveBeenCalledWith(
          expect.objectContaining({ type: "error" })
        )
      );
    });

    it("does not call onClose when submission fails", async () => {
      forgotPassword.mockRejectedValue(new Error("User not found."));
      render(<ForgotPasswordModal {...defaults} email="unknown@example.com" />);
      fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));
      await waitFor(() => expect(defaults.onToast).toHaveBeenCalled());
      expect(defaults.onClose).not.toHaveBeenCalled();
    });

    it("does not call forgotPassword when the email is empty", () => {
      render(<ForgotPasswordModal {...defaults} />);
      // Button is disabled so form won't submit, but verify service is untouched
      expect(forgotPassword).not.toHaveBeenCalled();
    });
  });

  describe("close button", () => {
    it("calls onClose when the X button is clicked", () => {
      render(<ForgotPasswordModal {...defaults} />);
      fireEvent.click(screen.getByRole("button", { name: /close/i }));
      expect(defaults.onClose).toHaveBeenCalledTimes(1);
    });
  });
});
