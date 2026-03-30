import React from 'react';
import { UserX, Users } from 'lucide-react';
import { TABS } from '../constants';

const AccountTabs = ({ activeTab, isDark, tabCounts, fetching, onTabChange }) => (
  <div className={`flex items-center gap-1 p-1 rounded-2xl w-fit ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
    {TABS.map((tab) => (
      <button
        key={tab}
        type="button"
        onClick={() => onTabChange(tab)}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold font-kumbh transition-all ${
          activeTab === tab
            ? isDark ? 'bg-slate-700 text-slate-100 shadow-sm' : 'bg-white text-slate-900 shadow-sm'
            : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        {tab === 'active' ? <><Users size={12} /> Active</> : <><UserX size={12} /> Inactive</>}
        <span
          className={`ml-1 px-2 py-0.5 rounded-full text-[9px] font-semibold ${
            activeTab === tab
              ? tab === 'active'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-rose-100 text-rose-700'
              : isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'
          }`}
        >
          {fetching ? '-' : tabCounts[tab]}
        </span>
      </button>
    ))}
  </div>
);

export default AccountTabs;
