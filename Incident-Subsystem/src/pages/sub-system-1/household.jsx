/**
 * Households.jsx
 * CHANGED: Removed the full-page `if (loading) return (...)` bail-out.
 *   The page now renders immediately. HouseholdStats and HouseholdTable
 *   each handle their own loading skeleton via the loading prop.
 *   Pagination is hidden while loading to avoid layout jumping.
 * CHANGED: Replaced all alert() calls with Toast notifications.
 * All original logic preserved.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Printer, Archive, LayoutList, ScrollText, Loader2 } from 'lucide-react';

import HouseholdStats            from '../../components/sub-system-1/household/HouseholdStats';
import HouseholdFilters          from '../../components/sub-system-1/household/householdfilters';
import HouseholdTable            from '../../components/sub-system-1/household/householdtable';
import HouseholdModal            from '../../components/sub-system-1/household/modals/householdmodal';
import EditHouseholdModal        from '../../components/sub-system-1/household/modals/EditHouseholdModal';
import DeactivateHouseholdModal  from '../../components/sub-system-1/household/modals/DeactivateHouseholdModal';
import HouseholdArchivesTab      from '../../components/sub-system-1/household/tabs/HouseholdArchivesTab';
import HouseholdLogsTab          from '../../components/sub-system-1/household/tabs/HouseholdLogsTab';
import Pagination                from '../../components/sub-system-1/common/pagination';
import Toast                     from '../../components/shared/modals/Toast';

import { useHouseholds }              from '../../hooks/sub-system-1/useHousehold';
import { usePrinter }                 from '../../hooks/sub-system-1/usePrinter';
import { householdService }           from '../../services/sub-system-1/household';
import { calculateHouseholdStats }    from '../../utils/sub-system-1/householdUtils';
import themeTokens                    from '../../Themetokens';

const TABS = [
  { id: 'registry', label: 'Registry', icon: LayoutList },
  { id: 'archives', label: 'Archives', icon: Archive },
  { id: 'logs', label: 'Logs', icon: ScrollText },
];

const tabAccentMap = {
  modern: { text: 'text-blue-600', bar: 'bg-blue-600', inactive: 'text-slate-500 hover:text-slate-700' },
  blue:   { text: 'text-blue-600', bar: 'bg-blue-600', inactive: 'text-slate-500 hover:text-slate-700' },
  purple: { text: 'text-purple-600', bar: 'bg-purple-600', inactive: 'text-slate-500 hover:text-slate-700' },
  green:  { text: 'text-green-600', bar: 'bg-green-600', inactive: 'text-slate-500 hover:text-slate-700' },
  dark:   { text: 'text-slate-200', bar: 'bg-slate-400', inactive: 'text-slate-400 hover:text-slate-200' },
};

const Households = () => {
  const { tr } = useLanguage();
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('appTheme') || 'blue');

  useEffect(() => {
    const handler = (e) => setCurrentTheme(e.detail);
    window.addEventListener('themeChange', handler);
    return () => window.removeEventListener('themeChange', handler);
  }, []);

  const t      = themeTokens[currentTheme];
  const isDark = currentTheme === 'dark';
  const { households, loading, refresh } = useHouseholds();
  const { printTable } = usePrinter();

  // ── Toast state ───────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);
  const addToast = (toast) =>
    setToasts((prev) => [...prev, { ...toast, id: Date.now() }]);
  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  // ── Active tab ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('registry');

  // ── Modal state ────────────────────────────────────────────────────────────
  const [isModalOpen,           setIsModalOpen]          = useState(false);
  const [isEditModalOpen,       setIsEditModalOpen]      = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen]= useState(false);
  const [selectedHousehold,     setSelectedHousehold]    = useState(null);
  const [deactivating,          setDeactivating]         = useState(false);
  const [openingHousehold,      setOpeningHousehold]     = useState({
    loading: false,
    householdId: null,
    mode: 'view',
  });

  // ── Filter state ───────────────────────────────────────────────────────────
  const [searchTerm,   setSearchTerm]   = useState('');
  const [purokFilter,  setPurokFilter]  = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [tenureFilter, setTenureFilter] = useState('All');
  const [currentPage,  setCurrentPage]  = useState(1);
  const itemsPerPage = 10;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleUpdate = async (db_id, updatedData) => {
    try {
      const targetId = db_id || selectedHousehold?.db_id;
      if (!targetId) {
        addToast({ type: 'error', title: 'Error', message: 'Household ID not found.', duration: 4000 });
        return;
      }
      await householdService.update(targetId, updatedData);
      await refresh();
      setIsEditModalOpen(false);
      setSelectedHousehold(null);
      addToast({
        type: 'success',
        title: 'Household Updated',
        message: 'Household record has been saved successfully.',
        duration: 4000,
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.response?.data?.message || 'Failed to update household record.',
        duration: 5000,
      });
    }
  };

  const handleDeactivateConfirm = async () => {
    if (!selectedHousehold?.db_id) return;
    setDeactivating(true);
    try {
      await householdService.deactivate(selectedHousehold.db_id);
      await refresh();
      setIsDeactivateModalOpen(false);
      addToast({
        type: 'success',
        title: 'Household Deactivated',
        message: `${selectedHousehold.head || 'Household'} has been moved to archives.`,
        duration: 4000,
      });
      setSelectedHousehold(null);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Deactivation Failed',
        message: err.response?.data?.message || 'Failed to deactivate household.',
        duration: 5000,
      });
    } finally {
      setDeactivating(false);
    }
  };

  const openHouseholdWithLoading = async (household, mode = 'view') => {
    if (!household || openingHousehold.loading) return;

    setOpeningHousehold({
      loading: true,
      householdId: household.db_id ?? household.id ?? null,
      mode,
    });

    setSelectedHousehold(household);

    await new Promise((resolve) => setTimeout(resolve, 220));

    if (mode === 'edit') {
      setIsEditModalOpen(true);
    } else {
      setIsModalOpen(true);
    }

    setOpeningHousehold({
      loading: false,
      householdId: null,
      mode: 'view',
    });
  };

  // ── Derived data ───────────────────────────────────────────────────────────
  const stats = useMemo(() => calculateHouseholdStats(households), [households]);

  const filteredHouseholds = useMemo(() => households.filter((h) => {
    const q = searchTerm.toLowerCase();
    return (
      ((h.head || '').toLowerCase().includes(q) || (h.id || '').toString().toLowerCase().includes(q)) &&
      (purokFilter  === 'All' || String(h.purok)       === String(purokFilter))  &&
      (statusFilter === 'All' || String(h.is_indigent) === String(statusFilter)) &&
      (tenureFilter === 'All' || h.tenure_status        === tenureFilter)
    );
  }), [households, searchTerm, purokFilter, statusFilter, tenureFilter]);

  const totalPages  = Math.ceil(filteredHouseholds.length / itemsPerPage) || 1;
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredHouseholds.slice(start, start + itemsPerPage);
  }, [filteredHouseholds, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, purokFilter, statusFilter, tenureFilter]);

  // ── Print ──────────────────────────────────────────────────────────────────
  const handlePrint = () => {
    const columns = [
      { header: 'No.',            key: 'no',             width: '40px',  align: 'center' },
      { header: 'Household ID',   key: 'id',             width: '100px'                  },
      { header: 'Head of Family', key: 'head',           width: '180px'                  },
      { header: 'Purok',          key: 'display_purok',  align: 'center'                 },
      { header: 'Tenure',         key: 'tenure_status',  align: 'center'                 },
      { header: 'Status',         key: 'display_status', align: 'center'                 },
      { header: 'Members',        key: 'members',        width: '75px',  align: 'center' },
    ];
    const dataToPrint = filteredHouseholds.map((h, i) => ({
      ...h,
      no: i + 1,
      display_purok:  h.purok ? `Purok ${h.purok}` : 'N/A',
      display_status: Number(h.is_indigent) === 1 ? 'INDIGENT' : 'GENERAL',
    }));
    const activeStatus = statusFilter === '1' ? 'Indigent' : statusFilter === '0' ? 'General' : 'All';
    printTable(
      'Barangay Household Masterlist',
      columns,
      dataToPrint,
      `Purok: ${purokFilter} | Status: ${activeStatus} | Tenure: ${tenureFilter}`
    );
  };

  // ── Tab styles ─────────────────────────────────────────────────────────────
  const tabBase     = 'inline-flex items-center gap-2 px-5 py-2.5 mb-[-1px] rounded-t-xl text-xs font-bold uppercase tracking-widest font-kumbh transition-all border-b-2';
  const tabInactive = `border-transparent ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`;
  const tabActiveStyle = {
    registry: isDark ? 'border-slate-300 text-slate-100 bg-slate-700 shadow-sm' : 'border-blue-600 text-blue-700 bg-white shadow-sm',
    archives: isDark ? 'border-slate-300 text-slate-100 bg-slate-700 shadow-sm' : 'border-rose-500 text-rose-600 bg-white shadow-sm',
    logs:     isDark ? 'border-slate-300 text-slate-100 bg-slate-700 shadow-sm' : 'border-amber-500 text-amber-600 bg-white shadow-sm',
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 pb-20">

      {/* ── TOAST ──────────────────────────────────────────────────────────── */}
      <Toast toasts={toasts} onRemove={removeToast} currentTheme={currentTheme} />

      {/* ── Page header ── */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-2xl font-spartan font-bold ${t.cardText} uppercase tracking-tight`}>
            {tr.sub1.households}
          </h1>
          <p className={`text-xs font-kumbh ${t.subtleText} uppercase tracking-widest mt-1`}>
            {tr.sub1.householdsDesc}
          </p>
        </div>
        {activeTab === 'registry' && (
          <button
            onClick={handlePrint}
            disabled={filteredHouseholds.length === 0}
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase hover:opacity-90 shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            <Printer size={16} /> {tr.sub1.export}
          </button>
        )}
      </div>

      {/* ── Stats ── */}
      {activeTab === 'registry' && (
        <HouseholdStats
          stats={stats}
          loading={loading}
          t={t}
          currentTheme={currentTheme}
        />
      )}

      {/* ── Main card ── */}
      <div className={`${t.cardBg} rounded-[2rem] border ${t.cardBorder} shadow-sm overflow-hidden`}>

        {/* Tab bar */}
        <div className={`flex items-center gap-1 px-5 pt-4 sm:px-6 border-b ${t.cardBorder} ${isDark ? 'bg-slate-950/40' : 'bg-slate-50/60'}`}>
          <button onClick={() => setActiveTab('registry')} className={`${tabBase} ${activeTab === 'registry' ? tabActiveStyle.registry : tabInactive}`}>
            <LayoutList size={14} /> {tr.sub1.registry || 'Registry'}
          </button>
          <button onClick={() => setActiveTab('archives')} className={`${tabBase} ${activeTab === 'archives' ? tabActiveStyle.archives : tabInactive}`}>
            <Archive size={14} /> {tr.sub1.archived}
          </button>
          <button onClick={() => setActiveTab('logs')} className={`${tabBase} ${activeTab === 'logs' ? tabActiveStyle.logs : tabInactive}`}>
            <ScrollText size={14} /> {tr.sub1.logs || 'Logs'}
          </button>
        </div>

        {/* ── Registry tab ── */}
        {activeTab === 'registry' && (
          <>
            <HouseholdFilters
              searchTerm={searchTerm}    setSearchTerm={setSearchTerm}
              purokFilter={purokFilter}   setPurokFilter={setPurokFilter}
              statusFilter={statusFilter} setStatusFilter={setStatusFilter}
              tenureFilter={tenureFilter} setTenureFilter={setTenureFilter}
              totalResults={filteredHouseholds.length}
              t={t}
              currentTheme={currentTheme}
            />
            <HouseholdTable
              households={currentData}
              loading={loading}
              t={t}
              onView={(h)       => { openHouseholdWithLoading(h, 'view');      }}
              onEdit={(h)       => { openHouseholdWithLoading(h, 'edit');      }}
              onDeactivate={(h) => { setSelectedHousehold(h); setIsDeactivateModalOpen(true); }}
              actionLoadingId={openingHousehold.householdId}
              actionLoadingMode={openingHousehold.mode}
              disableActions={openingHousehold.loading}
              currentTheme={currentTheme}
            />
            {!loading && (
              <div className={`p-6 border-t ${t.cardBorder}`}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={filteredHouseholds.length}
                  itemsPerPage={itemsPerPage}
                  t={t}
                />
              </div>
            )}
          </>
        )}

        {activeTab === 'archives' && (
          <HouseholdArchivesTab
            t={t}
            currentTheme={currentTheme}
            onToast={addToast}
          />
        )}

        {activeTab === 'logs' && (
          <HouseholdLogsTab t={t} currentTheme={currentTheme} />
        )}
      </div>

      {/* ── Edit modal ── */}
      {isEditModalOpen && (
        <EditHouseholdModal
          key={selectedHousehold?.db_id || 'edit-modal'}
          isOpen={isEditModalOpen}
          data={selectedHousehold}
          onUpdate={handleUpdate}
          t={t}
          onClose={() => { setIsEditModalOpen(false); setSelectedHousehold(null); }}
        />
      )}

      {/* ── View modal ── */}
      {isModalOpen && (
        <HouseholdModal
          key={selectedHousehold?.db_id || 'view-modal'}
          isOpen={isModalOpen}
          data={selectedHousehold}
          t={t}
          currentTheme={currentTheme}
          onToast={addToast}
          onClose={() => { setIsModalOpen(false); setSelectedHousehold(null); }}
          onEdit={(h) => {
            setIsModalOpen(false);
            openHouseholdWithLoading(h, 'edit');
          }}
        />
      )}

      {openingHousehold.loading && (
        <div
          className={`fixed inset-0 z-[9998] flex items-center justify-center backdrop-blur-[6px] ${
            isDark ? 'bg-slate-900/55' : 'bg-[rgba(239,246,255,0.72)]'
          }`}
        >
          <div className="flex flex-col items-center gap-4 px-6 py-6 text-center">
            <div
              className={`relative h-16 w-16 rounded-full border ${
                isDark ? 'border-slate-600/80' : 'border-slate-300/90'
              }`}
            >
              <div
                className={`absolute inset-0 animate-spin rounded-full border-2 border-transparent ${
                  isDark
                    ? 'border-t-emerald-300 border-r-emerald-300'
                    : 'border-t-blue-600 border-r-emerald-500'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <p
                className={`text-[11px] font-spartan font-bold uppercase tracking-[0.28em] ${
                  isDark ? 'text-slate-100' : 'text-slate-700'
                }`}
              >
                Please wait
              </p>
              <p
                className={`text-[13px] font-kumbh ${
                  isDark ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                {openingHousehold.mode === 'edit'
                  ? 'Opening edit household form...'
                  : 'Opening household profile...'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Deactivate modal ── */}
      {isDeactivateModalOpen && (
        <DeactivateHouseholdModal
          isOpen={isDeactivateModalOpen}
          household={selectedHousehold}
          loading={deactivating}
          t={t}
          currentTheme={currentTheme}
          onConfirm={handleDeactivateConfirm}
          onClose={() => { setIsDeactivateModalOpen(false); setSelectedHousehold(null); }}
        />
      )}
    </div>
  );
};

export default Households;
