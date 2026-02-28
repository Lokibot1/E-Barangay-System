import React from 'react';
import { IdCard, UserCheck } from 'lucide-react';
import DetailField from './DetailField';

const IdentityTab = ({ isEdit, formData, handleChange, refs, today, t }) => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">

            {/* SECTION 1: IDENTITY PROFILE */}
            <section className={`${t.cardBg} border ${t.cardBorder} rounded-[2rem] overflow-hidden shadow-sm`}>
                {/* Header with Background Color */}
                <div className={`${t.inlineBg} px-8 py-4 border-b ${t.cardBorder} flex items-center gap-3`}>
                    <div className="p-2 bg-blue-500 rounded-lg text-white">
                        <IdCard size={18} />
                    </div>
                    <div>
                        <h3 className={`text-sm font-black ${t.cardText} uppercase tracking-widest`}>Identity Profile</h3>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                    {isEdit ? (
                        <>
                            <DetailField label="First Name" name="first_name" val={formData.first_name} isEdit={true} onChange={handleChange} t={t} />
                            <DetailField label="Last Name" name="last_name" val={formData.last_name} isEdit={true} onChange={handleChange} t={t} />
                            <DetailField label="Middle Name" name="middle_name" val={formData.middle_name} isEdit={true} onChange={handleChange} t={t} />
                            <DetailField label="Suffix" name="suffix" val={formData.suffix} isEdit={true} onChange={handleChange} t={t} />
                        </>
                    ) : (
                        <div className="col-span-full mb-2">
                            <DetailField label="Registered Full Name" val={formData.name} isEdit={false} t={t} />
                        </div>
                    )}

                    <DetailField label="Birth Date" name="birthdate" val={formData.birthdate} isEdit={isEdit} onChange={handleChange} type="date" max={today} t={t} />
                    <div className="bg-blue-50 p-3 px-5 rounded-xl border border-blue-100">
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Calculated Age</p>
                        <p className="text-lg font-black text-blue-700">{formData.age || '---'} yrs old</p>
                    </div>
                    <DetailField label="Nationality" name="nationality_id" val={formData.nationality_id} isEdit={isEdit} onChange={handleChange} type="select" options={refs.nationalities} t={t} />
                    <DetailField label="Birth Registration" name="birth_registration" val={formData.birth_registration} isEdit={isEdit} onChange={handleChange} type="select" options={refs.birth_registrations} t={t} />
                </div>
            </section>

            {/* SECTION 2: STATUS & AFFILIATIONS */}
            <section className={`${t.cardBg} border ${t.cardBorder} rounded-[2rem] overflow-hidden shadow-sm`}>
                {/* Header with Background Color */}
                <div className={`${t.inlineBg} px-8 py-4 border-b ${t.cardBorder} flex items-center gap-3`}>
                    <div className="p-2 bg-emerald-500 rounded-lg text-white">
                        <UserCheck size={18} />
                    </div>
                    <div>
                        <h3 className={`text-sm font-black ${t.cardText} uppercase tracking-widest`}>Status & Affiliations</h3>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                    <DetailField label="Position in Family" name="household_position" val={formData.household_position} isEdit={isEdit} onChange={handleChange} type="select" options={refs.household_positions} t={t} />
                    <DetailField label="Sex / Gender" name="gender" val={formData.gender} isEdit={isEdit} onChange={handleChange} type="select" options={refs.genders} t={t} />
                    <DetailField label="Civil Status" name="marital_status_id" val={formData.marital_status_id} isEdit={isEdit} onChange={handleChange} type="select" options={refs.marital_statuses} t={t} />
                    <DetailField label="Contact Number" name="contact_number" val={formData.contact_number} isEdit={isEdit} onChange={handleChange} t={t} />
                    <DetailField label="Voter Status" name="is_voter" val={formData.is_voter} isEdit={isEdit} onChange={handleChange} type="select" options={refs.voter_options} t={t} />
                    <DetailField label="Sector / Group" name="sector_id" val={formData.sector_id} isEdit={isEdit} onChange={handleChange} type="select" options={refs.sectors} t={t} />
                </div>
            </section>
        </div>
    );
};

export default IdentityTab;
