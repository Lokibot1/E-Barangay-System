import React from 'react';
import { Calendar, MapPin, Home } from 'lucide-react';
import { calculateAge } from '../../../services/sub-system-1/verification';
import StatusBadge from '../common/StatusBadge';

const VerificationRow = ({ res, onReview, t }) => {
  const hNo = res.details?.houseNumber || '';
  const st = res.details?.street || '';
  const fullAddress = `${hNo} ${st}`.trim() || 'N/A';

  const purokDisplay = res.details?.purok && res.details.purok !== 'N/A'
    ? res.details.purok
    : '---';

  return (
    <tr className={`group transition-all hover:${t.inlineBg} ${t.cardText} border-b last:border-none ${t.cardBorder}`}>
      {/* 1. NAME */}
      <td className="px-6 py-5 text-left align-middle">
        <div className="text-sm font-bold leading-tight uppercase tracking-tight font-spartan">
          {res.name}
        </div>
      </td>

      {/* 2. AGE */}
      <td className="px-6 py-5 text-left align-middle">
        <div className="text-sm font-bold font-kumbh">
          {calculateAge(res.details?.birthdate)}
        </div>
      </td>

      {/* 3. ADDRESS */}
      <td className="px-6 py-5 text-left align-middle">
        <div className={`flex items-center gap-2 text-xs ${t.subtleText} font-medium max-w-[200px] font-kumbh`}>
          <Home size={12} className="shrink-0 opacity-60" />
          <span className="truncate">{fullAddress}</span>
        </div>
      </td>

      {/* 4. PUROK */}
      <td className="px-6 py-5 text-left align-middle">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 whitespace-nowrap font-kumbh">
          <MapPin size={12} className="shrink-0" />
          <span className="uppercase">{purokDisplay}</span>
        </div>
      </td>

      {/* 5. SUBMITTED DATE */}
      <td className="px-6 py-5 text-left align-middle">
        <div className={`flex items-center gap-2 text-xs font-bold ${t.subtleText} font-kumbh`}>
          <Calendar size={12} className="text-emerald-600 shrink-0" />
          <span>{res.date}</span>
        </div>
      </td>

      {/* 6. STATUS */}
      <td className="px-6 py-5 text-left align-middle">
        <StatusBadge status={res.status} />
      </td>

      {/* 7. ACTIONS - CENTER FOR HEADER */}
      <td className="px-6 py-5 text-center align-middle">
        <button
          onClick={() => onReview(res)}   
          className={`px-5 py-2 text-[10px] text-center font-black uppercase border ${t.cardBorder} rounded-xl 
          hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black 
          transition-all shadow-sm active:scale-95 font-spartan`}
        >
          Review
        </button>
      </td>
    </tr>
  );
};

export default VerificationRow;