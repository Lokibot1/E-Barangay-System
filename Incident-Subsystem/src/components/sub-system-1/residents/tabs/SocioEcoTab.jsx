import React from 'react';
import { Briefcase, GraduationCap } from 'lucide-react';
import DetailField from './DetailField';

const SocioEcoTab = ({ isEdit, formData, handleChange, refs, t, currentTheme = 'modern' }) => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            
            {/* SECTION 1: EMPLOYMENT & INCOME */}
            <section className={`${t.cardBg} border ${t.cardBorder} rounded-[2rem] overflow-hidden shadow-sm`}>
                <div className={`${t.inlineBg} px-8 py-4 border-b ${t.cardBorder} flex items-center gap-3`}>
                    <div className={`p-2 rounded-lg text-white ${t.primarySolid}`}>
                        <Briefcase size={18} />
                    </div>
                    <div>
                        <h3 className={`text-sm font-black ${t.cardText} uppercase tracking-widest`}>Employment & Income</h3>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 items-start text-left">
                    <DetailField label="Employment Status" name="employment_status" val={formData.employment_status} isEdit={isEdit} onChange={handleChange} type="select" options={refs.employment_statuses} t={t} currentTheme={currentTheme} />
                    <DetailField label="Current Occupation" name="occupation" val={formData.occupation} isEdit={isEdit} onChange={handleChange} t={t} currentTheme={currentTheme} />
                    <DetailField label="Primary Income Source" name="income_source" val={formData.income_source} isEdit={isEdit} onChange={handleChange} type="select" options={refs.income_sources} t={t} currentTheme={currentTheme} />
                    <DetailField label="Estimated Monthly Income" name="monthly_income" val={formData.monthly_income} isEdit={isEdit} onChange={handleChange} type="select" options={refs.monthly_income} t={t} currentTheme={currentTheme} />
                </div>
            </section>

            {/* SECTION 2: EDUCATIONAL ATTAINMENT */}
            <section className={`${t.cardBg} border ${t.cardBorder} rounded-[2rem] overflow-hidden shadow-sm`}>
                <div className={`${t.inlineBg} px-8 py-4 border-b ${t.cardBorder} flex items-center gap-3`}>
                    <div className="p-2 bg-amber-500 rounded-lg text-white">
                        <GraduationCap size={18} />
                    </div>
                    <div>
                        <h3 className={`text-sm font-black ${t.cardText} uppercase tracking-widest`}>Educational Attainment</h3>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 items-start text-left">
                    <DetailField label="Current Enrollment Status" name="educational_status" val={formData.educational_status} isEdit={isEdit} onChange={handleChange} type="select" options={refs.educational_statuses} t={t} currentTheme={currentTheme} />
                    <DetailField label="Highest Educational Level" name="highest_attainment" val={formData.highest_attainment} isEdit={isEdit} onChange={handleChange} type="select" options={refs.attainment_options} t={t} currentTheme={currentTheme} />
                    <DetailField label="Current School Grade" name="school_level" val={formData.school_level} isEdit={isEdit} onChange={handleChange} type="select" options={refs.school_levels} t={t} currentTheme={currentTheme} />
                    <DetailField label="Institution Type" name="school_type" val={formData.school_type} isEdit={isEdit} onChange={handleChange} type="select" options={refs.school_types} t={t} currentTheme={currentTheme} />
                </div>
            </section>
        </div>
    );
};

export default SocioEcoTab;
