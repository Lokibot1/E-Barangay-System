import React from 'react';
import { Pencil, Eye, Trash2, ExternalLink } from 'lucide-react';
import { SECTOR_STYLES } from '../../../constants/filter';

const rowAccentMap = {
    modern: {
        primaryText: 'text-blue-700',
        primarySoft: 'border border-blue-200 bg-blue-50 text-blue-700',
        buttonHover: 'hover:bg-blue-600 hover:text-white hover:border-blue-600',
        linkHover:   'hover:text-blue-700 hover:underline',
    },
    blue: {
        primaryText: 'text-blue-700',
        primarySoft: 'border border-blue-200 bg-blue-50 text-blue-700',
        buttonHover: 'hover:bg-blue-600 hover:text-white hover:border-blue-600',
        linkHover:   'hover:text-blue-700 hover:underline',
    },
    purple: {
        primaryText: 'text-purple-700',
        primarySoft: 'border border-purple-200 bg-purple-50 text-purple-700',
        buttonHover: 'hover:bg-purple-600 hover:text-white hover:border-purple-600',
        linkHover:   'hover:text-purple-700 hover:underline',
    },
    green: {
        primaryText: 'text-green-700',
        primarySoft: 'border border-green-200 bg-green-50 text-green-700',
        buttonHover: 'hover:bg-green-600 hover:text-white hover:border-green-600',
        linkHover:   'hover:text-green-700 hover:underline',
    },
    dark: {
        primaryText: 'text-slate-200',
        primarySoft: 'border border-slate-700 bg-slate-800 text-slate-200',
        buttonHover: 'hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300',
        linkHover:   'hover:text-slate-100 hover:underline',
    },
};

/**
 * ResidentRow
 *
 * Props
 * ─────
 * onHouseholdClick(householdId) — called when the address or purok badge is
 *   clicked. Pass null / undefined to disable the link behaviour (renders
 *   plain text instead of a clickable element).
 */
const ResidentRow = ({ r, onView, onEdit, onDelete, onHouseholdClick, t, currentTheme = 'modern' }) => {
    const accent = rowAccentMap[currentTheme] || rowAccentMap.modern;
    const isDark  = currentTheme === 'dark';
    const rowDivider = isDark ? 'border-slate-800/90' : 'border-slate-200';
    const cellBase   = `border-b ${rowDivider} px-6 py-5 align-middle`;

    const displayName = r.name || 'Unknown Resident';
    const rawSector   = typeof r.sector === 'object' ? r.sector?.name : (r.sectorLabel || r.sector);
    const sectorKey   = (rawSector || 'GENERAL POPULATION').toUpperCase();
    const sectorName  = rawSector || 'General population';
    const isHead      = r.household_position?.toLowerCase() === 'head of family';

    // Whether clicking address/purok should open the household modal
    const canLinkHousehold = typeof onHouseholdClick === 'function' && r.household_id;

    const handleHouseholdClick = (e) => {
        e.stopPropagation();
        if (canLinkHousehold) onHouseholdClick(r.household_id);
    };

    return (
        <tr className={`group transition-colors duration-200 ${t.cardText} ${isDark ? 'hover:bg-slate-900/60' : 'hover:bg-slate-50/80'}`}>

            {/* ── Name ── */}
            <td className={`${cellBase} text-left`}>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[15px] font-semibold leading-tight font-kumbh">
                            {displayName}
                        </p>
                        {isHead && (
                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                                Head
                            </span>
                        )}
                    </div>
                    <p className={`mt-1 text-[12px] ${t.subtleText} font-medium font-kumbh`}>
                        ID: {r.barangay_id || 'N/A'}
                    </p>
                </div>
            </td>

            {/* ── Age ── */}
            <td className={`${cellBase} text-center`}>
                <div className="text-[1.05rem] font-semibold font-kumbh">
                    {r.age}
                </div>
            </td>

            {/* ── Address — clickable if resident has a household ── */}
            <td className={`${cellBase} text-left`}>
                {canLinkHousehold ? (
                    <button
                        type="button"
                        onClick={handleHouseholdClick}
                        title="View household"
                        className={`group/addr flex items-start gap-1.5 text-left max-w-[300px] transition-colors ${accent.linkHover}`}
                    >
                        <span className={`text-sm ${t.subtleText} group-hover/addr:${accent.primaryText} font-normal font-kumbh leading-6 transition-colors`}>
                            {r.full_address || 'No Address'}
                        </span>
                        <ExternalLink
                            size={11}
                            className={`mt-1.5 shrink-0 opacity-0 group-hover/addr:opacity-70 transition-opacity ${accent.primaryText}`}
                        />
                    </button>
                ) : (
                    <div className={`max-w-[300px] text-sm ${t.subtleText} font-normal font-kumbh leading-6`}>
                        {r.full_address || 'No Address'}
                    </div>
                )}
            </td>

            {/* ── Purok — clickable if resident has a household ── */}
            <td className={`${cellBase} text-left`}>
                {canLinkHousehold ? (
                    <button
                        type="button"
                        onClick={handleHouseholdClick}
                        title="View household"
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold font-kumbh transition-all ${accent.primarySoft} hover:shadow-sm active:scale-95`}
                    >
                        {r.resolved_purok || `Purok ${r.temp_purok_id}`}
                        <ExternalLink size={10} className="opacity-60" />
                    </button>
                ) : (
                    <div className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold font-kumbh ${accent.primarySoft}`}>
                        {r.resolved_purok || `Purok ${r.temp_purok_id}`}
                    </div>
                )}
            </td>

            {/* ── Sector ── */}
            <td className={`${cellBase} text-left`}>
                <span className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-semibold border ${SECTOR_STYLES[sectorKey] || SECTOR_STYLES['DEFAULT']} font-kumbh whitespace-nowrap`}>
                    {sectorName}
                </span>
            </td>

            {/* ── Actions ── */}
            <td className={`${cellBase} text-center`}>
                <div className={`mx-auto flex w-fit items-center justify-center overflow-hidden rounded-[18px] border ${t.cardBorder} ${t.cardBg} shadow-[0_10px_20px_rgba(15,23,42,0.06)]`}>
                    <button onClick={() => onView(r)}  title="View"   className={`border-r px-4 py-3 text-slate-500 transition-all ${accent.buttonHover}`}><Eye    size={16} /></button>
                    <button onClick={() => onEdit(r)}  title="Edit"   className={`border-r px-4 py-3 text-slate-500 transition-all ${accent.buttonHover}`}><Pencil size={16} /></button>
                    <button onClick={() => onDelete(r.id, displayName)} title="Delete" className="px-4 py-3 text-slate-500 hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={16} /></button>
                </div>
            </td>
        </tr>
    );
};

export default ResidentRow;