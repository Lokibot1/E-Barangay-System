import React from 'react';
import { Navigation, Calendar } from 'lucide-react';
import DetailField from './DetailField';

const AddressTab = ({ isEdit, formData, handleChange, refs, getFullHardcodedAddress, filteredStreets }) => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            
            {/* SECTION 1: GEOGRAPHIC LOCATION */}
            <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
                <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg text-white">
                        <Navigation size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">Geographic Location</h3>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    {isEdit ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                            <div className="col-span-full p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 rounded-r-xl">
                                <p className="text-xs text-amber-700 dark:text-amber-400 font-bold uppercase tracking-tight">
                                    Notice: Modifying the address may affect household groupings and records.
                                </p>
                            </div>
                            <DetailField label="House No. / Block & Lot" name="temp_house_number" val={formData.temp_house_number} isEdit={true} onChange={handleChange} />
                            <DetailField label="Purok / Zone" name="temp_purok_id" val={formData.temp_purok_id} isEdit={true} onChange={handleChange} type="select" options={refs.puroks} />
                            <DetailField label="Street / Sitio" name="temp_street_id" val={formData.temp_street_id} isEdit={true} onChange={handleChange} type="select" options={filteredStreets} />
                        </div>
                    ) : (
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <DetailField label="Primary Registered Address" val={getFullHardcodedAddress()} isEdit={false} />
                        </div>
                    )}
                </div>
            </section>

            {/* SECTION 2: RESIDENCY STATUS */}
            <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
                <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <div className="p-2 bg-emerald-600 rounded-lg text-white">
                        <Calendar size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">Residency Status</h3>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                    <DetailField label="Date of Residency" name="residency_start_date" val={formData.residency_start_date} isEdit={isEdit} onChange={handleChange} type="date" />
                    <div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                        <p className="text-[11px] text-slate-500 font-medium italic leading-relaxed">
                            This date is used to calculate the duration of stay for Barangay clearance and certificate purposes.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AddressTab;