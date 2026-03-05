import React from 'react';
import { Search, X } from 'lucide-react';

const VerificationFilters = ({ searchTerm, setSearchTerm, t }) => {
  return (
    <div className={`p-6 border-b ${t.cardBorder} ${t.inlineBg}`}>
      <div className="flex items-center">
        <div className="relative w-full max-w-xl group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 group-focus-within:text-emerald-500 text-slate-400">
            <Search size={20} />
          </div>

          <input
            type="text"
            placeholder="Search name of a resident..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-12 pr-12 py-4 ${t.inputBg} border ${t.inputBorder} rounded-2xl text-sm font-bold outline-none ${t.inputText} focus:ring-4 ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm`}
          />

          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationFilters;