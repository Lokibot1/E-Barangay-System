import React from 'react';
import { Users } from 'lucide-react';

const FamilyTable = ({ members, establishedDate, t }) => (
  <div>
    <div className="flex items-center justify-between mb-3 px-1">
      <h4 className={`flex items-center gap-2 text-[10px] font-black ${t.cardText} uppercase tracking-widest font-spartan`}>
        <Users size={14} className="text-emerald-600" /> Composition
      </h4>
      <div className="text-[9px] font-bold text-slate-400 uppercase">
        Est: {new Date(establishedDate).toLocaleDateString()}
      </div>
    </div>

    <div className={`border ${t.cardBorder} rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-transparent`}>
      <table className="w-full text-left">
        <thead className={`${t.inlineBg} border-b ${t.cardBorder}`}>
          <tr>
            <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest font-spartan">Name</th>
            <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest font-spartan text-center">Age</th>
            <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest font-spartan">Relation</th>
            <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest font-spartan">Sector</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${t.cardBorder}`}>
          {members?.map((m, i) => (
            <tr key={i} className={`hover:${t.inlineBg} transition-colors group`}>
              <td className="px-5 py-3 text-xs font-black ${t.cardText} uppercase font-spartan">{m.name}</td>
              <td className="px-5 py-3 text-center text-xs font-bold font-kumbh">{m.age}</td>
              <td className="px-5 py-3 text-[10px] font-black text-emerald-600 uppercase">{m.relation}</td>
              <td className="px-5 py-3">
                <span className={`text-[8px] px-2 py-0.5 border ${t.cardBorder} rounded font-black uppercase`}>
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

export default FamilyTable;