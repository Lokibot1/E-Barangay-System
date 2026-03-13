import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    MapPin, Briefcase, IdCard, Save, Edit3, XCircle,
    User, AlertCircle, History, Loader2, Clock,
} from 'lucide-react';
import ModalWrapper from '../common/ModalWrapper';
import api from '../../../services/sub-system-1/Api';
import { residentService } from '../../../services/sub-system-1/residents';
import IdentityTab from './tabs/IdentityTab';
import AddressTab  from './tabs/AddressTab';
import SocioEcoTab from './tabs/SocioEcoTab';
import HistoryTab  from './tabs/HistoryTab';

// ── Helpers ───────────────────────────────────────────────────────────────────

const toDateString = (d) => {
    if (!d) return '';
    const s = String(d);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    if (/[+-]\d{2}:\d{2}$/.test(s)) {
        const dt = new Date(s);
        if (!isNaN(dt)) {
            return [
                dt.getFullYear(),
                String(dt.getMonth() + 1).padStart(2, '0'),
                String(dt.getDate()).padStart(2, '0'),
            ].join('-');
        }
    }
    if (s.endsWith('Z')) {
        const dt = new Date(s);
        if (!isNaN(dt) && dt.getUTCHours() >= 1) {
            const local = new Date(dt.getTime() + 8 * 60 * 60 * 1000);
            return [
                local.getUTCFullYear(),
                String(local.getUTCMonth() + 1).padStart(2, '0'),
                String(local.getUTCDate()).padStart(2, '0'),
            ].join('-');
        }
    }
    return s.split('T')[0].slice(0, 10);
};

const toId = (v) => {
    if (v === null || v === undefined || v === '') return '';
    if (typeof v === 'object') return String(v.id ?? '');
    return String(v);
};

const calcAge = (bday) => {
    if (!bday) return 'N/A';
    const parts = bday.split('-').map(Number);
    if (parts.length < 3 || parts.some(isNaN)) return 'N/A';
    const [y, m, d] = parts;
    const now = new Date();
    let age = now.getFullYear() - y;
    if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age--;
    return age < 0 ? 'N/A' : age;
};

const buildSnapshot = (r) => ({
    ...r,

    first_name:  (r.firstName  || r.first_name  || '').trim(),
    middle_name: (r.middleName  || r.middle_name || '').trim(),
    last_name:   (r.lastName    || r.last_name   || '').trim(),
    suffix:      (r.suffix || '').trim(),

    contact_number: r.contact        || r.contact_number || '',
    email:          r.email          || '',

    sector_id:         toId(r.sector_id),
    nationality_id:    toId(r.nationality_id),
    marital_status_id: toId(r.marital_status_id),
    temp_purok_id:     toId(r.temp_purok_id),
    temp_street_id:    toId(r.temp_street_id),

    temp_house_number:  r.houseNumber || r.temp_house_number || '',
    household_position: r.householdPosition || r.household_position || '',

    birthdate:            toDateString(r.birthdate),
    residency_start_date: toDateString(r.residencyStartDate ?? r.residency_start_date),

    is_voter: (
        r.isVoter == 1 || r.is_voter == 1 ||
        r.isVoter === 'Yes' || r.is_voter === 'Yes'
    ) ? 'Yes' : 'No',

    age: r.age || calcAge(toDateString(r.birthdate)),

    employment_status:  r.employmentStatus  || r.employment_status  || '',
    income_source:      r.incomeSource      || r.income_source      || '',
    educational_status: r.educationalStatus || r.educational_status || '',
    highest_attainment: r.highestGrade      || r.highest_attainment || '',
    school_level:       r.schoolLevel       || r.school_level       || '',
    school_type:        r.schoolType        || r.school_type        || '',
    occupation:         r.occupation        || '',
    monthly_income:     r.monthlyIncome     || r.monthly_income     || '',

    barangay_id: r.barangay_id || r.barangayId || '',

    verified_by_name:      r.verified_by_name      || r.verifiedByName      || null,
    formatted_verified_at: r.formatted_verified_at || r.formattedVerifiedAt || null,

    updated_by_name:      r.updated_by_name      || r.updatedByName      || null,
    formatted_updated_by: r.formatted_updated_by  || r.formattedUpdatedBy  || null,
    formatted_updated_at: r.formatted_updated_at  || r.formattedUpdatedAt  || null,

    formatted_birthdate:       r.formatted_birthdate       || r.formattedBirthdate       || null,
    formatted_residency_start: r.formatted_residency_start || r.formattedResidencyStart  || null,
});

