import React, { useState, useEffect, useMemo } from 'react';
import { Printer } from 'lucide-react';
import ResidentTable from '../../components/sub-system-1/residents/ResidentTable';
import ResidentFilters from '../../components/sub-system-1/residents/ResidentFilters';
import Pagination from '../../components/sub-system-1/common/pagination';
import { useResidents } from '../../hooks/shared/useResidents';
import { usePrinter } from '../../hooks/shared/usePrinter';
import SectorLegend from '../../components/sub-system-1/common/SectorLegend';
import { PUROK_OPTIONS, RESIDENCY_OPTIONS, VOTER_OPTIONS } from '../../constants/filter';
import { getResidencyLabel } from '../../utils/residency';
import themeTokens from '../../Themetokens';

const Residents = () => {
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem('appTheme') || 'blue'
  );

  useEffect(() => {
    const handler = (e) => setCurrentTheme(e.detail);
    window.addEventListener('themeChange', handler);
    return () => window.removeEventListener('themeChange', handler);
  }, []);

  const t = themeTokens[currentTheme];

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

  const filteredResidents = useMemo(() => {
    return residents.filter(r => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (r.name?.toLowerCase() || '').includes(searchLower) ||
        (r.barangay_id?.toLowerCase() || '').includes(searchLower);

      const residentSectorName =
        (typeof r.sector === 'object' ? r.sector?.name : r.sector) || 'GENERAL POPULATION';
      const matchesCategory =
        categoryFilter === 'All' ||
        residentSectorName.toUpperCase() === categoryFilter.toUpperCase();

      const matchesPurok = purokFilter === 'All' || String(r.temp_purok_id) === purokFilter;

      const residentVoter = r.is_voter == 1 || r.is_voter === 'Yes' ? 'Yes' : 'No';
      const matchesVoter = voterFilter === 'All' || residentVoter === voterFilter;

      const resLabel = getResidencyLabel(r.residency_start_date);
      const matchesResidency = residencyFilter === 'All' || resLabel === residencyFilter;

      return matchesSearch && matchesCategory && matchesPurok && matchesVoter && matchesResidency;
    });
  }, [residents, searchTerm, categoryFilter, purokFilter, residencyFilter, voterFilter]);

  const sectorCounts = useMemo(() => {
    return residents.reduce((acc, r) => {
      const sectorName =
        (typeof r.sector === 'object' ? r.sector?.name : r.sector) || 'GENERAL POPULATION';
      acc[sectorName] = (acc[sectorName] || 0) + 1;
      return acc;
    }, {});
  }, [residents]);

  const totalItems = filteredResidents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredResidents.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, purokFilter, residencyFilter, voterFilter]);

  if (loading)
    return (
      <div className={`p-6 sm:p-8 ${t.subtleText} font-kumbh`}>
        Loading residents…
      </div>
    );
  if (error)
    return (
      <div className="p-6 sm:p-8 text-red-500 font-kumbh">Error: {error}</div>
    );

  return (
    <div className="p-6 sm:p-8 space-y-6 pb-20">
      {/* Page Header */}
      <div>
        <h1 className={`text-2xl font-spartan font-bold ${t.cardText} uppercase tracking-tight`}>
          Resident Barangay Index
        </h1>
        <p className={`text-xs font-kumbh ${t.subtleText} uppercase tracking-widest mt-1`}>
          Central Repository of Residents Data
        </p>
      </div>

      <ResidentFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        purokFilter={purokFilter}
        setPurokFilter={setPurokFilter}
        residencyFilter={residencyFilter}
        setResidencyFilter={setResidencyFilter}
        voterFilter={voterFilter}
        setVoterFilter={setVoterFilter}
        t={t}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className={`${t.cardBg} p-6 rounded-2xl border ${t.cardBorder} shadow-sm`}>
            <ResidentTable
              residents={currentData}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              t={t}
            />
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            t={t}
          />
        </div>

        <div className="space-y-6">
          <button
            onClick={() => printTable(filteredResidents)}
            className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${t.primaryGrad} text-white p-4 rounded-xl font-kumbh font-bold text-sm transition-all hover:opacity-90 shadow-sm`}
          >
            <Printer size={16} /> Export to PDF
          </button>

          <div className={`${t.cardBg} p-6 rounded-2xl border ${t.cardBorder} shadow-sm`}>
            <h3 className={`text-[10px] font-spartan font-bold ${t.subtleText} uppercase tracking-widest mb-4`}>
              Sector Distribution
            </h3>
            <SectorLegend counts={sectorCounts} />
          </div>

          <div className={`${t.primaryLight} p-4 rounded-xl border ${t.cardBorder} text-[10px] ${t.primaryText} font-kumbh font-bold leading-relaxed`}>
            <span className="font-spartan uppercase">Note:</span> Data is automatically
            filtered based on selected criteria. Resident records updated in real-time.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Residents;
