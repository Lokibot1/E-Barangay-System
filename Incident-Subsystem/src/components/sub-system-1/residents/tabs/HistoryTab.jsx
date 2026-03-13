import React from 'react';
import { History, AlertCircle, Loader2, ArrowRight, Pencil, Archive, RotateCcw, Clock, User } from 'lucide-react';

// ── Human-readable field labels ───────────────────────────────────────────────
// These match the field_changed values stored in residents_update_logs.
export const FIELD_LABELS = {
    first_name:           'First Name',
    middle_name:          'Middle Name',
    last_name:            'Last Name',
    suffix:               'Suffix',
    gender:               'Sex / Gender',
    birthdate:            'Birthdate',
    contact_number:       'Contact Number',
    email:                'Email Address',
    household_position:   'Position in Family',
    marital_status_id:    'Civil Status',
    nationality_id:       'Nationality',
    sector_id:            'Sector / Group',
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
    update:  { label: 'Field Updated', icon: Pencil,    color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-200',         dot: 'bg-blue-500'    },
    archive: { label: 'Archived',      icon: Archive,   color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200',       dot: 'bg-amber-500'   },
    restore: { label: 'Restored',      icon: RotateCcw, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200',   dot: 'bg-emerald-500' },
};

// ── Group logs by date ────────────────────────────────────────────────────────
const groupByDate = (logs) => {
    const groups = {};
    logs.forEach(log => {
        // Use formatted_created_at date portion, or fall back to raw created_at
        const raw = log.formatted_created_at || log.created_at || '';
        // Extract just the date part "Mar 12, 2026" from "Mar 12, 2026 1:25 PM"
        const datePart = raw.includes(',')
            ? raw.split(' ').slice(0, 3).join(' ')   // "Mar 12, 2026"
            : raw.split('T')[0];
        if (!groups[datePart]) groups[datePart] = [];
        groups[datePart].push(log);
    });
    return groups;
};

// ─────────────────────────────────────────────────────────────────────────────

const HistoryTab = ({ history, loading, error, onRetry, t, isDark }) => {

    if (loading) return (
        <div className="flex items-center justify-center py-24 gap-3">
            <Loader2 size={20} className={`animate-spin ${t?.subtleText}`} />
            <span className={`text-sm font-semibold ${t?.subtleText}`}>Loading edit history…</span>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
            <AlertCircle size={22} className="text-rose-500" />
            <p className="text-sm font-semibold text-rose-500">{error}</p>
            <button onClick={onRetry}
                className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 border border-slate-200 px-4 py-2 rounded-xl transition-colors">
                Retry
            </button>
        </div>
    );

    if (!history || history.length === 0) return (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
            <History size={38} className={`${t?.subtleText} opacity-30`} />
            <p className={`text-base font-bold ${t?.cardText} font-spartan`}>No edit history yet</p>
            <p className={`text-sm ${t?.subtleText} font-kumbh`}>Changes to this record will appear here.</p>
        </div>
    );

    const grouped = groupByDate(history);
    const dateKeys = Object.keys(grouped);

    return (
        <div className="animate-in fade-in duration-300 space-y-8">

            {/* Summary pill */}
            <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold uppercase tracking-widest ${t?.subtleText}`}>
                    {history.length} event{history.length !== 1 ? 's' : ''} recorded
                </span>
                <span className={`text-[10px] ${t?.subtleText} opacity-50`}>·</span>
                <span className={`text-[11px] ${t?.subtleText}`}>
                    {dateKeys.length} day{dateKeys.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Timeline grouped by date */}
            {dateKeys.map((dateLabel) => (
                <div key={dateLabel} className="relative">

                    {/* Date header */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest ${
                            isDark
                                ? 'bg-slate-800 border-slate-700 text-slate-300'
                                : 'bg-slate-100 border-slate-200 text-slate-500'
                        }`}>
                            <Clock size={9} />
                            {dateLabel}
                        </div>
                        <div className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                    </div>

                    {/* Log entries for this date */}
                    <div className="space-y-2 pl-2">
                        {grouped[dateLabel].map((log) => {
                            const meta       = ACTION_META[log.action_type] || ACTION_META.update;
                            const ActionIcon = meta.icon;
                            const fieldLabel = FIELD_LABELS[log.field_changed] || log.field_changed || null;

                            return (
                                <div key={log.id}
                                    className={`flex items-start gap-3 p-4 rounded-2xl border transition-colors ${
                                        isDark
                                            ? 'border-slate-700/60 bg-slate-800/30 hover:bg-slate-800/60'
                                            : 'border-slate-100 bg-slate-50/60 hover:bg-slate-50'
                                    }`}>

                                    {/* Action icon badge */}
                                    <div className={`p-2 rounded-xl shrink-0 border ${meta.bg}`}>
                                        <ActionIcon size={13} className={meta.color} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        {log.action_type === 'update' ? (
                                            <>
                                                {/* Field name */}
                                                <p className={`text-[12px] font-black ${t?.cardText} leading-tight`}>
                                                    {fieldLabel || 'Field'} changed
                                                </p>

                                                {/* Old → New values */}
                                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                    <span className={`text-[11px] font-medium max-w-[160px] truncate px-2 py-0.5 rounded-lg ${
                                                        isDark ? 'bg-slate-700/60 text-slate-400 line-through' : 'bg-slate-200/70 text-slate-400 line-through'
                                                    }`}>
                                                        {log.old_value || '(empty)'}
                                                    </span>
                                                    <ArrowRight size={11} className={`${t?.subtleText} shrink-0`} />
                                                    <span className={`text-[12px] font-bold max-w-[160px] truncate px-2 py-0.5 rounded-lg ${
                                                        isDark ? 'bg-slate-700 text-slate-100' : 'bg-white border border-slate-200 text-slate-700'
                                                    }`}>
                                                        {log.new_value || '(empty)'}
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            /* Archive / Restore */
                                            <p className={`text-[12px] font-black ${meta.color} leading-tight`}>
                                                Record {meta.label.toLowerCase()}
                                            </p>
                                        )}

                                        {/* Who + When — full date + time always shown */}
                                        <div className={`flex items-center gap-2 mt-2 flex-wrap`}>
                                            <div className={`flex items-center gap-1 ${t?.subtleText}`}>
                                                <User size={9} />
                                                <span className="text-[10px] font-bold">
                                                    {log.editor_name || 'System'}
                                                </span>
                                            </div>
                                            {log.formatted_created_at && (
                                                <>
                                                    <span className={`text-[9px] ${t?.subtleText} opacity-40`}>·</span>
                                                    <div className={`flex items-center gap-1 ${t?.subtleText}`}>
                                                        <Clock size={9} />
                                                        <span className="text-[10px] font-medium">{log.formatted_created_at}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default HistoryTab;