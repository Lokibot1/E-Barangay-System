import React from 'react';
import { Search, X } from 'lucide-react';

const ResidentFilters = ({ searchTerm, setSearchTerm, t }) => {
  return (
    <div className="relative w-full group">
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
          transition-all shadow-sm
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
  );
};

export default ResidentFilters;