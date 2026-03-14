  import React, { useState, useEffect } from 'react';
  import {
    LayoutList, Clock, ChevronDown, ChevronUp, Loader2,
    Pencil, User, Home, FileText, Layers, Landmark, UserCheck, UsersRound
  } from 'lucide-react';
  import ModalWrapper from '../../common/ModalWrapper';
  import HouseholdHero from '../hhmc/HouseholdHero';
  import HousingSurvey from '../hhmc/HousingSurvey';
  import FamilyTable from '../hhmc/FamilyTable';
  import ResidentDetailsModal from '../../residents/ResidentDetailsModal';
  import { householdService } from '../../../../services/sub-system-1/household';
  import api from '../../../../services/sub-system-1/Api';

  // ─── Field meta ───────────────────────────────────────────────────────────────

  const FIELD_META = {
    'Purok':         { Icon: Landmark, color: 'text-blue-500'  },
    'Street':        { Icon: Home,     color: 'text-blue-500'  },
    'House Number':  { Icon: Home,     color: 'text-slate-500' },
    'Tenure Status': { Icon: FileText, color: 'text-amber-500' },
    'Wall Material': { Icon: Layers,   color: 'text-slate-500' },
    'Roof Material': { Icon: Layers,   color: 'text-slate-500' },
    'Indigent':      { Icon: User,     color: 'text-rose-500'  },
    'No. of Families':{ Icon: UsersRound, color: 'text-emerald-500' },
  };

  const DEFAULT_META = { Icon: Pencil, color: 'text-slate-500' };

  const fmtVal = (v, field) => {
    if (v === null || v === undefined || v === '')
      return <span className="italic text-slate-400 font-normal">empty</span>;
    if (field === 'Indigent') {
      if (v === '0' || v === 'false') return 'No';
      if (v === '1' || v === 'true')  return 'Yes';
    }
    return v;
  };

  // ─── Single history entry ─────────────────────────────────────────────────────

  const HistoryEntry = ({ entry, index, t, isDark }) => {
    const [open, setOpen] = useState(index === 0);

    return (
      <div className={`rounded-2xl border ${t.cardBorder} overflow-hidden`}>
        <button
          onClick={() => setOpen((o) => !o)}
          className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors ${t.inlineBg} hover:opacity-80`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <Clock size={13} className="text-slate-400" />
            </div>
            <div>
              <p className={`text-sm font-semibold font-kumbh ${t.cardText}`}>{entry.edited_by}</p>
              <p className="text-[11px] font-medium text-slate-400 font-kumbh">{entry.edited_at}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full font-kumbh ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>
              {entry.changes.length} field{entry.changes.length !== 1 ? 's' : ''}
            </span>
            {open
              ? <ChevronUp size={14} className="text-slate-400" />
              : <ChevronDown size={14} className="text-slate-400" />}
          </div>
        </button>

        {open && (
          <div className={`divide-y ${t.cardBorder}`}>
            {entry.changes.map((change, i) => {
              const { Icon, color } = FIELD_META[change.field] || DEFAULT_META;
              return (
                <div key={i} className={`px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 ${t.cardBg}`}>
                  <div className="flex items-center gap-2 sm:w-36 shrink-0">
                    <Icon size={13} className={color} />
                    <span className={`text-xs font-bold font-kumbh ${color}`}>{change.field}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-xs font-kumbh font-semibold">
                    <span className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 line-through decoration-rose-400">
                      {fmtVal(change.old_value, change.field)}
                    </span>
                    <span className="text-slate-400 font-normal">→</span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
                      {fmtVal(change.new_value, change.field)}
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

  // ─── History panel ────────────────────────────────────────────────────────────

  const HistoryPanel = ({ db_id, t, isDark }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!db_id) return;
      setLoading(true);
      householdService.getHistory(db_id)
        .then((data) => setHistory(data || []))
        .catch(() => setHistory([]))
        .finally(() => setLoading(false));
    }, [db_id]);

    if (loading) return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={20} className="animate-spin text-slate-400 mr-3" />
        <span className="text-sm font-kumbh text-slate-400 font-black tracking-widest uppercase">Loading history...</span>
      </div>
    );

    if (history.length === 0) return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <Clock size={24} className="text-slate-300" />
        </div>
        <p className={`text-lg font-bold font-spartan ${t.cardText}`}>No edit history yet</p>
        <p className={`text-sm font-kumbh ${t.subtleText} text-center max-w-xs`}>
          Changes made to this household will appear here.
        </p>
      </div>
    );

    return (
      <div className="space-y-3">
        {history.map((entry, i) => (
          <HistoryEntry key={i} entry={entry} index={i} t={t} isDark={isDark} />
        ))}
      </div>
    );
  };

  // ─── Main modal ───────────────────────────────────────────────────────────────

  const HouseholdModal = ({ isOpen, onClose, onEdit, data, t, currentTheme = 'modern' }) => {
    const [activeTab, setActiveTab] = useState('profile');

    // ── Resident viewer state ─────────────────────────────────────────────────
    const [residentModal, setResidentModal] = useState({
      open: false,
      resident: null,
      loading: false,
    });

    // Reset tab when a different household is opened
    useEffect(() => { setActiveTab('profile'); }, [data?.db_id]);

    // Close resident modal whenever the household modal closes
    useEffect(() => {
      if (!isOpen) setResidentModal({ open: false, resident: null, loading: false });
    }, [isOpen]);

    // ── Fetch + open a resident by their DB id ────────────────────────────────
    const openResident = async (residentId) => {
      if (!residentId) return;
      setResidentModal({ open: false, resident: null, loading: true });
      try {
        const res = await api.get(`/residents/${residentId}`);
        setResidentModal({ open: true, resident: res.data, loading: false });
      } catch (err) {
        console.error('Failed to load resident:', err);
        setResidentModal({ open: false, resident: null, loading: false });
      }
    };

    const closeResident = () =>
      setResidentModal({ open: false, resident: null, loading: false });

    // Save handler passed to ResidentDetailsModal — mirrors what ResidentTable does
    const handleResidentSave = async (formData) => {
      try {
        await api.put(`/residents/${formData.id}`, formData);
        // Refresh the resident data shown in the modal
        const res = await api.get(`/residents/${formData.id}`);
        setResidentModal(prev => ({ ...prev, resident: res.data }));
        return true;
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to save changes.');
        return false;
      }
    };

    if (!data) return null;

    const isDark = currentTheme === 'dark';

    const hNo      = data.house_number || data.details?.house_number || '';
    const street   = data.street_name  || data.details?.street_name  || '';
    const rawPurok = data.purok || data.details?.purok || 'N/A';
    const cleanPurok = rawPurok.toString().toLowerCase().includes('purok')
      ? rawPurok : `Purok ${rawPurok}`;

    const baseAddress = (hNo || street)
      ? `${hNo} ${street}`.trim()
      : (data.address || 'NO ADDRESS PROVIDED');
    const fullAddress = `${baseAddress}, BGY. GULOD, NOVALICHES, QUEZON CITY`
      .replace(/\s+/g, ' ').trim();

    const hasUpdateInfo = data.last_updated_at || data.last_updated_by;

    const tabBase     = 'inline-flex items-center gap-1.5 px-4 py-2 mb-[-1px] rounded-t-xl text-[11px] font-bold uppercase tracking-widest font-kumbh transition-all border-b-2';
    const tabInactive = `border-transparent ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`;
    const profileActive = isDark
      ? 'border-slate-300 text-slate-100 bg-slate-700 shadow-sm'
      : 'border-blue-600 text-blue-700 bg-white shadow-sm';
    const historyActive = isDark
      ? 'border-slate-300 text-slate-100 bg-slate-700 shadow-sm'
      : 'border-amber-500 text-amber-600 bg-white shadow-sm';

    return (
      <>
        <ModalWrapper
          isOpen={isOpen}
          onClose={onClose}
          title={`HOUSEHOLD PROFILE: ${data.id || 'PENDING ID'}`}
          maxWidth="max-w-3xl"
          t={t}
        >
          <div className="flex flex-col gap-4">

            {/* ── Last updated banner ── */}
            {hasUpdateInfo && (
              <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border ${
                isDark ? 'border-slate-700/80 bg-slate-800/60' : 'border-slate-200 bg-slate-50'
              }`}>
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  isDark ? 'bg-slate-700' : 'bg-white border border-slate-200'
                }`}>
                  <UserCheck size={13} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className={`text-[11px] font-kumbh ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Last Activity:
                    </span>
                    <span className={`text-[11px] font-medium font-kumbh ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {data.last_updated_at}
                    </span>
                  </div>
                  <span className="hidden sm:block text-slate-300">|</span>
                  <div className="flex items-center gap-1">
                    <span className={`text-[11px] font-kumbh ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      By:
                    </span>
                    <span className={`text-[11px] font-bold font-kumbh ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      {data.last_updated_by}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab bar ── */}
            <div className={`flex items-center gap-1 border-b ${t.cardBorder} -mx-1 px-1 ${isDark ? 'bg-slate-950/20' : 'bg-slate-50/40'}`}>
              <button
                onClick={() => setActiveTab('profile')}
                className={`${tabBase} ${activeTab === 'profile' ? profileActive : tabInactive}`}
              >
                <LayoutList size={12} /> Profile
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`${tabBase} ${activeTab === 'history' ? historyActive : tabInactive}`}
              >
                <Clock size={12} /> Edit History
              </button>
            </div>

            {/* ── Tab content ── */}
            <div className="space-y-6">
              {activeTab === 'profile' && (
                <>
                  {/* Pass openResident so HouseholdHero can trigger it on head click */}
                  <HouseholdHero
                    data={data}
                    t={t}
                    currentTheme={currentTheme}
                    onHeadClick={openResident}
                  />
                <HousingSurvey 
  data={data} 
  t={t} 
  currentTheme={currentTheme} 
  isHead={true} // or logic to check if viewer is admin
  isIndigent={data.is_indigent}
  onUpdateField={(field, value) => {
     // Trigger your API update logic here
     console.log(`Updating ${field} to ${value}`);
  }}
/>

                  <div className={`${t.inlineBg} rounded-2xl p-4 border ${t.cardBorder}`}>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                      Registered Address
                    </p>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                      <p className={`text-sm font-bold ${t.cardText} uppercase font-spartan max-w-[80%]`}>
                        {fullAddress}
                      </p>
                      <span className="text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-100 dark:border-emerald-800/50">
                        {cleanPurok}
                      </span>
                    </div>
                  </div>

                  {/* Pass openResident so FamilyTable rows trigger it too */}
                  <FamilyTable
                    members={data.memberList}
                    establishedDate={data.established_date}
                    t={t}
                    currentTheme={currentTheme}
                    onMemberClick={openResident}
                  />
                </>
              )}

              {activeTab === 'history' && (
                <HistoryPanel db_id={data.db_id} t={t} isDark={isDark} />
              )}
            </div>

            {/* ── Footer ── */}
<div className={`sticky bottom-0 z-10 pt-2 pb-4 flex flex-col md:flex-row justify-end items-center gap-4 border-t ${t.cardBorder} ${isDark ? 'bg-slate-900' : 'bg-white'} mt-2`}>
  <p className="hidden md:block text-[9px] font-bold text-slate-400 italic font-kumbh mr-auto">
    Data is subject to barangay privacy policy
  </p>
  <div className="flex gap-3 w-full md:w-auto">
    <button
      onClick={() => { onClose(); onEdit(data); }}
      className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-emerald-700 active:scale-95 transition-all shadow-lg font-spartan"
    >
      <Pencil size={13} /> Edit Profile
    </button>
    <button
      onClick={onClose}
      className={`flex-1 md:flex-none px-8 py-3 bg-slate-200 dark:bg-slate-800 ${t.cardText} text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 active:scale-95 transition-all font-spartan`}
    >
      Dismiss
    </button>
  </div>
</div>
          </div>
        </ModalWrapper>

        {/* ── Resident details modal (opens on top of household modal) ── */}

        {/* Loading overlay while fetching resident */}
        {residentModal.loading && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
              <Loader2 size={18} className="animate-spin text-slate-400" />
              <span className="text-sm font-kumbh font-black uppercase tracking-widest text-slate-400">
                Loading resident...
              </span>
            </div>
          </div>
        )}

        {residentModal.open && residentModal.resident && (
          <ResidentDetailsModal
            isOpen={residentModal.open}
            onClose={closeResident}
            resident={residentModal.resident}
            onSave={handleResidentSave}
            mode="view"
            t={t}
            currentTheme={currentTheme}
          />
        )}
      </>
    );
  };

  export default HouseholdModal;