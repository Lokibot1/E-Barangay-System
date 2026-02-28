import React from 'react';
import { Eye, Trash2, CheckCircle, Clock } from 'lucide-react';

// Helpers for the Avatar
const getInitials = (name) => {
  if (!name) return "??";
  const parts = name.trim().split(' ');
  return parts.length === 1 
    ? parts[0].substring(0, 2).toUpperCase() 
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getAvatarColor = (name) => {
  const colors = [
    'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
    'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400',
    'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const HouseholdRow = ({ item, onView, onDelete }) => {
  // Color coding logic
  const getTenureColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'owned': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
      case 'rented': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400';
      case 'sharer': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <tr className="border-b last:border-none border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all">
      <td className="px-6 py-5 text-base text-emerald-600 font-bold">{item.id}</td>
      
      <td className={`px-6 py-5 font-bold ${item.head === 'No Head Assigned' ? 'text-slate-400 italic' : 'text-slate-900 dark:text-white'}`}>
        {item.head}
      </td>

      <td className="px-6 py-5 text-base text-slate-700 dark:text-slate-300">
        <div className="flex flex-col">
          <span className="truncate max-w-[180px]">{item.address}</span>
          <span className="text-[10px] font-black text-slate-400 uppercase">Purok {item.purok}</span>
        </div>
      </td>
      
      {/* NEW: Tenure Status with Badge */}
      <td className="px-6 py-5">
        <span className={`text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-wider ${getTenureColor(item.tenure_status)}`}>
          {item.tenure_status || 'N/A'}
        </span>
      </td>

      {/* NEW: Wall Material Info */}
      <td className="px-6 py-5 text-xs font-bold text-slate-600 dark:text-slate-400">
        {item.wall_material || '---'}
      </td>

      <td className="px-6 py-5 text-center text-base font-black text-slate-700 dark:text-slate-200">
        {item.members}
      </td>

      <td className="px-6 py-5">
        <button 
          onClick={() => onView(item)} 
          className="p-3 text-slate-600 dark:text-slate-300 hover:bg-emerald-600 hover:text-white border border-slate-300 dark:border-slate-600 rounded-lg transition-all shadow-sm"
        >
          <Eye size={18} />
        </button>
      </td>
    </tr>
  );
};

export default HouseholdRow;