import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileText,
  Search,
  X as XIcon,
  XCircle,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import Swal from "../../utils/swal";
import themeTokens from "../../Themetokens";
import { DOCUMENTS_API_BASE_URL } from "../../config/runtimeApi";
import DatePickerField from "../../components/shared/DatePickerField";
import RecordTimeline from "../../components/shared/RecordTimeline";
import {
  buildAuthHeaders,
  canProcessDocuments,
  canViewDocuments,
  handleUnauthorizedResponse,
} from "../../homepage/services/loginService";
import { downloadRecordsAsCsv } from "../../utils/exportRecords";

// ── Constants ────────────────────────────────────────────────
const STAT_COLOR = {
  amber: {
    icon: Clock3,
    iconBg: "bg-amber-50",
    iconText: "text-amber-600",
    panelBg: "bg-amber-50/80 border-amber-100",
    panelText: "text-amber-700",
  },
  green: {
    icon: CheckCircle2,
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
    panelBg: "bg-emerald-50/80 border-emerald-100",
    panelText: "text-emerald-700",
  },
  red: {
    icon: XCircle,
    iconBg: "bg-rose-50",
    iconText: "text-rose-600",
    panelBg: "bg-rose-50/80 border-rose-100",
    panelText: "text-rose-700",
  },
};

const statusTabs = ["All", "Pending", "Verified", "Rejected"];

const STATUS_TAB_CONFIG = {
  All: {
    activeLight: "border-slate-900 bg-slate-900 text-white shadow-[0_10px_25px_rgba(15,23,42,0.18)]",
    activeDark: "border-slate-100 bg-slate-100 text-slate-900",
    inactiveLight: "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
    inactiveDark: "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800",
    countActiveLight: "bg-white/15 text-white",
    countActiveDark: "bg-slate-800 text-slate-100",
    countInactiveLight: "bg-slate-100 text-slate-500",
    countInactiveDark: "bg-slate-800 text-slate-300",
  },
  Pending: {
    activeLight: "border-amber-200 bg-amber-50 text-amber-800 shadow-[0_10px_25px_rgba(245,158,11,0.18)]",
    activeDark: "border-amber-500/40 bg-amber-500/15 text-amber-200",
    inactiveLight: "border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50/40",
    inactiveDark: "border-slate-700 bg-slate-900 text-slate-300 hover:border-amber-500/30 hover:bg-amber-500/10",
    countActiveLight: "bg-amber-100 text-amber-700",
    countActiveDark: "bg-amber-500/20 text-amber-100",
    countInactiveLight: "bg-amber-50 text-amber-600",
    countInactiveDark: "bg-amber-500/15 text-amber-200",
  },
  Verified: {
    activeLight: "border-emerald-200 bg-emerald-50 text-emerald-800 shadow-[0_10px_25px_rgba(16,185,129,0.18)]",
    activeDark: "border-emerald-500/40 bg-emerald-500/15 text-emerald-200",
    inactiveLight: "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/40",
    inactiveDark: "border-slate-700 bg-slate-900 text-slate-300 hover:border-emerald-500/30 hover:bg-emerald-500/10",
    countActiveLight: "bg-emerald-100 text-emerald-700",
    countActiveDark: "bg-emerald-500/20 text-emerald-100",
    countInactiveLight: "bg-emerald-50 text-emerald-600",
    countInactiveDark: "bg-emerald-500/15 text-emerald-200",
  },
  Rejected: {
    activeLight: "border-rose-200 bg-rose-50 text-rose-800 shadow-[0_10px_25px_rgba(244,63,94,0.18)]",
    activeDark: "border-rose-500/40 bg-rose-500/15 text-rose-200",
    inactiveLight: "border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:bg-rose-50/40",
    inactiveDark: "border-slate-700 bg-slate-900 text-slate-300 hover:border-rose-500/30 hover:bg-rose-500/10",
    countActiveLight: "bg-rose-100 text-rose-700",
    countActiveDark: "bg-rose-500/20 text-rose-100",
    countInactiveLight: "bg-rose-50 text-rose-600",
    countInactiveDark: "bg-rose-500/15 text-rose-200",
  },
};

