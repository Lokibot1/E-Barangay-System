import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search, X, ChevronDown, ChevronUp, Loader2, ScrollText,
  Pencil, Trash2, RotateCcw, Landmark, Home, FileText, Layers, User, UsersRound
} from 'lucide-react';
import { householdService } from '../../../../services/sub-system-1/household';

// ─── Action badge config ──────────────────────────────────────────────────────

const ACTION_CONFIG = {
  edit: {
    label: 'Edited',
    Icon:  Pencil,
    badge: 'bg-blue-50 border-blue-200 text-blue-700',
    dot:   'bg-blue-500',
  },
  deactivate: {
    label: 'Deactivated',
    Icon:  Trash2,
    badge: 'bg-rose-50 border-rose-200 text-rose-700',
    dot:   'bg-rose-500',
  },
  restore: {
    label: 'Restored',
    Icon:  RotateCcw,
    badge: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    dot:   'bg-emerald-500',
  },
};

// ─── Field meta ───────────────────────────────────────────────────────────────

const FIELD_META = {
  'Purok':         { Icon: Landmark, color: 'text-blue-500'  },
  'Street':        { Icon: Home,     color: 'text-blue-500'  },
  'House Number':  { Icon: Home,     color: 'text-slate-500' },
  'Tenure Status': { Icon: FileText, color: 'text-amber-500' },
  'Wall Material': { Icon: Layers,   color: 'text-slate-500' },
  'Roof Material': { Icon: Layers,   color: 'text-slate-500' },
  'Indigent':      { Icon: User,     color: 'text-rose-500'  },
  'No of Families':{ Icon: UsersRound, color: 'text-emerald-500' },
};

const DEFAULT_META = { Icon: Pencil, color: 'text-slate-500' };

const fmtVal = (v) => {
  if (v === null || v === undefined || v === '')
    return <span className="italic text-slate-400 font-normal">empty</span>;
  if (v === '0' || v === 'false') return 'No';
  if (v === '1' || v === 'true') return 'Yes';
  return v;
};

// ─── Single log entry card ────────────────────────────────────────────────────

