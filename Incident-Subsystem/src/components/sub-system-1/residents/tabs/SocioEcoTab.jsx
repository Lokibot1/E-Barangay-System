import React from 'react';
import { Briefcase, GraduationCap } from 'lucide-react';
import DetailField from './DetailField';

const SocioEcoTab = ({ isEdit, formData, handleChange, refs }) => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            
            {/* SECTION 1: EMPLOYMENT & INCOME */}
            <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
                <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <div className="p-2 bg-violet-600 rounded-lg text-white">
                        <Briefcase size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">Employment & Income</h3>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                    <DetailField label="Employment Status" name="employment_status" val={formData.employment_status} isEdit={isEdit} onChange={handleChange} type="select" options={refs.employment_statuses} />
                    <DetailField label="Current Occupation" name="occupation" val={formData.occupation} isEdit={isEdit} onChange={handleChange} />
                    <DetailField label="Primary Income Source" name="income_source" val={formData.income_source} isEdit={isEdit} onChange={handleChange} type="select" options={refs.income_sources} />
                    <DetailField label="Estimated Monthly Income" name="monthly_income" val={formData.monthly_income} isEdit={isEdit} onChange={handleChange} type="select" options={refs.monthly_income} />
                </div>
            </section>

            {/* SECTION 2: EDUCATIONAL ATTAINMENT */}
            <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
                <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <div className="p-2 bg-amber-500 rounded-lg text-white">
                        <GraduationCap size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">Educational Attainment</h3>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                    <DetailField label="Current Enrollment Status" name="educational_status" val={formData.educational_status} isEdit={isEdit} onChange={handleChange} type="select" options={refs.educational_statuses} />
                    <DetailField label="Highest Educational Level" name="highest_attainment" val={formData.highest_attainment} isEdit={isEdit} onChange={handleChange} type="select" options={refs.attainment_options} />
                    <DetailField label="Current School Grade" name="school_level" val={formData.school_level} isEdit={isEdit} onChange={handleChange} type="select" options={refs.school_levels} />
                    <DetailField label="Institution Type" name="school_type" val={formData.school_type} isEdit={isEdit} onChange={handleChange} type="select" options={refs.school_types} />
                </div>
            </section>
        </div>
    );
};

export default SocioEcoTab;