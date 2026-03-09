// ============================================================
// AnalyticsUI.jsx
// Shared UI building blocks for all analytics tabs.
// Import from: './AnalyticsUI'
// ============================================================

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

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
    <div className={`${t ? t.cardBg : 'bg-white'} rounded-[28px] border ${t ? t.cardBorder : 'border-[#e7ecf3]'} p-5 sm:p-6 shadow-[0_16px_34px_rgba(15,23,42,0.06)] ${className}`}>
      {title ? (
        <div className={`mb-4 border-b pb-4 ${t ? t.cardBorder : 'border-[#edf1f7]'}`}>
          <h3 className={`text-[1.02rem] font-bold tracking-tight ${t ? t.cardText : 'text-slate-900'}`}>
            {title}
          </h3>
        </div>
      ) : null}
      {children}
    </div>
  );
}

export const analyticsChartTheme = {
  gridStroke: '#e7edf4',
  axisTick: { fontSize: 11, fill: '#71829b' },
  axisTickSmall: { fontSize: 10, fill: '#71829b' },
  legendStyle: { fontSize: 12, paddingTop: 10, color: '#64748b' },
  barRadius: [12, 12, 0, 0],
  horizontalBarRadius: [0, 12, 12, 0],
};

export function formatChartDateLabel(value) {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{2}\/\d{2}$/.test(value)) return value;

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  return String(value);
}