const LogEntry = ({ entry, t, isDark }) => {
  const [open, setOpen] = useState(false);
  const action  = entry.action_type || 'edit';
  const cfg     = ACTION_CONFIG[action] || ACTION_CONFIG.edit;
  const hasChanges = action === 'edit' && entry.changes?.length > 0;

  return (
    <div className={`rounded-2xl border ${t.cardBorder} overflow-hidden`}>
      <button
        onClick={() => hasChanges && setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors ${
          isDark ? 'hover:bg-slate-900/60' : 'hover:bg-slate-50/80'
        } ${t.inlineBg} ${!hasChanges ? 'cursor-default' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Action icon circle */}
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${cfg.badge}`}>
            <cfg.Icon size={13} />
          </div>

          <div className="min-w-0">
            {/* Head name + household ID */}
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`text-sm font-semibold font-kumbh ${t.cardText} truncate`}>
                {entry.head}
              </p>
              <span className={`inline-flex shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-bold font-kumbh border ${
                isDark
                  ? 'border-slate-600 bg-slate-700 text-slate-300'
                  : 'border-slate-200 bg-slate-100 text-slate-500'
              }`}>
                {entry.household_display_id}
              </span>
            </div>
            {/* Sub-line */}
            <p className="text-[11px] font-medium text-slate-400 font-kumbh mt-0.5">
              <span className="font-semibold">{entry.edited_by}</span> · {entry.edited_at}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-3">
          {/* Action badge */}
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full font-kumbh border ${cfg.badge}`}>
            {cfg.label}
          </span>
          {/* Chevron — only for edits with changes */}
          {hasChanges && (
            open
              ? <ChevronUp size={14} className="text-slate-400" />
              : <ChevronDown size={14} className="text-slate-400" />
          )}
        </div>
      </button>

      {/* Expandable field changes — edit only */}
      {open && hasChanges && (
        <div className={`divide-y ${t.cardBorder}`}>
          {entry.changes.map((c, i) => {
            const { Icon, color } = FIELD_META[c.field] || DEFAULT_META;
            return (
              <div
                key={i}
                className={`px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 ${t.cardBg}`}
              >
                <div className="flex items-center gap-2 sm:w-36 shrink-0">
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

// ─── Main exported component ──────────────────────────────────────────────────

const HouseholdLogsTab = ({ t, currentTheme = 'modern' }) => {
  const isDark = currentTheme === 'dark';

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all'); // 'all' | 'edit' | 'deactivate' | 'restore'

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await householdService.getAllLogs();
      setLogs(data || []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return logs.filter((l) => {
      const matchSearch = !q ||
        (l.head || '').toLowerCase().includes(q) ||
        (l.household_display_id || '').toLowerCase().includes(q) ||
        (l.edited_by || '').toLowerCase().includes(q);
      const matchAction = actionFilter === 'all' || l.action_type === actionFilter;
      return matchSearch && matchAction;
    });
  }, [logs, searchTerm, actionFilter]);

  // Filter pill styles
  const pillBase = 'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[14px] border text-[11px] font-bold font-kumbh transition-all cursor-pointer';
  const pillActive   = (color) => `border-${color}-300 bg-${color}-50 text-${color}-700`;
  const pillInactive = isDark
    ? 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500'
    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300';

  const pills = [
    { key: 'all',        label: 'All',         Icon: ScrollText, activeClass: isDark ? 'border-slate-500 bg-slate-700 text-slate-200' : 'border-slate-300 bg-slate-100 text-slate-700' },
    { key: 'edit',       label: 'Edits',       Icon: Pencil,     activeClass: 'border-blue-300 bg-blue-50 text-blue-700'    },
    { key: 'deactivate', label: 'Deactivated', Icon: Trash2,     activeClass: 'border-rose-300 bg-rose-50 text-rose-700'    },
    { key: 'restore',    label: 'Restored',    Icon: RotateCcw,  activeClass: 'border-emerald-300 bg-emerald-50 text-emerald-700' },
  ];

  return (
    <>
      {/* Search + filter bar */}
      <div className={`border-b px-5 py-5 sm:px-6 ${t.cardBorder} ${isDark ? 'bg-slate-950/40' : 'bg-slate-50/80'} space-y-4`}>
        {/* Search input */}
        <div className="relative w-full xl:max-w-xl">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by household ID, head name, or editor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full rounded-[18px] border ${t.inputBorder} ${t.inputBg} ${t.inputText} pl-12 pr-11 py-3.5 text-sm font-normal outline-none transition-all focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 ${
              isDark ? 'shadow-none' : 'shadow-[0_12px_24px_rgba(15,23,42,0.06)]'
            } font-kumbh`}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Action filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {pills.map(({ key, label, Icon, activeClass }) => (
            <button
              key={key}
              onClick={() => setActionFilter(key)}
              className={`${pillBase} ${actionFilter === key ? activeClass : pillInactive}`}
            >
              <Icon size={11} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Count row */}
      <div className={`border-b px-5 py-4 sm:px-6 ${t.cardBorder} ${isDark ? 'bg-slate-950/70' : 'bg-white/70'}`}>
        <div className="flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-amber-500" />
          <span className={`text-sm font-semibold font-kumbh ${t.cardText}`}>
            {filtered.length} activit{filtered.length !== 1 ? 'ies' : 'y'} logged
          </span>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className={`flex items-center justify-center py-28 ${t.subtleText} font-kumbh`}>
          <Loader2 size={22} className="animate-spin mr-3" />
          <span className="font-black tracking-widest uppercase text-sm">Loading Logs...</span>
        </div>
      ) : filtered.length > 0 ? (
        <div className="p-5 sm:p-6 space-y-3">
          {filtered.map((entry, i) => (
            <LogEntry key={i} entry={entry} t={t} isDark={isDark} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-28 gap-3">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <ScrollText size={28} className="text-slate-300" />
          </div>
          <span className={`text-2xl font-bold ${t.cardText} font-spartan`}>No logs found</span>
          <p className={`max-w-md text-sm leading-7 ${t.subtleText} font-medium font-kumbh text-center`}>
            Household edits, deactivations, and restores made by admins will appear here.
          </p>
        </div>
      )}
    </>
  );
};

export default HouseholdLogsTab;