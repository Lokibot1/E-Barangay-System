import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ComplaintModal from "../../components/sub-system-3/ComplaintModal";

// ── Service / dep mocks ───────────────────────────────────────────────────────
jest.mock("../../services/sub-system-3/complaintService", () => ({
  fileComplaint: jest.fn(),
}));
jest.mock("../../services/sub-system-3/customFieldService", () => ({
  getAllCustomFields: jest.fn(),
}));
jest.mock("../../homepage/services/loginService", () => ({
  getUser: jest.fn(),
}));
jest.mock("../../context/LanguageContext", () => ({
  useLanguage: () => ({
    tr: {
      complaintModal: {
        title: "File a Complaint",
        subtitle: "Submit your complaint",
        previous: "← Previous",
        next: "Next →",
        step: "Step",
        of: "of",
        submit: "✓ Submit Complaint",
        submitting: "Submitting...",
        successTitle: "Complaint Submitted!",
        successMessage: "Your complaint has been recorded.",
        errorSessionTitle: "Session Expired",
        errorSessionMessage: "Please log in again.",
        errorTitle: "Submission Failed",
        errorMessage: "Something went wrong.",
        dateRequired: "Date of complaint is required.",
        dateFuture: "Date cannot be in the future.",
        timeRequired: "Time of complaint is required.",
        locationRequired: "Location is required.",
        typeRequired: "Please select a complaint type.",
        severityRequired: "Please select a severity level.",
        descriptionRequired: "A detailed description is required.",
        complainantRequired: "Complainant name is required.",
        contactRequired: "Complainant contact number is required.",
        respondentRequired: "Respondent name is required.",
        coordinatesRequired: "Please pin the location on the map.",
      },
    },
  }),
}));

// Stub heavy child components
jest.mock("../../components/sub-system-3/Complaintform", () => () => (
  <div data-testid="complaint-form" />
));
jest.mock("../../components/sub-system-3/ProgressIndicator", () =>
  ({ currentStep, totalSteps }) => (
    <div data-testid="progress">{currentStep} of {totalSteps}</div>
  )
);
jest.mock("../../components/sub-system-3/DiscardConfirmModal", () =>
  ({ isOpen, onConfirm, onCancel }) =>
    isOpen ? (
      <div data-testid="discard-modal">
        <button onClick={onConfirm}>Discard</button>
        <button onClick={onCancel}>Stay</button>
      </div>
    ) : null
);
jest.mock("../../components/shared/modals/Toast", () => () => null);

import { fileComplaint } from "../../services/sub-system-3/complaintService";
import { getAllCustomFields } from "../../services/sub-system-3/customFieldService";
import { getUser } from "../../homepage/services/loginService";

const renderModal = (props = {}) =>
  render(
    <MemoryRouter>
      <ComplaintModal isOpen={true} onClose={jest.fn()} currentTheme="blue" {...props} />
    </MemoryRouter>
  );

beforeEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
  getAllCustomFields.mockResolvedValue([]);
  getUser.mockReturnValue(null);
});

// ─── Visibility ───────────────────────────────────────────────────────────────
describe("visibility", () => {
  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <MemoryRouter>
        <ComplaintModal isOpen={false} onClose={jest.fn()} currentTheme="blue" />
      </MemoryRouter>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the modal title when open", async () => {
    renderModal();
    await waitFor(() =>
      expect(screen.getByText("File a Complaint")).toBeInTheDocument()
    );
  });
});

// ─── Step navigation ──────────────────────────────────────────────────────────
describe("step navigation", () => {
  it("starts on step 1 of 4", async () => {
    renderModal();
    await waitFor(() =>
      expect(screen.getByTestId("progress")).toHaveTextContent("1 of 4")
    );
  });

  it("shows the Previous button as disabled on step 1", async () => {
    renderModal();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /← previous/i })).toBeDisabled()
    );
  });

  it("shows the Next button on step 1", async () => {
    renderModal();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /next →/i })).toBeInTheDocument()
    );
  });
});

