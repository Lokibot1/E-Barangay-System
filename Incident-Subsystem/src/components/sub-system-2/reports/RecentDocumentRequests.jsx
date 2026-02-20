import React from "react";
import { recentDocumentRequests } from "./data";
import StatusBadge from "./StatusBadge";

const headerClass = "px-3 py-2 text-left text-sm font-spartan font-bold text-gray-900";
const cellClass = "px-3 py-3 text-sm font-kumbh text-gray-900 border-b border-gray-300";

const ActionButtons = () => (
  <div className="flex items-center gap-2">
    <button className="h-7 px-2 rounded-md border border-gray-500 text-xs font-kumbh text-gray-700">View</button>
    <button className="h-7 px-2 rounded-md border border-gray-500 text-xs font-kumbh text-gray-700">Print</button>
  </div>
);

const RecentDocumentRequests = () => (
  <div className="bg-[#f5f5f5] rounded-xl p-4">
    <h3 className="font-spartan text-4xl font-bold text-gray-900 mb-3">Recent Document Requests</h3>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px]">
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
          {recentDocumentRequests.map((row, index) => (
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
  </div>
);

export default RecentDocumentRequests;
