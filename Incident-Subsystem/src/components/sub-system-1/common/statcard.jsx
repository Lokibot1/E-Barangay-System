import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', t, currentTheme }) => {
  const resolvedTheme =
    currentTheme || (typeof window !== 'undefined' ? localStorage.getItem('appTheme') || 'modern' : 'modern');
  const colorMap = {
    theme:
      resolvedTheme === 'dark'
        ? { color: '#e2e8f0', backgroundColor: '#334155' }
        : resolvedTheme === 'purple'
          ? { color: '#9333ea', backgroundColor: '#faf5ff' }
          : resolvedTheme === 'green'
            ? { color: '#16a34a', backgroundColor: '#f0fdf4' }
            : { color: '#2563eb', backgroundColor: '#eff6ff' },
    emerald: { color: '#059669', backgroundColor: '#ecfdf5' },
    blue: { color: '#2563eb', backgroundColor: '#eff6ff' },
    amber: { color: '#d97706', backgroundColor: '#fffbeb' },
    rose: { color: '#e11d48', backgroundColor: '#fff1f2' },
    red: { color: '#dc2626', backgroundColor: '#fef2f2' },
    purple: { color: '#9333ea', backgroundColor: '#faf5ff' },
    slate: { color: '#475569', backgroundColor: '#f1f5f9' },
    cyan: { color: '#0891b2', backgroundColor: '#ecfeff' },
    teal: { color: '#0f766e', backgroundColor: '#f0fdfa' },
  };

  const activeColor = colorMap[color] || colorMap.blue;

  return (
    <div
      className={`${t?.cardBg} min-h-[152px] rounded-2xl border ${t?.cardBorder} p-4 sm:p-5 shadow-sm transition-all duration-300 hover:shadow-md`}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className={`text-sm sm:text-base font-normal ${t?.cardText} font-kumbh`}>
          {title}
        </h3>
        {Icon && (
          <div
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
            style={activeColor}
          >
            <Icon size={15} strokeWidth={2.1} />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col items-center text-center">
        <div className={`text-3xl leading-none font-spartan font-semibold ${t?.cardText}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>

        {subtitle && (
          <div className={`mt-4 text-[11px] sm:text-xs font-medium ${t?.subtleText} font-kumbh`}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
