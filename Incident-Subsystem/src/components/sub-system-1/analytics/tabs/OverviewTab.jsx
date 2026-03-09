// ============================================================
// OverviewTab.jsx
// Imports ONLY from: './AnalyticsUI' and './analyticsConfig'
// ============================================================

import {
  Tooltip,
  AreaChart, Area, CartesianGrid, XAxis, YAxis, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import { ShieldCheck, UserCheck, Home, Landmark } from 'lucide-react';
import {
  StatCard,
  ChartCard,
  DonutSummaryCard,
  SectionHeader,
  analyticsChartTheme,
  AnalyticsTooltip,
  formatChartDateLabel,
} from '../AnalyticsInterface';
import { COLORS, REGISTRY_STATUS_COLORS, pct } from '../analyticsConfig';

const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export default function OverviewTab({ raw, t }) {
  const ov = raw?.overview ?? {};
  const hm = raw?.heatmap?.puroks ?? [];
  const reg = raw?.registration;

  const statusColorMap = {
    verified: REGISTRY_STATUS_COLORS.verified.solid,
    pending: REGISTRY_STATUS_COLORS.pending.solid,
    rejected: REGISTRY_STATUS_COLORS.rejected.solid,
    unregistered: REGISTRY_STATUS_COLORS.unregistered.solid,
    voters: COLORS.teal,
  };

  const statusData = (ov.status_breakdown ?? []).map((entry) => {
    const key = String(entry.status || entry.name || '').toLowerCase().replace(/\s+/g, '_');
    return {
      ...entry,
      color: statusColorMap[key] || entry.color || COLORS.primary,
    };
  });
  const trendData = (reg?.registration_trend ?? []).map((entry) => ({
    ...entry,
    count: Number(entry.count ?? 0),
    displayDate: formatChartDateLabel(entry.date),
  }));

  const genderData = (ov.gender_breakdown ?? []).map(g => ({
    name: g.gender,
    value: Number(g.count),
    color: g.gender === 'Male' ? COLORS.secondary : COLORS.pink,
  }));

  const residencyData = (ov.residency_breakdown ?? []).map(r => ({
    name: r.residency_status,
    value: Number(r.count),
    color: r.residency_status === 'Old Resident' ? COLORS.primary : COLORS.secondary,
  }));

  const { gridStroke, axisTick, barRadius } = analyticsChartTheme;
  const trendAccent = COLORS.primary;
  const rangeChip = (
    <div className="inline-flex items-center rounded-full border border-[#dbe3ee] bg-[#fbfcfe] px-4 py-2 text-[12px] font-semibold text-slate-600 shadow-[0_4px_12px_rgba(15,23,42,0.05)]">
      Latest trend
    </div>
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Barangay Overview"
        subtitle="Barangay Gulod, Novaliches, Quezon City - E-Barangay IMS"
        t={t}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard
          icon={ShieldCheck}
          label="Verified"
          value={ov.verified ?? 0}
          sub={`${pct(ov.verified, ov.total_residents)}% of total`}
          color="success"
          t={t}
        />
        <StatCard
          icon={UserCheck}
          label="Registered Voters"
          value={ov.voters ?? 0}
          sub={`${ov.total_puroks ?? 0} puroks`}
          color="teal"
          t={t}
        />
        <StatCard
          icon={Home}
          label="Active Households"
          value={ov.total_households ?? 0}
          sub={`${pct(ov.total_households, ov.total_residents)}% of total residents`}
          color="secondary"
          t={t}
        />
        <StatCard
          icon={Landmark}
          label="Indigent Households"
          value={ov.indigent_households ?? 0}
          sub={`${pct(ov.indigent_households, ov.total_households)}% of HH`}
          color="warning"
          t={t}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DonutSummaryCard
          title="Registration Status Breakdown"
          subtitle="Current verification mix across all submitted resident records."
          rightLabel="Distribution"
          centerLabel="Records"
          data={statusData}
          t={t}
        />

        <ChartCard
          title="Registration Growth"
          subtitle="Resident registration movement across the latest reporting window."
          rightContent={rangeChip}
          t={t}
        >
          <ResponsiveContainer width="100%" height={310}>
            <AreaChart data={trendData} margin={{ top: 8, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="overviewHeroFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={trendAccent} stopOpacity={0.22} />
                  <stop offset="68%" stopColor={trendAccent} stopOpacity={0.08} />
                  <stop offset="100%" stopColor={trendAccent} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="2 10" stroke={gridStroke} />
              <XAxis
                dataKey="displayDate"
                tick={axisTick}
                axisLine={false}
                tickLine={false}
                tickMargin={12}
                minTickGap={18}
              />
              <YAxis
                tick={{ ...axisTick, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                width={56}
                tickFormatter={(value) => compactFormatter.format(value)}
              />
              <Tooltip
                cursor={{ stroke: trendAccent, strokeOpacity: 0.25, strokeWidth: 2 }}
                content={(
                  <AnalyticsTooltip
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.displayDate || label}
                    valueFormatter={(value) => Number(value).toLocaleString()}
                  />
                )}
                wrapperStyle={{ outline: 'none' }}
              />
              <Area
                type="monotone"
                dataKey="count"
                name="Registrations"
                stroke={trendAccent}
                fill="url(#overviewHeroFill)"
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 8,
                  strokeWidth: 2,
                  stroke: trendAccent,
                  fill: '#f8fffd',
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <DonutSummaryCard
          title="Gender Distribution"
          subtitle="Resident population split by recorded gender."
          rightLabel="Distribution"
          centerLabel="Residents"
          data={genderData}
          t={t}
        />

        <DonutSummaryCard
          title="Residency Type"
          subtitle="Old and new resident counts based on registry residency tags."
          rightLabel="Distribution"
          centerLabel="Residents"
          data={residencyData}
          t={t}
        />
      </div>

      {hm.length > 0 && (
        <ChartCard
          title="Residents per Purok - Quick View"
          subtitle="Fast comparison of total residents, verified records, and senior counts by purok."
          rightLabel="Snapshot"
          t={t}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={hm} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="2 10" stroke={gridStroke} />
              <XAxis dataKey="purok" tick={axisTick} axisLine={false} tickLine={false} tickMargin={10} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} tickMargin={10} />
              <Tooltip
                content={(
                  <AnalyticsTooltip
                    valueFormatter={(value, name) => `${Number(value).toLocaleString()} ${name === 'Seniors' ? 'seniors' : 'residents'}`}
                  />
                )}
                wrapperStyle={{ outline: 'none' }}
              />
              <Bar dataKey="total" name="Total" fill={COLORS.primary} radius={barRadius} />
              <Bar dataKey="verified" name="Verified" fill={REGISTRY_STATUS_COLORS.verified.solid} radius={barRadius} />
              <Bar dataKey="seniors" name="Seniors" fill={COLORS.danger} radius={barRadius} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}
