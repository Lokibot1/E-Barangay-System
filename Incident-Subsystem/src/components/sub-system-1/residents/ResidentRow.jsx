import React from 'react';
import { Pencil, Eye, Trash2 } from 'lucide-react';
import { SECTOR_STYLES } from '../../../constants/filter';

const ResidentRow = ({ r, onView, onEdit, onDelete, t }) => {
    const displayName = r.name || "Unknown Resident";
    const rawSector = typeof r.sector === 'object' ? r.sector?.name : (r.sectorLabel || r.sector);
    const sectorName = (rawSector || 'GENERAL POPULATION').toUpperCase();

    // Check if Head of Family
    const isHead = r.household_position?.toLowerCase() === 'head of family';

    return (
        <tr className={`group transition-all hover:${t.inlineBg} ${t.cardText} border-b last:border-none ${t.cardBorder}`}>
            
            {/* 1. NAME & ID - Avatar Removed */}
            <td className="px-6 py-5 text-left align-middle">
                <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-bold leading-tight uppercase tracking-tight font-spartan">
                            {displayName}
                        </p>
                        {isHead && (
                            <span className={`px-2 py-0.5 ${t.inlineBg} ${t.subtleText} text-[9px] font-black rounded uppercase tracking-tighter border ${t.cardBorder}`}>
                                HEAD
                            </span>
                        )}
                    </div>
                    <p className={`text-[10px] ${t.subtleText} font-bold mt-1 tracking-widest uppercase font-kumbh`}>
                        {r.barangay_id || 'ID Pending'}
                    </p>
                </div>
            </td>

            {/* 2. AGE */}
            <td className="px-6 py-5 text-left align-middle">
                <div className="text-sm font-bold font-kumbh">
                    {r.age}
                </div>
            </td>

            {/* 3. ADDRESS */}
            <td className="px-6 py-5 text-left align-middle">
                <div className={`text-xs ${t.subtleText} font-medium max-w-[200px] font-kumbh truncate uppercase`}>
                    {r.full_address || "No Address"}
                </div>
            </td>

            {/* 4. PUROK */}
            <td className="px-6 py-5 text-left align-middle">
                <div className="text-sm font-bold text-emerald-600 whitespace-nowrap font-kumbh uppercase">
                    {r.resolved_purok || `Purok ${r.temp_purok_id}`}
                </div>
            </td>

            {/* 5. SECTOR TAG */}
            <td className="px-6 py-5 text-left align-middle">
                <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wide rounded-md border-2 ${SECTOR_STYLES[sectorName] || SECTOR_STYLES['DEFAULT']} font-spartan`}>
                    {sectorName}
                </span>
            </td>

            {/* 6. ACTIONS */}
            <td className="px-6 py-5 text-center align-middle">
                <div className={`flex items-center gap-0 border ${t.cardBorder} w-fit mx-auto ${t.cardBg} rounded-xl overflow-hidden shadow-sm`}>
                    <button
                        onClick={() => onView(r)}
                        title="View Profile"
                        className={`p-3 text-slate-500 hover:bg-emerald-600 hover:text-white border-r ${t.cardBorder} transition-all`}
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={() => onEdit(r)}
                        title="Edit Resident"
                        className={`p-3 text-slate-500 hover:bg-blue-600 hover:text-white border-r ${t.cardBorder} transition-all`}
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(r.id, displayName)}
                        title="Delete Resident"
                        className="p-3 text-slate-500 hover:bg-rose-600 hover:text-white transition-all"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default ResidentRow;