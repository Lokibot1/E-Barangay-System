import React from 'react';

const VerificationTabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="flex overflow-x-auto gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap
            ${activeTab === tab.id 
              ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <tab.icon size={14} /> {tab.label}
        </button>
      ))}
    </div>
  );
};

export default VerificationTabs;