// ── Validators ────────────────────────────────────────────────────────────────

const NAME_RE   = /^[a-zA-Z\s\-ñÑ]+$/;
const SUFFIX_RE = /^[a-zA-Z\s\-ñÑ.]+$/;
const EMAIL_RE  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GMAIL_RE  = /^[^\s@]+@gmail\.com$/i;

const validate = (fd) => {
    const e = {};
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const min   = new Date(1900, 0, 1);

    ['first_name', 'last_name'].forEach(f => {
        const v = (fd[f] || '').trim();
        if (!v)                    e[f] = 'This field is required.';
        else if (!NAME_RE.test(v)) e[f] = 'Only letters, spaces, hyphens, and ñ allowed.';
    });
    if (fd.middle_name?.trim() && !NAME_RE.test(fd.middle_name.trim()))
        e.middle_name = 'Only letters, spaces, hyphens, and ñ allowed.';
    if (fd.suffix?.trim() && !SUFFIX_RE.test(fd.suffix.trim()))
        e.suffix = 'Only letters, dots, spaces, and hyphens allowed.';
    if (fd.email?.trim()) {
        if (!EMAIL_RE.test(fd.email.trim()))      e.email = 'Enter a valid email (e.g. name@gmail.com).';
        else if (!GMAIL_RE.test(fd.email.trim())) e.email = 'Only @gmail.com addresses are accepted.';
    }
    if (!fd.birthdate) {
        e.birthdate = 'Birthdate is required.';
    } else {
        const [y, m, d] = fd.birthdate.split('-').map(Number);
        const bd = new Date(y, m - 1, d);
        if (isNaN(bd))       e.birthdate = 'Invalid date.';
        else if (bd > today) e.birthdate = 'Cannot be a future date.';
        else if (bd < min)   e.birthdate = 'Cannot be more than 150 years ago.';
    }
    const digits = (fd.contact_number || '').replace(/\D/g, '');
    if (digits.length > 0 && digits.length !== 11)
        e.contact_number = `${digits.length}/11 digits — must be exactly 11.`;
    if (fd.residency_start_date) {
        const [y, m, d] = fd.residency_start_date.split('-').map(Number);
        const rd = new Date(y, m - 1, d);
        if (!isNaN(rd) && rd > today) e.residency_start_date = 'Cannot be a future date.';
    }
    return e;
};

// ── Theme ─────────────────────────────────────────────────────────────────────

const ACCENT = {
    modern: { text: 'text-blue-600',   bar: 'bg-blue-600',   border: 'border-blue-200',   hover: 'hover:bg-blue-50'   },
    blue:   { text: 'text-blue-600',   bar: 'bg-blue-600',   border: 'border-blue-200',   hover: 'hover:bg-blue-50'   },
    purple: { text: 'text-purple-600', bar: 'bg-purple-600', border: 'border-purple-200', hover: 'hover:bg-purple-50' },
    green:  { text: 'text-green-600',  bar: 'bg-green-600',  border: 'border-green-200',  hover: 'hover:bg-green-50'  },
    dark:   { text: 'text-slate-200',  bar: 'bg-slate-300',  border: 'border-slate-600',  hover: 'hover:bg-slate-700' },
};

