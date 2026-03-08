import React, { useEffect, useMemo, useState } from "react";
import themeTokens from "../../Themetokens";

const STAT_COLOR = {
  amber: {
    icon: "text-amber-500",
    iconBg: "bg-amber-100",
    iconBgDark: "bg-amber-900/30",
    accent: "border-l-amber-400",
  },
  green: {
    icon: "text-green-600",
    iconBg: "bg-green-100",
    iconBgDark: "bg-green-900/30",
    accent: "border-l-green-500",
  },
  red: {
    icon: "text-red-500",
    iconBg: "bg-red-100",
    iconBgDark: "bg-red-900/30",
    accent: "border-l-red-500",
  },
};

const statusTabs = ["All", "Pending", "Completed", "Rejected"];

const STATUS_TAB_CONFIG = {
  All: { bg: "bg-gray-700", text: "text-white", border: "border-gray-700" },
  Pending: {
    bg: "bg-amber-500",
    text: "text-white",
    border: "border-amber-500",
  },
  Completed: {
    bg: "bg-green-600",
    text: "text-white",
    border: "border-green-600",
  },
  Rejected: { bg: "bg-red-600", text: "text-white", border: "border-red-600" },
};

const ROWS_PER_PAGE = 6;

const toStartOfDay = (dateText) => {
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

// ── Sub-components ─────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styleMap = {
    Pending: "bg-amber-100 text-amber-700 border-amber-200",
    Completed: "bg-green-100 text-green-700 border-green-200",
    Rejected: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-kumbh font-semibold ${
        styleMap[status] ?? "bg-gray-100 text-gray-600 border-gray-200"
      }`}
    >
      {status}
    </span>
  );
};

// ── Icon buttons with working API calls ───────────────────────────────
const IconActionButtons = ({
  isDark,
  referenceNumber,
  onPreview,
  onStatusUpdated,
}) => {
  const updateStatus = async (action) => {
    const url = `http://127.0.0.1:8001/api/documents/${referenceNumber}/${action}`;
    try {
      const res = await fetch(url, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status");

      // Update local UI immediately
      const newStatus = action === "verify" ? "Completed" : "Rejected";
      onStatusUpdated(referenceNumber, newStatus);
      alert(data.message);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => updateStatus("verify")}
        className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-700 text-white hover:bg-slate-600 transition-colors"
      >
        ✔
      </button>

      <button
        onClick={onPreview}
        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
          isDark
            ? "bg-slate-600 text-slate-200 hover:bg-slate-500"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        👁
      </button>

      <button
        onClick={() => updateStatus("reject")}
        className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
      >
        ✖
      </button>
    </div>
  );
};

