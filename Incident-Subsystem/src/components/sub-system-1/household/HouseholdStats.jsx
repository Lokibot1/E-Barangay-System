import React from 'react';
import { Home, Landmark, MapPin, Users } from 'lucide-react';

const toneMap = {
  blue: {
    iconBg: 'bg-[#eaf2ff]',
    iconText: 'text-[#2563eb]',
    panelBg: 'bg-[#f5f9ff] border-[#bfdbfe]',
    panelText: 'text-[#2563eb]',
  },
  amber: {
    iconBg: 'bg-[#fffbeb]',
    iconText: 'text-[#d97706]',
    panelBg: 'bg-[#fffaf0] border-[#fcd34d]',
    panelText: 'text-[#b45309]',
  },
  emerald: {
    iconBg: 'bg-[#ecfdf5]',
    iconText: 'text-[#059669]',
    panelBg: 'bg-[#f0fdf8] border-[#a7f3d0]',
    panelText: 'text-[#047857]',
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

const HouseholdStats = ({ stats, t, currentTheme = 'modern' }) => {
  const cards = [
    {
      title: 'Total Households',
      value: stats.total,
      subtitle: 'Registered Family Units',
      icon: Home,
      color: 'blue'
    },
    {
      title: 'Indigent Families',
      value: stats.indigents,
      subtitle: 'DSWD Priority List',
      icon: Landmark,
      color: 'amber'
    },
    {
      title: 'Home Owners',
      value: stats.owners,
      subtitle: `${stats.ownerPercent}% of Total Units`,
      icon: MapPin,
      color: 'emerald'
    },
    {
      title: 'Priority Heads',
      value: stats.priority,
      subtitle: 'Senior or PWD Headed',
      icon: Users,
      color: 'rose'
    }
  ];

  const isDark = currentTheme === 'dark';

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const tone = isDark ? toneMap.dark : toneMap[card.color];

        return (
          <div
            key={card.title}
            className={`${t.cardBg} border ${t.cardBorder} rounded-[26px] p-5 sm:p-6 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_35px_rgba(15,23,42,0.12)]`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-2 text-left">
                <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${t.subtleText}`}>
                  {card.title}
                </p>
                <div className={`block w-full text-left text-3xl font-bold leading-none ${t.cardText} font-spartan sm:text-[2.15rem]`}>
                  {card.value.toLocaleString()}
                </div>
              </div>

              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] ${tone.iconBg}`}>
                <Icon className={tone.iconText} size={18} strokeWidth={2.1} />
              </div>
            </div>

            <div className={`mt-5 rounded-[18px] border px-4 py-3 ${tone.panelBg}`}>
              <p className={`text-[13px] font-medium ${isDark ? t.subtleText : tone.panelText} font-kumbh`}>
                {card.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HouseholdStats;
