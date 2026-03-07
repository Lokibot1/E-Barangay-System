import React from 'react';
import { Search, X } from 'lucide-react';

const VerificationFilters = ({ searchTerm, setSearchTerm, t, currentTheme }) => {
  const isDark = currentTheme === 'dark';
  const accentMap = {
    modern: { icon: 'group-focus-within:text-blue-500', ring: 'focus:ring-blue-500/10', border: 'focus:border-blue-500' },
    blue: { icon: 'group-focus-within:text-blue-500', ring: 'focus:ring-blue-500/10', border: 'focus:border-blue-500' },
    purple: { icon: 'group-focus-within:text-purple-500', ring: 'focus:ring-purple-500/10', border: 'focus:border-purple-500' },
    green: { icon: 'group-focus-within:text-green-500', ring: 'focus:ring-green-500/10', border: 'focus:border-green-500' },
    dark: { icon: 'group-focus-within:text-slate-300', ring: 'focus:ring-slate-500/10', border: 'focus:border-slate-500' },
  };
  const accent = accentMap[currentTheme] || accentMap.modern;

  return (
    <div className={`border-b px-5 py-5 sm:px-6 ${t.cardBorder} ${isDark ? 'bg-slate-950/40' : 'bg-slate-50/80'}`}>
      <div className="flex justify-start">
        <div className="group relative w-full max-w-xl">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors ${accent.icon}`} size={18} />
          <input
            type="text"
            placeholder="Search name of a resident..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full rounded-[18px] border ${t.inputBorder} ${t.inputBg} ${t.inputText} ${t.inputPlaceholder} pl-12 pr-4 py-3.5 text-sm font-normal placeholder:font-normal outline-none transition-all focus:ring-2 ${accent.ring} ${accent.border} ${
              isDark ? 'shadow-none' : 'shadow-[0_12px_24px_rgba(15,23,42,0.06)]'
            }`}
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
