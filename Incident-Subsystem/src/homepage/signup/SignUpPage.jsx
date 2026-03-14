/**
 * SignupPage.jsx
 *
 * CHANGES:
 * 1. Draft persistence via localStorage
 *    - Key: "signup_draft"
 *    - Saved on every formData change (debounced 400 ms)
 *    - Excluded from save: idFront, idBack (File objects can't be serialized)
 *    - Restored on mount — shows a "Resume draft" toast-style notice
 *    - Cleared automatically on successful registration (authSuccess)
 * 2. "Clear draft" button shown in the notice banner so users can start fresh
 * 3. All existing logic (autofill listener, address search props, etc.) preserved
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Navigate, useLocation } from "react-router-dom";
import {
  Sun,
  Moon,
  CheckCircle2,
  Download,
  ArrowLeft,
  Info,
  RotateCcw,
  Trash2,
} from "lucide-react";

import themeTokens from "../../Themetokens";
import SignupForm from "./SignUpForm";
import { useAuthLogic } from "../hooks/useAuthLogic";
import { isAuthenticated, isAdmin } from "../services/loginService";
import { handleDownloadSlip } from "../../utils/sub-system-1/documentGenerator";
import { useBranding } from "../../context/BrandingContext";

import bsbPic from "../../assets/images/bgygulod.png";
import bgyLogo from "../../assets/images/bgylogo.png";

const DRAFT_KEY = "signup_draft";
// Fields that cannot be serialised to localStorage (File objects)
const NON_SERIALISABLE = ["idFront", "idBack"];

const SignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from; // 'login' when coming from login page
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [slidingOut, setSlidingOut] = useState(false);
  const [draftBanner, setDraftBanner] = useState(false); // show resume-draft notice
  const { logoDataUrl } = useBranding();
  const logoSrc = logoDataUrl || bgyLogo;

  const {
    formData,
    setFormData,
    handleChange,
    submitAuth,
    loading,
    authSuccess,
    setAuthSuccess,
    purokList,
    allStreets,
    addressExists,
    householdHeadData,
    addressSearch,
    setAddressSearch,
    addressSuggestions,
    isSearchingAddress,
    selectAddress,
  } = useAuthLogic(navigate);

  // ── DRAFT: restore on mount ──────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      // Only restore if there is at least one meaningful field filled
      const hasMeaningful =
        saved.firstName || saved.lastName || saved.email || saved.contact;
      if (!hasMeaningful) return;
      setFormData((prev) => ({ ...prev, ...saved }));
      setDraftBanner(true);
    } catch {
      // Corrupt data — ignore
      localStorage.removeItem(DRAFT_KEY);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── DRAFT: save on change (debounced) ────────────────────────────────────
  const saveTimer = useRef(null);
  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        const toSave = Object.fromEntries(
          Object.entries(formData).filter(
            ([k]) => !NON_SERIALISABLE.includes(k),
          ),
        );
        localStorage.setItem(DRAFT_KEY, JSON.stringify(toSave));
      } catch {
        /* quota exceeded — silently skip */
      }
    }, 400);
    return () => clearTimeout(saveTimer.current);
  }, [formData]);

  // ── DRAFT: clear on successful registration ───────────────────────────────
  useEffect(() => {
    if (authSuccess) {
      localStorage.removeItem(DRAFT_KEY);
      setDraftBanner(false);
    }
  }, [authSuccess]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    setDraftBanner(false);
    // Reset only text fields, keep default values from useAuthLogic initial state
    setFormData((prev) => ({
      ...prev,
      firstName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      birthdate: "",
      age: "",
      gender: "",
      sector: "",
      householdPosition: "",
      maritalStatus: "",
      nationality: "Filipino",
      residencyStatus: "",
      residencyStartDate: "",
      isVoter: false,
      birthRegistration: "Registered",
      purok: "",
      street: "",
      houseNumber: "",
      contact: "",
      email: "",
      employmentStatus: "N/A",
      occupation: "",
      incomeSource: "N/A",
      monthlyIncome: "0",
      educationalStatus: "N/A",
      schoolType: "N/A",
      schoolLevel: "N/A",
      highestGrade: "N/A",
      idFront: null,
      idBack: null,
      idType: "Barangay ID",
      username: "",
      password: "",
      tenureStatus: "Owned",
      wallMaterial: "Concrete",
      roofMaterial: "G.I. Sheet",
      waterSource: "Maynilad",
      numberOfFamilies: "1",
      isIndigent: 0,
    }));
  }, [setFormData]);

  // ── AUTOFILL LISTENER (existing) ─────────────────────────────────────────
  useEffect(() => {
    const register = () => {
      window.dispatchEvent(
        new CustomEvent("REGISTER_SETTER", { detail: setFormData }),
      );
    };
    register();
    window.addEventListener("REQUEST_SETTER_REFRESH", register);
    return () => {
      window.removeEventListener("REQUEST_SETTER_REFRESH", register);
      window.dispatchEvent(
        new CustomEvent("REGISTER_SETTER", { detail: null }),
      );
    };
  }, [setFormData]);

  // Guard: already logged in
  if (isAuthenticated()) {
    return <Navigate to={isAdmin() ? "/admin" : "/dashboard"} replace />;
  }

  const currentTheme = localStorage.getItem("appTheme") || "blue";
  const lightTheme = currentTheme === "dark" ? "modern" : currentTheme;
  const t = isDarkMode
    ? themeTokens.dark
    : themeTokens[lightTheme] || themeTokens.modern;
  const mutedClass = t.subtleText;
  const strongMutedClass = isDarkMode ? "text-slate-300" : "text-slate-700";
  const panelClass = isDarkMode
    ? `${t.cardBg} border-white/10 ${t.cardText}`
    : "bg-white border-black/10 text-slate-900";
  const sideClass = isDarkMode
    ? `${t.inlineBg} border-white/10`
    : "bg-slate-100/95 border-black/10";

  const goToLogin = () => {
    setSlidingOut(true);
    setTimeout(() => navigate("/login", { state: { from: "signup" } }), 280);
  };

  return (
    <div
      className={`min-h-screen w-screen relative overflow-x-hidden ${t.pageBg}`}
    >
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img
          src={bsbPic}
          alt="Barangay Hall"
          className={`w-full h-full object-cover ${isDarkMode ? "opacity-20 grayscale" : "opacity-[0.38]"}`}
        />
        <div
          className={`absolute inset-0 ${
            isDarkMode
              ? "bg-gradient-to-b from-slate-900/80 via-slate-800/70 to-slate-900/80"
              : "bg-gradient-to-b from-white/60 via-white/38 to-white/65"
          }`}
        />
      </div>

      {/* ── SUCCESS MODAL ──────────────────────────────────────────────────── */}
      {authSuccess && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div
            className={`w-full max-w-md p-5 sm:p-8 rounded-[24px] sm:rounded-[36px] border shadow-2xl ${panelClass}`}
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-emerald-500" size={42} />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-center mb-2 font-spartan">
              {authSuccess.title || "Registration Sent"}
            </h2>
            <p
              className={`text-[11px] font-bold uppercase tracking-wider text-center mb-6 font-kumbh ${mutedClass}`}
            >
              {authSuccess.msg || "Please save your tracking number below."}
            </p>
            <div
              className={`rounded-3xl p-6 mb-6 border-2 border-dashed ${
                isDarkMode
                  ? "bg-slate-950/70 border-emerald-500/40"
                  : "bg-slate-50 border-emerald-500/40"
              }`}
            >
              <p
                className={`text-[10px] font-black uppercase tracking-widest text-center mb-2 font-kumbh ${mutedClass}`}
              >
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
                  const fullName = [
                    formData.firstName,
                    formData.middleName,
                    formData.lastName,
                    formData.suffix,
                  ]
                    .filter(Boolean)
                    .join(" ")
                    .toUpperCase();
                  handleDownloadSlip({
                    name: fullName,
                    trackingNumber:
                      authSuccess.code || authSuccess.cardText || "N/A",
                    status: "Pending Verification",
                    submittedDate: new Date().toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }),
                  });
                }}
                className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 font-kumbh"
              >
                <Download size={16} /> Download Slip
              </button>
              <button
                onClick={goToLogin}
                className={`w-full py-2 font-black uppercase text-[10px] tracking-widest transition-colors font-kumbh ${mutedClass} hover:text-emerald-500`}
              >
                Return to Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOP BAR ────────────────────────────────────────────────────────── */}
      <main className="relative z-20 pt-3 sm:pt-6 pb-3 sm:pb-6 px-3 sm:px-6">
        <div className="w-full flex items-center justify-between mb-4">
          <button
            onClick={() => navigate("/")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-[11px] font-black uppercase tracking-widest transition-colors font-kumbh ${
              isDarkMode
                ? "border-white/10 hover:bg-white/5 text-white"
                : "border-black/10 hover:bg-black/5 text-slate-900"
            }`}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2.5 rounded-xl border transition-colors ${
              isDarkMode
                ? "border-white/10 bg-slate-900/70"
                : "border-black/10 bg-white/80"
            }`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <Sun size={18} className="text-yellow-400" />
            ) : (
              <Moon size={18} className="text-emerald-800" />
            )}
          </button>
        </div>

        <div className="mx-auto w-full max-w-6xl">
          <div
            className={`rounded-[28px] sm:rounded-[40px] border shadow-2xl overflow-y-auto lg:overflow-hidden backdrop-blur-2xl max-h-[calc(100dvh-6.5rem)] sm:max-h-[calc(100dvh-8rem)] lg:h-[calc(100dvh-8rem)] custom-scrollbar ${panelClass}`}
          >
            <div className="grid lg:grid-cols-[360px_1fr] lg:h-full">
              {/* ── SIDEBAR ────────────────────────────────────────────────── */}
              <aside
                className={`p-5 sm:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r flex flex-col items-center text-center ${sideClass} ${slidingOut ? "auth-side-exit" : from === "login" ? "auth-side-enter" : "auth-fade-in"}`}
              >
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.28em] mb-8 font-kumbh ${
                    isDarkMode
                      ? "bg-emerald-900/30 text-emerald-400"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  <Info size={12} /> Public Registration
                </div>
                <div className="mt-4 mb-5 flex flex-col items-center text-center">
                  <div
                    className={`mb-3 w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 shadow-sm ${
                      isDarkMode
                        ? "border-white/20 bg-white/95"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <img
                      src={logoSrc}
                      alt="Logo"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <h2
                    className={`text-2xl sm:text-3xl font-black uppercase leading-[0.95] tracking-tight font-spartan text-center ${t.primaryText}`}
                  >
                    Barangay Gulod
                    <br />
                    Novaliches
                  </h2>
                  <div
                    className={`mt-2 w-10 h-1 rounded-full bg-gradient-to-r mx-auto ${t.primaryGrad}`}
                  />
                  <p
                    className={`mt-4 text-[9px] sm:text-[10px] font-black leading-relaxed font-kumbh uppercase text-center ${mutedClass}`}
                  >
                    OFFICE HOURS: 7:00 AM - 5:00 PM MONDAY - FRIDAY
                  </p>
                </div>

                {/* ── DRAFT BANNER ─────────────────────────────────────────── */}
                {draftBanner && (
                  <div
                    className={`w-full mt-4 rounded-2xl border p-4 text-left animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                      isDarkMode
                        ? "bg-amber-900/20 border-amber-700/40 text-amber-300"
                        : "bg-amber-50 border-amber-200 text-amber-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <RotateCcw size={12} className="shrink-0" />
                      <p className="text-[10px] font-black uppercase tracking-widest font-kumbh">
                        Draft Restored
                      </p>
                    </div>
                    <p className="text-[10px] font-bold leading-relaxed mb-3 opacity-80 font-kumbh">
                      Your previous form progress has been loaded. You can
                      continue where you left off.
                    </p>
                    <button
                      type="button"
                      onClick={clearDraft}
                      className={`font-kumbh inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border transition-colors ${
                        isDarkMode
                          ? "border-amber-700/50 hover:bg-amber-900/40 text-amber-400"
                          : "border-amber-300 hover:bg-amber-100 text-amber-700"
                      }`}
                    >
                      <Trash2 size={10} /> Start fresh
                    </button>
                  </div>
                )}

                <div
                  className={`mt-auto pt-6 text-[11px] font-black uppercase tracking-[0.2em] font-kumbh ${mutedClass}`}
                >
                  <p className="mb-2">Member already?</p>
                  <button
                    onClick={goToLogin}
                    className="text-emerald-600 hover:underline font-black uppercase"
                  >
                    Log in here
                  </button>
                </div>
              </aside>

              {/* ── FORM SECTION ─────────────────────────────────────────────── */}
              <section
                className={`p-5 sm:p-8 lg:p-10 lg:min-h-0 flex flex-col ${slidingOut ? "auth-section-exit" : from === "login" ? "auth-section-enter" : "auth-fade-in"}`}
              >
                <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-none mb-4 font-spartan">
                  Register
                </h1>
                <p className={`text-sm mb-5 font-kumbh ${strongMutedClass}`}>
                  Please provide valid information to ensure a smooth
                  verification process.
                </p>

                <div
                  className={`rounded-[30px] border p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto custom-scrollbar ${
                    isDarkMode
                      ? "bg-slate-950/40 border-white/10"
                      : "bg-white/90 border-black/10"
                  }`}
                >
                  <SignupForm
                    formData={formData}
                    handleChange={handleChange}
                    isDarkMode={isDarkMode}
                    handleSubmit={submitAuth}
                    loading={loading}
                    purokList={purokList}
                    allStreets={allStreets}
                    addressExists={addressExists}
                    householdHeadData={householdHeadData}
                    isStaffMode={false}
                    addressSearch={addressSearch}
                    setAddressSearch={setAddressSearch}
                    addressSuggestions={addressSuggestions}
                    isSearchingAddress={isSearchingAddress}
                    selectAddress={selectAddress}
                  />
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes authSideEnterSignup { from { opacity: 0; transform: translateX(-60px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes authSideExitSignup { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(60px); } }
        @keyframes authSectionEnterSignup { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes authSectionExitSignup { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(-40px); } }
        @keyframes authFadeInSignup { from { opacity: 0; } to { opacity: 1; } }
        .auth-side-enter { animation: authSideEnterSignup 0.35s cubic-bezier(0.4,0,0.2,1) both; }
        .auth-side-exit { animation: authSideExitSignup 0.28s cubic-bezier(0.4,0,0.2,1) both; }
        .auth-section-enter { animation: authSectionEnterSignup 0.35s cubic-bezier(0.4,0,0.2,1) both; }
        .auth-section-exit { animation: authSectionExitSignup 0.28s cubic-bezier(0.4,0,0.2,1) both; }
        .auth-fade-in { animation: authFadeInSignup 0.3s ease both; }
        .full-input-sm {
          width: 100%;
          min-height: 3.15rem;
          padding: 0.95rem 1rem;
          border: 2px solid ${isDarkMode ? "rgba(148,163,184,0.22)" : "rgba(15,23,42,0.12)"};
          border-radius: 16px;
          background: ${isDarkMode ? "rgba(2,6,23,0.72)" : "rgba(255,255,255,0.96)"};
          color: ${isDarkMode ? "#f8fafc" : "#0f172a"};
          outline: none;
          transition: border-color .2s ease, box-shadow .2s ease, background-color .2s ease;
          font-size: 0.82rem;
          font-family: 'Kumbh Sans', sans-serif;
          font-weight: 700;
          letter-spacing: 0.01em;
          line-height: 1.2;
          box-sizing: border-box;
          display: block;
        }
        .full-input-sm::placeholder {
          color: ${isDarkMode ? "rgba(148,163,184,0.78)" : "rgba(100,116,139,0.85)"};
          font-weight: 600;
        }
        .full-input-sm:focus {
          border-color: #059669;
          box-shadow: 0 0 0 4px rgba(5,150,105,0.12);
        }
        select.full-input-sm { cursor: pointer; }
        input[type="date"].full-input-sm { padding-right: 0.85rem; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-from-bottom-2 { from { transform: translateY(8px); } to { transform: translateY(0); } }
        .animate-in { animation: fade-in 0.3s ease, slide-in-from-bottom-2 0.3s ease; }
      `,
        }}
      />
    </div>
  );
};

export default SignupPage;
