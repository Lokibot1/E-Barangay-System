import React, { useMemo } from 'react';
import { Navigation, Calendar, AlertCircle, Clock, Info, MapPin } from 'lucide-react';
import DetailField from './DetailField';

const accentBoxMap = {
    modern: 'bg-blue-50 border-blue-100 text-blue-700',
    blue:   'bg-blue-50 border-blue-100 text-blue-700',
    purple: 'bg-purple-50 border-purple-100 text-purple-700',
    green:  'bg-green-50 border-green-100 text-green-700',
    dark:   'bg-slate-700 border-slate-600 text-slate-200',
};

const FormatHint = ({ msg }) => (
    <p className="mt-1 ml-1 flex items-center gap-1 text-[10px] text-slate-400 font-medium">
        <Info size={9} /> {msg}
    </p>
);

const AddressTab = ({
    isEdit,
    formData,
    handleChange,
    refs,
    getFullHardcodedAddress,
    filteredStreets,
    t,
    currentTheme = 'modern',
    fieldErrors = {},
    // Snapshot taken when the modal opened — used to detect address changes
    // and whether this resident was originally Head.
    // Pass snapRef.current from ResidentDetailsModal.
    originalSnapshot = {},
}) => {
    const accentBox = accentBoxMap[currentTheme] || accentBoxMap.modern;
    const today     = new Date().toISOString().split('T')[0];

    const calculateDuration = (startDate) => {
        if (!startDate) return '---';
        const start = new Date(startDate);
        const now   = new Date();
        if (isNaN(start.getTime())) return 'Invalid Date';
        let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
        if (months < 0)  return 'New Resident';
        if (months < 12) return `${months} ${months <= 1 ? 'mo.' : 'mos.'}`;
        const years = Math.floor(months / 12);
        const rem   = months % 12;
        return `${years} ${years <= 1 ? 'yr.' : 'yrs.'}${rem > 0 ? ` & ${rem} mos.` : ''}`;
    };

    // ── Detect address change from original snapshot ───────────────────────────
    const addressChanged = useMemo(() => {
        if (!isEdit) return false;
        return (
            (formData.temp_house_number ?? '') !== (originalSnapshot.temp_house_number ?? '') ||
            String(formData.temp_purok_id  ?? '') !== String(originalSnapshot.temp_purok_id  ?? '') ||
            String(formData.temp_street_id ?? '') !== String(originalSnapshot.temp_street_id ?? '')
        );
    }, [
        isEdit,
        formData.temp_house_number,
        formData.temp_purok_id,
        formData.temp_street_id,
        originalSnapshot.temp_house_number,
        originalSnapshot.temp_purok_id,
        originalSnapshot.temp_street_id,
    ]);

    const isCurrentlyHead = originalSnapshot.household_position === 'Head of Family';

    const hasHeadConflict = isEdit
        && formData.household_position === 'Head of Family'
        && !!fieldErrors.household_position;

    // Hide "Head of Family" when:
    //   1. Conflict detected at target address, OR
    //   2. Already Head AND address hasn't changed (same household)
    const shouldHideHead = hasHeadConflict || (isCurrentlyHead && !addressChanged);

    const ALL_POSITIONS = refs.household_positions || [
        'Head of Family', 'Spouse', 'Son', 'Daughter', 'Relative', 'Househelp', 'Others',
    ];
    const filteredPositions = shouldHideHead
        ? ALL_POSITIONS.filter(p => p !== 'Head of Family')
        : ALL_POSITIONS;

    // ── Contextual guide message ───────────────────────────────────────────────
    const renderPositionGuide = () => {
        if (!isEdit) return null;

        if (hasHeadConflict) {
            return (
                <div className="flex items-start gap-3 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl animate-in fade-in duration-200">
                    <AlertCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-bold text-rose-700 dark:text-rose-300 leading-snug">
                        {fieldErrors.household_position}
                    </p>
                </div>
            );
        }

        if (isCurrentlyHead && !addressChanged) {
            return (
                <div className="flex items-start gap-2.5 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
                    <Info size={13} className="text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 leading-snug">
                        Currently the Head of this household. Change the address fields to reassign to a different household.
                    </p>
                </div>
            );
        }

        if (addressChanged && formData.household_position === 'Head of Family') {
            return (
                <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <AlertCircle size={13} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 leading-snug">
                        Saving will assign this resident as the Head of Family at the new address.
                    </p>
                </div>
            );
        }

        if (addressChanged && !formData.household_position) {
            return (
                <div className="flex items-start gap-2.5 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl">
                    <Info size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 leading-snug">
                        Address changed. If this person leads the new household, select "Head of Family".
                    </p>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">

            {/* ── SECTION 1: HOUSEHOLD LOCATION & POSITION (merged) ── */}
            <section className={`${t?.cardBg || 'bg-white dark:bg-slate-900'} border ${t?.cardBorder || 'border-slate-200 dark:border-slate-800'} rounded-[2rem] overflow-hidden shadow-sm`}>
                <div className={`${t?.inlineBg || 'bg-slate-50 dark:bg-slate-800/50'} px-8 py-4 border-b ${t?.cardBorder || 'border-slate-200 dark:border-slate-800'} flex items-center gap-3`}>
                    <div className={`p-2 rounded-lg text-white ${t?.primarySolid || 'bg-blue-600'}`}>
                        <MapPin size={18} />
                    </div>
                    <h3 className={`text-sm font-black ${t?.cardText || 'text-slate-800 dark:text-white'} uppercase tracking-widest`}>
                        Household Location &amp; Position
                    </h3>
                </div>

                <div className="p-8 space-y-6 text-left">
                    {isEdit ? (
                        <>
                            {/* Address change notice */}
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 rounded-r-xl flex items-center gap-3">
                                <AlertCircle size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
                                <p className="text-[10px] md:text-xs text-amber-700 dark:text-amber-400 font-bold uppercase tracking-tight">
                                    Notice: Modifying the address may affect household groupings and records.
                                </p>
                            </div>

                            {/* Row 1: House No + Purok */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                                <DetailField
                                    label="House No. / Block & Lot"
                                    name="temp_house_number"
                                    val={formData.temp_house_number}
                                    isEdit
                                    onChange={handleChange}
                                    t={t}
                                    currentTheme={currentTheme}
                                />
                                <DetailField
                                    label="Purok / Zone"
                                    name="temp_purok_id"
                                    val={formData.temp_purok_id}
                                    isEdit
                                    onChange={handleChange}
                                    type="select"
                                    options={refs.puroks}
                                    t={t}
                                    currentTheme={currentTheme}
                                />
                            </div>

                            {/* Row 2: Street + Position */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 items-start">
                                <DetailField
                                    label="Street / Sitio"
                                    name="temp_street_id"
                                    val={formData.temp_street_id}
                                    isEdit
                                    onChange={handleChange}
                                    type="select"
                                    options={filteredStreets}
                                    t={t}
                                    currentTheme={currentTheme}
                                />
                                <div className="space-y-2">
                                    <DetailField
                                        label="Position in Household"
                                        name="household_position"
                                        val={formData.household_position}
                                        isEdit
                                        onChange={handleChange}
                                        type="select"
                                        options={filteredPositions}
                                        error={hasHeadConflict ? fieldErrors.household_position : undefined}
                                        t={t}
                                        currentTheme={currentTheme}
                                    />
                                    {renderPositionGuide()}
                                </div>
                            </div>
                        </>
                    ) : (
                        /* View mode: show address + position side by side */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                            <div className={`md:col-span-1 p-5 ${t?.inlineBg || 'bg-slate-50 dark:bg-slate-800/50'} rounded-2xl border ${t?.cardBorder || 'border-slate-200 dark:border-slate-800'}`}>
                                <DetailField
                                    label="Primary Registered Address"
                                    val={getFullHardcodedAddress()}
                                    isEdit={false}
                                    t={t}
                                    currentTheme={currentTheme}
                                />
                            </div>
                            <div className={`md:col-span-1 p-5 ${t?.inlineBg || 'bg-slate-50 dark:bg-slate-800/50'} rounded-2xl border ${t?.cardBorder || 'border-slate-200 dark:border-slate-800'}`}>
                                <DetailField
                                    label="Position in Household"
                                    val={formData.household_position || '—'}
                                    isEdit={false}
                                    t={t}
                                    currentTheme={currentTheme}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ── SECTION 2: RESIDENCY STATUS ── */}
            <section className={`${t?.cardBg || 'bg-white dark:bg-slate-900'} border ${t?.cardBorder || 'border-slate-200 dark:border-slate-800'} rounded-[2rem] overflow-hidden shadow-sm`}>
                <div className={`${t?.inlineBg || 'bg-slate-50 dark:bg-slate-800/50'} px-8 py-4 border-b ${t?.cardBorder || 'border-slate-200 dark:border-slate-800'} flex items-center gap-3`}>
                    <div className={`p-2 rounded-lg text-white shadow-sm ${t?.primarySolid || 'bg-blue-600'}`}>
                        <Calendar size={20} />
                    </div>
                    <h3 className={`text-sm font-black ${t?.cardText || 'text-slate-800 dark:text-white'} uppercase tracking-widest`}>
                        Residency Status
                    </h3>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 items-start text-left">
                    <div className="space-y-2">
                        <DetailField
                            label="Date of Residency"
                            name="residency_start_date"
                            val={formData.residency_start_date}
                            isEdit={isEdit}
                            onChange={handleChange}
                            type="date"
                            max={today}
                            error={fieldErrors.residency_start_date}
                            t={t}
                            currentTheme={currentTheme}
                        />
                        {isEdit && !fieldErrors.residency_start_date && (
                            <FormatHint msg="Format: DD/MM/YYYY — future dates are not allowed." />
                        )}
                        {!isEdit && formData.residency_start_date && (
                            <div className={`flex items-center gap-3 ml-1 p-3 border rounded-xl animate-in fade-in duration-700 ${accentBox}`}>
                                <div className={`p-1.5 rounded-md text-white ${t?.primarySolid || 'bg-blue-600'}`}>
                                    <Clock size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-tighter leading-none mb-1">Length of Stay</p>
                                    <p className="text-lg font-black leading-none">{calculateDuration(formData.residency_start_date)}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <p className={`text-[11px] font-bold uppercase tracking-widest ${t?.subtleText || 'text-slate-400'} ml-1`}>Information</p>
                        <div className={`flex items-start gap-3 p-4 ${t?.inlineBg || 'bg-slate-50 dark:bg-slate-800/50'} rounded-xl border border-dashed ${t?.cardBorder || 'border-slate-200 dark:border-slate-800'}`}>
                            <AlertCircle size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                            <p className={`text-xs ${t?.cardText || 'text-slate-800 dark:text-white'} font-medium leading-relaxed`}>
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