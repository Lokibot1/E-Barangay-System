import React from 'react';

const activeToneMap = {
  modern: 'border-blue-200 bg-blue-50 text-blue-700 shadow-[0_8px_18px_rgba(37,99,235,0.10)]',
  blue: 'border-blue-200 bg-blue-50 text-blue-700 shadow-[0_8px_18px_rgba(37,99,235,0.10)]',
  purple: 'border-purple-200 bg-purple-50 text-purple-700 shadow-[0_8px_18px_rgba(147,51,234,0.10)]',
  green: 'border-green-200 bg-green-50 text-green-700 shadow-[0_8px_18px_rgba(22,163,74,0.10)]',
  dark: 'border-slate-600 bg-slate-800 text-slate-100 shadow-none',
};

const VerificationTabs = ({ tabs, activeTab, setActiveTab, t, currentTheme }) => {
  const isDark = currentTheme === 'dark';
  const activeTone = activeToneMap[currentTheme] || activeToneMap.modern;
  const shellTone = isDark
    ? 'border-slate-700 bg-slate-900/70'
    : `border-slate-200 bg-slate-50/90`;
  const inactiveTone = isDark
    ? `border-transparent text-slate-400 hover:border-slate-700 hover:bg-slate-900 hover:text-slate-100`
    : `${t.subtleText} border-transparent hover:border-slate-200 hover:bg-white hover:text-slate-800`;
  const inactiveIconTone = isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-500';
  const activeIconTone = isDark ? 'bg-slate-700 text-slate-100' : 'bg-white text-current';

  return (
    <div className={`flex max-w-full overflow-x-auto gap-1.5 rounded-[20px] border p-1.5 ${shellTone}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`group flex items-center gap-2.5 rounded-[16px] border px-3.5 py-2 text-[13px] font-semibold transition-all whitespace-nowrap ${
            activeTab === tab.id ? activeTone : inactiveTone
          }`}
        >
          <span className={`flex h-8 w-8 items-center justify-center rounded-[12px] ${
            activeTab === tab.id ? activeIconTone : inactiveIconTone
          }`}>
            <tab.icon size={14} strokeWidth={2.1} />
          </span>
          <span className="font-kumbh">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default VerificationTabs;
