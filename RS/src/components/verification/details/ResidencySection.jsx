import React from 'react';
import { MapPin, Calendar, Home, Droplets } from 'lucide-react';
import { InfoFieldWhite } from '@/components/common/InfoField';

const ResidencySection = ({ details }) => (
  <div className="bg-white dark:bg-slate-900 p-8 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
    <p className="text-xs font-black text-slate-400 uppercase tracking-[2px] mb-6 border-l-4 border-emerald-500 pl-3">
      Residency & Housing Information
    </p>

    {/* Address Summary */}
    <div className="mb-8 p-5 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
      <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        <MapPin size={12} /> Address Summary
      </p>
      <p className="text-lg font-bold text-slate-800 dark:text-white leading-tight uppercase">
        {details?.addressSummary}
      </p>
    </div>

    {/* Basic Residency Info */}
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
      <InfoFieldWhite label="Residency Status" val={details?.residencyStatus} />
      <InfoFieldWhite label="Date Started" val={details?.residencyStartDate} icon={<Calendar size={14}/>} />
      <InfoFieldWhite label="Voter Status" val={details?.isVoter ? "Yes (Registered)" : "No"} />
    </div>

    {/* New Housing Details from registration_payload */}
    <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
      <p className="text-[10px] font-bold text-emerald-600 uppercase mb-4 tracking-wider flex items-center gap-2">
        <Home size={14} /> Housing & Utilities
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <InfoFieldWhite label="Tenure Status" val={details?.tenureStatus} />
        <InfoFieldWhite label="Wall Material" val={details?.wallMaterial} />
        <InfoFieldWhite label="Roof Material" val={details?.roofMaterial} />
        <InfoFieldWhite label="Water Source" val={details?.waterSource} icon={<Droplets size={14}/>} />
      </div>
    </div>
  </div>
);

export default ResidencySection;