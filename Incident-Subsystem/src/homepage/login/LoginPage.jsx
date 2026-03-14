/**
 * LoginPage.jsx
 * Login page with system tracking and theme support.
 * Route: /login
 * Location: src/homepage/login/LoginPage.jsx
 */

import React, { useState } from "react";
import { useNavigate, Navigate, useLocation } from "react-router-dom";
import {
  Sun, Moon, Loader2, CheckCircle2, Download,
  ArrowLeft, Search, Info,
} from "lucide-react";

import themeTokens from "../../Themetokens";
import ForgotPasswordModal from "../../components/shared/ForgotPasswordModal";
import Toast from "../../components/shared/modals/Toast";
import { useBranding } from "../../context/BrandingContext";

import LoginForm from "./LogInForm";
import { useAuthLogic } from "../hooks/useAuthLogic";
import { login, saveAuth, isAuthenticated, isAdmin } from "../services/loginService";
import { handleDownloadSlip } from "../../utils/sub-system-1/documentGenerator";

import bsbPic from "../../assets/images/bgygulod.png";
import bgyLogo from "../../assets/images/bgylogo.png";

const THEME_PRIMARY_CSS = {
  blue: "#2563eb",
  purple: "#9333ea",
  green: "#16a34a",
  dark: "#475569",
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from; // 'signup' when coming from signup page
  const [currentTheme] = useState(() => localStorage.getItem("appTheme") || "blue");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [slidingOut, setSlidingOut] = useState(false);

  // -- Login-specific state --
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [toasts, setToasts] = useState([]);
  const { logoDataUrl } = useBranding();
  const logoSrc = logoDataUrl || bgyLogo;

  const addToast = (toast) => setToasts((prev) => [...prev, { ...toast, id: Date.now() }]);
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // -- Tracking logic (Shared from useAuthLogic) --
  const {
    authSuccess,
    setAuthSuccess,
    trackingNum,
    handleTrackSearch,
    searchResult,
    formData // Kept only for the download slip reference if needed
  } = useAuthLogic(navigate);

  if (isAuthenticated()) {
    return <Navigate to={isAdmin() ? "/admin" : "/sub-system-2"} replace />;
  }

  const lightTheme = currentTheme === "dark" ? "modern" : currentTheme;
  const t = isDarkMode ? themeTokens.dark : (themeTokens[lightTheme] || themeTokens.modern);
  const primaryCss = isDarkMode ? "#475569" : (THEME_PRIMARY_CSS[lightTheme] || THEME_PRIMARY_CSS.blue);
  const panelClass = isDarkMode
    ? `${t.cardBg} border-white/10 ${t.cardText}`
    : `${t.cardBg} border-slate-200 ${t.cardText}`;
  const sideClass = isDarkMode
    ? `${t.inlineBg} border-white/10`
    : "bg-slate-100/95 border-slate-200";
  const mutedClass = t.subtleText;
  const strongMutedClass = isDarkMode ? "text-slate-300" : "text-slate-700";

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = "Username or email is required.";
    if (!password) errs.password = "Password is required.";
    return errs;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoginLoading(true);
    try {
      const data = await login(email, password);
      saveAuth(data);
      navigate(isAdmin() ? "/admin" : "/sub-system-2");
    } catch (err) {
      setApiError(err.message || "Login failed. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const goToSignup = () => {
    setSlidingOut(true);
    setTimeout(() => navigate("/signup", { state: { from: "login" } }), 280);
  };

  const SidebarBrand = () => (
    <div className="mt-4 mb-5 flex flex-col items-center text-center">
      <div className={`mb-3 w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 shadow-sm ${
        isDarkMode ? "border-white/20 bg-white/95" : "border-slate-200 bg-white"
      }`}>
        <img src={logoSrc} alt="Logo" className="w-full h-full object-cover rounded-full" />
      </div>
      <h2 className={`text-2xl sm:text-3xl font-black uppercase leading-[0.95] tracking-tight font-spartan text-center ${t.primaryText}`}>
        Barangay Gulod<br />Novaliches
      </h2>
      <div className={`mt-2 w-10 h-1 rounded-full bg-gradient-to-r mx-auto ${t.primaryGrad}`} />
      <p className={`mt-4 text-[9px] sm:text-[10px] font-black leading-relaxed font-kumbh uppercase text-center ${mutedClass}`}>
        OFFICE HOURS: 7:00 AM - 5:00 PM MONDAY - FRIDAY
      </p>
    </div>
  );

  const DistrictBadge = () => (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.24em] mb-5 font-kumbh self-start ${
      isDarkMode ? "bg-emerald-900/30 text-emerald-400" : `${t.primaryLight} ${t.primaryText}`
    }`}>
      <Info size={10} /> District 5, Quezon City
    </div>
  );

  return (
    <div className={`min-h-screen w-screen relative overflow-x-hidden ${t.pageBg}`}>
      <Toast toasts={toasts} onRemove={removeToast} currentTheme={currentTheme} />

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        email={email}
        currentTheme={currentTheme}
        isDarkMode={isDarkMode}
        onToast={addToast}
      />

      {/* Background Layer */}
      <div className="fixed inset-0 z-0">
        <img src={bsbPic} alt="Background"
          className={`w-full h-full object-cover ${isDarkMode ? "opacity-20 grayscale" : "opacity-[0.38]"}`} />
        <div className={`absolute inset-0 ${
          isDarkMode
            ? "bg-gradient-to-b from-slate-900/80 via-slate-800/70 to-slate-900/80"
            : "bg-gradient-to-b from-white/60 via-white/38 to-white/65"
        }`} />
      </div>

      {/* Post-Registration Success Modal */}
      {authSuccess && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className={`w-full max-w-md p-5 sm:p-8 rounded-[24px] sm:rounded-[36px] border shadow-2xl ${
            isDarkMode ? "bg-slate-900 border-white/10 text-white" : "bg-white border-black/10 text-slate-900"
          }`}>
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-emerald-500" size={42} />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-center mb-2 font-spartan">{authSuccess.title}</h2>
            <p className={`text-[11px] font-bold uppercase tracking-wider text-center mb-6 font-kumbh ${mutedClass}`}>{authSuccess.msg}</p>
            
            <div className={`rounded-3xl p-6 mb-6 border-2 border-dashed ${
              isDarkMode ? "bg-slate-950/70 border-emerald-500/40" : "bg-slate-50 border-emerald-500/40"
            }`}>
              <p className={`text-[10px] font-black uppercase tracking-widest text-center mb-2 font-kumbh ${mutedClass}`}>Tracking Number</p>
              <p className="text-3xl font-black text-emerald-500 tracking-tight text-center font-spartan">{authSuccess.code}</p>
            </div>

            <div className="space-y-3">
              <button 
                type="button" 
                onClick={() => {
                  const fullName = (authSuccess.resident?.name || 
                    `${formData.firstName} ${formData.lastName}`)
                    .replace(/\s+/g, " ").trim();
                  handleDownloadSlip({
                    name: fullName.toUpperCase(),
                    trackingNumber: authSuccess.code,
                    status: authSuccess.resident?.status || "Pending",
                    submittedDate: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
                  });
                }} 
                className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 font-kumbh"
              >
                <Download size={16} /> Download Registration Slip
              </button>
              <button 
                onClick={() => setAuthSuccess(null)}
                className={`w-full py-2 font-black uppercase text-[10px] tracking-widest transition-colors font-kumbh ${mutedClass} hover:opacity-80`}
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="relative z-20 pt-3 sm:pt-6 pb-3 sm:pb-6 px-3 sm:px-6">
        {/* Top Navigation Bar */}
        <div className="w-full flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-[11px] font-black uppercase tracking-widest transition-colors font-kumbh ${
              isDarkMode ? "border-white/10 hover:bg-white/5 text-white" : "border-black/10 hover:bg-black/5 text-slate-900"
            }`}>
            <ArrowLeft size={14} /> Back
          </button>
          <button onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2.5 rounded-xl border transition-colors ${
              isDarkMode ? "border-white/10 bg-slate-900/70" : "border-black/10 bg-white/80"
            }`} aria-label="Toggle theme">
            {isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className={t.primaryText} />}
          </button>
        </div>

        <div className="mx-auto w-full max-w-5xl">
          <div className={`rounded-[28px] sm:rounded-[40px] border shadow-2xl overflow-hidden backdrop-blur-2xl max-h-[calc(100dvh-6.5rem)] sm:max-h-[calc(100dvh-8rem)] overflow-y-auto custom-scrollbar ${panelClass}`}>
            <div className="grid lg:grid-cols-[360px_1fr]">
              
              {/* Sidebar: Branding & Tracking */}
              <aside className={`p-5 sm:p-8 lg:p-8 border-b lg:border-b-0 lg:border-r flex flex-col ${sideClass} ${slidingOut ? "auth-side-exit" : from === "signup" ? "auth-side-enter" : "auth-fade-in"}`}>
                <DistrictBadge />
                <SidebarBrand />

                <div className={`rounded-[28px] p-5 border mt-6 lg:mt-auto ${
                  isDarkMode ? "bg-slate-950/70 border-white/10" : `${t.cardBg} border-slate-200`
                }`}>
                  <label className={`text-[9px] font-black uppercase tracking-[0.22em] mb-2 block font-kumbh ${mutedClass}`}>
                    Track Application
                  </label>
                  <div className="relative">
                    <Search size={12} className={`absolute left-4 top-1/2 -translate-y-1/2 ${mutedClass}`} />
                    <input 
                      type="text" 
                      value={trackingNum} 
                      onChange={(e) => handleTrackSearch(e.target.value)}
                      placeholder="BGNXXXXX"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-[11px] font-black uppercase tracking-widest outline-none transition-colors bg-transparent font-kumbh ${
                        isDarkMode ? "border-slate-300/30 text-white" : `border-slate-300 ${t.cardText}`
                      }`} 
                    />
                  </div>
                  {searchResult && (
                    <div className={`mt-4 rounded-2xl p-4 border ${
                      isDarkMode ? "bg-slate-900/80 border-white/10" : "bg-slate-50 border-slate-200"
                    }`}>
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <p className={`text-[10px] font-black uppercase tracking-widest font-kumbh ${mutedClass}`}>Status</p>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border font-kumbh ${
                          searchResult.status === "Verified" ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : searchResult.status === "Rejected" ? "bg-rose-100 text-rose-700 border-rose-200"
                          : "bg-amber-100 text-amber-700 border-amber-200"
                        }`}>{searchResult.status}</span>
                      </div>
                      <p className={`text-sm font-black leading-tight mb-1 font-kumbh ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>
                        {searchResult.message}
                      </p>
                    </div>
                  )}
                </div>
              </aside>

              {/* Main Login Form Section */}
              <section className={`p-5 sm:p-8 lg:p-8 ${slidingOut ? "auth-section-exit" : from === "signup" ? "auth-section-enter" : "auth-fade-in"}`}>
                <div className="max-w-xl mx-auto lg:mx-0 text-left">
                  <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter leading-none mb-1 font-spartan">Sign In</h1>
                  <p className={`text-xs sm:text-sm leading-relaxed mb-3 font-kumbh ${strongMutedClass}`}>
                    Use your registered email and password to access your account.
                  </p>

                  {apiError && (
                    <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-kumbh">
                      <div className="w-5 h-5 flex-shrink-0 text-red-500">!</div>
                      {apiError}
                    </div>
                  )}

                  <div className="mt-8">
                    <form onSubmit={handleLoginSubmit} className="space-y-5">
                      <LoginForm
                        email={email}
                        password={password}
                        onChange={(e) => {
                          if (e.target.name === "email") setEmail(e.target.value);
                          if (e.target.name === "password") setPassword(e.target.value);
                        }}
                        errors={errors}
                        isDarkMode={isDarkMode}
                      />

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <label className={`inline-flex items-center gap-2 text-sm font-semibold font-kumbh ${strongMutedClass}`}>
                          <input type="checkbox" className="w-4 h-4" style={{ accentColor: primaryCss }} />
                          Remember me
                        </label>
                        <button type="button" onClick={() => setShowForgotModal(true)}
                          className={`text-sm font-semibold font-kumbh ${t.primaryText}`}>
                          Forgot password?
                        </button>
                      </div>

                      <button type="submit" disabled={loginLoading}
                        className={`w-full sm:w-auto sm:min-w-[280px] py-4 px-8 bg-gradient-to-r ${t.primaryGrad} text-white rounded-[24px] font-bold text-sm tracking-normal shadow-2xl disabled:opacity-30 transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto !mt-10 font-kumbh`}>
                        {loginLoading ? <Loader2 className="animate-spin" size={20} /> : "Login"}
                      </button>
                    </form>

                    <div className={`mt-8 text-sm font-semibold tracking-normal flex flex-wrap items-center justify-center gap-2 font-kumbh ${mutedClass}`}>
                      <span>No account yet?</span>
                      <button type="button"
                        onClick={goToSignup}
                        className={`${t.primaryText} transition-colors font-semibold hover:underline`}>
                        Register here!
                      </button>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes authSideEnterLogin { from { opacity: 0; transform: translateX(60px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes authSideExitLogin { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(-60px); } }
        @keyframes authSectionEnterLogin { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes authSectionExitLogin { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(40px); } }
        @keyframes authFadeInLogin { from { opacity: 0; } to { opacity: 1; } }
        .auth-side-enter { animation: authSideEnterLogin 0.35s cubic-bezier(0.4,0,0.2,1) both; }
        .auth-side-exit { animation: authSideExitLogin 0.28s cubic-bezier(0.4,0,0.2,1) both; }
        .auth-section-enter { animation: authSectionEnterLogin 0.35s cubic-bezier(0.4,0,0.2,1) both; }
        .auth-section-exit { animation: authSectionExitLogin 0.28s cubic-bezier(0.4,0,0.2,1) both; }
        .auth-fade-in { animation: authFadeInLogin 0.3s ease both; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: ${primaryCss} rgba(148,163,184,0.22); }
        .custom-scrollbar::-webkit-scrollbar { width: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(148,163,184,0.22); border-radius: 999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${primaryCss}; border-radius: 999px; }
      ` }} />
    </div>
  );
};

export default LoginPage;
