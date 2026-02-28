import React from 'react';
import { Search, } from 'lucide-react';
import FilterSelect from '../common/FilterSelect';

const HouseholdFilters = ({ 
  searchTerm, setSearchTerm, 
  purokFilter, setPurokFilter,
  statusFilter, setStatusFilter,
  materialFilter, setMaterialFilter,
  totalResults 
}) => {

  const handleReset = () => {
    setSearchTerm('');
    setPurokFilter('All');
    setStatusFilter('All');
    setMaterialFilter('All');
  };

  const hasActiveFilters = searchTerm !== '' || purokFilter !== 'All' || statusFilter !== 'All' || materialFilter !== 'All';

  const puroks = [
    { label: 'Purok 1', value: '1' },
    { label: 'Purok 2', value: '2' },
    { label: 'Purok 3', value: '3' },
    { label: 'Purok 4', value: '4' },
    { label: 'Purok 5', value: '5' },
    { label: 'Purok 6', value: '6' },
    { label: 'Purok 7', value: '7' },
  ];

  const statusOptions = [
    { label: 'Indigent', value: '1' },
    { label: 'General', value: '0' },
  ];

  const materialOptions = [
    { label: 'Concrete', value: 'Concrete' },
    { label: 'Wood', value: 'Wood' },
    { label: 'Makeshift', value: 'Makeshift' },
    { label: 'Half Concrete', value: 'Half Concrete' },
  ];

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900">
      {/* Upper Section: Search and Dropdowns */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between p-6 gap-6 border-b border-slate-100 dark:border-slate-800">
        
        {/* Search Bar */}
        <div className="flex-1 w-full lg:max-w-md">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1 block">
            Search Household
          </span>
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by ID or Head..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none dark:text-white focus:ring-4 ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap md:flex-nowrap gap-4 items-end">
          <FilterSelect label="Purok" value={purokFilter} onChange={setPurokFilter} options={puroks} />
          <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
          <FilterSelect label="Wall Material" value={materialFilter} onChange={setMaterialFilter} options={materialOptions} />
        </div>
      </div>

      <div className="px-8 py-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
        <span className="text-slate-500 text-sm">
          Results: <span className="text-emerald-600 text">{totalResults} Households Found</span>
        </span>
        
        {hasActiveFilters && (
          <button 
            onClick={handleReset} 
            className="flex items-center text-sm gap-1.5 text-rose-500 hover:text-rose-600 transition-colors group"
          >
            Clear Filters ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default HouseholdFilters;