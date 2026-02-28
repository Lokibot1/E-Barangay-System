// ============================================================
// LivelihoodTab.jsx
// Imports ONLY from: './AnalyticsUI' and './analyticsConfig'
// ============================================================

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import { Card, SectionHeader } from '../AnalyticsInterface';
import { COLORS, INCOME_ORDER, pct } from '../analyticsConfig';

const LOW_INCOME = ['No Income', 'Below 5,000', '0'];
const MID_INCOME = ['5,001-10,000', '10,001-20,000', '20,001-30,000', '20,001-40,000'];

export default function LivelihoodTab({ raw }) {
  const lv = raw?.livelihood ?? {};

  const incomeData = [...(lv.income_distribution ?? [])]
    .map(r => ({ bracket: r.bracket, count: Number(r.count) }))
    .sort((a, b) => {
      const ia = INCOME_ORDER.indexOf(a.bracket);
      const ib = INCOME_ORDER.indexOf(b.bracket);
      return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
    });

  const totalIncome = incomeData.reduce((a, b) => a + b.count, 0);
  const lowIncome   = incomeData.filter(r => LOW_INCOME.includes(r.bracket)).reduce((a, b) => a + b.count, 0);

  const employData  = (lv.employment_status ?? []).map(r => ({ status: r.status,    count: Number(r.count) }));
  const eduData     = (lv.education_level   ?? []).map(r => ({ level:  r.level,     count: Number(r.count) }));
  const eduStatus   = (lv.education_status  ?? []).map(r => ({ status: r.status,    count: Number(r.count) }));
  const topOcc      = (lv.top_occupations   ?? []).slice(0, 8).map(r => ({ occupation: r.occupation, count: Number(r.count) }));

  const srcData   = (lv.income_source ?? []).map(r => ({ name: r.source, value: Number(r.count) }));
  const srcColors = [COLORS.primary, COLORS.secondary, COLORS.teal, COLORS.accent, COLORS.purple, COLORS.gray];

  const schoolType = (lv.school_type ?? []).map(r => ({
    name: r.type, value: Number(r.count),
    color: r.type === 'Public' ? COLORS.primary : COLORS.accent,
  }));

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Livelihood & Socioeconomic Profile"
        subtitle="Income, employment, education, occupations"
      />

      <Card title="Monthly Income Distribution">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={incomeData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="bracket" tick={{ fontSize: 9 }} interval={0} angle={-30} textAnchor="end" height={55} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" name="Residents" radius={[4, 4, 0, 0]}>
              {incomeData.map((e, i) => (
                <Cell key={i}
                  fill={LOW_INCOME.includes(e.bracket) ? COLORS.danger : MID_INCOME.includes(e.bracket) ? COLORS.warning : COLORS.success} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {lowIncome > 0 && (
          <p className="text-xs text-red-500 font-semibold mt-2">
            🔴 {lowIncome} residents ({pct(lowIncome, totalIncome)}%) have no income or below ₱5k/mo — qualify for livelihood programs
          </p>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="Employment Status">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={employData} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="status" tick={{ fontSize: 11 }} width={90} />
              <Tooltip />
              <Bar dataKey="count" name="Residents" fill={COLORS.secondary} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Educational Attainment">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={eduData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="level" tick={{ fontSize: 9 }} interval={0} angle={-25} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" name="Residents" fill={COLORS.purple} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {eduStatus.length > 0 && (
          <Card title="Educational Status">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={eduStatus} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="status" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Residents" fill={COLORS.teal} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {srcData.length > 0 && (
          <Card title="Income Source">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={srcData} cx="50%" cy="50%" outerRadius={85} dataKey="value" paddingAngle={2}>
                  {srcData.map((_, i) => <Cell key={i} fill={srcColors[i % srcColors.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={10} layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {schoolType.length > 1 && (
          <Card title="School Type (Public vs Private)">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={schoolType} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {schoolType.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {topOcc.length > 0 && (
          <Card title="Top Occupations" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topOcc} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="occupation" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Residents" fill={COLORS.teal} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>
    </div>
  );
}