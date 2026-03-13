import React, { useState, useEffect, useMemo } from 'react';
import {
    ScrollText, Search, ChevronLeft, ChevronRight,
    Loader2, AlertCircle, ArrowRight, Archive, RotateCcw, Pencil,
} from 'lucide-react';
import api from '../../../../services/sub-system-1/Api';

// ── Human-readable field labels ───────────────────────────────────────────────
const FIELD_LABELS = {
    first_name:           'First Name',
    middle_name:          'Middle Name',
    last_name:            'Last Name',
    suffix:               'Suffix',
    gender:               'Gender',
    birthdate:            'Birthdate',
    contact_number:       'Contact Number',
    email:                'Email',
    household_position:   'Position in Family',
    marital_status_id:    'Civil Status',
    nationality_id:       'Nationality',
    sector_id:            'Sector',
    is_voter:             'Voter Status',
    residency_start_date: 'Date of Residency',
    temp_house_number:    'House Number',
    temp_purok_id:        'Purok',
    temp_street_id:       'Street',
    educational_status:   'Educational Status',
    highest_attainment:   'Highest Educational Attainment',
    school_level:         'Current School Grade',
    school_type:          'Institution Type',
    employment_status:    'Employment Status',
    occupation:           'Current Occupation',
    income_source:        'Primary Income Source',
    monthly_income:       'Estimated Monthly Income',
};

