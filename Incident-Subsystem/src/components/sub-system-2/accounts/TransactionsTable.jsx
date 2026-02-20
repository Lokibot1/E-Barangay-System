import React from "react";
import StatusBadge from "../reports/StatusBadge";
import { transactionRequests, totalTransactionCount } from "./data";

const headerClass = "px-3 py-2 text-left text-sm font-spartan font-bold text-gray-900";
const cellClass = "px-3 py-2 text-sm font-kumbh text-gray-900 border-b border-gray-300";

const ActionButtons = () => (
  <div className="flex items-center gap-2">
    <button className="h-7 px-2 rounded-md border border-gray-500 text-xs font-kumbh text-gray-700">View</button>
    <button className="h-7 px-2 rounded-md border border-gray-500 text-xs font-kumbh text-gray-700">Print</button>
  </div>
);

const TransactionsTable = () => (
  <div className="bg-[#f5f5f5] rounded-xl p-4">
    <h3 className="font-spartan text-5xl font-bold text-gray-900 mb-4">Document Requests</h3>

    <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
      <div>
        <p className="font-spartan text-2xl font-bold text-gray-900">Filter by Status</p>
        <p className="font-kumbh text-2xl text-gray-600">Showing: All Statuses</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <select className="h-10 min-w-[190px] rounded-lg border border-gray-500 px-3 font-kumbh text-xl text-gray-800 bg-white">
          <option>All Statuses</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>For Pickup</option>
          <option>Completed</option>
          <option>Declined</option>
        </select>
        <div className="h-10 rounded-lg border border-gray-500 px-3 flex items-center font-kumbh text-xl text-gray-600 bg-white">
          Feb 2026 &nbsp; - &nbsp; Jan 2026
        </div>
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px]">
        <thead>
          <tr className="bg-[#cecece] rounded-xl">
            <th className={headerClass}>Ref No.</th>
            <th className={headerClass}>Resident Name</th>
            <th className={headerClass}>Document Type</th>
            <th className={headerClass}>Date Submitted</th>
            <th className={headerClass}>Status</th>
            <th className={headerClass}>Action</th>
          </tr>
        </thead>
        <tbody>
          {transactionRequests.map((row, index) => (
            <tr key={`${row.refNo}-${index}`}>
              <td className={cellClass}>{row.refNo}</td>
              <td className={cellClass}>{row.residentName}</td>
              <td className={cellClass}>{row.documentType}</td>
              <td className={cellClass}>{row.dateSubmitted}</td>
              <td className={cellClass}><StatusBadge status={row.status} /></td>
              <td className={cellClass}><ActionButtons /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="mt-4 flex items-center justify-between font-kumbh text-xl text-gray-700">
      <p>Showing 1-10 of {totalTransactionCount} entries</p>
      <div className="flex items-center gap-2">
        <span>Showing 1-10 of {totalTransactionCount} entries</span>
        <span>|</span>
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-800 text-white text-sm">1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
      </div>
    </div>
  </div>
);

export default TransactionsTable;
