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
  t,
  currentTheme = 'modern',
}) => {
  const isDark = currentTheme === 'dark';
  const accentMap = {
    modern: { icon: 'group-focus-within:text-blue-500', ring: 'focus:ring-blue-500/10', border: 'focus:border-blue-500', dot: 'bg-blue-500' },
    blue: { icon: 'group-focus-within:text-blue-500', ring: 'focus:ring-blue-500/10', border: 'focus:border-blue-500', dot: 'bg-blue-500' },
    purple: { icon: 'group-focus-within:text-purple-500', ring: 'focus:ring-purple-500/10', border: 'focus:border-purple-500', dot: 'bg-purple-500' },
    green: { icon: 'group-focus-within:text-green-500', ring: 'focus:ring-green-500/10', border: 'focus:border-green-500', dot: 'bg-green-500' },
    dark: { icon: 'group-focus-within:text-slate-300', ring: 'focus:ring-slate-500/10', border: 'focus:border-slate-500', dot: 'bg-slate-300' },
  };
  const accent = accentMap[currentTheme] || accentMap.modern;

  const handleReset = () => {
    setSearchTerm('');
    setPurokFilter('All');
    setStatusFilter('All');
    setTenureFilter('All');
  };

  const hasActiveFilters = searchTerm !== '' || purokFilter !== 'All' || statusFilter !== 'All' || tenureFilter !== 'All';

  return (
    <div className={`flex flex-col ${t.cardBg}`}>
      <div className={`border-b px-5 py-5 sm:px-6 ${t.cardBorder} ${isDark ? 'bg-slate-950/40' : 'bg-slate-50/80'}`}>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="group w-full xl:max-w-xl"> 
            <div className="relative w-full">
              <Search 
                className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors ${accent.icon}`} 
                size={18} 
              />
              <input
                type="text"
                placeholder="Search by household ID or head name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full rounded-[18px] border ${t.inputBorder} ${t.inputBg} ${t.inputText} pl-12 pr-11 py-3.5 text-sm font-normal outline-none transition-all focus:ring-4 ${accent.ring} ${accent.border} ${
                  isDark ? 'shadow-none' : 'shadow-[0_12px_24px_rgba(15,23,42,0.06)]'
                } font-kumbh`}
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

          <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-auto xl:grid-cols-3">
            <FilterSelect label="Purok" value={purokFilter} onChange={setPurokFilter} options={PUROK_OPTIONS} t={t} currentTheme={currentTheme} />
            <FilterSelect label="Tenure" value={tenureFilter} onChange={setTenureFilter} options={TENURE_OPTIONS} t={t} currentTheme={currentTheme} />
            <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={INDIGENT_OPTIONS} t={t} currentTheme={currentTheme} />
          </div>
        </div>
      </div>

      <div className={`border-b px-5 py-4 sm:px-6 ${t.cardBorder} ${isDark ? 'bg-slate-950/70' : 'bg-white/70'}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`h-2 w-2 rounded-full ${accent.dot}`} />
            <span className={`text-sm font-semibold font-kumbh ${t.cardText}`}>
              {totalResults} households registered
            </span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-500 hover:text-rose-600 transition-colors font-kumbh"
            >
              <FilterX size={15} />
              Reset Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HouseholdFilters;
