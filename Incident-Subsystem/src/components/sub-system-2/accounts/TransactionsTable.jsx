import React, { useMemo, useState, useEffect } from "react";
import { transactionRequests, totalTransactionCount } from "./data";
import themeTokens from "../../../Themetokens";

const ROWS_PER_PAGE = 10;

const statusTabs = ["All", "Pending", "Paid", "Failed", "Refunded"];

const STATUS_TAB_CONFIG = {
  All:      { bg: "bg-gray-700",    text: "text-white", border: "border-gray-700" },
  Pending:  { bg: "bg-amber-500",   text: "text-white", border: "border-amber-500" },
  Paid:     { bg: "bg-emerald-600", text: "text-white", border: "border-emerald-600" },
  Failed:   { bg: "bg-red-600",     text: "text-white", border: "border-red-600" },
  Refunded: { bg: "bg-sky-500",     text: "text-white", border: "border-sky-500" },
};

const toDate = (dateText) => {
  const [month, day, year] = dateText.split("/").map(Number);
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toAmount = (amountText) =>
  Number(String(amountText || "0").replace(/[^\d.]/g, ""));

const avatarPalette = [
  "bg-indigo-500", "bg-emerald-500", "bg-rose-500", "bg-amber-500",
  "bg-sky-500",    "bg-violet-500",  "bg-teal-500", "bg-fuchsia-500",
];

const getInitials = (fullName) => {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "--";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const getAvatarClass = (fullName) => {
  const seed = Array.from(String(fullName || "")).reduce(
    (sum, ch) => sum + ch.charCodeAt(0),
    0,
  );
  return avatarPalette[seed % avatarPalette.length];
};

const PaymentStatusBadge = ({ status }) => {
  const styleMap = {
    Pending:  "bg-amber-100 text-amber-700 border-amber-200",
    Paid:     "bg-emerald-100 text-emerald-700 border-emerald-200",
    Failed:   "bg-red-100 text-red-700 border-red-200",
    Refunded: "bg-sky-100 text-sky-700 border-sky-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-kumbh ${styleMap[status] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}
    >
      {status}
    </span>
  );
};

const PreviewField = ({ label, value, isDark, t }) => (
  <div>
    <p className={`text-[11px] font-spartan font-bold uppercase tracking-wide ${t.subtleText}`}>
      {label}
    </p>
    <p className={`mt-1 text-sm font-kumbh ${t.cardText}`}>{value}</p>
  </div>
);

const TransactionsTable = () => {
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("appTheme") || "blue",
  );

  useEffect(() => {
    const handler = (e) => setCurrentTheme(e.detail);
    window.addEventListener("themeChange", handler);
    return () => window.removeEventListener("themeChange", handler);
  }, []);

  const t = themeTokens[currentTheme] || themeTokens.blue;
  const isDark = currentTheme === "dark";

  const [activeStatus, setActiveStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortByDate, setSortByDate] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  const statusCounts = useMemo(() => {
    const counts = { All: transactionRequests.length, Pending: 0, Paid: 0, Failed: 0, Refunded: 0 };
    transactionRequests.forEach((item) => {
      if (counts[item.status] !== undefined) counts[item.status] += 1;
    });
    return counts;
  }, []);

  const visibleRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);

    const rows = transactionRequests.filter((row) => {
      const rowDate = toDate(row.date);
      const matchesStatus = activeStatus === "All" || row.status === activeStatus;
      const matchesSearch =
        query.length === 0 ||
        row.documentType.toLowerCase().includes(query) ||
        row.payee.toLowerCase().includes(query) ||
        row.paymentId.toLowerCase().includes(query);
      const matchesStart = !start || (rowDate && rowDate >= start);
      const matchesEnd = !end || (rowDate && rowDate <= end);
      return matchesStatus && matchesSearch && matchesStart && matchesEnd;
    });

    rows.sort((a, b) => {
      if (sortByDate === "amount-desc") return toAmount(b.amount) - toAmount(a.amount);
      if (sortByDate === "type-asc") return a.documentType.localeCompare(b.documentType);
      if (sortByDate === "type-desc") return b.documentType.localeCompare(a.documentType);
      const dateA = toDate(a.date)?.getTime() ?? 0;
      const dateB = toDate(b.date)?.getTime() ?? 0;
      return sortByDate === "oldest" ? dateA - dateB : dateB - dateA;
    });

    return rows;
  }, [activeStatus, searchTerm, startDate, endDate, sortByDate]);

  const totalPages = Math.ceil(visibleRows.length / ROWS_PER_PAGE);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return visibleRows.slice(start, start + ROWS_PER_PAGE);
  }, [visibleRows, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeStatus, searchTerm, startDate, endDate, sortByDate]);

  const selectedRow = useMemo(() => {
    if (!selectedPaymentId) return null;
    return visibleRows.find((row) => row.paymentId === selectedPaymentId) ?? null;
  }, [selectedPaymentId, visibleRows]);

  return (
    <div className={`min-h-full ${t.pageBg} pb-10`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── Page Header ─────────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className={`w-12 h-12 ${isDark ? "bg-slate-700" : "bg-gray-200"} rounded-lg flex items-center justify-center`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className={`w-7 h-7 ${isDark ? "text-slate-300" : "text-gray-600"}`}
              strokeWidth="2"
            >
              <path d="M8 7h8M8 11h8M8 15h5" />
              <rect x="4" y="3" width="16" height="18" rx="2" />
            </svg>
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-bold ${t.cardText} font-spartan uppercase flex-1`}
          >
            Payments Management
          </h1>
        </div>

        {/* ── Content Grid (table + optional preview pane) ─────────── */}
        <div
          className={`grid grid-cols-1 gap-6 ${selectedRow ? "lg:grid-cols-[minmax(0,1fr)_280px]" : ""}`}
        >
          {/* ── Table Card ─────────────────────────────────────────── */}
          <div
            className={`${t.cardBg} border ${t.cardBorder} rounded-2xl shadow-lg overflow-hidden`}
          >
            {/* Status Tabs */}
            <div className="flex flex-wrap gap-2 px-5 pt-5">
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

            {/* Search + Filters */}
            <div className="px-5 pt-5 pb-3">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <label
                    className={`block text-xs font-semibold ${t.subtleText} mb-1.5 font-kumbh uppercase`}
                  >
                    Search
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by type, payee, payment ID..."
                    className={`w-full px-4 py-2.5 rounded-lg border ${t.cardBorder} ${t.cardBg} ${t.cardText} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-kumbh`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-semibold ${t.subtleText} mb-1.5 font-kumbh uppercase`}
                  >
                    Sort
                  </label>
                  <select
                    value={sortByDate}
                    onChange={(e) => setSortByDate(e.target.value)}
                    className={`px-4 py-2.5 rounded-lg border ${t.cardBorder} ${t.cardBg} ${t.cardText} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-kumbh`}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="amount-desc">Highest Amount</option>
                    <option value="type-asc">Document Type (A-Z)</option>
                    <option value="type-desc">Document Type (Z-A)</option>
                  </select>
                </div>
                <div>
                  <label
                    className={`block text-xs font-semibold ${t.subtleText} mb-1.5 font-kumbh uppercase`}
                  >
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
                  <label
                    className={`block text-xs font-semibold ${t.subtleText} mb-1.5 font-kumbh uppercase`}
                  >
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

            {/* Table */}
            <div className="overflow-x-auto px-5 pb-5">
              <table className="w-full text-sm font-kumbh table-fixed">
                <thead>
                  <tr
                    className={`${isDark ? "bg-slate-700 border-y border-slate-600" : "bg-gray-100 border-y border-gray-200"}`}
                  >
                    <th
                      className={`text-center px-3 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase w-[6%]`}
                    >
                      #
                    </th>
                    <th
                      className={`text-left px-4 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase w-[24%]`}
                    >
                      Document Type
                    </th>
                    <th
                      className={`text-left px-4 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase w-[15%]`}
                    >
                      Date
                    </th>
                    <th
                      className={`text-left px-4 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase w-[22%]`}
                    >
                      Payer
                    </th>
                    <th
                      className={`text-left px-4 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase w-[15%]`}
                    >
                      Status
                    </th>
                    <th
                      className={`text-left px-4 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase w-[18%]`}
                    >
                      Payment ID
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.length > 0 ? (
                    paginatedRows.map((row, index) => {
                      const isActive = selectedRow?.paymentId === row.paymentId;
                      return (
                        <tr
                          key={`${row.paymentId}-${index}`}
                          onClick={() =>
                            setSelectedPaymentId((prev) =>
                              prev === row.paymentId ? null : row.paymentId,
                            )
                          }
                          className={`border-b ${t.cardBorder} transition-colors cursor-pointer ${
                            isActive
                              ? isDark ? "bg-slate-600" : "bg-slate-50"
                              : isDark ? "hover:bg-slate-600" : "hover:bg-gray-50"
                          }`}
                        >
                          <td className={`text-center px-3 py-3 ${t.cardText}`}>
                            {(currentPage - 1) * ROWS_PER_PAGE + index + 1}
                          </td>
                          <td className={`text-left px-4 py-3 ${t.cardText} truncate`}>
                            {row.documentType}
                          </td>
                          <td className={`text-left px-4 py-3 ${t.cardText} whitespace-nowrap`}>
                            {row.date}
                          </td>
                          <td className={`text-left px-4 py-3 ${t.cardText} truncate`}>
                            {row.payee}
                          </td>
                          <td className="text-left px-4 py-3">
                            <PaymentStatusBadge status={row.status} />
                          </td>
                          <td className={`text-left px-4 py-3 font-bold ${t.cardText}`}>
                            {row.paymentId}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className={`px-4 py-8 text-center ${t.subtleText} font-kumbh`}
                      >
                        No transactions found for the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  className={`flex items-center justify-between pt-4 border-t ${isDark ? "border-slate-700" : "border-gray-100"} mt-2`}
                >
                  <p className={`text-xs ${t.subtleText} font-kumbh`}>
                    Showing {(currentPage - 1) * ROWS_PER_PAGE + 1}–
                    {Math.min(currentPage * ROWS_PER_PAGE, visibleRows.length)} of{" "}
                    {visibleRows.length} results
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1.5 rounded-lg text-xs font-kumbh font-semibold transition-colors ${
                        currentPage === 1
                          ? isDark
                            ? "text-slate-600 cursor-not-allowed"
                            : "text-gray-300 cursor-not-allowed"
                          : isDark
                            ? "text-slate-300 hover:bg-slate-200 hover:text-slate-800"
                            : "text-gray-600 hover:bg-gray-100"
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
                            : isDark
                              ? "text-slate-300 hover:bg-slate-200 hover:text-slate-800"
                              : "text-gray-600 hover:bg-gray-100"
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
                          ? isDark
                            ? "text-slate-600 cursor-not-allowed"
                            : "text-gray-300 cursor-not-allowed"
                          : isDark
                            ? "text-slate-300 hover:bg-slate-200 hover:text-slate-800"
                            : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Row count */}
              {totalPages <= 1 && (
                <p className={`pt-3 text-xs ${t.subtleText} font-kumbh`}>
                  Showing {visibleRows.length} of {totalTransactionCount} entries
                </p>
              )}
            </div>
          </div>

          {/* ── Preview Pane ──────────────────────────────────────────── */}
          {selectedRow && (
            <div
              className={`${t.cardBg} border ${t.cardBorder} rounded-2xl shadow-lg p-5 self-start`}
            >
              <p
                className={`mb-4 text-xs font-spartan font-bold uppercase tracking-wide ${t.subtleText} border-b ${t.cardBorder} pb-3`}
              >
                Preview
              </p>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col items-center text-center mb-1">
                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-spartan font-bold text-white ${getAvatarClass(selectedRow.payee)}`}
                  >
                    {getInitials(selectedRow.payee)}
                  </span>
                  <p className={`mt-2 text-[11px] font-spartan font-bold uppercase tracking-wide ${t.subtleText}`}>
                    Payer
                  </p>
                  <p className={`text-sm font-kumbh ${t.cardText}`}>{selectedRow.payee}</p>
                </div>
                <PreviewField label="Document Type" value={selectedRow.documentType} isDark={isDark} t={t} />
                <PreviewField label="Date" value={selectedRow.date} isDark={isDark} t={t} />
                <PreviewField label="Amount" value={selectedRow.amount ?? "—"} isDark={isDark} t={t} />
                <PreviewField label="Payment ID" value={selectedRow.paymentId} isDark={isDark} t={t} />
                <div>
                  <p className={`text-[11px] font-spartan font-bold uppercase tracking-wide ${t.subtleText}`}>
                    Payment Status
                  </p>
                  <div className="mt-1">
                    <PaymentStatusBadge status={selectedRow.status} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TransactionsTable;
