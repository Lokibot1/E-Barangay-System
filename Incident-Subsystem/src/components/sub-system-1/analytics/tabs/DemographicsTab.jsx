import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import {
  ChartCard,
  DonutSummaryCard,
  SectionHeader,
  analyticsChartTheme,
  AnalyticsTooltip,
} from '../AnalyticsInterface';
import { COLORS, REGISTRY_STATUS_COLORS, AGE_ORDER } from '../analyticsConfig';

export default function DemographicsTab({ raw, t }) {
  const demo = raw?.demographics ?? {};
  const hm = raw?.heatmap?.puroks ?? [];

  const ageData = [...(demo.age_groups ?? [])]
    .sort((a, b) => AGE_ORDER.indexOf(a.age_group) - AGE_ORDER.indexOf(b.age_group))
    .map((r) => ({ group: r.age_group, count: Number(r.count) }));

  const maritalData = (demo.marital_status ?? []).map((r) => ({ name: r.status, value: Number(r.count) }));
  const maritalColors = [COLORS.primary, COLORS.secondary, COLORS.teal, COLORS.purple, COLORS.accent, COLORS.gray];

  const voterRows = demo.voter_data ?? [];
  const voters = Number(voterRows.find((r) => r.is_voter == 1)?.count ?? 0);
  const nonVoters = Number(voterRows.find((r) => r.is_voter == 0)?.count ?? 0);
  const voterChart = [
    { name: 'Voter', value: voters, color: COLORS.success },
    { name: 'Non-Voter', value: nonVoters, color: COLORS.gray },
  ];

  const housePos = (demo.household_positions ?? []).map((r) => ({
    name: r.household_position,
    count: Number(r.count),
  }));

  const birthReg = (demo.birth_registration ?? []).map((r) => ({
    name: r.birth_registration,
    value: Number(r.count),
    color: r.birth_registration === 'Registered' ? COLORS.success : COLORS.danger,
  }));

  const { gridStroke, axisTick, legendStyle, barRadius, horizontalBarRadius } = analyticsChartTheme;

  return (
    <div className="space-y-6">
      <SectionHeader title="Demographic Analysis" subtitle="Age groups, gender, marital status, household positions" t={t} />

      <ChartCard
        title="Age Group Distribution"
        subtitle="Resident count across major age brackets, with senior citizens highlighted."
        rightLabel="Age view"
        t={t}
      >
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={ageData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="2 10" stroke={gridStroke} />
            <XAxis dataKey="group" tick={axisTick} axisLine={false} tickLine={false} tickMargin={10} />
            <YAxis tick={axisTick} axisLine={false} tickLine={false} tickMargin={10} />
            <Tooltip
              content={(
                <AnalyticsTooltip
                  valueFormatter={(value) => `${Number(value).toLocaleString()} residents`}
                />
              )}
              wrapperStyle={{ outline: 'none' }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {ageData.map((e, i) => (
                <Cell key={i} fill={e.group === '60+' ? COLORS.danger : COLORS.secondary} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-slate-500 mt-2">* Senior citizens (60+) highlighted in red</p>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DonutSummaryCard
          title="Marital Status"
          subtitle="Civil status breakdown across registered residents."
          rightLabel="Distribution"
          centerLabel="Residents"
          data={maritalData.map((item, index) => ({
            ...item,
            color: maritalColors[index % maritalColors.length],
          }))}
          t={t}
        />

        <DonutSummaryCard
          title="Voter Status"
          subtitle="Voting eligibility and registration coverage from demographic records."
          rightLabel="Coverage"
          centerLabel="Voter file"
          data={voterChart}
          t={t}
        />

        <ChartCard
          title="Household Position Breakdown"
          subtitle="Resident roles within households, displayed by volume."
          rightLabel="Roles"
          t={t}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={housePos} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="2 10" stroke={gridStroke} horizontal={false} />
              <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} tickMargin={10} />
              <YAxis type="category" dataKey="name" tick={axisTick} width={90} axisLine={false} tickLine={false} />
              <Tooltip
                content={(
                  <AnalyticsTooltip
                    valueFormatter={(value) => `${Number(value).toLocaleString()} residents`}
                  />
                )}
                wrapperStyle={{ outline: 'none' }}
              />
              <Bar dataKey="count" name="Count" fill={COLORS.secondary} radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Residents per Purok - Status Stacked"
          subtitle="Verification status mix per purok within the demographic dataset."
          rightLabel="Stacked"
          t={t}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={hm}
              layout="vertical"
              margin={{ top: 8, right: 12, bottom: 12, left: 6 }}
              barCategoryGap="26%"
              barSize={24}
            >
              <CartesianGrid stroke={gridStroke} horizontal={false} vertical={true} />
              <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} tickMargin={10} />
              <YAxis type="category" dataKey="purok" tick={axisTick} width={60} axisLine={false} tickLine={false} />
              <Tooltip content={<AnalyticsTooltip />} wrapperStyle={{ outline: 'none' }} />
              <Legend iconType="circle" iconSize={10} wrapperStyle={legendStyle} />
              <Bar dataKey="verified" name="Verified" stackId="a" fill={REGISTRY_STATUS_COLORS.verified.solid} radius={horizontalBarRadius} />
              <Bar dataKey="pending" name="Pending" stackId="a" fill={REGISTRY_STATUS_COLORS.pending.solid} radius={horizontalBarRadius} />
              <Bar dataKey="rejected" name="Rejected" stackId="a" fill={REGISTRY_STATUS_COLORS.rejected.solid} radius={horizontalBarRadius} />
              <Bar dataKey="unregistered" name="Unregistered" stackId="a" fill={REGISTRY_STATUS_COLORS.unregistered.solid} radius={horizontalBarRadius} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {birthReg.length > 0 && (
          <DonutSummaryCard
            title="Birth Registration Status"
            subtitle="Resident birth certificate registration coverage."
            rightLabel="Coverage"
            centerLabel="Residents"
            data={birthReg}
            t={t}
          />
        )}
      </div>
    </div>
  );
}
