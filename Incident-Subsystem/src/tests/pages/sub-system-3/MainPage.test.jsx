import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MainPage from "../../../pages/sub-system-3/MainPage";

jest.mock("../../../context/LanguageContext", () => ({
  useLanguage: () => ({
    language: "en",
    setLanguage: jest.fn(),
    tr: { mainPage: { title: "INCIDENT & COMPLAINT MANAGEMENT" } },
  }),
}));

jest.mock("../../../components/sub-system-3/MainMenuCards", () =>
  function MockMainMenuCards() {
    return <div data-testid="main-menu-cards" />;
  }
);

jest.mock("../../../components/sub-system-3/Footer", () =>
  function MockFooter({ currentTheme }) {
    return <footer data-testid="footer" data-theme={currentTheme} />;
  }
);

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe("MainPage", () => {
  describe("rendering", () => {
    it("renders the page title from translations", () => {
      render(<MainPage />);
      expect(
        screen.getByRole("heading", { name: /incident & complaint management/i })
      ).toBeInTheDocument();
    });

    it("renders the MainMenuCards component", () => {
      render(<MainPage />);
      expect(screen.getByTestId("main-menu-cards")).toBeInTheDocument();
    });

    it("renders the Footer component", () => {
      render(<MainPage />);
      expect(screen.getByTestId("footer")).toBeInTheDocument();
    });
  });

  describe("theme", () => {
    it("defaults to 'modern' theme when localStorage is empty", () => {
      render(<MainPage />);
      expect(screen.getByTestId("footer")).toHaveAttribute("data-theme", "modern");
    });

    it("reads theme from localStorage on mount", () => {
      localStorage.setItem("appTheme", "blue");
      render(<MainPage />);
      expect(screen.getByTestId("footer")).toHaveAttribute("data-theme", "blue");
    });

    it("updates theme on themeChange event", () => {
      render(<MainPage />);
      fireEvent(window, new CustomEvent("themeChange", { detail: "purple" }));
      expect(screen.getByTestId("footer")).toHaveAttribute("data-theme", "purple");
    });
  });
});
