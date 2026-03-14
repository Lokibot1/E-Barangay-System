import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Search, X, RotateCcw, Loader2, ArchiveX, User,
} from 'lucide-react';
import { residentService } from '../../../../services/sub-system-1/residents';
import ResidentArchiveModal from '../ResidentArchiveModal';
import { PUROK_OPTIONS } from '../../../../constants/filter';

// ─────────────────────────────────────────────────────────────────────────────

const ResidentArchivesTab = ({ t, currentTheme = 'modern', onRestore }) => {
    const isDark = currentTheme === 'dark';

    const [archived,         setArchived]         = useState([]);
    const [loading,          setLoading]           = useState(true);
    const [searchTerm,       setSearchTerm]        = useState('');
    const [purokFilter,      setPurokFilter]       = useState('All');
    const [selectedResident, setSelectedResident]  = useState(null);
    const [modalOpen,        setModalOpen]         = useState(false);

    // ── Fetch ─────────────────────────────────────────────────────────────────
    const fetchArchived = useCallback(async () => {
        setLoading(true);
        try {
            const data = await residentService.getArchivedResidents();
            setArchived(data || []);
        } catch {
            setArchived([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchArchived(); }, [fetchArchived]);

    // ── Filtering ─────────────────────────────────────────────────────────────
    const filtered = useMemo(() => archived.filter((r) => {
        const q = searchTerm.toLowerCase();
        const matchSearch =
            (r.name         || '').toLowerCase().includes(q) ||
            (r.barangay_id  || '').toLowerCase().includes(q) ||
            (r.full_address || '').toLowerCase().includes(q);
        const matchPurok = purokFilter === 'All' || String(r.temp_purok_id) === String(purokFilter);
        return matchSearch && matchPurok;
    }), [archived, searchTerm, purokFilter]);

    // ── Restore ───────────────────────────────────────────────────────────────
    const handleRestore = async (id) => {
        const success = await onRestore(id);
        if (success) {
            await fetchArchived();
            setModalOpen(false);
        }
        return success;
    };

    const purokSelectOptions = [
        { value: 'All', label: 'All Puroks' },
        ...PUROK_OPTIONS,
    ];

    const HEADERS = ['Resident & ID', 'Last Address', 'Archived On', 'Archived By', 'Action'];

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading) return (
        <div className={`flex items-center justify-center py-28 ${t.subtleText} font-kumbh`}>
            <Loader2 size={22} className="animate-spin mr-3" />
            <span className="font-black tracking-widest uppercase text-sm">Loading Archives...</span>
        </div>
    );

    return (
        <>
            {/* ── Filters ── */}
            <div className={`border-b px-5 py-5 sm:px-6 ${t.cardBorder} ${isDark ? 'bg-slate-950/40' : 'bg-slate-50/80'}`}>
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                    <div className="relative w-full xl:max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, barangay ID, or address…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full rounded-[18px] border ${t.inputBorder} ${t.inputBg} ${t.inputText} pl-12 pr-11 py-3.5 text-sm font-normal outline-none transition-all focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 ${isDark ? 'shadow-none' : 'shadow-[0_12px_24px_rgba(15,23,42,0.06)]'} font-kumbh`}
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors">
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div className="w-full xl:w-auto">
                        <select
                            value={purokFilter}
                            onChange={(e) => setPurokFilter(e.target.value)}
                            className={`w-full xl:w-44 rounded-[18px] border ${t.inputBorder} ${t.inputBg} ${t.inputText} px-4 py-3.5 text-sm font-kumbh outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 ${isDark ? 'shadow-none' : 'shadow-[0_12px_24px_rgba(15,23,42,0.06)]'}`}
                        >
                            {purokSelectOptions.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* ── Count badge ── */}
            <div className={`border-b px-5 py-4 sm:px-6 ${t.cardBorder} ${isDark ? 'bg-slate-950/70' : 'bg-white/70'}`}>
                <div className="flex items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-rose-500" />
                    <span className={`text-sm font-semibold font-kumbh ${t.cardText}`}>
                        {filtered.length} archived resident{filtered.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="w-full overflow-x-auto">
                <table className="min-w-[1040px] w-full border-separate border-spacing-0">
                    <colgroup>
                        <col style={{ width: '22%' }} />
                        <col style={{ width: '24%' }} />
                        <col style={{ width: '18%' }} />
                        <col style={{ width: '22%' }} />
                        <col style={{ width: '14%' }} />
                    </colgroup>
                    <thead className={`${isDark ? 'bg-slate-900/80' : 'bg-slate-50/80'} backdrop-blur-sm`}>
                        <tr>
                            {HEADERS.map((h) => {
                                const centered = ['Archived On', 'Archived By', 'Action'].includes(h);
                                return (
                                    <th key={h} className={`border-b px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] ${centered ? 'text-center' : 'text-left'} ${t.subtleText} ${t.cardBorder} font-kumbh`}>
                                        {h}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className={t.cardBg}>
                        {filtered.length > 0 ? (
                            filtered.map((r) => (
                                <ArchiveRow
                                    key={r.id}
                                    item={r}
                                    onView={() => { setSelectedResident(r); setModalOpen(true); }}
                                    t={t}
                                    isDark={isDark}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-28 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <ArchiveX size={32} className="text-slate-300" />
                                        <span className={`text-2xl font-bold ${t.cardText} font-spartan`}>No archived residents</span>
                                        <p className={`max-w-md text-sm leading-7 ${t.subtleText} font-medium font-kumbh`}>
                                            {searchTerm ? 'Try a different search term.' : 'Deleted residents will appear here.'}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Restore modal ── */}
            <ResidentArchiveModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                resident={selectedResident}
                onRestore={handleRestore}
                currentTheme={currentTheme}
                t={t}
            />
        </>
    );
};

// ─── Table row ────────────────────────────────────────────────────────────────

const ArchiveRow = ({ item, onView, t, isDark }) => {
    const divider = isDark ? 'border-slate-800/90' : 'border-slate-200';
    const cell    = `border-b ${divider} px-6 py-5 align-middle`;

    // Prefer the resolved log timestamp; fall back to deleted_at
    const archivedAt = item.formatted_archived_at
        || (item.deleted_at
            ? new Date(item.deleted_at).toLocaleDateString('en-PH', {
                year: 'numeric', month: 'short', day: 'numeric',
              })
            : '—');

    const archivedBy = item.archived_by_name || null;

    return (
        <tr
            onClick={onView}
            className={`cursor-pointer transition-colors duration-200 ${t.cardText} ${isDark ? 'hover:bg-slate-900/60' : 'hover:bg-slate-50/80'}`}
        >
            {/* ── Name + Barangay ID ── */}
            <td className={`${cell} text-left`}>
                <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                        <User size={15} className={t.subtleText} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[14px] font-semibold font-kumbh leading-tight truncate">
                            {item.name || 'Unknown'}
                        </p>
                        <p className={`mt-0.5 text-[11px] font-mono ${t.subtleText}`}>
                            {item.barangay_id || 'No ID'}
                        </p>
                    </div>
                </div>
            </td>

            {/* ── Address ── */}
            <td className={`${cell} text-left`}>
                <p className={`text-sm font-normal font-kumbh ${t.subtleText} max-w-[240px] truncate`}>
                    {item.full_address || 'No address'}
                </p>
                {item.resolved_purok && (
                    <span className={`mt-1.5 inline-flex rounded-full px-3 py-1 text-xs font-semibold font-kumbh border ${
                        isDark
                            ? 'border-slate-600 bg-slate-700 text-slate-200'
                            : 'border-blue-200 bg-blue-50 text-blue-700'
                    }`}>
                        {item.resolved_purok}
                    </span>
                )}
            </td>

            {/* ── Archived On ── */}
            <td className={`${cell} text-center`}>
                <span className={`text-sm font-medium font-kumbh ${t.subtleText}`}>
                    {archivedAt}
                </span>
            </td>

            {/* ── Archived By ── */}
            <td className={`${cell} text-center`}>
                {archivedBy ? (
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold font-kumbh border ${
                        isDark
                            ? 'border-rose-800/60 bg-rose-900/20 text-rose-300'
                            : 'border-rose-200 bg-rose-50 text-rose-700'
                    }`}>
                        <User size={10} />
                        {archivedBy}
                    </span>
                ) : (
                    <span className={`text-sm font-medium font-kumbh ${t.subtleText}`}>—</span>
                )}
            </td>

            {/* ── Action ── */}
            <td className={`${cell} text-center`}>
                <button
                    onClick={(e) => { e.stopPropagation(); onView(); }}
                    title="View & restore"
                    className="group inline-flex items-center gap-2 rounded-[18px] border border-emerald-300 px-4 py-3 text-emerald-600 text-xs font-semibold font-kumbh transition-all shadow-sm hover:bg-emerald-600 hover:border-emerald-600 active:scale-90"
                >
                    <RotateCcw size={14} />
                    <span className="group-hover:!text-white">Restore</span>
                </button>
            </td>
        </tr>
    );
};

export default ResidentArchivesTab;
