import React from 'react';

const PurokDistribution = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-800 transition-colors duration-300">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Purok Distribution</h3>
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <div className="w-32 h-32 rounded-full border-8 border-gray-200 dark:border-slate-800 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Chart visualization will be displayed here</p>
        </div>
      </div>
    </div>
  );
};

export default PurokDistribution;