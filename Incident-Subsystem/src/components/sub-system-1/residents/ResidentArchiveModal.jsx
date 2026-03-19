import React, { useState } from 'react';
import {
    User, MapPin, Calendar, Phone, Mail,
    Archive, RotateCcw, X, Loader2,
    IdCard, UserCheck, Briefcase, AlertCircle
} from 'lucide-react';

// ── Tiny read-only field ──────────────────────────────────────────────────────
const InfoField = ({ label, value, t }) => (
    <div className="flex flex-col gap-1">
        <p className={`text-[10px] font-bold uppercase tracking-widest ${t?.subtleText || 'text-slate-400'}`}>{label}</p>
        <p className={`text-sm font-semibold ${t?.cardText || 'text-slate-800 dark:text-white'} leading-tight`}>
            {value || '—'}
        </p>
    </div>
);

// ── Section wrapper ───────────────────────────────────────────────────────────
const Section = ({ icon: Icon, title, children, t }) => (
    <div className={`${t?.cardBg || 'bg-white dark:bg-slate-900'} border ${t?.cardBorder || 'border-slate-200 dark:border-slate-800'} rounded-2xl overflow-hidden`}>
        <div className={`${t?.inlineBg || 'bg-slate-50 dark:bg-slate-800/50'} px-6 py-3.5 border-b ${t?.cardBorder || 'border-slate-200 dark:border-slate-800'} flex items-center gap-2.5`}>
            <div className={`p-1.5 rounded-lg text-white ${t?.primarySolid || 'bg-blue-600'}`}>
                <Icon size={15} />
            </div>
            <h4 className={`text-[11px] font-black ${t?.cardText || 'text-slate-800'} uppercase tracking-widest`}>{title}</h4>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5">
            {children}
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const ResidentArchiveModal = ({
    isOpen,
    onClose,
    resident,       // the archived resident object
    onRestore,      // async (id) => bool
    currentTheme = 'modern',
    t,
}) => {
    const [restoring, setRestoring] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false); // State for confirmation overlay

    if (!isOpen || !resident) return null;

    const isDark = currentTheme === 'dark';

    const archivedAt = resident.deleted_at
        ? new Date(resident.deleted_at).toLocaleDateString('en-PH', {
            year: 'numeric', month: 'long', day: 'numeric',
          })
        : 'Unknown date';

    const handleRestore = async () => {
        setRestoring(true);
        try {
            await onRestore(resident.id);
            setShowConfirm(false);
            onClose();
        } catch (error) {
            console.error("Restore failed:", error);
        } finally {
            setRestoring(false);
        }
    };

    const voterDisplay = (resident.is_voter == 1 || resident.is_voter === true || resident.is_voter === 'Yes')
        ? 'Yes' : 'No';

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <div className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-[28px] border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${
                isDark
                    ? 'bg-slate-900 border-slate-700 text-white'
                    : 'bg-white border-slate-200 text-slate-900'
            }`}>

                {/* ── Confirmation Overlay ── */}
                {showConfirm && (
                    <div className="absolute inset-0 z-[500] flex items-center justify-center bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
                        <div className={`p-8 rounded-[2.5rem] max-w-sm w-[90%] text-center shadow-2xl scale-in-center ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}>
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
                                <RotateCcw className="text-emerald-600 dark:text-emerald-400" size={28} />
                            </div>
                            <h3 className={`text-lg font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Confirm Restore</h3>
                            <p className="text-sm text-slate-500 mt-2 mb-8 leading-relaxed font-medium">
                                Are you sure you want to move <span className="font-bold text-slate-900 dark:text-slate-100">{resident.name}</span> back to the active records?
                            </p>
                            <div className="flex flex-col gap-2">
                                <button 
                                    onClick={handleRestore} 
                                    disabled={restoring}
                                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {restoring ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Yes, Restore Record'}
                                </button>
                                <button 
                                    onClick={() => setShowConfirm(false)}
                                    disabled={restoring}
                                    className={`w-full py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Go Back
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Header ── */}
                <div className={`flex items-center justify-between px-7 py-5 border-b ${t?.cardBorder || 'border-slate-200 dark:border-slate-800'} ${isDark ? 'bg-slate-800/60' : 'bg-slate-50'} shrink-0`}>
                    <div className="flex items-center gap-4">
                        <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                            <User size={22} className={t?.subtleText || 'text-slate-400'} />
                        </div>
                        <div>
                            <h2 className={`text-sm font-black ${t?.cardText || 'text-slate-800 dark:text-white'} uppercase tracking-tight leading-none`}>
                                {resident.name || 'Unknown Resident'}
                            </h2>
                            <p className={`text-[10px] font-mono ${t?.subtleText || 'text-slate-400'} mt-1 uppercase tracking-wider`}>
                                #{resident.barangay_id || resident.id}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black uppercase tracking-wider">
                            <Archive size={11} /> Archived
                        </span>
                        <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                            <X size={18} className={t?.subtleText || 'text-slate-400'} />
                        </button>
                    </div>
                </div>

                {/* ── Archive info banner ── */}
                <div className={`shrink-0 px-7 py-3 flex items-center gap-3 border-b ${t?.cardBorder || 'border-slate-200 dark:border-slate-800'} ${isDark ? 'bg-amber-950/20' : 'bg-amber-50'}`}>
                    <Calendar size={14} className="text-amber-600 shrink-0" />
                    <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                        Archived on <span className="font-black">{archivedAt}</span>
                        {resident.updated_by?.name && (
                            <> by <span className="font-black">{resident.updated_by.name}</span></>
                        )}
                    </p>
                </div>

                {/* ── Scrollable body ── */}
                <div className={`flex-1 overflow-y-auto p-6 space-y-4 ${isDark ? 'bg-slate-900' : 'bg-slate-50/50'}`}>
                    <Section icon={IdCard} title="Identity" t={t}>
                        <InfoField label="First Name"     value={resident.first_name}   t={t} />
                        <InfoField label="Middle Name"    value={resident.middle_name}  t={t} />
                        <InfoField label="Last Name"      value={resident.last_name}    t={t} />
                        <InfoField label="Suffix"         value={resident.suffix}       t={t} />
                        <InfoField label="Birthdate"      value={resident.birthdate ? new Date(resident.birthdate).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'} t={t} />
                        <InfoField label="Age"            value={resident.age !== 'N/A' ? `${resident.age} yrs.` : 'N/A'} t={t} />
                        <InfoField label="Gender"         value={resident.gender}       t={t} />
                        <InfoField label="Civil Status"   value={resident.maritalStatus || resident.marital_status?.name} t={t} />
                        <InfoField label="Nationality"    value={resident.nationality?.name || resident.nationality_id} t={t} />
                    </Section>

                    <Section icon={UserCheck} title="Contact & Status" t={t}>
                        <InfoField label="Contact Number"     value={resident.contact_number} t={t} />
                        <InfoField label="Email"              value={resident.email}           t={t} />
                        <InfoField label="Voter Status"       value={voterDisplay}             t={t} />
                        <InfoField label="Position in Family" value={resident.household_position} t={t} />
                        <InfoField label="Sector"             value={resident.sector?.name || resident.sectorLabel} t={t} />
                        <InfoField label="Date of Residency"  value={resident.residency_start_date ? new Date(resident.residency_start_date).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'} t={t} />
                    </Section>

                    <Section icon={MapPin} title="Address" t={t}>
                        <InfoField label="House No."  value={resident.temp_house_number} t={t} />
                        <InfoField label="Purok"      value={resident.resolved_purok}    t={t} />
                        <InfoField label="Street"     value={resident.resolved_street}   t={t} />
                        <div className="col-span-full">
                            <InfoField label="Full Address" value={resident.full_address} t={t} />
                        </div>
                    </Section>

                    <Section icon={Briefcase} title="Socio-Economic" t={t}>
                        <InfoField label="Employment"    value={resident.employmentStatus} t={t} />
                        <InfoField label="Occupation"    value={resident.occupation}       t={t} />
                        <InfoField label="Income Source" value={resident.incomeSource}     t={t} />
                        <InfoField label="Monthly Income" value={resident.monthly_income}  t={t} />
                        <InfoField label="Education"     value={resident.educationalStatus} t={t} />
                        <InfoField label="Highest Grade" value={resident.highestGrade}     t={t} />
                    </Section>
                </div>

                {/* ── Footer ── */}
                <div className={`shrink-0 px-7 py-5 border-t ${t?.cardBorder || 'border-slate-200 dark:border-slate-800'} ${isDark ? 'bg-slate-800/60' : 'bg-slate-50'} flex items-center justify-between`}>
                    <button onClick={onClose}
                        className={`text-[11px] font-black uppercase tracking-widest ${t?.subtleText || 'text-slate-400'} hover:text-slate-600 transition-colors`}>
                        Close
                    </button>
                    <button onClick={() => setShowConfirm(true)}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95">
                        <RotateCcw size={14} /> Restore Resident
                    </button>
                </div>

            </div>
        </div>  
    );
};

export default ResidentArchiveModal;