// ============================================================
// DemographicsTab.jsx
// Imports ONLY from: './AnalyticsUI' and './analyticsConfig'
// ============================================================

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import {Card, SectionHeader} from '../AnalyticsInterface';
import { COLORS, AGE_ORDER } from '../analyticsConfig';

export default function DemographicsTab({ raw, t }) {
  const demo = raw?.demographics ?? {};
  const hm   = raw?.heatmap?.puroks ?? [];

  const ageData = [...(demo.age_groups ?? [])].sort(
    (a, b) => AGE_ORDER.indexOf(a.age_group) - AGE_ORDER.indexOf(b.age_group)
  ).map(r => ({ group: r.age_group, count: Number(r.count) }));

  const maritalData   = (demo.marital_status ?? []).map(r => ({ name: r.status, value: Number(r.count) }));
  const maritalColors = [COLORS.primary, COLORS.secondary, COLORS.teal, COLORS.purple, COLORS.accent, COLORS.gray];

  const voterRows  = demo.voter_data ?? [];
  const voters     = Number(voterRows.find(r => r.is_voter == 1)?.count ?? 0);
  const nonVoters  = Number(voterRows.find(r => r.is_voter == 0)?.count ?? 0);
  const voterChart = [
    { name: 'Voter',     value: voters,    color: COLORS.success },
    { name: 'Non-Voter', value: nonVoters, color: COLORS.gray    },
  ];

  const housePos = (demo.household_positions ?? []).map(r => ({
    name: r.household_position, count: Number(r.count),
  }));

  const birthReg = (demo.birth_registration ?? []).map(r => ({
    name: r.birth_registration, value: Number(r.count),
    color: r.birth_registration === 'Registered' ? COLORS.success : COLORS.danger,
  }));

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Demographic Analysis"
        subtitle="Age groups, gender, marital status, household positions"
        t={t}
      />

      <Card title="Age Group Distribution" t={t}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={ageData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="group" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={v => [`${v} residents`]} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {ageData.map((e, i) => (
                <Cell key={i} fill={e.group === '60+' ? COLORS.danger : COLORS.secondary} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-400 mt-2">* Senior citizens (60+) highlighted in red</p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="Marital Status" t={t}>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={maritalData} cx="50%" cy="50%" outerRadius={90}
                dataKey="value" paddingAngle={2}>
                {maritalData.map((_, i) => <Cell key={i} fill={maritalColors[i % maritalColors.length]} />)}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" iconSize={10} layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Voter Status" t={t}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={voterChart} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {voterChart.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 justify-center">
            <div className="text-center">
              <div className="text-2xl font-black text-[#27ae60]">{voters.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Registered Voters</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-gray-500">{nonVoters.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Non-Voters</div>
            </div>
          </div>
        </Card>

        <Card title="Household Position Breakdown" t={t}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={housePos} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
              <Tooltip />
              <Bar dataKey="count" name="Count" fill={COLORS.secondary} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Residents per Purok — Status Stacked" t={t}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={hm} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="purok" tick={{ fontSize: 11 }} width={60} />
              <Tooltip />
              <Legend iconSize={10} />
              <Bar dataKey="verified"     name="Verified"     stackId="a" fill={COLORS.success} />
              <Bar dataKey="pending"      name="Pending"      stackId="a" fill={COLORS.warning} />
              <Bar dataKey="rejected"     name="Rejected"     stackId="a" fill={COLORS.danger}  />
              <Bar dataKey="unregistered" name="Unregistered" stackId="a" fill={COLORS.gray} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {birthReg.length > 0 && (
          <Card title="Birth Registration Status" t={t}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={birthReg} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {birthReg.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>
    </div>
  );
}
