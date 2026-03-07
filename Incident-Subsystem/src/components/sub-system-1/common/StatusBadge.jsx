const verificationAccentMap = {
  modern: { backgroundColor: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' },
  blue: { backgroundColor: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' },
  purple: { backgroundColor: '#faf5ff', color: '#9333ea', borderColor: '#e9d5ff' },
  green: { backgroundColor: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' },
  dark: { backgroundColor: '#334155', color: '#e2e8f0', borderColor: '#475569' },
};

const StatusBadge = ({ status, t, currentTheme = "modern", className = "" }) => {
  const config = {
    'Pending': { backgroundColor: '#fffbeb', color: '#d97706', borderColor: '#fcd34d' },
    'For Verification': { backgroundColor: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' },
    'Verified': { backgroundColor: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' },
    'Rejected': { backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' },
  };

  const activeStyle =
    config[status] ||
    verificationAccentMap[currentTheme] ||
    verificationAccentMap.modern;

  return (
    <span
      className={`px-3 py-1 text-xs font-semibold border rounded-lg shadow-sm font-kumbh ${className}`}
      style={activeStyle}
    >
      {status}
    </span>
  );
};
export default StatusBadge;
