import React from 'react';
import { Search, X, FilterX } from 'lucide-react';
import FilterSelect from '../common/FilterSelect';
import { PUROK_OPTIONS, TENURE_OPTIONS, INDIGENT_OPTIONS } from '../../../constants/filter';

const HouseholdFilters = ({
  searchTerm,
  setSearchTerm,
  purokFilter,
  setPurokFilter,
  statusFilter,
  setStatusFilter,
  tenureFilter, 
  setTenureFilter, 
  totalResults,
  t 
}) => {

  const handleReset = () => {
    setSearchTerm('');
    setPurokFilter('All');
    setStatusFilter('All');
    setTenureFilter('All');
  };

  const hasActiveFilters = searchTerm !== '' || purokFilter !== 'All' || statusFilter !== 'All' || tenureFilter !== 'All';

  return (
    <div className={`flex flex-col ${t.cardBg}`}>
      {/* Upper Filter Section */}
      <div className={`flex flex-col lg:flex-row lg:items-center justify-between p-6 sm:p-8 gap-4 border-b ${t.cardBorder}`}>

        <div className="flex-1 w-full group"> 
          <div className="relative w-full">
            <Search 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-emerald-500 transition-colors" 
              size={18} 
            />
            <input
              type="text"
              placeholder="Search by ID or Head Name..."
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

        {/* High-Value Filters Group - Using your Exported Constants */}
        <div className="flex flex-wrap md:flex-nowrap gap-3 items-center">
          <FilterSelect label="Purok" value={purokFilter} onChange={setPurokFilter} options={PUROK_OPTIONS} t={t} />
          <FilterSelect label="Tenure" value={tenureFilter} onChange={setTenureFilter} options={TENURE_OPTIONS} t={t} />
          <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={INDIGENT_OPTIONS} t={t} />
        </div>
      </div>

      {/* Results Bar */}
      <div className={`px-8 py-3 ${t.inlineBg} border-b ${t.cardBorder} flex justify-between items-center`}>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className={`text-[15px] font-black uppercase tracking-widest ${t.subtleText}`}>
            {totalResults} Households Registered
          </span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleReset}
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

export default HouseholdFilters;