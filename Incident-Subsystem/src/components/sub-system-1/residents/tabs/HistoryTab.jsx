/**
 * HistoryTab.jsx
 *
 * Groups flat history rows (one per changed field) into expandable session cards
 * that match the HouseholdModal HistoryPanel style exactly.
 *
 * Backend returns flat rows from GET /residents/{id}/history.
 * Grouping: same editor + same action_type + within 3 seconds → one card.
 * First card starts open (index === 0), rest start closed.
 */

import React, { useMemo, useState } from 'react';
import {
  History, AlertCircle, Loader2, Clock, User,
  Pencil, Archive, RotateCcw, ChevronDown, ChevronUp,
  MapPin, Home, Phone, Mail, BookOpen, Briefcase, DollarSign,
} from 'lucide-react';

// ── Field labels ──────────────────────────────────────────────────────────────
export const FIELD_LABELS = {
  first_name:              'First Name',
  middle_name:             'Middle Name',
  last_name:               'Last Name',
  suffix:                  'Suffix',
  gender:                  'Gender',
  birthdate:               'Birthdate',
  contact_number:          'Contact Number',
  email:                   'Email Address',
  household_position:      'Position in Family',
  marital_status_id:       'Civil Status',
  nationality_id:          'Nationality',
  sector_id:               'Sector',
  is_voter:                'Voter Status',
  residency_start_date:    'Date of Residency',
  temp_house_number:       'House Number',
  temp_purok_id:           'Purok',
  temp_street_id:          'Street',
  educational_status:      'Educational Status',
  highest_attainment:      'Highest Attainment',
  highest_grade_completed: 'Highest Attainment',
  school_level:            'School Level',
  school_type:             'Institution Type',
  employment_status:       'Employment Status',
  occupation:              'Occupation',
  income_source:           'Income Source',
  monthly_income:          'Monthly Income',
};

// ── Field icon map ─────────────────────────────────────────────────────────────
const FIELD_META = {
  'First Name':       { Icon: User,       color: 'text-slate-500'    },
  'Middle Name':      { Icon: User,       color: 'text-slate-500'    },
  'Last Name':        { Icon: User,       color: 'text-slate-500'    },
  'Suffix':           { Icon: User,       color: 'text-slate-500'    },
  'Contact Number':   { Icon: Phone,      color: 'text-blue-500'     },
  'Email Address':    { Icon: Mail,       color: 'text-blue-500'     },
  'House Number':     { Icon: Home,       color: 'text-slate-500'    },
  'Purok':            { Icon: MapPin,     color: 'text-blue-500'     },
  'Street':           { Icon: Home,       color: 'text-blue-500'     },
  'Educational Status': { Icon: BookOpen,   color: 'text-violet-500' },
  'Highest Attainment': { Icon: BookOpen,   color: 'text-violet-500' },
  'School Level':       { Icon: BookOpen,   color: 'text-violet-500' },
  'Institution Type':   { Icon: BookOpen,   color: 'text-violet-500' },
  'Employment Status':  { Icon: Briefcase,  color: 'text-amber-500'  },
  'Occupation':         { Icon: Briefcase,  color: 'text-amber-500'  },
  'Income Source':      { Icon: DollarSign, color: 'text-emerald-500'},
  'Monthly Income':     { Icon: DollarSign, color: 'text-emerald-500'},
};

const DEFAULT_META = { Icon: Pencil, color: 'text-slate-500' };

