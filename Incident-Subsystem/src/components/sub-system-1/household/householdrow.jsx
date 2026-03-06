import React from 'react';
import { Eye, Edit2 } from 'lucide-react';
import { SECTOR_STYLES } from '../../../constants/filter';

const HouseholdRow = ({ item, onView, onEdit, t }) => {
  const getTenureColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'owned': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200';
      case 'rented': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200';
      case 'sharer': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200';
      default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200';
    }
  };

  const sectorName = (item.head_sector || '').toUpperCase();
  const isPriority = sectorName.includes('SENIOR') || sectorName.includes('PWD');

  return (
    <tr className={`group transition-all hover:${t.inlineBg} ${t.cardText} border-b last:border-none ${t.cardBorder}`}>
      {/* 1. NAME & ID */}
      <td className="px-6 py-5">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <p className="text-base font-bold uppercase tracking-tight font-spartan truncate">{item.head}</p>
            {isPriority && (
              <span className={`px-2 py-0.5 text-[8px] font-black rounded uppercase border-2 flex-shrink-0 ${SECTOR_STYLES[sectorName] || SECTOR_STYLES['DEFAULT']}`}>
                {sectorName}
              </span>
            )}
          </div>
          <p className={`text-[10px] ${t.subtleText} font-bold mt-1 tracking-widest uppercase font-kumbh`}>ID: {item.id}</p>
        </div>
      </td>

      {/* 2. LOCATION */}
      <td className="px-6 py-5">
        <p className="text-sm font-bold uppercase truncate font-kumbh">{item.address || "No Address"}</p>
        <p className="text-[10px] font-black text-emerald-600 uppercase mt-1 tracking-wider">Purok {item.purok}</p>
      </td>

      {/* 3. CLASSIFICATION */}
      <td className="px-6 py-5 text-left align-middle">
        <div className="flex flex-col gap-1.5">
          <span className={`w-fit px-2.5 py-1 text-[9px] font-black uppercase rounded border-2 ${getTenureColor(item.tenure_status)} font-spartan`}>
            {item.tenure_status || 'N/A'}
          </span>
          {Number(item.is_indigent) === 1 && (
            <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter ml-0.5">• Indigent Unit</span>
          )}
        </div>
      </td>

      {/* 4. MEMBERS */}
      <td className="px-6 py-5 text-center">
        <span className="text-base font-bold font-kumbh">{item.members}</span>
      </td>

      {/* 5. ACTION BUTTONS */}
      <td className="px-6 py-5">
        <div className="flex justify-center gap-2">
          <button
            onClick={() => onView(item)}
            title="View Full Profile" 
            className={`p-3 rounded-xl border ${t.cardBorder} text-slate-400 hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-90`}
          >
            <Eye size={18} />
          </button>
          
          <button
            onClick={() => onEdit(item)}
            title="Edit Household"
            className={`p-3 rounded-xl border ${t.cardBorder} text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90`}
          >
            <Edit2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default HouseholdRow;