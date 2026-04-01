import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TwoStepIncidentReportModal from "../../components/sub-system-3/TwoStepIncidentReportModal";

// ── Service mocks ─────────────────────────────────────────────────────────────
jest.mock("../../services/sub-system-3/incidentService", () => ({
  incidentService: {
    getIncidentTypes: jest.fn(),
    submitReport: jest.fn(),
  },
}));
jest.mock("../../services/sub-system-3/customFieldService", () => ({
  getAllCustomFields: jest.fn(),
}));

// Stub heavy child components
jest.mock("../../components/sub-system-3/TwoStepIncidentForm", () =>
  () => <div data-testid="incident-form" />
);
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

import { incidentService } from "../../services/sub-system-3/incidentService";
import { getAllCustomFields } from "../../services/sub-system-3/customFieldService";

const renderModal = (props = {}) =>
  render(
    <TwoStepIncidentReportModal
      isOpen={true}
      onClose={jest.fn()}
      currentTheme="blue"
      {...props}
    />
  );

beforeEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
  incidentService.getIncidentTypes.mockResolvedValue([]);
  getAllCustomFields.mockResolvedValue([]);
});

// ─── Visibility ───────────────────────────────────────────────────────────────
describe("visibility", () => {
  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <TwoStepIncidentReportModal isOpen={false} onClose={jest.fn()} currentTheme="blue" />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the Incident Report title when open", async () => {
    renderModal();
    await waitFor(() =>
      expect(screen.getByText("Incident Report")).toBeInTheDocument()
    );
  });
});

// ─── Step navigation ──────────────────────────────────────────────────────────
describe("step navigation", () => {
  it("starts on step 1 of 2", async () => {
    renderModal();
    await waitFor(() =>
      expect(screen.getByTestId("progress")).toHaveTextContent("1 of 2")
    );
  });

  it("shows the Previous button as disabled on step 1", async () => {
    renderModal();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled()
    );
  });

  it("shows the Next button on step 1", async () => {
    renderModal();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /^next$/i })).toBeInTheDocument()
    );
  });

  it("shows the step counter in the footer", async () => {
    renderModal();
    await waitFor(() =>
      expect(screen.getByText("Step 1 of 2")).toBeInTheDocument()
    );
  });
});

// ─── Data fetching on open ────────────────────────────────────────────────────
describe("data fetching on open", () => {
  it("calls getIncidentTypes when the modal opens", async () => {
    renderModal();
    await waitFor(() =>
      expect(incidentService.getIncidentTypes).toHaveBeenCalledTimes(1)
    );
  });

  it("calls getAllCustomFields when the modal opens", async () => {
    renderModal();
    await waitFor(() =>
      expect(getAllCustomFields).toHaveBeenCalledTimes(1)
    );
  });
});

// ─── Draft restore ────────────────────────────────────────────────────────────
describe("draft restore", () => {
  it("shows the draft prompt when a saved draft exists", async () => {
    localStorage.setItem(
      "incident_report_draft",
      JSON.stringify({
        formData: { description: "Flooding", incidentTypes: [1] },
        step: 1,
      })
    );
    renderModal();
    await waitFor(() =>
      expect(screen.getByText("Unsaved Draft Found")).toBeInTheDocument()
    );
  });

  it("clears the draft and hides the prompt when Start Over is clicked", async () => {
    localStorage.setItem(
      "incident_report_draft",
      JSON.stringify({
        formData: { description: "Flooding", incidentTypes: [1] },
        step: 1,
      })
    );
    renderModal();
    await waitFor(() =>
      expect(screen.getByText("Start Over")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText("Start Over"));
    expect(localStorage.getItem("incident_report_draft")).toBeNull();
    await waitFor(() =>
      expect(screen.queryByText("Unsaved Draft Found")).not.toBeInTheDocument()
    );
  });

  it("restores the draft step when Continue Draft is clicked", async () => {
    localStorage.setItem(
      "incident_report_draft",
      JSON.stringify({
        formData: { description: "Flooding", incidentTypes: [1] },
        step: 2,
      })
    );
    renderModal();
    await waitFor(() =>
      expect(screen.getByText("Continue Draft")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText("Continue Draft"));
    await waitFor(() =>
      expect(screen.getByTestId("progress")).toHaveTextContent("2 of 2")
    );
  });
});

// ─── Discard confirm ──────────────────────────────────────────────────────────
describe("discard confirm modal", () => {
  it("shows discard modal when close button is clicked", async () => {
    renderModal();
    await waitFor(() =>
      expect(screen.getByText("Incident Report")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole("button", { name: /close modal/i }));
    expect(screen.getByTestId("discard-modal")).toBeInTheDocument();
  });

  it("calls onClose when Discard is confirmed", async () => {
    const onClose = jest.fn();
    renderModal({ onClose });
    await waitFor(() =>
      expect(screen.getByText("Incident Report")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole("button", { name: /close modal/i }));
    fireEvent.click(screen.getByText("Discard"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("hides the discard modal when Stay is clicked", async () => {
    renderModal();
    await waitFor(() =>
      expect(screen.getByText("Incident Report")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole("button", { name: /close modal/i }));
    fireEvent.click(screen.getByText("Stay"));
    expect(screen.queryByTestId("discard-modal")).not.toBeInTheDocument();
  });

  it("shows discard confirm when ESC key is pressed", async () => {
    renderModal();
    await waitFor(() =>
      expect(screen.getByText("Incident Report")).toBeInTheDocument()
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByTestId("discard-modal")).toBeInTheDocument();
  });
});

// ─── Submission (step 2) ──────────────────────────────────────────────────────
describe("submission", () => {
  it("calls submitReport when on last step and Submit Report is clicked", async () => {
    incidentService.submitReport.mockResolvedValue({ id: 1 });
    localStorage.setItem(
      "incident_report_draft",
      JSON.stringify({
        formData: {
          description: "Flooding",
          incidentTypes: [1],
          attachments: [],
          latitude: 14.5,
          longitude: 121.0,
          location: "Barangay Hall",
          customFieldValues: {},
        },
        step: 2,
      })
    );
    renderModal();
    await waitFor(() =>
      expect(screen.getByText("Continue Draft")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText("Continue Draft"));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /submit report/i })).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole("button", { name: /submit report/i }));
    await waitFor(() =>
      expect(incidentService.submitReport).toHaveBeenCalledTimes(1)
    );
  });
});
