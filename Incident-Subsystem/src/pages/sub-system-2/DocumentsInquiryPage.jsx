import React, { useEffect, useMemo, useState } from "react";
import themeTokens from "../../Themetokens";

// ── Static data ────────────────────────────────────────────────────────
const summaryCards = [
  {
    key: "pending",
    title: "Pending Verification",
    value: 67,
    subtitle: "Awaiting admin review",
    color: "amber",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: "verified",
    title: "Verified",
    value: 20,
    subtitle: "Successfully processed",
    color: "green",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: "rejected",
    title: "Rejected",
    value: 9,
    subtitle: "Declined or invalid",
    color: "red",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

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

const documentCards = [
  { id: 1, residentName: "Mateo Dela Cruz",  status: "Pending",   documentType: "Barangay ID",               referenceNumber: "1110-2364-7968", dateSubmitted: "January 31, 2026" },
  { id: 2, residentName: "Brian Dajamco",    status: "Completed", documentType: "Certificate of Residency",   referenceNumber: "2210-1842-4471", dateSubmitted: "January 30, 2026" },
  { id: 3, residentName: "Luna Reyes",       status: "Rejected",  documentType: "Certificate of Indigency",   referenceNumber: "3190-9084-2236", dateSubmitted: "January 29, 2026" },
  { id: 4, residentName: "Ariel Santos",     status: "Pending",   documentType: "Barangay ID",               referenceNumber: "4441-2204-1109", dateSubmitted: "January 28, 2026" },
  { id: 5, residentName: "Mia Flores",       status: "Completed", documentType: "Certificate of Residency",   referenceNumber: "5152-7712-3340", dateSubmitted: "January 28, 2026" },
  { id: 6, residentName: "Kris Mendoza",     status: "Pending",   documentType: "Certificate of Indigency",   referenceNumber: "6891-3022-7745", dateSubmitted: "January 27, 2026" },
];

const statusTabs = ["All", "Pending", "Completed", "Rejected"];

const STATUS_TAB_CONFIG = {
  All:       { bg: "bg-gray-700",    text: "text-white", border: "border-gray-700" },
  Pending:   { bg: "bg-amber-500",   text: "text-white", border: "border-amber-500" },
  Completed: { bg: "bg-emerald-600", text: "text-white", border: "border-emerald-600" },
  Rejected:  { bg: "bg-red-600",     text: "text-white", border: "border-red-600" },
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
    Pending:   "bg-amber-100 text-amber-700 border-amber-200",
    Completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Rejected:  "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-kumbh font-semibold ${styleMap[status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {status}
    </span>
  );
};

const ActionButtons = ({ isDark }) => (
  <div className="flex items-center gap-2">
    <button className="h-7 px-3 rounded-full bg-slate-700 text-white font-kumbh text-xs font-semibold hover:bg-slate-600 transition-colors">
      Accept
    </button>
    <button className={`h-7 px-3 rounded-full border font-kumbh text-xs font-semibold transition-colors ${isDark ? "border-slate-500 text-slate-300 hover:bg-slate-600" : "border-gray-300 text-gray-600 bg-gray-50 hover:bg-gray-100"}`}>
      Preview
    </button>
    <button className="h-7 px-3 rounded-full border border-red-300 text-red-600 bg-red-50 font-kumbh text-xs font-semibold hover:bg-red-100 transition-colors">
      Decline
    </button>
  </div>
);

// ── Main page ──────────────────────────────────────────────────────────
const DocumentsInquiryPage = () => {
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("appTheme") || "blue",
  );
  const [activeStatus, setActiveStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("card");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const handler = (e) => setCurrentTheme(e.detail);
    window.addEventListener("themeChange", handler);
    return () => window.removeEventListener("themeChange", handler);
  }, []);

  const t = themeTokens[currentTheme] || themeTokens.blue;
  const isDark = currentTheme === "dark";

  const statusCounts = useMemo(() => {
    const counts = { All: documentCards.length, Pending: 0, Completed: 0, Rejected: 0 };
    documentCards.forEach((item) => {
      if (counts[item.status] !== undefined) counts[item.status] += 1;
    });
    return counts;
  }, []);

  const filteredCards = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const start = startDate ? toStartOfDay(startDate) : null;
    const end = endDate ? toStartOfDay(endDate) : null;

    return documentCards.filter((card) => {
      const matchesStatus = activeStatus === "All" || card.status === activeStatus;
      const matchesSearch =
        query.length === 0 ||
        card.residentName.toLowerCase().includes(query) ||
        card.documentType.toLowerCase().includes(query) ||
        card.referenceNumber.toLowerCase().includes(query);
      const submittedDate = toStartOfDay(card.dateSubmitted);
      const matchesStart = !start || (submittedDate && submittedDate >= start);
      const matchesEnd = !end || (submittedDate && submittedDate <= end);
      return matchesStatus && matchesSearch && matchesStart && matchesEnd;
    });
  }, [activeStatus, searchTerm, startDate, endDate]);

  const totalPages = Math.ceil(filteredCards.length / ROWS_PER_PAGE);

  const paginatedCards = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredCards.slice(start, start + ROWS_PER_PAGE);
  }, [filteredCards, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeStatus, searchTerm, startDate, endDate, viewMode]);

  return (
    <div className={`min-h-full ${t.pageBg} pb-10`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── Page Header ──────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${isDark ? "bg-slate-700" : "bg-gray-200"} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <svg className={`w-7 h-7 ${isDark ? "text-slate-300" : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-bold ${t.cardText} font-spartan uppercase`}>
            Issuance Application
          </h1>
        </div>

        {/* ── Stat Cards ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {summaryCards.map((card) => {
            const col = STAT_COLOR[card.color];
            return (
              <div
                key={card.key}
                className={`${t.cardBg} border ${t.cardBorder} border-l-4 ${col.accent} rounded-2xl shadow-lg p-5 flex items-start gap-4`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? col.iconBgDark : col.iconBg}`}>
                  <span className={col.icon}>{card.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-bold font-kumbh uppercase tracking-wide ${t.subtleText}`}>
                    {card.title}
                  </p>
                  <p className={`text-4xl font-bold font-spartan ${t.cardText} mt-1 leading-none`}>
                    {card.value}
                  </p>
                  <p className={`text-xs font-kumbh ${t.subtleText} mt-1`}>
                    {card.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Main Content Card ─────────────────────────────────────── */}
        <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl shadow-lg overflow-hidden`}>

          {/* Status Tabs + View Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
            {/* Status tabs */}
            <div className="flex flex-wrap gap-2">
              {statusTabs.map((tab) => {
                const cfg = STATUS_TAB_CONFIG[tab];
                const active = tab === activeStatus;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveStatus(tab)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold font-kumbh uppercase tracking-wide border-2 transition-all ${
                      active
                        ? `${cfg.bg} ${cfg.text} ${cfg.border} shadow-md`
                        : isDark
                          ? "bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-200 hover:text-slate-800 hover:border-slate-400"
                          : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {tab} ({statusCounts[tab] ?? 0})
                  </button>
                );
              })}
            </div>

            {/* View toggle */}
            <div className={`flex items-center gap-1 p-1 rounded-lg ${isDark ? "bg-slate-700" : "bg-gray-100"}`}>
              <button
                onClick={() => setViewMode("card")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold font-kumbh uppercase tracking-wide transition-all ${
                  viewMode === "card"
                    ? isDark ? "bg-slate-500 text-white shadow" : "bg-white text-gray-800 shadow"
                    : isDark ? "text-slate-400 hover:text-slate-200" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Cards
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold font-kumbh uppercase tracking-wide transition-all ${
                  viewMode === "table"
                    ? isDark ? "bg-slate-500 text-white shadow" : "bg-white text-gray-800 shadow"
                    : isDark ? "text-slate-400 hover:text-slate-200" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M3 6h18M3 18h18" />
                </svg>
                Table
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="px-5 pt-5 pb-3">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <label className={`block text-xs font-semibold ${t.subtleText} mb-1.5 font-kumbh uppercase`}>
                  Search
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, type, reference number..."
                  className={`w-full px-4 py-2.5 rounded-lg border ${t.cardBorder} ${t.cardBg} ${t.cardText} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-kumbh`}
                />
              </div>
              <div>
                <label className={`block text-xs font-semibold ${t.subtleText} mb-1.5 font-kumbh uppercase`}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`px-4 py-2.5 rounded-lg border ${t.cardBorder} ${t.cardBg} ${t.cardText} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-kumbh`}
                />
              </div>
              <div>
                <label className={`block text-xs font-semibold ${t.subtleText} mb-1.5 font-kumbh uppercase`}>
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`px-4 py-2.5 rounded-lg border ${t.cardBorder} ${t.cardBg} ${t.cardText} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-kumbh`}
                />
              </div>
            </div>
          </div>

          {/* ── Card View ────────────────────────────────────────────── */}
          {viewMode === "card" ? (
            <div className="px-5 pb-5">
              {paginatedCards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {paginatedCards.map((card) => (
                    <div
                      key={card.id}
                      className={`${isDark ? "bg-slate-700 border-slate-600" : "bg-gray-50 border-gray-200"} border rounded-xl p-4 flex flex-col gap-3`}
                    >
                      {/* Card header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className={`font-spartan text-sm font-bold ${t.cardText} truncate`}>
                            {card.residentName}
                          </p>
                          <p className={`font-kumbh text-xs ${t.subtleText} mt-0.5`}>
                            {card.documentType}
                          </p>
                        </div>
                        <StatusBadge status={card.status} />
                      </div>

                      {/* Card details */}
                      <div className={`space-y-1.5 border-t ${isDark ? "border-slate-600" : "border-gray-200"} pt-3`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-xs font-kumbh ${t.subtleText}`}>Reference</span>
                          <span className={`text-xs font-kumbh font-semibold ${t.cardText} font-mono`}>
                            {card.referenceNumber}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-xs font-kumbh ${t.subtleText}`}>Submitted</span>
                          <span className={`text-xs font-kumbh ${t.cardText}`}>
                            {card.dateSubmitted}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className={`border-t ${isDark ? "border-slate-600" : "border-gray-200"} pt-3`}>
                        <ActionButtons isDark={isDark} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`rounded-xl border border-dashed ${isDark ? "border-slate-600 text-slate-400" : "border-gray-300 text-gray-500"} px-4 py-12 text-center text-sm font-kumbh`}>
                  No document inquiries found for the selected filters.
                </div>
              )}

              {/* Card view pagination */}
              {totalPages > 1 && (
                <div className={`flex items-center justify-between pt-4 mt-4 border-t ${isDark ? "border-slate-700" : "border-gray-100"}`}>
                  <p className={`text-xs ${t.subtleText} font-kumbh`}>
                    Showing {(currentPage - 1) * ROWS_PER_PAGE + 1}–
                    {Math.min(currentPage * ROWS_PER_PAGE, filteredCards.length)} of {filteredCards.length} results
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1.5 rounded-lg text-xs font-kumbh font-semibold transition-colors ${
                        currentPage === 1
                          ? isDark ? "text-slate-600 cursor-not-allowed" : "text-gray-300 cursor-not-allowed"
                          : isDark ? "text-slate-300 hover:bg-slate-200 hover:text-slate-800" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-xs font-kumbh font-bold transition-colors ${
                          page === currentPage
                            ? "bg-slate-700 text-white"
                            : isDark ? "text-slate-300 hover:bg-slate-200 hover:text-slate-800" : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1.5 rounded-lg text-xs font-kumbh font-semibold transition-colors ${
                        currentPage === totalPages
                          ? isDark ? "text-slate-600 cursor-not-allowed" : "text-gray-300 cursor-not-allowed"
                          : isDark ? "text-slate-300 hover:bg-slate-200 hover:text-slate-800" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── Table View ──────────────────────────────────────────── */
            <div className="overflow-x-auto px-5 pb-5">
              <table className="w-full text-sm font-kumbh table-fixed">
                <thead>
                  <tr className={`${isDark ? "bg-slate-700 border-y border-slate-600" : "bg-gray-100 border-y border-gray-200"}`}>
                    <th className={`text-center px-3 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase w-[5%]`}>
                      #
                    </th>
                    <th className={`text-left px-4 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase w-[20%]`}>
                      Resident Name
                    </th>
                    <th className={`text-left px-4 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase w-[22%]`}>
                      Document Type
                    </th>
                    <th className={`text-left px-4 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase w-[18%]`}>
                      Reference No.
                    </th>
                    <th className={`text-left px-4 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase w-[15%]`}>
                      Date Submitted
                    </th>
                    <th className={`text-left px-4 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase w-[10%]`}>
                      Status
                    </th>
                    <th className={`text-left px-4 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase w-[10%]`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCards.length > 0 ? (
                    paginatedCards.map((card, index) => (
                      <tr
                        key={card.id}
                        className={`border-b ${t.cardBorder} ${isDark ? "hover:bg-slate-600" : "hover:bg-gray-50"} transition-colors`}
                      >
                        <td className={`text-center px-3 py-3 ${t.cardText}`}>
                          {(currentPage - 1) * ROWS_PER_PAGE + index + 1}
                        </td>
                        <td className={`px-4 py-3 ${t.cardText} truncate`}>
                          {card.residentName}
                        </td>
                        <td className={`px-4 py-3 ${t.cardText} truncate`}>
                          {card.documentType}
                        </td>
                        <td className={`px-4 py-3 ${t.cardText} font-mono text-xs`}>
                          {card.referenceNumber}
                        </td>
                        <td className={`px-4 py-3 ${t.cardText} whitespace-nowrap`}>
                          {card.dateSubmitted}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={card.status} />
                        </td>
                        <td className="px-4 py-3">
                          <ActionButtons isDark={isDark} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className={`px-4 py-8 text-center ${t.subtleText} font-kumbh`}
                      >
                        No document inquiries found for the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Table pagination */}
              {totalPages > 1 && (
                <div className={`flex items-center justify-between pt-4 border-t ${isDark ? "border-slate-700" : "border-gray-100"} mt-2`}>
                  <p className={`text-xs ${t.subtleText} font-kumbh`}>
                    Showing {(currentPage - 1) * ROWS_PER_PAGE + 1}–
                    {Math.min(currentPage * ROWS_PER_PAGE, filteredCards.length)} of {filteredCards.length} results
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1.5 rounded-lg text-xs font-kumbh font-semibold transition-colors ${
                        currentPage === 1
                          ? isDark ? "text-slate-600 cursor-not-allowed" : "text-gray-300 cursor-not-allowed"
                          : isDark ? "text-slate-300 hover:bg-slate-200 hover:text-slate-800" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-xs font-kumbh font-bold transition-colors ${
                          page === currentPage
                            ? "bg-slate-700 text-white"
                            : isDark ? "text-slate-300 hover:bg-slate-200 hover:text-slate-800" : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1.5 rounded-lg text-xs font-kumbh font-semibold transition-colors ${
                        currentPage === totalPages
                          ? isDark ? "text-slate-600 cursor-not-allowed" : "text-gray-300 cursor-not-allowed"
                          : isDark ? "text-slate-300 hover:bg-slate-200 hover:text-slate-800" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DocumentsInquiryPage;
