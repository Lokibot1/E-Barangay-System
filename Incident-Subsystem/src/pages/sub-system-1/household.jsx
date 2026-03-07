import React, { useState, useMemo, useEffect } from 'react';
import { Printer } from 'lucide-react';
import HouseholdStats from '../../components/sub-system-1/household/HouseholdStats';
import HouseholdFilters from '../../components/sub-system-1/household/householdfilters';
import HouseholdTable from '../../components/sub-system-1/household/householdtable';
import HouseholdModal from '../../components/sub-system-1/household/modals/householdmodal';
import EditHouseholdModal from '../../components/sub-system-1/household/modals/EditHouseholdModal';
import Pagination from '../../components/sub-system-1/common/pagination';

import { useHouseholds } from '../../hooks/sub-system-1/useHousehold';
import { usePrinter } from '../../hooks/sub-system-1/usePrinter';
import { householdService } from '../../services/sub-system-1/household';
import { calculateHouseholdStats } from '../../utils/sub-system-1/householdUtils';
import themeTokens from '../../Themetokens';

const Households = () => {
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('appTheme') || 'modern');
  
  useEffect(() => {
    const handler = (e) => setCurrentTheme(e.detail);
    window.addEventListener('themeChange', handler);
    return () => window.removeEventListener('themeChange', handler);
  }, []);

  const t = themeTokens[currentTheme] || themeTokens.modern;
  const isDark = currentTheme === 'dark';
  const { households, loading, refresh } = useHouseholds();
  const { printTable } = usePrinter();

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [purokFilter, setPurokFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [tenureFilter, setTenureFilter] = useState('All');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState(null);

  const handleUpdate = async (dbId, updatedData) => {
    try {
      const targetId = dbId || selectedHousehold?.db_id;
      if (!targetId) {
        alert('Error: Household ID not found.');
        return;
      }

      await householdService.update(targetId, updatedData);
      await refresh();

      setIsEditModalOpen(false);
      setSelectedHousehold(null);
    } catch (err) {
      console.error('Update failed:', err);
      const errorMsg = err.response?.data?.message || 'Failed to update household record.';
      alert(errorMsg);
    }
  };

  // Memoized Stats based on ALL households
  const stats = useMemo(() => calculateHouseholdStats(households), [households]);

  // Memoized Filtered List
  const filteredHouseholds = useMemo(() => {
    return households.filter(h => {
      const matchesSearch =
        (h.head || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.id || '').toString().toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPurok = purokFilter === 'All' || String(h.purok) === String(purokFilter);
      const matchesStatus = statusFilter === 'All' || String(h.is_indigent) === String(statusFilter);
      const matchesTenure = tenureFilter === 'All' || h.tenure_status === tenureFilter;

      return matchesSearch && matchesPurok && matchesStatus && matchesTenure;
    });
  }, [households, searchTerm, purokFilter, statusFilter, tenureFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredHouseholds.length / itemsPerPage) || 1;
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredHouseholds.slice(start, start + itemsPerPage);
  }, [filteredHouseholds, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, purokFilter, statusFilter, tenureFilter]);

  const handlePrint = () => {
    const columns = [
      { header: "No.", key: "no", width: "40px", align: "center" },
      { header: 'Household ID', key: 'id', width: "100px" },
      { header: 'Head of Family', key: 'head', width: "180px" },
      { header: 'Purok', key: 'display_purok', align: "center" },
      { header: 'Tenure', key: 'tenure_status', align: "center" },
      { header: 'Status', key: 'display_status', align: "center" },
      { header: 'Members', key: 'members', width: "75px", align: "center" }
    ];

    const dataToPrint = filteredHouseholds.map((h, index) => ({
      ...h,
      no: index + 1,
      display_purok: h.purok ? `Purok ${h.purok}` : 'N/A',
      display_status: Number(h.is_indigent) === 1 ? 'INDIGENT' : 'GENERAL',
    }));

    const activeStatus = statusFilter === '1' ? 'Indigent' : statusFilter === '0' ? 'General' : 'All';
    const subtitle = `Purok: ${purokFilter} | Status: ${activeStatus} | Tenure: ${tenureFilter}`;
    
    printTable("Barangay Household Masterlist", columns, dataToPrint, subtitle);
  };

  if (loading) return (
    <div className={`font-sans min-h-screen py-4 pb-24 px-3 sm:px-4 lg:px-5 relative ${t.pageBg}`}>
      <div className="mx-auto flex h-64 w-full max-w-[1600px] items-center justify-center">
        <div className={`animate-pulse text-sm font-semibold font-kumbh ${t.subtleText}`}>Syncing registry...</div>
      </div>
    </div>
  );

  return (
    <div className={`font-sans min-h-screen py-4 pb-24 px-3 sm:px-4 lg:px-5 relative ${t.pageBg}`}>
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="animate-in fade-in duration-500 space-y-6 pt-4 sm:pt-5">
          <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl space-y-3 text-left">
              <div className="space-y-2 text-left">
                <h1 className={`text-[2.25rem] sm:text-[2.1rem] font-bold tracking-tight text-left ${t.cardText} font-spartan`}>
                  Household Registry
                </h1>
                <p className={`max-w-2xl text-[13px] leading-6 sm:text-[13px] text-left ${t.subtleText} font-kumbh`}>
                  Track family units, review housing tenure, and monitor household classifications from one organized registry.
                </p>
              </div>
            </div>

            <button
              onClick={handlePrint}
              disabled={filteredHouseholds.length === 0}
              className={`inline-flex items-center gap-2 self-start rounded-[20px] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(15,23,42,0.14)] transition-all active:scale-[0.98] disabled:opacity-50 ${t.primarySolid} ${t.primaryHover} ${
                isDark ? 'shadow-slate-950/30' : ''
              }`}
            >
              <Printer size={15} />
              Print Masterlist
            </button>
          </section>

          <HouseholdStats stats={stats} t={t} currentTheme={currentTheme} />

          <div className={`${t.cardBg} border ${t.cardBorder} overflow-hidden rounded-[30px] shadow-[0_18px_45px_rgba(15,23,42,0.08)] flex flex-col`}>
            <HouseholdFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              purokFilter={purokFilter}
              setPurokFilter={setPurokFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              tenureFilter={tenureFilter}
              setTenureFilter={setTenureFilter}
              totalResults={filteredHouseholds.length}
              t={t}
              currentTheme={currentTheme}
            />
            
            <HouseholdTable
              households={currentData}
              t={t}
              currentTheme={currentTheme}
              onView={(h) => { setSelectedHousehold(h); setIsModalOpen(true); }}
              onEdit={(h) => { setSelectedHousehold(h); setIsEditModalOpen(true); }}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredHouseholds.length}
              itemsPerPage={itemsPerPage}
              t={t}
              currentTheme={currentTheme}
            />
          </div>

          {isModalOpen && (
            <HouseholdModal
              isOpen={isModalOpen}
              data={selectedHousehold}
              t={t}
              currentTheme={currentTheme}
              onClose={() => { setIsModalOpen(false); setSelectedHousehold(null); }}
            />
          )}

          {isEditModalOpen && (
            <EditHouseholdModal
              isOpen={isEditModalOpen}
              data={selectedHousehold}
              onUpdate={handleUpdate}
              t={t}
              onClose={() => { setIsEditModalOpen(false); setSelectedHousehold(null); }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Households;
