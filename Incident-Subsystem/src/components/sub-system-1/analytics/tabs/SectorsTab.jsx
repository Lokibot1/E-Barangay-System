// ============================================================
// SectorsTab.jsx
// Fixed Lucide rendering
// ============================================================

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { 
  Baby, 
  Accessibility, 
  UserRound, 
  Rainbow, 
  AlertTriangle 
} from 'lucide-react';
import { StatCard, Card, SectionHeader } from '../AnalyticsInterface';
import { COLORS, SECTOR_COLORS } from '../analyticsConfig';

export default function SectorsTab({ raw }) {
  const sec = raw?.sectors ?? {};
  const hm  = raw?.heatmap?.puroks ?? [];

  const sectorChartData = (sec.sector_counts ?? []).map(r => ({
    name:  r.sector_name,
    value: Number(r.count),
    color: SECTOR_COLORS[r.sector_name] ?? COLORS.gray,
  }));

  const seniorByPurok = (sec.seniors_by_purok ?? []).map(r => ({ purok: r.purok, count: Number(r.count) }));
  const pwdByPurok    = (sec.pwd_by_purok    ?? []).map(r => ({ purok: r.purok, count: Number(r.count) }));
  const soloByPurok   = (sec.solo_parent_by_purok ?? []).map(r => ({ purok: r.purok, count: Number(r.count) }));

  const totalSenior      = seniorByPurok.reduce((a, b) => a + b.count, 0);
  const totalPwd         = pwdByPurok.reduce((a, b) => a + b.count, 0);
  const worstPurokSenior = [...seniorByPurok].sort((a, b) => b.count - a.count)[0];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Sectoral Classification"
        subtitle="Sector breakdown, seniors and PWD per purok"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard 
          icon={Baby} 
          label="Senior Citizens" 
          value={totalSenior}  
          sub="Aged 60+"              
          color="danger"  
        />
        <StatCard 
          icon={Accessibility} 
          label="PWD"               
          value={totalPwd}     
          sub="Persons w/ Disability"  
          color="warning" 
        />
        <StatCard 
          icon={UserRound} 
          label="Solo Parent"
          value={sectorChartData.find(s => s.name === 'Solo Parent')?.value ?? 0} 
          color="teal" 
        />
        <StatCard 
          icon={Rainbow} 
          label="LGBTQIA+"
          value={sectorChartData.find(s => s.name === 'LGBTQIA+')?.value ?? 0}   
          color="purple" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="All Sectors">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={sectorChartData} cx="50%" cy="50%" outerRadius={95}
                dataKey="value" paddingAngle={2}>
                {sectorChartData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" iconSize={10} layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Senior Citizens per Purok">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={seniorByPurok} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="purok" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={v => [`${v} seniors`]} />
              <Bar dataKey="count" name="Seniors" fill={COLORS.danger} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {worstPurokSenior && (
            <div className="flex items-center gap-1.5 text-xs text-orange-600 font-semibold mt-2 bg-orange-50 p-2 rounded-md">
              <AlertTriangle size={14} />
              <span>{worstPurokSenior.purok} has the most seniors ({worstPurokSenior.count}) — priority for ayuda</span>
            </div>
          )}
        </Card>

        <Card title="PWD Residents per Purok">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pwdByPurok} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="purok" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={v => [`${v} PWD`]} />
              <Bar dataKey="count" name="PWD" fill={COLORS.warning} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="OFW & Solo Parent per Purok">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hm} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="purok" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend iconSize={10} />
              <Bar dataKey="ofw"         name="OFW"         fill={COLORS.accent} radius={[4, 4, 0, 0]} />
              <Bar dataKey="solo_parent" name="Solo Parent" fill={COLORS.teal}   radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {soloByPurok.length > 0 && (
          <Card title="Solo Parent per Purok">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={soloByPurok} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="purok" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={v => [`${v} solo parents`]} />
                <Bar dataKey="count" name="Solo Parent" fill={COLORS.teal} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        <Card title="Kasambahay & LGBTQIA+ per Purok">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hm} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="purok" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend iconSize={10} />
              <Bar dataKey="kasambahay" name="Kasambahay" fill={COLORS.success} radius={[4, 4, 0, 0]} />
              <Bar dataKey="lgbtqia"    name="LGBTQIA+"   fill={COLORS.purple}  radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}