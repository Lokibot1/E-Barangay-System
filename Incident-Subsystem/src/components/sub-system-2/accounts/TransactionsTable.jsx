import React, { useMemo, useState } from "react";
import { transactionRequests, totalTransactionCount } from "./data";

const headerClass = "px-4 py-2.5 text-left text-[11px] font-spartan font-bold uppercase tracking-wide text-gray-500";
const cellClass = "px-4 py-2.5 text-left text-sm font-kumbh text-gray-700 border-b border-gray-200";

const statusTabs = ["All", "Pending", "Paid", "Failed", "Refunded"];

const toDate = (dateText) => {
  const [month, day, year] = dateText.split("/").map(Number);
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toAmount = (amountText) => Number(String(amountText || "0").replace(/[^\d.]/g, ""));

const avatarPalette = [
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-teal-500",
  "bg-fuchsia-500",
];

const getInitials = (fullName) => {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "--";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const getAvatarClass = (fullName) => {
  const seed = Array.from(String(fullName || "")).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return avatarPalette[seed % avatarPalette.length];
};

const PaymentStatusBadge = ({ status }) => {
  const styleMap = {
    Pending: "bg-amber-100 text-amber-700 border-amber-200",
    Paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Failed: "bg-red-100 text-red-700 border-red-200",
    Refunded: "bg-sky-100 text-sky-700 border-sky-200",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-kumbh ${styleMap[status] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
      {status}
    </span>
  );
};

const TransactionsTable = () => {
  const [activeStatus, setActiveStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortByDate, setSortByDate] = useState("newest");
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  const statusCounts = useMemo(() => {
    const counts = { All: transactionRequests.length, Pending: 0, Paid: 0, Failed: 0, Refunded: 0 };
    transactionRequests.forEach((item) => {
      if (counts[item.status] !== undefined) {
        counts[item.status] += 1;
      }
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
      if (sortByDate === "amount-desc") {
        return toAmount(b.amount) - toAmount(a.amount);
      }
      if (sortByDate === "type-asc") {
        return a.documentType.localeCompare(b.documentType);
      }
      if (sortByDate === "type-desc") {
        return b.documentType.localeCompare(a.documentType);
      }
      const dateA = toDate(a.date)?.getTime() ?? 0;
      const dateB = toDate(b.date)?.getTime() ?? 0;
      return sortByDate === "oldest" ? dateA - dateB : dateB - dateA;
    });

    return rows;
  }, [activeStatus, searchTerm, startDate, endDate, sortByDate]);

  const selectedRow = useMemo(() => {
    if (!selectedPaymentId) {
      return null;
    }
    return visibleRows.find((row) => row.paymentId === selectedPaymentId) ?? null;
  }, [selectedPaymentId, visibleRows]);

  return (
    <div className="mx-auto max-w-6xl space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {statusTabs.map((tab) => {
          const active = tab === activeStatus;
          return (
            <button
              key={tab}
              onClick={() => setActiveStatus(tab)}
              className={`rounded-md border px-3 py-1.5 text-[11px] font-spartan font-bold uppercase tracking-wide ${active ? "border-slate-700 bg-slate-700 text-white" : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"}`}
            >
              {tab} ({statusCounts[tab] ?? 0})
            </button>
          );
        })}
      </div>

      <div className={`grid grid-cols-1 gap-3 ${selectedRow ? "lg:grid-cols-[minmax(0,1fr)_260px]" : ""}`}>
        <div className="rounded-md border border-gray-200 bg-white p-3">
          <div className="mb-3 grid grid-cols-1 gap-3 xl:grid-cols-12">
            <label className="block xl:col-span-5">
              <span className="mb-1 block text-[10px] font-spartan font-bold uppercase tracking-wide text-gray-500">Search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by type, payee, payment ID..."
                className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm font-kumbh text-gray-700 outline-none placeholder:text-gray-400 focus:border-gray-400"
              />
            </label>

            <label className="block xl:col-span-3">
              <span className="mb-1 block text-[10px] font-spartan font-bold uppercase tracking-wide text-gray-500">Sort</span>
              <select
                value={sortByDate}
                onChange={(e) => setSortByDate(e.target.value)}
                className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm font-kumbh text-gray-700 outline-none focus:border-gray-400"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount-desc">Highest Amount to Lowest</option>
                <option value="type-asc">Document Type (A-Z)</option>
                <option value="type-desc">Document Type (Z-A)</option>
              </select>
            </label>

            <label className="block xl:col-span-2">
              <span className="mb-1 block text-[10px] font-spartan font-bold uppercase tracking-wide text-gray-500">Start Date</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm font-kumbh text-gray-700 outline-none focus:border-gray-400"
              />
            </label>

            <label className="block xl:col-span-2">
              <span className="mb-1 block text-[10px] font-spartan font-bold uppercase tracking-wide text-gray-500">End Date</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm font-kumbh text-gray-700 outline-none focus:border-gray-400"
              />
            </label>
          </div>

          <div className="overflow-x-auto rounded-md border border-gray-200">
            <table className="w-full min-w-[860px] table-fixed">
            <thead className="bg-gray-100">
              <tr>
                <th className={`${headerClass} w-[7%]`}>#</th>
                <th className={`${headerClass} w-[22%]`}>Document Type</th>
                <th className={`${headerClass} w-[15%]`}>Date</th>
                <th className={`${headerClass} w-[22%]`}>Payer</th>
                <th className={`${headerClass} w-[16%]`}>Payment Status</th>
                <th className={`${headerClass} w-[18%]`}>Payment ID</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, index) => {
                const isActive = selectedRow?.paymentId === row.paymentId;
                return (
                  <tr
                    key={`${row.paymentId}-${index}`}
                    onClick={() => setSelectedPaymentId((prev) => (prev === row.paymentId ? null : row.paymentId))}
                    className={`cursor-pointer ${isActive ? "bg-slate-50" : "hover:bg-gray-100"}`}
                  >
                    <td className={cellClass}>{index + 1}</td>
                    <td className={cellClass}>{row.documentType}</td>
                    <td className={cellClass}>{row.date}</td>
                    <td className={cellClass}>{row.payee}</td>
                    <td className={cellClass}><PaymentStatusBadge status={row.status} /></td>
                    <td className={cellClass}>{row.paymentId}</td>
                  </tr>
                );
              })}
              {visibleRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm font-kumbh text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
            </table>
          </div>
        </div>

        {selectedRow && (
          <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-spartan font-bold uppercase tracking-wide text-gray-500">Preview Pane</p>

            <div className="grid grid-cols-1 gap-3">
              <div className="mb-1 flex flex-col items-center justify-center text-center">
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-spartan font-bold text-white ${getAvatarClass(selectedRow.payee)}`}>
                  {getInitials(selectedRow.payee)}
                </span>
                <p className="mt-2 text-[11px] font-spartan font-bold uppercase tracking-wide text-gray-500">Payer</p>
                <p className="text-sm font-kumbh text-gray-700">{selectedRow.payee}</p>
              </div>
              <PreviewField label="Document Type" value={selectedRow.documentType} />
              <PreviewField label="Date" value={selectedRow.date} />
              <PreviewField label="Amount" value={selectedRow.amount ?? "—"} />
              <PreviewField label="Payment ID" value={selectedRow.paymentId} />
              <div>
                <p className="text-[11px] font-spartan font-bold uppercase tracking-wide text-gray-500">Payment Status</p>
                <div className="mt-1"><PaymentStatusBadge status={selectedRow.status} /></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs font-kumbh text-gray-500">Showing {visibleRows.length} of {totalTransactionCount} entries</p>
    </div>
  );
};

const PreviewField = ({ label, value }) => (
  <div>
    <p className="text-[11px] font-spartan font-bold uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-1 text-sm font-kumbh text-gray-700">{value}</p>
  </div>
);

export default TransactionsTable;
