/**
 * Residents.jsx
 * Combined Version: Modern UI + Integrated Logic & Add Resident Action
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Printer as PrinterIcon, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import ResidentTable from '../../components/sub-system-1/residents/ResidentTable';
import ResidentFilters from '../../components/sub-system-1/residents/ResidentFilters';
import ResidentStats from '../../components/sub-system-1/residents/ResidentStats';
import Pagination from '../../components/sub-system-1/common/pagination';

import { useResidents } from '../../hooks/sub-system-1/useResidents';
import { usePrinter } from '../../hooks/sub-system-1/usePrinter';
import { getResidencyLabel } from '../../utils/sub-system-1/residency';
import themeTokens from '../../Themetokens';

const Residents = () => {
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('appTheme') || 'modern');
  const navigate = useNavigate();
  
  // Theme listener
  useEffect(() => {
    const handler = (e) => setCurrentTheme(e.detail);
    window.addEventListener('themeChange', handler);
    return () => window.removeEventListener('themeChange', handler);
  }, []);

  const t = themeTokens[currentTheme] || themeTokens.modern;
  const isDark = currentTheme === 'dark';

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

  // Filtering Logic
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

  // Pagination Logic
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
    <div className={`font-sans min-h-screen py-4 pb-24 px-3 sm:px-4 lg:px-5 relative ${t.pageBg}`}>
      <div className="mx-auto flex h-64 w-full max-w-[1600px] items-center justify-center">
        <div className={`animate-pulse font-semibold font-kumbh ${t.subtleText}`}>Syncing records...</div>
      </div>
    </div>
  );

  return (
    <div className={`font-sans min-h-screen py-4 pb-24 px-3 sm:px-4 lg:px-5 relative ${t.pageBg}`}>
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="animate-in fade-in duration-500 space-y-6 pt-4 sm:pt-5">
          
          {/* Header Section with Actions */}
          <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl space-y-3 text-left">
              <div className="space-y-2 text-left">
                <h1 className={`text-[2.25rem] sm:text-[2.1rem] font-bold tracking-tight text-left ${t.cardText} font-spartan`}>
                  Resident index
                </h1>
                <p className={`max-w-2xl text-[13px] leading-6 sm:text-[13px] text-left ${t.subtleText} font-kumbh`}>
                  Maintain the official masterlist, filter demographic sectors, and review resident records from one organized workspace.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Action: Add Resident */}
              <button 
                onClick={() => navigate('/admin/residents/add')} 
                className={`inline-flex items-center gap-2 rounded-[20px] px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all active:scale-[0.98] ${t.primarySolid} ${t.primaryHover}`}
              >
                <UserPlus size={16} />
                Add Resident
              </button>

              {/* Action: Export */}
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
                className={`inline-flex items-center gap-2 rounded-[20px] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(15,23,42,0.14)] transition-all active:scale-[0.98] ${
                    isDark ? 'bg-slate-700 hover:bg-slate-600 shadow-slate-950/30' : 'bg-slate-800 hover:bg-slate-900'
                }`}
              >
                <PrinterIcon size={15} />
                Export Masterlist
              </button>
            </div>
          </section>

          {/* Stats Cards */}
          <ResidentStats residents={residents} t={t} currentTheme={currentTheme} />

          {/* Table Container */}
          <div className={`${t.cardBg} border ${t.cardBorder} overflow-hidden rounded-[30px] shadow-[0_18px_45px_rgba(15,23,42,0.08)] flex flex-col`}>
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
              currentTheme={currentTheme}
            />

            <div className="overflow-x-auto">
                <ResidentTable
                residents={currentItems}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                t={t}
                currentTheme={currentTheme}
                />
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={finalFiltered.length}
              itemsPerPage={itemsPerPage}
              t={t}
              currentTheme={currentTheme}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Residents;