import React from "react";
import { getFactorTheme } from "./chartTheme";

const ChartCard = ({ title, subtitle, rightLabel, t, children, currentTheme = "modern" }) => {
  const factorTheme = getFactorTheme(currentTheme);

  return (
    <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className={`font-spartan text-base sm:text-lg font-bold ${t.cardText}`}>{title}</h3>
          {subtitle && <p className={`text-xs mt-1 font-kumbh ${t.subtleText}`}>{subtitle}</p>}
        </div>
        {rightLabel && (
          <span className={`inline-flex h-7 px-3 items-center rounded-full text-[11px] font-semibold border font-kumbh ${factorTheme.badgeClass}`}>
            {rightLabel}
          </span>
        )}
      </div>
      <div className={`rounded-xl border p-2 sm:p-3 ${factorTheme.panelClass}`}>
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
