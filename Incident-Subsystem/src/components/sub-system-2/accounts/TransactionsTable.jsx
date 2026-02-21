import React, { useMemo, useState } from "react";
import { transactionRequests, totalTransactionCount } from "./data";

const headerClass = "px-4 py-2.5 text-left text-[11px] font-spartan font-bold uppercase tracking-wide text-gray-500";
const cellClass = "px-4 py-2.5 text-left text-sm font-kumbh text-gray-700 border-b border-gray-200";

const statusTabs = ["All", "Pending", "Success", "Failed", "Refunded"];

const TransactionsTable = () => {
  const [activeStatus, setActiveStatus] = useState("All");

  const statusCounts = useMemo(() => {
    const counts = { All: transactionRequests.length, Pending: 0, Success: 0, Failed: 0, Refunded: 0 };
    transactionRequests.forEach((item) => {
      if (counts[item.status] !== undefined) {
        counts[item.status] += 1;
      }
    });
    return counts;
  }, []);

  const visibleRows = useMemo(() => {
    if (activeStatus === "All") {
      return transactionRequests;
    }
    return transactionRequests.filter((row) => row.status === activeStatus);
  }, [activeStatus]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-[#f8fafc] p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center gap-2">
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

        <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-[10px] font-spartan font-bold uppercase tracking-wide text-gray-500">Search</span>
            <input
              type="text"
              placeholder="Search by type, payee, payment ID..."
              className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm font-kumbh text-gray-700 outline-none placeholder:text-gray-400 focus:border-gray-400"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[10px] font-spartan font-bold uppercase tracking-wide text-gray-500">Start Date</span>
            <input
              type="date"
              className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm font-kumbh text-gray-700 outline-none focus:border-gray-400"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[10px] font-spartan font-bold uppercase tracking-wide text-gray-500">End Date</span>
            <input
              type="date"
              className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm font-kumbh text-gray-700 outline-none focus:border-gray-400"
            />
          </label>
        </div>

        <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
          <table className="w-full min-w-[760px] table-fixed">
            <thead className="bg-gray-100">
              <tr>
                <th className={`${headerClass} w-[8%]`}>#</th>
                <th className={`${headerClass} w-[28%]`}>Document Type</th>
                <th className={`${headerClass} w-[20%]`}>Date</th>
                <th className={`${headerClass} w-[26%]`}>Payee</th>
                <th className={`${headerClass} w-[18%]`}>Payment ID</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, index) => (
                <tr key={`${row.paymentId}-${index}`}>
                  <td className={cellClass}>{index + 1}</td>
                  <td className={cellClass}>{row.documentType}</td>
                  <td className={cellClass}>{row.date}</td>
                  <td className={cellClass}>{row.payee}</td>
                  <td className={cellClass}>{row.paymentId}</td>
                </tr>
              ))}
              {visibleRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm font-kumbh text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs font-kumbh text-gray-500">Showing {visibleRows.length} of {totalTransactionCount} entries</p>
      </div>
    </div>
  );
};

export default TransactionsTable;
