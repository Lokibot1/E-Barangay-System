import React from 'react';
import { Pencil, Eye, Trash2 } from 'lucide-react';
import { SECTOR_STYLES } from '../../../constants/filter';

const ResidentRow = ({ r, onView, onEdit, onDelete, t }) => {
    const displayName = r.name || "Unknown Resident";
    const rawSector = typeof r.sector === 'object' ? r.sector?.name : (r.sectorLabel || r.sector);
    const sectorName = (rawSector || 'GENERAL POPULATION').toUpperCase();
    const isHead = r.household_position?.toLowerCase() === 'head of family';

    return (
        <tr className={`group transition-all hover:${t.inlineBg} ${t.cardText} border-b last:border-none ${t.cardBorder}`}>
            
            {/* 1. NAME & ID - Text Base for Readability */}
            <td className="px-6 py-5 text-left align-middle">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-base font-bold leading-tight uppercase tracking-tight font-spartan">
                            {displayName}
                        </p>
                        {isHead && (
                            <span className={`px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded uppercase border border-emerald-200`}>
                                HEAD
                            </span>
                        )}
                    </div>
                    <p className={`text-xs ${t.subtleText} font-bold mt-1 tracking-widest uppercase font-kumbh`}>
                        ID: {r.barangay_id || 'N/A'}
                    </p>
                </div>
            </td>

            {/* 2. AGE - Centered & Bold */}
            <td className="px-6 py-5 text-center align-middle">
                <div className="text-base font-bold font-kumbh">
                    {r.age}
                </div>
            </td>

            {/* 3. ADDRESS */}
            <td className="px-6 py-5 text-left align-middle">
                <div className={`text-sm ${t.subtleText} font-medium max-w-[250px] font-kumbh uppercase leading-snug`}>
                    {r.full_address || "No Address"}
                </div>
            </td>

            {/* 4. PUROK */}
            <td className="px-6 py-5 text-left align-middle">
                <div className="text-sm font-black text-emerald-600 font-kumbh uppercase">
                    {r.resolved_purok || `Purok ${r.temp_purok_id}`}
                </div>
            </td>

            {/* 5. SECTOR TAG */}
            <td className="px-6 py-5 text-left align-middle">
                <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wide rounded-md border-2 ${SECTOR_STYLES[sectorName] || SECTOR_STYLES['DEFAULT']} font-spartan whitespace-nowrap`}>
                    {sectorName}
                </span>
            </td>

            {/* 6. ACTIONS - Balanced Buttons */}
            <td className="px-6 py-5 text-center align-middle">
                <div className={`flex items-center justify-center border ${t.cardBorder} w-fit mx-auto ${t.cardBg} rounded-xl overflow-hidden shadow-sm`}>
                    <button onClick={() => onView(r)} title="View" className="p-3 text-slate-500 hover:bg-emerald-600 hover:text-white border-r transition-all">
                        <Eye size={18} />
                    </button>
                    <button onClick={() => onEdit(r)} title="Edit" className="p-3 text-slate-500 hover:bg-blue-600 hover:text-white border-r transition-all">
                        <Pencil size={18} />
                    </button>
                    <button onClick={() => onDelete(r.id, displayName)} title="Delete" className="p-3 text-slate-500 hover:bg-rose-600 hover:text-white transition-all">
                        <Trash2 size={18} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default ResidentRow;