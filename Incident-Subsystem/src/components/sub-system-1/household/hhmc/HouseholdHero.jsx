import React from 'react';
import { User, Users, ExternalLink } from 'lucide-react';

const heroAccentMap = {
  modern: { panel: 'bg-blue-50 border-blue-100',     text: 'text-blue-600',   ghost: 'text-blue-500/5'   },
  blue:   { panel: 'bg-blue-50 border-blue-100',     text: 'text-blue-600',   ghost: 'text-blue-500/5'   },
  purple: { panel: 'bg-purple-50 border-purple-100', text: 'text-purple-600', ghost: 'text-purple-500/5' },
  green:  { panel: 'bg-green-50 border-green-100',   text: 'text-green-600',  ghost: 'text-green-500/5'  },
  dark:   { panel: 'bg-slate-700/60 border-slate-600', text: 'text-slate-200', ghost: 'text-slate-400/10' },
};

/**
 * onHeadClick(residentId) — called when the head card is clicked.
 * Provided by HouseholdModal; opens ResidentDetailsModal on top.
 */
const HouseholdHero = ({ data, t, currentTheme = 'modern', onHeadClick }) => {
  const accent = heroAccentMap[currentTheme] || heroAccentMap.modern;

  // Find the head's resident_id from memberList
  const headMember     = (data.memberList || []).find(m => m.relation === 'Head of Family');
  const headResidentId = headMember?.resident_id ?? null;
  const isClickable    = !!headResidentId && !!onHeadClick;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* ── Head of Family card ── */}
      <div
        onClick={() => isClickable && onHeadClick(headResidentId)}
        title={isClickable ? `View ${data.head}'s profile` : undefined}
        className={`
          p-5 border-2 rounded-3xl relative overflow-hidden
          ${accent.panel}
          ${isClickable
            ? 'cursor-pointer transition-all duration-150 hover:shadow-md hover:scale-[1.015] active:scale-[0.99]'
            : ''}
        `}
      >
        <div className={`flex items-center justify-between gap-2 mb-2 relative z-10 ${accent.text}`}>
          <div className="flex items-center gap-2">
            <User size={18} strokeWidth={2.5} />
            <span className="text-xs font-medium font-kumbh">Head of family</span>
          </div>
          {isClickable && (
            <ExternalLink size={13} className={`${accent.text} opacity-60`} />
          )}
        </div>

        <p className={`text-xl font-bold ${t.cardText} relative z-10 font-spartan`}>
          {data.head}
        </p>

        {isClickable && (
          <p className={`text-[10px] font-kumbh mt-1 relative z-10 ${accent.text} opacity-60`}>
            Click to view profile
          </p>
        )}

        <User className={`absolute -right-4 -bottom-4 ${accent.ghost}`} size={100} />
      </div>

      {/* ── Household size card ── */}
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