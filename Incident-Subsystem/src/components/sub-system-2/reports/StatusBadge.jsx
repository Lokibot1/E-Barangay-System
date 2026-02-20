import React from "react";

const STATUS_STYLE = {
  Pending: "bg-yellow-300 text-gray-800",
  Approved: "bg-green-400 text-gray-800",
  "For Pickup": "bg-sky-400 text-gray-800",
  Completed: "bg-gray-400 text-gray-900",
  Declined: "bg-red-400 text-gray-900",
};

const StatusBadge = ({ status }) => {
  const style = STATUS_STYLE[status] || "bg-gray-300 text-gray-800";

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-sm font-kumbh ${style}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