// ─────────────────────────────────────────────────────────────────────────────

const ResidentDetailsModal = ({ isOpen, onClose, resident, onSave, mode, t, currentTheme = 'modern' }) => {
    const [formData,  setFormData]  = useState({});
    const [isEdit,    setIsEdit]    = useState(false);
    const [loading,   setLoading]   = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [submitErr, setSubmitErr] = useState({});
    const [emailBusy, setEmailBusy] = useState(false);
    const [emailErr,  setEmailErr]  = useState('');

    // ── Head-of-family conflict state ─────────────────────────────────────────
    // headConf: boolean — is there a conflict right now?
    // headConflictMsg: string — human-readable reason shown in tooltip & banner
    const [headConf,       setHeadConf]       = useState(false);
    const [headConflictMsg, setHeadConflictMsg] = useState('');
    const headCheckTimer = useRef(null);

    const [history,  setHistory]  = useState([]);
    const [histLoad, setHistLoad] = useState(false);
    const [histErr,  setHistErr]  = useState(null);

    const snapRef     = useRef({});
    const prevOpenRef = useRef(false);

    const accent = ACCENT[currentTheme] || ACCENT.modern;
    const today  = new Date().toISOString().split('T')[0];
    const isDark = currentTheme === 'dark';

    // ── Reference data ────────────────────────────────────────────────────────
    const [refs, setRefs] = useState({
        puroks: [], streets: [], marital_statuses: [], sectors: [],
        genders: [], birth_registrations: [], residency_statuses: [],
        educational_statuses: [], school_types: [], school_levels: [],
        employment_statuses: [], monthly_income: [], income_sources: [],
        nationalities: [],
        voter_options:       ['Yes', 'No'],
        household_positions: ['Head of Family', 'Spouse', 'Son', 'Daughter', 'Relative', 'Househelp', 'Others'],
        attainment_options:  [
            'No Schooling', 'Elementary Level', 'Elementary Graduate',
            'High School Level', 'High School Graduate', 'Senior High Level',
            'Senior High Graduate', 'Vocational Course', 'College Level',
            'College Graduate', 'Post-Graduate Study', 'N/A',
        ],
    });

    // ── Init: load refs then build formData ───────────────────────────────────
    const initModal = useCallback(async (r, m) => {
        try {
            const res = await api.get('/reference-data');
            if (res.data) setRefs(prev => ({ ...prev, ...res.data }));
        } catch (err) {
            console.error('Reference fetch error:', err);
        }
        const snap = buildSnapshot(r);
        snapRef.current = snap;
        setFormData(snap);
        setSubmitErr({});
        setEmailBusy(false);
        setEmailErr('');
        setHeadConf(false);
        setHeadConflictMsg('');
        setHistory([]);
        setHistErr(null);
        setIsEdit(m === 'edit');
        setActiveTab('basic');
    }, []);

    // ── Open/close ────────────────────────────────────────────────────────────
    useEffect(() => {
        const justOpened = isOpen && !prevOpenRef.current;
        prevOpenRef.current = isOpen;
        if (justOpened && resident) {
            initModal(resident, mode);
        }
    }, [isOpen, resident, mode, initModal]);

    // ── Head-of-family conflict check ─────────────────────────────────────────
    //
    // Fires (debounced 400 ms) whenever:
    //   • the resident's household_position is "Head of Family", AND
    //   • we are in edit mode
    //
    // Checks the target address (house_number + purok + street).
    // If that household already has a different head → sets headConf = true
    // so the Save button is blocked before the user even tries to submit.
    //
    useEffect(() => {
        if (!isEdit) {
            setHeadConf(false);
            setHeadConflictMsg('');
            return;
        }

        if (formData.household_position !== 'Head of Family') {
            setHeadConf(false);
            setHeadConflictMsg('');
            return;
        }

        // Need all three address parts to do a meaningful check
        if (!formData.temp_house_number || !formData.temp_purok_id || !formData.temp_street_id) {
            setHeadConf(false);
            setHeadConflictMsg('');
            return;
        }

        clearTimeout(headCheckTimer.current);
        headCheckTimer.current = setTimeout(async () => {
            try {
                const res = await api.get(`/residents/${resident?.id}/head-check`, {
                    params: {
                        house_number: formData.temp_house_number,
                        purok_id:     formData.temp_purok_id,
                        street_id:    formData.temp_street_id,
                    },
                });
                if (res.data?.has_other_head) {
                    const who = res.data.head_name ? `"${res.data.head_name}"` : 'another resident';
                    setHeadConf(true);
                    setHeadConflictMsg(
                        `This household already has a Head of Family (${who}). Demote them first.`
                    );
                } else {
                    setHeadConf(false);
                    setHeadConflictMsg('');
                }
            } catch {
                // If the check fails for network reasons, don't block the user —
                // the backend will still enforce the constraint on submit.
                setHeadConf(false);
                setHeadConflictMsg('');
            }
        }, 400);

        return () => clearTimeout(headCheckTimer.current);
    }, [
        isEdit,
        formData.household_position,
        formData.temp_house_number,
        formData.temp_purok_id,
        formData.temp_street_id,
        resident?.id,
    ]);

    // ── Lazy history ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (activeTab !== 'history' || !resident?.id || history.length > 0) return;
        (async () => {
            setHistLoad(true); setHistErr(null);
            try   { setHistory((await residentService.getResidentHistory(resident.id)) || []); }
            catch { setHistErr('Failed to load edit history.'); }
            finally { setHistLoad(false); }
        })();
    }, [activeTab, resident?.id]); // eslint-disable-line

    // ── Errors ────────────────────────────────────────────────────────────────
    const liveErrors = useMemo(() => isEdit ? validate(formData) : {}, [formData, isEdit]);
    const errors = useMemo(() => ({
        ...submitErr,
        ...liveErrors,
        ...(emailErr ? { email: emailErr } : {}),
        // Surface the head conflict as a field-level error on household_position
        // so the red badge counter on the Identity tab lights up
        ...(headConf ? { household_position: headConflictMsg } : {}),
    }), [submitErr, liveErrors, emailErr, headConf, headConflictMsg]);

    const blocked = Object.values(errors).some(Boolean) || emailBusy || headConf;

    const handleAsyncValidation = useCallback(({ emailChecking, emailDupError }) => {
        setEmailBusy(!!emailChecking);
        setEmailErr(emailDupError || '');
    }, []);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setSubmitErr(prev => ({ ...prev, [name]: '' }));
        setFormData(prev => ({
            ...prev, [name]: value,
            ...(name === 'birthdate' ? { age: calcAge(value) } : {}),
        }));
    }, []);

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        if (blocked) return;

        const errs = validate(formData);
        if (Object.keys(errs).length) {
            setSubmitErr(errs);
            const first = Object.keys(errs)[0];
            setActiveTab(
                ['temp_house_number', 'temp_purok_id', 'temp_street_id', 'residency_start_date'].includes(first) ? 'address' :
                ['employment_status', 'income_source', 'educational_status', 'highest_attainment'].includes(first) ? 'socio' : 'basic'
            );
            return;
        }

        setLoading(true);
        const ok = await onSave(formData);
        setLoading(false);
        if (ok) {
            setIsEdit(false);
            setSubmitErr({});
            setEmailErr('');
            setHeadConf(false);
            setHeadConflictMsg('');
            setHistory([]);
            snapRef.current = { ...formData };
        }
    };

    const handleCancel = () => {
        setFormData({ ...snapRef.current });
        setIsEdit(false);
        setSubmitErr({});
        setEmailBusy(false);
        setEmailErr('');
        setHeadConf(false);
        setHeadConflictMsg('');
    };

    // ── Address display ───────────────────────────────────────────────────────
    const fullAddress = () => {
        const street = (refs.streets || []).find(s => String(s.id) === String(formData.temp_street_id));
        const purok  = (refs.puroks  || []).find(p => String(p.id) === String(formData.temp_purok_id));
        return [
            formData.temp_house_number,
            street?.name,
            purok ? `Purok ${purok.number || purok.name}` : '',
            'Barangay Gulod Novaliches, Quezon City',
        ].filter(Boolean).join(', ');
    };

    // ── Tab config ────────────────────────────────────────────────────────────
    const TAB_FIELDS = {
        basic:   ['first_name', 'last_name', 'middle_name', 'suffix', 'email', 'birthdate', 'contact_number'],
        address: ['temp_house_number', 'temp_purok_id', 'temp_street_id', 'residency_start_date', 'household_position'],
        socio:   ['employment_status', 'income_source', 'educational_status', 'highest_attainment'],
        history: [],
    };

    const blockReason = () => {
        if (emailBusy) return 'Checking email availability…';
        if (headConf)  return headConflictMsg || 'Head of Family conflict — demote current head first';
        if (blocked)   return 'Fix all errors before saving';
        return '';
    };

    const TabBtn = ({ id, label, icon: Icon }) => {
        const cnt = (TAB_FIELDS[id] || []).filter(f => errors[f]).length;
        return (
            <button type="button" onClick={() => setActiveTab(id)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-[11px] font-bold uppercase tracking-widest transition-all relative ${
                    activeTab === id
                        ? `${accent.text} ${t?.cardBg || 'bg-white dark:bg-slate-900'}`
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}>
                <Icon size={14} /> {label}
                {cnt > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black">{cnt}</span>
                )}
                {activeTab === id && <div className={`absolute bottom-0 left-0 w-full h-0.5 ${accent.bar}`} />}
            </button>
        );
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <ModalWrapper
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="max-w-5xl"
            t={t}
            title={
                <div className="flex items-center gap-4 w-full pr-10">
                    <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 shadow-inner ring-2 ring-white dark:ring-slate-700 shrink-0">
                        <User size={24} strokeWidth={2.5} />
                    </div>

                    <div className="flex flex-col justify-center min-w-0 gap-1">
                        <h2 className={`text-base font-black ${t?.cardText || 'text-slate-800 dark:text-white'} uppercase tracking-tight leading-none truncate`}>
                            {formData.first_name
                                ? `${formData.first_name} ${formData.last_name}`
                                : (resident?.name || 'Resident Profile')}
                        </h2>

                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">
                                #{resident?.tracking_number || resident?.id || 'NEW'}
                            </span>

                            {(formData.formatted_updated_by || formData.updated_by_name) ? (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                    <Clock size={9} className="text-slate-400 shrink-0" />
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Last Activity:</span>
                                    {formData.formatted_updated_by && (
                                        <span className={`text-[10px] font-black ${t?.cardText || 'text-slate-700 dark:text-slate-200'}`}>
                                            {formData.formatted_updated_by}
                                        </span>
                                    )}
                                    {formData.updated_by_name && (
                                        <>
                                            <span className="text-slate-300 dark:text-slate-600 text-[9px]">·</span>
                                            <span className="text-[9px] font-medium text-slate-400">By:</span>
                                            <span className={`text-[10px] font-black ${t?.cardText || 'text-slate-700 dark:text-slate-200'}`}>
                                                {formData.updated_by_name}
                                            </span>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700">
                                    <Clock size={9} className="text-slate-300" />
                                    <span className="text-[9px] font-medium text-slate-300 dark:text-slate-600">No edits yet</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            }
        >
            <div className="flex flex-col -m-6 h-full">

                {/* Tabs */}
                <div className={`flex ${t?.inlineBg || 'bg-slate-50 dark:bg-slate-800/50'} border-b ${t?.cardBorder || 'border-slate-200 dark:border-slate-800'} px-6`}>
                    <TabBtn id="basic"   label="Profile"  icon={IdCard}    />
                    <TabBtn id="address" label="Household"   icon={MapPin}    />
                    <TabBtn id="socio"   label="Socio-Eco" icon={Briefcase} />
                    <TabBtn id="history" label="History"   icon={History}   />
                </div>


                {/* Content */}
                <div className={`flex-1 overflow-y-auto p-6 md:p-10 ${t?.cardBg || 'bg-white dark:bg-slate-900'} min-h-[50vh] max-h-[60vh]`}>
                    <div className="max-w-4xl mx-auto">
                        {activeTab === 'basic'   && (
                            <IdentityTab
                                isEdit={isEdit} formData={formData} handleChange={handleChange}
                                refs={refs} today={today} t={t} currentTheme={currentTheme}
                                fieldErrors={errors} onAsyncValidation={handleAsyncValidation}
                            />
                        )}
                        {activeTab === 'address' && (
                            <AddressTab
                                isEdit={isEdit} formData={formData} handleChange={handleChange}
                                refs={refs} getFullHardcodedAddress={fullAddress}
                                filteredStreets={(refs.streets || []).filter(
                                    s => String(s.purok_id) === String(formData.temp_purok_id)
                                )}
                                t={t} currentTheme={currentTheme} fieldErrors={errors}
                                originalSnapshot={snapRef.current}
                            />
                        )}
                        {activeTab === 'socio'   && (
                            <SocioEcoTab
                                isEdit={isEdit} formData={formData} handleChange={handleChange}
                                refs={refs} t={t} currentTheme={currentTheme}
                            />
                        )}
                        {activeTab === 'history' && (
                            <HistoryTab
                                history={history} loading={histLoad} error={histErr}
                                onRetry={() => { setHistory([]); setActiveTab('history'); }}
                                t={t} isDark={isDark}
                            />
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className={`p-6 ${t?.inlineBg || 'bg-slate-50 dark:bg-slate-800/50'} border-t ${t?.cardBorder || 'border-slate-200 dark:border-slate-800'} flex justify-between items-center px-10`}>
                    <button type="button" onClick={onClose}
                        className="text-[11px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors tracking-widest">
                        Close Profile
                    </button>
                    <div className="flex items-center gap-3">
                        {activeTab !== 'history' && (<>
                            <button type="button" onClick={isEdit ? handleCancel : () => setIsEdit(true)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border ${
                                    isEdit
                                        ? 'bg-white text-rose-600 border-rose-200 hover:bg-rose-50'
                                        : `${t?.cardBg || 'bg-white dark:bg-slate-800'} ${accent.text} ${accent.border} ${accent.hover}`
                                }`}>
                                {isEdit ? <><XCircle size={14} /> Cancel Edit</> : <><Edit3 size={14} /> Edit Record</>}
                            </button>
                            {isEdit && (
                                <div className="relative group">
                                    <button type="button" onClick={handleSave} disabled={loading || blocked}
                                        className={`flex items-center gap-2 px-10 py-3 text-white text-[11px] font-black uppercase rounded-xl shadow-lg transition-all active:scale-95 ${
                                            blocked
                                                ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-70'
                                                : `${t?.primarySolid || 'bg-blue-600'} ${t?.primaryHover || 'hover:bg-blue-700'}`
                                        }`}>
                                        {loading
                                            ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                                            : <><Save size={16} /> Save Changes</>}
                                    </button>
                                    {blocked && !loading && (
                                        <div className="absolute bottom-full right-0 mb-2 w-max max-w-[260px] px-3 py-2 bg-slate-800 text-white text-[10px] font-bold rounded-lg shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                                            <AlertCircle size={10} /> {blockReason()}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>)}
                    </div>
                </div>

            </div>
        </ModalWrapper>
    );
};

export default ResidentDetailsModal;