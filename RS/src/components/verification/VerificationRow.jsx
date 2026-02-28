import React from 'react';
import { Calendar, MapPin, Home } from 'lucide-react';
import { calculateAge } from '../../services/verification'; 
import StatusBadge from '../common/StatusBadge'; 

const VerificationRow = ({ res, onReview }) => {
 
  const hNo = res.details?.houseNumber || '';
  const st = res.details?.address || '';
  const fullAddress = `${hNo} ${st}`.trim() || 'N/A';

  
  const purokDisplay = res.details?.purok && res.details.purok !== 'N/A' 
    ? `${res.details.purok}` 
    : '---';

  return (
    <tr className="border-b last:border-none border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all text-slate-900 dark:text-white">
      {/* 1. NAME */}
      <td className="px-6 py-5">
        <div className="text-base font-bold leading-tight">
          {res.name}
        </div>
      </td>
      
      {/* 2. AGE */}
      <td className="px-6 py-5">
        <div className="text-base font-bold">
          {calculateAge(res.details?.birthdate)}
        </div>
      </td>

      {/* 3. ADDRESS (House No + Street)  */}
      <td className="px-6 py-5">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium truncate max-w-[220px]">
          <Home size={14} className="shrink-0 opacity-60" />
          {fullAddress}
        </div>
      </td>

      {/* 4. PUROK  */}
      <td className="px-6 py-5">
        <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
          <MapPin size={14} />
          {purokDisplay}
        </div>
      </td>

      {/* 5. SUBMITTED DATE */}
      <td className="px-6 py-5">
        <div className="flex items-center gap-2 text-sm font-bold opacity-80">
          <Calendar size={14} className="text-emerald-600" />
          <span>{res.date}</span>
        </div>
      </td>

      {/* 6. STATUS */}
      <td className="px-6 py-5">
        <StatusBadge status={res.status} />
      </td>

      {/* 7. ACTIONS */}
      <td className="px-6 py-5">
        <button 
          onClick={() => onReview(res)} 
          className="px-5 py-2 text-xs font-black uppercase border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-sm active:scale-95"
        >
          Review
        </button>
      </td>
    </tr>
  );
};

export default VerificationRow;