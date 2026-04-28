import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarClock,
  Clock3,
  Download,
  FileText,
  MapPin,
  ScanSearch,
  Search,
  ShieldCheck,
} from "lucide-react";
import themeTokens from "../../Themetokens";
import Toast from "../../components/shared/modals/Toast";
import {
  cancelAppointment,
  getComplaintAppointments,
  getAvailability,
  getTimeSlots,
  rescheduleAppointment,
} from "../../services/sub-system-3/appointmentService";
import { getMyComplaints } from "../../services/sub-system-3/complaintService";
import { incidentService } from "../../services/sub-system-3/incidentService";
import {
  buildReceiptPayloadFromAppointment,
  buildReceiptPayloadFromRecord,
  listStoredRequestRecords,
} from "../../utils/requestCenter";
import { downloadRequestReceipt } from "../../utils/requestReceiptPdf";
import { queueCommunicationEvent } from "../../utils/securityCenter";
import { useUserRealTime } from "../../context/UserRealTimeContext";

const FILTERS = [
  { key: "all", label: "All Requests" },
  { key: "document", label: "Documents" },
  { key: "complaint", label: "Complaints" },
  { key: "incident", label: "Incidents" },
  { key: "appointment", label: "Appointments" },
];

const formatDateTime = (value) => {
  if (!value) return "Unavailable";

  const normalizedValue = String(value).includes("T")
    ? value
    : String(value).replace(" ", "T");
  const parsed = new Date(normalizedValue);

  if (Number.isNaN(parsed.getTime())) return String(value);

  return parsed.toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatStatusLabel = (value, fallback = "Pending") => {
  if (!value) return fallback;
  const normalized = String(value).replace(/[_-]+/g, " ");
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const createReference = (prefix, id) =>
  `${prefix}-${String(id || "LOCAL").padStart(5, "0")}`;

const parseScheduledAt = (scheduledAt) => {
  if (!scheduledAt) return { date: "", time: "" };
  const [datePart, timePart] = String(scheduledAt).split(/[T ]/);
  return {
    date: datePart || "",
    time: timePart ? timePart.substring(0, 5) : "",
  };
};

const isWeekend = (dateValue) => {
  const parsed = new Date(`${dateValue}T00:00:00`);
  const day = parsed.getDay();
  return day === 0 || day === 6;
};

const getStatusBadgeClass = (category, status) => {
  const normalized = String(status || "")
    .toLowerCase()
    .replace(/[_-]+/g, " ");

  if (
    normalized.includes("resolved") ||
    normalized.includes("verified") ||
    normalized.includes("completed")
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    normalized.includes("cancel") ||
    normalized.includes("rejected") ||
    normalized.includes("no show")
  ) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (category === "appointment" && normalized.includes("rescheduled")) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-sky-200 bg-sky-50 text-sky-700";
};

const buildComplaintReceipt = (complaint) => ({
  title: `Complaint: ${complaint.type || "General Concern"}`,
  reference: createReference("CMP", complaint.id),
  category: "complaint",
  status: formatStatusLabel(complaint.status, "Ongoing"),
  submittedAt:
    complaint.created_at || complaint.incident_date || new Date().toISOString(),
  requesterName: complaint.complainant_name || "Resident",
  contactNumber: complaint.complainant_contact || "",
  email: "",
  address: complaint.location || complaint.respondent_address || "",
  purpose: complaint.description || complaint.desired_resolution || "",
  documentType: "",
  verificationUrl: "",
});

const buildIncidentReceipt = (incident) => ({
  title: `Incident Report: ${incident.type || "Incident"}`,
  reference: createReference("INC", incident.id),
  category: "incident",
  status: formatStatusLabel(incident.status, "Pending"),
  submittedAt: incident.created_at || new Date().toISOString(),
  requesterName: incident.reported_by || "Resident",
  contactNumber: "",
  email: "",
  address: incident.location || "",
  purpose: incident.description || incident.additional_notes || "",
  documentType: "",
  verificationUrl: "",
});

const SummaryCard = ({ label, value, accentClass, icon: Icon, t }) => (
  <div
    className={`rounded-[24px] border ${t.cardBorder} ${t.cardBg} px-5 py-5 shadow-sm`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p
          className={`text-[10px] font-kumbh font-semibold uppercase tracking-[0.18em] ${t.subtleText}`}
        >
          {label}
        </p>
        <p className={`mt-3 text-3xl font-bold font-spartan ${t.cardText}`}>
          {value}
        </p>
      </div>
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accentClass}`}
      >
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

const getCategoryMeta = (kind, isDark = false) => {
  switch (kind) {
    case "document":
      return {
        label: "Document",
        Icon: FileText,
        surfaceClass: isDark
          ? "from-emerald-950/60 via-slate-900 to-slate-900"
          : "from-emerald-50 via-white to-sky-50",
        glowClass: isDark ? "bg-emerald-500/20" : "bg-emerald-200/80",
        iconClass: isDark
          ? "bg-emerald-500/15 text-emerald-300"
          : "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20",
        eyebrowClass: isDark
          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
          : "border-emerald-200 bg-emerald-50 text-emerald-700",
        accentTextClass: isDark ? "text-emerald-300" : "text-emerald-700",
      };
    case "complaint":
      return {
        label: "Complaint",
        Icon: AlertTriangle,
        surfaceClass: isDark
          ? "from-amber-950/50 via-slate-900 to-slate-900"
          : "from-amber-50 via-white to-rose-50",
        glowClass: isDark ? "bg-amber-500/20" : "bg-amber-200/80",
        iconClass: isDark
          ? "bg-amber-500/15 text-amber-300"
          : "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20",
        eyebrowClass: isDark
          ? "border-amber-500/25 bg-amber-500/10 text-amber-200"
          : "border-amber-200 bg-amber-50 text-amber-700",
        accentTextClass: isDark ? "text-amber-300" : "text-amber-700",
      };
    case "incident":
      return {
        label: "Incident",
        Icon: ShieldCheck,
        surfaceClass: isDark
          ? "from-sky-950/50 via-slate-900 to-slate-900"
          : "from-sky-50 via-white to-blue-50",
        glowClass: isDark ? "bg-sky-500/20" : "bg-sky-200/80",
        iconClass: isDark
          ? "bg-sky-500/15 text-sky-300"
          : "bg-gradient-to-br from-sky-500 to-blue-500 text-white shadow-lg shadow-sky-500/20",
        eyebrowClass: isDark
          ? "border-sky-500/25 bg-sky-500/10 text-sky-200"
          : "border-sky-200 bg-sky-50 text-sky-700",
        accentTextClass: isDark ? "text-sky-300" : "text-sky-700",
      };
    case "appointment":
      return {
        label: "Appointment",
        Icon: CalendarClock,
        surfaceClass: isDark
          ? "from-violet-950/50 via-slate-900 to-slate-900"
          : "from-violet-50 via-white to-fuchsia-50",
        glowClass: isDark ? "bg-violet-500/20" : "bg-violet-200/80",
        iconClass: isDark
          ? "bg-violet-500/15 text-violet-300"
          : "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20",
        eyebrowClass: isDark
          ? "border-violet-500/25 bg-violet-500/10 text-violet-200"
          : "border-violet-200 bg-violet-50 text-violet-700",
        accentTextClass: isDark ? "text-violet-300" : "text-violet-700",
      };
    default:
      return {
        label: "Request",
        Icon: Search,
        surfaceClass: isDark
          ? "from-slate-900 via-slate-900 to-slate-900"
          : "from-slate-50 via-white to-slate-100",
        glowClass: isDark ? "bg-slate-500/20" : "bg-slate-200/80",
        iconClass: isDark
          ? "bg-slate-500/15 text-slate-300"
          : "bg-gradient-to-br from-slate-500 to-slate-700 text-white shadow-lg shadow-slate-500/20",
        eyebrowClass: isDark
          ? "border-slate-500/25 bg-slate-500/10 text-slate-200"
          : "border-slate-200 bg-slate-50 text-slate-700",
        accentTextClass: isDark ? "text-slate-300" : "text-slate-700",
      };
  }
};

const getRequestInsight = (item) => {
  if (item.kind === "document") {
    return "Save the receipt, verify the QR anytime, and use the live tracker for the latest updates.";
  }

  if (item.kind === "appointment") {
    return "Review the current hearing schedule here before making any reschedule or cancellation changes.";
  }

  if (item.kind === "incident") {
    return "Keep this reference ready when checking follow-up actions or reviewing progress in case management.";
  }

  return "Use your reference number when coordinating follow-ups and checking the latest case handling updates.";
};

const RequestDetailCard = ({
  label,
  value,
  icon: Icon,
  iconClass,
  isDark,
  t,
}) => (
  <div
    className={`rounded-[24px] border px-4 py-4 shadow-[0_18px_35px_-30px_rgba(15,23,42,0.38)] ${
      isDark
        ? `border-slate-700/80 bg-slate-900/70`
        : "border-white/80 bg-white/90 backdrop-blur"
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p
          className={`text-[10px] font-kumbh font-semibold uppercase tracking-[0.18em] ${t.subtleText}`}
        >
          {label}
        </p>
        <p
          className={`mt-3 break-words text-sm font-spartan font-semibold leading-6 ${t.cardText}`}
        >
          {value}
        </p>
      </div>
      {Icon && (
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      )}
    </div>
  </div>
);

const RequestActionButton = ({
  label,
  icon: Icon,
  onClick,
  variant = "secondary",
  disabled = false,
  t,
}) => {
  const variantClassMap = {
    primary:
      "border-transparent bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:from-teal-500 hover:to-emerald-500",
    secondary: `${t.cardBorder} ${t.cardBg} ${t.cardText} hover:-translate-y-0.5 hover:shadow-md`,
    warning:
      "border-amber-200 bg-amber-50 text-amber-700 hover:-translate-y-0.5 hover:shadow-md",
    danger:
      "border-rose-200 bg-rose-50 text-rose-700 hover:-translate-y-0.5 hover:shadow-md",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group inline-flex w-full items-center justify-between rounded-[22px] border px-4 py-3.5 text-left text-sm font-kumbh font-semibold transition-all duration-200 ${
        disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 shadow-none"
          : variantClassMap[variant]
      }`}
    >
      <span className="inline-flex min-w-0 items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
            disabled
              ? "bg-slate-200 text-slate-400"
              : variant === "primary"
                ? "bg-white/15 text-white"
                : variant === "warning"
                  ? "bg-amber-100 text-amber-600"
                  : variant === "danger"
                    ? "bg-rose-100 text-rose-600"
                    : "bg-slate-100 text-slate-600"
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="truncate">{label}</span>
      </span>
      <ArrowUpRight
        className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
          disabled
            ? ""
            : "group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        }`}
      />
    </button>
  );
};

const MyRequestsPage = () => {
  const navigate = useNavigate();
  const { eventVersion } = useUserRealTime();
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("appTheme") || "modern",
  );
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [documents, setDocuments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [availabilityByDate, setAvailabilityByDate] = useState({});
  const [savingAction, setSavingAction] = useState(false);

  const t = themeTokens[currentTheme] || themeTokens.modern;
  const isDark = currentTheme === "dark";
  const timeSlots = getTimeSlots();

  const addToast = useCallback((toast) => {
    setToasts((previous) => [
      ...previous,
      { id: Date.now() + Math.random(), ...toast },
    ]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    const handleThemeChange = (event) => {
      setCurrentTheme(event.detail);
    };

    window.addEventListener("themeChange", handleThemeChange);
    return () => window.removeEventListener("themeChange", handleThemeChange);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [complaintPayload, incidentPayload] = await Promise.all([
        getMyComplaints(),
        incidentService.getMyIncidents(),
      ]);

      const complaintList = Array.isArray(complaintPayload)
        ? complaintPayload
        : complaintPayload?.data || [];
      const incidentList = Array.isArray(incidentPayload)
        ? incidentPayload
        : incidentPayload?.data || [];
      const documentList = listStoredRequestRecords().filter(
        (record) => record.category === "document",
      );

      const appointmentGroups = await Promise.all(
        complaintList.map(async (complaint) => {
          try {
            const response = await getComplaintAppointments(complaint.id);
            const appointmentsList = Array.isArray(response)
              ? response
              : response?.data || [];

            return appointmentsList.map((appointment) => ({
              ...appointment,
              complaint_id: appointment.complaint_id || complaint.id,
              complaint_type: complaint.type || "",
              complainant_name:
                appointment.complainant_name ||
                complaint.complainant_name ||
                "",
              complainant_contact:
                appointment.complainant_contact ||
                complaint.complainant_contact ||
                "",
              respondent_name:
                appointment.respondent_name || complaint.respondent_name || "",
              respondent_address:
                appointment.respondent_address ||
                complaint.respondent_address ||
                "",
              description:
                appointment.description ||
                complaint.description ||
                complaint.desired_resolution ||
                "",
            }));
          } catch (fetchError) {
            console.error(
              `Failed to fetch appointments for complaint ${complaint.id}:`,
              fetchError,
            );
            return [];
          }
        }),
      );

      setDocuments(documentList);
      setComplaints(complaintList);
      setIncidents(incidentList);
      setAppointments(appointmentGroups.flat());
    } catch (fetchError) {
      console.error("Failed to load request center data:", fetchError);
      setError(fetchError.message || "Unable to load your request history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, eventVersion]);

  useEffect(() => {
    if (!rescheduleDate || !rescheduleTarget) return;

    let active = true;

    const fetchAvailability = async () => {
      try {
        const days = await getAvailability(rescheduleDate, rescheduleDate);
        if (!active) return;

        const map = {};
        (Array.isArray(days) ? days : []).forEach((day) => {
          map[day.date] = day;
        });
        setAvailabilityByDate((previous) => ({ ...previous, ...map }));
      } catch (availabilityError) {
        if (!active) return;
        console.error(
          "Failed to fetch appointment availability:",
          availabilityError,
        );
      }
    };

    fetchAvailability();

    return () => {
      active = false;
    };
  }, [rescheduleDate, rescheduleTarget]);

  const allItems = useMemo(() => {
    const documentItems = documents.map((record) => ({
      id: record.id,
      kind: "document",
      title: record.title || "Document Request",
      description: record.purpose || record.details?.specificPurpose || "",
      reference: record.reference,
      status: formatStatusLabel(record.status, "Pending"),
      submittedAt: record.submittedAt,
      location: record.address || "",
      trackPath: record.trackPath,
      verificationUrl: record.verificationUrl,
      raw: record,
    }));

    const complaintItems = complaints.map((complaint) => ({
      id: `complaint:${complaint.id}`,
      kind: "complaint",
      title: `Complaint: ${complaint.type || "General Concern"}`,
      description:
        complaint.description ||
        complaint.desired_resolution ||
        "No description provided.",
      reference: createReference("CMP", complaint.id),
      status: formatStatusLabel(complaint.status, "Ongoing"),
      submittedAt:
        complaint.created_at ||
        complaint.incident_date ||
        new Date().toISOString(),
      location: complaint.location || complaint.respondent_address || "",
      raw: complaint,
    }));

    const incidentItems = incidents.map((incident) => ({
      id: `incident:${incident.id}`,
      kind: "incident",
      title: `Incident Report: ${incident.type || "Incident"}`,
      description:
        incident.description ||
        incident.additional_notes ||
        "No description provided.",
      reference: createReference("INC", incident.id),
      status: formatStatusLabel(incident.status, "Pending"),
      submittedAt: incident.created_at || new Date().toISOString(),
      location: incident.location || "",
      raw: incident,
    }));

    const appointmentItems = appointments.map((appointment) => ({
      id: `appointment:${appointment.id}`,
      kind: "appointment",
      title:
        appointment.title ||
        `Appointment #${appointment.id || appointment.complaint_id || ""}`.trim(),
      description:
        appointment.description ||
        appointment.respondent_name ||
        "Follow-up hearing appointment.",
      reference: createReference("APT", appointment.id),
      status: formatStatusLabel(appointment.status, "Scheduled"),
      submittedAt:
        appointment.created_at ||
        appointment.scheduled_at ||
        new Date().toISOString(),
      location: appointment.respondent_address || "",
      complaintId: appointment.complaint_id,
      scheduledAt: appointment.scheduled_at || "",
      raw: appointment,
    }));

    return [
      ...documentItems,
      ...complaintItems,
      ...incidentItems,
      ...appointmentItems,
    ].sort(
      (left, right) =>
        new Date(right.submittedAt || 0).getTime() -
        new Date(left.submittedAt || 0).getTime(),
    );
  }, [appointments, complaints, documents, incidents]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return allItems.filter((item) => {
      if (filter !== "all" && item.kind !== filter) return false;

      if (!normalizedSearch) return true;

      return [
        item.title,
        item.reference,
        item.status,
        item.description,
        item.location,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(normalizedSearch),
        );
    });
  }, [allItems, filter, search]);

  const summary = useMemo(
    () => ({
      total: allItems.length,
      documents: allItems.filter((item) => item.kind === "document").length,
      activeCases: allItems.filter(
        (item) =>
          (item.kind === "complaint" || item.kind === "incident") &&
          !String(item.status).toLowerCase().includes("resolved") &&
          !String(item.status).toLowerCase().includes("completed"),
      ).length,
      appointments: allItems.filter((item) => item.kind === "appointment")
        .length,
    }),
    [allItems],
  );

  const slotOptions = useMemo(() => {
    const dayAvailability = availabilityByDate[rescheduleDate];
    const slotMap = new Map(
      (dayAvailability?.slots || []).map((slot) => [
        String(slot.time || "").slice(0, 5),
        Boolean(slot.available),
      ]),
    );

    return timeSlots.map((slot) => ({
      ...slot,
      available: slotMap.has(slot.value) ? slotMap.get(slot.value) : true,
    }));
  }, [availabilityByDate, rescheduleDate, timeSlots]);

  const openCaseManagement = useCallback(
    (item) => {
      navigate("/incident-complaint/case-management", {
        state: {
          selectedReference: item.reference,
          selectedKind: item.kind,
          selectedId: item.raw?.id || "",
        },
      });
    },
    [navigate],
  );

  const openDocumentTracker = useCallback(
    (item) => {
      const trackPath =
        item.trackPath || item.raw?.trackPath || "/sub-system-2";
      navigate(trackPath, {
        state: {
          referenceNumber: item.reference,
          requestRecord: item.raw,
        },
      });
    },
    [navigate],
  );

  const openDocumentVerification = useCallback(
    (item) => {
      const params = new URLSearchParams({
        reference: item.reference,
        document: item.raw?.documentType || item.title,
      });
      navigate(`/sub-system-2/verify-document?${params.toString()}`);
    },
    [navigate],
  );

  const handleDownloadReceipt = useCallback(
    (item) => {
      try {
        if (item.kind === "appointment") {
          downloadRequestReceipt(buildReceiptPayloadFromAppointment(item.raw));
        } else if (item.kind === "complaint") {
          downloadRequestReceipt(buildComplaintReceipt(item.raw));
        } else if (item.kind === "incident") {
          downloadRequestReceipt(buildIncidentReceipt(item.raw));
        } else {
          downloadRequestReceipt(buildReceiptPayloadFromRecord(item.raw));
        }

        addToast({
          type: "success",
          title: "Receipt downloaded",
          message: "Your acknowledgment receipt has been generated.",
          duration: 3000,
        });
      } catch (receiptError) {
        console.error("Failed to generate receipt:", receiptError);
        addToast({
          type: "error",
          title: "Receipt unavailable",
          message: "We could not generate the receipt right now.",
          duration: 4000,
        });
      }
    },
    [addToast],
  );

  const openRescheduleModal = useCallback((appointmentItem) => {
    const parsed = parseScheduledAt(appointmentItem.scheduledAt);
    setRescheduleTarget(appointmentItem);
    setRescheduleDate(parsed.date || "");
    setRescheduleTime(parsed.time || "");
  }, []);

  const handleConfirmCancel = useCallback(async () => {
    if (!cancelTarget?.complaintId || !cancelTarget?.raw?.id) return;

    setSavingAction(true);
    try {
      await cancelAppointment(cancelTarget.complaintId, cancelTarget.raw.id);
      queueCommunicationEvent({
        category: "appointments",
        title: "Appointment cancelled",
        message: `${cancelTarget.title} was cancelled from your request center.`,
        metadata: {
          appointmentId: cancelTarget.raw.id,
          complaintId: cancelTarget.complaintId,
        },
      });
      addToast({
        type: "success",
        title: "Appointment cancelled",
        message: "The appointment has been cancelled successfully.",
        duration: 3500,
      });
      setCancelTarget(null);
      await loadData();
    } catch (actionError) {
      console.error("Failed to cancel appointment:", actionError);
      addToast({
        type: "error",
        title: "Cancellation failed",
        message: actionError.message || "Unable to cancel the appointment.",
        duration: 4500,
      });
    } finally {
      setSavingAction(false);
    }
  }, [addToast, cancelTarget, loadData]);

  const handleConfirmReschedule = useCallback(async () => {
    if (!rescheduleTarget?.complaintId || !rescheduleTarget?.raw?.id) return;

    if (!rescheduleDate || !rescheduleTime) {
      addToast({
        type: "error",
        title: "Schedule required",
        message: "Choose a new appointment date and time first.",
        duration: 4000,
      });
      return;
    }

    if (isWeekend(rescheduleDate)) {
      addToast({
        type: "error",
        title: "Weekday only",
        message: "Appointments can only be rescheduled from Monday to Friday.",
        duration: 4000,
      });
      return;
    }

    setSavingAction(true);
    try {
      const scheduledAt = `${rescheduleDate}T${rescheduleTime}:00`;
      await rescheduleAppointment(
        rescheduleTarget.complaintId,
        rescheduleTarget.raw,
        scheduledAt,
      );

      queueCommunicationEvent({
        category: "appointments",
        title: "Appointment rescheduled",
        message: `${rescheduleTarget.title} was moved to ${formatDateTime(scheduledAt)}.`,
        metadata: {
          appointmentId: rescheduleTarget.raw.id,
          complaintId: rescheduleTarget.complaintId,
          scheduledAt,
        },
      });
      addToast({
        type: "success",
        title: "Appointment updated",
        message: "Your appointment schedule was updated successfully.",
        duration: 3500,
      });
      setRescheduleTarget(null);
      setRescheduleDate("");
      setRescheduleTime("");
      await loadData();
    } catch (actionError) {
      console.error("Failed to reschedule appointment:", actionError);
      addToast({
        type: "error",
        title: "Reschedule failed",
        message: actionError.message || "Unable to reschedule the appointment.",
        duration: 4500,
      });
    } finally {
      setSavingAction(false);
    }
  }, [addToast, loadData, rescheduleDate, rescheduleTarget, rescheduleTime]);

  return (
    <>
      <div className={`${t.pageBg} min-h-full p-4 sm:p-5 lg:p-6`}>
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="w-full text-left">
            <h1
              className={`text-left text-3xl font-bold font-spartan leading-tight sm:text-4xl ${t.pageTitle}`}
            >
              My Requests
            </h1>
            <p
              className={`mt-2 text-left text-sm font-kumbh leading-6 sm:text-base ${t.subtleText}`}
            >
              Track your requests and follow their latest status updates in one
              place.
            </p>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total Requests"
              value={summary.total}
              accentClass="bg-sky-50 text-sky-600"
              icon={Search}
              t={t}
            />
            <SummaryCard
              label="Documents"
              value={summary.documents}
              accentClass="bg-emerald-50 text-emerald-600"
              icon={FileText}
              t={t}
            />
            <SummaryCard
              label="Active Cases"
              value={summary.activeCases}
              accentClass="bg-amber-50 text-amber-600"
              icon={AlertTriangle}
              t={t}
            />
            <SummaryCard
              label="Appointments"
              value={summary.appointments}
              accentClass="bg-violet-50 text-violet-600"
              icon={CalendarClock}
              t={t}
            />
          </section>

          <section
            className={`rounded-[28px] border ${t.cardBorder} ${t.cardBg} p-5 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.35)]`}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {FILTERS.map((filterOption) => {
                  const isActive = filter === filterOption.key;
                  return (
                    <button
                      key={filterOption.key}
                      type="button"
                      onClick={() => setFilter(filterOption.key)}
                      className={`rounded-full px-4 py-2 text-sm font-kumbh font-medium transition ${
                        isActive
                          ? "bg-teal-600 text-white shadow-sm"
                          : `${t.inputBg} ${t.cardText} border ${t.cardBorder}`
                      }`}
                    >
                      {filterOption.label}
                    </button>
                  );
                })}
              </div>

              <div
                className={`flex h-12 w-full items-center gap-3 rounded-2xl border ${t.cardBorder} ${t.inputBg} px-4 lg:max-w-md`}
              >
                <Search className={`h-4 w-4 ${t.subtleText}`} />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by reference, title, status, or location"
                  className={`w-full bg-transparent text-sm font-kumbh outline-none ${t.inputText}`}
                />
              </div>
            </div>
          </section>

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-kumbh text-rose-700">
              {error}
            </div>
          )}

          {loading ? (
            <section
              className={`rounded-[28px] border ${t.cardBorder} ${t.cardBg} p-10 text-center shadow-sm`}
            >
              <p className={`text-lg font-kumbh font-medium ${t.cardText}`}>
                Loading your request center...
              </p>
              <p
                className={`mt-2 text-sm font-kumbh font-normal ${t.subtleText}`}
              >
                We are gathering your latest document, case, and appointment
                records.
              </p>
            </section>
          ) : filteredItems.length === 0 ? (
            <section
              className={`rounded-[28px] border ${t.cardBorder} ${t.cardBg} p-10 text-center shadow-sm`}
            >
              <p className={`text-lg font-kumbh font-medium ${t.cardText}`}>
                No matching requests yet
              </p>
              <p
                className={`mt-2 text-sm font-kumbh font-normal ${t.subtleText}`}
              >
                Try another filter or start a new request from the resident
                services pages.
              </p>
            </section>
          ) : (
            <section className="grid gap-4">
              {filteredItems.map((item) => {
                const statusClass = getStatusBadgeClass(item.kind, item.status);
                const categoryMeta = getCategoryMeta(item.kind, isDark);
                const canManageAppointment =
                  item.kind === "appointment" &&
                  !["cancelled", "completed", "no-show", "no show"].includes(
                    String(item.status || "").toLowerCase(),
                  );
                const detailItems = [
                  {
                    label: "Reference",
                    value: item.reference,
                    icon: FileText,
                  },
                  {
                    label: "Submitted",
                    value: formatDateTime(item.submittedAt),
                    icon: Clock3,
                  },
                  {
                    label:
                      item.kind === "appointment" ? "Schedule" : "Location",
                    value:
                      item.kind === "appointment"
                        ? formatDateTime(item.scheduledAt || item.submittedAt)
                        : item.location || "Not provided",
                    icon: item.kind === "appointment" ? CalendarClock : MapPin,
                  },
                  {
                    label: "Current Status",
                    value: item.status,
                    icon: ShieldCheck,
                  },
                ];

                return (
                  <article
                    key={item.id}
                    className={`relative overflow-hidden rounded-[32px] border ${t.cardBorder} ${t.cardBg} shadow-[0_24px_55px_-38px_rgba(15,23,42,0.35)]`}
                  >
                    <div
                      className={`pointer-events-none absolute -right-10 top-8 h-40 w-40 rounded-full blur-3xl ${categoryMeta.glowClass}`}
                    />

                    <div className="grid xl:grid-cols-[minmax(0,1.55fr)_300px]">
                      <div
                        className={`relative bg-gradient-to-br ${categoryMeta.surfaceClass} p-5 sm:p-6`}
                      >
                        <div className="relative">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-kumbh font-semibold uppercase tracking-[0.16em] ${statusClass}`}
                              >
                                {item.status}
                              </span>
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-kumbh font-semibold uppercase tracking-[0.16em] ${categoryMeta.eyebrowClass}`}
                              >
                                {categoryMeta.label}
                              </span>
                            </div>

                            <span
                              className={`text-[11px] font-kumbh font-medium ${t.subtleText}`}
                            >
                              {formatDateTime(item.submittedAt)}
                            </span>
                          </div>

                          <div className="mt-5 flex items-start gap-4">
                            <div
                              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] ${categoryMeta.iconClass}`}
                            >
                              <categoryMeta.Icon className="h-7 w-7" />
                            </div>

                            <div className="min-w-0">
                              <p
                                className={`text-[11px] font-kumbh font-semibold uppercase tracking-[0.18em] ${categoryMeta.accentTextClass}`}
                              >
                                Request Overview
                              </p>
                              <h2
                                className={`mt-2 text-2xl font-bold font-spartan leading-tight ${t.cardText}`}
                              >
                                {item.title}
                              </h2>
                              <p
                                className={`mt-3 max-w-3xl text-sm font-kumbh leading-6 ${t.subtleText}`}
                              >
                                {item.description}
                              </p>
                            </div>
                          </div>

                          <div
                            className={`mt-5 rounded-[26px] border p-4 ${
                              isDark
                                ? "border-slate-700/80 bg-slate-900/70"
                                : "border-white/80 bg-white/80 backdrop-blur"
                            }`}
                          >
                            <p
                              className={`text-[10px] font-kumbh font-semibold uppercase tracking-[0.18em] ${categoryMeta.accentTextClass}`}
                            >
                              Smart Follow-Up
                            </p>
                            <p
                              className={`mt-2 text-sm font-kumbh leading-6 ${t.cardText}`}
                            >
                              {getRequestInsight(item)}
                            </p>
                          </div>

                          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            {detailItems.map((detail) => (
                              <RequestDetailCard
                                key={`${item.id}-${detail.label}`}
                                label={detail.label}
                                value={detail.value}
                                icon={detail.icon}
                                iconClass={categoryMeta.eyebrowClass}
                                isDark={isDark}
                                t={t}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`border-t p-5 sm:p-6 xl:border-l xl:border-t-0 ${t.cardBorder} ${
                          isDark ? "bg-slate-900/60" : "bg-slate-50/85"
                        }`}
                      >
                        <div className="space-y-4">
                          <div>
                            <p
                              className={`text-[11px] font-kumbh font-semibold uppercase tracking-[0.18em] ${t.subtleText}`}
                            >
                              Quick Actions
                            </p>
                            <h3
                              className={`mt-2 text-xl font-bold font-spartan ${t.cardText}`}
                            >
                              Manage this request
                            </h3>
                            <p
                              className={`mt-2 text-sm font-kumbh leading-6 ${t.subtleText}`}
                            >
                              Open the next step you need without searching
                              through other pages.
                            </p>
                          </div>

                          <div className="space-y-3">
                            <RequestActionButton
                              label="Download Receipt"
                              icon={Download}
                              onClick={() => handleDownloadReceipt(item)}
                              variant="primary"
                              t={t}
                            />

                            {item.kind === "document" && (
                              <>
                                <RequestActionButton
                                  label="Open Tracker"
                                  icon={Search}
                                  onClick={() => openDocumentTracker(item)}
                                  variant="secondary"
                                  t={t}
                                />
                                <RequestActionButton
                                  label="Verify QR"
                                  icon={ScanSearch}
                                  onClick={() => openDocumentVerification(item)}
                                  variant="secondary"
                                  t={t}
                                />
                              </>
                            )}

                            {(item.kind === "complaint" ||
                              item.kind === "incident") && (
                              <RequestActionButton
                                label="Open Case Management"
                                icon={ArrowUpRight}
                                onClick={() => openCaseManagement(item)}
                                variant="secondary"
                                t={t}
                              />
                            )}

                            {item.kind === "appointment" && (
                              <>
                                <RequestActionButton
                                  label="Open Case Management"
                                  icon={ArrowUpRight}
                                  onClick={() => openCaseManagement(item)}
                                  variant="secondary"
                                  t={t}
                                />
                                <RequestActionButton
                                  label="Reschedule"
                                  icon={CalendarClock}
                                  onClick={() => openRescheduleModal(item)}
                                  variant="warning"
                                  disabled={!canManageAppointment}
                                  t={t}
                                />
                                <RequestActionButton
                                  label="Cancel Appointment"
                                  icon={AlertTriangle}
                                  onClick={() => setCancelTarget(item)}
                                  variant="danger"
                                  disabled={!canManageAppointment}
                                  t={t}
                                />
                              </>
                            )}
                          </div>

                          <div
                            className={`rounded-[24px] border p-4 ${
                              isDark
                                ? "border-slate-700/80 bg-slate-950/60"
                                : "border-white/80 bg-white/80"
                            }`}
                          >
                            <p
                              className={`text-[10px] font-kumbh font-semibold uppercase tracking-[0.18em] ${t.subtleText}`}
                            >
                              Request Reference
                            </p>
                            <p
                              className={`mt-2 text-lg font-bold font-spartan ${t.cardText}`}
                            >
                              {item.reference}
                            </p>
                            <p
                              className={`mt-2 text-sm font-kumbh leading-6 ${t.subtleText}`}
                            >
                              Keep this number ready when you follow up with the
                              barangay office.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </div>
      </div>

      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div
            className={`w-full max-w-xl rounded-[28px] border ${t.cardBorder} ${t.cardBg} p-6 shadow-2xl`}
          >
            <p className="text-[11px] font-kumbh font-semibold uppercase tracking-[0.18em] text-amber-600">
              Appointment Update
            </p>
            <h2
              className={`mt-2 text-2xl font-bold font-spartan ${t.cardText}`}
            >
              Reschedule {rescheduleTarget.title}
            </h2>
            <p className={`mt-2 text-sm font-kumbh ${t.subtleText}`}>
              Pick a new weekday schedule for this hearing. Available slots
              update based on the current appointment queue.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span
                  className={`text-[11px] font-kumbh font-semibold uppercase tracking-[0.16em] ${t.subtleText}`}
                >
                  New Date
                </span>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={rescheduleDate}
                  onChange={(event) => setRescheduleDate(event.target.value)}
                  className={`h-12 w-full rounded-2xl border ${t.cardBorder} ${t.inputBg} ${t.inputText} px-4 outline-none`}
                />
              </label>

              <label className="space-y-2">
                <span
                  className={`text-[11px] font-kumbh font-semibold uppercase tracking-[0.16em] ${t.subtleText}`}
                >
                  New Time
                </span>
                <select
                  value={rescheduleTime}
                  onChange={(event) => setRescheduleTime(event.target.value)}
                  className={`h-12 w-full rounded-2xl border ${t.cardBorder} ${t.inputBg} ${t.inputText} px-4 outline-none`}
                >
                  <option value="">Choose a time slot</option>
                  {slotOptions.map((slot) => (
                    <option
                      key={slot.value}
                      value={slot.value}
                      disabled={
                        !slot.available && slot.value !== rescheduleTime
                      }
                    >
                      {slot.label}
                      {!slot.available && slot.value !== rescheduleTime
                        ? " (Unavailable)"
                        : ""}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {rescheduleDate && isWeekend(rescheduleDate) && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-kumbh text-amber-700">
                Weekend schedules are unavailable. Please choose a Monday to
                Friday date.
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setRescheduleTarget(null);
                  setRescheduleDate("");
                  setRescheduleTime("");
                }}
                className={`rounded-2xl border ${t.cardBorder} ${t.inputBg} ${t.cardText} px-5 py-3 text-sm font-kumbh font-semibold`}
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleConfirmReschedule}
                disabled={savingAction}
                className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-kumbh font-semibold text-white disabled:opacity-60"
              >
                {savingAction ? "Saving..." : "Confirm Reschedule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div
            className={`w-full max-w-lg rounded-[28px] border ${t.cardBorder} ${t.cardBg} p-6 shadow-2xl`}
          >
            <p className="text-[11px] font-kumbh font-semibold uppercase tracking-[0.18em] text-rose-600">
              Cancel Appointment
            </p>
            <h2
              className={`mt-2 text-2xl font-bold font-spartan ${t.cardText}`}
            >
              Cancel {cancelTarget.title}?
            </h2>
            <p className={`mt-3 text-sm font-kumbh ${t.subtleText}`}>
              This will mark the appointment as cancelled and keep the change in
              your request history for follow-up reference.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className={`rounded-2xl border ${t.cardBorder} ${t.inputBg} ${t.cardText} px-5 py-3 text-sm font-kumbh font-semibold`}
              >
                Keep Appointment
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={savingAction}
                className="rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 px-5 py-3 text-sm font-kumbh font-semibold text-white disabled:opacity-60"
              >
                {savingAction ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast
        toasts={toasts}
        onRemove={removeToast}
        currentTheme={currentTheme}
      />
    </>
  );
};

export default MyRequestsPage;
