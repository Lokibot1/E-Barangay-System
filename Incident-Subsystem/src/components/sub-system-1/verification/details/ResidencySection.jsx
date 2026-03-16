import React from 'react';
import { MapPin, Calendar, Home, Droplets } from 'lucide-react';
import { InfoFieldWhite } from '../../common/InfoField';

const ResidencySection = ({ details, t }) => {
  const position = details?.household_position || details?.householdPosition || '';
  const isHead = position.toLowerCase().includes('head');

  const tenure = details?.household?.tenure_status || details?.tenure_status || details?.tenureStatus;
  const wall = details?.household?.wall_material || details?.wall_material || details?.wallMaterial;
  const roof = details?.household?.roof_material || details?.roof_material || details?.roofMaterial;
  const water = details?.household?.water_source || details?.water_source || details?.waterSource;

  const shouldShowSurvey = isHead || (tenure || wall || roof || water);

  return (
    <div className={`${t.cardBg} p-6 sm:p-7 border ${t.cardBorder} border-t-4 border-t-emerald-500 rounded-[26px] shadow-[0_12px_30px_rgba(15,23,42,0.08)]`}>
      
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-6 border-l-4 border-emerald-500 pl-3">
        <Home size={18} className="text-emerald-500" />
        <p className="text-xs font-semibold text-slate-500">Residency Profile</p>
      </div>

      {/* Address Summary */}
      <div className="mb-8 p-5 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
        <p className="text-[11px] font-semibold text-emerald-600 mb-2 flex items-center gap-2">
          <MapPin size={12} /> Current Address Summary
        </p>
        <p className={`text-lg font-semibold ${t.cardText} leading-tight`}>
          {details?.addressSummary || 'No Address Provided'}
        </p>
      </div>


      <div className={`grid grid-cols-2 md:grid-cols-3 gap-8 ${shouldShowSurvey ? 'mb-10' : ''}`}>
        <InfoFieldWhite label="Residency Status" val={details?.residencyStatus} t={t} />
        <InfoFieldWhite label="Date Started" val={details?.residencyStartDate} icon={<Calendar size={14}/>} t={t} />
        <InfoFieldWhite label="Voter Status" val={details?.isVoter ? "Registered" : "Non-Voter"} t={t} />
      </div>

      {shouldShowSurvey && (
        <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Housing Survey Details {!isHead && "(Household Data)"}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <InfoFieldWhite label="Tenure Status" val={tenure} t={t} />
            <InfoFieldWhite label="Wall Material" val={wall} t={t} />
            <InfoFieldWhite label="Roof Material" val={roof} t={t} />
            <InfoFieldWhite label="Water Source" val={water} icon={<Droplets size={14}/>} t={t} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidencySection;