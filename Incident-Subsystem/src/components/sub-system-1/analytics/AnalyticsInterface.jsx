// ============================================================
// AnalyticsUI.jsx
// Shared UI building blocks for all analytics tabs.
// Import from: './AnalyticsUI'
// ============================================================

// STAT CARD
export function StatCard({ icon, label, value, sub, color = 'primary', trend, t }) {
  const accent = {
    primary:   { border: 'border-[#1a5276]/30', icon: 'text-[#1a5276] bg-[#1a5276]/10', trend: 'bg-[#1a5276]/10 text-[#1a5276]' },
    success:   { border: 'border-[#27ae60]/30', icon: 'text-[#27ae60] bg-[#27ae60]/10', trend: 'bg-[#27ae60]/10 text-[#27ae60]' },
    warning:   { border: 'border-[#e67e22]/30', icon: 'text-[#e67e22] bg-[#e67e22]/10', trend: 'bg-[#e67e22]/10 text-[#e67e22]' },
    danger:    { border: 'border-[#e74c3c]/30', icon: 'text-[#e74c3c] bg-[#e74c3c]/10', trend: 'bg-[#e74c3c]/10 text-[#e74c3c]' },
    purple:    { border: 'border-[#8e44ad]/30', icon: 'text-[#8e44ad] bg-[#8e44ad]/10', trend: 'bg-[#8e44ad]/10 text-[#8e44ad]' },
    teal:      { border: 'border-[#16a085]/30', icon: 'text-[#16a085] bg-[#16a085]/10', trend: 'bg-[#16a085]/10 text-[#16a085]' },
    secondary: { border: 'border-[#2980b9]/30', icon: 'text-[#2980b9] bg-[#2980b9]/10', trend: 'bg-[#2980b9]/10 text-[#2980b9]' },
    gray:      { border: 'border-[#7f8c8d]/30', icon: 'text-[#7f8c8d] bg-[#7f8c8d]/10', trend: 'bg-[#7f8c8d]/10 text-[#7f8c8d]' },
  };
  const c = accent[color] ?? accent.primary;
  const Icon = icon;
  const isComponentIcon = typeof icon === 'function' || (typeof icon === 'object' && icon !== null);

  return (
    <div className={`${t ? t.cardBg : 'bg-white'} rounded-xl p-4 border ${t ? t.cardBorder : 'border-gray-200'} ${c.border} shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-1 min-w-0`}>
      <div className="flex items-center justify-between">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${c.icon}`}>
          {isComponentIcon ? (
            <Icon size={20} strokeWidth={2.2} />
          ) : (
            <span className="text-lg leading-none">{icon ?? '*'}</span>
          )}
        </div>
        {trend && (
          <span className={`text-xs font-bold rounded-md px-2 py-0.5 ${c.trend}`}>{trend}</span>
        )}
      </div>
      <div className={`text-3xl font-black tracking-tight ${t ? t.cardText : 'text-slate-900'} mt-2`}>
        {typeof value === 'number' ? value.toLocaleString() : (value ?? '-')}
      </div>
      <div className={`text-sm font-semibold ${t ? t.cardText : 'text-slate-700'}`}>{label}</div>
      {sub && <div className={`text-xs ${t ? t.subtleText : 'text-slate-500'}`}>{sub}</div>}
    </div>
  );
}

// CARD
export function Card({ title, children, className = '', t }) {
  return (
    <div className={`${t ? t.cardBg : 'bg-white'} rounded-xl p-5 shadow border ${t ? t.cardBorder : 'border-gray-100'} ${className}`}>
      {title && (
        <h3 className={`font-black text-[#1a5276] mb-4 text-xs uppercase tracking-widest`}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

// SECTION HEADER
export function SectionHeader({ title, subtitle, t }) {
  return (
    <div className="mb-5">
      <h2 className={`text-xl font-black text-[#1a5276] tracking-tight`}>{title}</h2>
      {subtitle && <p className={`text-sm ${t ? t.subtleText : 'text-gray-500'} mt-0.5`}>{subtitle}</p>}
    </div>
  );
}

// SPINNER
export function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-[#1a5276] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// EMPTY STATE
export function EmptyState({ icon = '*', message = 'No data available.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <span className="text-4xl mb-2">{icon}</span>
      <p className="text-sm">{message}</p>
    </div>
  );
}

// INSIGHT CARD
export function InsightCard({ type, icon, title, description, action, priority, metric, metric_label }) {
  const styles = {
    alert:   { wrap: 'border-l-4 border-red-500 bg-red-50', badge: 'bg-red-100 text-red-700' },
    warning: { wrap: 'border-l-4 border-orange-400 bg-orange-50', badge: 'bg-orange-100 text-orange-700' },
    info:    { wrap: 'border-l-4 border-blue-500 bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
    success: { wrap: 'border-l-4 border-green-500 bg-green-50', badge: 'bg-green-100 text-green-700' },
  };
  const s = styles[type] ?? styles.info;
  const priorityBadge = {
    HIGH: 'bg-red-100 text-red-700',
    MEDIUM: 'bg-orange-100 text-orange-700',
    LOW: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className={`rounded-lg p-4 mb-3 ${s.wrap}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5 flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1 gap-2 flex-wrap">
            <span className="font-bold text-gray-800 text-sm leading-tight">{title}</span>
            <div className="flex items-center gap-2 flex-shrink-0">
              {metric !== undefined && (
                <span className="text-lg font-black text-gray-700">
                  {metric}
                  {metric_label && <span className="text-xs font-normal text-gray-500 ml-1">{metric_label}</span>}
                </span>
              )}
              {priority && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${priorityBadge[priority] ?? ''}`}>
                  {priority}
                </span>
              )}
            </div>
          </div>
          <p className="text-gray-600 text-sm leading-snug">{description}</p>
          {action && (
            <div className="mt-2 text-sm font-semibold text-[#1a5276] flex gap-1">
              <span>{'->'}</span><span>{action}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
