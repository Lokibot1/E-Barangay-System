import { AlertTriangle, Eye, Siren } from 'lucide-react';
import { StatCard, Card, SectionHeader, EmptyState } from '../AnalyticsInterface';

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

function getPriorityStyles(priority, isDark) {
  const p = String(priority ?? '').toUpperCase();
  if (p === 'HIGH') {
    return isDark
      ? { iconBg: '#3f1d1d', iconText: '#fca5a5', badgeBg: '#7f1d1d', badgeText: '#fecaca', actionBg: '#3f1d1d', actionBorder: '#7f1d1d' }
      : { iconBg: '#fee2e2', iconText: '#b91c1c', badgeBg: '#fee2e2', badgeText: '#b91c1c', actionBg: '#fff1f2', actionBorder: '#fecdd3' };
  }
  if (p === 'MEDIUM') {
    return isDark
      ? { iconBg: '#3b2a14', iconText: '#fcd34d', badgeBg: '#78350f', badgeText: '#fde68a', actionBg: '#3b2a14', actionBorder: '#78350f' }
      : { iconBg: '#ffedd5', iconText: '#c2410c', badgeBg: '#ffedd5', badgeText: '#c2410c', actionBg: '#fff7ed', actionBorder: '#fed7aa' };
  }
  return isDark
    ? { iconBg: '#1e293b', iconText: '#93c5fd', badgeBg: '#1e3a8a', badgeText: '#bfdbfe', actionBg: '#0f172a', actionBorder: '#334155' }
    : { iconBg: '#dbeafe', iconText: '#1d4ed8', badgeBg: '#dbeafe', badgeText: '#1d4ed8', actionBg: '#eff6ff', actionBorder: '#bfdbfe' };
}

function PriorityInsightCard({ insight, t }) {
  const autoAction = buildRecommendedAction(insight);
  const resolvedTheme =
    typeof window !== 'undefined' ? localStorage.getItem('appTheme') || 'modern' : 'modern';
  const isDark = resolvedTheme === 'dark';
  const priorityStyle = getPriorityStyles(insight.priority, isDark);
  const priorityText = String(insight.priority ?? 'N/A').toUpperCase();

  return (
    <Card className="mb-3" t={t}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center text-lg font-bold"
            style={{ backgroundColor: priorityStyle.iconBg, color: priorityStyle.iconText }}
          >
            {insight.icon ?? '!'}
          </div>
          <div className="min-w-0">
            <h4 className={`text-base font-black ${t ? t.cardText : 'text-slate-900'}`}>{insight.title}</h4>
            <p className={`text-sm mt-1 ${t ? t.subtleText : 'text-slate-600'}`}>
              {insight.metric ?? 0} {insight.metric_label ?? 'items'} | Priority: {insight.priority ?? 'N/A'}
            </p>
          </div>
        </div>
        <span
          className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide"
          style={{ backgroundColor: priorityStyle.badgeBg, color: priorityStyle.badgeText }}
        >
          {priorityText}
        </span>
      </div>

      <div className={`mt-4 rounded-lg border p-3 ${t ? t.cardBorder : 'border-gray-200'} ${t ? t.inlineBg : 'bg-gray-50'}`}>
        <p className={`text-xs font-black uppercase tracking-wider mb-1 ${t ? t.primaryText : 'text-blue-700'}`}>
          Actionable Reason
        </p>
        <p className={`text-sm leading-relaxed ${t ? t.cardText : 'text-slate-700'}`}>{insight.description}</p>
      </div>

      <div
        className="mt-3 rounded-lg border p-3"
        style={{ backgroundColor: priorityStyle.actionBg, borderColor: priorityStyle.actionBorder }}
      >
        <p className={`text-xs font-black uppercase tracking-wider mb-1 ${t ? t.primaryText : 'text-blue-700'}`}>
          Recommended Action (Auto-Generated)
        </p>
        <p className={`text-sm font-semibold leading-relaxed ${t ? t.cardText : 'text-slate-800'}`}>{autoAction}</p>
      </div>
    </Card>
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
          <Card key={pg.key} title={pg.label} className="space-y-3" t={t}>
            {filtered.map((insight, idx) => (
              <PriorityInsightCard key={`${pg.key}-${idx}`} insight={insight} t={t} />
            ))}
          </Card>
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
