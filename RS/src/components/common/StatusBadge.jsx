const StatusBadge = ({ status }) => {
  const config = {
    'Pending': "bg-orange-50 text-orange-600 border-orange-200",
    'For Verification': "bg-blue-50 text-blue-600 border-blue-200",
    'Verified': "bg-emerald-50 text-emerald-600 border-emerald-200",
    'Rejected': "bg-red-50 text-red-600 border-red-200",
  };

  return (
    <span className={`px-3 py-1 text-[11px] font-black uppercase border rounded-lg shadow-sm ${config[status] || "bg-slate-50 text-slate-500 border-slate-200"}`}>
      {status}
    </span>
  );
};
export default StatusBadge;