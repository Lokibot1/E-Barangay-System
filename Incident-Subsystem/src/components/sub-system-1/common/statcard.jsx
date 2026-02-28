import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'emerald', t }) => {
  const colorMap = {
    emerald: 'text-emerald-500 bg-emerald-50',
    blue: 'text-blue-500 bg-blue-50',
    amber: 'text-amber-500 bg-amber-50',
    red: 'text-red-500 bg-red-50'
  };

  return (
    <div className={`${t?.cardBg ?? 'bg-white'} rounded-xl p-6 border ${t?.cardBorder ?? 'border-gray-200'} hover:shadow-md transition-all duration-300`}>
      <div className="flex items-start justify-between mb-4">
        <h3 className={`text-xs font-bold ${t?.subtleText ?? 'text-gray-500'} uppercase tracking-wider`}>{title}</h3>
        {Icon && (
          <div className={`p-2 rounded-lg transition-colors ${colorMap[color] || colorMap.emerald}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className={`text-3xl font-black ${t?.cardText ?? 'text-gray-900'} mb-1`}>
        {value.toLocaleString()}
      </div>
      <div className={`text-[11px] font-medium ${t?.subtleText ?? 'text-gray-400'} uppercase`}>{subtitle}</div>
    </div>
  );
};

export default StatCard;
