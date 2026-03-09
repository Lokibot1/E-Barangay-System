import { AlertTriangle, Eye, Siren } from 'lucide-react';
import { StatCard, ChartCard, SectionHeader, EmptyState } from '../AnalyticsInterface';

function detectPurok(text = '') {
  const m = String(text).match(/purok\s*\d+/i);
  return m ? m[0] : 'the affected purok';
}

function buildRecommendedAction(insight) {
  const title = String(insight?.title ?? '').toLowerCase();
  const description = String(insight?.description ?? '').toLowerCase();
  const metricLabel = String(insight?.metric_label ?? '').toLowerCase();
  const metric = Number(insight?.metric ?? 0);
  const priority = String(insight?.priority ?? '').toUpperCase();
  const text = `${title} ${description} ${metricLabel}`;
  const purok = detectPurok(insight?.title);

  if (text.includes('unregistered') || text.includes('registration') || text.includes('no barangay id')) {
    return `Run a 2-day registration drive in ${purok}, including door-to-door validation for seniors and PWD. Assign one queue desk and one encoder lane until backlog is reduced.`;
  }
  if (text.includes('senior')) {
    return `Coordinate with OSCA and the health center for ${purok}. Schedule weekly senior profiling and home visits, then publish the updated senior priority masterlist.`;
  }
  if (text.includes('pending') || text.includes('verification')) {
    return `Open a dedicated verification queue and process at least ${Math.max(10, Math.ceil(metric / 5))} applications per day until pending cases are cleared.`;
  }
  if (text.includes('pwd')) {
    return `Conduct a PWD facility and records audit this month. Validate IDs, mark accessibility gaps, and submit the compliance checklist to barangay leadership.`;
  }
  if (text.includes('indigent') || text.includes('low income') || text.includes('4ps') || text.includes('dswd')) {
    return `Validate household eligibility and endorse qualified families to DSWD programs. Prioritize cases without active assistance and track referrals weekly.`;
  }
  if (text.includes('rejected')) {
    return `Send rejection follow-ups with a document checklist and set a resubmission clinic day within 7 days for faster reprocessing.`;
  }
  if (text.includes('education') || text.includes('incomplete')) {
    return `Add education record correction in monthly data cleanup. Require missing fields during clearance and certificate transactions.`;
  }
  if (text.includes('new resident') || text.includes('population growth')) {
    return `Update purok-level population mapping and adjust service allocation for new residents in the next barangay planning cycle.`;
  }
  if (text.includes('verified')) {
    return 'Maintain current workflow and set a weekly quality review to keep verification output stable while minimizing rejections.';
  }

  if (priority === 'HIGH') return 'Assign a lead focal person and execute an immediate 7-day intervention plan with daily progress checks.';
  if (priority === 'MEDIUM') return 'Plan a targeted intervention this week and track completion in the barangay operations meeting.';
  return 'Keep this item under monitoring and review trend movement during the next reporting cycle.';
}

