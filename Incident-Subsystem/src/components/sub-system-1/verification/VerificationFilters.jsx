import React from 'react';
import { Search } from 'lucide-react';

const VerificationFilters = ({ searchTerm, setSearchTerm, t }) => {
  return (
    <div className={`p-6 border-b ${t.cardBorder} ${t.inlineBg}`}>
      <div className="flex items-center">
        <div className="relative w-full max-w-xl">

          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />

          <input
            type="text"
            placeholder="Search name of a resident..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-12 pr-4 py-4 ${t.inputBg} border ${t.inputBorder} rounded-2xl text-sm font-bold outline-none ${t.inputText} focus:ring-4 ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm`}
          />
        </div>
      </div>
    </div>
  );
};

export default VerificationFilters;
