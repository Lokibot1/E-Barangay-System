/**
 * VerificationStats.jsx
 * ADDED: loading prop — renders StatSkeleton when true.
 * All original logic preserved.
 */

import React, { useMemo } from 'react';
import { CheckCircle2, Clock, MapPin, XCircle } from 'lucide-react';
import SkeletonLoader from '../common/SkeletonLoader';

const toneMap = {
  amber: {
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-600',
    panelBg: 'bg-amber-50/80 border-amber-100',
    panelText: 'text-amber-700',
  },
  blue: {
    iconBg: 'bg-[#eaf2ff]',
    iconText: 'text-[#2563eb]',
    panelBg: 'bg-[#f5f9ff] border-[#bfdbfe]',
    panelText: 'text-[#2563eb]',
  },
  green: {
    iconBg: 'bg-[#ecfdf5]',
    iconText: 'text-[#16a34a]',
    panelBg: 'bg-[#f0fdf4] border-[#bbf7d0]',
    panelText: 'text-[#16a34a]',
  },
  red: {
    iconBg: 'bg-red-50',
    iconText: 'text-red-500',
    panelBg: 'bg-red-50/80 border-red-100',
    panelText: 'text-red-600',
  },
  dark: {
    iconBg: 'bg-slate-800',
    iconText: 'text-slate-200',
    panelBg: 'bg-slate-900 border-slate-700',
    panelText: 'text-slate-300',
  },
};

const VerificationStats = ({ submissions = [], loading = false, t, currentTheme = 'modern' }) => {
  const isDark = currentTheme === 'dark';

  // ── Show skeleton while loading ───────────────────────────────────────────
  if (loading) {
    return <SkeletonLoader variant="stat" count={4} isDark={isDark} />;
  }

  const stats = useMemo(() => {
    const counts = { pending: 0, forVerification: 0, verified: 0, rejected: 0 };
    submissions.forEach(s => {
      const status = s.status?.toLowerCase();
      if (status === 'pending')           counts.pending++;
      else if (status === 'for verification') counts.forVerification++;
      else if (status === 'verified')     counts.verified++;
      else if (status === 'rejected')     counts.rejected++;
    });
    return counts;
  }, [submissions]);

  const statsConfig = [
    { title: 'Pending',          value: stats.pending,          subtitle: 'Awaiting Review',    icon: Clock,        color: 'amber' },
    { title: 'For Verification', value: stats.forVerification,  subtitle: 'On-site Check',      icon: MapPin,       color: 'blue'  },
    { title: 'Verified',         value: stats.verified,         subtitle: 'Approved Records',   icon: CheckCircle2, color: 'green' },
    { title: 'Rejected',         value: stats.rejected,         subtitle: 'Denied Submissions', icon: XCircle,      color: 'red'   },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statsConfig.map((stat) => {
        const Icon = stat.icon;
        const tone = isDark ? toneMap.dark : toneMap[stat.color];
        const isVerifiedGreen = !isDark && stat.color === 'green';

        return (
          <div
            key={stat.title}
            className={`${t.cardBg} border ${t.cardBorder} rounded-[26px] p-5 sm:p-6 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_35px_rgba(15,23,42,0.12)]`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-2 text-left">
                <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${t.subtleText}`}>
                  {stat.title}
                </p>
                <div className={`block w-full text-left text-3xl font-bold leading-none ${t.cardText} font-spartan sm:text-[2.15rem]`}>
                  {stat.value.toLocaleString()}
                </div>
              </div>
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] ${isVerifiedGreen ? '' : tone.iconBg}`}
                style={isVerifiedGreen ? { backgroundColor: '#ecfdf5' } : undefined}
              >
                <Icon
                  className={isVerifiedGreen ? '' : tone.iconText}
                  style={isVerifiedGreen ? { color: '#16a34a' } : undefined}
                  size={18}
                  strokeWidth={2.1}
                />
              </div>
            </div>
            <div
              className={`mt-5 rounded-[18px] border px-4 py-3 ${isVerifiedGreen ? '' : tone.panelBg}`}
              style={isVerifiedGreen ? { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' } : undefined}
            >
              <p
                className={`text-[13px] font-medium ${isDark ? t.subtleText : isVerifiedGreen ? '' : tone.panelText} font-kumbh`}
                style={isVerifiedGreen ? { color: '#16a34a' } : undefined}
              >
                {stat.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VerificationStats;