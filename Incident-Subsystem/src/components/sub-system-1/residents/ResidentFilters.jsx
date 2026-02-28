import React from 'react';
import { Search } from 'lucide-react';

const ResidentFilters = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
      <input
        type="text"
        placeholder="Search name or resident ID..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none dark:text-white focus:ring-4 ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
      />
    </div>
  );
};

export default ResidentFilters;