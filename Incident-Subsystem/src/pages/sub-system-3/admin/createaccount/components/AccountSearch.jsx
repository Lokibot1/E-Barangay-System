import React from 'react';
import { Search, X } from 'lucide-react';

const AccountSearch = ({ t, isDark, inputBase, searchTerm, onSearchChange, onClear }) => (
  <div className={`${t.cardBg} border ${t.cardBorder} rounded-[2rem] p-5`}>
    <div className="relative">
      <Search size={15} className={`absolute left-4 top-1/2 -translate-y-1/2 ${t.subtleText}`} />
      <input
        type="text"
        placeholder="Search name, username, or email..."
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
        className={`w-full pl-10 pr-10 py-3 rounded-2xl border text-sm font-medium font-kumbh transition-all outline-none ${inputBase} ${isDark ? 'text-slate-200 placeholder:text-slate-500' : 'text-slate-700 placeholder:text-slate-400'}`}
      />
      {searchTerm && (
        <button
          type="button"
          onClick={onClear}
          className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${t.subtleText} hover:text-rose-500`}
        >
          <X size={14} />
        </button>
      )}
    </div>
  </div>
);

export default AccountSearch;

