import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UpdateFormModal from "../../components/sub-system-3/UpdateFormModal";

jest.mock("../../services/sub-system-3/customFieldService", () => ({
  getAllCustomFields: jest.fn(),
  createCustomField: jest.fn(),
  updateCustomField: jest.fn(),
}));

import {
  getAllCustomFields,
  createCustomField,
  updateCustomField,
} from "../../services/sub-system-3/customFieldService";

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  formType: "incident",
  currentTheme: "blue",
};

const incidentField = {
  id: 1,
  field_label: "Priority Level",
  field_type: "select",
  field_for: "incident",
  is_active: true,
};

const complaintField = {
  id: 2,
  field_label: "Urgency",
  field_type: "radio",
  field_for: "complaint",
  is_active: false,
};

beforeEach(() => {
  jest.resetAllMocks();
  getAllCustomFields.mockResolvedValue([incidentField, complaintField]);
});

// ─── Visibility ───────────────────────────────────────────────────────────────
describe("visibility", () => {
  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <UpdateFormModal {...defaultProps} isOpen={false} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the modal when isOpen is true", async () => {
    render(<UpdateFormModal {...defaultProps} />);
    await waitFor(() =>
      expect(screen.getByText(/Update Incident Report Form/i)).toBeInTheDocument()
    );
  });
});

// ─── Permanent fields ─────────────────────────────────────────────────────────
describe("permanent fields", () => {
  it("shows the Permanent Fields section", async () => {
    render(<UpdateFormModal {...defaultProps} />);
    await waitFor(() =>
      expect(screen.getByText("Permanent Fields")).toBeInTheDocument()
    );
  });

  it("renders incident permanent fields for formType='incident'", async () => {
    render(<UpdateFormModal {...defaultProps} formType="incident" />);
    await waitFor(() =>
      expect(screen.getByText("Types of Incident")).toBeInTheDocument()
    );
  });

  it("renders complaint permanent fields for formType='complaint'", async () => {
    render(<UpdateFormModal {...defaultProps} formType="complaint" />);
    await waitFor(() =>
      expect(screen.getByText("Date of Complaint")).toBeInTheDocument()
    );
  });
});

// ─── Custom fields loading ────────────────────────────────────────────────────
describe("custom fields loading", () => {
  it("fetches custom fields on open and shows incident fields", async () => {
    render(<UpdateFormModal {...defaultProps} formType="incident" />);
    await waitFor(() =>
      expect(screen.getByText("Priority Level")).toBeInTheDocument()
    );
  });

  it("only shows fields matching the formType", async () => {
    render(<UpdateFormModal {...defaultProps} formType="incident" />);
    await waitFor(() =>
      expect(screen.getByText("Priority Level")).toBeInTheDocument()
    );
    expect(screen.queryByText("Urgency")).not.toBeInTheDocument();
  });

  it("shows an error message when fetching fails", async () => {
    getAllCustomFields.mockRejectedValue(new Error("Network error"));
    render(<UpdateFormModal {...defaultProps} />);
    await waitFor(() =>
      expect(screen.getByText("Network error")).toBeInTheDocument()
    );
  });
});

// ─── Toggle active ────────────────────────────────────────────────────────────
describe("toggle active", () => {
  it("calls updateCustomField when toggle is clicked", async () => {
    updateCustomField.mockResolvedValue({ ...incidentField, is_active: false });
    render(<UpdateFormModal {...defaultProps} />);

    await waitFor(() =>
      expect(screen.getByText("Priority Level")).toBeInTheDocument()
    );

    // The toggle button uses a title attribute ("Click to disable" when active)
    const toggleBtn = screen.getByTitle(/click to disable/i);
    fireEvent.click(toggleBtn);

    await waitFor(() =>
      expect(updateCustomField).toHaveBeenCalledWith(1, { is_active: false })
    );
  });
});

// ─── Add new field ────────────────────────────────────────────────────────────
describe("add new field", () => {
  it("shows the Add Field form when Add Custom Field button is clicked", async () => {
    render(<UpdateFormModal {...defaultProps} />);
    await waitFor(() =>
      expect(screen.getByText("Priority Level")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole("button", { name: /^add field$/i }));
    expect(screen.getByPlaceholderText(/barangay official/i)).toBeInTheDocument();
  });

  it("calls createCustomField with correct payload on save", async () => {
    createCustomField.mockResolvedValue({
      id: 3,
      field_label: "Notes",
      field_type: "text",
      field_for: "incident",
      is_active: true,
    });

    render(<UpdateFormModal {...defaultProps} />);
    await waitFor(() =>
      expect(screen.getByText("Priority Level")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole("button", { name: /^add field$/i }));

    fireEvent.change(screen.getByPlaceholderText(/barangay official/i), {
      target: { value: "Notes" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save field/i }));

    await waitFor(() =>
      expect(createCustomField).toHaveBeenCalledWith(
        expect.objectContaining({
          field_label: "Notes",
          field_for: "incident",
          field_type: "text",
        })
      )
    );
  });

  it("shows a save error when createCustomField fails", async () => {
    createCustomField.mockRejectedValue(new Error("Validation failed"));
    render(<UpdateFormModal {...defaultProps} />);
    await waitFor(() =>
      expect(screen.getByText("Priority Level")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole("button", { name: /^add field$/i }));
    fireEvent.change(screen.getByPlaceholderText(/barangay official/i), {
      target: { value: "Notes" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save field/i }));

    await waitFor(() =>
      expect(screen.getByText("Validation failed")).toBeInTheDocument()
    );
  });
});

// ─── Close handlers ───────────────────────────────────────────────────────────
describe("close handlers", () => {
  it("calls onClose when the X button is clicked", async () => {
    const onClose = jest.fn();
    render(<UpdateFormModal {...defaultProps} onClose={onClose} />);
    await waitFor(() =>
      expect(screen.getByText(/Permanent Fields/i)).toBeInTheDocument()
    );
    // X button has no aria-label; it's the first button in the modal header
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when ESC is pressed", async () => {
    const onClose = jest.fn();
    render(<UpdateFormModal {...defaultProps} onClose={onClose} />);
    await waitFor(() =>
      expect(screen.getByText(/Permanent Fields/i)).toBeInTheDocument()
    );
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
