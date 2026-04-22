import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminAppointments from "../../../../pages/sub-system-3/admin/AdminAppointments";

const mockTr = {
  sub1: { search: "Search…", filter: "Filter" },
  adminAppointments: {
    title: "Appointments",
    searchPlaceholder: "Search appointments…",
    all: "All",
    scheduled: "Scheduled",
    rescheduled: "Rescheduled",
    completed: "Completed",
    cancelled: "Cancelled",
    noShow: "No Show",
    noAppointments: "No appointments found.",
    complainant: "Complainant",
    respondent: "Respondent",
    date: "Date",
    time: "Time",
    status: "Status",
    actions: "Actions",
    viewDetails: "View Details",
    approve: "Approve",
    reject: "Reject",
    reschedule: "Reschedule",
    loading: "Loading…",
    complaintId: "Complaint #",
    selectDateFirst: "Select a date first to see available slots.",
    filtered: "Filtered:",
    clear: "Clear",
    scheduleAppointment: "Schedule Appointment",
    rescheduleAppointment: "Reschedule Appointment",
    selectDate: "Select Date",
    selectTime: "Select Time",
    notes: "Notes (Optional)",
    notesPlaceholder: "Add notes for this appointment…",
    saveAppointment: "Save Appointment",
    saving: "Saving…",
    complaintInfo: "Complaint Information",
    complainantInfo: "Complainant",
    respondentInfo: "Respondent",
    currentSchedule: "Current Schedule",
    appointmentHistory: "Appointment History",
    noHistory: "No appointment history yet.",
    complete: "Complete",
    noShowMark: "No Show",
    subtitle: "Complaint hearing appointments · Mon – Fri · 7:00 AM – 5:00 PM",
    statTotal: "TOTAL",
    statScheduled: "SCHEDULED",
    statCompleted: "COMPLETED",
    statCancelled: "CANCELLED",
    createNewAppointment: "Create New Appointment",
    from: "From",
    to: "To",
    clearFilters: "Clear Filters",
    showingAppointmentsFor: "Showing appointments for",
    apptId: "Appt ID",
    complaint: "Complaint",
    showingResults: "Showing {from}–{to} of {total} results",
    prev: "Prev",
    next: "Next",
    newDate: "New Date",
    weekdaysOnly: "(Mon – Fri only)",
    newTime: "New Time",
    timeRange: "(7:00 AM – 5:00 PM)",
    selected: "Selected:",
    slotBooked: "This slot is already booked.",
    autoNotify: "The complainant will be notified.",
    confirmReschedule: "Confirm Reschedule",
    cancel: "Cancel",
    complainantLabel: "Complainant",
    respondentLabel: "Respondent",
    respondentAddress: "Respondent Address",
    appointmentId: "Appointment ID",
    description: "Description",
    markCompleted: "Mark as Completed",
    markNoShow: "Mark as No Show",
    rescheduleBtn: "Reschedule",
    confirmMarkCompleted: "Mark as Completed?",
    confirmMarkNoShow: "Mark as No Show?",
    confirmMarkCompletedMsg: "This will mark Appointment #{id} as completed.",
    confirmMarkNoShowMsg: "This will mark Appointment #{id} as no-show.",
    yesMarkCompleted: "Yes, Mark Completed",
    yesMarkNoShow: "Yes, Mark No Show",
    titleField: "Title",
    descriptionField: "Description",
    optional: "(optional)",
    processing: "Processing…",
    creating: "Creating…",
    createAppointment: "Create Appointment",
  },
};

jest.mock("../../../../context/LanguageContext", () => ({
  useLanguage: () => ({ language: "en", setLanguage: jest.fn(), tr: mockTr }),
}));

jest.mock("../../../../homepage/services/loginService", () => ({
  canViewAppointments: jest.fn(() => true),
  canManageAppointments: jest.fn(() => true),
}));

jest.mock("../../../../services/sub-system-3/appointmentService", () => ({
  rescheduleAppointment: jest.fn(),
  createAppointment: jest.fn(),
  completeAppointment: jest.fn(),
  markNoShow: jest.fn(),
  getTimeSlots: jest.fn(() => ["09:00", "10:00", "11:00"]),
  getAvailability: jest.fn(),
}));

jest.mock("../../../../services/sub-system-3/complaintService", () => ({
  getAllComplaints: jest.fn(),
}));

