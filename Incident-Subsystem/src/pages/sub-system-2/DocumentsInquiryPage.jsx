import React, { useEffect, useMemo, useState } from "react";
import themeTokens from "../../Themetokens";

// ── Constants ────────────────────────────────────────────────
const STAT_COLOR = {
  amber: { icon: "text-amber-500", iconBg: "bg-amber-100", accent: "border-l-amber-400" },
  green: { icon: "text-green-600", iconBg: "bg-green-100", accent: "border-l-green-500" },
  red: { icon: "text-red-500", iconBg: "bg-red-100", accent: "border-l-red-500" },
};

const statusTabs = ["All", "Pending", "Verified", "Rejected"];

const STATUS_TAB_CONFIG = {
  All: { bg: "bg-gray-700", text: "text-white", border: "border-gray-700" },
  Pending: { bg: "bg-amber-500", text: "text-white", border: "border-amber-500" },
  Verified: { bg: "bg-green-600", text: "text-white", border: "border-green-600" },
  Rejected: { bg: "bg-red-600", text: "text-white", border: "border-red-600" },
};

const ROWS_PER_PAGE = 6;

// ── Sub-components ────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styleMap = {
    Pending: "bg-amber-100 text-amber-700 border-amber-200",
    Verified: "bg-green-100 text-green-700 border-green-200",
    Rejected: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styleMap[status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {status}
    </span>
  );
};

