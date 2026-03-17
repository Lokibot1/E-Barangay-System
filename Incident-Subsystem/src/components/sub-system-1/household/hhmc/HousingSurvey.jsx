import React from 'react';
import { Home, HardHat, Warehouse, ShieldCheck, Users } from 'lucide-react';

const surveyAccentMap = {
  modern: { hoverBorder: 'hover:border-blue-500/30', primary: 'text-blue-500', primarySoft: 'bg-blue-50 text-blue-700' },
  blue: { hoverBorder: 'hover:border-blue-500/30', primary: 'text-blue-500', primarySoft: 'bg-blue-50 text-blue-700' },
  purple: { hoverBorder: 'hover:border-purple-500/30', primary: 'text-purple-500', primarySoft: 'bg-purple-50 text-purple-700' },
  green: { hoverBorder: 'hover:border-green-500/30', primary: 'text-green-500', primarySoft: 'bg-green-50 text-green-700' },
  dark: { hoverBorder: 'hover:border-slate-500/30', primary: 'text-slate-300', primarySoft: 'bg-slate-700 text-slate-200' },
};

const HousingSurvey = ({ data, t, currentTheme = 'modern', isHead, isIndigent, setIsIndigent, onUpdateField }) => {
  const accent = surveyAccentMap[currentTheme] || surveyAccentMap.modern;

  const MaterialBlock = ({ icon: Icon, label, value, colorClass }) => (
    <div className={`p-3 ${t.inlineBg} border ${t.cardBorder} rounded-2xl flex flex-col items-center justify-center text-center transition-all ${accent.hoverBorder}`}>
      <Icon size={18} className={`${colorClass} mb-2 opacity-80`} />
      <p className="text-[10px] font-medium text-slate-400 mb-1 font-kumbh">{label}</p>
      <p className={`text-sm font-semibold ${t.cardText} font-kumbh uppercase`}>{value || 'N/A'}</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <h4 className={`text-sm font-semibold ${t.cardText} font-spartan ml-1`}>Household Survey Info</h4>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        
        <MaterialBlock icon={Home} label="Tenure" value={data.tenure_status} colorClass="text-amber-500" />
        <MaterialBlock icon={HardHat} label="Walls" value={data.wall_material} colorClass={accent.primary} />
        <MaterialBlock icon={Warehouse} label="Roof" value={data.roof_material} colorClass="text-slate-500" />

        {/* Editable Families Count */}
        <div className={`p-3 ${t.inlineBg} border ${t.cardBorder} rounded-2xl flex flex-col items-center justify-center text-center transition-all ${accent.hoverBorder}`}>
          <Users size={18} className="text-emerald-500 mb-2 opacity-80" />
          <p className="text-[10px] font-medium text-slate-400 mb-1 font-kumbh">Families</p>
          <input
            type="number"
            min="1"
            className={`w-full text-center bg-transparent focus:outline-none text-sm font-semibold ${t.cardText} font-kumbh border-b border-transparent focus:border-emerald-500`}
            value={data.num_families_reported || 1}
            onChange={(e) => onUpdateField('num_families_reported', e.target.value)}
          />
        </div>

        {/* Classification Toggle */}
        <div 
          onClick={() => isHead && setIsIndigent(isIndigent === 1 ? 0 : 1)}
          className={`p-3 border rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
            isHead ? `hover:shadow-lg active:scale-95 ${accent.hoverBorder}` : 'opacity-60 cursor-not-allowed'
          } ${t.inlineBg} ${t.cardBorder}`}
        >
          <ShieldCheck size={18} className={`${isIndigent === 1 ? 'text-rose-500' : 'text-slate-400'} mb-2`} />
          <p className="text-[10px] font-medium text-slate-400 mb-1 font-kumbh">Classification</p>
          <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black font-kumbh uppercase tracking-tighter ${
            isIndigent === 1 ? 'bg-rose-500 text-white shadow-sm' : accent.primarySoft
          }`}>
            {isIndigent === 1 ? 'Indigent' : 'General'}
          </span>
          {isHead && <p className="text-[7px] mt-1 text-slate-400 font-bold uppercase">Toggle</p>}
        </div>
      </div>
      
      {!isHead && (
        <p className="text-[9px] text-slate-400 italic ml-1 font-kumbh">
          * Classification is inherited from the Head of Family.
        </p>
      )}
    </div>
  );
};

export default HousingSurvey;