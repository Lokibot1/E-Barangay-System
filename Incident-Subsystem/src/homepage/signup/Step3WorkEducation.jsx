/**
 * Step3WorkEducation.jsx
 *
 * FIXED: 
 * - Added indigency toggle (staff mode + head only)
 * - Converted Highest Grade level to a dropdown with "N/A" as default
 * - Fixed styling to match other inputs
 */

import React from 'react';
import { ChevronRight, ChevronLeft, ShieldAlert } from 'lucide-react';

const EMPLOYMENT_STATUSES = [
  'Employed', 'Self-Employed', 'Unemployed', 'Student',
  'Retired', 'PWD', 'OFW', 'N/A',
];

const INCOME_SOURCES = [
  'Employment', 'Business', 'Remittance', 'Investments', 'Others', 'N/A',
];

const INCOME_RANGES = [
  'No Income', 'Below 5,000', '5,001-10,000', '10,001-20,000',
  '20,001-40,000', '40,001-70,000', '70,001-100,000', 'Above 100,000',
];

const EDU_STATUSES  = ['Currently Studying', 'Graduated', 'Not Studying', 'N/A'];
const SCHOOL_TYPES  = ['Public', 'Private', 'N/A'];
const SCHOOL_LEVELS = [
  'Pre-School', 'Elementary', 'Junior High School',
  'Senior High School', 'College', 'Vocational', 'Masteral', 'N/A',
];

const HIGHEST_GRADE_OPTIONS = [
  'N/A',
  'No Formal Education',
  'Elementary Undergraduate',
  'Elementary Graduate',
  'High School Undergraduate',
  'High School Graduate',
  'College Undergraduate',
  'College Graduate',
  'Vocational Graduate',
  'Post Graduate'
];

const Step3WorkEducation = ({
  formData,
  handleChange,
  isDarkMode,
  setStep,
  isStaffMode = false,
  onNext,
  // Indigency props — passed from SignupForm
  isHead       = false,
  isIndigent   = 0,
  setIsIndigent = () => {},
}) => {

  const labelClass = `block text-[10px] font-black uppercase tracking-[0.22em] mb-1.5 font-kumbh ${
    isDarkMode ? 'text-slate-400' : 'text-slate-500'
  }`;
  const inputClass = `w-full px-4 py-3 rounded-2xl border text-sm font-medium font-kumbh transition-all outline-none focus:ring-2 focus:ring-emerald-500/40 ${
    isDarkMode
      ? 'bg-slate-800 border-white/10 text-white placeholder-slate-500'
      : 'bg-white border-black/10 text-slate-900 placeholder-slate-400'
  }`;
  const selectClass = inputClass;

  const handleNext = () => {
    if (onNext) onNext();
    else setStep(isStaffMode ? null : 4);
  };

  return (
    <div className="space-y-8">

      {/* ── Employment ─────────────────────────────────────────────────────── */}
      <div>
        <h3 className={`text-xs font-black uppercase tracking-[0.3em] mb-4 font-kumbh ${
          isDarkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Employment
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Work Status</label>
            <select
              name="employmentStatus"
              value={formData.employmentStatus || ''}
              onChange={handleChange}
              className={selectClass}
            >
              <option value="">Select status</option>
              {EMPLOYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Occupation</label>
            <input
              name="occupation"
              value={formData.occupation || ''}
              onChange={handleChange}
              placeholder="e.g. Teacher, Driver"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Income Source</label>
            <select
              name="incomeSource"
              value={formData.incomeSource || ''}
              onChange={handleChange}
              className={selectClass}
            >
              <option value="">Select source</option>
              {INCOME_SOURCES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Monthly Income</label>
            <select
              name="monthlyIncome"
              value={formData.monthlyIncome || ''}
              onChange={handleChange}
              className={selectClass}
            >
              <option value="">Select range</option>
              {INCOME_RANGES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Education ──────────────────────────────────────────────────────── */}
      <div>
        <h3 className={`text-xs font-black uppercase tracking-[0.3em] mb-4 font-kumbh ${
          isDarkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Education
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Educational Status</label>
            <select
              name="educationalStatus"
              value={formData.educationalStatus || ''}
              onChange={handleChange}
              className={selectClass}
            >
              <option value="">Select status</option>
              {EDU_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>School Type</label>
            <select
              name="schoolType"
              value={formData.schoolType || ''}
              onChange={handleChange}
              className={selectClass}
            >
              <option value="">Select type</option>
              {SCHOOL_TYPES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>School Level</label>
            <select
              name="schoolLevel"
              value={formData.schoolLevel || ''}
              onChange={handleChange}
              className={selectClass}
            >
              <option value="">Select level</option>
              {SCHOOL_LEVELS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Highest Grade Level</label>
            <select 
              name="highestGrade" 
              value={formData.highestGrade || "N/A"} 
              onChange={handleChange} 
              className={selectClass}
            >
              {HIGHEST_GRADE_OPTIONS.map((grade) => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Indigency Toggle — staff + Head only ───────────────────────────── */}
      {isStaffMode && isHead && (
        <div>
          <h3 className={`text-xs font-black uppercase tracking-[0.3em] mb-4 ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Household Classification
          </h3>

          <button
            type="button"
            onClick={() => setIsIndigent((prev) => (prev ? 0 : 1))}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all ${
              isIndigent
                ? 'bg-amber-50 border-amber-400 dark:bg-amber-900/20 dark:border-amber-500'
                : isDarkMode
                  ? 'bg-slate-800 border-white/10 hover:border-white/20'
                  : 'bg-white border-black/10 hover:border-black/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldAlert
                size={18}
                className={isIndigent ? 'text-amber-500' : isDarkMode ? 'text-slate-500' : 'text-slate-400'}
              />
              <div className="text-left">
                <p className={`text-sm font-black uppercase tracking-wide ${
                  isIndigent
                    ? 'text-amber-700 dark:text-amber-400'
                    : isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  {isIndigent ? 'Marked as Indigent' : 'Non-Indigent Household'}
                </p>
                <p className={`text-[10px] font-medium mt-0.5 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {isIndigent
                    ? 'This household qualifies for indigent programs'
                    : 'Click to mark this household as indigent'}
                </p>
              </div>
            </div>

            {/* Toggle pill */}
            <div className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
              isIndigent ? 'bg-amber-400' : isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
            }`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                isIndigent ? 'left-[26px]' : 'left-0.5'
              }`} />
            </div>
          </button>
        </div>
      )}

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => setStep(2)}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl border text-[11px] font-black uppercase tracking-widest transition-all ${
            isDarkMode
              ? 'border-white/10 text-slate-300 hover:bg-white/5'
              : 'border-black/10 text-slate-600 hover:bg-black/5'
          }`}
        >
          <ChevronLeft size={14} /> Back
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95"
        >
          {isStaffMode ? 'Review & Submit' : 'Next'} <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default Step3WorkEducation;