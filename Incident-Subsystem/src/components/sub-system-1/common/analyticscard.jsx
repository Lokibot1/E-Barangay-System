import React from 'react';

const AnalyticsCard = ({ title, subtitle, children, t }) => (
  <div className={`${t.cardBg} border ${t.cardBorder} shadow-sm overflow-hidden transition-colors duration-300`}>
    <div className={`p-5 border-b ${t.cardBorder} ${t.inlineBg}`}>
      <h3 className={`text-xs font-black uppercase tracking-[2px] ${t.cardText}`}>
        {title}
      </h3>
      {subtitle && (
        <p className={`text-[10px] ${t.subtleText} font-bold uppercase mt-1`}>
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