const IconActionButtons = ({ isDark, referenceNumber, onPreview, onStatusUpdated }) => {
  const updateStatus = async (action) => {
    const url = `http://127.0.0.1:8001/api/documents/${referenceNumber}/${action}`;
    try {
      const res = await fetch(url, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status");

      const newStatus = action === "verify" ? "Verified" : "Rejected";
      onStatusUpdated(referenceNumber, newStatus);
      alert(data.message);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Verify */}
      <button
        onClick={() => updateStatus("verify")}
        className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors"
        title="Verify"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </button>

      {/* Preview */}
      <button
        onClick={onPreview}
        className={`p-2 rounded-lg ${isDark ? "bg-slate-600 text-white hover:bg-slate-500" : "bg-gray-200 text-gray-800 hover:bg-gray-300"} transition-colors`}
        title="Preview"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>

      {/* Reject */}
      <button
        onClick={() => updateStatus("reject")}
        className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
        title="Reject"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────
const DocumentsInquiryPage = () => {
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem("appTheme") || "modern");
  const [activeStatus, setActiveStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [summaryCounts, setSummaryCounts] = useState({ pending: 0, verified: 0, rejected: 0 });
  const [documentCardsData, setDocumentCardsData] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const t = themeTokens[currentTheme] || themeTokens.modern;
  const isDark = currentTheme === "dark";

  useEffect(() => {
    const handler = (e) => setCurrentTheme(e.detail);
    window.addEventListener("themeChange", handler);
    return () => window.removeEventListener("themeChange", handler);
  }, []);

  // Fetch data
  useEffect(() => {
    fetch("http://127.0.0.1:8001/api/document-status/counts")
      .then((res) => res.json())
      .then((data) => setSummaryCounts({ pending: data.pending ?? 0, verified: data.verified ?? 0, rejected: data.rejected ?? 0 }));

    fetch("http://127.0.0.1:8001/api/documents")
      .then((res) => res.json())
      .then((data) => setDocumentCardsData(data));
  }, []);

  const summaryCards = [
    { key: "pending", title: "Pending Verification", value: summaryCounts.pending, subtitle: "Awaiting admin review", color: "amber" },
    { key: "verified", title: "Verified", value: summaryCounts.verified, subtitle: "Successfully processed", color: "green" },
    { key: "rejected", title: "Rejected", value: summaryCounts.rejected, subtitle: "Declined or invalid", color: "red" },
  ];

  // Filtered + paginated
  const filteredCards = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return documentCardsData.filter((card) => {
      const matchesStatus =
        activeStatus === "All" || card.status === activeStatus;
      const matchesSearch =
        query === "" ||
        card.full_name.toLowerCase().includes(query) ||
        card.documentType.toLowerCase().includes(query) ||
        card.reference_number.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [activeStatus, searchTerm, documentCardsData]);

  const totalPages = Math.ceil(filteredCards.length / ROWS_PER_PAGE);
  const paginatedCards = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredCards.slice(start, start + ROWS_PER_PAGE);
  }, [filteredCards, currentPage]);

  return (
    <div className={`min-h-full ${t.pageBg} pb-10`}>
      <div className="w-full px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${isDark ? "bg-slate-700" : "bg-gray-200"} rounded-lg flex items-center justify-center`}>
            <svg className={`w-7 h-7 ${isDark ? "text-slate-300" : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-bold ${t.cardText} font-spartan uppercase`}>Issuance Application</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {summaryCards.map((card) => {
            const col = STAT_COLOR[card.color];
            return (
              <div key={card.key} className={`${t.cardBg} border ${t.cardBorder} border-l-4 ${col.accent} rounded-xl p-5`}>
                <p className="text-xs uppercase">{card.title}</p>
                <p className="text-4xl font-bold">{card.value}</p>
                <p className="text-xs">{card.subtitle}</p>
              </div>
            );
          })}
        </div>

        {/* Filter Tabs + Search */}
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {statusTabs.map((tab) => {
              const config = STATUS_TAB_CONFIG[tab];
              const isActive = activeStatus === tab;
              return (
                <button key={tab} onClick={() => setActiveStatus(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border transition ${isActive ? `${config.bg} ${config.text} ${config.border}` : isDark ? "bg-slate-700 text-white border-slate-600" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                  {tab}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            placeholder="Search by Name, Ref #"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border rounded-lg w-full sm:w-64 focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        {/* Table */}
        {/* Table */}
<div className="overflow-x-auto mt-4">
  <table className={`min-w-full divide-y divide-gray-200 ${t.cardBg} border ${t.cardBorder} rounded-xl`}>
    <thead className={`${t.cardBg}`}>
      <tr>
        <th className="px-4 py-2 text-center text-sm font-semibold">#</th> {/* <-- Number column */}
        <th className="px-4 py-2 text-center text-sm font-semibold">Name</th>
        <th className="px-4 py-2 text-center text-sm font-semibold">Reference #</th>
        <th className="px-4 py-2 text-center text-sm font-semibold">Document</th>
        <th className="px-4 py-2 text-center text-sm font-semibold">Contact</th>
        <th className="px-4 py-2 text-center text-sm font-semibold">Submitted</th>
        <th className="px-4 py-2 text-center text-sm font-semibold">Status</th>
        <th className="px-4 py-2 text-center text-sm font-semibold">Actions</th>
      </tr>
    </thead>

    <tbody className="divide-y divide-gray-200">
      {paginatedCards.length > 0 ? paginatedCards.map((card, index) => (
        <tr key={card.reference_number} className={`${t.cardBg} hover:bg-gray-100`}>
          <td className="px-4 py-2">{(currentPage - 1) * ROWS_PER_PAGE + index + 1}</td> {/* <-- Compute row number */}
          <td className="px-4 py-2">{card.full_name}</td>
          <td className="px-4 py-2">{card.reference_number}</td>
          <td className="px-4 py-2">{card.documentType}</td>
          <td className="px-4 py-2">{card.contact_number}</td>
          <td className="px-4 py-2">{new Date(card.dateSubmitted).toLocaleDateString()}</td>
          <td className="px-4 py-2"><StatusBadge status={card.status} /></td>
          <td className="px-4 py-2">
            <IconActionButtons
              isDark={isDark}
              referenceNumber={card.reference_number}
              onPreview={() => { setPreviewData(card); setShowPreview(true); }}
              onStatusUpdated={(refNum, newStatus) => setDocumentCardsData(prev => prev.map(d => d.reference_number === refNum ? { ...d, status: newStatus } : d))}
            />
          </td>
        </tr>
      )) : (
        <tr><td colSpan={8} className="text-center py-6 text-sm">No document requests found.</td></tr>
      )}
    </tbody>
  </table>

  {/* Pagination */}
  {totalPages > 1 && (
    <div className="flex justify-center items-center gap-2 mt-4">
      <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300">Prev</button>
      <span>{currentPage} / {totalPages}</span>
      <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300">Next</button>
    </div>
  )}
</div>

        {/* Preview Modal */}
        {showPreview && previewData && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className={`${t.cardBg} rounded-xl p-6 w-[400px] shadow-xl`}>
              <h2 className="text-xl font-bold mb-4">Application Preview</h2>
              <div className="space-y-2 text-sm text-center">
                <p><strong className="text-center">Name:</strong> {previewData.full_name}</p>
                <p><strong>Reference #:</strong> {previewData.reference_number}</p>
                <p><strong>Document:</strong> {previewData.documentType}</p>
                <p><strong>Contact:</strong> {previewData.contact_number}</p>
                <p><strong>Status:</strong> {previewData.status}</p>
                <p><strong>Submitted:</strong> {new Date(previewData.dateSubmitted).toLocaleDateString()}</p>
              </div>
              <div className="flex justify-end mt-5">
                <button onClick={() => setShowPreview(false)} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsInquiryPage;