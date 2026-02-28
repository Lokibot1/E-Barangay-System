import React from 'react';
import { Navigation, Calendar } from 'lucide-react';
import DetailField from './DetailField';

const AddressTab = ({ isEdit, formData, handleChange, refs, getFullHardcodedAddress, filteredStreets, t }) => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">

            {/* SECTION 1: GEOGRAPHIC LOCATION */}
            <section className={`${t.cardBg} border ${t.cardBorder} rounded-[2rem] overflow-hidden shadow-sm`}>
                <div className={`${t.inlineBg} px-8 py-4 border-b ${t.cardBorder} flex items-center gap-3`}>
                    <div className="p-2 bg-blue-600 rounded-lg text-white">
                        <Navigation size={18} />
                    </div>
                    <div>
                        <h3 className={`text-sm font-black ${t.cardText} uppercase tracking-widest`}>Geographic Location</h3>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    {isEdit ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                            <div className="col-span-full p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-xl">
                                <p className="text-xs text-amber-700 font-bold uppercase tracking-tight">
                                    Notice: Modifying the address may affect household groupings and records.
                                </p>
                            </div>
                            <DetailField label="House No. / Block & Lot" name="temp_house_number" val={formData.temp_house_number} isEdit={true} onChange={handleChange} t={t} />
                            <DetailField label="Purok / Zone" name="temp_purok_id" val={formData.temp_purok_id} isEdit={true} onChange={handleChange} type="select" options={refs.puroks} t={t} />
                            <DetailField label="Street / Sitio" name="temp_street_id" val={formData.temp_street_id} isEdit={true} onChange={handleChange} type="select" options={filteredStreets} t={t} />
                        </div>
                    ) : (
                        <div className={`p-6 ${t.inlineBg} rounded-2xl border ${t.cardBorder}`}>
                            <DetailField label="Primary Registered Address" val={getFullHardcodedAddress()} isEdit={false} t={t} />
                        </div>
                    )}
                </div>
            </section>

            {/* SECTION 2: RESIDENCY STATUS */}
            <section className={`${t.cardBg} border ${t.cardBorder} rounded-[2rem] overflow-hidden shadow-sm`}>
                <div className={`${t.inlineBg} px-8 py-4 border-b ${t.cardBorder} flex items-center gap-3`}>
                    <div className="p-2 bg-emerald-600 rounded-lg text-white">
                        <Calendar size={18} />
                    </div>
                    <div>
                        <h3 className={`text-sm font-black ${t.cardText} uppercase tracking-widest`}>Residency Status</h3>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                    <DetailField label="Date of Residency" name="residency_start_date" val={formData.residency_start_date} isEdit={isEdit} onChange={handleChange} type="date" t={t} />
                    <div className={`flex items-center p-4 ${t.inlineBg} rounded-xl border border-dashed ${t.cardBorder}`}>
                        <p className={`text-[11px] ${t.subtleText} font-medium italic leading-relaxed`}>
                            This date is used to calculate the duration of stay for Barangay clearance and certificate purposes.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AddressTab;
