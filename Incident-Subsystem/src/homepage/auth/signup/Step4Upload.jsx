import React from "react";

const Step4Upload = ({ formData, handleChange, isDarkMode, setStep, previews, handleFile, onReviewSubmit, loading = false }) => {
  const labelClass = `text-[10px] font-black uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`;

  const hasFront = previews.front !== null;
  const hasBack = previews.back !== null;
  
  const contactStr = formData.contact ? String(formData.contact).replace(/\D/g, "") : "";
  
 
  const isContactValid = contactStr.length === 11 && contactStr.startsWith("09");
  const isReady = hasFront && hasBack && isContactValid && !loading;

  const handleContactChange = (e) => {
    let val = e.target.value.replace(/\D/g, ""); 
    
    
    if (val.length <= 2) {
      val = "09";
    } else if (!val.startsWith("09")) {
    
      val = "09" + val.slice(0, 9);
    }

    // Limit to 11 digits
    if (val.length <= 11) {
      handleChange({ target: { name: "contact", value: val } });
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* ID Upload Section - (Same as before) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {["idFront", "idBack"].map((fieldName) => {
          const side = fieldName === "idFront" ? "front" : "back";
          const hasImage = !!previews[side];
          return (
            <div key={fieldName} className="space-y-1">
              <label className={labelClass}>{side.toUpperCase()} ID Image *</label>
              <div className={`relative h-28 border-2 border-dashed rounded-2xl flex items-center justify-center overflow-hidden transition-all ${!hasImage ? "border-rose-200 bg-rose-50/10" : "border-emerald-500 bg-emerald-50/10"}`}>
                {previews[side] ? <img src={previews[side]} className="w-full h-full object-cover" alt={`${side} preview`} /> : <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Click to upload</p>}
                <input type="file" name={fieldName} accept="image/jpeg,image/png,image/jpg" onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) { handleFile(e, side); handleChange({ target: { name: fieldName, value: file } }); }
                }} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Contact Number Section */}
      <div className="space-y-1">
        <label className={labelClass}>Contact Number *</label>
        <input
          type="text"
          name="contact"
          value={formData.contact || "09"} // Default value is 09
          onChange={handleContactChange}
          onFocus={(e) => {
            if (!e.target.value) handleChange({ target: { name: "contact", value: "09" } });
          }}
          placeholder="09XXXXXXXXX"
          className={`w-full p-4 rounded-xl border-2 bg-transparent text-center font-mono tracking-[0.2em] text-lg outline-none transition-all ${
            isDarkMode 
              ? `border-slate-700 text-slate-100 ${isContactValid ? 'focus:border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'focus:border-rose-500'}` 
              : `border-slate-200 text-slate-900 ${isContactValid ? 'focus:border-emerald-500 shadow-lg' : 'focus:border-rose-500'}`
          }`}
        />
        
        <div className="flex justify-between items-center px-1">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
            {isContactValid ? "✓ Valid Number" : "Starts with 09"}
          </p>
          <p className={`text-[10px] font-black ${isContactValid ? 'text-emerald-500' : 'text-rose-500'}`}>
            {contactStr.length}/11 Digits
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="button"
        onClick={() => isReady && onReviewSubmit()}
        disabled={!isReady}
        className={`w-full p-5 rounded-2xl font-black uppercase tracking-widest transition-all ${
          isReady
            ? "bg-emerald-700 text-white shadow-xl hover:bg-emerald-800 active:scale-95"
            : "bg-slate-300 text-slate-500 opacity-50 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600"
        }`}
      >
        {loading ? "Submitting..." : isReady ? "Review Information" : "Complete All Fields"}
      </button>

      <button type="button" onClick={() => setStep(3)} className="w-full py-2 font-black text-[9px] uppercase text-slate-500">
        Back
      </button>
    </div>
  );
};

export default Step4Upload;