import React, { useEffect, useState } from "react";
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
    prefix: "BID",
    label: "Barangay ID",
    heroTitle: "TRACK BARANGAY ID REQUEST",
    heroDescription:
      "Enter your issued reference number to check the latest processing status of your Barangay ID application.",
    gradient: "from-blue-500 to-indigo-600",
    accentText: "text-blue-600",
    accentIconSoft: "bg-blue-100",
    accentIconText: "text-blue-600",
    inputFocus: "focus:border-blue-500 focus:ring-blue-500/20",
    serviceInfo: {
      requirements: "Valid ID, proof of billing, and personal appearance.",
      fee: "PHP 20.00 (Voter) / PHP 30.00 (Non-voter)",
      infoLabel: "Validity",
      infoValue: "1 Year",
    },
  },
  coi: {
    prefix: "COI",
    label: "Certificate of Indigency",
    heroTitle: "TRACK CERTIFICATE OF INDIGENCY",
    heroDescription:
      "Check whether your Certificate of Indigency request is still under review, approved, or requires follow-up.",
    gradient: "from-green-500 to-emerald-600",
    accentText: "text-green-600",
    accentIconSoft: "bg-green-100",
    accentIconText: "text-green-600",
    inputFocus: "focus:border-green-500 focus:ring-green-500/20",
    serviceInfo: {
      requirements: "Valid ID and personal appearance upon claiming.",
      fee: "PHP 0.00",
      infoLabel: "Processing Time",
      infoValue: "1-3 Working Days",
    },
  },
  cor: {
    prefix: "COR",
    label: "Certificate of Residency",
    heroTitle: "TRACK CERTIFICATE OF RESIDENCY",
    heroDescription:
      "Review the most recent status update for your Certificate of Residency request using your reference number.",
    gradient: "from-indigo-500 to-purple-600",
    accentText: "text-indigo-600",
    accentIconSoft: "bg-indigo-100",
    accentIconText: "text-indigo-600",
    inputFocus: "focus:border-indigo-500 focus:ring-indigo-500/20",
    serviceInfo: {
      requirements: "Valid ID and personal appearance upon claiming.",
      fee: "PHP 0.00",
      infoLabel: "Validity",
      infoValue: "6 Months",
    },
  },
};

const DOCUMENT_TYPE_TO_PAGE_KEY = {
  "Barangay ID": "bid",
  "Certificate of Indigency": "coi",
  "Certificate of Residency": "cor",
};

