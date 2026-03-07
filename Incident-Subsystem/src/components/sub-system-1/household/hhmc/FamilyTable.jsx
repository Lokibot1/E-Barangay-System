import React from 'react';
import { Users } from 'lucide-react';

const familyAccentMap = {
  modern: 'text-blue-600',
  blue: 'text-blue-600',
  purple: 'text-purple-600',
  green: 'text-green-600',
  dark: 'text-slate-200',
};

const FamilyTable = ({ members, establishedDate, t, currentTheme = 'modern' }) => {
  const accentText = familyAccentMap[currentTheme] || familyAccentMap.modern;
  const establishedLabel =
    establishedDate && !Number.isNaN(new Date(establishedDate).getTime())
      ? new Date(establishedDate).toLocaleDateString()
      : null;

  return (
  <div>
    <div className="flex items-center justify-between mb-3 px-1">
      <h4 className={`flex items-center gap-2 text-sm font-semibold ${t.cardText} font-spartan`}>
        <Users size={14} className={accentText} /> Composition
      </h4>
      {establishedLabel && (
        <div className="text-[10px] font-medium text-slate-400 font-kumbh">
          Est: {establishedLabel}
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
          </tr>
        </thead>
        <tbody className={`divide-y ${t.cardBorder}`}>
          {members?.map((m, i) => (
            <tr key={i} className={`hover:${t.inlineBg} transition-colors group`}>
              <td className={`px-5 py-3 text-sm font-medium ${t.cardText} font-kumbh`}>{m.name}</td>
              <td className="px-5 py-3 text-center text-sm font-semibold font-kumbh">{m.age}</td>
              <td className={`px-5 py-3 text-sm font-medium font-kumbh ${accentText}`}>{m.relation}</td>
              <td className="px-5 py-3">
                <span className={`text-[10px] px-2.5 py-0.5 border ${t.cardBorder} rounded-md font-medium font-kumbh`}>
                  {m.sector || 'General'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
};

export default FamilyTable;
