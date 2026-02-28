import React from 'react';

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

  // 1. Base Options
  const positions = [
    { value: "Head", label: "Head of Family" },
    { value: "Spouse", label: "Spouse" },
    { value: "Son", label: "Son" },
    { value: "Daughter", label: "Daughter" },
    { value: "Relative", label: "Relative" },
    { value: "Others", label: "Others" }
  ];

  // 2. REACTIVE FILTERING LOGIC
  // Itatago ang "Head" option kung nalaman ng system na may Head na sa address na iyon
  const filteredPositions = addressExists 
    ? positions.filter(p => p.value !== "Head") 
    : positions;

  // LOCK LOGIC: Dapat kumpleto ang address bago makapili ng position
  const isAddressComplete = formData.houseNumber?.trim() && formData.street && formData.purok;

  // Helpers para sa Live Preview
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

  const fullAddress = `${formData.houseNumber || ''} ${getStreetName()}, PUROK ${getPurokDisplay()}, BRGY. GULOD NOVALICHES`.trim();

  // VALIDATION FOR NEXT BUTTON
  const isStep2Valid = 
    isAddressComplete && 
    formData.householdPosition && 
    formData.residencyStatus && 
    formData.residencyStartDate && 
    (formData.householdPosition === "Head" 
      ? (formData.tenureStatus && formData.wallMaterial && formData.roofMaterial) // Gamitin ang camelCase dito
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
            onChange={handleHouseNumberChange} 
            className="full-input-sm" 
            placeholder="123-A" 
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

      <hr className="border-slate-100 dark:border-slate-800 my-2" />

      {/* 2. HOUSEHOLD POSITION & RESIDENCY TYPE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={labelClass}>Household Position{requiredStar}</label>
          <select 
            name="householdPosition" 
            value={formData.householdPosition || ""} 
            onChange={handleChange} 
            disabled={!isAddressComplete} // LOCK UNTIL ADDRESS IS DONE
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
              <option key={pos.value} value={pos.value}>
                {pos.label}
              </option>
            ))}
          </select>
          
          {addressExists && isAddressComplete && (
            <div className="flex items-start gap-1.5 mt-1 animate-in fade-in slide-in-from-top-1">
              <span className="text-amber-600 text-[10px]">⚠️</span>
              <p className="text-[9px] text-amber-600 font-bold leading-tight">
                Address already has a registered Head. "Head of Family" is hidden.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label className={labelClass}>Residency Type{requiredStar}</label>
          <select name="residencyStatus" value={formData.residencyStatus || ""} onChange={handleChange} className="full-input-sm">
            <option value="">Select Type</option>
            <option value="Old Resident">Old Resident</option>
            <option value="New Resident">New Resident</option>
          </select>
        </div>
      </div>

      {/* 3. CONDITIONAL HOUSING DETAILS (Only for Head) */}
      {formData.householdPosition === "Head" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
          <div className="col-span-full mb-1 flex justify-between items-center">
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">New Household Survey</p>
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

      {/* 4. DATE STARTED */}
      <div className="space-y-1">
          <label className={labelClass}>Date Started Residency{requiredStar}</label>
          <input 
            type="date" 
            name="residencyStartDate" 
            value={formData.residencyStartDate || ""} 
            onChange={handleChange} 
            max={new Date().toISOString().split("T")[0]} 
            className="full-input-sm" 
          />
      </div>

      {/* 5. LIVE PREVIEW */}
      <div className={`p-4 border rounded-2xl transition-colors ${isStep2Valid ? "bg-emerald-500/5 border-emerald-600/20" : "bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800"}`}>
        <p className={`text-[10px] font-black uppercase leading-tight ${isStep2Valid ? "text-slate-700 dark:text-emerald-400" : "text-slate-400"}`}>
          {isStep2Valid ? fullAddress : "Please complete the required address fields..."}
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
          className="sm:flex-[2] py-4 bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-30 transition-all hover:bg-emerald-800 active:scale-[0.98]"
        >
          Next: Education & Work
        </button>
      </div>
    </div>
  );
};

export default Step2Address;