import React, { useState, useEffect, useMemo } from 'react';
import { Printer as PrinterIcon, FilterX } from 'lucide-react';

import ResidentTable from '../../components/sub-system-1/residents/ResidentTable';
import ResidentFilters from '../../components/sub-system-1/residents/ResidentFilters';
import ResidentStats from '../../components/sub-system-1/residents/ResidentStats';
import Pagination from '../../components/sub-system-1/common/pagination';
import FilterSelect from '../../components/sub-system-1/common/FilterSelect';

import { useResidents } from '../../hooks/shared/useResidents';
import { usePrinter } from '../../hooks/shared/usePrinter';
import { PUROK_OPTIONS, RESIDENCY_OPTIONS, SECTOR_OPTIONS } from '../../constants/filter';
import { getResidencyLabel } from '../../utils/residency';
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

  // --- FINAL FILTERING ---
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

  const printColumns = [
    { header: "#", key: "no", width: "5%", align: "center" },
    { header: "Full Name", key: "name", width: "25%" },
    { header: "Age", key: "age", width: "8%", align: "center" },
    { header: "Purok", key: "resolved_purok", width: "12%" },
    { header: "Address", key: "full_address", width: "25%" },
    { header: "Residency", key: "residency_status", width: "15%" },
  ];

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

  if (loading) return <div className={`p-10 text-center italic ${t.subtleText}`}>Loading records...</div>;

  return (
    <div className="p-6 sm:p-8 space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold font-spartan ${t.cardText} uppercase tracking-tight`}>Resident Index</h1>
          <p className={`text-xs ${t.subtleText} uppercase tracking-widest mt-1`}>Official Masterlist</p>
        </div>
        
        <button 
          onClick={() => printTable(
            "Resident Masterlist", 
            printColumns, 
            finalFiltered, 
            `Purok: ${purokFilter} | Sector: ${categoryFilter} | Status: ${residencyFilter}`
          )} 
          className="flex items-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-[10px] uppercase hover:opacity-90 transition-all shadow-sm"
        >
          <PrinterIcon size={14} /> Export Masterlist
        </button>
      </div>

      <ResidentStats residents={residents} t={t} />

      <div className={`${t.cardBg} border ${t.cardBorder} rounded-[2.5rem] overflow-hidden shadow-sm`}>
        <div className="p-8 space-y-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <ResidentFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} t={t} />
            </div>
            
            <div className="flex flex-wrap md:flex-nowrap gap-3 w-full lg:w-auto">
              <FilterSelect label="Sector" value={categoryFilter} onChange={setCategoryFilter} options={SECTOR_OPTIONS} t={t} />
              <FilterSelect label="Purok" value={purokFilter} onChange={setPurokFilter} options={PUROK_OPTIONS} t={t} />
              <FilterSelect label="Residency" value={residencyFilter} onChange={setResidencyFilter} options={RESIDENCY_OPTIONS} t={t} />
            </div>
          </div>
          
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className={`text-[12px] font-black uppercase tracking-widest ${t.subtleText}`}>
                {finalFiltered.length} Results Found
              </span>
            </div>
            {(searchTerm || categoryFilter !== 'All' || purokFilter !== 'All' || residencyFilter !== 'All') && (
              <button onClick={resetAllFilters} className="flex items-center gap-1.5 text-[9px] font-black uppercase text-rose-500 hover:text-rose-600 transition-colors">
                <FilterX size={12} /> Reset Filters
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <ResidentTable residents={currentItems} onUpdate={handleUpdate} onDelete={handleDelete} t={t} />
        </div>

        <div className="p-6 border-t border-slate-100">
          <Pagination 
            currentPage={currentPage} totalPages={totalPages} 
            onPageChange={setCurrentPage} totalItems={finalFiltered.length} 
            itemsPerPage={itemsPerPage} t={t}
          />
        </div>
      </div>
    </div>
  );
};

export default Residents;