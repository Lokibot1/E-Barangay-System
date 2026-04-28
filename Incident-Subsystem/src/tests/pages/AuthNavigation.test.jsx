import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import LoginPage from "../../homepage/login/LoginPage";
import SignUpPage from "../../homepage/signup/SignUpPage";

jest.mock("../../context/BrandingContext", () => ({
  useBranding: () => ({ logoDataUrl: null }),
}));

jest.mock("../../components/shared/ForgotPasswordModal", () => () => null);
jest.mock("../../components/shared/modals/Toast", () => () => null);
jest.mock("../../homepage/login/LogInForm", () => () => (
  <div data-testid="login-form" />
));
jest.mock("../../homepage/signup/SignUpForm", () => () => (
  <div data-testid="signup-form" />
));

jest.mock("../../homepage/hooks/useAuthLogic", () => ({
  useAuthLogic: () => ({
    authSuccess: null,
    setAuthSuccess: jest.fn(),
    trackingNum: "",
    handleTrackSearch: jest.fn(),
    searchResult: null,
    formData: {
      firstName: "",
      middleName: "",
      lastName: "",
      suffix: "",
    },
    setFormData: jest.fn(),
    handleChange: jest.fn(),
    submitAuth: jest.fn(),
    loading: false,
    purokList: [],
    allStreets: [],
    addressExists: false,
    householdHeadData: null,
    addressSearch: "",
    setAddressSearch: jest.fn(),
    addressSuggestions: [],
    isSearchingAddress: false,
    selectAddress: jest.fn(),
  }),
}));

jest.mock("../../homepage/services/loginService", () => ({
  DEFAULT_SESSION_EXPIRED_MESSAGE: "Session expired.",
  getDefaultAuthenticatedPath: jest.fn(() => "/sub-system-2"),
  login: jest.fn(),
  saveAuth: jest.fn(() => ({ token: "token" })),
  isAuthenticated: jest.fn(() => false),
}));

jest.mock("../../utils/sub-system-1/documentGenerator", () => ({
  handleDownloadSlip: jest.fn(),
}));

const renderWithRoutes = (initialPath) =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<div>Homepage</div>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe("Auth page navigation", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns to the homepage from the login page back button", async () => {
    const user = userEvent.setup();

    renderWithRoutes("/login");

    await user.click(screen.getByRole("button", { name: /back/i }));

    expect(screen.getByText("Homepage")).toBeInTheDocument();
  });

  it("returns to the homepage from the signup page back button", async () => {
    const user = userEvent.setup();

    renderWithRoutes("/signup");

    await user.click(screen.getByRole("button", { name: /back/i }));

    expect(screen.getByText("Homepage")).toBeInTheDocument();
  });
});
