import React from 'react';
import { MapPin, Calendar, Home, Droplets } from 'lucide-react';
import { InfoFieldWhite } from '../../common/InfoField';

const ResidencySection = ({ details, t }) => (
  <div className={`${t.cardBg} p-8 border ${t.cardBorder} border-t-4 border-t-emerald-500 rounded-2xl shadow-sm`}>
    <div className="flex items-center gap-2 mb-6 border-l-4 border-emerald-500 pl-3">
      <Home size={18} className="text-emerald-500" />
      <p className="text-xs font-black text-slate-400 uppercase tracking-[2px]">Residency & Housing</p>
    </div>

    <div className="mb-8 p-5 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
      <p className="text-[10px] font-black text-emerald-600 uppercase mb-2 flex items-center gap-2">
        <MapPin size={12} /> Current Address Summary
      </p>
      <p className={`text-lg font-bold ${t.cardText} leading-tight uppercase`}>
        {details?.addressSummary || 'No Address Provided'}
      </p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-10">
      <InfoFieldWhite label="Residency Status" val={details?.residencyStatus} t={t} />
      <InfoFieldWhite label="Date Started" val={details?.residencyStartDate} icon={<Calendar size={14}/>} t={t} />
      <InfoFieldWhite label="Voter Status" val={details?.isVoter ? "Registered" : "Non-Voter"} t={t} />
    </div>

    <div className="pt-8 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-6">
      <InfoFieldWhite label="Tenure Status" val={details?.tenureStatus} t={t} />
      <InfoFieldWhite label="Wall Material" val={details?.wallMaterial} t={t} />
      <InfoFieldWhite label="Roof Material" val={details?.roofMaterial} t={t} />
      <InfoFieldWhite label="Water Source" val={details?.waterSource} icon={<Droplets size={14}/>} t={t} />
    </div>
  </div>
);

export default ResidencySection;