import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, X, RotateCcw, Loader2, ArchiveX, User } from 'lucide-react';
import ModalWrapper from '../../common/ModalWrapper';
import { householdService } from '../../../../services/sub-system-1/household';
import { PUROK_OPTIONS } from '../../../../constants/filter';

// ─── Restore confirmation modal ───────────────────────────────────────────────

const RestoreModal = ({ isOpen, onClose, onConfirm, household, loading, t }) => {
  if (!household) return null;
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Restore household" maxWidth="max-w-md" t={t}>
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-4">
          <RotateCcw size={20} className="text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-700 font-kumbh">
              This will restore the household to the active registry.
            </p>
            <p className="mt-1 text-xs text-emerald-600 font-kumbh leading-relaxed">
              All {household.members ?? 0} linked resident
              {(household.members ?? 0) !== 1 ? 's' : ''} and their portal accounts
              will be re-activated automatically.
            </p>
          </div>
        </div>

        <div className={`rounded-2xl border ${t.cardBorder} ${t.inlineBg} px-4 py-4 space-y-1`}>
          <p className="text-xs font-medium text-slate-400 font-kumbh">Household to restore</p>
          <p className={`text-base font-bold ${t.cardText} font-spartan`}>{household.head}</p>
          <p className={`text-xs font-medium ${t.subtleText} font-kumbh`}>
            {household.id} · Deactivated {household.deactivated_at ?? '—'}
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <button
            onClick={onClose}
            disabled={loading}
            className={`px-6 py-3 rounded-xl text-sm font-semibold border ${t.cardBorder} ${t.cardText} hover:opacity-70 transition-all font-kumbh disabled:opacity-40`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all shadow-lg font-kumbh disabled:opacity-60"
          >
            {loading
              ? <><Loader2 size={15} className="animate-spin" /> Restoring...</>
              : <><RotateCcw size={15} /> Restore Household</>}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

// ─── Archive table row ────────────────────────────────────────────────────────

const ArchiveRow = ({ item, onRestore, t, currentTheme }) => {
  const isDark = currentTheme === 'dark';
  const divider = isDark ? 'border-slate-800/90' : 'border-slate-200';
  const cell = `border-b ${divider} px-6 py-5 align-middle`;

  const fmt = (v) => v
    ? String(v).trim().toLowerCase().replace(/\b([a-z])/g, (m) => m.toUpperCase())
    : 'N/A';

  const deactivatedBy = item.deactivated_by || null;

  return (
    <tr className={`transition-colors duration-200 ${t.cardText} ${isDark ? 'hover:bg-slate-900/60' : 'hover:bg-slate-50/80'}`}>

      {/* Head + ID */}
      <td className={`${cell} text-left`}>
        <p className="text-[15px] font-semibold font-kumbh leading-tight">{fmt(item.head)}</p>
        <p className={`mt-1 text-[12px] ${t.subtleText} font-medium font-kumbh`}>ID: {item.id}</p>
      </td>

      {/* Address */}
      <td className={`${cell} text-left`}>
        <p className={`text-sm font-normal font-kumbh ${t.subtleText} max-w-[260px]`}>{fmt(item.address)}</p>
        <span className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold font-kumbh border ${
          isDark ? 'border-slate-600 bg-slate-700 text-slate-200' : 'border-blue-200 bg-blue-50 text-blue-700'
        }`}>
          Purok {item.purok}
        </span>
      </td>

      {/* Members */}
      <td className={`${cell} text-center`}>
        <span className="text-[1.05rem] font-semibold font-kumbh">{item.members}</span>
      </td>

      {/* Deactivated On */}
      <td className={`${cell} text-center`}>
        <span className={`text-sm font-medium font-kumbh ${t.subtleText}`}>
          {item.deactivated_at ?? '—'}
        </span>
      </td>

      {/* Deactivated By */}
      <td className={`${cell} text-center`}>
        {deactivatedBy ? (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold font-kumbh border ${
            isDark
              ? 'border-rose-800/60 bg-rose-900/20 text-rose-300'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}>
            <User size={10} />
            {deactivatedBy}
          </span>
        ) : (
          <span className={`text-sm font-medium font-kumbh ${t.subtleText}`}>—</span>
        )}
      </td>

      {/* Action */}
      <td className={`${cell} text-center`}>
        <button
          onClick={() => onRestore(item)}
          title="Restore household"
          className="inline-flex items-center gap-2 rounded-[18px] border border-emerald-300 px-4 py-3 text-emerald-600 text-xs font-semibold font-kumbh transition-all shadow-sm hover:bg-emerald-600 hover:text-white hover:border-emerald-600 active:scale-90"
        >
          <RotateCcw size={14} /> Restore
        </button>
      </td>
    </tr>
  );
};

// ─── Main exported component ──────────────────────────────────────────────────

const HouseholdArchivesTab = ({ t, currentTheme = 'modern' }) => {
  const isDark = currentTheme === 'dark';

  const [archived, setArchived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [purokFilter, setPurokFilter] = useState('All');
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [restoring, setRestoring] = useState(false);

  const fetchArchived = useCallback(async () => {
    setLoading(true);
    try {
      const data = await householdService.getArchived();
      setArchived(data || []);
    } catch {
      setArchived([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchArchived(); }, [fetchArchived]);

  const filtered = useMemo(() => archived.filter((h) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      (h.head || '').toLowerCase().includes(q) ||
      (h.id || '').toLowerCase().includes(q);
    const matchPurok = purokFilter === 'All' || String(h.purok) === String(purokFilter);
    return matchSearch && matchPurok;
  }), [archived, searchTerm, purokFilter]);

  const handleRestoreConfirm = async () => {
    if (!restoreTarget) return;
    setRestoring(true);
    try {
      await householdService.restore(restoreTarget.db_id);
      await fetchArchived();
      setRestoreTarget(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to restore household.');
    } finally {
      setRestoring(false);
    }
  };

  // Updated headers — added "Deactivated By" column
  const headers = ['Household Head & ID', 'Last Address', 'Members', 'Deactivated On', 'Deactivated By', 'Action'];
  const purokSelectOptions = [{ value: 'All', label: 'All Puroks' }, ...PUROK_OPTIONS];

  return (
    <>
      {/* Filters */}
      <div className={`border-b px-5 py-5 sm:px-6 ${t.cardBorder} ${isDark ? 'bg-slate-950/40' : 'bg-slate-50/80'}`}>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search by household ID or head name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full rounded-[18px] border ${t.inputBorder} ${t.inputBg} ${t.inputText} pl-12 pr-11 py-3.5 text-sm font-normal outline-none transition-all focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 ${
                isDark ? 'shadow-none' : 'shadow-[0_12px_24px_rgba(15,23,42,0.06)]'
              } font-kumbh`}
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
              className={`w-full xl:w-44 rounded-[18px] border ${t.inputBorder} ${t.inputBg} ${t.inputText} px-4 py-3.5 text-sm font-kumbh outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 ${
                isDark ? 'shadow-none' : 'shadow-[0_12px_24px_rgba(15,23,42,0.06)]'
              }`}
            >
              {purokSelectOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Count badge */}
      <div className={`border-b px-5 py-4 sm:px-6 ${t.cardBorder} ${isDark ? 'bg-slate-950/70' : 'bg-white/70'}`}>
        <div className="flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-rose-500" />
          <span className={`text-sm font-semibold font-kumbh ${t.cardText}`}>
            {filtered.length} archived household{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className={`flex items-center justify-center py-28 ${t.subtleText} font-kumbh`}>
          <Loader2 size={22} className="animate-spin mr-3" />
          <span className="font-black tracking-widest uppercase text-sm">Loading Archives...</span>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="min-w-[1100px] w-full border-separate border-spacing-0">
            <colgroup>
              <col style={{ width: '22%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '8%'  }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '14%' }} />
            </colgroup>
            <thead className={`${isDark ? 'bg-slate-900/80' : 'bg-slate-50/80'} backdrop-blur-sm`}>
              <tr>
                {headers.map((h) => {
                  const centered = ['Members', 'Deactivated On', 'Deactivated By', 'Action'].includes(h);
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
                filtered.map((h) => (
                  <ArchiveRow key={h.db_id} item={h} onRestore={setRestoreTarget} t={t} currentTheme={currentTheme} />
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-28 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <ArchiveX size={32} className="text-slate-300" />
                      <span className={`text-2xl font-bold ${t.cardText} font-spartan`}>No archived records</span>
                      <p className={`max-w-md text-sm leading-7 ${t.subtleText} font-medium font-kumbh`}>
                        Households marked as moved out will appear here.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <RestoreModal
        isOpen={!!restoreTarget}
        onClose={() => setRestoreTarget(null)}
        onConfirm={handleRestoreConfirm}
        household={restoreTarget}
        loading={restoring}
        t={t}
        currentTheme={currentTheme}
      />
    </>
  );
};

export default HouseholdArchivesTab;