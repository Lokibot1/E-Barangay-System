import React from 'react';
import { Pencil, Eye, Trash2 } from 'lucide-react';
import { getInitials, getAvatarColor } from '../../../utils/avatar';
import { SECTOR_STYLES } from '../../../constants/filter';

const ResidentRow = ({ r, onView, onEdit, onDelete, t }) => {
    const displayName = r.name || "Unknown Resident";
    const rawSector = typeof r.sector === 'object' ? r.sector?.name : (r.sectorLabel || r.sector);
    const sectorName = (rawSector || 'GENERAL POPULATION').toUpperCase();

    // Check if Head of Family
    const isHead = r.household_position?.toLowerCase() === 'head of family';

    return (
        <tr className={`border-b last:border-none ${t.cardBorder} hover:${t.inlineBg} transition-all`}>
            <td className="px-6 py-5 flex items-center gap-4">
                <div className={`h-11 w-11 rounded-full border-2 border-white shadow-sm flex items-center justify-center font-bold text-sm ${getAvatarColor(displayName)}`}>
                    {getInitials(displayName)}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <p className={`text-base font-bold ${t.cardText} leading-tight`}>{displayName}</p>
                        {isHead && (
                            <span className={`px-2 py-0.5 ${t.inlineBg} ${t.subtleText} text-[9px] font-black rounded uppercase tracking-tighter border ${t.cardBorder}`}>
                                HEAD
                            </span>
                        )}
                    </div>
                    <p className={`text-sm ${t.subtleText} font-semibold mt-0.5 tracking-tight uppercase`}>
                        {r.barangay_id || 'ID Pending'}
                    </p>
                </div>
            </td>
            <td className={`px-6 py-5 text-base ${t.cardText} font-medium`}>{r.age}</td>
            <td className={`px-6 py-5 text-base ${t.subtleText} truncate max-w-[200px]`}>{r.full_address || "No Address"}</td>
            <td className={`px-6 py-5 text-base font-bold ${t.cardText}`}>{r.resolved_purok || `Purok ${r.temp_purok_id}`}</td>
            <td className="px-6 py-5">
                <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wide rounded-md border-2 ${SECTOR_STYLES[sectorName] || SECTOR_STYLES['DEFAULT']}`}>
                    {sectorName}
                </span>
            </td>
            <td className="px-6 py-5 text-right">
                <div className={`flex items-center gap-0 border ${t.cardBorder} w-fit ${t.cardBg} rounded-lg overflow-hidden shadow-sm`}>
                    <button
                        onClick={() => onView(r)}
                        title="View Profile"
                        className={`p-3 text-slate-600 hover:bg-emerald-600 hover:text-white border-r ${t.cardBorder} transition-all`}
                    >
                        <Eye size={18} />
                    </button>
                    <button
                        onClick={() => onEdit(r)}
                        title="Edit Resident"
                        className={`p-3 text-slate-600 hover:bg-blue-600 hover:text-white border-r ${t.cardBorder} transition-all`}
                    >
                        <Pencil size={18} />
                    </button>
                    <button
                        onClick={() => onDelete(r.id, displayName)}
                        title="Delete Resident"
                        className="p-3 text-slate-600 hover:bg-rose-600 hover:text-white transition-all"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default ResidentRow;
