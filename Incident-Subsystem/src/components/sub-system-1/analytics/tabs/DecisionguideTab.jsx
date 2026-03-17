import { AlertTriangle, Eye, Siren } from 'lucide-react';
import { StatCard, ChartCard, EmptyState } from '../AnalyticsInterface';

const LOW_INCOME_BRACKETS = new Set(['No Income', 'Below 5,000', '0']);

function detectPurok(text = '') {
  const m = String(text).match(/purok\s*\d+/i);
  return m ? m[0] : 'the affected purok';
}

function num(value) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function pct(part, whole) {
  const p = num(part);
  const w = num(whole);
  return w > 0 ? Math.round((p / w) * 100) : 0;
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') return NaN;
  const cleaned = String(value).replace('%', '').trim();
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : NaN;
}

function resolveInsightCount(insight) {
  const label = String(insight?.metric_label ?? '').toLowerCase();
  if (label.includes('%') || label.includes('percent')) return NaN;
  return toNumber(insight?.metric);
}

function resolvePriority(insight) {
  const rawPct = insight?.metric_percentage ?? insight?.metricPercent ?? insight?.percentage ?? insight?.share_pct ?? insight?.sharePct;
  const pct = toNumber(rawPct);
  if (Number.isFinite(pct)) {
    const count = resolveInsightCount(insight);
    if (Number.isFinite(count)) {
      if (pct >= 50 && count >= 30) return 'HIGH';
      if ((pct >= 50 && count >= 15) || (pct >= 25 && count >= 15)) return 'MEDIUM';
      return 'LOW';
    }
    if (pct >= 50) return 'HIGH';
    if (pct >= 25) return 'MEDIUM';
    return 'LOW';
  }
  return String(insight?.priority ?? 'LOW').toUpperCase();
}

function resolveMetricDisplay(insight) {
  const rawPct = insight?.metric_percentage ?? insight?.metricPercent ?? insight?.percentage ?? insight?.share_pct ?? insight?.sharePct;
  const pct = toNumber(rawPct);
  if (Number.isFinite(pct)) {
    return { value: pct, label: '% share' };
  }
  return { value: insight?.metric ?? 0, label: insight?.metric_label ?? 'items' };
}

