import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateAccounts from "../../../../pages/sub-system-3/admin/CreateAccounts";

// ── Mock API ──────────────────────────────────────────────────────────────────
jest.mock("../../../../services/sub-system-1/Api", () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
}));

// ── Mock Table — component passes children (rows), not a data prop ─────────────
jest.mock("../../../../components/sub-system-1/common/table", () => {
  const React = require("react");
  return function MockTable({ children, headers }) {
    return (
      <table data-testid="accounts-table">
        <thead>
          <tr>{headers?.map((h) => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    );
  };
});

jest.mock("../../../../components/sub-system-1/common/pagination", () =>
  function MockPagination() { return <div data-testid="pagination" />; }
);

// ── Mock lucide-react icons ────────────────────────────────────────────────────
jest.mock("lucide-react", () => {
  const React = require("react");
  const Stub = ({ size, ...rest }) => <svg data-testid="icon" {...rest} />;
  return new Proxy({}, { get: () => Stub });
});

import api from "../../../../services/sub-system-1/Api";

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  api.get.mockResolvedValue({ data: [] });
  api.post.mockResolvedValue({ data: { message: "Created." } });
});

describe("CreateAccounts", () => {
  describe("rendering", () => {
    it("renders without crashing", async () => {
      render(<CreateAccounts />);
      await waitFor(() => expect(api.get).toHaveBeenCalled());
      expect(screen.getByTestId("accounts-table")).toBeInTheDocument();
    });

    it("renders the active and inactive tab buttons", async () => {
      render(<CreateAccounts />);
      await waitFor(() => expect(api.get).toHaveBeenCalled());
      // Tab buttons are role=button with text "Active" and "Inactive"
      const buttons = screen.getAllByRole("button");
      const activeTab = buttons.find((b) => b.textContent.trim().startsWith("Active"));
      const inactiveTab = buttons.find((b) => b.textContent.trim().startsWith("Inactive"));
      expect(activeTab).toBeTruthy();
      expect(inactiveTab).toBeTruthy();
    });

    it("renders account rows when data is loaded", async () => {
      api.get.mockResolvedValue({
        data: [
          { id: 1, name: "Alice Admin", email: "alice@test.com", role: "admin", is_active: 1 },
          { id: 2, name: "Bob Staff 1",  email: "bob@test.com",   role: "staff1", is_active: 1 },
        ],
      });
      render(<CreateAccounts />);
      // Names are rendered inside table rows
      await waitFor(() =>
        expect(screen.getByText("Alice Admin")).toBeInTheDocument()
      );
      expect(screen.getByText("Bob Staff 1")).toBeInTheDocument();
    });

    it("renders the search input", async () => {
      render(<CreateAccounts />);
      await waitFor(() => expect(api.get).toHaveBeenCalled());
      expect(
        screen.getByPlaceholderText(/search name, username, or email/i)
      ).toBeInTheDocument();
    });
  });

  describe("role selection", () => {
    it("renders admin and staff role options inside the add-account modal", async () => {
      render(<CreateAccounts />);
      await waitFor(() => expect(api.get).toHaveBeenCalled());
      // Role cards live inside the add-account modal
      fireEvent.click(screen.getByRole("button", { name: /new account/i }));
      await waitFor(() => expect(screen.getByText("Admin")).toBeInTheDocument());
      expect(screen.getByText("Staff 1")).toBeInTheDocument();
      expect(screen.getByText("Staff 2")).toBeInTheDocument();
      expect(screen.getByText("Staff 3")).toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("shows an error message when the API call fails", async () => {
      api.get.mockRejectedValue({ response: { data: { message: "Unauthorized." } } });
      render(<CreateAccounts />);
      await waitFor(() =>
        expect(screen.getByText(/unauthorized/i)).toBeInTheDocument()
      );
    });
  });

  describe("pagination", () => {
    it("renders the pagination component", async () => {
      render(<CreateAccounts />);
      await waitFor(() => expect(screen.getByTestId("pagination")).toBeInTheDocument());
    });
  });
});
