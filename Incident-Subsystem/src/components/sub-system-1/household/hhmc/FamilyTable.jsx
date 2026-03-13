import React from 'react';
import { Users, CalendarDays, ExternalLink } from 'lucide-react';

const familyAccentMap = {
  modern: 'text-blue-600',
  blue:   'text-blue-600',
  purple: 'text-purple-600',
  green:  'text-green-600',
  dark:   'text-slate-200',
};

/**
 * onMemberClick(residentId) — called when a member row is clicked.
 * Provided by HouseholdModal; opens ResidentDetailsModal on top.
 */
const FamilyTable = ({ members, establishedDate, t, currentTheme = 'modern', onMemberClick }) => {
  const accentText = familyAccentMap[currentTheme] || familyAccentMap.modern;

  const establishedLabel = (() => {
    if (!establishedDate) return null;
    const d = new Date(establishedDate);
    return !Number.isNaN(d.getTime())
      ? d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      : establishedDate;
  })();

  const handleRowClick = (residentId) => {
    if (residentId && onMemberClick) onMemberClick(residentId);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <h4 className={`flex items-center gap-2 text-sm font-semibold ${t.cardText} font-spartan`}>
          <Users size={14} className={accentText} /> Composition
        </h4>
        {establishedLabel && (
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 font-kumbh">
            <CalendarDays size={11} className="text-slate-400" />
            Est. {establishedLabel}
          </div>
        )}
      </div>

      <div className={`border ${t.cardBorder} rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-transparent`}>
        <table className="w-full text-left">
          <thead className={`${t.inlineBg} border-b ${t.cardBorder}`}>
            <tr>
              <th className="px-5 py-3 text-xs font-semibold text-slate-500 font-spartan">Name</th>
              <th className="px-5 py-3 text-xs font-semibold text-slate-500 font-spartan text-center">Age</th>
              <th className="px-5 py-3 text-xs font-semibold text-slate-500 font-spartan">Relation</th>
              <th className="px-5 py-3 text-xs font-semibold text-slate-500 font-spartan">Sector</th>
              <th className="px-5 py-3 text-xs font-semibold text-slate-500 font-spartan text-center">Registered</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${t.cardBorder}`}>
            {members?.map((m, i) => {
              const clickable = !!m.resident_id && !!onMemberClick;
              return (
                <tr
                  key={i}
                  onClick={() => handleRowClick(m.resident_id)}
                  className={`transition-colors group ${
                    clickable
                      ? 'cursor-pointer hover:bg-blue-50/60 dark:hover:bg-slate-800/60'
                      : `hover:${t.inlineBg}`
                  }`}
                >
                  <td className={`px-5 py-3 text-sm font-medium ${t.cardText} font-kumbh`}>
                    <div className="flex items-center gap-1.5">
                      <span className={clickable ? `group-hover:${accentText} transition-colors` : ''}>
                        {m.name}
                      </span>
                      {clickable && (
                        <ExternalLink
                          size={11}
                          className="text-slate-300 group-hover:text-blue-400 transition-colors shrink-0"
                        />
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-3 text-center text-sm font-semibold font-kumbh">
                    {m.age}
                  </td>

                  <td className={`px-5 py-3 text-sm font-medium font-kumbh ${accentText}`}>
                    {m.relation}
                  </td>

                  <td className="px-5 py-3">
                    <span className={`text-[10px] px-2.5 py-0.5 border ${t.cardBorder} rounded-md font-medium font-kumbh`}>
                      {m.sector || 'General'}
                    </span>
                  </td>

                  <td className="px-5 py-3 text-center">
                    {m.registered_at ? (
                      <div className="inline-flex items-center gap-1.5 justify-center">
                        <CalendarDays size={11} className="text-slate-400 shrink-0" />
                        <span className="text-[11px] font-medium font-kumbh text-slate-500">
                          {m.registered_at}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-300 font-kumbh">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FamilyTable;