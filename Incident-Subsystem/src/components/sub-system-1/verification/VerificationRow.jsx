import React from 'react';
import { Calendar, MapPin, Home } from 'lucide-react';
import { calculateAge } from '../../../services/sub-system-1/verification';
import StatusBadge from '../common/StatusBadge';

const accentToneMap = {
  modern: {
    iconText: 'text-blue-600',
    accentText: 'text-blue-700',
    button: 'border-blue-200 text-blue-700 hover:border-blue-600 hover:bg-blue-600',
  },
  blue: {
    iconText: 'text-blue-600',
    accentText: 'text-blue-700',
    button: 'border-blue-200 text-blue-700 hover:border-blue-600 hover:bg-blue-600',
  },
  purple: {
    iconText: 'text-purple-600',
    accentText: 'text-purple-700',
    button: 'border-purple-200 text-purple-700 hover:border-purple-600 hover:bg-purple-600',
  },
  green: {
    iconText: 'text-green-600',
    accentText: 'text-green-700',
    button: 'border-green-200 text-green-700 hover:border-green-600 hover:bg-green-600',
  },
  dark: {
    iconText: 'text-slate-300',
    accentText: 'text-slate-200',
    button: 'border-slate-600 text-slate-100 hover:border-slate-500 hover:bg-slate-700',
  },
};

const VerificationRow = ({ res, onReview, t, currentTheme }) => {
  const hNo = res.details?.houseNumber || '';
  const st = res.details?.street || '';
  const fullAddress = `${hNo} ${st}`.trim() || 'N/A';

  const purokDisplay = res.details?.purok && res.details.purok !== 'N/A'
    ? res.details.purok
    : '---';
  const ageDisplay = calculateAge(res.details?.birthdate) || '--';
  const isDark = currentTheme === 'dark';
  const accent = accentToneMap[currentTheme] || accentToneMap.modern;
  const rowDivider = isDark ? 'border-slate-800/90' : 'border-slate-200';
  const cellBase = `border-b ${rowDivider} px-6 py-5 align-middle`;
  const neutralText = isDark ? 'text-slate-300' : 'text-slate-600';
  const nameText = `text-sm font-semibold ${t.cardText} font-kumbh`;
  const bodyText = `text-sm font-medium ${t.cardText} font-kumbh`;
  const metaText = `text-sm font-medium ${neutralText} font-kumbh`;

  return (
    <tr className={`group transition-colors ${isDark ? 'hover:bg-slate-900/60' : 'hover:bg-slate-50/80'}`}>
      <td className={`${cellBase} text-left`}>
        <div className={`${nameText} truncate leading-6`}>
          {res.name}
        </div>
      </td>

      <td className={`${cellBase} text-center`}>
        <span className={`inline-flex min-w-[56px] items-center justify-center ${bodyText}`}>
          {ageDisplay}
        </span>
      </td>

      <td className={`${cellBase} text-left`}>
        <div className={`flex max-w-[260px] items-center gap-2.5 ${bodyText}`}>
          <span className={`shrink-0 ${accent.iconText}`}>
            <Home size={15} strokeWidth={2.1} />
          </span>
          <span className="truncate">{fullAddress}</span>
        </div>
      </td>

      <td className={`${cellBase} text-left`}>
        <span className={`inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium ${accent.accentText} font-kumbh`}>
          <MapPin size={14} strokeWidth={2.1} />
          {purokDisplay}
        </span>
      </td>

      <td className={`${cellBase} text-left`}>
        <span className={`inline-flex items-center gap-2 ${metaText}`}>
          <Calendar size={14} strokeWidth={2.1} />
          {res.date}
        </span>
      </td>

      <td className={`${cellBase} text-left`}>
        <StatusBadge
          status={res.status}
          t={t}
          currentTheme={currentTheme}
          className="rounded-full px-3 py-1 text-[13px] font-medium shadow-none"
        />
      </td>

      <td className={`${cellBase} text-center`}>
        <button
          onClick={() => onReview(res)}   
          className={`inline-flex min-w-[84px] items-center justify-center rounded-[12px] border px-3.5 py-2 text-[13px] font-semibold ${accent.button} hover:text-white transition-all shadow-none active:scale-95 font-kumbh`}
        >
          Review
        </button>
      </td>
    </tr>
  );
};

export default VerificationRow;