// ── Action config ─────────────────────────────────────────────────────────────
const ACTION_META = {
  update:  { label: 'Updated',  Icon: Pencil,    bg: 'bg-blue-50 border-blue-200 text-blue-700'          },
  archive: { label: 'Archived', Icon: Archive,   bg: 'bg-amber-50 border-amber-200 text-amber-700'       },
  restore: { label: 'Restored', Icon: RotateCcw, bg: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
};

const fmtVal = (v) => {
  if (v === null || v === undefined || v === '')
    return <span className="italic text-slate-400 font-normal">empty</span>;
  return v;
};

// ── Group flat rows into sessions ─────────────────────────────────────────────
const groupHistory = (logs) => {
  const groups = [];
  let current  = null;

  logs.forEach(log => {
    const ts = log.created_at ? new Date(log.created_at).getTime() : 0;

    if (
      current &&
      current.editor_name === (log.editor_name || log.edited_by) &&
      current.action_type === log.action_type &&
      Math.abs(ts - current._ts) <= 3000
    ) {
      if (log.field_changed) {
        current.changes.push({
          field:     FIELD_LABELS[log.field_changed] || log.field_changed,
          old_value: log.old_value,
          new_value: log.new_value,
        });
      }
      current._ts = Math.max(current._ts, ts);
    } else {
      current = {
        _key:        log.id || ts,
        _ts:         ts,
        editor_name: log.editor_name || log.edited_by || 'System',
        action_type: log.action_type || 'update',
        edited_at:   log.formatted_created_at || log.edited_at || log.created_at,
        changes:     log.field_changed
          ? [{ field: FIELD_LABELS[log.field_changed] || log.field_changed, old_value: log.old_value, new_value: log.new_value }]
          : [],
      };
      groups.push(current);
    }
  });

  return groups;
};

// ── Single session card — matches HouseholdModal HistoryEntry exactly ─────────
const HistoryEntry = ({ entry, isFirst, t, isDark }) => {
  const [open, setOpen] = useState(isFirst);

  const action  = entry.action_type || 'update';
  const meta    = ACTION_META[action] || ACTION_META.update;
  const hasChanges = action === 'update' && entry.changes.length > 0;

  return (
    <div className={`rounded-2xl border ${t.cardBorder} overflow-hidden`}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors ${t.inlineBg} hover:opacity-80`}
      >
        <div className="flex items-center gap-3">
          {/* Action icon or clock */}
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${meta.bg}`}>
            {hasChanges
              ? <Clock size={13} className="text-slate-400" />
              : <meta.Icon size={13} />
            }
          </div>
          <div>
            <p className={`text-sm font-semibold font-kumbh ${t.cardText}`}>
              {entry.editor_name}
            </p>
            <p className="text-[11px] font-medium text-slate-400 font-kumbh">
              {entry.edited_at}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full font-kumbh ${
              isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'
            }`}>
              {entry.changes.length} field{entry.changes.length !== 1 ? 's' : ''}
            </span>
          )}
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full font-kumbh border ${meta.bg}`}>
            {meta.label}
          </span>
          {open
            ? <ChevronUp size={14} className="text-slate-400" />
            : <ChevronDown size={14} className="text-slate-400" />
          }
        </div>
      </button>

      {open && hasChanges && (
        <div className={`divide-y ${t.cardBorder}`}>
          {entry.changes.map((change, i) => {
            const { Icon, color } = FIELD_META[change.field] || DEFAULT_META;
            return (
              <div key={i} className={`px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 ${t.cardBg}`}>
                <div className="flex items-center gap-2 sm:w-40 shrink-0">
                  <Icon size={13} className={color} />
                  <span className={`text-xs font-bold font-kumbh ${color}`}>{change.field}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-xs font-kumbh font-semibold">
                  <span className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 line-through decoration-rose-400">
                    {fmtVal(change.old_value)}
                  </span>
                  <span className="text-slate-400 font-normal">→</span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
                    {fmtVal(change.new_value)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Non-update actions (archive/restore) — show brief note when expanded */}
      {open && !hasChanges && (
        <div className={`px-4 py-3 ${t.cardBg} border-t ${t.cardBorder}`}>
          <p className={`text-[12px] font-medium ${t.subtleText} font-kumbh`}>
            {action === 'archive' ? 'Resident record was archived.' : 'Resident record was restored.'}
          </p>
        </div>
      )}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const HistoryTab = ({ history, loading, error, onRetry, t, isDark }) => {

  const grouped = useMemo(() => groupHistory(history || []), [history]);

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

  if (!grouped.length) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <History size={38} className={`${t?.subtleText} opacity-30`} />
      <p className={`text-base font-bold ${t?.cardText} font-spartan`}>No edit history yet</p>
      <p className={`text-sm ${t?.subtleText} font-kumbh`}>Changes to this record will appear here.</p>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-300 space-y-3">
      {/* Summary */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-[11px] font-bold uppercase tracking-widest ${t?.subtleText}`}>
          {grouped.length} session{grouped.length !== 1 ? 's' : ''} recorded
        </span>
      </div>

      {/* Session cards */}
      {grouped.map((entry, i) => (
        <HistoryEntry
          key={entry._key || i}
          entry={entry}
          isFirst={i === 0}
          t={t}
          isDark={isDark}
        />
      ))}
    </div>
  );
};

export default HistoryTab;