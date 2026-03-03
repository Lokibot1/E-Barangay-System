import React, { useState, useMemo, useEffect } from 'react';
import { Printer } from 'lucide-react';
import HouseholdStats from '../../components/sub-system-1/household/HouseholdStats';
import HouseholdFilters from '../../components/sub-system-1/household/householdfilters';
import HouseholdTable from '../../components/sub-system-1/household/householdtable';
import HouseholdModal from '../../components/sub-system-1/household/householdmodal';
import Pagination from '../../components/sub-system-1/common/pagination';

import { useHouseholds } from '../../hooks/sub-system-1/useHousehold';
import { usePrinter } from '../../hooks/sub-system-1/usePrinter';
import { calculateHouseholdStats } from '../../utils/sub-system-1/householdUtils';
import themeTokens from '../../Themetokens';

const Households = () => {
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('appTheme') || 'blue');
  
  useEffect(() => {
    const handler = (e) => setCurrentTheme(e.detail);
    window.addEventListener('themeChange', handler);
    return () => window.removeEventListener('themeChange', handler);
  }, []);

  const t = themeTokens[currentTheme];
  const { households, loading } = useHouseholds();
  const { printTable } = usePrinter();

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [purokFilter, setPurokFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [tenureFilter, setTenureFilter] = useState('All');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState(null);

  // Memoized Stats based on ALL households
  const stats = useMemo(() => calculateHouseholdStats(households), [households]);

  // Memoized Filtered List
  const filteredHouseholds = useMemo(() => {
    return households.filter(h => {
      const matchesSearch = h.head.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            h.id.toString().toLowerCase().includes(searchTerm.toLowerCase());
      
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
    <div className={`p-6 sm:p-8 ${t.subtleText} font-kumbh flex justify-center items-center h-64`}>
      <div className="animate-pulse font-black tracking-widest uppercase">Syncing Registry...</div>
    </div>
  );

  return (
    <div className="p-6 sm:p-8 space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-2xl font-spartan font-bold ${t.cardText} uppercase tracking-tight`}>Household Registry</h1>
          <p className={`text-xs font-kumbh ${t.subtleText} uppercase tracking-widest mt-1`}>Family Units and Housing Status</p>
        </div>
        <button 
          onClick={handlePrint} 
          disabled={filteredHouseholds.length === 0} 
          className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase hover:opacity-90 shadow-lg transition-all active:scale-95 disabled:opacity-50"
        >
          <Printer size={16} /> Print Masterlist
        </button>
      </div>

      <HouseholdStats stats={stats} t={t} />

      <div className={`${t.cardBg} rounded-[2rem] border ${t.cardBorder} shadow-sm overflow-hidden`}>
        <HouseholdFilters
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          purokFilter={purokFilter} setPurokFilter={setPurokFilter}
          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
          tenureFilter={tenureFilter} setTenureFilter={setTenureFilter}
          totalResults={filteredHouseholds.length} t={t}
        />
        
        <HouseholdTable 
          households={currentData} 
          t={t} 
          onView={(h) => { setSelectedHousehold(h); setIsModalOpen(true); }} 
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
      </div>

      {isModalOpen && (
        <HouseholdModal 
          isOpen={isModalOpen} 
          data={selectedHousehold} 
          t={t} 
          onClose={() => { setIsModalOpen(false); setSelectedHousehold(null); }} 
        />
      )}
    </div>
  );
};

export default Households;