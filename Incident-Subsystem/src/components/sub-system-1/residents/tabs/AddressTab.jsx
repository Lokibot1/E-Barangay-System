import React from 'react';
import { Navigation, Calendar, AlertCircle, Clock } from 'lucide-react';
import DetailField from './DetailField';

const accentBoxMap = {
    modern: 'bg-blue-50 border-blue-100 text-blue-700',
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    purple: 'bg-purple-50 border-purple-100 text-purple-700',
    green: 'bg-green-50 border-green-100 text-green-700',
    dark: 'bg-slate-700 border-slate-600 text-slate-200',
};

const AddressTab = ({ isEdit, formData, handleChange, refs, getFullHardcodedAddress, filteredStreets, t, currentTheme = 'modern' }) => {
    const accentBox = accentBoxMap[currentTheme] || accentBoxMap.modern;
    
    // Duration Calculation Logic
   const calculateDuration = (startDate) => {
    if (!startDate) return "---"; 

    const start = new Date(startDate);
    const now = new Date();
    
    // Check kung valid date ang nakuha
    if (isNaN(start.getTime())) return "Invalid Date";

    let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    
    if (months < 0) return "New Resident";
    if (months < 12) return `${months} ${months <= 1 ? 'mo.' : 'mos.'}`;
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    return `${years} ${years <= 1 ? 'yr.' : 'yrs.'}${remainingMonths > 0 ? ` & ${remainingMonths} mos.` : ''}`;
};
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">

            {/* SECTION 1: GEOGRAPHIC LOCATION */}
            <section className={`${t.cardBg} border ${t.cardBorder} rounded-[2rem] overflow-hidden shadow-sm`}>
                <div className={`${t.inlineBg} px-8 py-4 border-b ${t.cardBorder} flex items-center gap-3`}>
                    <div className={`p-2 rounded-lg text-white ${t.primarySolid}`}>
                        <Navigation size={18} />
                    </div>
                    <h3 className={`text-sm font-black ${t.cardText} uppercase tracking-widest`}>Geographic Location</h3>
                </div>

                <div className="p-8 space-y-6 text-left">
                    {isEdit ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 items-start">
                            <div className="col-span-full p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 rounded-r-xl flex items-center gap-3 mb-2 text-left">
                                <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                                <p className="text-[10px] md:text-xs text-amber-700 dark:text-amber-400 font-bold uppercase tracking-tight">
                                    Notice: Modifying the address may affect household groupings and records.
                                </p>
                            </div>
                            <DetailField label="House No. / Block & Lot" name="temp_house_number" val={formData.temp_house_number} isEdit={true} onChange={handleChange} t={t} currentTheme={currentTheme} />
                            <DetailField label="Purok / Zone" name="temp_purok_id" val={formData.temp_purok_id} isEdit={true} onChange={handleChange} type="select" options={refs.puroks} t={t} currentTheme={currentTheme} />
                            <DetailField label="Street / Sitio" name="temp_street_id" val={formData.temp_street_id} isEdit={true} onChange={handleChange} type="select" options={filteredStreets} t={t} currentTheme={currentTheme} />
                        </div>
                    ) : (
                        <div className={`p-6 ${t.inlineBg} rounded-2xl border ${t.cardBorder} text-left`}>
                            <DetailField label="Primary Registered Address" val={getFullHardcodedAddress()} isEdit={false} t={t} currentTheme={currentTheme} />
                        </div>
                    )}
                </div>
            </section>

           {/* SECTION 2: RESIDENCY STATUS */}
<section className={`${t.cardBg} border ${t.cardBorder} rounded-[2rem] overflow-hidden shadow-sm`}>
    <div className={`${t.inlineBg} px-8 py-4 border-b ${t.cardBorder} flex items-center gap-3`}>
        <div className={`p-2 rounded-lg text-white shadow-sm ${t.primarySolid}`}>
            <Calendar size={20} />
        </div>
        <h3 className={`text-sm font-black ${t.cardText} uppercase tracking-widest`}>Residency Status</h3>
    </div>

    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 items-start text-left">
        
        {/* LEFT COLUMN: DATE & DURATION */}
        <div className="space-y-5">
            <DetailField 
                label="Date of Residency" 
                name="residency_start_date" 
                val={formData.residency_start_date} 
                isEdit={isEdit} 
                onChange={handleChange} 
                type="date" 
                t={t}
                currentTheme={currentTheme} 
            />
            
            {!isEdit && formData.residency_start_date && (
                <div className={`flex items-center gap-3 ml-1 p-3 border rounded-xl animate-in fade-in duration-700 ${accentBox}`}>
                    <div className={`p-1.5 rounded-md text-white ${t.primarySolid}`}>
                        <Clock size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-tighter leading-none mb-1">
                            Length of Stay
                        </p>
                        <p className="text-lg font-black leading-none">
                            {calculateDuration(formData.residency_start_date)}
                        </p>
                    </div>
                </div>
            )}
        </div>
        
        {/* RIGHT COLUMN: GUIDELINES (Clearer for Seniors) */}
        <div className="flex flex-col gap-2">
            <p className={`text-[11px] font-bold uppercase tracking-widest ${t.subtleText} ml-1`}>
                Information
            </p>
            <div className={`flex items-start gap-3 p-4 ${t.inlineBg} rounded-xl border border-dashed ${t.cardBorder}`}>
                <AlertCircle size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <p className={`text-xs ${t.cardText} font-medium leading-relaxed`}>
                    This date is used to automatically compute the duration of stay for Barangay services and other purposes.
                </p>
            </div>
        </div>

    </div>
</section>
        </div>
    );
};

export default AddressTab;
