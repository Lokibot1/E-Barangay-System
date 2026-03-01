import React from 'react';
import { Briefcase, GraduationCap } from 'lucide-react';
import { InfoFieldWhite } from '../../common/InfoField';

const EconomicSection = ({ details, t }) => (
  <div className={`${t.cardBg} p-8 border ${t.cardBorder} border-t-4 border-t-amber-500 rounded-2xl shadow-sm`}>
    <div className="flex items-center gap-2 mb-8 border-l-4 border-amber-500 pl-3">
      <Briefcase size={18} className="text-amber-500" />
      <p className="text-xs font-black text-slate-400 uppercase tracking-[2px]">Economic & Education</p>
    </div>

    <div className="space-y-12">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        <InfoFieldWhite label="Employment" val={details?.employmentStatus} t={t} />
        <InfoFieldWhite label="Occupation" val={details?.occupation} t={t} />
        <InfoFieldWhite label="Monthly Income" val={details?.monthlyIncome} t={t} />
        <InfoFieldWhite label="Income Source" val={details?.incomeSource} t={t} />
      </div>

      <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
        <p className="text-[10px] font-bold text-emerald-600 uppercase mb-6 tracking-widest flex items-center gap-2">
          <GraduationCap size={16} /> Educational Background
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <InfoFieldWhite label="Status" val={details?.educationalStatus} t={t} />
          <InfoFieldWhite label="School Type" val={details?.schoolType} t={t} />
          <InfoFieldWhite label="Level" val={details?.schoolLevel} t={t} />
          <InfoFieldWhite label="Highest Grade" val={details?.highestGrade} t={t} />
        </div>
      </div>
    </div>
  </div>
);

export default EconomicSection;