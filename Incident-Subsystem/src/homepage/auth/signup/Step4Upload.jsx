import React, { useState } from "react";
import {Image} from "lucide-react";

const Step4Upload = ({ formData, handleChange, isDarkMode, setStep, previews, handleFile, onReviewSubmit, loading = false }) => {
  const [agreed, setAgreed] = useState(false);
  
  // UI Configuration
  const labelClass = `text-[11px] font-black uppercase tracking-widest ${isDarkMode ? "text-slate-400" : "text-slate-500"}`;
  
  const hasFront = !!previews?.front;
  const hasBack = !!previews?.back;
  
  const contactStr = formData.contact ? String(formData.contact).replace(/\D/g, "") : "";
  const isContactValid = contactStr.length === 11 && contactStr.startsWith("09");

  const isReady = hasFront && hasBack && isContactValid && agreed && !loading;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. DOCUMENT UPLOAD SECTION */}
      <section className="space-y-3">
        <header className="flex justify-between items-end px-1">
          <h3 className={labelClass}>Identification Documents</h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
            hasFront && hasBack ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
          }`}>
            {hasFront && hasBack ? "✓ Requirements Met" : "Required: 2 Photos"}
          </span>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {["idFront", "idBack"].map((fieldName) => {
            const side = fieldName === "idFront" ? "front" : "back";
            const hasImage = !!previews[side];
            
            return (
              <div key={fieldName} className="group relative">
                <label className={`
                  relative h-40 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center 
                  overflow-hidden transition-all duration-300 cursor-pointer
                  ${!hasImage 
                    ? "border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 hover:border-emerald-500" 
                    : "border-emerald-500 bg-emerald-50/10 dark:bg-emerald-500/5"}
                `}>
                  {previews[side] ? (
                    <>
                      <img src={previews[side]} className="w-full h-full object-cover" alt="ID Preview" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                        <span className="text-white text-[10px] font-black uppercase tracking-widest bg-emerald-600 px-3 py-2 rounded-xl shadow-lg">Change Photo</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-white dark:bg-slate-800 shadow-sm rounded-2xl flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                        <span className="text-2xl"><Image size={16}/></span>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                          Upload {side} ID
                        </p>
                        <p className="text-[9px] text-slate-400 italic mt-0.5 font-bold">Max 5MB • JPG/PNG</p>
                      </div>
                    </div>
                  )}
                  
                  <input 
                    type="file" 
                    name={fieldName} 
                    id={fieldName} // Added ID
                    accept="image/jpeg,image/png,image/jpg" 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleFile(e, side);
                        handleChange({ target: { name: fieldName, value: file } }); 
                      }
                    }} 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  />
                </label>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. DATA PRIVACY AGREEMENT */}
      <section className={`
        p-5 rounded-3xl border-2 transition-all duration-300
        ${agreed 
          ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-500/5 shadow-lg shadow-emerald-900/5" 
          : "border-slate-200 dark:border-slate-800 bg-transparent"}
      `}>
        <label className="flex items-start gap-4 cursor-pointer group">
          <div className="relative flex items-center mt-1">
            <input 
              type="checkbox" 
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="h-6 w-6 rounded-lg border-2 border-slate-300 dark:border-slate-700 text-emerald-600 
                         focus:ring-offset-0 focus:ring-emerald-500 transition-all cursor-pointer accent-emerald-600"
            />
          </div>
          <div className="space-y-2">
            <h4 className={`text-xs font-black uppercase tracking-wide ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              Data Privacy & Consent Agreement
            </h4>
            <p className={`text-[11px] leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              I understand that the personal data I provide will be processed by the Barangay strictly for the 
              <strong> Household Survey</strong>. I affirm that all documents shared are authentic and submitted voluntarily in compliance with 
              the <strong>Data Privacy Act (RA 10173)</strong>.
            </p>
          </div>
        </label>
      </section>

      {/* 3. FINAL ACTIONS */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={() => isReady && onReviewSubmit()}
          disabled={!isReady}
          className={`
            w-full py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] transition-all duration-300
            shadow-2xl active:scale-[0.97]
            ${isReady
              ? "bg-emerald-700 text-white hover:bg-emerald-800 shadow-emerald-900/30"
              : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none"}
          `}
        >
          {loading ? (
             <span className="flex items-center justify-center gap-2">Processing...</span>
          ) : isReady ? (
            "Review My Application"
          ) : !hasFront || !hasBack ? (
            "Upload Both ID Photos"
          ) : !agreed ? (
            "Accept Agreement"
          ) : (
            "Check Missing Info"
          )}
        </button>

        <button 
          type="button" 
          onClick={() => setStep(3)} 
          className="w-full py-3 font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default Step4Upload;