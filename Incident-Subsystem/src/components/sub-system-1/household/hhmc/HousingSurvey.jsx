import React from 'react';
import { Home, HardHat, Warehouse, ShieldCheck } from 'lucide-react';

const surveyAccentMap = {
  modern: { hoverBorder: 'hover:border-blue-500/30', primary: 'text-blue-500', primarySoft: 'bg-blue-50 text-blue-700' },
  blue: { hoverBorder: 'hover:border-blue-500/30', primary: 'text-blue-500', primarySoft: 'bg-blue-50 text-blue-700' },
  purple: { hoverBorder: 'hover:border-purple-500/30', primary: 'text-purple-500', primarySoft: 'bg-purple-50 text-purple-700' },
  green: { hoverBorder: 'hover:border-green-500/30', primary: 'text-green-500', primarySoft: 'bg-green-50 text-green-700' },
  dark: { hoverBorder: 'hover:border-slate-500/30', primary: 'text-slate-300', primarySoft: 'bg-slate-700 text-slate-200' },
};

const HousingSurvey = ({ data, t, currentTheme = 'modern' }) => {
  const accent = surveyAccentMap[currentTheme] || surveyAccentMap.modern;
  const MaterialBlock = ({ icon: Icon, label, value, colorClass }) => (
    <div className={`p-3 ${t.inlineBg} border ${t.cardBorder} rounded-2xl flex flex-col items-center justify-center text-center transition-all ${accent.hoverBorder}`}>
      <Icon size={18} className={`${colorClass} mb-2 opacity-80`} />
      <p className="text-[10px] font-medium text-slate-400 mb-1 font-kumbh">{label}</p>
      <p className={`text-sm font-semibold ${t.cardText} font-kumbh`}>{value || 'N/A'}</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <h4 className={`text-sm font-semibold ${t.cardText} font-spartan ml-1`}>Survey info</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MaterialBlock icon={Home} label="Tenure" value={data.tenure_status} colorClass="text-amber-500" />
        <MaterialBlock icon={HardHat} label="Walls" value={data.wall_material} colorClass={accent.primary} />
        <MaterialBlock icon={Warehouse} label="Roof" value={data.roof_material} colorClass="text-slate-500" />
        <div className={`p-3 ${t.inlineBg} border ${t.cardBorder} rounded-2xl flex flex-col items-center justify-center text-center`}>
          <ShieldCheck size={18} className={`${Number(data.is_indigent) === 1 ? 'text-rose-500' : 'text-slate-400'} mb-2`} />
          <p className="text-[10px] font-medium text-slate-400 mb-1 font-kumbh">Class</p>
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold font-kumbh ${Number(data.is_indigent) === 1 ? 'bg-rose-500 text-white' : accent.primarySoft}`}>
            {Number(data.is_indigent) === 1 ? 'Indigent' : 'General'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HousingSurvey;
