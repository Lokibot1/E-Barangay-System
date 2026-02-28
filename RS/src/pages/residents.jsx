import React, { useState, useEffect, useMemo } from 'react';
import { Printer } from 'lucide-react';
import ResidentTable from '../components/residents/ResidentTable';
import ResidentFilters from '../components/residents/ResidentFilters';
import Pagination from '../components/common/pagination';
import { useResidents } from '../hooks/useResidents';
import { usePrinter } from '../hooks/usePrinter'; 
import SectorLegend from '@/components/common/SectorLegend';
import FilterSelect from '@/components/common/FilterSelect';
import { PUROK_OPTIONS, RESIDENCY_OPTIONS, VOTER_OPTIONS } from '@/constants/filter';
import { getResidencyLabel } from '@/utils/residency';

const Residents = () => {
  const { 
    residents, loading, error, searchTerm, setSearchTerm, 
    categoryFilter, setCategoryFilter, handleUpdate, handleDelete,
  } = useResidents();
  
  const { printTable } = usePrinter(); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [purokFilter, setPurokFilter] = useState('All');
  const [residencyFilter, setResidencyFilter] = useState('All');
  const [voterFilter, setVoterFilter] = useState('All');

  // 1. Optimized Filtering Logic
  const filteredResidents = useMemo(() => {
    return residents.filter(r => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (r.name?.toLowerCase() || "").includes(searchLower) || (r.barangay_id?.toLowerCase() || "").includes(searchLower);
      
      const residentSectorName = (typeof r.sector === 'object' ? r.sector?.name : r.sector) || 'GENERAL POPULATION';
      const matchesCategory = categoryFilter === 'All' || residentSectorName.toUpperCase() === categoryFilter.toUpperCase();
      
      const matchesPurok = purokFilter === 'All' || String(r.temp_purok_id) === purokFilter;
      
      const residentVoter = (r.is_voter == 1 || r.is_voter === 'Yes') ? 'Yes' : 'No';
      const matchesVoter = voterFilter === 'All' || residentVoter === voterFilter;
      
      const resLabel = getResidencyLabel(r.residency_start_date);
      const matchesResidency = residencyFilter === 'All' || resLabel === residencyFilter;

      return matchesSearch && matchesCategory && matchesPurok && matchesVoter && matchesResidency;
    });
  }, [residents, searchTerm, categoryFilter, purokFilter, residencyFilter, voterFilter]);

  // 2. Sector Counts for Legend
  const sectorCounts = useMemo(() => {
    return residents.reduce((acc, r) => {
      const sectorName = (typeof r.sector === 'object' ? r.sector?.name : r.sector) || 'GENERAL POPULATION';
      const key = sectorName.toUpperCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [residents]);

  const handlePrint = () => {
    const columns = [
      { header: "No.", key: "no", width: "40px", align: "center" },
      { header: 'Full Name', key: 'name', width: "180px" },
      { header: 'Age', key: 'age', width: "50px", align: "center" },
      { header: 'Purok', key: 'display_purok' },
      { header: 'Sector', key: 'display_sector' },
      { header: 'Voter', key: 'display_voter', width: "90px" },
      { header: 'Residency', key: 'display_residency', width: "100px" }
    ];

    const dataToPrint = filteredResidents.map(r => ({
      ...r,
      display_purok: r.resolved_purok || `Purok ${r.temp_purok_id}`,
      display_sector: (typeof r.sector === 'object' ? r.sector?.name : r.sector) || 'GENERAL POPULATION',
      display_voter: (r.is_voter == 1 || r.is_voter === 'Yes') ? 'Registered' : 'Non-Registered',
      display_residency: getResidencyLabel(r.residency_start_date).toUpperCase()
    }));

    const filterSummary = `Sector: ${categoryFilter} | Purok: ${purokFilter} | Voter: ${voterFilter} | Residency: ${residencyFilter}`;

    printTable("Barangay Resident Masterlist", columns, dataToPrint, filterSummary);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setPurokFilter('All');
    setResidencyFilter('All');
    setVoterFilter('All');
  };

  const totalPages = Math.ceil(filteredResidents.length / itemsPerPage) || 1;
  const currentItems = filteredResidents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, categoryFilter, purokFilter, residencyFilter, voterFilter]);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 uppercase tracking-tight">Masterlist Management</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Official Barangay Records</p>
        </div>
        <button 
          onClick={handlePrint} 
          disabled={filteredResidents.length === 0} 
          className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase hover:opacity-90 shadow-lg transition-all active:scale-95 disabled:opacity-50"
        >
          <Printer size={16} /> Print Masterlist
        </button>
      </div>

      <SectorLegend activeFilter={categoryFilter} onFilterChange={setCategoryFilter} counts={sectorCounts} />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
        {error && (
          <div className="mx-6 mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between p-6 gap-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex-1 w-full lg:max-w-md">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1 block">
              Search Resident
            </span>
            <ResidentFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </div>
          <div className="flex flex-wrap md:flex-nowrap gap-3 items-end w-full lg:w-auto">
            <FilterSelect label="Purok" value={purokFilter} onChange={setPurokFilter} options={PUROK_OPTIONS} />
            <FilterSelect label="Voter Status" value={voterFilter} onChange={setVoterFilter} options={VOTER_OPTIONS} />
            <FilterSelect label="Residency" value={residencyFilter} onChange={setResidencyFilter} options={RESIDENCY_OPTIONS} />
          </div>
        </div>

        <div className="px-8 py-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] font-black uppercase">
          <span className="text-slate-500 text-sm">Results: <span className="text-emerald-600 text-sm">{filteredResidents.length} Residents Found</span></span>
          {(searchTerm || categoryFilter !== 'All' || purokFilter !== 'All' || voterFilter !== 'All' || residencyFilter !== 'All') && (
            <button onClick={resetFilters} className="text-rose-500 hover:underline text-sm">Clear Filters ✕</button>
          )}
        </div>
        
        {loading ? (
          <div className="p-10 text-center italic text-slate-400">Loading...</div>
        ) : (
          <>
            <ResidentTable residents={currentItems} onUpdate={handleUpdate} handleDelete={handleDelete} />
            
            <div className="p-6 border-t border-slate-100 dark:border-slate-800">
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
                totalItems={filteredResidents.length} 
                itemsPerPage={itemsPerPage} 
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Residents;