function buildRecommendedAction(insight) {
  const title = String(insight?.title ?? '').toLowerCase();
  const description = String(insight?.description ?? '').toLowerCase();
  const metricLabel = String(insight?.metric_label ?? '').toLowerCase();
  const metric = Number(insight?.metric ?? 0);
  const priority = resolvePriority(insight);
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

function insightPriorityFromScore(score) {
  if (score >= 80) return 'HIGH';
  if (score >= 50) return 'MEDIUM';
  return 'LOW';
}

function buildAutoInsights(raw) {
  const hm = Array.isArray(raw?.heatmap?.puroks) ? raw.heatmap.puroks : [];
  const livelihood = raw?.livelihood ?? {};
  const overview = raw?.overview ?? {};
  const insights = [];

  if (hm.length > 0) {
    const topUnregistered = [...hm].sort((a, b) => num(b.unregistered) - num(a.unregistered))[0];
    const topSeniors = [...hm].sort((a, b) => num(b.seniors) - num(a.seniors))[0];
    const topPwd = [...hm].sort((a, b) => num(b.pwd) - num(a.pwd))[0];
    const topMinors = [...hm].sort((a, b) => num(b.minors) - num(a.minors))[0];
    const lowestVoterCoverage = [...hm]
      .map((p) => ({
        ...p,
        voterCoverage: pct(num(p.voters), num(p.total)),
      }))
      .sort((a, b) => num(a.voterCoverage) - num(b.voterCoverage))[0];

    const totalUnregistered = hm.reduce((sum, p) => sum + num(p.unregistered), 0);
    const totalSeniors = hm.reduce((sum, p) => sum + num(p.seniors), 0);
    const totalPwd = hm.reduce((sum, p) => sum + num(p.pwd), 0);
    const totalMinors = hm.reduce((sum, p) => sum + num(p.minors), 0);

    if (num(topUnregistered?.unregistered) > 0) {
      const count = num(topUnregistered.unregistered);
      const purokShare = pct(count, num(topUnregistered.total));
      const shareOfBarangayUnregistered = pct(count, totalUnregistered);
      const score = Math.min(100, count + purokShare + shareOfBarangayUnregistered);
      insights.push({
        title: `${topUnregistered.purok} - Registration Drive Needed`,
        metric: count,
        metric_label: 'Unregistered',
        metric_percentage: purokShare,
        priority: insightPriorityFromScore(score),
        description: `${topUnregistered.purok} has ${count} unregistered residents (${purokShare}% of purok residents and ${shareOfBarangayUnregistered}% of total unregistered).`,
      });
    }

    if (num(topSeniors?.seniors) > 0) {
      const count = num(topSeniors.seniors);
      const share = pct(count, totalSeniors);
      const score = Math.min(100, count + share);
      insights.push({
        title: `${topSeniors.purok} - Senior Services Focus`,
        metric: count,
        metric_label: 'Seniors',
        metric_percentage: share,
        priority: insightPriorityFromScore(score),
        description: `${topSeniors.purok} has the highest senior count (${count}), accounting for ${share}% of all senior residents.`,
      });
    }

    if (num(topPwd?.pwd) > 0) {
      const count = num(topPwd.pwd);
      const share = pct(count, totalPwd);
      const score = Math.min(100, count + share);
      insights.push({
        title: `${topPwd.purok} - PWD Accessibility Priority`,
        metric: count,
        metric_label: 'PWD',
        metric_percentage: share,
        priority: insightPriorityFromScore(score),
        description: `${topPwd.purok} has the highest PWD concentration (${count}), representing ${share}% of all PWD residents.`,
      });
    }

    if (num(topMinors?.minors) > 0) {
      const count = num(topMinors.minors);
      const share = pct(count, totalMinors);
      const score = Math.min(100, count + share);
      insights.push({
        title: `${topMinors.purok} - Youth Program Focus`,
        metric: count,
        metric_label: 'Minors',
        metric_percentage: share,
        priority: insightPriorityFromScore(score),
        description: `${topMinors.purok} has the highest minors count (${count}), equivalent to ${share}% of minors across all puroks.`,
      });
    }

    if (lowestVoterCoverage && num(lowestVoterCoverage.total) > 0) {
      const nonVoters = Math.max(0, num(lowestVoterCoverage.total) - num(lowestVoterCoverage.voters));
      const voterCoverage = num(lowestVoterCoverage.voterCoverage);
      const nonVoterShare = 100 - voterCoverage;
      const score = Math.min(100, nonVoters * 0.35 + nonVoterShare);
      insights.push({
        title: `${lowestVoterCoverage.purok} - Voter Participation Gap`,
        metric: nonVoters,
        metric_label: 'Estimated non-voters',
        metric_percentage: nonVoterShare,
        priority: insightPriorityFromScore(score),
        description: `${lowestVoterCoverage.purok} has the lowest voter coverage at ${voterCoverage}% (${nonVoters} estimated non-voters).`,
      });
    }
  }

  const incomeRows = Array.isArray(livelihood?.income_distribution) ? livelihood.income_distribution : [];
  if (incomeRows.length > 0) {
    const total = incomeRows.reduce((sum, row) => sum + num(row.count), 0);
    const low = incomeRows.reduce((sum, row) => {
      return sum + (LOW_INCOME_BRACKETS.has(String(row.bracket)) ? num(row.count) : 0);
    }, 0);
    if (low > 0) {
      const share = pct(low, total);
      const score = Math.min(100, low * 0.35 + share * 1.8);
      insights.push({
        title: 'Livelihood - Low Income Coverage',
        metric: low,
        metric_label: 'Low-income residents',
        metric_percentage: share,
        priority: insightPriorityFromScore(score),
        description: `${low} residents are in low-income brackets (${share}% of records with income data).`,
      });
    }
  }

  const households = num(overview.total_households);
  const indigentHouseholds = num(overview.indigent_households);
  if (households > 0 && indigentHouseholds > 0) {
    const indigentRate = pct(indigentHouseholds, households);
    const score = Math.min(100, indigentHouseholds * 0.8 + indigentRate);
    insights.push({
      title: 'Household Support - Indigent Coverage',
      metric: indigentHouseholds,
      metric_label: 'Indigent households',
      metric_percentage: indigentRate,
      priority: insightPriorityFromScore(score),
      description: `${indigentHouseholds} households are tagged indigent (${indigentRate}% of total households).`,
    });
  }

  return insights
    .map((insight) => ({ ...insight, __priority: resolvePriority(insight) }))
    .sort((a, b) => {
      const order = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const byPriority = (order[b.__priority] || 0) - (order[a.__priority] || 0);
      if (byPriority !== 0) return byPriority;
      return num(b.metric) - num(a.metric);
    })
    .slice(0, 10);
}

function PriorityInsightCard({ insight, t }) {
  const autoAction = buildRecommendedAction(insight);
  const priority = resolvePriority(insight);
  const metricDisplay = resolveMetricDisplay(insight);
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
              {metricDisplay.value ?? 0} {metricDisplay.label ?? 'items'}
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
  const summary = ins.summary ?? {};
  const generatedInsights = buildAutoInsights(raw);
  const fallbackInsights = Array.isArray(ins.insights) ? ins.insights : [];
  const sourceInsights = generatedInsights.length ? generatedInsights : fallbackInsights.map((insight) => ({
    ...insight,
    __priority: resolvePriority(insight),
  }));
  const computedInsights = sourceInsights.map((insight) => ({
    ...insight,
    __priority: insight.__priority ?? resolvePriority(insight),
  }));

  const priorityGroups = [
    { key: 'HIGH', label: 'High Priority', icon: Siren, color: 'danger' },
    { key: 'MEDIUM', label: 'Medium', icon: AlertTriangle, color: 'warning' },
    { key: 'LOW', label: 'Monitoring', icon: Eye, color: 'secondary' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {priorityGroups.map((pg) => {
          const computedCount = computedInsights.filter((i) => i.__priority === pg.key).length;
          const count = computedInsights.length
            ? computedCount
            : (summary[`${pg.key.toLowerCase()}_priority`] ?? 0);
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
        const filtered = computedInsights.filter((i) => i.__priority === pg.key);
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

      {computedInsights.length === 0 && (
        <EmptyState icon="*" message="No insights generated yet. Check that the backend is returning data." />
      )}

      {(generatedInsights.length > 0 || summary.computed_at) && (
        <p className={`text-xs text-right mt-4 ${t ? t.subtleText : 'text-gray-400'}`}>
          Computed: {generatedInsights.length > 0 ? 'Live from current dashboard data' : new Date(summary.computed_at).toLocaleString('en-PH')}
        </p>
      )}
    </div>
  );
}