const ROWS_PER_PAGE = 6;

const buildDocumentsHeaders = (includeJson = false) =>
  buildAuthHeaders({ includeJson });

const parseJsonSafe = async (response) => {
  const data = await response.json().catch(() => null);
  return data && typeof data === "object" ? data : {};
};

const toDateOnly = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  if (raw.includes("T")) return raw.split("T")[0];

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatTimelineDate = (value) => {
  const parsed = value ? new Date(value) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) {
    return value || "Unknown time";
  }

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const buildDocumentTimeline = (record) => {
  if (!record) return [];

  const submittedAt =
    record.dateSubmitted ||
    record.created_at ||
    record.submitted_at;

  const items = [
    submittedAt
      ? {
          id: "submitted",
          title: "Application submitted",
          description: `${record.full_name || "Resident"} requested ${record.documentType || "a document"} for review.`,
          meta: formatTimelineDate(submittedAt),
          tone: "info",
        }
      : null,
  ];

  const status = String(record.status || "Pending").toLowerCase();

  if (status === "verified") {
    items.push({
      id: "verified",
      title: "Request verified",
      description:
        record.processed_by_name
          ? `Verified by ${record.processed_by_name}.`
          : "The request was approved and marked as verified.",
      meta: formatTimelineDate(record.verified_at || record.updated_at || submittedAt),
      tone: "success",
    });
  } else if (status === "rejected") {
    items.push({
      id: "rejected",
      title: "Request rejected",
      description:
        record.rejection_reason ||
        "The request was declined during document review.",
      meta: formatTimelineDate(record.rejected_at || record.updated_at || submittedAt),
      tone: "danger",
    });
  } else {
    items.push({
      id: "pending",
      title: "Pending review",
      description: "The request is waiting for admin validation.",
      meta: formatTimelineDate(record.updated_at || submittedAt),
      tone: "warning",
    });
  }

  if (record.updated_at && record.updated_at !== submittedAt) {
    items.push({
      id: "updated",
      title: "Last record update",
      description: "The application details were refreshed in the processing queue.",
      meta: formatTimelineDate(record.updated_at),
      tone: "neutral",
    });
  }

  return items.filter(Boolean);
};

