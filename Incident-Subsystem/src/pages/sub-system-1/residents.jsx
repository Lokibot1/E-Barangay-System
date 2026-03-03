import React, { useState, useEffect, useMemo } from 'react';
import { Printer as PrinterIcon } from 'lucide-react';

import ResidentTable from '../../components/sub-system-1/residents/ResidentTable';
import ResidentFilters from '../../components/sub-system-1/residents/ResidentFilters';
import ResidentStats from '../../components/sub-system-1/residents/ResidentStats';
import Pagination from '../../components/sub-system-1/common/pagination';

import { useResidents } from '../../hooks/sub-system-1/useResidents';
import { usePrinter } from '../../hooks/sub-system-1/usePrinter';
import { getResidencyLabel } from '../../utils/sub-system-1/residency';
import themeTokens from '../../Themetokens';

const Residents = () => {
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('appTheme') || 'blue');
  
  useEffect(() => {
    const handler = (e) => setCurrentTheme(e.detail);
    window.addEventListener('themeChange', handler);
    return () => window.removeEventListener('themeChange', handler);
  }, []);

  const t = themeTokens[currentTheme];

  const { 
    residents, 
    filteredResidents, 
    loading, 
    searchTerm, 
    setSearchTerm, 
    categoryFilter, 
    setCategoryFilter, 
    handleUpdate, 
    handleDelete 
  } = useResidents();
  
  const { printTable } = usePrinter(); 

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [purokFilter, setPurokFilter] = useState('All');
  const [residencyFilter, setResidencyFilter] = useState('All');

  const finalFiltered = useMemo(() => {
    return filteredResidents.map(r => ({
      ...r,
      residency_status: getResidencyLabel(r.residency_start_date)
    })).filter(r => {
      const matchesPurok = purokFilter === 'All' || String(r.temp_purok_id) === String(purokFilter);
      const matchesResidency = residencyFilter === 'All' || r.residency_status === residencyFilter;
      return matchesPurok && matchesResidency;
    });
  }, [filteredResidents, purokFilter, residencyFilter]);

  const totalPages = Math.ceil(finalFiltered.length / itemsPerPage) || 1;
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return finalFiltered.slice(start, start + itemsPerPage);
  }, [finalFiltered, currentPage]);

  const resetAllFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setPurokFilter('All');
    setResidencyFilter('All');
  };

  useEffect(() => { setCurrentPage(1); }, [searchTerm, categoryFilter, purokFilter, residencyFilter]);

  if (loading) return (
    <div className={`p-6 sm:p-8 ${t.subtleText} font-kumbh flex justify-center items-center h-64`}>
      <div className="animate-pulse font-black tracking-widest uppercase">Syncing Records...</div>
    </div>
  );

  return (
    <div className="p-6 sm:p-8 space-y-6 pb-20">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-2xl font-bold font-spartan ${t.cardText} uppercase tracking-tight`}>Resident Index</h1>
          <p className={`text-xs ${t.subtleText} uppercase tracking-widest mt-1`}>Official Masterlist</p>
        </div>
        
        <button 
          onClick={() => printTable(
            "Resident Masterlist", 
            [
              { header: "#", key: "no", width: "5%", align: "center" },
              { header: "Full Name", key: "name", width: "25%" },
              { header: "Age", key: "age", width: "8%", align: "center" },
              { header: "Purok", key: "resolved_purok", width: "12%" },
              { header: "Address", key: "full_address", width: "25%" },
              { header: "Residency", key: "residency_status", width: "15%" },
            ], 
            finalFiltered, 
            `Purok: ${purokFilter} | Sector: ${categoryFilter} | Status: ${residencyFilter}`
          )} 
          className="flex items-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-[10px] uppercase hover:opacity-90 shadow-lg active:scale-95 transition-all"
        >
          <PrinterIcon size={14} /> Export Masterlist
        </button>
      </div>

      <ResidentStats residents={residents} t={t} />

      {/* Main Table Container */}
      <div className={`${t.cardBg} border ${t.cardBorder} rounded-[2rem] overflow-hidden shadow-sm`}>
        
        {/* All Filtering Logic is now here */}
        <ResidentFilters 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          purokFilter={purokFilter}
          setPurokFilter={setPurokFilter}
          residencyFilter={residencyFilter}
          setResidencyFilter={setResidencyFilter}
          totalResults={finalFiltered.length}
          resetAllFilters={resetAllFilters}
          t={t}
        />

        <div className="overflow-x-auto">
          <ResidentTable residents={currentItems} onUpdate={handleUpdate} onDelete={handleDelete} t={t} />
        </div>

        <div className={`p-6 border-t ${t.cardBorder}`}>
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
            totalItems={finalFiltered.length} 
            itemsPerPage={itemsPerPage} 
            t={t}
          />
        </div>
      </div>
    </div>
  );
};

export default Residents;