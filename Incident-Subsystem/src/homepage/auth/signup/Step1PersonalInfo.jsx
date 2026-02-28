import React from 'react';

const Step1PersonalInfo = ({ formData, handleChange, isDarkMode, setStep }) => {
  const labelClass = `text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`;
  const requiredStar = <span className="text-rose-500 ml-0.5">*</span>;
  const today = new Date().toISOString().split("T")[0];

const isValid = 
    formData.firstName?.trim() && 
    formData.lastName?.trim() && 
    formData.birthdate && 
    formData.gender && 
    formData.sector && 
    formData.birthRegistration &&
    formData.age !== "" && !isNaN(formData.age);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-300">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="col-span-1 space-y-1">
          <label className={labelClass}>First Name{requiredStar}</label>
          <input type="text" name="firstName" value={formData.firstName || ""} onChange={handleChange} className="full-input-sm" placeholder="Juan" />
        </div>
        <div className="col-span-1 space-y-1">
          <label className={labelClass}>Middle Name</label>
          <input type="text" name="middleName" value={formData.middleName || ""} onChange={handleChange} className="full-input-sm" placeholder="Santos" />
        </div>
        <div className="col-span-1 space-y-1">
          <label className={labelClass}>Last Name{requiredStar}</label>
          <input type="text" name="lastName" value={formData.lastName || ""} onChange={handleChange} className="full-input-sm" placeholder="Dela Cruz" />
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 space-y-1">
          <label className={labelClass}>Birthdate{requiredStar}</label>
          <input type="date" name="birthdate" value={formData.birthdate || ""} onChange={handleChange} max={today} className="full-input-sm" />
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Age</label>
          <input type="text" value={formData.age || ""} readOnly className={`full-input-sm text-center font-bold ${formData.age === 'Invalid' ? 'text-rose-500' : 'text-green-600'}`} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={labelClass}>Gender{requiredStar}</label>
          <select name="gender" value={formData.gender || ""} onChange={handleChange} className="full-input-sm">
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Nationality</label>
          <input type="text" name="nationality" value={formData.nationality || ""} onChange={handleChange} className="full-input-sm" placeholder="Filipino" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={labelClass}>Marital Status</label>
          <select name="maritalStatus" value={formData.maritalStatus || ""} onChange={handleChange} className="full-input-sm">
            <option value="">Select</option>
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
          <select name="sector" value={formData.sector || ""} onChange={handleChange} className={`full-input-sm ${parseInt(formData.age) >= 60 ? 'border-amber-500 bg-amber-50/10' : ''}`}>
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

      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-1">
          <label className={labelClass}>Birth Registration{requiredStar}</label>
          <select name="birthRegistration" value={formData.birthRegistration || ""} onChange={handleChange} className="full-input-sm">
            <option value="">Select</option>
            <option value="Registered">Registered</option>
            <option value="Not Registered">Not Registered</option>
          </select>
        </div>
      </div>

      <div className={`flex items-center gap-3 p-4 rounded-2xl ${isDarkMode ? "bg-slate-800/70" : "bg-slate-50"}`}>
        <input type="checkbox" id="isVoter" name="isVoter" checked={formData.isVoter || false} onChange={handleChange} className="w-5 h-5 rounded accent-green-600" />
        <label htmlFor="isVoter" className={`text-xs font-bold ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
          I am a registered voter in this barangay
        </label>
      </div>

      <button
        type="button"
        disabled={!isValid}
        onClick={() => setStep(2)}
        className="w-full py-4 bg-emerald-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest disabled:opacity-30 transition-all hover:bg-emerald-800"
      >
        Continue to Address
      </button>
    </div>
  );
};

export default Step1PersonalInfo;
