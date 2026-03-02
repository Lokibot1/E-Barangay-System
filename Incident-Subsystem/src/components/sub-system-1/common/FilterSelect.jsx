import React from 'react';
import { ChevronDown } from 'lucide-react';

const FilterSelect = ({ label, value, onChange, options, t }) => {
  const isActive = value !== 'All';

  return (
    <div className="relative min-w-[160px] w-full lg:w-48">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full appearance-none pl-5 pr-10 py-3.5
          ${t.inputBg} 
          border-2 outline-none transition-all shadow-sm cursor-pointer
          rounded-2xl text-[11px] font-black uppercase tracking-wider
          ${t.inputText} 
          ${isActive 
            ? 'border-emerald-500 ring-4 ring-emerald-500/10' 
            : `${t.inputBorder} focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10`
          }
        `}
      >
        <option value="All">{label}: ALL</option>
        {options && options.map((opt, index) => {
    
          const val = typeof opt === 'object' ? opt.value : opt;
          const display = typeof opt === 'object' ? opt.label : opt;
          
          return (
            <option key={val || index} value={val}>
              {display}
            </option>
          );
   
        })}
      </select>
      <ChevronDown 
        size={14} 
        className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${isActive ? 'text-emerald-500' : 'text-slate-400'}`} 
      />
    </div>
  );
};

export default FilterSelect;