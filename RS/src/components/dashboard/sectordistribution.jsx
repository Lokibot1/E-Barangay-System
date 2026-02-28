import React from 'react';

const SectorDistribution = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-800 transition-colors duration-300">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
        Sector Distribution
      </h3>
      <div className="flex items-center justify-center h-48">
        <div className="w-full max-w-md">
          <div className="h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full animate-pulse w-3/4"></div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4 font-medium">
            Chart visualization will be displayed here
          </p>
        </div>
      </div>
    </div>
  );
};

export default SectorDistribution;