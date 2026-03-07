// ============================================================
// AnalyticsUI.jsx
// Shared UI building blocks for all analytics tabs.
// Import from: './AnalyticsUI'
// ============================================================

// STAT CARD
export function StatCard({ icon, label, value, sub, color = 'primary', trend, t }) {
  const resolvedTheme =
    typeof window !== 'undefined' ? localStorage.getItem('appTheme') || 'modern' : 'modern';
  const isDark = resolvedTheme === 'dark';

  const accent = {
    primary: {
      icon: { color: '#2563eb', backgroundColor: '#eaf2ff' },
      trend: { backgroundColor: '#eff6ff', color: '#1d4ed8' },
      panel: { backgroundColor: '#f5f9ff', borderColor: '#bfdbfe', color: '#2563eb' },
    },
    success: {
      icon: { color: '#059669', backgroundColor: '#ecfdf5' },
      trend: { backgroundColor: '#ecfdf5', color: '#047857' },
      panel: { backgroundColor: '#f0fdf8', borderColor: '#a7f3d0', color: '#047857' },
    },
    warning: {
      icon: { color: '#d97706', backgroundColor: '#fffbeb' },
      trend: { backgroundColor: '#fffbeb', color: '#b45309' },
      panel: { backgroundColor: '#fffaf0', borderColor: '#fcd34d', color: '#b45309' },
    },
    danger: {
      icon: { color: '#ef4444', backgroundColor: '#fef2f2' },
      trend: { backgroundColor: '#fef2f2', color: '#b91c1c' },
      panel: { backgroundColor: '#fff5f6', borderColor: '#fecdd3', color: '#dc2626' },
    },
    purple: {
      icon: { color: '#9333ea', backgroundColor: '#faf5ff' },
      trend: { backgroundColor: '#faf5ff', color: '#7e22ce' },
      panel: { backgroundColor: '#faf5ff', borderColor: '#d8b4fe', color: '#7e22ce' },
    },
    teal: {
      icon: { color: '#0f766e', backgroundColor: '#f0fdfa' },
      trend: { backgroundColor: '#f0fdfa', color: '#115e59' },
      panel: { backgroundColor: '#f0fdfa', borderColor: '#99f6e4', color: '#0f766e' },
    },
    secondary: {
      icon: { color: '#4f46e5', backgroundColor: '#eef2ff' },
      trend: { backgroundColor: '#eef2ff', color: '#4338ca' },
      panel: { backgroundColor: '#eef2ff', borderColor: '#c7d2fe', color: '#4338ca' },
    },
    gray: {
      icon: { color: '#475569', backgroundColor: '#f1f5f9' },
      trend: { backgroundColor: '#f1f5f9', color: '#334155' },
      panel: { backgroundColor: '#f8fafc', borderColor: '#cbd5e1', color: '#475569' },
    },
    dark: {
      icon: { color: '#e2e8f0', backgroundColor: '#1e293b' },
      trend: { backgroundColor: '#1e293b', color: '#e2e8f0' },
      panel: { backgroundColor: '#0f172a', borderColor: '#334155', color: '#cbd5e1' },
    },
  };
  const c = isDark ? accent.dark : (accent[color] ?? accent.primary);
  const Icon = icon;
  const isComponentIcon = typeof icon === 'function' || (typeof icon === 'object' && icon !== null);

  return (
    <div
      className={`
        ${t ? t.cardBg : 'bg-white'}
        min-h-[156px] rounded-[26px] border ${t ? t.cardBorder : 'border-[#e6e8f1]'}
        p-5 sm:p-6 shadow-[0_12px_30px_rgba(15,23,42,0.08)]
        hover:-translate-y-0.5 hover:shadow-[0_18px_35px_rgba(15,23,42,0.12)]
        transition-all duration-300 flex flex-col min-w-0
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={`text-[15px] font-medium ${t ? t.cardText : 'text-slate-800'} font-kumbh truncate`}>
            {label}
          </p>
          {trend && (
            <span
              className="mt-2 inline-flex text-[11px] font-semibold rounded-full px-2.5 py-1 font-kumbh"
              style={c.trend}
            >
              {trend}
            </span>
          )}
        </div>
        <div
          className="inline-flex h-10 w-10 rounded-[16px] flex items-center justify-center shrink-0"
          style={c.icon}
        >
          {isComponentIcon ? (
            <Icon size={18} strokeWidth={2.1} />
          ) : (
            <span className="text-lg leading-none">{icon ?? '*'}</span>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col items-center justify-center text-center">
        <div className={`text-3xl leading-none font-bold tracking-tight ${t ? t.cardText : 'text-slate-900'} font-spartan sm:text-[2.15rem]`}>
          {typeof value === 'number' ? value.toLocaleString() : (value ?? '-')}
        </div>

        {sub && (
          <div className="mt-5 w-full rounded-[18px] border px-4 py-3" style={c.panel}>
            <div className={`text-[13px] font-medium font-kumbh leading-snug ${isDark ? (t ? t.subtleText : 'text-slate-300') : ''}`}>
              {sub}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// CARD
export function Card({ title, children, className = '', t }) {
  return (
    <div className={`${t ? t.cardBg : 'bg-white'} rounded-2xl p-3.5 shadow-sm border ${t ? t.cardBorder : 'border-[#e6e8f1]'} ${className}`}>
      {title && (
        <h3 className={`text-base font-bold ${t ? t.cardText : 'text-slate-900'} mb-2.5`}>
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
    <div className="mb-3">
      <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${t ? t.cardText : 'text-slate-900'}`}>{title}</h2>
      {subtitle && <p className={`text-sm ${t ? t.subtleText : 'text-gray-500'} mt-0.5`}>{subtitle}</p>}
    </div>
  );
}

// SPINNER
export function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
                <span className="text-lg font-semibold text-gray-700">
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
            <div className="mt-2 text-sm font-semibold text-blue-700 flex gap-1">
              <span>{'->'}</span><span>{action}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