const ACTION_META = {
    update:  { label: 'Updated',  icon: Pencil,     color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-100'     },
    archive: { label: 'Archived', icon: Archive,    color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-100'   },
    restore: { label: 'Restored', icon: RotateCcw,  color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
};

const ITEMS_PER_PAGE = 15;

// ─────────────────────────────────────────────────────────────────────────────

const ResidentLogsTab = ({ t, currentTheme = 'modern' }) => {
    const [logs,       setLogs]       = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionFilter, setActionFilter] = useState('all');
    const [currentPage,  setCurrentPage]  = useState(1);

    const isDark = currentTheme === 'dark';

    useEffect(() => {
        (async () => {
            setLoading(true); setError(null);
            try {
                const res = await api.get('/residents/logs');
                setLogs(res.data || []);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to load logs.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filtered = useMemo(() => {
        let list = logs;
        if (actionFilter !== 'all') list = list.filter(l => l.action_type === actionFilter);
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            list = list.filter(l =>
                (l.resident_name || '').toLowerCase().includes(q) ||
                (l.editor_name   || '').toLowerCase().includes(q) ||
                (FIELD_LABELS[l.field_changed] || l.field_changed || '').toLowerCase().includes(q)
            );
        }
        return list;
    }, [logs, searchTerm, actionFilter]);

    const totalPages   = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
    const currentItems = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filtered.slice(start, start + ITEMS_PER_PAGE);
    }, [filtered, currentPage]);

    // Reset to page 1 on filter change
    useEffect(() => setCurrentPage(1), [searchTerm, actionFilter]);

    if (loading) return (
        <div className="flex items-center justify-center py-32 gap-3">
            <Loader2 size={22} className={`animate-spin ${t.subtleText}`} />
            <span className={`text-sm font-semibold font-kumbh ${t.subtleText}`}>Loading edit logs…</span>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center py-32 gap-3">
            <AlertCircle size={20} className="text-rose-500" />
            <span className="text-sm font-semibold text-rose-500">{error}</span>
        </div>
    );

    return (
        <div className="p-6 md:p-8 space-y-6 animate-in fade-in duration-300">

            {/* ── Toolbar ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-100 border-slate-200'} border`}>
                        <ScrollText size={18} className={t.subtleText} />
                    </div>
                    <div>
                        <h3 className={`text-sm font-black ${t.cardText} uppercase tracking-widest`}>Edit History</h3>
                        <p className={`text-[11px] ${t.subtleText} font-medium mt-0.5`}>{filtered.length} event{filtered.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Action type filter */}
                    <div className={`flex gap-1 p-1 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                        {['all', 'update', 'archive', 'restore'].map(type => (
                            <button
                                key={type}
                                onClick={() => setActionFilter(type)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                    actionFilter === type
                                        ? `${isDark ? 'bg-slate-600 text-white' : 'bg-white text-slate-800'} shadow-sm`
                                        : `${t.subtleText} hover:text-slate-700`
                                }`}
                            >
                                {type === 'all' ? 'All' : ACTION_META[type]?.label}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className={`relative flex items-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border rounded-2xl px-4 py-2.5 gap-2 w-full sm:w-64 shadow-sm`}>
                        <Search size={14} className={t.subtleText} />
                        <input
                            type="text"
                            placeholder="Search logs…"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className={`flex-1 bg-transparent text-sm font-medium outline-none ${t.cardText}`}
                        />
                    </div>
                </div>
            </div>

            {/* ── Empty state ── */}
            {currentItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <ScrollText size={40} className={`${t.subtleText} opacity-30`} />
                    <p className={`text-base font-bold ${t.cardText} font-spartan`}>No logs found</p>
                    <p className={`text-sm ${t.subtleText} font-kumbh`}>
                        {searchTerm || actionFilter !== 'all' ? 'Try adjusting your filters.' : 'Edit history will appear here as records are changed.'}
                    </p>
                </div>
            )}

            {/* ── Log rows ── */}
            {currentItems.length > 0 && (
                <div className={`border ${t.cardBorder} rounded-2xl overflow-hidden`}>
                    <table className="w-full border-separate border-spacing-0">
                        <thead>
                            <tr className={`${isDark ? 'bg-slate-800/80' : 'bg-slate-50/80'}`}>
                                {['Resident', 'Field', 'Change', 'By', 'Date'].map((h, i) => (
                                    <th key={h}
                                        className={`px-5 py-3.5 text-[10px] font-black uppercase tracking-widest ${t.subtleText} border-b ${t.cardBorder} ${i === 2 ? 'text-center' : 'text-left'}`}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map(log => (
                                <LogRow key={log.id} log={log} t={t} isDark={isDark} />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Pagination ── */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className={`text-[11px] ${t.subtleText} font-kumbh`}>
                        Page {currentPage} of {totalPages} — {filtered.length} total
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-lg border ${t.cardBorder} ${t.cardBg} ${t.subtleText} disabled:opacity-40 hover:border-current transition-all`}
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-lg border ${t.cardBorder} ${t.cardBg} ${t.subtleText} disabled:opacity-40 hover:border-current transition-all`}
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Individual log row ────────────────────────────────────────────────────────
const LogRow = ({ log, t, isDark }) => {
    const meta     = ACTION_META[log.action_type] || ACTION_META.update;
    const ActionIcon = meta.icon;
    const fieldLabel = FIELD_LABELS[log.field_changed] || log.field_changed || '—';

    const date = log.created_at
        ? new Date(log.created_at).toLocaleDateString('en-PH', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })
        : '—';

    const rowHover = isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/60';
    const border   = `border-b ${t.cardBorder}`;

    return (
        <tr className={`${rowHover} transition-colors`}>
            {/* Resident */}
            <td className={`${border} px-5 py-4`}>
                <p className={`text-[13px] font-semibold ${t.cardText} font-kumbh leading-tight`}>{log.resident_name || '—'}</p>
            </td>

            {/* Field */}
            <td className={`${border} px-5 py-4`}>
                {log.action_type === 'update' ? (
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${isDark ? 'border-slate-600 bg-slate-700/60 text-slate-300' : 'border-slate-200 bg-slate-100 text-slate-600'}`}>
                        {fieldLabel}
                    </span>
                ) : (
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${meta.bg} ${meta.color}`}>
                        <ActionIcon size={10} className="inline mr-1" />
                        {meta.label}
                    </span>
                )}
            </td>

            {/* Change */}
            <td className={`${border} px-5 py-4 text-center`}>
                {log.action_type === 'update' ? (
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                        <span className={`text-[11px] font-medium line-through ${isDark ? 'text-slate-400' : 'text-slate-400'} max-w-[120px] truncate`}>
                            {log.old_value || '(empty)'}
                        </span>
                        <ArrowRight size={12} className={t.subtleText} />
                        <span className={`text-[12px] font-bold ${t.cardText} max-w-[120px] truncate`}>
                            {log.new_value || '(empty)'}
                        </span>
                    </div>
                ) : (
                    <span className={`text-[11px] font-medium ${t.subtleText}`}>—</span>
                )}
            </td>

            {/* Editor */}
            <td className={`${border} px-5 py-4`}>
                <span className={`text-[12px] font-semibold ${t.subtleText} font-kumbh`}>{log.editor_name || 'System'}</span>
            </td>

            {/* Date */}
            <td className={`${border} px-5 py-4`}>
                <span className={`text-[11px] font-medium ${t.subtleText} font-kumbh whitespace-nowrap`}>{date}</span>
            </td>
        </tr>
    );
};

export default ResidentLogsTab;