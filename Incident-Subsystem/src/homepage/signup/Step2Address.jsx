import React, { useEffect } from 'react';

const Step2Address = ({ 
  formData, 
  handleChange, 
  isDarkMode, 
  setStep, 
  streets = [], 
  purokList = [], 
  handleHouseNumberChange,
  addressExists 
}) => {
  const labelClass = `text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`;
  const requiredStar = <span className="text-rose-500 ml-0.5">*</span>;
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (addressExists && formData.householdPosition === "Head") {
      const event = {
        target: {
          name: 'householdPosition',
          value: ''
        }
      };
      handleChange(event);
    }
  }, [addressExists, formData.householdPosition, handleChange]);

  const onHouseNumberInput = (e) => {
    let val = e.target.value.toUpperCase(); 
    val = val.replace(/[^0-9A-Z-]/g, '');   

    if (val.length > 0 && !/^\d/.test(val)) {
      val = '';
    }

    if (/^\d+[A-Z]$/.test(val)) {
      const match = val.match(/^(\d+)([A-Z])$/);
      if (match) val = `${match[1]}-${match[2]}`;
    }

    e.target.value = val;
    handleHouseNumberChange(e);
  };

  const validateDate = () => {
    if (!formData.residencyStartDate || !formData.residencyStatus) return false;
    const selected = new Date(formData.residencyStartDate);
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    if (selected > now) return false; 
    if (formData.residencyStatus === "New Resident") return selected >= sixMonthsAgo; 
    if (formData.residencyStatus === "Old Resident") return selected < sixMonthsAgo; 
    return true;
  };

  const isDateValid = validateDate();

  const positions = [
    { value: "Head", label: "Head of Family" },
    { value: "Spouse", label: "Spouse" },
    { value: "Son", label: "Son" },
    { value: "Daughter", label: "Daughter" },
    { value: "Relative", label: "Relative" },
    { value: "Others", label: "Others" }
  ];

  const filteredPositions = addressExists 
    ? positions.filter(p => p.value !== "Head") 
    : positions;

  const isAddressComplete = formData.houseNumber?.trim() && formData.street && formData.purok;

  const getStreetName = () => {
    if (!formData.street || !streets.length) return '';
    const street = streets.find(s => s.id.toString() === formData.street.toString());
    return street ? street.name : '';
  };

  const getPurokDisplay = () => {
    if (!formData.purok || !purokList?.length) return '';
    const purok = purokList.find(p => p.id.toString() === formData.purok.toString());
    return purok ? (purok.number || purok.name) : formData.purok;
  };

  const fullAddress = `${formData.houseNumber || ''} ${getStreetName()}, PUROK ${getPurokDisplay()}, BRGY. GULOD NOVALICHES QUEZON CITY`.trim();

  const isStep2Valid = 
    isAddressComplete && 
    formData.householdPosition && 
    formData.residencyStatus && 
    isDateValid && 
    (formData.householdPosition === "Head" 
      ? (formData.tenureStatus && formData.wallMaterial && formData.roofMaterial)
      : true);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-300">
      
      {/* 1. PRIMARY ADDRESS FIELDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={labelClass}>House No.{requiredStar}</label>
          <input 
            type="text" 
            name="houseNumber" 
            value={formData.houseNumber || ""} 
            onChange={onHouseNumberInput} 
            className="full-input-sm" 
            placeholder="Ex: 123-A" 
          />
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Purok{requiredStar}</label>
          <select name="purok" value={formData.purok || ""} onChange={handleChange} className="full-input-sm">
            <option value="">Select Purok</option>
            {purokList.map(p => (
              <option key={p.id} value={p.id.toString()}>
                {p.name || `Purok ${p.number}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. STREET & HOUSEHOLD POSITION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={labelClass}>Street{requiredStar}</label>
          <select 
            name="street" 
            value={formData.street || ""} 
            disabled={!formData.purok} 
            onChange={handleChange} 
            className="full-input-sm disabled:opacity-30"
          >
            <option value="">Select Street</option>
            {streets.map(s => (
              <option key={s.id} value={s.id.toString()}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className={labelClass}>Household Position{requiredStar}</label>
          <select 
            name="householdPosition" 
            value={formData.householdPosition || ""} 
            onChange={handleChange} 
            disabled={!isAddressComplete} 
            className={`full-input-sm transition-colors ${
              !isAddressComplete 
                ? "opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-900/50" 
                : addressExists ? "border-amber-500/50 focus:ring-amber-500" : ""
            }`}
          >
            <option value="">
              {!isAddressComplete ? "Waiting for address..." : "Select Position"}
            </option>
            {filteredPositions.map(pos => (
              <option key={pos.value} value={pos.value}>{pos.label}</option>
            ))}
          </select>
          {addressExists && isAddressComplete && (
            <p className="text-[9px] text-amber-600 font-bold leading-tight mt-1 px-1">
              ⚠️ Address already has a registered Head.
            </p>
          )}
        </div>
      </div>

      {/* 3. HOUSING SURVEY (Only for Head) */}
      {formData.householdPosition === "Head" && !addressExists && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
          <div className="col-span-full mb-1 flex justify-between items-center">
            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Housing Survey</p>
            <span className="text-[9px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 px-2 py-0.5 rounded-full font-bold">Required for Head</span>
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Housing Status</label>
            <select name="tenureStatus" value={formData.tenureStatus || ""} onChange={handleChange} className="full-input-sm">
              <option value="">Select Status</option>
              <option value="Owned">Owned</option>
              <option value="Rented">Rented</option>
              <option value="Sharer">Sharer</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Wall Material</label>
            <select name="wallMaterial" value={formData.wallMaterial || ""} onChange={handleChange} className="full-input-sm">
              <option value="">Select Material</option>
              <option value="Concrete">Concrete</option>
              <option value="Wood">Wood</option>
              <option value="Half Concrete">Half Concrete</option>
              <option value="Makeshift">Makeshift</option>
            </select>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className={labelClass}>Roof Material</label>
            <select name="roofMaterial" value={formData.roofMaterial || ""} onChange={handleChange} className="full-input-sm">
              <option value="">Select Material</option>
              <option value="G.I. Sheet">G.I. Sheet</option>
              <option value="Concrete Slab">Concrete Slab</option>
              <option value="Tile">Tile</option>
              <option value="Makeshift">Makeshift</option>
            </select>
          </div>
        </div>
      )}

      <hr className="border-slate-100 dark:border-slate-800 my-1" />

      {/* 4. RESIDENCY TYPE & DATE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={labelClass}>Residency Type{requiredStar}</label>
          <select name="residencyStatus" value={formData.residencyStatus || ""} onChange={handleChange} className="full-input-sm">
            <option value="">Select Type</option>
            <option value="Old Resident">Old Resident (6+ mos)</option>
            <option value="New Resident">New Resident (Within 6 mos)</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Date Started{requiredStar}</label>
          <input 
            type="date" 
            name="residencyStartDate" 
            value={formData.residencyStartDate || ""} 
            onChange={handleChange} 
            max={todayStr} 
            className={`full-input-sm ${formData.residencyStartDate && !isDateValid ? 'border-rose-500 ring-2 ring-rose-500/20' : ''}`} 
          />
        </div>
      </div>
      
      {formData.residencyStartDate && !isDateValid && (
        <p className="text-[10px] text-rose-500 font-bold italic px-1">
          Invalid date for {formData.residencyStatus} status.
        </p>
      )}

      {/* 5. LIVE PREVIEW */}
      <div className={`p-4 border rounded-2xl transition-colors ${isStep2Valid ? "bg-emerald-500/5 border-emerald-600/20" : "bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800"}`}>
        <p className={`text-[10px] font-black uppercase leading-tight ${isStep2Valid ? "text-slate-700 dark:text-emerald-400" : "text-slate-400"}`}>
          {isAddressComplete ? fullAddress : "Please complete address fields..."}
        </p>
      </div>

      {/* 6. NAVIGATION */}
      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        <button 
          type="button" 
          onClick={() => setStep(1)} 
          className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all ${
            isDarkMode ? "bg-slate-900 border-white/10 text-slate-200 hover:bg-slate-800" : "bg-slate-100 border-black/10 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Back
        </button>
        <button 
          type="button" 
          disabled={!isStep2Valid} 
          onClick={() => setStep(3)} 
          className="sm:flex-[2] py-4 bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-30 transition-all hover:bg-emerald-800 active:scale-[0.98] shadow-lg shadow-emerald-900/20"
        >
          Next: Education & Work
        </button>
      </div>
    </div>
  );
};

export default Step2Address;