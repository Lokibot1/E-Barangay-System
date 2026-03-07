import React, { useMemo, useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../../config/api';

const Step1PersonalInfo = ({ formData, handleChange, isDarkMode, setStep }) => {
  // 1. STATES
  const [emailError, setEmailError]       = useState("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [showGmailChip, setShowGmailChip] = useState(false);
  const emailRef = useRef(null);

  // 2. CONSTANTS
  const today = new Date().toISOString().split("T")[0];
  const labelClass = `text-[10px] font-black uppercase tracking-wider ${
    isDarkMode ? 'text-gray-400' : 'text-gray-500'
  }`;
  const requiredStar = <span className="text-rose-500 ml-0.5" aria-hidden="true">*</span>;

  // 3. CONTACT LOGIC — unchanged from original
  const contactStr     = formData.contact ? String(formData.contact).replace(/\D/g, "") : "";
  const isContactValid = contactStr.length === 11 && contactStr.startsWith("09");

  const handleContactChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length <= 2) {
      val = "09";
    } else if (!val.startsWith("09")) {
      val = "09" + val.slice(0, 9);
    }
    if (val.length <= 11) {
      handleChange({ target: { name: "contact", value: val } });
    }
  };

  // 4. @gmail.com CHIP LOGIC
  // Show the chip when:
  //   - user has typed something without an @ yet, OR
  //   - user has typed @ but hasn't finished a valid address
  // Hide it once the email is fully valid (has @ and a proper domain)
  useEffect(() => {
    const raw = formData.email?.trim() || "";
    if (!raw) { setShowGmailChip(false); return; }

    const isComplete = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw);
    setShowGmailChip(!isComplete);
  }, [formData.email]);

  const applyGmail = () => {
    const raw     = formData.email?.trim() || "";
    const atIdx   = raw.indexOf('@');
    const local   = atIdx !== -1 ? raw.slice(0, atIdx) : raw;
    const newEmail = `${local}@gmail.com`;
    handleChange({ target: { name: "email", value: newEmail } });
    setShowGmailChip(false);
    emailRef.current?.focus();
  };

  // 5. EMAIL CHECKER LOGIC (Debounced API Call) — unchanged from original
  useEffect(() => {
    const emailValue = formData.email?.trim().toLowerCase();

    if (!emailValue || !emailValue.endsWith('@gmail.com')) {
      setEmailError("");
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingEmail(true);
      try {
        const response = await fetch(`${API_BASE_URL}/check-email?email=${emailValue}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        setEmailError(data.exists ? "This email is already registered." : "");
      } catch (err) {
        console.error("Email check failed", err);
      } finally {
        setIsCheckingEmail(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [formData.email]);

  // 6. VALIDATION LOGIC — unchanged from original, same required fields
  const { isEmailValid, isValid, missingFields } = useMemo(() => {
    const emailValue        = formData.email?.trim().toLowerCase() || "";
    const emailPatternValid = !emailValue || emailValue.endsWith('@gmail.com');
    const isEmailAvailable  = emailError === "";

    const checks = {
      "First Name":          !!formData.firstName?.trim(),
      "Last Name":           !!formData.lastName?.trim(),
      "Birthdate":           !!formData.birthdate,
      "Gender":              !!formData.gender,
      "Sector":              !!formData.sector,
      "Birth Registration":  !!formData.birthRegistration,
      "Age (check birthdate)": formData.age !== "" && !isNaN(formData.age),
      "Contact Number":      isContactValid,
    };

    const missing = Object.entries(checks)
      .filter(([, ok]) => !ok)
      .map(([label]) => label);

    const allRequiredOk = missing.length === 0;

    return {
      isEmailValid:  emailPatternValid && isEmailAvailable,
      isValid:       allRequiredOk && emailPatternValid && isEmailAvailable && !isCheckingEmail,
      missingFields: missing,
    };
  }, [formData, isContactValid, emailError, isCheckingEmail]);

  // Reason string shown below the disabled button
  const disabledReason = useMemo(() => {
    if (isCheckingEmail)               return "Checking email availability...";
    if (!isEmailValid && formData.email?.trim())
      return emailError
        ? `Email: ${emailError}`
        : "Email must end with @gmail.com";
    if (missingFields.length > 0)
      return `Missing: ${missingFields.join(', ')}`;
    return null;
  }, [isCheckingEmail, isEmailValid, formData.email, emailError, missingFields]);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-300">

      {/* Name Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="col-span-1 space-y-1">
          <label className={labelClass}>First Name{requiredStar}</label>
          <input type="text" name="firstName" value={formData.firstName || ""} onChange={handleChange}
            className="full-input-sm" placeholder="Juan" />
        </div>
        <div className="col-span-1 space-y-1">
          <label className={labelClass}>Middle Name</label>
          <input type="text" name="middleName" value={formData.middleName || ""} onChange={handleChange}
            className="full-input-sm" placeholder="Santos" />
        </div>
        <div className="col-span-1 space-y-1">
          <label className={labelClass}>Last Name{requiredStar}</label>
          <input type="text" name="lastName" value={formData.lastName || ""} onChange={handleChange}
            className="full-input-sm" placeholder="Dela Cruz" />
        </div>
        <div className="col-span-1 space-y-1">
          <label className={labelClass}>Suffix</label>
          <select name="suffix" value={formData.suffix || ""} onChange={handleChange} className="full-input-sm">
            <option value="">None</option>
            <option value="Jr.">Jr.</option>
            <option value="Sr.">Sr.</option>
            <option value="III">III</option>
          </select>
        </div>
      </div>

      {/* Email & Contact Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

        {/* EMAIL */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className={labelClass}>Email Address</label>
            <span className="text-[9px] font-bold text-gray-400 italic">Optional (Gmail only)</span>
          </div>

          <div className="relative">
            <input
              ref={emailRef}
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              className={`full-input-sm transition-all duration-200 ${
                !isEmailValid && formData.email?.trim()
                  ? 'border-rose-500 bg-rose-50/10 focus:ring-rose-500'
                  : ''
              }`}
              placeholder="juan.delacruz@gmail.com"
            />
            {isCheckingEmail && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* @gmail.com suggestion chip — appears while email is incomplete */}
          {showGmailChip && (
            <button
              type="button"
              onClick={applyGmail}
              className={`mt-1.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 border ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-600 text-emerald-400 hover:bg-slate-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <span className="text-[11px]">✉</span>
              {/* Show what the completed email would look like */}
              {(() => {
                const raw   = formData.email?.trim() || "";
                const atIdx = raw.indexOf('@');
                const local = atIdx !== -1 ? raw.slice(0, atIdx) : raw;
                return local
                  ? <><span className="opacity-60">{local}</span><span>@gmail.com</span></>
                  : <span>Add @gmail.com</span>;
              })()}
            </button>
          )}

          {emailError && (
            <p className="text-[9px] font-bold text-rose-500 mt-1">{emailError}</p>
          )}
        </div>

        {/* CONTACT — unchanged from original */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className={labelClass}>Contact Number{requiredStar}</label>
            <span className={`text-[9px] font-bold ${isContactValid ? 'text-emerald-500' : 'text-rose-500'}`}>
              {contactStr.length}/11 Digits
            </span>
          </div>
          <input
            type="text"
            name="contact"
            value={formData.contact || "09"}
            onChange={handleContactChange}
            onFocus={(e) => { if (!e.target.value) handleChange({ target: { name: "contact", value: "09" } }); }}
            placeholder="09XXXXXXXXX"
            className={`full-input-sm font-mono tracking-widest ${
              formData.contact && !isContactValid ? 'border-rose-500 focus:ring-rose-500' : ''
            }`}
          />
        </div>
      </div>

      {/* Birth & Age Section — unchanged */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 space-y-1">
          <label className={labelClass}>Birthdate{requiredStar}</label>
          <input type="date" name="birthdate" value={formData.birthdate || ""} onChange={handleChange}
            max={today} className="full-input-sm" />
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Age</label>
          <input
            type="text"
            value={formData.age || ""}
            readOnly
            className={`full-input-sm text-center font-bold ${
              formData.age === 'Invalid' ? 'text-rose-500' : 'text-emerald-600'
            }`}
          />
        </div>
      </div>

      {/* Identity & Status — unchanged */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={labelClass}>Gender{requiredStar}</label>
          <select name="gender" value={formData.gender || ""} onChange={handleChange} className="full-input-sm">
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Nationality</label>
          <input type="text" name="nationality" value={formData.nationality || ""} onChange={handleChange}
            className="full-input-sm" placeholder="Filipino" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={labelClass}>Marital Status</label>
          <select name="maritalStatus" value={formData.maritalStatus || ""} onChange={handleChange} className="full-input-sm">
            <option value="">Select Status</option>
            <option value="1">Single</option>
            <option value="2">Married</option>
            <option value="3">Living-In</option>
            <option value="4">Widowed</option>
            <option value="5">Separated</option>
            <option value="6">Divorced</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Sector{requiredStar}</label>
          <select
            name="sector"
            value={formData.sector || ""}
            onChange={handleChange}
            className={`full-input-sm ${parseInt(formData.age) >= 60 ? 'border-amber-500 bg-amber-50/10' : ''}`}
          >
            <option value="">Select Sector</option>
            <option value="1">Solo Parent</option>
            <option value="2">PWD</option>
            <option value="3">Senior Citizen</option>
            <option value="4">LGBTQIA+</option>
            <option value="5">Kasambahay</option>
            <option value="6">OFW</option>
            <option value="7">General Population</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelClass}>Birth Registration{requiredStar}</label>
        <select name="birthRegistration" value={formData.birthRegistration || ""} onChange={handleChange} className="full-input-sm">
          <option value="">Select Status</option>
          <option value="Registered">Registered</option>
          <option value="Not Registered">Not Registered</option>
        </select>
      </div>

      {/* Voter Consent Box — unchanged */}
      <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-colors ${
        isDarkMode ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-200"
      }`}>
        <input
          type="checkbox"
          id="isVoter"
          name="isVoter"
          checked={formData.isVoter || false}
          onChange={handleChange}
          className="w-5 h-5 rounded accent-emerald-600 cursor-pointer"
        />
        <label htmlFor="isVoter" className={`text-xs font-bold cursor-pointer ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
          I am a registered voter in this barangay
        </label>
      </div>

      {/* Primary Action */}
      <div className="space-y-2">
        <button
          type="button"
          disabled={!isValid}
          onClick={() => setStep(2)}
          className="w-full py-4 bg-emerald-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest
                     disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:bg-emerald-800
                     active:scale-[0.98] shadow-lg shadow-emerald-900/20"
        >
          {isCheckingEmail ? 'Checking Email...' : 'Continue to Address'}
        </button>

        {/* Reason why the button is disabled — only shows when user has started filling */}
        {!isValid && disabledReason && (formData.firstName || formData.contact || formData.email) && (
          <p className={`text-[9px] font-bold text-center uppercase tracking-wider ${
            isDarkMode ? 'text-slate-500' : 'text-slate-400'
          }`}>
            ⚠ {disabledReason}
          </p>
        )}
      </div>
    </div>
  );
};

export default Step1PersonalInfo;