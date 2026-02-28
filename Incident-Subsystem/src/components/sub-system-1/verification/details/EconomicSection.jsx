import React from 'react';
import { Briefcase, GraduationCap } from 'lucide-react';
import { InfoFieldWhite } from '../../common/InfoField';

const EconomicSection = ({ details, t }) => (
  <div className={`${t.cardBg} p-8 border ${t.cardBorder} rounded-2xl shadow-sm`}>
    <p className="text-xs font-black text-slate-400 uppercase tracking-[2px] mb-8 border-l-4 border-emerald-500 pl-3">Economic & Education Profile</p>

    <div className="space-y-10">
      <div>
        <p className="text-[10px] font-bold text-emerald-600 uppercase mb-4 tracking-wider flex items-center gap-2">
          <Briefcase size={14} /> Economic Status
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <InfoFieldWhite label="Employment" val={details?.employmentStatus} t={t} />
          <InfoFieldWhite label="Occupation" val={details?.occupation} t={t} />
          <InfoFieldWhite label="Monthly Income" val={details?.monthlyIncome} t={t} />
          <InfoFieldWhite label="Income Source" val={details?.incomeSource} t={t} />
        </div>
      </div>

      <div className={`border-t ${t.cardBorder} pt-8`}>
        <p className="text-[10px] font-bold text-emerald-600 uppercase mb-4 tracking-wider flex items-center gap-2">
          <GraduationCap size={14} /> Educational Background
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <InfoFieldWhite label="Status" val={details?.educationalStatus} t={t} />
          <InfoFieldWhite label="School Type" val={details?.schoolType} t={t} />
          <InfoFieldWhite label="School Level" val={details?.schoolLevel} t={t} />
          <InfoFieldWhite label="Highest Grade" val={details?.highestGrade} t={t} />
        </div>
      </div>
    </div>
  </div>
);

export default EconomicSection;
