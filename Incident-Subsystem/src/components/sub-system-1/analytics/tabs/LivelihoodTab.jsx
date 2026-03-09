import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ChartCard, DonutSummaryCard, SectionHeader, analyticsChartTheme, AnalyticsTooltip } from '../AnalyticsInterface';
import { COLORS, INCOME_ORDER, pct } from '../analyticsConfig';

const LOW_INCOME = ['No Income', 'Below 5,000', '0'];
const MID_INCOME = ['5,001-10,000', '10,001-20,000', '20,001-30,000', '20,001-40,000'];

export default function LivelihoodTab({ raw, t }) {
  const lv = raw?.livelihood ?? {};

  const incomeData = [...(lv.income_distribution ?? [])]
    .map((r) => ({ bracket: r.bracket, count: Number(r.count) }))
    .sort((a, b) => {
      const ia = INCOME_ORDER.indexOf(a.bracket);
      const ib = INCOME_ORDER.indexOf(b.bracket);
      return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
    });

  const totalIncome = incomeData.reduce((a, b) => a + b.count, 0);
  const lowIncome = incomeData.filter((r) => LOW_INCOME.includes(r.bracket)).reduce((a, b) => a + b.count, 0);

  const employData = (lv.employment_status ?? []).map((r) => ({ status: r.status, count: Number(r.count) }));
  const eduData = (lv.education_level ?? []).map((r) => ({ level: r.level, count: Number(r.count) }));
  const eduStatus = (lv.education_status ?? []).map((r) => ({ status: r.status, count: Number(r.count) }));
  const topOcc = (lv.top_occupations ?? []).slice(0, 8).map((r) => ({ occupation: r.occupation, count: Number(r.count) }));

  const srcData = (lv.income_source ?? []).map((r) => ({ name: r.source, value: Number(r.count) }));
  const srcColors = [COLORS.primary, COLORS.secondary, COLORS.teal, COLORS.accent, COLORS.purple, COLORS.gray];

  const schoolType = (lv.school_type ?? []).map((r) => ({
    name: r.type,
    value: Number(r.count),
    color: r.type === 'Public' ? COLORS.primary : COLORS.accent,
  }));

  const { gridStroke, axisTick, barRadius, horizontalBarRadius } = analyticsChartTheme;

  return (
    <div className="space-y-6">
      <SectionHeader title="Livelihood and Socioeconomic Profile" subtitle="Income, employment, education, occupations" t={t} />

      <ChartCard
        title="Monthly Income Distribution"
        subtitle="Resident counts across reported monthly income brackets."
        rightLabel="Income"
        t={t}
      >
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={incomeData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="2 10" stroke={gridStroke} />
            <XAxis dataKey="bracket" tick={{ ...axisTick, fontSize: 9 }} interval={0} angle={-30} textAnchor="end" height={55} axisLine={false} tickLine={false} />
            <YAxis tick={axisTick} axisLine={false} tickLine={false} tickMargin={10} />
            <Tooltip
              content={(
                <AnalyticsTooltip
                  valueFormatter={(value) => `${Number(value).toLocaleString()} residents`}
                />
              )}
              wrapperStyle={{ outline: 'none' }}
            />
            <Bar dataKey="count" name="Residents" radius={barRadius}>
              {incomeData.map((e, i) => (
                <Cell
                  key={i}
                  fill={LOW_INCOME.includes(e.bracket) ? COLORS.danger : MID_INCOME.includes(e.bracket) ? COLORS.warning : COLORS.success}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {lowIncome > 0 && (
          <p className="text-xs text-red-600 font-semibold mt-2">
            {lowIncome} residents ({pct(lowIncome, totalIncome)}%) have no income or below PHP 5k/mo - qualify for livelihood programs
          </p>
        )}
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard
          title="Employment Status"
          subtitle="Resident employment standing based on submitted livelihood records."
          rightLabel="Status"
          t={t}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={employData} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="2 10" stroke={gridStroke} horizontal={false} />
              <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} tickMargin={10} />
              <YAxis type="category" dataKey="status" tick={axisTick} width={90} axisLine={false} tickLine={false} />
              <Tooltip
                content={(
                  <AnalyticsTooltip
                    valueFormatter={(value) => `${Number(value).toLocaleString()} residents`}
                  />
                )}
                wrapperStyle={{ outline: 'none' }}
              />
              <Bar dataKey="count" name="Residents" fill={COLORS.secondary} radius={horizontalBarRadius} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Educational Attainment"
          subtitle="Highest recorded educational level across residents."
          rightLabel="Education"
          t={t}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={eduData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="2 10" stroke={gridStroke} />
              <XAxis dataKey="level" tick={{ ...axisTick, fontSize: 9 }} interval={0} angle={-25} textAnchor="end" height={50} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} tickMargin={10} />
              <Tooltip
                content={(
                  <AnalyticsTooltip
                    valueFormatter={(value) => `${Number(value).toLocaleString()} residents`}
                  />
                )}
                wrapperStyle={{ outline: 'none' }}
              />
              <Bar dataKey="count" name="Residents" fill={COLORS.purple} radius={barRadius} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {eduStatus.length > 0 && (
          <ChartCard
            title="Educational Status"
            subtitle="Current schooling status of residents in the education dataset."
            rightLabel="Status"
            t={t}
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={eduStatus} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="2 10" stroke={gridStroke} />
                <XAxis dataKey="status" tick={axisTick} axisLine={false} tickLine={false} tickMargin={10} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} tickMargin={10} />
                <Tooltip
                  content={(
                    <AnalyticsTooltip
                      valueFormatter={(value) => `${Number(value).toLocaleString()} residents`}
                    />
                  )}
                  wrapperStyle={{ outline: 'none' }}
                />
                <Bar dataKey="count" name="Residents" fill={COLORS.teal} radius={barRadius} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {srcData.length > 0 && (
          <DonutSummaryCard
            title="Income Source"
            subtitle="Source mix for household and personal income declarations."
            rightLabel="Distribution"
            centerLabel="Sources"
            data={srcData.map((item, index) => ({
              ...item,
              color: srcColors[index % srcColors.length],
            }))}
            t={t}
          />
        )}

        {schoolType.length > 1 && (
          <DonutSummaryCard
            title="School Type (Public vs Private)"
            subtitle="Public versus private school participation among applicable residents."
            rightLabel="Distribution"
            centerLabel="Students"
            data={schoolType}
            t={t}
          />
        )}

        {topOcc.length > 0 && (
          <ChartCard
            title="Top Occupations"
            subtitle="Most frequently recorded occupations in the livelihood registry."
            rightLabel="Top list"
            className="lg:col-span-2"
            t={t}
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topOcc} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="2 10" stroke={gridStroke} />
                <XAxis dataKey="occupation" tick={axisTick} axisLine={false} tickLine={false} tickMargin={10} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} tickMargin={10} />
                <Tooltip
                  content={(
                    <AnalyticsTooltip
                      valueFormatter={(value) => `${Number(value).toLocaleString()} residents`}
                    />
                  )}
                  wrapperStyle={{ outline: 'none' }}
                />
                <Bar dataKey="count" name="Residents" fill={COLORS.teal} radius={barRadius} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>
    </div>
  );
}