export function AnalyticsTooltip({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
  dark = false,
}) {
  if (!active || !payload?.length) return null;

  const resolvedLabel = labelFormatter ? labelFormatter(label, payload) : label;

  return (
    <div className={`min-w-[160px] rounded-[14px] border px-3 py-2.5 shadow-[0_16px_40px_rgba(15,23,42,0.16)] ${
      dark ? 'border-black/10 bg-slate-950 text-white' : 'border-[#e7eaf5] bg-white text-slate-900'
    }`}>
      {resolvedLabel ? (
        <p className={`text-[10px] font-black uppercase tracking-[0.24em] ${dark ? 'text-slate-400' : 'text-slate-400'}`}>
          {resolvedLabel}
        </p>
      ) : null}
      <div className={`${resolvedLabel ? 'mt-2' : ''} space-y-2`}>
        {payload.map((entry, index) => {
          const marker = entry.payload?.color || entry.payload?.fill || entry.color || entry.fill || entry.stroke || '#94a3b8';
          const resolvedValue = valueFormatter
            ? valueFormatter(entry.value, entry.name, entry.payload, entry)
            : typeof entry.value === 'number'
              ? entry.value.toLocaleString()
              : entry.value;

          return (
            <div key={`${entry.dataKey || entry.name || 'value'}-${index}`} className="flex items-center justify-between gap-4">
              <span className={`flex items-center gap-2 text-[12px] ${dark ? 'text-slate-300' : 'text-slate-500'}`}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: marker }} />
                <span>{entry.name || entry.dataKey}</span>
              </span>
              <span className={`text-[13px] font-semibold ${dark ? 'text-white' : 'text-slate-700'}`}>{resolvedValue}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ChartCard({
  title,
  subtitle,
  rightLabel,
  rightContent,
  note,
  className = '',
  children,
  t,
}) {
  return (
    <div className={`${t ? t.cardBg : 'bg-white'} rounded-[30px] border ${t ? t.cardBorder : 'border-[#e7ecf3]'} p-5 sm:p-6 shadow-[0_16px_36px_rgba(15,23,42,0.06)] ${className}`}>
      <div className={`border-b pb-4 ${t ? t.cardBorder : 'border-[#edf1f7]'}`}>
        <div className="flex flex-col items-start gap-3 text-left sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 text-left">
            <h3 className={`text-left text-[1.08rem] font-bold tracking-tight ${t ? t.cardText : 'text-slate-900'}`}>
              {title}
            </h3>
            {subtitle ? (
              <p className={`mt-2 max-w-2xl text-left text-[13px] leading-6 ${t ? t.subtleText : 'text-slate-500'}`}>
                {subtitle}
              </p>
            ) : null}
          </div>
          {rightContent ? rightContent : rightLabel ? (
            <span className={`inline-flex items-center rounded-full border px-4 py-2 text-[12px] font-semibold ${
              t ? `${t.cardBorder} ${t.subtleText}` : 'border-[#dbe3ee] bg-[#fbfcfe] text-slate-600 shadow-[0_4px_12px_rgba(15,23,42,0.05)]'
            }`}>
              {rightLabel}
            </span>
          ) : null}
        </div>
        {note ? (
          <p className={`mt-3 text-[11px] leading-5 ${t ? t.subtleText : 'text-slate-500'}`}>
            {note}
          </p>
        ) : null}
      </div>
      <div className="pt-5">{children}</div>
    </div>
  );
}

export function DonutSummaryCard({
  title,
  subtitle,
  rightLabel,
  note,
  t,
  data,
  valueFormatter = (value) => (typeof value === 'number' ? value.toLocaleString() : value),
  centerLabel = 'Total',
  centerValue,
  innerRadius = 42,
  outerRadius = 92,
  className = '',
}) {
  const total = centerValue ?? data.reduce((sum, item) => sum + Number(item.value ?? 0), 0);
  const formattedTotal = valueFormatter(total);
  const centerDiskSize = Math.max(84, Math.min(innerRadius * 2 - 6, outerRadius * 2 - 52));
  const centerValueSize = String(formattedTotal).length > 6 ? 'text-[1.02rem]' : 'text-[1.58rem]';

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      rightLabel={rightLabel}
      note={note}
      className={className}
      t={t}
    >
      <div className="space-y-5">
        <div className="relative mx-auto h-[236px] w-full max-w-[268px] overflow-visible">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                paddingAngle={3}
                cornerRadius={8}
                dataKey="value"
                labelLine={false}
                label={({ percent, cx, cy, midAngle, innerRadius: ir, outerRadius: or }) => {
                  if (!percent || percent < 0.08) return null;
                  const angle = (-midAngle * Math.PI) / 180;
                  const label = `${Math.round(percent * 100)}%`;
                  const pillWidth = Math.max(30, label.length * 7 + 10);
                  const pillHeight = 20;
                  const halfW = pillWidth / 2;
                  const halfH = pillHeight / 2;
                  const radialHalfExtent = Math.abs(Math.cos(angle)) * halfW + Math.abs(Math.sin(angle)) * halfH;
                  const labelPadding = 4;
                  const minRadius = ir + radialHalfExtent + labelPadding;
                  const maxRadius = or - radialHalfExtent - labelPadding;
                  if (minRadius >= maxRadius) return null;
                  const radius = Math.min(maxRadius, Math.max(ir + (or - ir) * 0.5, minRadius));
                  const x = cx + radius * Math.cos(angle);
                  const y = cy + radius * Math.sin(angle);
                  return (
                    <g>
                      <rect
                        x={x - pillWidth / 2}
                        y={y - pillHeight / 2}
                        width={pillWidth}
                        height={pillHeight}
                        rx={pillHeight / 2}
                        fill="rgba(255,255,255,0.82)"
                        stroke="rgba(148,163,184,0.28)"
                      />
                      <text
                        x={x}
                        y={y}
                        fill="#1f2937"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="11"
                        fontWeight="700"
                      >
                        {label}
                      </text>
                    </g>
                  );
                }}
              >
                {data.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
              <Tooltip
                content={(
                  <AnalyticsTooltip
                    labelFormatter={(_, payload) => payload?.[0]?.name}
                    valueFormatter={(value) => valueFormatter(value)}
                  />
                )}
                allowEscapeViewBox={{ x: true, y: true }}
                offset={20}
                wrapperStyle={{ outline: 'none', zIndex: 40 }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <div
              className="flex items-center justify-center rounded-full border border-white bg-white/95 text-center shadow-[0_10px_28px_rgba(15,23,42,0.10)]"
              style={{ width: `${centerDiskSize}px`, height: `${centerDiskSize}px` }}
            >
              <div className="px-2.5">
                <div className={`${centerValueSize} font-bold tracking-tight ${t ? t.cardText : 'text-slate-900'} font-spartan leading-none`}>
                  {formattedTotal}
                </div>
                <div className={`mt-1 text-[8px] font-black uppercase tracking-[0.15em] ${t ? t.subtleText : 'text-slate-400'}`}>
                  {centerLabel}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {data.map((item) => (
            <div key={item.name} className="inline-flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className={`text-sm font-medium ${t ? t.cardText : 'text-slate-800'}`}>{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
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
