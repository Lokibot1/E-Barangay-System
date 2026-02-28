import React from 'react';

const PurokDistribution = ({ t }) => {
  return (
    <div className={`${t.cardBg} rounded-xl p-6 border ${t.cardBorder} transition-colors duration-300`}>
      <h3 className={`text-base font-semibold ${t.cardText} mb-4`}>Purok Distribution</h3>
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <div className={`w-32 h-32 rounded-full border-8 ${t.cardBorder} mx-auto mb-4`}></div>
          <p className={`text-sm ${t.subtleText} font-medium`}>Chart visualization will be displayed here</p>
        </div>
      </div>
    </div>
  );
};

export default PurokDistribution;
