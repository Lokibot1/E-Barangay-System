import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', t }) => {
  const colorMap = {
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20',
    blue: 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20',
    amber: 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20',
    rose: 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20',
    purple: 'text-purple-600 bg-purple-50 border-purple-100 dark:bg-purple-500/10 dark:border-purple-500/20',
    slate: 'text-slate-600 bg-slate-50 border-slate-100 dark:bg-slate-500/10 dark:border-slate-500/20'
  };

  const activeColor = colorMap[color] || colorMap.blue;

  return (
    <div className={`${t?.cardBg} rounded-[2rem] p-6 border ${t?.cardBorder} hover:shadow-md transition-all duration-300`}>
      <div className="flex items-start justify-between mb-4">
        <h3 className={`text-[10px] font-black ${t?.subtleText} uppercase tracking-widest`}>
          {title}
        </h3>
        {Icon && (
          <div className={`p-2.5 rounded-2xl border ${activeColor}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      
      <div className={`text-3xl font-spartan font-black ${t?.cardText} mb-1`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      
      {subtitle && (
        <div className={`text-[10px] font-bold ${t?.subtleText} uppercase tracking-tight`}>
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default StatCard;