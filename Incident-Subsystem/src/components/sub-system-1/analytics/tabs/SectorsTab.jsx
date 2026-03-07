import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Baby, Accessibility, UserRound, Rainbow, AlertTriangle } from 'lucide-react';
import { StatCard, Card, SectionHeader } from '../AnalyticsInterface';
import { COLORS, SECTOR_COLORS } from '../analyticsConfig';

export default function SectorsTab({ raw, t }) {
  const sec = raw?.sectors ?? {};
  const hm = raw?.heatmap?.puroks ?? [];

  const sectorChartData = (sec.sector_counts ?? []).map((r) => ({
    name: r.sector_name,
    value: Number(r.count),
    color: SECTOR_COLORS[r.sector_name] ?? COLORS.gray,
  }));

  const seniorByPurok = (sec.seniors_by_purok ?? []).map((r) => ({ purok: r.purok, count: Number(r.count) }));
  const pwdByPurok = (sec.pwd_by_purok ?? []).map((r) => ({ purok: r.purok, count: Number(r.count) }));
  const soloByPurok = (sec.solo_parent_by_purok ?? []).map((r) => ({ purok: r.purok, count: Number(r.count) }));

  const totalSenior = seniorByPurok.reduce((a, b) => a + b.count, 0);
  const totalPwd = pwdByPurok.reduce((a, b) => a + b.count, 0);
  const worstPurokSenior = [...seniorByPurok].sort((a, b) => b.count - a.count)[0];

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
      <SectionHeader title="Sectoral Classification" subtitle="Sector breakdown, seniors and PWD per purok" t={t} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Baby} label="Senior Citizens" value={totalSenior} sub="Aged 60+" color="danger" t={t} />
        <StatCard icon={Accessibility} label="PWD" value={totalPwd} sub="Persons w/ Disability" color="warning" t={t} />
        <StatCard
          icon={UserRound}
          label="Solo Parent"
          value={sectorChartData.find((s) => s.name === 'Solo Parent')?.value ?? 0}
          color="teal"
          t={t}
        />
        <StatCard
          icon={Rainbow}
          label="LGBTQIA+"
          value={sectorChartData.find((s) => s.name === 'LGBTQIA+')?.value ?? 0}
          color="purple"
          t={t}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="All Sectors" t={t}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={sectorChartData} cx="50%" cy="50%" innerRadius={52} outerRadius={95} dataKey="value" paddingAngle={2}>
                {sectorChartData.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={10} layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Senior Citizens per Purok" t={t}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={seniorByPurok} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="purok" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip formatter={(v) => [`${v} seniors`]} contentStyle={tooltipStyle} />
              <Bar dataKey="count" name="Seniors" fill={COLORS.danger} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {worstPurokSenior && (
            <div className="flex items-center gap-1.5 text-xs text-orange-600 font-semibold mt-2 bg-orange-50 p-2 rounded-md">
              <AlertTriangle size={14} />
              <span>{worstPurokSenior.purok} has the most seniors ({worstPurokSenior.count}) - priority for ayuda</span>
            </div>
          )}
        </Card>

        <Card title="PWD Residents per Purok" t={t}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pwdByPurok} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="purok" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip formatter={(v) => [`${v} PWD`]} contentStyle={tooltipStyle} />
              <Bar dataKey="count" name="PWD" fill={COLORS.warning} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="OFW and Solo Parent per Purok" t={t}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hm} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="purok" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="ofw" name="OFW" fill={COLORS.accent} radius={[8, 8, 0, 0]} />
              <Bar dataKey="solo_parent" name="Solo Parent" fill={COLORS.teal} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {soloByPurok.length > 0 && (
          <Card title="Solo Parent per Purok" t={t}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={soloByPurok} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="purok" tick={axisTick} />
                <YAxis tick={axisTick} />
                <Tooltip formatter={(v) => [`${v} solo parents`]} contentStyle={tooltipStyle} />
                <Bar dataKey="count" name="Solo Parent" fill={COLORS.teal} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        <Card title="Kasambahay and LGBTQIA+ per Purok" t={t}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hm} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="purok" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="kasambahay" name="Kasambahay" fill={COLORS.success} radius={[8, 8, 0, 0]} />
              <Bar dataKey="lgbtqia" name="LGBTQIA+" fill={COLORS.purple} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
