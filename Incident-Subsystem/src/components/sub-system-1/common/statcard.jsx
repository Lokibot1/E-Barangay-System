import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'emerald' }) => {
  const colorMap = {
    emerald: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10',
    blue: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10',
    amber: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10',
    red: 'text-red-500 bg-red-50 dark:bg-red-500/10'
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-800 hover:shadow-md dark:hover:shadow-slate-950/50 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
        {Icon && (
          <div className={`p-2 rounded-lg transition-colors ${colorMap[color] || colorMap.emerald}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">
        {value.toLocaleString()}
      </div>
      <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase">{subtitle}</div>
    </div>
  );
};

export default StatCard;