const PREFIX_TO_PAGE_KEY = {
  BID: "bid",
  COI: "coi",
  COR: "cor",
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

const PageIcon = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

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

const HomeIcon = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

const resolvePageConfig = (pageKey, referenceNumber, documentType) => {
  const referenceKey =
    PREFIX_TO_PAGE_KEY[normalizeReferenceNumber(referenceNumber).split("-")[0]];
  const documentKey = DOCUMENT_TYPE_TO_PAGE_KEY[documentType];

  return TRACK_PAGE_CONFIG[documentKey || referenceKey || pageKey];
};

const formatDateTime = (value) => {
  if (!value) return "-";

  const normalizedValue = value.includes("T") ? value : value.replace(" ", "T");
  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const getProgressSteps = (status) => {
  if (status === "Verified") {
    return [
      { title: "Submitted", subtitle: "Request received", state: "done" },
      { title: "Review", subtitle: "Verified by barangay", state: "done" },
      { title: "Completed", subtitle: "Ready for next step", state: "done" },
    ];
  }

  if (status === "Rejected") {
    return [
      { title: "Submitted", subtitle: "Request received", state: "done" },
      { title: "Review", subtitle: "Assessment finished", state: "done" },
      { title: "Attention", subtitle: "Follow-up needed", state: "rejected" },
    ];
  }

  return [
    { title: "Submitted", subtitle: "Request received", state: "done" },
    { title: "Review", subtitle: "Currently processing", state: "current" },
    { title: "Completed", subtitle: "Waiting for update", state: "upcoming" },
  ];
};

const getProgressStateClass = (state) => {
  switch (state) {
    case "done":
      return {
        card: "border-green-200 bg-green-50",
        circle: "bg-green-500 text-white",
        title: "text-green-700",
        subtitle: "text-green-600",
      };
    case "current":
      return {
        card: "border-amber-200 bg-amber-50",
        circle: "bg-amber-500 text-white",
        title: "text-amber-700",
        subtitle: "text-amber-600",
      };
    case "rejected":
      return {
        card: "border-red-200 bg-red-50",
        circle: "bg-red-500 text-white",
        title: "text-red-700",
        subtitle: "text-red-600",
      };
    default:
      return {
        card: "border-slate-200 bg-white",
        circle: "bg-white text-slate-500 border border-slate-300",
        title: "text-slate-600",
        subtitle: "text-slate-500",
      };
  }
};

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.Pending;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${meta.badgeClass}`}
    >
      <span className={`h-2 w-2 rounded-full ${meta.dotClass}`} />
      {status}
    </span>
  );
};

const DetailCard = ({ label, value, t }) => (
  <div className={`rounded-2xl border ${t.cardBorder} ${t.inputBg} p-4`}>
    <p className={`text-[11px] font-bold uppercase tracking-[0.18em] ${t.subtleText} font-kumbh`}>
      {label}
    </p>
    <p className={`mt-2 text-sm sm:text-base font-semibold ${t.cardText} font-kumbh break-words`}>
      {value || "-"}
    </p>
  </div>
);

const SidebarItem = ({ label, value, t }) => (
  <div className={`border-t ${t.cardBorder} pt-3`}>
    <p className={`text-[11px] font-bold uppercase tracking-[0.18em] ${t.subtleText} font-kumbh`}>
      {label}
    </p>
    <p className={`mt-1 text-sm ${t.cardText} font-kumbh leading-relaxed`}>
      {value}
    </p>
  </div>
);

const TrackRequestPage = ({ pageKey }) => {
  const navigate = useNavigate();
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("appTheme") || "modern",
  );
  const [refNumber, setRefNumber] = useState("");
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const t = themeTokens[currentTheme] || themeTokens.modern;
  const activeConfig = resolvePageConfig(
    pageKey,
    requestData?.reference_number || refNumber,
    requestData?.document_type,
  );
  const activeStatusMeta = STATUS_META[requestData?.status] || STATUS_META.Pending;
  const progressSteps = getProgressSteps(requestData?.status);

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

    setLoading(true);
    setError("");
    setRequestData(null);

    try {
      const fallbackPath =
        TRACK_PAGE_CONFIG[pageKey].prefix === "BID"
          ? "track-request"
          : `track-${TRACK_PAGE_CONFIG[pageKey].prefix.toLowerCase()}`;

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
          TRACK_PAGE_CONFIG[pageKey].label,
        ),
      });
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className={`${t.pageBg} py-8 sm:py-10 text-center px-4`}>
        <h1
          className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${t.cardText} mb-2 sm:mb-3 font-spartan uppercase tracking-tight`}
        >
          DOCUMENT SERVICES
        </h1>
      </div>

      <div className={`bg-gradient-to-r ${activeConfig.gradient} px-4 py-10 sm:py-12`}>
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-[28px] border border-white/20 bg-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
            <div className="grid gap-6 lg:grid-cols-[1.5fr_0.75fr] lg:items-center">
              <div>
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white shadow-lg">
                    <PageIcon className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="font-kumbh text-xs font-bold uppercase tracking-[0.24em] text-white/80">
                      Request Tracking
                    </p>
                    <h2 className="mt-2 font-spartan text-2xl sm:text-3xl font-bold text-white">
                      {activeConfig.heroTitle}
                    </h2>
                    <div className="mt-3 h-1 w-24 rounded-full bg-white/70" />
                  </div>
                </div>

                <p className="mt-5 max-w-3xl font-kumbh text-sm sm:text-base leading-relaxed text-white/90">
                  {activeConfig.heroDescription}
                </p>
              </div>

              <div className="rounded-[24px] border border-white/20 bg-slate-950/10 p-5 text-white shadow-lg">
                <p className="font-kumbh text-[11px] font-bold uppercase tracking-[0.22em] text-white/75">
                  Smart Lookup
                </p>
                <p className="mt-3 font-spartan text-xl font-bold">
                  Auto-detects reference type
                </p>
                <p className="mt-2 font-kumbh text-sm leading-relaxed text-white/85">
                  You can enter a valid BID, COI, or COR reference number and the tracker will route it to the correct service automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`${t.pageBg} flex-1`}>
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
          <p className={`mb-4 text-sm ${t.subtleText} font-kumbh`}>
            Home › <span className={`font-semibold ${t.cardText}`}>Track Request</span>
          </p>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.65fr_0.85fr]">
            <div className="space-y-5">
              <div className={`${t.cardBg} border ${t.cardBorder} rounded-[28px] p-5 sm:p-6 shadow-lg`}>
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${activeConfig.accentIconSoft} ${activeConfig.accentIconText}`}
                  >
                    <SearchIcon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-spartan text-xl font-bold ${t.cardText}`}>
                      Search Reference Number
                    </h3>
                    <p className={`mt-1 text-sm ${t.subtleText} font-kumbh`}>
                      Enter your request number to view the latest status, applicant details, and next update.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <SearchIcon className={`pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${t.subtleText}`} />
                    <input
                      placeholder="Enter reference number"
                      value={refNumber}
                      onChange={(event) => {
                        setRefNumber(event.target.value.toUpperCase());
                        setError("");
                      }}
                      onKeyDown={(event) => event.key === "Enter" && handleTrack()}
                      className={`h-14 w-full rounded-2xl border ${t.cardBorder} ${t.inputBg} ${t.inputText} pl-12 pr-4 text-base font-semibold uppercase tracking-[0.08em] outline-none ring-0 transition-all ${activeConfig.inputFocus}`}
                    />
                  </div>

                  <button
                    onClick={handleTrack}
                    className={`inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${activeConfig.gradient} px-6 font-spartan text-sm font-bold uppercase tracking-[0.18em] text-white shadow-lg transition-transform duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70`}
                    disabled={loading}
                  >
                    <StatusIcon className="h-5 w-5" />
                    {loading ? "Searching..." : "Track Request"}
                  </button>
                </div>

                {error && (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
              </div>

              {!requestData ? (
                <div className={`${t.cardBg} border ${t.cardBorder} rounded-[28px] p-6 sm:p-8 shadow-lg`}>
                  <div className="flex flex-col items-center text-center py-6 sm:py-8">
                    <div
                      className={`flex h-20 w-20 items-center justify-center rounded-full ${activeConfig.accentIconSoft} ${activeConfig.accentText}`}
                    >
                      <PageIcon className="h-10 w-10" />
                    </div>
                    <h3 className={`mt-5 font-spartan text-2xl font-bold ${t.cardText}`}>
                      No request loaded yet
                    </h3>
                    <p className={`mt-3 max-w-xl text-sm sm:text-base ${t.subtleText} font-kumbh leading-relaxed`}>
                      Search using your reference number and we will display your applicant details, current status, and the most relevant next-step guidance here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className={`${t.cardBg} border ${t.cardBorder} rounded-[28px] shadow-lg overflow-hidden`}>
                  <div className={`border-b ${t.cardBorder} p-6 sm:p-8`}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${activeConfig.accentIconSoft} ${activeConfig.accentIconText}`}
                        >
                          <PageIcon className="h-7 w-7" />
                        </div>
                        <div>
                          <p className={`text-xs font-bold uppercase tracking-[0.22em] ${activeConfig.accentText} font-kumbh`}>
                            Status Overview
                          </p>
                          <h3 className={`mt-2 font-spartan text-2xl font-bold ${t.cardText}`}>
                            {requestData.full_name}
                          </h3>
                          <p className={`mt-1 text-sm ${t.subtleText} font-kumbh`}>
                            {requestData.reference_number}
                          </p>
                        </div>
                      </div>

                      <StatusBadge status={requestData.status} />
                    </div>

                    <div className={`mt-5 rounded-2xl border px-4 py-4 ${activeStatusMeta.panelClass}`}>
                      <p className="font-spartan text-lg font-bold text-slate-800">
                        {activeStatusMeta.title}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-700 font-kumbh">
                        {activeStatusMeta.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <DetailCard label="Applicant Name" value={requestData.full_name} t={t} />
                      <DetailCard label="Reference Number" value={requestData.reference_number} t={t} />
                      <DetailCard label="Document Type" value={requestData.document_type} t={t} />
                      <DetailCard label="Date Submitted" value={formatDateTime(requestData.date_submitted)} t={t} />
                    </div>

                    <div className="mt-6">
                      <div className="mb-4 flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r ${activeConfig.gradient} text-white`}>
                          <StatusIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className={`font-spartan text-xl font-bold ${t.cardText}`}>
                            Progress Snapshot
                          </h4>
                          <p className={`text-sm ${t.subtleText} font-kumbh`}>
                            Quick view of the current request stage.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        {progressSteps.map((step) => {
                          const stepClass = getProgressStateClass(step.state);

                          return (
                            <div
                              key={step.title}
                              className={`rounded-2xl border p-4 ${stepClass.card}`}
                            >
                              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${stepClass.circle}`}>
                                {step.title.charAt(0)}
                              </div>
                              <p className={`mt-4 font-spartan text-lg font-bold ${stepClass.title}`}>
                                {step.title}
                              </p>
                              <p className={`mt-1 text-sm font-kumbh ${stepClass.subtitle}`}>
                                {step.subtitle}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <button
                        onClick={() => navigate("/sub-system-2")}
                        className={`inline-flex items-center justify-center gap-2 rounded-2xl border ${t.cardBorder} px-5 py-3 text-sm font-semibold ${t.cardText} ${t.inputBg} transition-colors hover:opacity-80`}
                      >
                        <HomeIcon className="h-5 w-5" />
                        Return to Home
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className={`${t.cardBg} border ${t.cardBorder} rounded-[28px] p-5 shadow-lg`}>
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${activeConfig.accentIconSoft} ${activeConfig.accentIconText}`}
                  >
                    <PageIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className={`font-spartan text-xl font-bold ${t.cardText}`}>
                      Service Information
                    </h3>
                    <p className={`mt-1 text-sm ${t.subtleText} font-kumbh`}>
                      Snapshot of the document currently being tracked.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <SidebarItem label="Document" value={activeConfig.label} t={t} />
                  <SidebarItem label="Requirements" value={activeConfig.serviceInfo.requirements} t={t} />
                  <SidebarItem label="Fees" value={activeConfig.serviceInfo.fee} t={t} />
                  <SidebarItem label={activeConfig.serviceInfo.infoLabel} value={activeConfig.serviceInfo.infoValue} t={t} />
                </div>
              </div>

              <div className={`${t.cardBg} border ${t.cardBorder} rounded-[28px] p-5 shadow-lg`}>
                <h3 className={`font-spartan text-xl font-bold ${t.cardText}`}>
                  Status Guide
                </h3>
                <p className={`mt-1 text-sm ${t.subtleText} font-kumbh`}>
                  Meaning of each request status shown in the tracker.
                </p>

                <div className="mt-5 space-y-3">
                  {Object.entries(STATUS_META).map(([label, meta]) => (
                    <div key={label} className={`rounded-2xl border px-4 py-3 ${meta.panelClass}`}>
                      <StatusBadge status={label} />
                      <p className="mt-3 text-sm text-slate-700 font-kumbh leading-relaxed">
                        {meta.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${t.cardBg} border ${t.cardBorder} rounded-[28px] p-5 shadow-lg`}>
                <h3 className={`font-spartan text-xl font-bold ${t.cardText}`}>
                  Need Help?
                </h3>
                <p className={`mt-1 text-sm ${t.subtleText} font-kumbh`}>
                  Contact the barangay office if you need clarification about your request.
                </p>

                <div className="mt-5 space-y-3">
                  <SidebarItem label="Contact Number" value="8-3663-198" t={t} />
                  <SidebarItem label="Email Address" value="teamtolentino@gmail.com" t={t} />
                  <SidebarItem
                    label="Reminder"
                    value="Bring a valid ID and your reference number when following up or claiming your document."
                    t={t}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackRequestPage;
