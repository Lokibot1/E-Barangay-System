/**
 * SignupPage.jsx
 * Standalone registration page for the public.
 * FIXED: Integrated Debug Autofill listener & Success Modal safety.
 */

import React, { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Sun, Moon, CheckCircle2, Download, ArrowLeft, Info } from "lucide-react";

import SignupForm from "./SignUpForm";
import { useAuthLogic } from "../hooks/useAuthLogic";
import { isAuthenticated, isAdmin } from "../services/loginService";
import { handleDownloadSlip } from "../../utils/sub-system-1/documentGenerator";

import bsbPic from "../../assets/images/bgygulod.png";
import bgyLogo from "../../assets/images/bgylogo.png";

const SignupPage = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const {
    formData,
    setFormData,
    handleChange,
    submitAuth,
    loading,
    authSuccess,
    purokList,
    allStreets,
    addressExists,
  } = useAuthLogic(navigate);

  // ── AUTOFILL LISTENER ───────────────────────────────────────────────────
  useEffect(() => {
  
    const register = () => {
      window.dispatchEvent(new CustomEvent('REGISTER_SETTER', { detail: setFormData }));
    };

    register();


    window.addEventListener('REQUEST_SETTER_REFRESH', register);
    
    return () => {
      window.removeEventListener('REQUEST_SETTER_REFRESH', register);
      window.dispatchEvent(new CustomEvent('REGISTER_SETTER', { detail: null }));
    };
  }, [setFormData]);

  // Guard: If already logged in, redirect away from signup
  if (isAuthenticated()) {
    return <Navigate to={isAdmin() ? "/admin" : "/dashboard"} replace />;
  }

  const mutedClass = isDarkMode ? "text-slate-400" : "text-slate-500";
  const strongMutedClass = isDarkMode ? "text-slate-300" : "text-slate-700";
  const panelClass = isDarkMode
    ? "bg-slate-900/95 border-white/10 text-white"
    : "bg-white border-black/10 text-slate-900";
  const sideClass = isDarkMode
    ? "bg-slate-950/40 border-white/10"
    : "bg-slate-100/95 border-black/10";

  return (
    <div className={`min-h-screen w-screen relative overflow-x-hidden ${isDarkMode ? "bg-slate-950" : "bg-slate-100"}`}>
      
      {/* Background Layer */}
      <div className="fixed inset-0 z-0">
        <img src={bsbPic} alt="Barangay Hall"
          className={`w-full h-full object-cover ${isDarkMode ? "opacity-20 grayscale" : "opacity-[0.38]"}`} />
        <div className={`absolute inset-0 ${
          isDarkMode
            ? "bg-gradient-to-b from-slate-950/95 via-slate-950/85 to-slate-950/95"
            : "bg-gradient-to-b from-white/60 via-white/38 to-white/65"
        }`} />
      </div>

      {/* SUCCESS MODAL */}
      {authSuccess && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className={`w-full max-w-md p-5 sm:p-8 rounded-[24px] sm:rounded-[36px] border shadow-2xl ${panelClass}`}>
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-emerald-500" size={42} />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-center mb-2 font-spartan">
              {authSuccess.title || "Registration Sent"}
            </h2>
            <p className={`text-[11px] font-bold uppercase tracking-wider text-center mb-6 font-kumbh ${mutedClass}`}>
              {authSuccess.msg || "Please save your tracking number below."}
            </p>
            
            <div className={`rounded-3xl p-6 mb-6 border-2 border-dashed ${
              isDarkMode ? "bg-slate-950/70 border-emerald-500/40" : "bg-slate-50 border-emerald-500/40"
            }`}>
              <p className={`text-[10px] font-black uppercase tracking-widest text-center mb-2 font-kumbh ${mutedClass}`}>
                Tracking Number
              </p>
              <p className="text-3xl font-black text-emerald-500 tracking-tight text-center font-spartan">
                {authSuccess.code || authSuccess.cardText || "N/A"}
              </p>
            </div>

            <div className="space-y-3">
              <button 
                type="button" 
                onClick={() => {
                  const fullName = [formData.firstName, formData.middleName, formData.lastName, formData.suffix]
                    .filter(Boolean).join(" ").toUpperCase();
                  handleDownloadSlip({
                    name: fullName,
                    trackingNumber: authSuccess.code || authSuccess.cardText || "N/A",
                    status: "Pending Verification",
                    submittedDate: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
                  });
                }} 
                className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 font-kumbh"
              >
                <Download size={16} /> Download Slip
              </button>
              <button 
                onClick={() => navigate("/login")}
                className={`w-full py-2 font-black uppercase text-[10px] tracking-widest transition-colors font-kumbh ${mutedClass} hover:text-emerald-500`}
              >
                Return to Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Actions */}
      <main className="relative z-20 pt-3 sm:pt-6 pb-3 sm:pb-6 px-3 sm:px-6">
        <div className="w-full flex items-center justify-between mb-4">
          <button onClick={() => navigate("/")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-[11px] font-black uppercase tracking-widest transition-colors font-kumbh ${
              isDarkMode ? "border-white/10 hover:bg-white/5 text-white" : "border-black/10 hover:bg-black/5 text-slate-900"
            }`}>
            <ArrowLeft size={14} /> Back
          </button>
          <button onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2.5 rounded-xl border transition-colors ${
              isDarkMode ? "border-white/10 bg-slate-900/70" : "border-black/10 bg-white/80"
            }`} aria-label="Toggle theme">
            {isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-emerald-800" />}
          </button>
        </div>

        <div className="mx-auto w-full max-w-6xl">
          <div className={`rounded-[28px] sm:rounded-[40px] border shadow-2xl overflow-y-auto lg:overflow-hidden backdrop-blur-2xl max-h-[calc(100dvh-6.5rem)] sm:max-h-[calc(100dvh-8rem)] lg:h-[calc(100dvh-8rem)] custom-scrollbar ${panelClass}`}>
            <div className="grid lg:grid-cols-[360px_1fr] lg:h-full">

              {/* Sidebar Info */}
              <aside className={`p-5 sm:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r flex flex-col items-center text-center ${sideClass}`}>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.28em] mb-8 font-kumbh ${
                  isDarkMode ? "bg-emerald-900/30 text-emerald-400" : "bg-emerald-100 text-emerald-700"
                }`}>
                  <Info size={12} /> Public Registration
                </div>
                <div className="mb-5 flex flex-col items-center text-center">
                  <div className={`mb-3 w-20 h-20 rounded-full overflow-hidden border-4 ${isDarkMode ? "border-white/20" : "border-slate-200"}`}>
                    <img src={bgyLogo} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <h2 className="text-3xl font-black uppercase leading-[0.95] tracking-tight text-emerald-600 font-spartan">
                    Barangay<br />Gulod
                  </h2>
                </div>
                <div className={`mt-auto pt-6 text-[11px] font-black uppercase tracking-[0.2em] font-kumbh ${mutedClass}`}>
                  <p className="mb-2">Member already?</p>
                  <button onClick={() => navigate("/login")} className="text-emerald-600 hover:underline font-black uppercase">
                    Log in here
                  </button>
                </div>
              </aside>

              {/* Form Section */}
              <section className="p-5 sm:p-8 lg:p-10 lg:min-h-0 flex flex-col">
                <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-none mb-4 font-spartan">Register</h1>
                <p className={`text-sm mb-5 font-kumbh ${strongMutedClass}`}>
                  Please provide valid information to ensure a smooth verification process.
                </p>
                
                <div className={`rounded-[30px] border p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto custom-scrollbar ${
                  isDarkMode ? "bg-slate-950/40 border-white/10" : "bg-white/90 border-black/10"
                }`}>
                  <SignupForm
                    formData={formData}
                    handleChange={handleChange}
                    isDarkMode={isDarkMode}
                    handleSubmit={submitAuth} 
                    loading={loading}
                    purokList={purokList}
                    allStreets={allStreets}
                    addressExists={addressExists}
                    isStaffMode={false} 
                  />
                </div>
              </section>

            </div>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
      ` }} />
    </div>
  );
};

export default SignupPage;