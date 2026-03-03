import React from 'react';
import { User, Users } from 'lucide-react';

const HouseholdHero = ({ data, t }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="p-5 bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-100 dark:border-emerald-800/30 rounded-3xl relative overflow-hidden">
      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2 relative z-10">
        <User size={18} strokeWidth={2.5} />
        <span className="text-[10px] font-black uppercase tracking-widest font-spartan">Head of Family</span>
      </div>
      <p className={`text-xl font-black ${t.cardText} uppercase relative z-10 font-spartan`}>{data.head}</p>
      <User className="absolute -right-4 -bottom-4 text-emerald-500/5" size={100} />
    </div>

    <div className="p-5 bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-800/30 rounded-3xl relative overflow-hidden">
      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2 relative z-10">
        <Users size={18} strokeWidth={2.5} />
        <span className="text-[10px] font-black uppercase tracking-widest font-spartan">Household Size</span>
      </div>
      <div className="flex items-baseline gap-2 relative z-10">
        <p className={`text-3xl font-black ${t.cardText} font-kumbh`}>{data.members}</p>
        <p className="text-xs font-bold text-slate-400 uppercase">Members</p>
      </div>
      <Users className="absolute -right-4 -bottom-4 text-blue-500/5" size={100} />
    </div>
  </div>
);

export default HouseholdHero;