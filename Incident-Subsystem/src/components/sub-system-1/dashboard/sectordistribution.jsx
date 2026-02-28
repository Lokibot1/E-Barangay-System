import React from 'react';

const SectorDistribution = ({ t }) => {
  return (
    <div className={`${t.cardBg} rounded-xl p-6 border ${t.cardBorder} transition-colors duration-300`}>
      <h3 className={`text-base font-semibold ${t.cardText} mb-4`}>
        Sector Distribution
      </h3>
      <div className="flex items-center justify-center h-48">
        <div className="w-full max-w-md">
          <div className={`h-2 ${t.cardBorder} rounded-full overflow-hidden`}>
            <div className="h-full bg-emerald-500 rounded-full animate-pulse w-3/4"></div>
          </div>
          <p className={`text-sm ${t.subtleText} text-center mt-4 font-medium`}>
            Chart visualization will be displayed here
          </p>
        </div>
      </div>
    </div>
  );
};

export default SectorDistribution;
