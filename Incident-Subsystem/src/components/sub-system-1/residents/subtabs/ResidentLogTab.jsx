/**
 * ResidentLogsTab.jsx
 *
 * Groups flat log rows (one per field) into expandable cards by
 * editor + ~2-second timestamp window — matches HouseholdLogsTab style exactly.
 *
 * Backend returns flat rows: { id, resident_name, editor_name, action_type,
 *   field_changed, old_value, new_value, formatted_created_at, created_at }
 *
 * Client groups them: same editor + same action_type + within 2s → one card.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search, X, ChevronDown, ChevronUp, ScrollText,
  Pencil, Archive, RotateCcw,
  User, MapPin, Home, Phone, Mail, BookOpen, Briefcase, DollarSign,
} from 'lucide-react';
import api from '../../../../services/sub-system-1/Api';
import SkeletonLoader from '../../common/SkeletonLoader';

// ── Field labels ──────────────────────────────────────────────────────────────
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
  highest_attainment:   'Highest Attainment',
  highest_grade_completed: 'Highest Attainment',
  school_level:         'School Level',
  school_type:          'Institution Type',
  employment_status:    'Employment Status',
  occupation:           'Occupation',
  income_source:        'Income Source',
  monthly_income:       'Monthly Income',
};

// ── Field icon map ────────────────────────────────────────────────────────────
const FIELD_META = {
  'First Name':       { Icon: User,      color: 'text-slate-500'    },
  'Middle Name':      { Icon: User,      color: 'text-slate-500'    },
  'Last Name':        { Icon: User,      color: 'text-slate-500'    },
  'Suffix':           { Icon: User,      color: 'text-slate-500'    },
  'Contact Number':   { Icon: Phone,     color: 'text-blue-500'     },
  'Email':            { Icon: Mail,      color: 'text-blue-500'     },
  'House Number':     { Icon: Home,      color: 'text-slate-500'    },
  'Purok':            { Icon: MapPin,    color: 'text-blue-500'     },
  'Street':           { Icon: Home,      color: 'text-blue-500'     },
  'Educational Status': { Icon: BookOpen,  color: 'text-violet-500' },
  'Highest Attainment': { Icon: BookOpen,  color: 'text-violet-500' },
  'School Level':       { Icon: BookOpen,  color: 'text-violet-500' },
  'Institution Type':   { Icon: BookOpen,  color: 'text-violet-500' },
  'Employment Status':  { Icon: Briefcase, color: 'text-amber-500'  },
  'Occupation':         { Icon: Briefcase, color: 'text-amber-500'  },
  'Income Source':      { Icon: DollarSign,color: 'text-emerald-500'},
  'Monthly Income':     { Icon: DollarSign,color: 'text-emerald-500'},
};

const DEFAULT_META = { Icon: Pencil, color: 'text-slate-500' };

// ── Action config ─────────────────────────────────────────────────────────────
const ACTION_CONFIG = {
  update:  { label: 'Updated',  Icon: Pencil,    badge: 'bg-blue-50 border-blue-200 text-blue-700'              },
  archive: { label: 'Archived', Icon: Archive,   badge: 'bg-amber-50 border-amber-200 text-amber-700'           },
  restore: { label: 'Restored', Icon: RotateCcw, badge: 'bg-emerald-50 border-emerald-200 text-emerald-700'     },
};

const fmtVal = (v) => {
  if (v === null || v === undefined || v === '')
    return <span className="italic text-slate-400 font-normal">empty</span>;
  return v;
};

// ── Group flat rows into sessions ─────────────────────────────────────────────
// Same editor + same action_type + within 3s → one grouped entry
const groupLogs = (logs) => {
  const groups = [];
  let current  = null;

  logs.forEach(log => {
    const ts = log.created_at ? new Date(log.created_at).getTime() : 0;

    if (
      current &&
      current.editor_name   === log.editor_name &&
      current.action_type   === log.action_type &&
      current.resident_name === log.resident_name &&
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
        _key:          log.id,
        _ts:           ts,
        resident_name: log.resident_name,
        barangay_id:   log.barangay_id || null,
        editor_name:   log.editor_name,
        action_type:   log.action_type,
        edited_at:     log.formatted_created_at || log.created_at,
        changes:       log.field_changed
          ? [{ field: FIELD_LABELS[log.field_changed] || log.field_changed, old_value: log.old_value, new_value: log.new_value }]
          : [],
      };
      groups.push(current);
    }
  });

  return groups;
};

// ── Single log entry card ─────────────────────────────────────────────────────
const LogEntry = ({ entry, t, isDark }) => {
  const [open, setOpen] = useState(false);

  const action     = entry.action_type || 'update';
  const cfg        = ACTION_CONFIG[action] || ACTION_CONFIG.update;
  const hasChanges = action === 'update' && entry.changes.length > 0;

  return (
    <div className={`rounded-2xl border ${t.cardBorder} overflow-hidden`}>
      <button
        onClick={() => hasChanges && setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors ${
          isDark ? 'hover:bg-slate-900/60' : 'hover:bg-slate-50/80'
        } ${t.inlineBg} ${!hasChanges ? 'cursor-default' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${cfg.badge}`}>
            <cfg.Icon size={13} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`text-sm font-semibold font-kumbh ${t.cardText} truncate`}>
                {entry.resident_name || '—'}
              </p>
              {entry.barangay_id && (
                <span className={`inline-flex shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-bold font-kumbh border ${
                  isDark
                    ? 'border-slate-600 bg-slate-700 text-slate-300'
                    : 'border-slate-200 bg-slate-100 text-slate-500'
                }`}>
                  {entry.barangay_id}
                </span>
              )}
            </div>
            <p className="text-[11px] font-medium text-slate-400 font-kumbh mt-0.5">
              <span className="font-semibold">{entry.editor_name || 'System'}</span> · {entry.edited_at}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-3">
          {hasChanges && (
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full font-kumbh border ${
              isDark ? 'border-slate-600 bg-slate-700 text-slate-300' : 'border-slate-200 bg-slate-100 text-slate-500'
            }`}>
              {entry.changes.length} field{entry.changes.length !== 1 ? 's' : ''}
            </span>
          )}
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full font-kumbh border ${cfg.badge}`}>
            {cfg.label}
          </span>
          {hasChanges && (
            open
              ? <ChevronUp size={14} className="text-slate-400" />
              : <ChevronDown size={14} className="text-slate-400" />
          )}
        </div>
      </button>

      {open && hasChanges && (
        <div className={`divide-y ${t.cardBorder}`}>
          {entry.changes.map((c, i) => {
            const { Icon, color } = FIELD_META[c.field] || DEFAULT_META;
            return (
              <div key={i} className={`px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 ${t.cardBg}`}>
                <div className="flex items-center gap-2 sm:w-40 shrink-0">
                  <Icon size={13} className={color} />
                  <span className={`text-xs font-bold font-kumbh ${color}`}>{c.field}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-xs font-kumbh font-semibold">
                  <span className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 line-through decoration-rose-400">
                    {fmtVal(c.old_value)}
                  </span>
                  <span className="text-slate-400 font-normal">→</span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
                    {fmtVal(c.new_value)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const ResidentLogsTab = ({ t, currentTheme = 'modern' }) => {
  const isDark = currentTheme === 'dark';

  const [logs,         setLogs]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [searchTerm,   setSearchTerm]   = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/residents/logs');
      setLogs(res.data || []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // Group flat rows → sessions
  const grouped = useMemo(() => groupLogs(logs), [logs]);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return grouped.filter(entry => {
      const matchSearch = !q ||
        (entry.resident_name || '').toLowerCase().includes(q) ||
        (entry.editor_name   || '').toLowerCase().includes(q) ||
        (entry.barangay_id   || '').toLowerCase().includes(q) ||
        entry.changes.some(c => (c.field || '').toLowerCase().includes(q));
      const matchAction = actionFilter === 'all' || entry.action_type === actionFilter;
      return matchSearch && matchAction;
    });
  }, [grouped, searchTerm, actionFilter]);

  const pillBase     = 'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[14px] border text-[11px] font-bold font-kumbh transition-all cursor-pointer';
  const pillInactive = isDark
    ? 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500'
    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300';

  const pills = [
    { key: 'all',     label: 'All',      Icon: ScrollText, activeClass: isDark ? 'border-slate-500 bg-slate-700 text-slate-200' : 'border-slate-300 bg-slate-100 text-slate-700' },
    { key: 'update',  label: 'Updates',  Icon: Pencil,     activeClass: 'border-blue-300 bg-blue-50 text-blue-700'             },
    { key: 'archive', label: 'Archived', Icon: Archive,    activeClass: 'border-amber-300 bg-amber-50 text-amber-700'          },
    { key: 'restore', label: 'Restored', Icon: RotateCcw,  activeClass: 'border-emerald-300 bg-emerald-50 text-emerald-700'    },
  ];

  return (
    <>
      {/* ── Search + filter bar ── */}
      <div className={`border-b px-5 py-5 sm:px-6 ${t.cardBorder} ${isDark ? 'bg-slate-950/40' : 'bg-slate-50/80'} space-y-4`}>
        <div className="relative w-full xl:max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
          <input
            type="text"
            placeholder="Search by resident name, barangay ID, or editor..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={`w-full rounded-[18px] border ${t.inputBorder} ${t.inputBg} ${t.inputText} pl-12 pr-11 py-3.5 text-sm font-normal outline-none transition-all focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 ${
              isDark ? 'shadow-none' : 'shadow-[0_12px_24px_rgba(15,23,42,0.06)]'
            } font-kumbh`}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors">
              <X size={16} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {pills.map(({ key, label, Icon, activeClass }) => (
            <button key={key} onClick={() => setActionFilter(key)} className={`${pillBase} ${actionFilter === key ? activeClass : pillInactive}`}>
              <Icon size={11} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Count row ── */}
      <div className={`border-b px-5 py-4 sm:px-6 ${t.cardBorder} ${isDark ? 'bg-slate-950/70' : 'bg-white/70'}`}>
        <div className="flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <span className={`text-sm font-semibold font-kumbh ${t.cardText}`}>
            {loading ? '—' : `${filtered.length} activit${filtered.length !== 1 ? 'ies' : 'y'} logged`}
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="p-5 sm:p-6">
          <SkeletonLoader variant="list" rows={8} isDark={isDark} />
        </div>
      ) : filtered.length > 0 ? (
        <div className="p-5 sm:p-6 space-y-3">
          {filtered.map((entry, i) => (
            <LogEntry key={entry._key || i} entry={entry} t={t} isDark={isDark} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-28 gap-3">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <ScrollText size={28} className="text-slate-300" />
          </div>
          <span className={`text-2xl font-bold ${t.cardText} font-spartan`}>No logs found</span>
          <p className={`max-w-md text-sm leading-7 ${t.subtleText} font-medium font-kumbh text-center`}>
            {searchTerm || actionFilter !== 'all'
              ? 'Try adjusting your filters.'
              : 'Resident edits, archives, and restores will appear here.'}
          </p>
        </div>
      )}
    </>
  );
};

export default ResidentLogsTab;