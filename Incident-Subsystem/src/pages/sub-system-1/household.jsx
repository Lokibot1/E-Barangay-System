import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Printer, Archive, LayoutList, ScrollText } from 'lucide-react';

import HouseholdStats from '../../components/sub-system-1/household/HouseholdStats';
import HouseholdFilters from '../../components/sub-system-1/household/householdfilters';
import HouseholdTable from '../../components/sub-system-1/household/householdtable';
import HouseholdModal from '../../components/sub-system-1/household/modals/householdmodal';
import EditHouseholdModal from '../../components/sub-system-1/household/modals/EditHouseholdModal';
import DeactivateHouseholdModal from '../../components/sub-system-1/household/modals/DeactivateHouseholdModal';
import HouseholdArchivesTab from '../../components/sub-system-1/household/tabs/HouseholdArchivesTab';
import HouseholdLogsTab from '../../components/sub-system-1/household/tabs/HouseholdLogsTab';
import Pagination from '../../components/sub-system-1/common/pagination';

import { useHouseholds } from '../../hooks/sub-system-1/useHousehold';
import { usePrinter } from '../../hooks/sub-system-1/usePrinter';
import { householdService } from '../../services/sub-system-1/household';
import { calculateHouseholdStats } from '../../utils/sub-system-1/householdUtils';
import themeTokens from '../../Themetokens';

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
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('appTheme') || 'modern');
  useEffect(() => {
    const handler = (e) => setCurrentTheme(e.detail);
    window.addEventListener('themeChange', handler);
    return () => window.removeEventListener('themeChange', handler);
  }, []);

  const t = themeTokens[currentTheme] || themeTokens.modern;
  const isDark = currentTheme === 'dark';
  const accent = tabAccentMap[currentTheme] || tabAccentMap.modern;
  const { households, loading, refresh } = useHouseholds();
  const { printTable } = usePrinter();

  // ── Active tab ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('registry'); // 'registry' | 'archives' | 'logs'

  // ── Modal state ────────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState(null);
  const [deactivating, setDeactivating] = useState(false);

  // ── Filter state ───────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [purokFilter, setPurokFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [tenureFilter, setTenureFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleUpdate = async (db_id, updatedData) => {
    try {
      const targetId = db_id || selectedHousehold?.db_id;
      if (!targetId) { alert('Error: Household ID not found.'); return; }
      await householdService.update(targetId, updatedData);
      await refresh();
      setIsEditModalOpen(false);
      setSelectedHousehold(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update household record.');
    }
  };

  const handleDeactivateConfirm = async () => {
    if (!selectedHousehold?.db_id) return;
    setDeactivating(true);
    try {
      await householdService.deactivate(selectedHousehold.db_id);
      await refresh();
      setIsDeactivateModalOpen(false);
      setSelectedHousehold(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deactivate household.');
    } finally {
      setDeactivating(false);
    }
  };

  // ── Derived data ───────────────────────────────────────────────────────────
  const stats = useMemo(() => calculateHouseholdStats(households), [households]);

  const filteredHouseholds = useMemo(() => households.filter((h) => {
    const q = searchTerm.toLowerCase();
    return (
      ((h.head || '').toLowerCase().includes(q) || (h.id || '').toString().toLowerCase().includes(q)) &&
      (purokFilter === 'All' || String(h.purok) === String(purokFilter)) &&
      (statusFilter === 'All' || String(h.is_indigent) === String(statusFilter)) &&
      (tenureFilter === 'All' || h.tenure_status === tenureFilter)
    );
  }), [households, searchTerm, purokFilter, statusFilter, tenureFilter]);

  const totalPages = Math.ceil(filteredHouseholds.length / itemsPerPage) || 1;
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredHouseholds.slice(start, start + itemsPerPage);
  }, [filteredHouseholds, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, purokFilter, statusFilter, tenureFilter]);

  // ── Print ──────────────────────────────────────────────────────────────────
  const handlePrint = () => {
    const columns = [
      { header: 'No.', key: 'no', width: '40px', align: 'center' },
      { header: 'Household ID', key: 'id', width: '100px' },
      { header: 'Head of Family', key: 'head', width: '180px' },
      { header: 'Purok', key: 'display_purok', align: 'center' },
      { header: 'Tenure', key: 'tenure_status', align: 'center' },
      { header: 'Status', key: 'display_status', align: 'center' },
      { header: 'Members', key: 'members', width: '75px', align: 'center' },
    ];
    const dataToPrint = filteredHouseholds.map((h, i) => ({
      ...h,
      no: i + 1,
      display_purok: h.purok ? `Purok ${h.purok}` : 'N/A',
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

  if (loading)
    return (
      <div className={`font-sans min-h-screen py-4 pb-24 px-3 sm:px-4 lg:px-5 relative ${t.pageBg}`}>
        <div className="mx-auto flex h-64 w-full max-w-[1600px] items-center justify-center">
          <div className={`animate-pulse font-semibold font-kumbh ${t.subtleText}`}>
            {tr?.sub1?.loading || 'Syncing Registry...'}
          </div>
        </div>
      </div>
    );

  return (
    <div className={`font-sans min-h-screen py-4 pb-24 px-3 sm:px-4 lg:px-5 relative ${t.pageBg}`}>
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="animate-in fade-in duration-500 space-y-6 pt-4 sm:pt-5">

          {/* Page header */}
          <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl space-y-2 text-left">
              <h1 className={`text-[2.25rem] sm:text-[2.1rem] font-bold tracking-tight ${t.cardText} font-spartan`}>
                {tr?.sub1?.households || 'Household Registry'}
              </h1>
              <p className={`max-w-2xl text-[13px] leading-6 ${t.subtleText} font-kumbh`}>
                {tr?.sub1?.householdsDesc || 'Family units, housing status, and archival history in one organized workspace.'}
              </p>
            </div>
            {activeTab === 'registry' && (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handlePrint}
                  disabled={filteredHouseholds.length === 0}
                  className={`inline-flex items-center gap-2 rounded-[20px] px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 ${t.primarySolid} ${t.primaryHover}`}
                >
                  <Printer size={16} /> {tr?.sub1?.export || 'Print Masterlist'}
                </button>
              </div>
            )}
          </section>

      {/* Stats — registry tab only */}
      {activeTab === 'registry' && (
        <HouseholdStats stats={stats} t={t} currentTheme={currentTheme} />
      )}

          {/* Main card */}
          <div className={`${t.cardBg} border ${t.cardBorder} overflow-hidden rounded-[30px] shadow-[0_18px_45px_rgba(15,23,42,0.08)] flex flex-col`}>

            {/* Tab bar */}
            <div className={`flex border-b ${t.cardBorder} ${isDark ? 'bg-slate-900/60' : 'bg-slate-50/80'} px-6`}>
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-6 py-4 text-[11px] font-bold uppercase tracking-widest transition-all relative ${
                    activeTab === id ? accent.text : accent.inactive
                  }`}
                >
                  <Icon size={14} /> {label}
                  {activeTab === id && (
                    <div className={`absolute bottom-0 left-0 w-full h-0.5 ${accent.bar}`} />
                  )}
                </button>
              ))}
            </div>

        {/* Registry tab */}
        {activeTab === 'registry' && (
          <>
            <HouseholdFilters
              searchTerm={searchTerm} setSearchTerm={setSearchTerm}
              purokFilter={purokFilter} setPurokFilter={setPurokFilter}
              statusFilter={statusFilter} setStatusFilter={setStatusFilter}
              tenureFilter={tenureFilter} setTenureFilter={setTenureFilter}
              totalResults={filteredHouseholds.length}
              t={t}
              currentTheme={currentTheme}
            />
            <HouseholdTable
              households={currentData}
              t={t}
              onView={(h) => { setSelectedHousehold(h); setIsModalOpen(true); }}
              onEdit={(h) => { setSelectedHousehold(h); setIsEditModalOpen(true); }}
              onDeactivate={(h) => { setSelectedHousehold(h); setIsDeactivateModalOpen(true); }}
              currentTheme={currentTheme}
            />
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
          </>
        )}

        {/* Archives tab */}
        {activeTab === 'archives' && (
          <HouseholdArchivesTab t={t} currentTheme={currentTheme} />
        )}

        {/* Logs tab */}
        {activeTab === 'logs' && (
          <HouseholdLogsTab t={t} currentTheme={currentTheme} />
        )}
      </div>

    {/* Edit modal */}
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

{/* View modal — para laging refresh din ang info */}
{isModalOpen && (
  <HouseholdModal
    key={selectedHousehold?.db_id || 'view-modal'} 
    isOpen={isModalOpen}
    data={selectedHousehold}
    t={t}
    currentTheme={currentTheme}
    onClose={() => { setIsModalOpen(false); setSelectedHousehold(null); }}
    onEdit={(h) => {
      setIsModalOpen(false);
      setSelectedHousehold(h);
      setIsEditModalOpen(true);
    }}
  />
)}

      {/* Deactivate modal */}
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
      </div>
    </div>
  );
};

export default Households;