jest.mock("../../../../components/shared/modals/Toast", () =>
  function MockToast({ toasts = [] }) {
    return (
      <div data-testid="toast-container">
        {toasts.map((t) => (
          <div key={t.id} data-testid="toast" role="alert">
            <span>{t.title}</span>
            {t.message && <span>{t.message}</span>}
          </div>
        ))}
      </div>
    );
  }
);

jest.mock("../../../../components/shared/DatePickerField", () => {
  const React = require("react");
  return function MockDatePickerField({ placeholder, value, onChange }) {
    return (
      <input
        placeholder={placeholder}
        value={value || ""}
        onChange={(e) => onChange && onChange(e.target.value)}
      />
    );
  };
});

jest.mock("../../../../components/shared/ConfirmationModal", () =>
  function MockConfirmationModal({ isOpen }) {
    if (!isOpen) return null;
    return <div data-testid="confirmation-modal" />;
  }
);

import { getAllComplaints } from "../../../../services/sub-system-3/complaintService";
import { getAvailability } from "../../../../services/sub-system-3/appointmentService";

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  getAllComplaints.mockResolvedValue([]);
  getAvailability.mockResolvedValue([]);
});

describe("AdminAppointments", () => {
  describe("rendering", () => {
    it("renders the 'Appointments' heading", async () => {
      render(<MemoryRouter><AdminAppointments /></MemoryRouter>);
      await waitFor(() =>
        expect(screen.getByText("Appointments")).toBeInTheDocument()
      );
    });

    it("renders the subtitle", async () => {
      render(<MemoryRouter><AdminAppointments /></MemoryRouter>);
      await waitFor(() =>
        expect(screen.getAllByText(/Mon – Fri/i).length).toBeGreaterThan(0)
      );
    });

    it("renders status filter tabs", async () => {
      render(<MemoryRouter><AdminAppointments /></MemoryRouter>);
      // Tab buttons include a count suffix: "All (0)", "Scheduled (0)", etc.
      await waitFor(() =>
        expect(screen.getByRole("button", { name: /^All/i })).toBeInTheDocument()
      );
      expect(screen.getByRole("button", { name: /^Scheduled/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^Completed/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^Cancelled/i })).toBeInTheDocument();
    });

    it("renders stat cards", async () => {
      render(<MemoryRouter><AdminAppointments /></MemoryRouter>);
      await waitFor(() => expect(screen.getByText("TOTAL")).toBeInTheDocument());
      expect(screen.getByText("SCHEDULED")).toBeInTheDocument();
      expect(screen.getByText("COMPLETED")).toBeInTheDocument();
    });

    it("renders the search input", async () => {
      render(<MemoryRouter><AdminAppointments /></MemoryRouter>);
      await waitFor(() =>
        expect(screen.getByPlaceholderText(/search appointments/i)).toBeInTheDocument()
      );
    });

    it("renders the 'Create New Appointment' button", async () => {
      render(<MemoryRouter><AdminAppointments /></MemoryRouter>);
      await waitFor(() =>
        expect(screen.getByRole("button", { name: /create new appointment/i })).toBeInTheDocument()
      );
    });
  });

  describe("empty state", () => {
    it("shows 'No appointments found.' when there are none", async () => {
      render(<MemoryRouter><AdminAppointments /></MemoryRouter>);
      await waitFor(() =>
        expect(screen.getByText("No appointments found.")).toBeInTheDocument()
      );
    });
  });

  describe("data fetching", () => {
    it("fetches complaints on mount", async () => {
      render(<MemoryRouter><AdminAppointments /></MemoryRouter>);
      await waitFor(() => expect(getAllComplaints).toHaveBeenCalled());
    });
  });

  describe("error handling", () => {
    it("shows an error toast when appointments fail to load", async () => {
      getAllComplaints.mockRejectedValue(new Error("Network error"));
      render(<MemoryRouter><AdminAppointments /></MemoryRouter>);
      await waitFor(() =>
        expect(screen.getByText("Error")).toBeInTheDocument()
      );
    });
  });

  describe("status filter tabs", () => {
    it("switches to Scheduled filter when tab is clicked", async () => {
      render(<MemoryRouter><AdminAppointments /></MemoryRouter>);
      await waitFor(() => screen.getByRole("button", { name: /^Scheduled/i }));
      fireEvent.click(screen.getByRole("button", { name: /^Scheduled/i }));
      // After filtering, the page still renders without crash
      expect(screen.getByText("No appointments found.")).toBeInTheDocument();
    });
  });
});
