import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// ── Mock all heavy child components ──────────────────────────────────────
jest.mock("../../../components/shared/Header", () =>
  function MockHeader({ currentTheme }) {
    return <div data-testid="header" data-theme={currentTheme} />;
  }
);

jest.mock("../../../components/shared/Sidebar", () =>
  function MockSidebar({ currentTheme, collapsed, onToggle }) {
    return (
      <div data-testid="sidebar" data-collapsed={String(collapsed)}>
        <button onClick={onToggle}>Toggle</button>
      </div>
    );
  }
);

jest.mock("../../../components/shared/DateTimeBar", () =>
  function MockDateTimeBar({ currentTheme }) {
    return <div data-testid="date-time-bar" />;
  }
);

jest.mock("../../../components/shared/FAQChatbot", () =>
  function MockFAQChatbot({ currentTheme }) {
    return <div data-testid="faq-chatbot" />;
  }
);

jest.mock("../../../components/shared/AdminNotificationToast", () =>
  function MockAdminToast({ currentTheme }) {
    return <div data-testid="admin-toast" />;
  }
);

jest.mock("../../../components/shared/UserNotificationToast", () =>
  function MockUserToast({ currentTheme }) {
    return <div data-testid="user-toast" />;
  }
);

// ── Mock react-router-dom Outlet ─────────────────────────────────────────
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet" />,
  };
});

// ── Mock login service ────────────────────────────────────────────────────
jest.mock("../../../homepage/services/loginService", () => ({
  isAdmin: jest.fn(() => false),
}));

import Layout from "../../../components/shared/Layout";
import { isAdmin } from "../../../homepage/services/loginService";

afterEach(() => jest.clearAllMocks());

const wrap = () =>
  render(
    <MemoryRouter>
      <Layout />
    </MemoryRouter>
  );

describe("Layout", () => {
  describe("structural elements", () => {
    it("renders the Sidebar", () => {
      wrap();
      expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    });

    it("renders the Header", () => {
      wrap();
      expect(screen.getByTestId("header")).toBeInTheDocument();
    });

    it("renders the DateTimeBar", () => {
      wrap();
      expect(screen.getByTestId("date-time-bar")).toBeInTheDocument();
    });

    it("renders the Outlet (page content area)", () => {
      wrap();
      expect(screen.getByTestId("outlet")).toBeInTheDocument();
    });

    it("renders the FAQChatbot", () => {
      wrap();
      expect(screen.getByTestId("faq-chatbot")).toBeInTheDocument();
    });
  });

  describe("notification toast selection", () => {
    it("renders AdminNotificationToast when user is admin", () => {
      isAdmin.mockReturnValue(true);
      wrap();
      expect(screen.getByTestId("admin-toast")).toBeInTheDocument();
      expect(screen.queryByTestId("user-toast")).not.toBeInTheDocument();
    });

    it("renders UserNotificationToast when user is not admin", () => {
      isAdmin.mockReturnValue(false);
      wrap();
      expect(screen.getByTestId("user-toast")).toBeInTheDocument();
      expect(screen.queryByTestId("admin-toast")).not.toBeInTheDocument();
    });
  });

  describe("sidebar collapse", () => {
    it("toggles the sidebar collapsed state when Toggle is clicked", () => {
      wrap();
      const sidebar = screen.getByTestId("sidebar");
      expect(sidebar.getAttribute("data-collapsed")).toBe("false");
      fireEvent.click(screen.getByRole("button", { name: "Toggle" }));
      expect(sidebar.getAttribute("data-collapsed")).toBe("true");
    });
  });

  describe("theme initialization", () => {
    it("reads the appTheme from localStorage on mount", () => {
      localStorage.setItem("appTheme", "dark");
      wrap();
      expect(screen.getByTestId("header").getAttribute("data-theme")).toBe("dark");
      localStorage.removeItem("appTheme");
    });

    it("falls back to 'modern' theme when localStorage has no appTheme", () => {
      localStorage.removeItem("appTheme");
      wrap();
      expect(screen.getByTestId("header").getAttribute("data-theme")).toBe("modern");
    });
  });
});
