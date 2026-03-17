import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
    IdCard, UserCheck, Copy, Check,
    QrCode, X, Download, ExternalLink,
    Loader2, ShieldCheck, ShieldAlert,
    Info, BadgeCheck, BadgeX,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../../../services/sub-system-1/Api';
import DetailField from './DetailField';

const accentBoxMap = {
    modern: 'bg-blue-50 border-blue-100 text-blue-700',
    blue:   'bg-blue-50 border-blue-100 text-blue-700',
    purple: 'bg-purple-50 border-purple-100 text-purple-700',
    green:  'bg-green-50 border-green-100 text-green-700',
    dark:   'bg-slate-700 border-slate-600 text-slate-200',
};

const GMAIL_REGEX = /^[^\s@]+@gmail\.com$/i;

const FormatHint = ({ msg }) => (
    <p className="mt-1 ml-1 flex items-center gap-1 text-[10px] text-slate-400 font-medium">
        <Info size={9} /> {msg}
    </p>
);

// ─────────────────────────────────────────────────────────────────────────────

const IdentityTab = ({
    isEdit,
    formData,
    handleChange,
    refs,
    today,
    t,
    currentTheme = 'modern',
    fieldErrors = {},
    onAsyncValidation,
}) => {
    const accentBox = accentBoxMap[currentTheme] || accentBoxMap.modern;

    // ── Email async state only ────────────────────────────────────────────────
    const [emailChecking, setEmailChecking] = useState(false);
    const emailCheckTimer                   = useRef(null);

    const notifyAsync = useCallback((ec, ed) => {
        onAsyncValidation?.({ emailChecking: ec, emailDupError: ed });
    }, [onAsyncValidation]);

    // Reset when edit mode closes
    useEffect(() => {
        if (!isEdit) {
            setEmailChecking(false);
            notifyAsync(false, '');
        }
    }, [isEdit, notifyAsync]);

    // ── Email duplicate check ─────────────────────────────────────────────────
    const handleEmailChange = (e) => {
        clearTimeout(emailCheckTimer.current);
        handleChange(e);

        const value = e.target.value.trim();

        if (!value || !GMAIL_REGEX.test(value)) {
            setEmailChecking(false);
            notifyAsync(false, '');
            return;
        }

        setEmailChecking(true);
        notifyAsync(true, '');

        emailCheckTimer.current = setTimeout(async () => {
            try {
                const res = await api.get('/check-email', {
                    params: { email: value, exclude_resident_id: formData.id },
                });
                const dupErr = res.data.exists
                    ? 'This email is already in use by an active account.'
                    : '';
                setEmailChecking(false);
                notifyAsync(false, dupErr);
            } catch {
                setEmailChecking(false);
                notifyAsync(false, '');
            }
        }, 600);
    };

    // ── Contact number handler ────────────────────────────────────────────────
    const handlePhoneInput = (e) => {
        const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
        handleChange({ target: { name: 'contact_number', value: digits } });
    };

    // ── QR state ──────────────────────────────────────────────────────────────
    const [isQrOpen,    setIsQrOpen]    = useState(false);
    const [qrData,      setQrData]      = useState(null);
    const [qrLoading,   setQrLoading]   = useState(false);
    const [qrError,     setQrError]     = useState(null);
    const qrRef                         = useRef(null);
    const [copiedField, setCopiedField] = useState(null);

    const registeredFullName = useMemo(() => {
        if (formData.name) return formData.name;
        return [formData.first_name, formData.middle_name, formData.last_name, formData.suffix]
            .filter(Boolean).join(' ') || '---';
    }, [formData.first_name, formData.middle_name, formData.last_name, formData.suffix, formData.name]);

    const handleOpenQr = () => {
        setIsQrOpen(true);
        if (qrData || !formData.id) return;
        setQrLoading(true); setQrError(null);
        api.get(`/residents/${formData.id}/qr`)
            .then(r => r.data.success ? setQrData(r.data) : setQrError(r.data.message || 'Failed.'))
            .catch(err => setQrError(err.response?.data?.message || 'Network error.'))
            .finally(() => setQrLoading(false));
    };

    const downloadQR = () => {
        const svg = qrRef.current?.querySelector('svg');
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const img     = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx    = canvas.getContext('2d');
            canvas.width = 600; canvas.height = 600;
            ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 600, 600);
            ctx.drawImage(img, 50, 50, 500, 500);
            canvas.toBlob(blob => {
                if (!blob) return;
                const url  = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `QR-${formData.barangay_id || 'resident'}.png`;
                document.body.appendChild(link); link.click();
                setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(url); }, 100);
            }, 'image/png');
        };
        img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
    };

    const copyToClipboard = (text, fieldName) => {
        if (!text || text === '---') return;
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const StaffActionContainer = ({ children, text, name }) => {
        if (isEdit) return children;
        const isCopied = copiedField === name;
        return (
            <div className="group relative flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/40 p-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-all">
                <div className="flex-1">{children}</div>
                <button onClick={() => copyToClipboard(text, name)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 ${
                        isCopied
                            ? 'bg-emerald-500 text-white shadow-md'
                            : 'bg-white dark:bg-slate-700 text-slate-500 hover:bg-blue-600 hover:text-white shadow-sm border border-slate-200 dark:border-slate-600'
                    }`}>
                    {isCopied
                        ? <><Check size={12} strokeWidth={3} /><span className="text-[10px] font-black uppercase">Copied</span></>
                        : <><Copy size={12} strokeWidth={2.5} /><span className="text-[10px] font-black uppercase hidden group-hover:inline">Copy</span></>}
                </button>
            </div>
        );
    };

    // ── Shared input classes ──────────────────────────────────────────────────
    const inputAccentMap = {
        modern: 'focus:border-blue-500 focus:ring-blue-500/10',
        blue:   'focus:border-blue-500 focus:ring-blue-500/10',
        purple: 'focus:border-purple-500 focus:ring-purple-500/10',
        green:  'focus:border-green-500 focus:ring-green-500/10',
        dark:   'focus:border-slate-500 focus:ring-slate-500/10',
    };
    const accentInput = inputAccentMap[currentTheme] || inputAccentMap.modern;

    const phoneInputClass = `
        w-full
        ${t?.inputBg || 'bg-white dark:bg-slate-900'}
        border rounded-xl px-4 py-2.5
        text-sm font-semibold
        ${t?.inputText || 'text-slate-700 dark:text-slate-200'}
        outline-none transition-all shadow-sm
        ${fieldErrors.contact_number
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
            : `${t?.inputBorder || 'border-slate-300 dark:border-slate-700'} ${accentInput} focus:ring-2`
        }
    `;

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 text-left">

            {/* ── SECTION 1: IDENTITY PROFILE ── */}
            <section className={`${t?.cardBg || 'bg-white dark:bg-slate-900'} border ${t?.cardBorder || 'border-slate-200 dark:border-slate-800'} rounded-[2rem] overflow-hidden shadow-sm`}>
                <div className={`${t?.inlineBg || 'bg-slate-50 dark:bg-slate-800/50'} px-8 py-4 border-b ${t?.cardBorder || 'border-slate-200 dark:border-slate-800'} flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg text-white ${t?.primarySolid || 'bg-blue-600'}`}><IdCard size={18} /></div>
                        <h3 className={`text-sm font-black ${t?.cardText || 'text-slate-800 dark:text-white'} uppercase tracking-widest`}>Identity Profile</h3>
                    </div>
                    {!isEdit && formData.id && (
                        <button onClick={handleOpenQr}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border ${t?.cardBg || 'bg-white dark:bg-slate-800'} text-emerald-600 border-emerald-200 hover:bg-emerald-50`}>
                            <QrCode size={14} /> ID QR Code
                        </button>
                    )}
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">

                    {/* Barangay ID + Verified By — view mode only */}
                    {!isEdit && (
                        <>
                            <StaffActionContainer text={formData.barangay_id} name="barangay_id">
                                <div className="flex flex-col gap-0.5">
                                    <p className={`text-[11px] font-bold ${t?.subtleText || 'text-slate-400'} uppercase tracking-widest ml-1`}>
                                        Barangay ID
                                    </p>
                                    <p className={`text-base font-black ${t?.cardText || 'text-slate-800 dark:text-white'} font-mono tracking-wider`}>
                                        {formData.barangay_id || '---'}
                                    </p>
                                </div>
                            </StaffActionContainer>

                            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${
                                formData.verified_by_name
                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-800/50'
                                    : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-800/50'
                            }`}>
                                {formData.verified_by_name ? (
                                    <BadgeCheck size={18} className="text-emerald-500 shrink-0" />
                                ) : (
                                    <BadgeX size={18} className="text-amber-500 shrink-0" />
                                )}
                                <div className="flex flex-col min-w-0">
                                    <p className={`text-[10px] font-bold uppercase tracking-widest ${
                                        formData.verified_by_name ? 'text-emerald-600' : 'text-amber-600'
                                    }`}>
                                        {formData.verified_by_name ? 'Verified' : 'Not Yet Verified'}
                                    </p>
                                    {formData.verified_by_name && (
                                        <p className={`text-[11px] font-semibold truncate ${t?.cardText || 'text-slate-700 dark:text-slate-200'}`}>
                                            by {formData.verified_by_name}
                                        </p>
                                    )}
                                    {formData.formatted_verified_at && (
                                        <p className="text-[10px] text-slate-400 font-medium">
                                            {formData.formatted_verified_at}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {isEdit ? (
                        <>
                            <div>
                                <DetailField label="First Name" name="first_name" val={formData.first_name} isEdit onChange={handleChange} t={t} currentTheme={currentTheme} error={fieldErrors.first_name} />
                            </div>
                            <div>
                                <DetailField label="Last Name" name="last_name" val={formData.last_name} isEdit onChange={handleChange} t={t} currentTheme={currentTheme} error={fieldErrors.last_name} />
                            </div>
                            <div>
                                <DetailField label="Middle Name" name="middle_name" val={formData.middle_name} isEdit onChange={handleChange} t={t} currentTheme={currentTheme} error={fieldErrors.middle_name} />
                            </div>
                            <div>
                                <DetailField label="Suffix (e.g. Jr. Sr. III)" name="suffix" val={formData.suffix} isEdit onChange={handleChange} t={t} currentTheme={currentTheme} error={fieldErrors.suffix} />
                                {!fieldErrors.suffix && <FormatHint msg="Allowed: letters, dots (.), hyphens. e.g. Jr.  Sr.  III" />}
                            </div>

                            {/* Email */}
                            <div className="col-span-full md:col-span-1">
                                <DetailField
                                    label="Email Address (optional)"
                                    name="email"
                                    val={formData.email}
                                    isEdit
                                    onChange={handleEmailChange}
                                    type="email"
                                    placeholder="name@gmail.com"
                                    error={fieldErrors.email}
                                    t={t}
                                    currentTheme={currentTheme}
                                />
                                {emailChecking && !fieldErrors.email && (
                                    <p className="mt-1 ml-1 flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                                        <Loader2 size={10} className="animate-spin" /> Checking if email is available…
                                    </p>
                                )}
                                {!fieldErrors.email && !emailChecking && formData.email && GMAIL_REGEX.test(formData.email) && (
                                    <p className="mt-1 ml-1 flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                                        <Check size={10} strokeWidth={3} /> Email is available
                                    </p>
                                )}
                            </div>
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

                    {/* Birthdate */}
                    <div>
                        <DetailField
                            label="Birth Date"
                            name="birthdate"
                            val={formData.birthdate}
                            isEdit={isEdit}
                            onChange={handleChange}
                            type="date"
                            max={today}
                            error={fieldErrors.birthdate}
                            t={t}
                            currentTheme={currentTheme}
                        />
                        {isEdit && !fieldErrors.birthdate && (
                            <FormatHint msg="Format: DD/MM/YYYY — future dates and dates beyond 150 years are not allowed." />
                        )}
                    </div>

                    {/* Calculated Age */}
                    <div className="flex flex-col gap-1.5">
                        <p className={`text-[11px] font-bold ${t?.subtleText || 'text-slate-400'} uppercase tracking-widest ml-1`}>Calculated Age</p>
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

            {/* ── SECTION 2: STATUS & AFFILIATIONS ── */}
            {/* Note: household_position has been moved to AddressTab > Household Membership */}
            <section className={`${t?.cardBg || 'bg-white dark:bg-slate-900'} border ${t?.cardBorder || 'border-slate-200 dark:border-slate-800'} rounded-[2rem] overflow-hidden shadow-sm`}>
                <div className={`${t?.inlineBg || 'bg-slate-50 dark:bg-slate-800/50'} px-8 py-4 border-b ${t?.cardBorder || 'border-slate-200 dark:border-slate-800'} flex items-center gap-3`}>
                    <div className={`p-2 rounded-lg text-white ${t?.primarySolid || 'bg-blue-600'}`}><UserCheck size={18} /></div>
                    <h3 className={`text-sm font-black ${t?.cardText || 'text-slate-800 dark:text-white'} uppercase tracking-widest`}>Status & Affiliations</h3>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 text-left">
                    <DetailField label="Sex / Gender"  name="gender"           val={formData.gender}           isEdit={isEdit} onChange={handleChange} type="select" options={refs.genders}         t={t} currentTheme={currentTheme} />
                    <DetailField label="Civil Status"  name="marital_status_id" val={formData.marital_status_id} isEdit={isEdit} onChange={handleChange} type="select" options={refs.marital_statuses} t={t} currentTheme={currentTheme} />

                    {/* Contact number */}
                    <div>
                        {isEdit ? (
                            <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between items-center px-1">
                                    <label className={`text-[11px] font-bold ${t?.subtleText || 'text-slate-400 dark:text-slate-500'} uppercase tracking-widest`}>
                                        Contact Number
                                    </label>
                                    {fieldErrors.contact_number && (
                                        <span className="text-[10px] font-bold text-red-500 uppercase animate-pulse">Invalid</span>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    name="contact_number"
                                    placeholder="09XXXXXXXXX"
                                    value={formData.contact_number || ''}
                                    onChange={handlePhoneInput}
                                    maxLength={11}
                                    className={phoneInputClass}
                                />
                                {fieldErrors.contact_number && (
                                    <p className="mt-1 ml-1 text-[10px] font-medium text-red-500">{fieldErrors.contact_number}</p>
                                )}
                                {!fieldErrors.contact_number && (
                                    <FormatHint msg="11 digits only, no spaces or dashes. e.g. 09171234567" />
                                )}
                            </div>
                        ) : (
                            <StaffActionContainer text={formData.contact_number} name="contact">
                                <DetailField
                                    label="Contact Number"
                                    val={formData.contact_number}
                                    isEdit={false}
                                    t={t}
                                    currentTheme={currentTheme}
                                />
                            </StaffActionContainer>
                        )}
                    </div>

                    <DetailField label="Voter Status"   name="is_voter"   val={formData.is_voter}   isEdit={isEdit} onChange={handleChange} type="select" options={refs.voter_options} t={t} currentTheme={currentTheme} />
                    <DetailField label="Sector / Group" name="sector_id"  val={formData.sector_id}  isEdit={isEdit} onChange={handleChange} type="select" options={refs.sectors}       t={t} currentTheme={currentTheme} />
                </div>
            </section>

            {/* ── QR MODAL ── */}
            {isQrOpen && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
                    <div className={`w-full max-w-sm rounded-[28px] border shadow-2xl overflow-hidden ${currentTheme === 'dark' ? 'bg-slate-900 text-white border-white/10' : 'bg-white text-slate-900 border-slate-200'}`}>
                        <div className="flex items-center justify-between px-6 pt-5 pb-4">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={18} className="text-emerald-500" />
                                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600">Identity QR Code</span>
                            </div>
                            <button onClick={() => setIsQrOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>
                        <div className="px-6 pb-8 text-center">
                            {qrLoading ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-3">
                                    <Loader2 size={32} className="text-emerald-500 animate-spin" />
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Generating QR…</p>
                                </div>
                            ) : qrError ? (
                                <div className={`rounded-2xl p-6 border flex flex-col items-center gap-3 ${currentTheme === 'dark' ? 'bg-rose-950/30 border-rose-800' : 'bg-rose-50 border-rose-200'}`}>
                                    <ShieldAlert size={32} className="text-rose-500" />
                                    <p className="text-sm font-bold text-rose-700 dark:text-rose-300">{qrError}</p>
                                </div>
                            ) : qrData && (
                                <>
                                    <div className={`rounded-2xl p-4 mb-5 border text-left ${currentTheme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                                        <p className="text-base font-black uppercase tracking-tight leading-tight">{registeredFullName}</p>
                                        <p className="text-[12px] font-bold mt-1 font-mono text-emerald-600">ID: {formData.barangay_id}</p>
                                    </div>
                                    <div ref={qrRef} className="flex items-center justify-center bg-white rounded-3xl p-6 mb-4 border border-slate-100 shadow-inner">
                                        <QRCodeSVG value={qrData.qr_url} size={180} level="H" includeMargin={true} />
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <button onClick={downloadQR} className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest">
                                            <Download size={16} /> DOWNLOAD
                                        </button>
                                        <a href={qrData.qr_url} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest">
                                            <ExternalLink size={16} /> Open Web Profile
                                        </a>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IdentityTab;