// ── Main page ──────────────────────────────────────────────────────────
const DocumentsInquiryPage = () => {
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("appTheme") || "modern",
  );
  const [activeStatus, setActiveStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [summaryCounts, setSummaryCounts] = useState({
    pending: 0,
    verified: 0,
    rejected: 0,
  });
  const [documentCardsData, setDocumentCardsData] = useState([]);

  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const handler = (e) => setCurrentTheme(e.detail);
    window.addEventListener("themeChange", handler);
    return () => window.removeEventListener("themeChange", handler);
  }, []);

  const t = themeTokens[currentTheme] || themeTokens.modern;
  const isDark = currentTheme === "dark";

  // ── Fetch API data ────────────────────────────────────────────────
  useEffect(() => {
    fetch("http://127.0.0.1:8001/api/document-status/counts")
      .then((res) => res.json())
      .then((data) => {
        setSummaryCounts({
          pending: data.pending ?? 0,
          verified: data.verified ?? 0,
          rejected: data.rejected ?? 0,
        });
      });

    fetch("http://127.0.0.1:8001/api/documents")
      .then((res) => res.json())
      .then((data) => {
        setDocumentCardsData(data);
      });
  }, []);

  // ── Summary cards ────────────────────────────────────────────────
  const summaryCards = [
    {
      key: "pending",
      title: "Pending Verification",
      value: summaryCounts.pending,
      subtitle: "Awaiting admin review",
      color: "amber",
    },
    {
      key: "verified",
      title: "Verified",
      value: summaryCounts.verified,
      subtitle: "Successfully processed",
      color: "green",
    },
    {
      key: "rejected",
      title: "Rejected",
      value: summaryCounts.rejected,
      subtitle: "Declined or invalid",
      color: "red",
    },
  ];

  // ── Filtering ────────────────────────────────────────────────────
  const filteredCards = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return documentCardsData.filter((card) => {
      const matchesStatus =
        activeStatus === "All" ||
        (activeStatus === "Pending" && card.status === "Pending") ||
        (activeStatus === "Completed" && card.status === "Completed") ||
        (activeStatus === "Rejected" && card.status === "Rejected");

      const matchesSearch =
        query.length === 0 ||
        card.full_name?.toLowerCase().includes(query) ||
        card.documentType?.toLowerCase().includes(query) ||
        card.reference_number?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [activeStatus, searchTerm, documentCardsData]);

  const totalPages = Math.ceil(filteredCards.length / ROWS_PER_PAGE);
  const paginatedCards = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredCards.slice(start, start + ROWS_PER_PAGE);
  }, [filteredCards, currentPage]);

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className={`min-h-full ${t.pageBg} pb-10`}>
      <div className="w-full px-3 sm:px-4 lg:px-5 py-6 space-y-6">
        {/* ── Page Header ──────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 ${isDark ? "bg-slate-700" : "bg-gray-200"} rounded-lg flex items-center justify-center flex-shrink-0`}
          >
            <svg
              className={`w-7 h-7 ${isDark ? "text-slate-300" : "text-gray-600"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-bold ${t.cardText} font-spartan uppercase`}
          >
            Issuance Application
          </h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {summaryCards.map((card) => {
            const col = STAT_COLOR[card.color];
            return (
              <div
                key={card.key}
                className={`${t.cardBg} border ${t.cardBorder} border-l-4 ${col.accent} rounded-xl p-5`}
              >
                <p className="text-xs uppercase">{card.title}</p>
                <p className="text-4xl font-bold">{card.value}</p>
                <p className="text-xs">{card.subtitle}</p>
              </div>
            );
          })}
        </div>

        {/* STATUS FILTER TABS */}
        <div className="flex gap-2 flex-wrap">
          {statusTabs.map((tab) => {
            const config = STATUS_TAB_CONFIG[tab];
            const isActive = activeStatus === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveStatus(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition ${
                  isActive
                    ? `${config.bg} ${config.text} ${config.border}`
                    : isDark
                      ? "bg-slate-700 text-white border-slate-600"
                      : "bg-gray-100 text-gray-600 border-gray-200"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* CARD VIEW */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginatedCards.map((card) => (
            <div
              key={card.reference_number}
              className={`${t.cardBg} border ${t.cardBorder} rounded-xl p-5 shadow-md`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className={`font-bold text-lg ${t.cardText}`}>
                    {card.full_name}
                  </h3>
                  <p className="text-xs">Ref #: {card.reference_number}</p>
                </div>
                <StatusBadge status={card.status} />
              </div>

              <div className="space-y-1 text-sm">
                <p>
                  <strong>Document:</strong> {card.documentType}
                </p>
                <p>
                  <strong>Contact:</strong> {card.contact_number}
                </p>
                <p>
                  <strong>Submitted:</strong>{" "}
                  {new Date(card.dateSubmitted).toLocaleDateString()}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t flex justify-between">
                <IconActionButtons
                  isDark={isDark}
                  referenceNumber={card.reference_number}
                  onPreview={() => {
                    setPreviewData(card);
                    setShowPreview(true);
                  }}
                  onStatusUpdated={(refNum, newStatus) => {
                    setDocumentCardsData((prev) =>
                      prev.map((doc) =>
                        doc.reference_number === refNum
                          ? { ...doc, status: newStatus }
                          : doc,
                      ),
                    );
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {paginatedCards.length === 0 && (
          <div className="text-center py-10">
            <p>No document requests found.</p>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && previewData && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className={`${t.cardBg} rounded-xl p-6 w-[400px] shadow-xl`}>
              <h2 className="text-xl font-bold mb-4">Application Preview</h2>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Name:</strong> {previewData.full_name}
                </p>
                <p>
                  <strong>Reference #:</strong> {previewData.reference_number}
                </p>
                <p>
                  <strong>Document:</strong> {previewData.documentType}
                </p>
                <p>
                  <strong>Contact:</strong> {previewData.contact_number}
                </p>
                <p>
                  <strong>Status:</strong> {previewData.status}
                </p>
                <p>
                  <strong>Submitted:</strong>{" "}
                  {new Date(previewData.dateSubmitted).toLocaleDateString()}
                </p>
              </div>
              <div className="flex justify-end mt-5">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsInquiryPage;
