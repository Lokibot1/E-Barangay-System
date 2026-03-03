import React from 'react';
import { Search, X, FilterX } from 'lucide-react';
import FilterSelect from '../common/FilterSelect';
import { PUROK_OPTIONS, RESIDENCY_OPTIONS, SECTOR_OPTIONS } from '../../../constants/filter';

const ResidentFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  categoryFilter, 
  setCategoryFilter, 
  purokFilter, 
  setPurokFilter, 
  residencyFilter, 
  setResidencyFilter, 
  totalResults, 
  resetAllFilters,
  t 
}) => {
  
  const hasActiveFilters = searchTerm !== '' || categoryFilter !== 'All' || purokFilter !== 'All' || residencyFilter !== 'All';

  return (
    <div className={`flex flex-col ${t.cardBg}`}>
      {/* Upper Section: Search + Dropdowns */}
      <div className={`flex flex-col lg:flex-row lg:items-center justify-between p-6 sm:p-8 gap-4 border-b ${t.cardBorder}`}>
        
        {/* Search Bar - Full space (flex-1) para mahaba */}
        <div className="flex-1 w-full group">
          <div className="relative w-full">
            <Search 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-emerald-500 transition-colors" 
              size={18} 
            />
            <input
              type="text"
              placeholder="Search name or resident ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`
                w-full pl-11 pr-11 py-3 
                ${t.inputBg} 
                border-2 ${t.inputBorder} 
                rounded-2xl text-sm font-bold outline-none 
                ${t.inputText} 
                focus:ring-4 focus:ring-emerald-500/10 
                focus:border-emerald-500 
                transition-all shadow-sm font-kumbh
              `}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap md:flex-nowrap gap-3 items-center">
          <FilterSelect label="Sector" value={categoryFilter} onChange={setCategoryFilter} options={SECTOR_OPTIONS} t={t} />
          <FilterSelect label="Purok" value={purokFilter} onChange={setPurokFilter} options={PUROK_OPTIONS} t={t} />
          <FilterSelect label="Residency" value={residencyFilter} onChange={setResidencyFilter} options={RESIDENCY_OPTIONS} t={t} />
        </div>
      </div>

      {/* Results Bar - Same style as Household */}
      <div className={`px-8 py-3 ${t.inlineBg} border-b ${t.cardBorder} flex justify-between items-center`}>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className={`text-[15px] font-black uppercase tracking-widest ${t.subtleText}`}>
            {totalResults} Residents Found
          </span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetAllFilters}
            className="flex items-center text-[15px] font-black uppercase gap-1.5 text-rose-500 hover:text-rose-600 transition-colors group font-spartan"
          >
            <FilterX size={15} className="group-hover:rotate-12 transition-transform" /> 
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default ResidentFilters;