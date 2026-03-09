import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Baby, Accessibility, UserRound, Rainbow, AlertTriangle } from 'lucide-react';
import { StatCard, ChartCard, DonutSummaryCard, SectionHeader, analyticsChartTheme, AnalyticsTooltip } from '../AnalyticsInterface';
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

  const { gridStroke, axisTick, legendStyle, barRadius } = analyticsChartTheme;

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
        <DonutSummaryCard
          title="All Sectors"
          subtitle="Current sector mix across the resident population."
          rightLabel="Distribution"
          centerLabel="Residents"
          data={sectorChartData}
          t={t}
        />

        <ChartCard
          title="Senior Citizens per Purok"
          subtitle="Counts of senior citizens across puroks for service prioritization."
          rightLabel="Per purok"
          t={t}
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={seniorByPurok} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="2 10" stroke={gridStroke} />
              <XAxis dataKey="purok" tick={axisTick} axisLine={false} tickLine={false} tickMargin={10} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} tickMargin={10} />
              <Tooltip
                content={(
                  <AnalyticsTooltip
                    valueFormatter={(value) => `${Number(value).toLocaleString()} seniors`}
                  />
                )}
                wrapperStyle={{ outline: 'none' }}
              />
              <Bar dataKey="count" name="Seniors" fill={COLORS.danger} radius={barRadius} />
            </BarChart>
          </ResponsiveContainer>
          {worstPurokSenior && (
            <div className="flex items-center gap-1.5 text-xs text-orange-600 font-semibold mt-2 bg-orange-50 p-2 rounded-md">
              <AlertTriangle size={14} />
              <span>{worstPurokSenior.purok} has the most seniors ({worstPurokSenior.count}) - priority for ayuda</span>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="PWD Residents per Purok"
          subtitle="Persons with disability counted across purok clusters."
          rightLabel="Per purok"
          t={t}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pwdByPurok} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="2 10" stroke={gridStroke} />
              <XAxis dataKey="purok" tick={axisTick} axisLine={false} tickLine={false} tickMargin={10} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} tickMargin={10} />
              <Tooltip
                content={(
                  <AnalyticsTooltip
                    valueFormatter={(value) => `${Number(value).toLocaleString()} PWD`}
                  />
                )}
                wrapperStyle={{ outline: 'none' }}
              />
              <Bar dataKey="count" name="PWD" fill={COLORS.warning} radius={barRadius} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="OFW and Solo Parent per Purok"
          subtitle="Grouped comparison between OFW and solo parent households per purok."
          rightLabel="Grouped"
          t={t}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hm} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="2 10" stroke={gridStroke} />
              <XAxis dataKey="purok" tick={axisTick} axisLine={false} tickLine={false} tickMargin={10} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} tickMargin={10} />
              <Tooltip
                content={(
                  <AnalyticsTooltip
                    valueFormatter={(value) => `${Number(value).toLocaleString()} residents`}
                  />
                )}
                wrapperStyle={{ outline: 'none' }}
              />
              <Legend iconType="circle" iconSize={10} wrapperStyle={legendStyle} />
              <Bar dataKey="ofw" name="OFW" fill={COLORS.accent} radius={barRadius} />
              <Bar dataKey="solo_parent" name="Solo Parent" fill={COLORS.teal} radius={barRadius} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {soloByPurok.length > 0 && (
          <ChartCard
            title="Solo Parent per Purok"
            subtitle="Solo parent distribution by purok."
            rightLabel="Per purok"
            t={t}
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={soloByPurok} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="2 10" stroke={gridStroke} />
                <XAxis dataKey="purok" tick={axisTick} axisLine={false} tickLine={false} tickMargin={10} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} tickMargin={10} />
                <Tooltip
                  content={(
                    <AnalyticsTooltip
                      valueFormatter={(value) => `${Number(value).toLocaleString()} solo parents`}
                    />
                  )}
                  wrapperStyle={{ outline: 'none' }}
                />
                <Bar dataKey="count" name="Solo Parent" fill={COLORS.teal} radius={barRadius} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        <ChartCard
          title="Kasambahay and LGBTQIA+ per Purok"
          subtitle="Grouped comparison of kasambahay and LGBTQIA+ counts per purok."
          rightLabel="Grouped"
          t={t}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hm} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="2 10" stroke={gridStroke} />
              <XAxis dataKey="purok" tick={axisTick} axisLine={false} tickLine={false} tickMargin={10} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} tickMargin={10} />
              <Tooltip
                content={(
                  <AnalyticsTooltip
                    valueFormatter={(value) => `${Number(value).toLocaleString()} residents`}
                  />
                )}
                wrapperStyle={{ outline: 'none' }}
              />
              <Legend iconType="circle" iconSize={10} wrapperStyle={legendStyle} />
              <Bar dataKey="kasambahay" name="Kasambahay" fill={COLORS.success} radius={barRadius} />
              <Bar dataKey="lgbtqia" name="LGBTQIA+" fill={COLORS.purple} radius={barRadius} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
