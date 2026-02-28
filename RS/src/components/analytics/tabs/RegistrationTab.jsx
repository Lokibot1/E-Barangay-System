// ============================================================
// RegistrationTab.jsx
// Verification rate fix: uses submitted only (v + p + r),
// NOT total residents (which includes unregistered).
// ============================================================

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { StatCard, Card, SectionHeader } from '../AnalyticsInterface';
import { COLORS, pct, calcVerifRate } from '../analyticsConfig';

export default function RegistrationTab({ raw }) {
  const ov  = raw?.overview   ?? {};
  const reg = raw?.registration ?? {};
  const hm  = raw?.heatmap?.puroks ?? [];

  const trend      = reg.registration_trend  ?? [];
  const purokVerif = reg.purok_verification  ?? [];
  const avgTime    = reg.avg_verification_time;

  // Unregistered per purok
  const unregByPurok = hm.map(p => ({
    purok:        p.purok,
    unregistered: Number(p.unregistered ?? 0),
    total:        Number(p.total ?? 0),
    pct:          pct(p.unregistered, p.total),
  }));
  const worstUnreg = [...unregByPurok].sort((a, b) => b.unregistered - a.unregistered)[0];

  // Per-purok rate using submitted-only denominator
  const purokRates = hm.map(p => ({
    purok:    p.purok,
    verified: Number(p.verified ?? 0),
    pending:  Number(p.pending  ?? 0),
    rejected: Number(p.rejected ?? 0),
    rate:     calcVerifRate(p),
  }));

  // Total submitted (excludes unregistered)
  const totalSubmitted = (ov.verified ?? 0) + (ov.pending ?? 0) + (ov.rejected ?? 0);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Registration & Verification"
        subtitle="Submissions, verification progress, and unregistered residents"
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon="📋" label="Total Submitted"  value={totalSubmitted}
          sub="With barangay ID application"         color="primary"   />
        <StatCard icon="✅" label="Verified"          value={ov.verified ?? 0}
          sub={`${pct(ov.verified, totalSubmitted)}% of submitted`} color="success" />
        <StatCard icon="⏳" label="Pending"           value={ov.pending ?? 0}
          sub="Needs staff action"                   color="warning"   />
        <StatCard icon="❌" label="Rejected"          value={ov.rejected ?? 0}
          sub="Resubmission needed"                  color="danger"    />
      </div>

      {/* Unregistered alert */}
      {(ov.no_id ?? 0) > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-700 flex gap-3">
          <span className="text-xl shrink-0">⚠️</span>
          <div>
            <span className="font-black">{ov.no_id} Unregistered Residents</span> — no Barangay ID application on file.
            These are excluded from verification rate calculations since they never submitted.
          </div>
        </div>
      )}

      {/* Verification time */}
      {avgTime && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Avg. Verification Time', val: avgTime.avg_hours, color: 'text-[#1a5276]' },
            { label: 'Fastest',                val: avgTime.min_hours, color: 'text-[#27ae60]' },
            { label: 'Slowest',                val: avgTime.max_hours, color: 'text-[#e74c3c]' },
          ].map(({ label, val, color }) => (
            <Card key={label}>
              <div className="text-center">
                <div className={`text-2xl font-black ${color}`}>
                  {val != null ? `${Math.round(val)}h` : '—'}
                </div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Daily registration */}
        <Card title="Daily Registration Submissions">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trend} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" name="Submissions" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Unregistered per purok */}
        <Card title="Unregistered Residents per Purok">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={unregByPurok} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="purok" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v, _, { payload }) => [`${v} (${payload?.pct}% of total)`, 'Unregistered']} />
              <Bar dataKey="unregistered" name="Unregistered" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {worstUnreg && (
            <p className="text-xs text-orange-500 font-semibold mt-2">
              ⚠️ {worstUnreg.purok} has the most unregistered ({worstUnreg.unregistered})
            </p>
          )}
        </Card>

        {/* Stacked status per purok */}
        <Card title="Submission Status per Purok">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={purokVerif} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="purok" tick={{ fontSize: 11 }} width={60} />
              <Tooltip />
              <Bar dataKey="verified" name="Verified" stackId="a" fill={COLORS.success} />
              <Bar dataKey="pending"  name="Pending"  stackId="a" fill={COLORS.warning} />
              <Bar dataKey="rejected" name="Rejected" stackId="a" fill={COLORS.danger} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Verification rate — submitted only */}
        <Card title="Verification Rate per Purok (Submitted Only)">
          <p className="text-[11px] text-gray-400 mb-3">
            Rate = Verified ÷ (Verified + Pending + Rejected). Unregistered residents are excluded.
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={purokRates} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="purok" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
              <Tooltip formatter={v => [`${v}%`, 'Verif. Rate']} />
              <Bar dataKey="rate" name="Verif. Rate" radius={[4, 4, 0, 0]}>
                {purokRates.map((p, i) => (
                  <Cell key={i}
                    fill={p.rate >= 80 ? COLORS.success : p.rate >= 50 ? COLORS.warning : COLORS.danger} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3 text-xs font-bold">
            <span className="text-green-600">🟢 ≥80% Good</span>
            <span className="text-amber-500">🟡 50–79% Moderate</span>
            <span className="text-red-500">🔴 &lt;50% Needs Action</span>
          </div>
        </Card>
      </div>
    </div>
  );
}