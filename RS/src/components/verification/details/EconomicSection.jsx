import React from 'react';
import { Briefcase, GraduationCap } from 'lucide-react';
import { InfoFieldWhite } from '@/components/common/InfoField';

const EconomicSection = ({ details }) => (
  <div className="bg-white dark:bg-slate-900 p-8 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
    <p className="text-xs font-black text-slate-400 uppercase tracking-[2px] mb-8 border-l-4 border-emerald-500 pl-3">Economic & Education Profile</p>
    
    <div className="space-y-10">
      <div>
        <p className="text-[10px] font-bold text-emerald-600 uppercase mb-4 tracking-wider flex items-center gap-2">
          <Briefcase size={14} /> Economic Status
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <InfoFieldWhite label="Employment" val={details?.employmentStatus} />
          <InfoFieldWhite label="Occupation" val={details?.occupation} />
          <InfoFieldWhite label="Monthly Income" val={details?.monthlyIncome} />
          <InfoFieldWhite label="Income Source" val={details?.incomeSource} />
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
        <p className="text-[10px] font-bold text-emerald-600 uppercase mb-4 tracking-wider flex items-center gap-2">
          <GraduationCap size={14} /> Educational Background
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <InfoFieldWhite label="Status" val={details?.educationalStatus} />
          <InfoFieldWhite label="School Type" val={details?.schoolType} />
          <InfoFieldWhite label="School Level" val={details?.schoolLevel} />
          <InfoFieldWhite label="Highest Grade" val={details?.highestGrade} />
        </div>
      </div>
    </div>
  </div>
);

export default EconomicSection;