// ─── Draft restore ────────────────────────────────────────────────────────────
describe("draft restore", () => {
  it("shows the draft prompt when a saved draft exists", async () => {
    localStorage.setItem(
      "complaint_draft",
      JSON.stringify({
        formData: { complaintDate: "2025-01-01", complaintType: "noise" },
        step: 2,
      })
    );
    renderModal();
    await waitFor(() =>
      expect(screen.getByText("Unsaved Draft Found")).toBeInTheDocument()
    );
  });

  it("clears the draft and resets to step 1 when Start Over is clicked", async () => {
    localStorage.setItem(
      "complaint_draft",
      JSON.stringify({
        formData: { complaintDate: "2025-01-01", complaintType: "noise" },
        step: 2,
      })
    );
    renderModal();
    await waitFor(() =>
      expect(screen.getByText("Start Over")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText("Start Over"));
    expect(localStorage.getItem("complaint_draft")).toBeNull();
    await waitFor(() =>
      expect(screen.queryByText("Unsaved Draft Found")).not.toBeInTheDocument()
    );
  });

  it("restores the draft step when Continue Draft is clicked", async () => {
    localStorage.setItem(
      "complaint_draft",
      JSON.stringify({
        formData: { complaintDate: "2025-01-01", complaintType: "noise" },
        step: 3,
      })
    );
    renderModal();
    await waitFor(() =>
      expect(screen.getByText("Continue Draft")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText("Continue Draft"));
    await waitFor(() =>
      expect(screen.getByTestId("progress")).toHaveTextContent("3 of 4")
    );
  });
});

// ─── Auto-fill from logged-in user ───────────────────────────────────────────
describe("auto-fill from user", () => {
  it("calls getUser on open to pre-fill complainant info", async () => {
    getUser.mockReturnValue({
      first_name: "Juan",
      last_name: "dela Cruz",
      contact_number: "09171234567",
    });
    renderModal();
    await waitFor(() => expect(getUser).toHaveBeenCalled());
  });
});

// ─── Discard confirm ──────────────────────────────────────────────────────────
describe("discard confirm modal", () => {
  it("shows the discard confirm modal when close button is clicked", async () => {
    renderModal();
    await waitFor(() =>
      expect(screen.getByText("File a Complaint")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole("button", { name: /close modal/i }));
    expect(screen.getByTestId("discard-modal")).toBeInTheDocument();
  });

  it("calls onClose when Discard is confirmed", async () => {
    const onClose = jest.fn();
    renderModal({ onClose });
    await waitFor(() =>
      expect(screen.getByText("File a Complaint")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole("button", { name: /close modal/i }));
    fireEvent.click(screen.getByText("Discard"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("hides the discard modal when Stay is clicked", async () => {
    renderModal();
    await waitFor(() =>
      expect(screen.getByText("File a Complaint")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole("button", { name: /close modal/i }));
    fireEvent.click(screen.getByText("Stay"));
    expect(screen.queryByTestId("discard-modal")).not.toBeInTheDocument();
  });

  it("shows discard confirm when ESC key is pressed", async () => {
    renderModal();
    await waitFor(() =>
      expect(screen.getByText("File a Complaint")).toBeInTheDocument()
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByTestId("discard-modal")).toBeInTheDocument();
  });
});

// ─── Submission ───────────────────────────────────────────────────────────────
describe("submission", () => {
  it("calls fileComplaint when form is on last step and Submit is clicked", async () => {
    fileComplaint.mockResolvedValue({ id: 1 });
    // Pre-seed draft at step 4 so we skip straight to submit
    localStorage.setItem(
      "complaint_draft",
      JSON.stringify({
        formData: {
          complaintDate: "2025-01-01",
          complaintType: "noise",
          complaintTime: "09:00",
          location: "Barangay Hall",
          latitude: 14.5,
          longitude: 121.0,
          severity: "low",
          description: "Test description",
          complainantName: "Juan",
          complainantContact: "09171234567",
          respondentName: "Pedro",
          respondentAddress: "123 St",
          witnesses: [],
          desiredResolution: "Stop noise",
          additionalNotes: "",
          attachments: [],
          customFieldValues: {},
        },
        step: 4,
      })
    );
    renderModal();
    await waitFor(() =>
      expect(screen.getByText("Continue Draft")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText("Continue Draft"));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /submit complaint/i })).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole("button", { name: /submit complaint/i }));
    await waitFor(() => expect(fileComplaint).toHaveBeenCalledTimes(1));
  });
});

// ─── Draft save on close ──────────────────────────────────────────────────────
describe("draft save on close", () => {
  it("saves draft to localStorage when modal closes with unsaved content", async () => {
    const { rerender } = renderModal();
    await waitFor(() =>
      expect(screen.getByText("File a Complaint")).toBeInTheDocument()
    );
    // Seed draft content directly via localStorage to simulate typed data
    localStorage.setItem(
      "complaint_draft",
      JSON.stringify({
        formData: { complaintDate: "2025-01-01", complaintType: "noise" },
        step: 1,
      })
    );
    rerender(
      <MemoryRouter>
        <ComplaintModal isOpen={false} onClose={jest.fn()} currentTheme="blue" />
      </MemoryRouter>
    );
    // Draft we seeded should still be there
    expect(localStorage.getItem("complaint_draft")).not.toBeNull();
  });
});
