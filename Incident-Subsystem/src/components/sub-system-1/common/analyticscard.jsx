import React from 'react';

const AnalyticsCard = ({ title, subtitle, children }) => (
  <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
    <div className="p-5 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50">
      <h3 className="text-xs font-black uppercase tracking-[2px] text-gray-800 dark:text-gray-200">
        {title}
      </h3>
      {subtitle && (
        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mt-1">
          {subtitle}
        </p>
      )}
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

export default AnalyticsCard;