import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import themeTokens from "../../Themetokens";
import { DOCUMENTS_API_BASE_URL } from "../../config/runtimeApi";
import {
  getReferenceNumberFormatHint,
  isReferenceNumberFormatValid,
  normalizeReferenceNumber,
  resolveDocumentType,
  resolveTrackingPath,
} from "./trackingUtils";

const TRACK_PAGE_CONFIG = {
  bid: {
    label: "Barangay ID",
    gradient: "from-blue-500 to-indigo-600",
    accentText: "text-blue-600",
    accentIconSoft: "bg-blue-100",
    accentIconText: "text-blue-600",
    inputFocus: "focus:border-blue-500 focus:ring-blue-500/20",
  },
  coi: {
    label: "Certificate of Indigency",
    gradient: "from-green-500 to-emerald-600",
    accentText: "text-green-600",
    accentIconSoft: "bg-green-100",
    accentIconText: "text-green-600",
    inputFocus: "focus:border-green-500 focus:ring-green-500/20",
  },
  cor: {
    label: "Certificate of Residency",
    gradient: "from-indigo-500 to-purple-600",
    accentText: "text-indigo-600",
    accentIconSoft: "bg-indigo-100",
    accentIconText: "text-indigo-600",
    inputFocus: "focus:border-indigo-500 focus:ring-indigo-500/20",
  },
};

const STATUS_META = {
  Pending: {
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
    dotClass: "bg-amber-500",
    panelClass: "border-amber-200 bg-amber-50",
    title: "Your request is currently under review.",
    description:
      "The barangay staff is validating the information and supporting details linked to this request.",
  },
  Verified: {
    badgeClass: "bg-green-100 text-green-700 border-green-200",
    dotClass: "bg-green-500",
    panelClass: "border-green-200 bg-green-50",
    title: "Your request has been verified successfully.",
    description:
      "The application passed verification and is ready for the next processing or claiming step from the barangay office.",
  },
  Rejected: {
    badgeClass: "bg-red-100 text-red-700 border-red-200",
    dotClass: "bg-red-500",
    panelClass: "border-red-200 bg-red-50",
    title: "This request requires attention.",
    description:
      "The application was not approved. Please contact the barangay office to confirm the reason and next action.",
  },
};

const SearchIcon = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const StatusIcon = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const BackIcon = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 19l-7-7 7-7M8 12h11"
    />
  </svg>
);

const CopyIcon = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V5a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2h-2m-6 4H6a2 2 0 01-2-2V9a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2z"
    />
  </svg>
);

const CheckIcon = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.Pending;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[7px] sm:text-[8px] font-semibold uppercase tracking-wide ${meta.badgeClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
      {status}
    </span>
  );
};

const DetailCard = ({
  label,
  value,
  t,
  actionLabel,
  onAction,
  actionTitle,
  actionClassName = "",
}) => (
  <div className={`relative rounded-xl border ${t.cardBorder} ${t.inputBg} px-3 py-2.5 text-left shadow-sm`}>
    <div className="flex items-start">
      <p className={`pr-6 text-[11px] font-medium ${t.subtleText} font-kumbh`}>
        {label}
      </p>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          title={actionTitle}
          aria-label={actionTitle}
          className={`absolute right-3 top-2.5 inline-flex h-5 w-5 items-center justify-center rounded-md transition-colors hover:bg-slate-50 ${actionClassName}`}
        >
          {actionLabel}
        </button>
      )}
    </div>
    <p className={`mt-1 text-[10px] sm:text-[11px] font-semibold ${t.cardText} font-kumbh break-words leading-snug`}>
      {value || "-"}
    </p>
  </div>
);

