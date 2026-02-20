import React from "react";

const ChartCard = ({ title, t, children }) => (
  <div className={`${t.cardBg} border ${t.cardBorder} rounded-xl p-4 shadow-sm`}>
    <h3 className={`font-spartan text-base font-bold ${t.cardText} mb-3`}>{title}</h3>
    {children}
  </div>
);

export default ChartCard;
