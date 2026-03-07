import React from 'react';
import { Edit2, Eye } from 'lucide-react';
import { SECTOR_STYLES } from '../../../constants/filter';

const rowAccentMap = {
  modern: {
    primaryText: 'text-blue-700',
    primarySoft: 'border border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    buttonHover: 'hover:bg-blue-600 hover:text-white hover:border-blue-600',
  },
  blue: {
    primaryText: 'text-blue-700',
    primarySoft: 'border border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    buttonHover: 'hover:bg-blue-600 hover:text-white hover:border-blue-600',
  },
  purple: {
    primaryText: 'text-purple-700',
    primarySoft: 'border border-purple-200 bg-purple-50 text-purple-700',
    buttonHover: 'hover:bg-purple-600 hover:text-white hover:border-purple-600',
  },
  green: {
    primaryText: 'text-green-700',
    primarySoft: 'border border-green-200 bg-green-50 text-green-700',
    buttonHover: 'hover:bg-green-600 hover:text-white hover:border-green-600',
  },
  dark: {
    primaryText: 'text-slate-200',
    primarySoft: 'border border-slate-600 bg-slate-700 text-slate-200',
    buttonHover: 'hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300',
  },
};

const formatDisplayText = (value) => {
  if (!value) return 'N/A';

  const normalized = String(value).trim().replace(/\s+/g, ' ');
  const upper = normalized.toUpperCase();

  if (['PWD', 'OFW', 'LGBTQIA+'].includes(upper)) return upper;

  return normalized
    .toLowerCase()
    .replace(/\b([a-z])/g, (match) => match.toUpperCase());
};

const HouseholdRow = ({ item, onView, onEdit, t, currentTheme = 'modern' }) => {
  const accent = rowAccentMap[currentTheme] || rowAccentMap.modern;
  const isDark = currentTheme === 'dark';
  const rowDivider = isDark ? 'border-slate-800/90' : 'border-slate-200';
  const cellBase = `border-b ${rowDivider} px-6 py-5 align-middle`;
  const getTenureColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'owned':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200';
      case 'rented':
        return accent.primarySoft;
      case 'sharer':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200';
    }
  };

  const sectorName = (item.head_sector || '').toUpperCase();
  const isPriority = sectorName.includes('SENIOR') || sectorName.includes('PWD');
  const displayHead = formatDisplayText(item.head || 'No head assigned');
  const displayAddress = formatDisplayText(item.address || 'No address');
  const displaySector = formatDisplayText(sectorName);
  const displayTenure = formatDisplayText(item.tenure_status || 'N/A');

  return (
    <tr className={`group transition-colors duration-200 ${t.cardText} ${isDark ? 'hover:bg-slate-900/60' : 'hover:bg-slate-50/80'}`}>
      <td className={`${cellBase} text-left`}>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[15px] font-semibold leading-tight font-kumbh">
              {displayHead}
            </p>
            {isPriority && (
              <span
                className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-semibold border flex-shrink-0 font-kumbh ${SECTOR_STYLES[sectorName] || SECTOR_STYLES.DEFAULT}`}
              >
                {displaySector}
              </span>
            )}
          </div>
          <p className={`mt-1 text-[12px] ${t.subtleText} font-medium font-kumbh`}>
            ID: {item.id}
          </p>
        </div>
      </td>

      <td className={`${cellBase} text-left`}>
        <p className={`max-w-[260px] text-sm font-normal leading-6 font-kumbh ${t.subtleText}`}>
          {displayAddress}
        </p>
        <span className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold font-kumbh ${accent.primarySoft}`}>
          Purok {item.purok}
        </span>
      </td>

      <td className={`${cellBase} text-left`}>
        <div className="flex flex-col gap-1.5">
          <span className={`w-fit rounded-full px-3 py-1.5 text-[11px] font-semibold border ${getTenureColor(item.tenure_status)} font-kumbh`}>
            {displayTenure}
          </span>
          {Number(item.is_indigent) === 1 && (
            <span className="text-[11px] font-medium text-rose-500 font-kumbh ml-0.5">
              Indigent unit
            </span>
          )}
        </div>
      </td>

      <td className={`${cellBase} text-center`}>
        <span className="text-[1.05rem] font-semibold font-kumbh">{item.members}</span>
      </td>

      <td className={`${cellBase} text-center`}>
        <div className="flex justify-center gap-2">
          <button
            onClick={() => onView(item)}
            title="View household profile"
            className={`rounded-[18px] border ${t.cardBorder} px-4 py-3 text-slate-500 transition-all shadow-[0_10px_20px_rgba(15,23,42,0.06)] active:scale-90 ${accent.buttonHover}`}
          >
            <Eye size={16} />
          </button>

          {onEdit && (
            <button
              onClick={() => onEdit(item)}
              title="Edit household"
              className={`rounded-[18px] border ${t.cardBorder} px-4 py-3 text-slate-500 transition-all shadow-[0_10px_20px_rgba(15,23,42,0.06)] active:scale-90 ${
                isDark ? 'hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300' : 'hover:bg-slate-700 hover:text-white hover:border-slate-700'
              }`}
            >
              <Edit2 size={16} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default HouseholdRow;
