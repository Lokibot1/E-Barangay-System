import React, { useState, useMemo } from 'react';
import { IdCard, UserCheck, Copy, Check } from 'lucide-react';
import DetailField from './DetailField';

const accentBoxMap = {
    modern: 'bg-blue-50 border-blue-100 text-blue-700',
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    purple: 'bg-purple-50 border-purple-100 text-purple-700',
    green: 'bg-green-50 border-green-100 text-green-700',
    dark: 'bg-slate-700 border-slate-600 text-slate-200',
};

const IdentityTab = ({ isEdit, formData, handleChange, refs, today, t, currentTheme = 'modern' }) => {
    const accentBox = accentBoxMap[currentTheme] || accentBoxMap.modern;
    const [emailError, setEmailError] = useState('');
    const [copiedField, setCopiedField] = useState(null);

    // --- LOGIC: Performance optimized Name Calculation ---
    const registeredFullName = useMemo(() => {
        if (formData.name) return formData.name;
        const parts = [formData.first_name, formData.middle_name, formData.last_name, formData.suffix].filter(Boolean);
        return parts.join(' ') || '---';
    }, [formData.first_name, formData.middle_name, formData.last_name, formData.suffix, formData.name]);

    // --- LOGIC: Staff Utility - Copy to Clipboard ---
    const copyToClipboard = (text, fieldName) => {
        if (!text || text === '---' || !text) return;
        if (!navigator?.clipboard?.writeText) return;
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handlePhoneChange = (e) => {
        const numbers = e.target.value.replace(/\D/g, '');
        let formatted = numbers;
        if (numbers.length > 4 && numbers.length <= 7) {
            formatted = `${numbers.slice(0, 4)} ${numbers.slice(4)}`;
        } else if (numbers.length > 7) {
            formatted = `${numbers.slice(0, 4)} ${numbers.slice(4, 7)} ${numbers.slice(7, 11)}`;
        }
        handleChange({ target: { name: 'contact_number', value: formatted } });
    };

    const handleEmailChange = (e) => {
        const { value } = e.target;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setEmailError(value && !emailRegex.test(value) ? 'Invalid email format' : '');
        handleChange(e);
    };

    /**
     * Staff Action Wrapper
     * Enhanced visibility for Copying data
     */
    const StaffActionContainer = ({ children, text, name }) => {
        if (isEdit) return children;
        const isCopied = copiedField === name;

        return (
            <div className="group relative flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/40 p-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-all">
                <div className="flex-1">{children}</div>
                
                <button 
                    onClick={() => copyToClipboard(text, name)}
                    title="Click to copy to clipboard"
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 ${
                        isCopied 
                        ? 'bg-emerald-500 text-white shadow-md' 
                        : 'bg-white dark:bg-slate-700 text-slate-500 hover:bg-blue-600 hover:text-white shadow-sm border border-slate-200 dark:border-slate-600'
                    }`}
                >
                    {isCopied ? (
                        <><Check size={12} strokeWidth={3} /><span className="text-[10px] font-black uppercase">Copied</span></>
                    ) : (
                        <><Copy size={12} strokeWidth={2.5} /><span className="text-[10px] font-black uppercase hidden group-hover:inline">Copy</span></>
                    )}
                </button>
            </div>
        );
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 text-left">
            {/* SECTION 1: IDENTITY PROFILE */}
            <section className={`${t?.cardBg || 'bg-white dark:bg-slate-900'} border ${t?.cardBorder || 'border-slate-200 dark:border-slate-800'} rounded-[2rem] overflow-hidden shadow-sm`}>
                <div className={`${t?.inlineBg || 'bg-slate-50 dark:bg-slate-800/50'} px-8 py-4 border-b ${t?.cardBorder || 'border-slate-200 dark:border-slate-800'} flex items-center gap-3`}>
                    <div className={`p-2 rounded-lg text-white ${t?.primarySolid || 'bg-blue-600'}`}>
                        <IdCard size={18} />
                    </div>
                    <h3 className={`text-sm font-black ${t?.cardText || 'text-slate-800 dark:text-white'} uppercase tracking-widest`}>Identity Profile</h3>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                    {isEdit ? (
                        <>
                            <DetailField label="First Name" name="first_name" val={formData.first_name} isEdit={true} onChange={handleChange} t={t} currentTheme={currentTheme} />
                            <DetailField label="Last Name" name="last_name" val={formData.last_name} isEdit={true} onChange={handleChange} t={t} currentTheme={currentTheme} />
                            <DetailField label="Middle Name" name="middle_name" val={formData.middle_name} isEdit={true} onChange={handleChange} t={t} currentTheme={currentTheme} />
                            <DetailField label="Suffix" name="suffix" val={formData.suffix} isEdit={true} onChange={handleChange} t={t} currentTheme={currentTheme} />
                            <DetailField label="Email Address" name="email" val={formData.email} isEdit={true} onChange={handleEmailChange} type="email" error={emailError} placeholder="example@mail.com" t={t} currentTheme={currentTheme} />
                            <div className="hidden md:block" />
                        </>
                    ) : (
                        <>
                            <StaffActionContainer text={registeredFullName} name="fullname">
                                <DetailField label="Registered Full Name" val={registeredFullName} isEdit={false} t={t} currentTheme={currentTheme} />
                            </StaffActionContainer>
                            <StaffActionContainer text={formData.email} name="email">
                                <DetailField label="Email Address" val={formData.email || '---'} isEdit={false} t={t} currentTheme={currentTheme} />
                            </StaffActionContainer>
                        </>
                    )}

                    <DetailField label="Birth Date" name="birthdate" val={formData.birthdate} isEdit={isEdit} onChange={handleChange} type="date" max={today} t={t} currentTheme={currentTheme} />
                    
                    <div className="flex flex-col gap-1.5">
                        <p className={`text-[11px] font-bold ${t?.subtleText || 'text-slate-400 dark:text-slate-500'} uppercase tracking-widest ml-1`}>
                            Calculated Age
                        </p>
                        <div className={`h-[45px] flex items-center px-5 rounded-xl border ${accentBox}`}>
                            <p className="text-sm font-black uppercase">
                                {formData.age || '---'} <span className="ml-1 text-[10px] opacity-70">Years Old</span>
                            </p>
                        </div>
                    </div>

                    <DetailField label="Nationality" name="nationality_id" val={formData.nationality_id} isEdit={isEdit} onChange={handleChange} type="select" options={refs.nationalities} t={t} currentTheme={currentTheme} />
                    <DetailField label="Birth Registration" name="birth_registration" val={formData.birth_registration} isEdit={isEdit} onChange={handleChange} type="select" options={refs.birth_registrations} t={t} currentTheme={currentTheme} />
                </div>
            </section>

            {/* SECTION 2: STATUS & AFFILIATIONS */}
            <section className={`${t?.cardBg || 'bg-white dark:bg-slate-900'} border ${t?.cardBorder || 'border-slate-200 dark:border-slate-800'} rounded-[2rem] overflow-hidden shadow-sm`}>
                <div className={`${t?.inlineBg || 'bg-slate-50 dark:bg-slate-800/50'} px-8 py-4 border-b ${t?.cardBorder || 'border-slate-200 dark:border-slate-800'} flex items-center gap-3`}>
                    <div className={`p-2 rounded-lg text-white ${t?.primarySolid || 'bg-blue-600'}`}>
                        <UserCheck size={18} />
                    </div>
                    <h3 className={`text-sm font-black ${t?.cardText || 'text-slate-800 dark:text-white'} uppercase tracking-widest`}>Status & Affiliations</h3>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 text-left">
                    <DetailField label="Position in Family" name="household_position" val={formData.household_position} isEdit={isEdit} onChange={handleChange} type="select" options={refs.household_positions} t={t} currentTheme={currentTheme} />
                    <DetailField label="Sex / Gender" name="gender" val={formData.gender} isEdit={isEdit} onChange={handleChange} type="select" options={refs.genders} t={t} currentTheme={currentTheme} />
                    <DetailField label="Civil Status" name="marital_status_id" val={formData.marital_status_id} isEdit={isEdit} onChange={handleChange} type="select" options={refs.marital_statuses} t={t} currentTheme={currentTheme} />
                    <StaffActionContainer text={formData.contact_number} name="contact">
                        <DetailField label="Contact Number" name="contact_number" val={formData.contact_number} isEdit={isEdit} onChange={handlePhoneChange} placeholder="09XX XXX XXXX" t={t} currentTheme={currentTheme} />
                    </StaffActionContainer>
                    <DetailField label="Voter Status" name="is_voter" val={formData.is_voter} isEdit={isEdit} onChange={handleChange} type="select" options={refs.voter_options} t={t} currentTheme={currentTheme} />
                    <DetailField label="Sector / Group" name="sector_id" val={formData.sector_id} isEdit={isEdit} onChange={handleChange} type="select" options={refs.sectors} t={t} currentTheme={currentTheme} />
                </div>
            </section>
        </div>
    );
};

export default IdentityTab;