// ── Sub-components ────────────────────────────────────────────────
const StatusBadge = ({ status, isDark = false }) => {
  const styleMap = {
    Pending: isDark
      ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
      : "border-amber-200 bg-amber-50 text-amber-700",
    Verified: isDark
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
      : "border-emerald-200 bg-emerald-50 text-emerald-700",
    Rejected: isDark
      ? "border-rose-500/30 bg-rose-500/10 text-rose-200"
      : "border-rose-200 bg-rose-50 text-rose-700",
  };
  const dotMap = {
    Pending: isDark ? "bg-amber-300" : "bg-amber-500",
    Verified: isDark ? "bg-emerald-300" : "bg-emerald-500",
    Rejected: isDark ? "bg-rose-300" : "bg-rose-500",
  };
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${styleMap[status] ?? (isDark ? "border-slate-700 bg-slate-800 text-slate-200" : "border-slate-200 bg-slate-100 text-slate-600")}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotMap[status] ?? (isDark ? "bg-slate-300" : "bg-slate-400")}`} />
      {status}
    </span>
  );
};

const IconActionButtons = ({
  isDark,
  referenceNumber,
  onPreview,
  onStatusUpdated,
  canProcess,
}) => {
  const updateStatus = async (action) => {
    if (!canProcess) return;
    const isVerifyAction = action === "verify";
    const confirmResult = await Swal.fire({
      icon: "question",
      title: `${isVerifyAction ? "Verify" : "Reject"} request?`,
      text: `Reference # ${referenceNumber}`,
      showCancelButton: true,
      confirmButtonText: isVerifyAction ? "Yes, verify" : "Yes, reject",
      cancelButtonText: "Cancel",
      confirmButtonColor: isVerifyAction ? "#16a34a" : "#dc2626",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (!confirmResult.isConfirmed) {
      return;
    }

    const url = `${DOCUMENTS_API_BASE_URL}/documents/${referenceNumber}/${action}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: buildDocumentsHeaders(),
      });
      const data = await parseJsonSafe(res);
      handleUnauthorizedResponse(res);
      if (!res.ok) throw new Error(data.message || "Failed to update status");

      const newStatus = action === "verify" ? "Verified" : "Rejected";
      onStatusUpdated(referenceNumber, newStatus);

      await Swal.fire({
        icon: "success",
        title: `Request ${newStatus.toLowerCase()}`,
        text: data.message || `The request has been ${newStatus.toLowerCase()} successfully.`,
        confirmButtonColor: isVerifyAction ? "#16a34a" : "#dc2626",
      });
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Update failed",
        text: err.message || "Failed to update status.",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  return (
    <div className="inline-flex items-center justify-center gap-2">
      {canProcess && (
        <button
          onClick={() => updateStatus("verify")}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
            isDark
              ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          }`}
          title="Verify"
        >
          <Check className="h-4 w-4" strokeWidth={2.3} />
        </button>
      )}

      <button
        onClick={onPreview}
        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
          isDark
            ? "border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700"
            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
        }`}
        title="Preview"
      >
        <Eye className="h-4 w-4" strokeWidth={2.2} />
      </button>

      {canProcess && (
        <button
          onClick={() => updateStatus("reject")}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
            isDark
              ? "border-rose-500/30 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25"
              : "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
          }`}
          title="Reject"
        >
          <XIcon className="h-4 w-4" strokeWidth={2.2} />
        </button>
      )}
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────
const DocumentsInquiryPage = () => {
  const location = useLocation();
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem("appTheme") || "modern");
  const [activeStatus, setActiveStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [summaryCounts, setSummaryCounts] = useState({ pending: 0, verified: 0, rejected: 0 });
  const [documentCardsData, setDocumentCardsData] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const t = themeTokens[currentTheme] || themeTokens.modern;
  const isDark = currentTheme === "dark";
  const userCanViewDocuments = useMemo(() => canViewDocuments(), []);
  const userCanProcessDocuments = useMemo(() => canProcessDocuments(), []);

  useEffect(() => {
    const handler = (e) => setCurrentTheme(e.detail);
    window.addEventListener("themeChange", handler);
    return () => window.removeEventListener("themeChange", handler);
  }, []);

  useEffect(() => {
    if (!userCanViewDocuments) {
      setIsLoading(false);
      setPageError("");
      return undefined;
    }

    const controller = new AbortController();

    const loadDocuments = async () => {
      setIsLoading(true);
      setPageError("");

      try {
        const [countsRes, docsRes] = await Promise.all([
          fetch(`${DOCUMENTS_API_BASE_URL}/document-status/counts`, {
            headers: buildDocumentsHeaders(),
            signal: controller.signal,
          }),
          fetch(`${DOCUMENTS_API_BASE_URL}/documents`, {
            headers: buildDocumentsHeaders(),
            signal: controller.signal,
          }),
        ]);

        const [countsData, docsData] = await Promise.all([
          parseJsonSafe(countsRes),
          parseJsonSafe(docsRes),
        ]);

        handleUnauthorizedResponse(countsRes);
        handleUnauthorizedResponse(docsRes);

        if (!countsRes.ok || !docsRes.ok) {
          const failedResponse = !countsRes.ok ? countsRes : docsRes;
          const failedData = !countsRes.ok ? countsData : docsData;

          throw new Error(
            failedData.message ||
            (failedResponse.status === 401 || failedResponse.status === 403
              ? "Your session is not authorized to view issuance applications. Please sign in again as an admin."
              : "Failed to load issuance applications."),
          );
        }

        setSummaryCounts({
          pending: countsData.pending ?? 0,
          verified: countsData.verified ?? 0,
          rejected: countsData.rejected ?? 0,
        });
        setDocumentCardsData(
          Array.isArray(docsData)
            ? docsData
            : Array.isArray(docsData?.data)
              ? docsData.data
              : [],
        );
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        setSummaryCounts({ pending: 0, verified: 0, rejected: 0 });
        setDocumentCardsData([]);
        setPageError(error.message || "Failed to load issuance applications.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadDocuments();

    return () => controller.abort();
  }, [reloadToken, userCanViewDocuments]);

  const summaryCards = [
    { key: "pending", title: "Pending Verification", value: summaryCounts.pending, subtitle: "Awaiting admin review", color: "amber" },
    { key: "verified", title: "Verified", value: summaryCounts.verified, subtitle: "Successfully processed", color: "green" },
    { key: "rejected", title: "Rejected", value: summaryCounts.rejected, subtitle: "Declined or invalid", color: "red" },
  ];

  const statusCounts = useMemo(() => ({
    All: documentCardsData.length,
    Pending: summaryCounts.pending,
    Verified: summaryCounts.verified,
    Rejected: summaryCounts.rejected,
  }), [documentCardsData.length, summaryCounts.pending, summaryCounts.verified, summaryCounts.rejected]);

  const sectionCardClass = `${t.cardBg} border ${t.cardBorder} rounded-[28px] shadow-[0_16px_40px_rgba(15,23,42,0.08)]`;
  const softShellClass = isDark
    ? `${sectionCardClass} bg-slate-950/70`
    : `${sectionCardClass} bg-white/90`;
  const inputClass = `w-full rounded-[20px] border px-4 py-3.5 text-sm transition-all focus:outline-none focus:ring-4 ${
    isDark
      ? "border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus:border-slate-600 focus:ring-slate-800/80"
      : "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-blue-200 focus:ring-blue-100"
  }`;
  const tableHeaderClass = isDark
    ? "bg-slate-950/80 text-slate-300"
    : "bg-slate-50/90 text-slate-500";
  const rowHoverClass = isDark ? "hover:bg-slate-900/90" : "hover:bg-slate-50/90";

  // Filtered + paginated
  const filteredCards = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return documentCardsData.filter((card) => {
      const submittedDate = toDateOnly(card.dateSubmitted || card.created_at);
      const matchesStatus =
        activeStatus === "All" || card.status === activeStatus;
      const matchesSearch =
        query === "" ||
        card.full_name.toLowerCase().includes(query) ||
        card.documentType.toLowerCase().includes(query) ||
        card.reference_number.toLowerCase().includes(query);
      const matchesStart = !startDate || (submittedDate && submittedDate >= startDate);
      const matchesEnd = !endDate || (submittedDate && submittedDate <= endDate);
      return matchesStatus && matchesSearch && matchesStart && matchesEnd;
    });
  }, [activeStatus, searchTerm, documentCardsData, startDate, endDate]);

  const totalPages = Math.ceil(filteredCards.length / ROWS_PER_PAGE);
  const paginatedCards = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredCards.slice(start, start + ROWS_PER_PAGE);
  }, [filteredCards, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeStatus, searchTerm, startDate, endDate]);

  useEffect(() => {
    if (currentPage > Math.max(totalPages, 1)) {
      setCurrentPage(Math.max(totalPages, 1));
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    const { openReferenceNumber, searchQuery: incomingSearchQuery } = location.state || {};
    if (!openReferenceNumber || isLoading) return;

    const matchedDocument = documentCardsData.find(
      (documentRecord) =>
        String(documentRecord.reference_number) === String(openReferenceNumber),
    );

    if (!matchedDocument) return;

    setActiveStatus("All");
    setCurrentPage(1);
    setSearchTerm(incomingSearchQuery || matchedDocument.reference_number || "");
    setPreviewData(matchedDocument);
    setShowPreview(true);

    window.history.replaceState({}, "");
  }, [documentCardsData, isLoading, location.state]);

  const handleStatusUpdated = (referenceNumber, newStatus) => {
    const currentDocument = documentCardsData.find(
      (document) => document.reference_number === referenceNumber,
    );
    const previousStatus = currentDocument?.status?.toLowerCase();
    const nextStatus = newStatus?.toLowerCase();

    setDocumentCardsData((prev) => prev.map((document) => (
      document.reference_number === referenceNumber
        ? { ...document, status: newStatus }
        : document
    )));

    setPreviewData((prev) => (
      prev?.reference_number === referenceNumber
        ? { ...prev, status: newStatus }
        : prev
    ));

    if (
      previousStatus &&
      nextStatus &&
      previousStatus !== nextStatus
    ) {
      setSummaryCounts((prev) => ({
        ...prev,
        [previousStatus]: Math.max(0, (prev[previousStatus] ?? 0) - 1),
        [nextStatus]: (prev[nextStatus] ?? 0) + 1,
      }));
    }
  };

  const handleExportCsv = () => {
    downloadRecordsAsCsv({
      filename: "issuance-applications.csv",
      columns: [
        { header: "Reference Number", key: "reference_number" },
        { header: "Full Name", key: "full_name" },
        { header: "Document Type", key: "documentType" },
        { header: "Contact", key: "contact_number" },
        { header: "Submitted", value: (row) => toDateOnly(row.dateSubmitted || row.created_at) },
        { header: "Status", key: "status" },
      ],
      rows: filteredCards,
    });
  };

  if (!userCanViewDocuments) {
    return (
      <div className={`min-h-full ${t.pageBg} pb-10`}>
        <div className="w-full px-4 py-6 space-y-6">
          <div className="flex items-start gap-4 px-1">
            <div className={`flex h-14 w-14 items-center justify-center rounded-[22px] ${
              isDark ? "bg-slate-800 text-slate-100" : "bg-slate-100 text-slate-700"
            }`}>
              <FileText className="h-7 w-7" strokeWidth={2.1} />
            </div>
            <div>
              <h1 className={`font-spartan text-[2rem] font-bold tracking-tight ${t.cardText}`}>
                Issuance Applications
              </h1>
              <p className={`mt-2 max-w-2xl text-sm leading-6 ${t.subtleText}`}>
                This workspace is reserved for authorized back-office roles that process submitted issuance requests.
              </p>
            </div>
          </div>

          <div className={`${sectionCardClass} p-6`}>
            <h2 className={`text-lg font-semibold ${t.cardText}`}>Admin access required</h2>
            <p className={`mt-2 text-sm ${t.subtleText}`}>
              This page is only available to authorized back-office roles.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-full ${t.pageBg} pb-10`}>
      <div className="w-full px-4 py-6 space-y-6">
        <div className="flex items-start gap-4 px-1">
          <div className={`flex h-14 w-14 items-center justify-center rounded-[22px] ${
            isDark ? "bg-slate-800 text-slate-100" : "bg-slate-100 text-slate-700"
          }`}>
            <FileText className="h-7 w-7" strokeWidth={2.1} />
          </div>
          <div className="space-y-2">
            <h1 className={`font-spartan text-[2rem] sm:text-[2.3rem] font-bold tracking-tight ${t.cardText}`}>
              Issuance Applications
            </h1>
          </div>
        </div>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {summaryCards.map((card) => {
            const col = STAT_COLOR[card.color];
            const Icon = col.icon;
            return (
              <article
                key={card.key}
                className={`${sectionCardClass} p-5 sm:p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_35px_rgba(15,23,42,0.12)]`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className={`text-[13px] font-semibold ${t.subtleText}`}>
                      {card.title}
                    </p>
                    <p className={`font-spartan text-[2.15rem] font-bold leading-none ${t.cardText}`}>
                      {card.value.toLocaleString()}
                    </p>
                  </div>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-[18px] ${col.iconBg}`}>
                    <Icon className={`h-5 w-5 ${col.iconText}`} strokeWidth={2.1} />
                  </div>
                </div>
                <div className={`mt-5 rounded-[18px] border px-4 py-3 ${col.panelBg}`}>
                  <p className={`text-[13px] font-medium ${col.panelText}`}>
                    {card.subtitle}
                  </p>
                </div>
              </article>
            );
          })}
        </section>

        <section className={`${softShellClass} p-4 sm:p-5`}>
          <div className="flex flex-wrap gap-2">
            {statusTabs.map((tab) => {
              const config = STATUS_TAB_CONFIG[tab];
              const isActive = activeStatus === tab;
              const tabClass = isActive
                ? (isDark ? config.activeDark : config.activeLight)
                : (isDark ? config.inactiveDark : config.inactiveLight);
              const countClass = isActive
                ? (isDark ? config.countActiveDark : config.countActiveLight)
                : (isDark ? config.countInactiveDark : config.countInactiveLight);
              return (
                <button
                  key={tab}
                  onClick={() => setActiveStatus(tab)}
                  className={`inline-flex items-center gap-2 rounded-[18px] border px-4 py-3 text-sm font-semibold transition-all ${tabClass}`}
                >
                  <span>{tab}</span>
                  <span className={`inline-flex min-w-[28px] items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-bold ${countClass}`}>
                    {statusCounts[tab]}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className={`${softShellClass} overflow-hidden`}>
          <div className="space-y-4 p-5 sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-end">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleExportCsv}
                  className={`inline-flex items-center gap-2 rounded-[18px] px-4 py-3 text-sm font-semibold transition-all ${
                    isDark
                      ? "bg-slate-100 text-slate-900 hover:bg-white"
                      : "bg-slate-900 text-white hover:bg-slate-800 shadow-[0_12px_30px_rgba(15,23,42,0.14)]"
                  }`}
                >
                  <Download className="h-4 w-4" strokeWidth={2.1} />
                  Export CSV
                </button>
                {(searchTerm || startDate || endDate || activeStatus !== "All") && (
                  <button
                    onClick={() => {
                      setActiveStatus("All");
                      setSearchTerm("");
                      setStartDate("");
                      setEndDate("");
                    }}
                    className={`rounded-[18px] border px-4 py-3 text-sm font-semibold transition-all ${
                      isDark
                        ? "border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
                        : "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                    }`}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_220px_220px]">
              <div className="relative">
                <Search className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${
                  isDark ? "text-slate-400" : "text-slate-400"
                }`} />
                <input
                  type="text"
                  placeholder="Search by name, document, or reference #"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${inputClass} pl-11`}
                />
              </div>
              <DatePickerField
                value={startDate}
                onChange={setStartDate}
                placeholder="From date"
                ariaLabel="From date"
                isDark={isDark}
                t={t}
                triggerClassName={`${inputClass} inline-flex items-center justify-between gap-2`}
              />
              <DatePickerField
                value={endDate}
                onChange={setEndDate}
                placeholder="To date"
                ariaLabel="To date"
                isDark={isDark}
                t={t}
                triggerClassName={`${inputClass} inline-flex items-center justify-between gap-2`}
              />
            </div>

            {pageError && (
              <div className={`flex flex-wrap items-center justify-between gap-3 rounded-[24px] border px-4 py-4 text-sm ${
                isDark
                  ? "border-rose-500/30 bg-rose-500/10 text-rose-200"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}>
                <span>{pageError}</span>
                <button
                  type="button"
                  onClick={() => setReloadToken((current) => current + 1)}
                  className={`rounded-[16px] px-3 py-2 text-xs font-semibold transition-all ${
                    isDark
                      ? "bg-slate-950 text-rose-200 hover:bg-slate-900"
                      : "bg-white text-rose-700 shadow-sm hover:bg-rose-100"
                  }`}
                >
                  Retry load
                </button>
              </div>
            )}
          </div>

          <div className={`overflow-x-auto border-t ${t.cardBorder}`}>
            <table className="min-w-[1180px] w-full">
            <thead className={tableHeaderClass}>
              <tr>
                <th className="px-5 py-4 text-center text-[11px] font-bold uppercase tracking-[0.16em]">#</th>
                <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.16em]">Resident</th>
                <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.16em]">Reference #</th>
                <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.16em]">Document</th>
                <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.16em]">Contact</th>
                <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.16em]">Submitted</th>
                <th className="px-5 py-4 text-center text-[11px] font-bold uppercase tracking-[0.16em]">Status</th>
                <th className="px-5 py-4 text-center text-[11px] font-bold uppercase tracking-[0.16em]">Actions</th>
              </tr>
            </thead>

            <tbody className={isDark ? "divide-y divide-slate-800" : "divide-y divide-slate-100"}>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className={`px-5 py-10 text-center text-sm ${t.subtleText}`}>
                    Loading issuance applications...
                  </td>
                </tr>
              ) : paginatedCards.length > 0 ? (
                paginatedCards.map((card, index) => (
                  <tr key={card.reference_number} className={`transition-colors ${rowHoverClass}`}>
                    <td className={`px-5 py-4 text-center text-sm font-semibold ${t.subtleText}`}>
                      {(currentPage - 1) * ROWS_PER_PAGE + index + 1}
                    </td>
                    <td className="px-5 py-4">
                      <div className="min-w-0">
                        <p className={`truncate text-sm font-semibold ${t.cardText}`}>
                          {card.full_name}
                        </p>
                        <p className={`mt-1 text-xs ${t.subtleText}`}>
                          Issuance request
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-[14px] border px-3 py-1.5 text-xs font-semibold ${
                        isDark
                          ? "border-slate-700 bg-slate-900 text-slate-200"
                          : "border-slate-200 bg-slate-50 text-slate-700"
                      }`}>
                        {card.reference_number}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-[14px] border px-3 py-1.5 text-xs font-semibold ${
                        isDark
                          ? "border-slate-700 bg-slate-900 text-slate-200"
                          : "border-slate-200 bg-slate-50 text-slate-700"
                      }`}>
                        {card.documentType}
                      </span>
                    </td>
                    <td className={`px-5 py-4 text-sm ${t.cardText}`}>{card.contact_number}</td>
                    <td className={`px-5 py-4 text-sm ${t.cardText}`}>
                      {new Date(card.dateSubmitted).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <StatusBadge status={card.status} isDark={isDark} />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <IconActionButtons
                        isDark={isDark}
                        referenceNumber={card.reference_number}
                        onPreview={() => {
                          setPreviewData(card);
                          setShowPreview(true);
                        }}
                        onStatusUpdated={handleStatusUpdated}
                        canProcess={userCanProcessDocuments}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className={`px-5 py-12 text-center text-sm ${t.subtleText}`}>
                    No document requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>

          {totalPages > 1 && (
            <div className={`flex items-center justify-center gap-3 border-t px-5 py-4 ${t.cardBorder}`}>
              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                className={`rounded-[16px] px-4 py-2 text-sm font-semibold transition-all ${
                  isDark
                    ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Prev
              </button>
              <span className={`text-sm font-semibold ${t.cardText}`}>
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                className={`rounded-[16px] px-4 py-2 text-sm font-semibold transition-all ${
                  isDark
                    ? "bg-slate-100 text-slate-900 hover:bg-white"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </section>

        {/* Preview Modal */}
        {showPreview && previewData && typeof document !== "undefined" && createPortal(
          <div className="fixed inset-0 z-[1700] flex items-center justify-center bg-slate-950/55 px-4 py-5 backdrop-blur-sm sm:px-6 sm:py-8">
            <div className={`${softShellClass} flex max-h-[calc(100vh-3rem)] w-[min(90vw,620px)] flex-col overflow-hidden`}>
              <div className={`shrink-0 border-b px-4 py-3 sm:px-4 sm:py-3.5 ${t.cardBorder} ${isDark ? "bg-slate-950/70" : "bg-slate-50/80"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-[14px] ${
                      isDark ? "bg-slate-800 text-slate-100" : "bg-slate-100 text-slate-700"
                    }`}>
                      <FileText className="h-4 w-4" strokeWidth={2.1} />
                    </div>
                    <div className="min-w-0">
                      <h2 className={`font-spartan text-[15px] font-bold sm:text-base ${t.cardText}`}>
                        Application Preview
                      </h2>
                      <p className={`mt-0.5 text-[11px] sm:text-xs ${t.subtleText}`}>
                        Review the submitted record details and latest activity.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPreview(false)}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-[13px] border transition-all ${
                      isDark
                        ? "border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                        : "border-slate-200 bg-white text-slate-500 hover:bg-slate-100"
                    }`}
                    aria-label="Close preview"
                  >
                    <XIcon className="h-4 w-4" strokeWidth={2.2} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-3.5 py-3.5 sm:px-4 sm:py-4">
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    <div className={`rounded-[14px] border px-2.5 py-2.5 ${isDark ? "border-slate-700 bg-slate-900/80" : "border-slate-200 bg-slate-50/80"}`}>
                      <p className={`text-[9px] font-semibold uppercase tracking-[0.11em] ${t.subtleText}`}>Name</p>
                      <p className={`mt-1 text-[12px] font-semibold sm:text-[13px] ${t.cardText}`}>{previewData.full_name}</p>
                    </div>
                    <div className={`rounded-[14px] border px-2.5 py-2.5 ${isDark ? "border-slate-700 bg-slate-900/80" : "border-slate-200 bg-slate-50/80"}`}>
                      <p className={`text-[9px] font-semibold uppercase tracking-[0.11em] ${t.subtleText}`}>Reference #</p>
                      <p className={`mt-1 text-[12px] font-semibold sm:text-[13px] ${t.cardText}`}>{previewData.reference_number}</p>
                    </div>
                    <div className={`rounded-[14px] border px-2.5 py-2.5 ${isDark ? "border-slate-700 bg-slate-900/80" : "border-slate-200 bg-slate-50/80"}`}>
                      <p className={`text-[9px] font-semibold uppercase tracking-[0.11em] ${t.subtleText}`}>Document</p>
                      <p className={`mt-1 text-[12px] font-semibold sm:text-[13px] ${t.cardText}`}>{previewData.documentType}</p>
                    </div>
                    <div className={`rounded-[14px] border px-2.5 py-2.5 ${isDark ? "border-slate-700 bg-slate-900/80" : "border-slate-200 bg-slate-50/80"}`}>
                      <p className={`text-[9px] font-semibold uppercase tracking-[0.11em] ${t.subtleText}`}>Contact</p>
                      <p className={`mt-1 text-[12px] font-semibold sm:text-[13px] ${t.cardText}`}>{previewData.contact_number}</p>
                    </div>
                    <div className={`rounded-[14px] border px-2.5 py-2.5 ${isDark ? "border-slate-700 bg-slate-900/80" : "border-slate-200 bg-slate-50/80"}`}>
                      <p className={`text-[9px] font-semibold uppercase tracking-[0.11em] ${t.subtleText}`}>Status</p>
                      <div className="mt-1 origin-left scale-90">
                        <StatusBadge status={previewData.status} isDark={isDark} />
                      </div>
                    </div>
                    <div className={`rounded-[14px] border px-2.5 py-2.5 ${isDark ? "border-slate-700 bg-slate-900/80" : "border-slate-200 bg-slate-50/80"}`}>
                      <p className={`text-[9px] font-semibold uppercase tracking-[0.11em] ${t.subtleText}`}>Submitted</p>
                      <p className={`mt-1 text-[12px] font-semibold sm:text-[13px] ${t.cardText}`}>
                        {new Date(previewData.dateSubmitted).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {previewData.documentType !== "Barangay ID" &&
                    previewData.documentType !== "Certificate of Residency" && (
                      <div className={`rounded-[14px] border px-2.5 py-2.5 ${isDark ? "border-slate-700 bg-slate-900/80" : "border-slate-200 bg-slate-50/80"}`}>
                        <p className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${t.subtleText}`}>
                          Purpose of Request
                        </p>
                        <p className={`mt-1.5 text-[13px] leading-5 sm:text-sm ${t.cardText}`}>
                          {previewData.purpose_of_request || "No purpose submitted."}
                        </p>
                      </div>
                    )}

                  <div>
                    <RecordTimeline
                      items={buildDocumentTimeline(previewData)}
                      currentTheme={currentTheme}
                      title="Application Timeline"
                      emptyMessage="No document activity has been recorded yet."
                      compact
                    />
                  </div>
                </div>
              </div>

              <div className={`shrink-0 border-t px-3.5 py-3 sm:px-4 ${t.cardBorder} ${isDark ? "bg-slate-950/70" : "bg-white/90"}`}>
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowPreview(false)}
                    className={`rounded-[14px] px-3.5 py-2 text-sm font-semibold transition-all ${
                      isDark
                        ? "bg-slate-100 text-slate-900 hover:bg-white"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
      </div>
    </div>
  );
};

export default DocumentsInquiryPage;
