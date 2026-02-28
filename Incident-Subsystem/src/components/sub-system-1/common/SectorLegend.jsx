import React from 'react';

export const sectorStyles = {
  'SOLO PARENT': 'bg-orange-100 text-orange-700 border-orange-200 ring-orange-500',
  'PWD': 'bg-purple-100 text-purple-700 border-purple-200 ring-purple-500',
  'SENIOR CITIZEN': 'bg-blue-100 text-blue-700 border-blue-200 ring-blue-500',
  'LGBTQIA+': 'bg-rose-100 text-rose-700 border-rose-200 ring-rose-500',
  'KASAMBAHAY': 'bg-emerald-100 text-emerald-700 border-emerald-200 ring-emerald-500',
  'OFW': 'bg-indigo-100 text-indigo-700 border-indigo-200 ring-indigo-500',
  'GENERAL POPULATION': 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-400',
};

const SectorLegend = ({ activeFilter, onFilterChange, counts = {} }) => {
  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm mb-4">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Sector Dashboard
          </span>
        </div>
        {activeFilter !== 'All' && (
          <button 
            onClick={() => onFilterChange('All')}
            className="text-[11px] font-black text-rose-500 uppercase hover:bg-rose-50 px-3 py-1 rounded-full transition-all"
          >
            Reset Selection ↺
          </button>
        )}
      </div>

      {/* Mini Dashboard Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Total Population Card */}
        <button
          onClick={() => onFilterChange('All')}
          className={`flex flex-col items-start px-4 py-3 rounded-2xl border-2 transition-all shadow-sm ${
            activeFilter === 'All' 
            ? 'bg-slate-900 text-white border-slate-900 shadow-md dark:bg-slate-800 dark:border-slate-600' 
            : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:border-slate-300'
          }`}
        >
          <span className="text-[8px] font-black uppercase tracking-wider opacity-60 mb-1">Total</span>
          <span className="text-2xl font-black leading-none">{totalCount}</span>
        </button>

        {/* Dynamic Sector Cards */}
        {Object.entries(sectorStyles).map(([name, style]) => {
          const isActive = activeFilter === name;
          const count = counts[name] || 0;
          const baseStyles = style.split(' ring-')[0]; 

          return (
            <button
              key={name}
              onClick={() => onFilterChange(name)}
              className={`flex flex-col items-start px-4 py-3 rounded-2xl border-2 transition-all shadow-sm ${baseStyles} ${
                isActive 
                  ? 'ring-4 ring-slate-900/10 dark:ring-white/10 !border-slate-900 dark:!border-white' 
                  : 'border-transparent opacity-85 hover:opacity-100'
              }`}
            >
              <span className="text-[8px] font-black uppercase tracking-tight mb-1 truncate w-full text-left">
                {name}
              </span>
              <span className="text-xl font-black leading-none">
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SectorLegend;
