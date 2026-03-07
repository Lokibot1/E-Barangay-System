import React from 'react';
import { User, Users } from 'lucide-react';

const heroAccentMap = {
  modern: { panel: 'bg-blue-50 border-blue-100', text: 'text-blue-600', ghost: 'text-blue-500/5' },
  blue: { panel: 'bg-blue-50 border-blue-100', text: 'text-blue-600', ghost: 'text-blue-500/5' },
  purple: { panel: 'bg-purple-50 border-purple-100', text: 'text-purple-600', ghost: 'text-purple-500/5' },
  green: { panel: 'bg-green-50 border-green-100', text: 'text-green-600', ghost: 'text-green-500/5' },
  dark: { panel: 'bg-slate-700/60 border-slate-600', text: 'text-slate-200', ghost: 'text-slate-400/10' },
};

const HouseholdHero = ({ data, t, currentTheme = 'modern' }) => {
  const accent = heroAccentMap[currentTheme] || heroAccentMap.modern;

  return (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className={`p-5 border-2 rounded-3xl relative overflow-hidden ${accent.panel}`}>
      <div className={`flex items-center gap-2 mb-2 relative z-10 ${accent.text}`}>
        <User size={18} strokeWidth={2.5} />
        <span className="text-xs font-medium font-kumbh">Head of family</span>
      </div>
      <p className={`text-xl font-bold ${t.cardText} relative z-10 font-spartan`}>{data.head}</p>
      <User className={`absolute -right-4 -bottom-4 ${accent.ghost}`} size={100} />
    </div>

    <div className={`p-5 border-2 rounded-3xl relative overflow-hidden ${accent.panel}`}>
      <div className={`flex items-center gap-2 mb-2 relative z-10 ${accent.text}`}>
        <Users size={18} strokeWidth={2.5} />
        <span className="text-xs font-medium font-kumbh">Household size</span>
      </div>
      <div className="flex items-baseline gap-2 relative z-10">
        <p className={`text-3xl font-black ${t.cardText} font-kumbh`}>{data.members}</p>
        <p className="text-xs font-medium text-slate-400 font-kumbh">Members</p>
      </div>
      <Users className={`absolute -right-4 -bottom-4 ${accent.ghost}`} size={100} />
    </div>
  </div>
);
};

export default HouseholdHero;
