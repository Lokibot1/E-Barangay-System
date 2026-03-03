import React from 'react';
import { Home, HardHat, Warehouse, ShieldCheck } from 'lucide-react';

const HousingSurvey = ({ data, t }) => {
  const MaterialBlock = ({ icon: Icon, label, value, colorClass }) => (
    <div className={`p-3 ${t.inlineBg} border ${t.cardBorder} rounded-2xl flex flex-col items-center justify-center text-center transition-all hover:border-emerald-500/30`}>
      <Icon size={18} className={`${colorClass} mb-2 opacity-80`} />
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-[11px] font-black ${t.cardText} uppercase font-spartan`}>{value || 'N/A'}</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <h4 className={`text-[9px] font-black ${t.subtleText} uppercase tracking-[0.3em] ml-1`}>Survey Info</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MaterialBlock icon={Home} label="Tenure" value={data.tenure_status} colorClass="text-amber-500" />
        <MaterialBlock icon={HardHat} label="Walls" value={data.wall_material} colorClass="text-blue-500" />
        <MaterialBlock icon={Warehouse} label="Roof" value={data.roof_material} colorClass="text-slate-500" />
        <div className={`p-3 ${t.inlineBg} border ${t.cardBorder} rounded-2xl flex flex-col items-center justify-center text-center`}>
          <ShieldCheck size={18} className={`${Number(data.is_indigent) === 1 ? 'text-rose-500' : 'text-slate-400'} mb-2`} />
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Class</p>
          <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase ${Number(data.is_indigent) === 1 ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
            {Number(data.is_indigent) === 1 ? 'INDIGENT' : 'GENERAL'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HousingSurvey;