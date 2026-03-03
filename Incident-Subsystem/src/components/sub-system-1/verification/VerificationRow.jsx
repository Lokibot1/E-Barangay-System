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
 
      <td className="px-6 py-5 text-left align-middle">
        <div className="text-base font-bold leading-tight uppercase tracking-tight font-spartan">
          {res.name}
        </div>
      </td>

      <td className="px-6 py-5 text-center align-middle">
        <div className="text-base font-bold font-kumbh">
          {calculateAge(res.details?.birthdate) || '??'}
        </div>
      </td>

      {/* 3. ADDRESS */}
      <td className="px-6 py-5 text-left align-middle">
        <div className={`flex items-center gap-2 text-sm ${t.subtleText} font-medium max-w-[220px] font-kumbh uppercase`}>
          <Home size={14} className="shrink-0 opacity-60 text-emerald-600" />
          <span className="truncate">{fullAddress}</span>
        </div>
      </td>

      {/* 4. PUROK */}
      <td className="px-6 py-5 text-left align-middle">
        <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 whitespace-nowrap font-kumbh">
          <MapPin size={14} className="shrink-0" />
          <span className="uppercase">{purokDisplay}</span>
        </div>
      </td>

      {/* 5. SUBMITTED DATE */}
      <td className="px-6 py-5 text-left align-middle">
        <div className={`flex items-center gap-2 text-xs font-bold ${t.subtleText} font-kumbh uppercase`}>
          <Calendar size={14} className="text-emerald-600 shrink-0" />
          <span>{res.date}</span>
        </div>
      </td>

      {/* 6. STATUS */}
      <td className="px-6 py-5 text-left align-middle">
        <StatusBadge status={res.status} />
      </td>

      {/* 7. ACTION - Centered Header Match */}
      <td className="px-6 py-5 text-center align-middle">
        <button
          onClick={() => onReview(res)}   
          className={`px-6 py-2.5 text-[10px] font-black uppercase border ${t.cardBorder} rounded-xl 
          bg-white dark:bg-slate-800 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black 
          transition-all shadow-sm active:scale-95 font-spartan tracking-widest`}
        >
          Review
        </button>
      </td>
    </tr>
  );
};

export default VerificationRow;