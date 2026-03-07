import React from 'react';

const Step3WorkEducation = ({ formData, handleChange, isDarkMode, setStep }) => {
  const labelClass = `text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`;
  const requiredStar = <span className="text-rose-500 ml-0.5">*</span>;

  const isStep3Valid = 
    formData.educationalStatus && 
    formData.highestGrade && 
    formData.employmentStatus && 
    formData.monthlyIncome;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-300">
      <p className="text-xs font-black text-green-600 uppercase tracking-widest">Education Information</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={labelClass}>Educational Status{requiredStar}</label>
          <select name="educationalStatus" value={formData.educationalStatus || ""} onChange={handleChange} className="full-input-sm">
            <option value="">Select</option>
            <option value="Currently Studying">Currently Studying</option>
            <option value="Graduated">Graduated</option>
            <option value="Not Studying">Not Studying</option>
            <option value="N/A">N/A</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>School Type</label>
          <select name="schoolType" value={formData.schoolType || ""} onChange={handleChange} className="full-input-sm">
            <option value="">Select</option>
            <option value="Public">Public</option>
            <option value="Private">Private</option>
            <option value="N/A">N/A</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>School Level</label>
          <select name="schoolLevel" value={formData.schoolLevel || ""} onChange={handleChange} className="full-input-sm">
            <option value="">Select</option>
            <option value="Elementary">Elementary</option>
            <option value="Junior High School">Junior High School</option>
            <option value="Senior High School">Senior High School</option>
            <option value="College">College</option>
            <option value="Vocational">Vocational</option>
            <option value="Graduate School">Masteral / Doctorate</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Highest Grade{requiredStar}</label>
          <select name="highestGrade" value={formData.highestGrade || ""} onChange={handleChange} className="full-input-sm">
            <option value="">Select</option>
            <option value="No Formal Education">No Formal Education</option>
            <option value="Elementary Undergraduate">Elementary Undergraduate</option>
            <option value="Elementary Graduate">Elementary Graduate</option>
            <option value="High School Undergraduate">High School Undergraduate</option>
            <option value="High School Graduate">High School Graduate</option>
            <option value="College Undergraduate">College Undergraduate</option>
            <option value="College Graduate">College Graduate</option>
            <option value="Vocational Graduate">Vocational Graduate</option>
            <option value="Post Graduate">Post Graduate</option>
          </select>
        </div>
      </div>

      <div className={`h-px my-2 ${isDarkMode ? "bg-slate-700" : "bg-slate-200"}`} />

      <p className="text-xs font-black text-green-600 uppercase tracking-widest">Economic Activity</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={labelClass}>Work Status{requiredStar}</label>
          <select name="employmentStatus" value={formData.employmentStatus || ""} onChange={handleChange} className="full-input-sm">
            <option value="">Select Status</option>
            <option value="Permanent">Permanent</option>
            <option value="Contractual">Contractual</option>
            <option value="Shared">Shared</option>
            <option value="Business Owner">Business Owner</option>
            <option value="Self-Employed">Self-Employed</option>
            <option value="N/A">N/A</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Occupation</label>
          <input type="text" name="occupation" value={formData.occupation || ""} onChange={handleChange} className="full-input-sm" placeholder="e.g. Teacher, Driver" />
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Income Source</label>
          <select name="incomeSource" value={formData.incomeSource || ""} onChange={handleChange} className="full-input-sm">
            <option value="">Select Source</option>
            <option value="Employment">Employment</option>
            <option value="Business">Business</option>
            <option value="Remittance">Remittance</option>
            <option value="Investments">Investments</option>
            <option value="Others">Others</option>
            <option value="N/A">N/A</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Monthly Income{requiredStar}</label>
          <select name="monthlyIncome" value={formData.monthlyIncome || ""} onChange={handleChange} className="full-input-sm">
            <option value="">Select Range</option>
            <option value="No Income">No Income</option>
            <option value="Below 5,000">Below 5,000</option>
            <option value="5,001-10,000">5,001-10,000</option>
            <option value="10,001-20,000">10,001-20,000</option>
            <option value="20,001-40,000">20,001-40,000</option>
            <option value="40,001-70,000">40,001-70,000</option>
            <option value="70,001-100,000">70,001-100,000</option>
            <option value="Above 100,000">Above 100,000</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 pt-4">
        <button
          type="button"
          onClick={() => setStep(2)}
          className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border transition-colors ${
            isDarkMode
              ? "bg-slate-900 border-white/10 text-slate-200 hover:bg-slate-800"
              : "bg-slate-100 border-black/10 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Back
        </button>
        <button
          type="button"
          disabled={!isStep3Valid}
          onClick={() => setStep(4)}
          className="sm:flex-[2] py-4 bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-30 transition-colors hover:bg-emerald-800"
        >
          Next: ID Upload
        </button>
      </div>
    </div>
  );
};

export default Step3WorkEducation;
