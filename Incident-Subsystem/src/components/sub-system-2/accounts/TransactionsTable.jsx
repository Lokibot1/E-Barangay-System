import React from "react";
import { transactionRequests, totalTransactionCount } from "./data";

const headerClass = "px-3 py-3 text-center text-sm font-spartan font-bold text-gray-700";
const cellClass = "px-3 py-3 text-center text-sm font-kumbh text-gray-800 border-b border-gray-300";

const TransactionStatus = ({ status }) => {
  const isSuccess = status === "Success";
  return (
    <span
      className={`inline-flex items-center gap-1 text-sm font-kumbh ${isSuccess ? "text-gray-600" : "text-amber-500"}`}
    >
      <span className={`inline-flex h-3 w-3 items-center justify-center rounded-full border text-[8px] ${isSuccess ? "border-gray-500" : "border-amber-500"}`}>
        {isSuccess ? "✓" : "!"}
      </span>
      {status}
    </span>
  );
};

const PaginationButton = ({ label }) => (
  <button className="h-7 min-w-[72px] rounded-full border border-gray-300 px-2.5 text-[11px] font-kumbh text-gray-600 hover:bg-gray-100">
    {label}
  </button>
);

const TransactionsTable = () => (
  <div className="space-y-5">
    <h2 className="font-spartan text-3xl font-bold text-gray-700">Document Services Transactions</h2>

    <div className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-300">
        <p className="font-spartan text-lg font-bold text-gray-700">Recent Transactions</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] table-fixed">
        <colgroup>
          <col className="w-[30%]" />
          <col className="w-[22%]" />
          <col className="w-[20%]" />
          <col className="w-[13%]" />
          <col className="w-[15%]" />
        </colgroup>
        <thead>
          <tr className="bg-white border-b border-gray-300">
            <th className={headerClass}>Name</th>
            <th className={headerClass}>Document Type</th>
            <th className={headerClass}>Payment Method</th>
            <th className={headerClass}>Amount</th>
            <th className={headerClass}>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactionRequests.map((row, index) => (
            <tr key={`${row.name}-${index}`}>
              <td className={cellClass}>{row.name}</td>
              <td className={cellClass}>{row.documentType}</td>
              <td className={cellClass}>{row.paymentMethod}</td>
              <td className={cellClass}>{row.amount}</td>
              <td className={cellClass}><TransactionStatus status={row.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
        <p className="font-kumbh text-sm text-gray-600">Showing 1 to 6 of {totalTransactionCount} entries</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-kumbh text-[11px] text-gray-600">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded border border-gray-400 text-gray-700 bg-white">1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
            <span>...</span>
            <span>10</span>
          </div>
          <PaginationButton label="‹ Back" />
          <PaginationButton label="Next ›" />
        </div>
      </div>
    </div>
  </div>
);

export default TransactionsTable;
