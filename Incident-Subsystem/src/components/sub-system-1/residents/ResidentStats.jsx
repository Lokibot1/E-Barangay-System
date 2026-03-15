/**
 * ResidentStats.jsx
 * ADDED: loading prop — renders StatSkeleton when true.
 * All original logic preserved.
 */

import React, { useMemo } from 'react';
import { HeartPulse, ShieldCheck, UserCheck, Users } from 'lucide-react';
import SkeletonLoader from '../common/SkeletonLoader';

const toneMap = {
  blue: {
    iconBg: 'bg-[#eaf2ff]',
    iconText: 'text-[#2563eb]',
    panelBg: 'bg-[#f5f9ff] border-[#bfdbfe]',
    panelText: 'text-[#2563eb]',
  },
  emerald: {
    iconBg: 'bg-[#ecfdf5]',
    iconText: 'text-[#059669]',
    panelBg: 'bg-[#f0fdf8] border-[#a7f3d0]',
    panelText: 'text-[#047857]',
  },
  amber: {
    iconBg: 'bg-[#fffbeb]',
    iconText: 'text-[#d97706]',
    panelBg: 'bg-[#fffaf0] border-[#fcd34d]',
    panelText: 'text-[#b45309]',
  },
  rose: {
    iconBg: 'bg-[#fff1f2]',
    iconText: 'text-[#e11d48]',
    panelBg: 'bg-[#fff5f6] border-[#fecdd3]',
    panelText: 'text-[#be123c]',
  },
  dark: {
    iconBg: 'bg-slate-800',
    iconText: 'text-slate-200',
    panelBg: 'bg-slate-900 border-slate-700',
    panelText: 'text-slate-300',
  },
};

const ResidentStats = ({ residents, loading = false, t, currentTheme = 'modern' }) => {
  const isDark = currentTheme === 'dark';

  if (loading) {
    return <SkeletonLoader variant="stat" count={4} isDark={isDark} />;
  }

  const statsData = useMemo(() => {
    const residentList = residents || [];

    const getSectorCount = (cat) => residentList.filter(r => {
      const s = (typeof r.sector === 'object' ? r.sector?.name : r.sector) || '';
      return s.toUpperCase() === cat.toUpperCase();
    }).length;

    return [
      {
        title: 'Total Population',
        value: residentList.length,
        subtitle: 'Official Records',
        icon: Users,
        color: 'blue',
      },
      {
        title: 'Voter Census',
        value: residentList.filter(r => r.is_voter == 1 || r.is_voter === 'Yes').length,
        subtitle: 'Qualified Voters',
        icon: UserCheck,
        color: 'emerald',
      },
      {
        title: 'Senior Citizens',
        value: getSectorCount('SENIOR CITIZEN'),
        subtitle: 'Aged 60 & Above',
        icon: ShieldCheck,
        color: 'amber',
      },
      {
        title: 'Priority Groups',
        value: getSectorCount('PWD') + getSectorCount('SOLO PARENT'),
        subtitle: 'PWD & Solo Parents',
        icon: HeartPulse,
        color: 'rose',
      },
    ];
  }, [residents]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statsData.map((stat) => {
        const Icon = stat.icon;
        const tone = isDark ? toneMap.dark : toneMap[stat.color];

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
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] ${tone.iconBg}`}>
                <Icon className={tone.iconText} size={18} strokeWidth={2.1} />
              </div>
            </div>
            <div className={`mt-5 rounded-[18px] border px-4 py-3 ${tone.panelBg}`}>
              <p className={`text-[13px] font-medium ${isDark ? t.subtleText : tone.panelText} font-kumbh`}>
                {stat.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ResidentStats;