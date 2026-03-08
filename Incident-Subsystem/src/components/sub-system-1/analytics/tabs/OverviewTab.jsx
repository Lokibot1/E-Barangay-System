// ============================================================
// OverviewTab.jsx
// Imports ONLY from: './AnalyticsUI' and './analyticsConfig'
// ============================================================

import {
  PieChart, Pie, Cell, Legend, Tooltip,
  LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import { ShieldCheck, UserCheck, Home, Landmark } from 'lucide-react';
import { StatCard, Card, SectionHeader } from '../AnalyticsInterface';
import { COLORS, pct } from '../analyticsConfig';

export default function OverviewTab({ raw, t }) {
  const ov = raw?.overview ?? {};
  const hm = raw?.heatmap?.puroks ?? [];
  const reg = raw?.registration;

  const statusColorMap = {
    verified: COLORS.success,
    pending: COLORS.warning,
    rejected: COLORS.danger,
    unregistered: COLORS.gray,
    voters: COLORS.teal,
  };

  const statusData = (ov.status_breakdown ?? []).map((entry) => {
    const key = String(entry.status || entry.name || '').toLowerCase().replace(/\s+/g, '_');
    return {
      ...entry,
      color: statusColorMap[key] || entry.color || COLORS.primary,
    };
  });
  const trendData = reg?.registration_trend ?? [];

  const genderData = (ov.gender_breakdown ?? []).map(g => ({
    name: g.gender,
    value: Number(g.count),
    color: g.gender === 'Male' ? COLORS.secondary : COLORS.pink,
  }));

  const residencyData = (ov.residency_breakdown ?? []).map(r => ({
    name: r.residency_status,
    value: Number(r.count),
    color: r.residency_status === 'Old Resident' ? COLORS.teal : COLORS.secondary,
  }));

  const gridStroke = '#e9ecf7';
  const axisTick = { fontSize: 11, fill: '#64748b' };
  const tooltipStyle = {
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    fontSize: '12px',
  };

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
        <Card title="Registration Status Breakdown" t={t}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={56} outerRadius={90} paddingAngle={3} dataKey="value">
                {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Daily Registration Trend" t={t}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="date" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="count"
                name="Registrations"
                stroke={COLORS.primary}
                strokeWidth={2.8}
                dot={{ r: 3, fill: COLORS.primary }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Gender Distribution" t={t}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {genderData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Residency Type" t={t}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart margin={{ top: 8, right: 28, left: 28, bottom: 8 }}>
              <Pie
                data={residencyData}
                cx="50%"
                cy="56%"
                outerRadius={72}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {residencyData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {hm.length > 0 && (
        <Card title="Residents per Purok - Quick View" t={t}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hm} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="purok" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="total" name="Total" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
              <Bar dataKey="verified" name="Verified" fill={COLORS.success} radius={[8, 8, 0, 0]} />
              <Bar dataKey="seniors" name="Seniors" fill={COLORS.danger} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
