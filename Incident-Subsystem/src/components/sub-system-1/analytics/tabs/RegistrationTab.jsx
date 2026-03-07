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
import { StatCard, Card, SectionHeader } from '../AnalyticsInterface';
import { FileText, CheckCircle, Clock, XCircle, AlertTriangle, Circle } from 'lucide-react';
import { COLORS, pct, calcVerifRate } from '../analyticsConfig';

export default function RegistrationTab({ raw, t }) {
  const ov = raw?.overview ?? {};
  const reg = raw?.registration ?? {};
  const hm = raw?.heatmap?.puroks ?? [];

  const trend = reg.registration_trend ?? [];
  const purokVerif = reg.purok_verification ?? [];
  const avgTime = reg.avg_verification_time;

  const unregByPurok = hm.map((p) => ({
    purok: p.purok,
    unregistered: Number(p.unregistered ?? 0),
    total: Number(p.total ?? 0),
    pct: pct(p.unregistered, p.total),
  }));
  const worstUnreg = [...unregByPurok].sort((a, b) => b.unregistered - a.unregistered)[0];

  const purokRates = hm.map((p) => ({
    purok: p.purok,
    verified: Number(p.verified ?? 0),
    pending: Number(p.pending ?? 0),
    rejected: Number(p.rejected ?? 0),
    rate: calcVerifRate(p),
  }));

  const totalSubmitted = (ov.verified ?? 0) + (ov.pending ?? 0) + (ov.rejected ?? 0);

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
        title="Registration and Verification"
        subtitle="Submissions, verification progress, and unregistered residents"
        t={t}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={FileText} label="Total Submitted" value={totalSubmitted} sub="With barangay ID application" color="primary" t={t} />
        <StatCard icon={CheckCircle} label="Verified" value={ov.verified ?? 0} sub={`${pct(ov.verified, totalSubmitted)}% of submitted`} color="success" t={t} />
        <StatCard icon={Clock} label="Pending" value={ov.pending ?? 0} sub="Needs staff action" color="warning" t={t} />
        <StatCard icon={XCircle} label="Rejected" value={ov.rejected ?? 0} sub="Resubmission needed" color="danger" t={t} />
      </div>

      {(ov.no_id ?? 0) > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-700 flex gap-3">
          <AlertTriangle className="w-6 h-6 shrink-0 text-orange-500" />
          <div>
            <span className="font-black">{ov.no_id} Unregistered Residents</span> - no Barangay ID application on file.
            These are excluded from verification rate calculations since they never submitted.
          </div>
        </div>
      )}

      {avgTime && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Avg. Verification Time', val: avgTime.avg_hours, color: 'text-indigo-700' },
            { label: 'Fastest', val: avgTime.min_hours, color: 'text-emerald-600' },
            { label: 'Slowest', val: avgTime.max_hours, color: 'text-rose-600' },
          ].map(({ label, val, color }) => (
            <Card key={label} t={t}>
              <div className="text-center">
                <div className={`text-2xl font-black ${color}`}>{val != null ? `${Math.round(val)}h` : '-'}</div>
                <div className="text-xs text-slate-500 mt-1">{label}</div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="Daily Registration Submissions" t={t}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trend} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="date" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" name="Submissions" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Unregistered Residents per Purok" t={t}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={unregByPurok} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="purok" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip formatter={(v, _, { payload }) => [`${v} (${payload?.pct}% of total)`, 'Unregistered']} contentStyle={tooltipStyle} />
              <Bar dataKey="unregistered" name="Unregistered" fill={COLORS.accent} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {worstUnreg && (
            <p className="text-xs text-orange-600 font-semibold mt-2">
              <AlertTriangle className="inline-block w-4 h-4 mr-1 text-orange-500" /> {worstUnreg.purok} has the most unregistered ({worstUnreg.unregistered})
            </p>
          )}
        </Card>

        <Card title="Submission Status per Purok" t={t}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={purokVerif} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
              <XAxis type="number" tick={axisTick} />
              <YAxis type="category" dataKey="purok" tick={axisTick} width={60} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="verified" name="Verified" stackId="a" fill={COLORS.success} />
              <Bar dataKey="pending" name="Pending" stackId="a" fill={COLORS.warning} />
              <Bar dataKey="rejected" name="Rejected" stackId="a" fill={COLORS.danger} radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Verification Rate per Purok (Submitted Only)" t={t}>
          <p className="text-[11px] text-slate-500 mb-3">Rate = Verified / (Verified + Pending + Rejected). Unregistered residents are excluded.</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={purokRates} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="purok" tick={axisTick} />
              <YAxis tick={axisTick} domain={[0, 100]} unit="%" />
              <Tooltip formatter={(v) => [`${v}%`, 'Verif. Rate']} contentStyle={tooltipStyle} />
              <Bar dataKey="rate" name="Verif. Rate" radius={[8, 8, 0, 0]}>
                {purokRates.map((p, i) => (
                  <Cell key={i} fill={p.rate >= 80 ? COLORS.success : p.rate >= 50 ? COLORS.warning : COLORS.danger} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3 text-xs font-bold">
            <span className="text-green-600"><Circle className="inline-block w-3 h-3 mr-1" /> {'>=80% Good'}</span>
            <span className="text-amber-500"><Circle className="inline-block w-3 h-3 mr-1" /> 50-79% Moderate</span>
            <span className="text-red-500"><Circle className="inline-block w-3 h-3 mr-1" /> &lt;50% Needs Action</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
