/**
 * Step2Address.jsx
 * FIXED: Shows specific reason why Next is disabled (same pattern as Step1).
 * FIXED: Guide text for Head/non-Head household position.
 * FIXED: Residency date 6-month rule validation with error messages.
 * All original logic preserved.
 */

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Home, UserCheck, Search, MapPin, X, AlertCircle, Info } from 'lucide-react';

const Step2Address = ({
  formData,
  handleChange,
  isDarkMode,
  setStep,
  streets = [],
  purokList = [],
  handleHouseNumberChange,
  addressExists,
  householdHeadData,
  addressSearch,
  setAddressSearch,
  addressSuggestions = [],
  selectAddress,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef    = useRef(null);
  const suggestionRefs = useRef([]);

  const labelClass   = `text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`;
  const requiredStar = <span className="text-rose-500 ml-0.5">*</span>;
  const todayStr     = new Date().toISOString().split('T')[0];

  // Auto-scroll selected suggestion into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedIndex]);

  // If address already has a Head, clear "Head" from position
  useEffect(() => {
    if (addressExists && formData.householdPosition === 'Head') {
      handleChange({ target: { name: 'householdPosition', value: '' } });
    }
  }, [addressExists, formData.householdPosition]);

  const filteredStreets = (streets || []).filter(s => {
    if (!s || !s.purok_id) return false;
    return s.purok_id.toString() === formData.purok?.toString();
  });

  // ── RESIDENCY DATE VALIDATION ──────────────────────────────────────────
  const today        = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(today.getMonth() - 6);

  const getDateValidationState = () => {
    if (!formData.residencyStartDate || !formData.residencyStatus) return 'empty';
    const selected = new Date(formData.residencyStartDate);
    if (selected > today) return 'future';
    if (formData.residencyStatus === 'New Resident') return selected >= sixMonthsAgo ? 'valid' : 'mismatch_new';
    if (formData.residencyStatus === 'Old Resident') return selected < sixMonthsAgo  ? 'valid' : 'mismatch_old';
    return 'valid';
  };

  const dateState   = getDateValidationState();
  const isDateValid = dateState === 'valid' || dateState === 'empty';

  const dateErrorMessages = {
    future:       'Date cannot be in the future.',
    mismatch_new: 'For "New Resident", date must be within the last 6 months.',
    mismatch_old: 'For "Old Resident", date must be more than 6 months ago.',
  };

  // ── KEYBOARD NAVIGATION ────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (addressSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < addressSuggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      selectAddress(addressSuggestions[selectedIndex]);
      setSelectedIndex(-1);
    } else if (e.key === 'Escape') {
      setAddressSearch('');
      setSelectedIndex(-1);
    }
  };

  const positions = [
    { value: 'Head',     label: 'Head of Family' },
    { value: 'Spouse',   label: 'Spouse' },
    { value: 'Son',      label: 'Son' },
    { value: 'Daughter', label: 'Daughter' },
    { value: 'Relative', label: 'Relative' },
    { value: 'Others',   label: 'Others' },
  ];

  const filteredPositions = addressExists
    ? positions.filter(p => p.value !== 'Head')
    : positions;

  const isAddressComplete = formData.houseNumber?.trim() && formData.street && formData.purok;

  const isHeadSurveyComplete =
    formData.householdPosition !== 'Head' ||
    addressExists ||
    (formData.tenureStatus && formData.wallMaterial && formData.roofMaterial);

  const isStep2Valid =
    isAddressComplete &&
    formData.householdPosition &&
    formData.residencyStatus &&
    formData.residencyStartDate &&
    dateState === 'valid' &&
    isHeadSurveyComplete;

  // ── MISSING FIELD REASON (same pattern as Step1) ──────────────────────
  const disabledReason = useMemo(() => {
    if (!isAddressComplete) {
      const missing = [];
      if (!formData.houseNumber?.trim()) missing.push('House No.');
      if (!formData.purok)              missing.push('Purok');
      if (!formData.street)             missing.push('Street');
      return `Missing: ${missing.join(', ')}`;
    }
    if (!formData.householdPosition) return 'Missing: Position in Household';
    if (!formData.residencyStatus)   return 'Missing: Residency Type';
    if (!formData.residencyStartDate) return 'Missing: Date Started Residency';
    if (dateState !== 'valid')       return `Date error: ${dateErrorMessages[dateState]}`;
    if (!isHeadSurveyComplete) {
      const missing = [];
      if (!formData.tenureStatus)  missing.push('Housing Status');
      if (!formData.wallMaterial)  missing.push('Wall Material');
      if (!formData.roofMaterial)  missing.push('Roof Material');
      return `Missing: ${missing.join(', ')}`;
    }
    return null;
  }, [formData, isAddressComplete, dateState, isHeadSurveyComplete]);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-300">

      {/* 1. QUICK ADDRESS LOOKUP */}
      <div className="relative group">
        <label className={labelClass}>Search Registered Household Address</label>
        <div className="relative mt-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={addressSearch}
            onKeyDown={handleKeyDown}
            onChange={(e) => { setAddressSearch(e.target.value); setSelectedIndex(-1); }}
            placeholder="Type House No. or Street name..."
            className={`w-full pl-11 pr-10 py-3.5 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 transition-all ${
              isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'
            }`}
          />
          {addressSearch && (
            <button
              type="button"
              onClick={() => { setAddressSearch(''); setSelectedIndex(-1); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <p className={`text-[9px] font-bold mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Search to autofill Purok, Street, and House No. from existing records.
        </p>

        {/* Suggestions Dropdown */}
        {addressSuggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-[60] w-full mt-2 bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto"
          >
            {addressSuggestions.map((addr, idx) => (
              <button
                key={idx}
                ref={el => suggestionRefs.current[idx] = el}
                type="button"
                onClick={() => selectAddress(addr)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full flex items-start gap-3 p-4 text-left border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors ${
                  selectedIndex === idx
                    ? 'bg-emerald-50 dark:bg-emerald-900/40 ring-1 ring-inset ring-emerald-500'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className={`p-2 rounded-lg ${selectedIndex === idx ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-emerald-500'}`}>
                  <MapPin size={14} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">
                    No. {addr.house_number} — {addr.street_name}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Purok {addr.purok_name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={`h-px my-2 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />

      {/* 2. PRIMARY ADDRESS FIELDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={labelClass}>House No.{requiredStar}</label>
          <input
            type="text"
            name="houseNumber"
            value={formData.houseNumber || ''}
            onChange={handleHouseNumberChange}
            className="full-input-sm"
            placeholder="e.g. 123-A"
          />
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Purok{requiredStar}</label>
          <select name="purok" value={formData.purok || ''} onChange={handleChange} className="full-input-sm">
            <option value="">Select Purok</option>
            {(purokList || []).map(p => (
              <option key={p.id} value={p.id?.toString()}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={labelClass}>Street{requiredStar}</label>
          <select
            name="street"
            value={formData.street || ''}
            disabled={!formData.purok}
            onChange={handleChange}
            className="full-input-sm disabled:opacity-30"
          >
            <option value="">Select Street</option>
            {filteredStreets.map(s => (
              <option key={s.id} value={s.id?.toString()}>{s.name}</option>
            ))}
          </select>
          {!formData.purok && (
            <p className="text-[9px] text-amber-600 font-bold uppercase mt-1">
              ↑ Select a Purok first to load streets
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className={labelClass}>Position in Household{requiredStar}</label>
          <select
            name="householdPosition"
            value={formData.householdPosition || ''}
            onChange={handleChange}
            disabled={!isAddressComplete}
            className="full-input-sm disabled:opacity-40"
          >
            <option value="">
              {!isAddressComplete ? 'Complete address first...' : 'Select Position'}
            </option>
            {filteredPositions.map(pos => (
              <option key={pos.value} value={pos.value}>{pos.label}</option>
            ))}
          </select>

          {/* Guide: address already has a Head */}
          {addressExists && isAddressComplete && (
            <div className="flex items-start gap-2 mt-1.5 p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700">
              <AlertCircle size={12} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase leading-tight">
                This address already has a Head of Family
                {householdHeadData && ` (${householdHeadData})`}.
                {' '}Please select a different position.
              </p>
            </div>
          )}

          {/* Guide: new address, no Head yet */}
          {!addressExists && isAddressComplete && !formData.householdPosition && (
            <div className="flex items-start gap-2 mt-1.5 p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-700">
              <Info size={12} className="text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase leading-tight">
                No existing household at this address. If this person owns or leads the home, select "Head of Family".
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. HOUSING SURVEY (only for new Heads) */}
      {formData.householdPosition === 'Head' && !addressExists && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 animate-in zoom-in-95 duration-200">
          <div className="col-span-full mb-1 flex items-center gap-2">
            <Home size={12} className="text-emerald-600" />
            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">New Household — Housing Survey</p>
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Housing Status{requiredStar}</label>
            <select name="tenureStatus" value={formData.tenureStatus || ''} onChange={handleChange} className="full-input-sm">
              <option value="">Select Status</option>
              <option value="Owned">Owned</option>
              <option value="Rented">Rented</option>
              <option value="Sharer">Sharer</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Wall Material{requiredStar}</label>
            <select name="wallMaterial" value={formData.wallMaterial || ''} onChange={handleChange} className="full-input-sm">
              <option value="">Select Material</option>
              <option value="Concrete">Concrete</option>
              <option value="Wood">Wood</option>
              <option value="Half Concrete">Half Concrete</option>
              <option value="Makeshift">Makeshift</option>
            </select>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className={labelClass}>Roof Material{requiredStar}</label>
            <select name="roofMaterial" value={formData.roofMaterial || ''} onChange={handleChange} className="full-input-sm">
              <option value="">Select Material</option>
              <option value="G.I. Sheet">G.I. Sheet</option>
              <option value="Concrete Slab">Concrete Slab</option>
              <option value="Tile">Tile</option>
              <option value="Makeshift">Makeshift</option>
            </select>
          </div>
        </div>
      )}

      {/* 4. RESIDENCY TYPE & DATE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <div className="space-y-1">
          <label className={labelClass}>Residency Type{requiredStar}</label>
          <select name="residencyStatus" value={formData.residencyStatus || ''} onChange={handleChange} className="full-input-sm">
            <option value="">Select Type</option>
            <option value="Old Resident">Old Resident — living here 6+ months</option>
            <option value="New Resident">New Resident — moved within 6 months</option>
          </select>
          {formData.residencyStatus === 'Old Resident' && (
            <p className={`text-[9px] font-bold mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Start date must be <strong>more than 6 months ago</strong>.
            </p>
          )}
          {formData.residencyStatus === 'New Resident' && (
            <p className={`text-[9px] font-bold mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Start date must be <strong>within the last 6 months</strong>.
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className={labelClass}>Date Started Residency{requiredStar}</label>
          <input
            type="date"
            name="residencyStartDate"
            value={formData.residencyStartDate || ''}
            onChange={handleChange}
            max={todayStr}
            className={`full-input-sm ${
              formData.residencyStartDate && dateState !== 'valid' && dateState !== 'empty'
                ? 'border-rose-500 ring-2 ring-rose-500/20'
                : ''
            }`}
          />
          <p className={`text-[9px] font-bold mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Format: MM/DD/YYYY — use the calendar picker or type directly.
          </p>
          {formData.residencyStartDate && dateState !== 'valid' && dateState !== 'empty' && (
            <div className="flex items-start gap-1.5 mt-1 p-2 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-200 dark:border-rose-700">
              <AlertCircle size={11} className="text-rose-500 shrink-0 mt-0.5" />
              <p className="text-[9px] font-bold text-rose-600 dark:text-rose-400 leading-tight">
                {dateErrorMessages[dateState]}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 5. NAVIGATION */}
      <div className="space-y-2 pt-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all dark:bg-slate-900 dark:border-white/10 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Back
          </button>
          <button
            type="button"
            disabled={!isStep2Valid}
            onClick={() => setStep(3)}
            className="sm:flex-[2] py-4 bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-30 transition-all hover:bg-emerald-800 shadow-lg shadow-emerald-900/20"
          >
            Next Step
          </button>
        </div>

        {/* Reason why Next is disabled */}
        {!isStep2Valid && disabledReason && (formData.purok || formData.houseNumber || formData.residencyStatus) && (
          <p className={`text-[9px] font-bold text-center uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            ⚠ {disabledReason}
          </p>
        )}
      </div>
    </div>
  );
};

export default Step2Address;