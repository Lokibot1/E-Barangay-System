import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ResetPasswordPage from "../../pages/sub-system-3/ResetPasswordPage";

// ── Service mock ───────────────────────────────────────────────────────────────
jest.mock("../../homepage/services/loginService", () => ({
  resetPassword: jest.fn(),
}));
import { resetPassword } from "../../homepage/services/loginService";

// ── Shared component / context mocks ──────────────────────────────────────────
jest.mock("../../components/shared/InputField", () => {
  const React = require("react");
  return function InputField({ label, type, value, onChange, placeholder, error }) {
    return (
      <div>
        <label>{label}</label>
        <input
          aria-label={label}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
        {error && <span role="alert">{error}</span>}
      </div>
    );
  };
});

jest.mock("../../components/shared/modals/Toast", () => () => null);

jest.mock("../../context/BrandingContext", () => ({
  useBranding: () => ({ logoDataUrl: null }),
}));

jest.mock("lucide-react", () => ({
  ArrowLeft: () => <span>ArrowLeft</span>,
  Loader2: () => <span>Loader2</span>,
  Sun: () => <span>Sun</span>,
  Moon: () => <span>Moon</span>,
}));

// ── Helpers ───────────────────────────────────────────────────────────────────
const renderPage = (search = "?token=abc&email=user@example.com") =>
  render(
    <MemoryRouter initialEntries={[`/reset-password${search}`]}>
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
});

// ─── Rendering ────────────────────────────────────────────────────────────────
describe("rendering", () => {
  it("renders the Reset Password heading", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: /reset password/i })).toBeInTheDocument();
  });

  it("renders the New Password input", () => {
    renderPage();
    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
  });

  it("renders the Confirm Password input", () => {
    renderPage();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
  });

  it("renders the submit button", () => {
    renderPage();
    expect(
      screen.getByRole("button", { name: /reset password/i })
    ).toBeInTheDocument();
  });

  it("renders the Back to Login button", () => {
    renderPage();
    expect(screen.getByText(/back to login/i)).toBeInTheDocument();
  });

  it("shows the email from the URL in the instructions panel", () => {
    renderPage("?token=abc&email=user@example.com");
    expect(screen.getByText(/user@example\.com/i)).toBeInTheDocument();
  });
});

// ─── Validation ───────────────────────────────────────────────────────────────
describe("validation", () => {
  it("shows an error when password is empty on submit", async () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
    expect(
      await screen.findByText("New password is required.")
    ).toBeInTheDocument();
  });

  it("shows an error when password is shorter than 8 characters", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: "short" },
    });
    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
    expect(
      await screen.findByText("Password must be at least 8 characters.")
    ).toBeInTheDocument();
  });

  it("shows an error when confirm password is empty", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: "longpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
    expect(
      await screen.findByText("Please confirm your password.")
    ).toBeInTheDocument();
  });

  it("shows an error when passwords do not match", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "different123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
    expect(
      await screen.findByText("Passwords do not match.")
    ).toBeInTheDocument();
  });

  it("does not call resetPassword when validation fails", async () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
    await screen.findByText("New password is required.");
    expect(resetPassword).not.toHaveBeenCalled();
  });
});

// ─── Successful submission ────────────────────────────────────────────────────
describe("successful submission", () => {
  it("calls resetPassword with token, email, password, and confirmation", async () => {
    resetPassword.mockResolvedValue({ message: "Password reset." });
    renderPage("?token=mytoken&email=user@example.com");

    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: "newpassword1" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "newpassword1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalledWith({
        token: "mytoken",
        email: "user@example.com",
        password: "newpassword1",
        password_confirmation: "newpassword1",
      });
    });
  });
});

// ─── Missing token / email ────────────────────────────────────────────────────
describe("missing token or email", () => {
  it("does not call resetPassword when token is missing from URL", async () => {
    renderPage("?email=user@example.com");
    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: "newpassword1" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "newpassword1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
    await waitFor(() => expect(resetPassword).not.toHaveBeenCalled());
  });
});

// ─── Dark mode toggle ─────────────────────────────────────────────────────────
describe("dark mode toggle", () => {
  it("renders a dark mode toggle button", () => {
    renderPage();
    expect(screen.getByLabelText("Toggle theme")).toBeInTheDocument();
  });

  it("toggles dark mode on click", () => {
    renderPage();
    const toggle = screen.getByLabelText("Toggle theme");
    // starts in light mode (Moon icon visible)
    expect(screen.getByText("Moon")).toBeInTheDocument();
    fireEvent.click(toggle);
    expect(screen.getByText("Sun")).toBeInTheDocument();
  });
});