const formatDateTime = (value) => {
  if (!value) return "-";

  const normalizedValue = value.includes("T") ? value : value.replace(" ", "T");
  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) return value;

  return parsedDate.toLocaleString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const TrackRequestSimplePage = ({ pageKey }) => {
  const navigate = useNavigate();
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("appTheme") || "modern",
  );
  const [refNumber, setRefNumber] = useState("");
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copyLabel, setCopyLabel] = useState("Copy");
  const copyTimeoutRef = useRef(null);

  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentTheme(localStorage.getItem("appTheme") || "modern");
    };

    const handleThemeChange = (event) => {
      setCurrentTheme(event.detail);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("themeChange", handleThemeChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("themeChange", handleThemeChange);
    };
  }, []);

  useEffect(() => () => {
    if (copyTimeoutRef.current) {
      window.clearTimeout(copyTimeoutRef.current);
    }
  }, []);

  const t = themeTokens[currentTheme] || themeTokens.modern;
  const activeConfig = TRACK_PAGE_CONFIG[pageKey] || TRACK_PAGE_CONFIG.bid;
  const activeStatusMeta = STATUS_META[requestData?.status] || STATUS_META.Pending;

  const handleCopyReference = async () => {
    const referenceNumber = requestData?.reference_number;

    if (!referenceNumber) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(referenceNumber);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = referenceNumber;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "absolute";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopyLabel("Copied");
    } catch {
      setCopyLabel("Failed");
    }

    if (copyTimeoutRef.current) {
      window.clearTimeout(copyTimeoutRef.current);
    }

    copyTimeoutRef.current = window.setTimeout(() => {
      setCopyLabel("Copy");
    }, 1800);
  };

  const handleTrack = async () => {
    const normalizedReference = normalizeReferenceNumber(refNumber);

    if (!normalizedReference) {
      setError("Please enter a reference number.");
      return;
    }

    if (!isReferenceNumberFormatValid(normalizedReference)) {
      setError(getReferenceNumberFormatHint());
      return;
    }

    setCopyLabel("Copy");
    setLoading(true);
    setError("");
    setRequestData(null);

    try {
      const fallbackPath = pageKey === "bid" ? "track-request" : `track-${pageKey}`;
      const trackingPath = resolveTrackingPath(normalizedReference, fallbackPath);
      const response = await fetch(
        `${DOCUMENTS_API_BASE_URL}/${trackingPath}/${normalizedReference}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Reference number not found");
      }

      setRefNumber(normalizedReference);
      setRequestData({
        ...data,
        reference_number: data.reference_number || normalizedReference,
        document_type: resolveDocumentType(
          normalizedReference,
          data.document_type,
          activeConfig.label,
        ),
      });
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${t.pageBg} h-full flex flex-col overflow-y-auto`}>
      <div className="px-4 py-4 sm:py-5">
        <div className="mb-2 flex justify-start">
          <button
            onClick={() => navigate("/sub-system-2")}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg border ${t.cardBorder} bg-white px-2.5 py-1.5 text-[11px] font-medium ${t.cardText} shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md`}
          >
            <BackIcon className={`h-3.5 w-3.5 ${activeConfig.accentIconText}`} />
            Back
          </button>
        </div>

        <div className="mx-auto w-full max-w-3xl text-center">
          <h1
            className={`text-[28px] sm:text-[34px] font-bold ${t.cardText} font-spartan uppercase tracking-tight`}
          >
            DOCUMENT SERVICES
          </h1>
        </div>
      </div>

      <div className="flex-1">
        <div className="container mx-auto max-w-3xl px-3 py-3 sm:px-4 sm:py-4">
          <div className="space-y-3">
            <div className={`${t.cardBg} border ${t.cardBorder} rounded-[20px] p-3.5 sm:p-4 shadow-lg`}>
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${activeConfig.accentIconSoft} ${activeConfig.accentIconText}`}
                >
                  <SearchIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className={`text-left font-spartan text-[14px] sm:text-[15px] font-bold ${t.cardText}`}>
                    Search Reference Number
                  </h3>
                  <p className={`mt-0 text-left text-[10px] sm:text-[11px] leading-tight ${t.subtleText} font-kumbh`}>
                    Enter your request number to view the latest status, applicant details, and next update.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                <div className="relative flex-1">
                  <SearchIcon className={`pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${t.subtleText}`} />
                  <input
                    placeholder="Enter reference number"
                    value={refNumber}
                    onChange={(event) => {
                      setRefNumber(event.target.value.toUpperCase());
                      setError("");
                    }}
                    onKeyDown={(event) => event.key === "Enter" && handleTrack()}
                    className={`h-10 w-full rounded-xl border ${t.cardBorder} ${t.inputBg} ${t.inputText} pl-9 pr-3.5 text-[11px] sm:text-[12px] font-medium tracking-normal outline-none ring-0 transition-all placeholder:font-normal ${activeConfig.inputFocus}`}
                  />
                </div>

                <button
                  onClick={handleTrack}
                  className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r ${activeConfig.gradient} px-3.5 sm:px-4 font-spartan text-[11px] sm:text-[12px] font-semibold tracking-normal leading-none text-white shadow-lg transition-transform duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70`}
                  disabled={loading}
                >
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center -translate-y-px">
                    <StatusIcon className="h-3.5 w-3.5" />
                  </span>
                  <span className="inline-flex items-center leading-none">
                    {loading ? "Searching..." : "Track Request"}
                  </span>
                </button>
              </div>

              {error && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>

            {!requestData ? (
              <div className={`${t.cardBg} border ${t.cardBorder} rounded-[20px] p-4 sm:p-5 shadow-lg`}>
                <div className="flex flex-col items-center text-center py-3 sm:py-4">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full ${activeConfig.accentIconSoft} ${activeConfig.accentText}`}
                  >
                    <StatusIcon className="h-7 w-7" />
                  </div>
                  <h3 className={`mt-3 font-spartan text-[18px] sm:text-[20px] font-bold ${t.cardText}`}>
                    No request loaded yet
                  </h3>
                  <p className={`mt-2 max-w-xl text-[12px] sm:text-[13px] ${t.subtleText} font-kumbh leading-relaxed`}>
                    Search using your reference number and we will display your applicant details, current status, and the most relevant next-step guidance here.
                  </p>
                </div>
              </div>
            ) : (
              <div className={`${t.cardBg} border ${t.cardBorder} rounded-[20px] p-4 sm:p-5 shadow-lg`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="text-left">
                    <p className={`text-[7px] font-semibold uppercase tracking-[0.12em] ${activeConfig.accentText} font-kumbh`}>
                      Request Status
                    </p>
                    <h3 className={`mt-2 font-spartan text-[14px] sm:text-[15px] font-bold leading-none ${t.cardText}`}>
                      {requestData.full_name}
                    </h3>
                    <p className={`mt-1.5 text-[10px] sm:text-[11px] leading-none ${t.subtleText} font-kumbh`}>
                      {requestData.reference_number} | {requestData.document_type}
                    </p>
                  </div>

                  <StatusBadge status={requestData.status} />
                </div>

                <div className={`mt-6 rounded-xl border px-3.5 py-3 text-center sm:px-4 ${activeStatusMeta.panelClass}`}>
                  <p className="font-spartan text-[12px] sm:text-[13px] font-bold leading-none text-slate-800">
                    {activeStatusMeta.title}
                  </p>
                  <p className="mt-1 text-[10px] sm:text-[11px] leading-snug text-slate-700 font-kumbh">
                    {activeStatusMeta.description}
                  </p>
                </div>

                <div className="mt-6">
                  <h4 className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${activeConfig.accentText} font-kumbh`}>
                    Request Details
                  </h4>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                  <DetailCard label="Applicant Name" value={requestData.full_name} t={t} />
                  <DetailCard
                    label="Reference Number"
                    value={requestData.reference_number}
                    t={t}
                    actionLabel={
                      copyLabel === "Copied" ? (
                        <CheckIcon className="h-2.5 w-2.5" />
                      ) : (
                        <CopyIcon className="h-2.5 w-2.5" />
                      )
                    }
                    onAction={handleCopyReference}
                    actionTitle={
                      copyLabel === "Copied"
                        ? "Copied"
                        : "Copy reference number"
                    }
                    actionClassName={
                      copyLabel === "Copied"
                        ? "bg-green-50 text-green-600"
                        : `${activeConfig.accentText}`
                    }
                  />
                  <DetailCard label="Document Type" value={requestData.document_type} t={t} />
                  <DetailCard label="Date Submitted" value={formatDateTime(requestData.date_submitted)} t={t} />
                </div>

                <div className={`mt-4 border-t ${t.cardBorder} pt-3`}>
                  <p className={`mx-auto max-w-xl text-center text-[9px] sm:text-[10px] ${t.subtleText} font-kumbh`}>
                    Keep your reference number ready when following up with the barangay office.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackRequestSimplePage;