function PriorityInsightCard({ insight, t }) {
  const autoAction = buildRecommendedAction(insight);
  const priority = String(insight?.priority ?? 'LOW').toUpperCase();
  const tone = {
    HIGH: {
      iconWrap: 'bg-rose-50 text-rose-600',
      badge: 'border-rose-200 bg-rose-50 text-rose-700',
      reason: 'border-slate-200 bg-slate-50',
      action: 'border-rose-200 bg-rose-50/70 text-rose-700',
      label: 'text-rose-600',
    },
    MEDIUM: {
      iconWrap: 'bg-amber-50 text-amber-600',
      badge: 'border-amber-200 bg-amber-50 text-amber-700',
      reason: 'border-slate-200 bg-slate-50',
      action: 'border-amber-200 bg-amber-50/70 text-amber-700',
      label: 'text-amber-600',
    },
    LOW: {
      iconWrap: 'bg-blue-50 text-blue-600',
      badge: 'border-blue-200 bg-blue-50 text-blue-700',
      reason: 'border-slate-200 bg-slate-50',
      action: 'border-blue-200 bg-blue-50/70 text-blue-700',
      label: 'text-blue-600',
    },
  }[priority] ?? {
    iconWrap: 'bg-slate-100 text-slate-600',
    badge: 'border-slate-200 bg-slate-50 text-slate-700',
    reason: 'border-slate-200 bg-slate-50',
    action: 'border-slate-200 bg-slate-50 text-slate-700',
    label: 'text-slate-600',
  };

  return (
    <div className={`${t ? t.cardBg : 'bg-white'} rounded-[24px] border ${t ? t.cardBorder : 'border-[#e7ecf3]'} p-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)]`}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`flex h-10 w-10 items-center justify-center rounded-[14px] text-lg font-bold ${tone.iconWrap}`}>
            {insight.icon ?? '!'}
          </div>
          <div className="min-w-0">
            <h4 className={`text-base font-black ${t ? t.cardText : 'text-slate-900'}`}>{insight.title}</h4>
            <p className={`mt-1 text-sm ${t ? t.subtleText : 'text-slate-600'}`}>
              {insight.metric ?? 0} {insight.metric_label ?? 'items'}
            </p>
          </div>
        </div>
        <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${tone.badge}`}>
          {priority}
        </span>
      </div>

      <div className={`mt-4 rounded-[18px] border p-4 ${tone.reason}`}>
        <p className={`mb-1 text-[10px] font-black uppercase tracking-[0.22em] ${tone.label}`}>Actionable Reason</p>
        <p className="text-sm text-slate-700">{insight.description}</p>
      </div>

      <div className={`mt-3 rounded-[18px] border p-4 ${tone.action}`}>
        <p className="mb-1 text-[10px] font-black uppercase tracking-[0.22em]">Recommended Action</p>
        <p className="text-sm font-semibold">{autoAction}</p>
      </div>
    </div>
  );
}

export default function DecisionGuideTab({ raw, t }) {
  const ins = raw?.insights ?? {};
  const insights = ins.insights ?? [];
  const summary = ins.summary ?? {};

  const priorityGroups = [
    { key: 'HIGH', label: 'High Priority', icon: Siren, color: 'danger' },
    { key: 'MEDIUM', label: 'Medium', icon: AlertTriangle, color: 'warning' },
    { key: 'LOW', label: 'Monitoring', icon: Eye, color: 'secondary' },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Decision Guide & Actionable Insights"
        subtitle="Data-driven analysis and recommended actions for barangay officials"
        t={t}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {priorityGroups.map((pg) => {
          const count = summary[`${pg.key.toLowerCase()}_priority`] ?? insights.filter((i) => i.priority === pg.key).length;
          return (
            <StatCard
              key={pg.key}
              icon={pg.icon}
              label={pg.label}
              value={count}
              sub="Current insights"
              color={pg.color}
              t={t}
            />
          );
        })}
      </div>

      {priorityGroups.map((pg) => {
        const filtered = insights.filter((i) => i.priority === pg.key);
        if (!filtered.length) return null;
        return (
          <ChartCard
            key={pg.key}
            title={pg.label}
            subtitle={`Current ${pg.label.toLowerCase()} recommendations generated from barangay analytics signals.`}
            rightLabel={`${filtered.length} insight${filtered.length > 1 ? 's' : ''}`}
            t={t}
          >
            <div className="space-y-4">
              {filtered.map((insight, idx) => (
                <PriorityInsightCard key={`${pg.key}-${idx}`} insight={insight} t={t} />
              ))}
            </div>
          </ChartCard>
        );
      })}

      {insights.length === 0 && (
        <EmptyState icon="*" message="No insights generated yet. Check that the backend is returning data." />
      )}

      {summary.computed_at && (
        <p className={`text-xs text-right mt-4 ${t ? t.subtleText : 'text-gray-400'}`}>
          Computed: {new Date(summary.computed_at).toLocaleString('en-PH')}
        </p>
      )}
    </div>
  );
}
