import React from 'react';

const FilterSelect = ({ label, value, onChange, options }) => {
  return (
    <div className="flex flex-col items-start min-w-[150px] w-full md:w-auto">
      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
        {label}
      </span>
      <div className="relative w-full">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full pl-4 pr-10 py-3 text-sm font-bold border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl focus:ring-4 ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer shadow-sm hover:border-slate-300"
        >
          <option value="All">All</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
        </div>
      </div>
    </div>
  );
};

export default FilterSelect;