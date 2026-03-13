import React, { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import {
  Sun,
  Moon,
  Loader2,
  CheckCircle2,
  Download,
  ArrowLeft,
  Search,
  Info,
} from "lucide-react";
import themeTokens from "../../Themetokens";
import InputField from "../../components/shared/InputField";
import ForgotPasswordModal from "../../components/shared/ForgotPasswordModal";
import Toast from "../../components/shared/modals/Toast";
import { login, saveAuth, isAuthenticated, isAdmin } from "../../homepage/services/loginService";
import { useAuthLogic } from "../../homepage/auth/hooks/useAuthLogic";
import SignupForm from "../../homepage/auth/signup/SignUpForm";
import { handleDownloadSlip } from "../../utils/sub-system-1/documentGenerator";
import { useBranding } from "../../context/BrandingContext";
import bsbPic from "../../assets/images/bgygulod.png";
import bgyLogo from "../../assets/images/bgylogo.png";

// Maps theme key → raw CSS color for dynamic styles
const THEME_PRIMARY_CSS = {
  blue: "#2563eb",
  purple: "#9333ea",
  green: "#16a34a",
  dark: "#475569",
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [currentTheme] = useState(() => localStorage.getItem("appTheme") || "modern");
  const [isSignup, setIsSignup] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Always start in light mode when the user is logged out
  useEffect(() => {
    setIsDarkMode(false);
  }, []);

  // ── Login state ──────────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [toasts, setToasts] = useState([]);
  const { logoDataUrl } = useBranding();
  const logoSrc = logoDataUrl || bgyLogo;

  const addToast = (toast) =>
    setToasts((prev) => [...prev, { ...toast, id: Date.now() }]);
  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  // ── Signup state (useAuthLogic handles form data + registration) ──
  const {
    formData,
    handleChange,
    submitAuth,
    loading: signupLoading,
    authSuccess,
    setAuthSuccess,
    trackingNum,
    handleTrackSearch,
    searchResult,
    purokList,
    allStreets,
    addressExists,
  } = useAuthLogic(navigate);

  // If already authenticated, redirect immediately
  if (isAuthenticated()) {
    return <Navigate to={isAdmin() ? "/admin" : "/sub-system-2"} replace />;
  }

  const t = themeTokens[currentTheme];
  const primaryCss = THEME_PRIMARY_CSS[currentTheme] || THEME_PRIMARY_CSS.blue;

  // Dynamic classes based on dark mode + theme
  const panelClass = isDarkMode
    ? "bg-slate-900/95 border-white/10 text-white"
    : `${t.cardBg} border-slate-200 ${t.cardText}`;
  const sideClass = isDarkMode
    ? "bg-slate-950/40 border-white/10"
    : "bg-slate-100/95 border-slate-200";
  const mutedClass = isDarkMode ? "text-slate-400" : t.subtleText;
  const strongMutedClass = isDarkMode ? "text-slate-300" : "text-slate-700";

  // ── Validation ────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!password) {
      errs.password = "Password is required.";
    }
    return errs;
  };

  // ── Login submit ──────────────────────────────────────────────────
  const handleSubmit = async (e) => {
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

  return (
    <div
      className={`min-h-screen w-screen relative overflow-x-hidden ${
        isDarkMode ? "bg-slate-950" : t.pageBg
      }`}
    >
      {/* ── Toast notifications ───────────────────────────────────── */}
      <Toast toasts={toasts} onRemove={removeToast} currentTheme={currentTheme} />

      {/* ── Forgot password modal ──────────────────────────────────── */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        email={email}
        currentTheme={currentTheme}
        isDarkMode={isDarkMode}
        onToast={addToast}
      />

      {/* ── Background image ──────────────────────────────────────── */}
      <div className="fixed inset-0 z-0">
        <img
          src={bsbPic}
          alt="Barangay Hall"
          className={`w-full h-full object-cover ${
            isDarkMode ? "opacity-20 grayscale" : "opacity-[0.38]"
          }`}
        />
        <div
          className={`absolute inset-0 ${
            isDarkMode
              ? "bg-gradient-to-b from-slate-950/95 via-slate-950/85 to-slate-950/95"
              : "bg-gradient-to-b from-white/60 via-white/38 to-white/65"
          }`}
        />
      </div>

      {/* ── Registration success modal ─────────────────────────────── */}
      {authSuccess && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div
            className={`w-full max-w-md p-5 sm:p-8 rounded-[24px] sm:rounded-[36px] border shadow-2xl ${
              isDarkMode
                ? "bg-slate-900 border-white/10 text-white"
                : "bg-white border-black/10 text-slate-900"
            }`}
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-emerald-500" size={42} />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-center mb-2 font-spartan">
              {authSuccess.title}
            </h2>
            <p
              className={`text-[11px] font-bold uppercase tracking-wider text-center mb-6 font-kumbh ${mutedClass}`}
            >
              {authSuccess.msg}
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
                {authSuccess.code}
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  const fullName =
                    authSuccess.resident?.name ||
                    `${formData.firstName} ${formData.middleName || ""} ${formData.lastName} ${
                      formData.suffix || ""
                    }`
                      .replace(/\s+/g, " ")
                      .trim();
                  handleDownloadSlip({
                    name: fullName.toUpperCase(),
                    trackingNumber: authSuccess.code,
                    status: authSuccess.resident?.status || "Pending",
                    submittedDate:
                      authSuccess.resident?.submittedDate ||
                      new Date().toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }),
                  });
                }}
                className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 font-kumbh"
              >
                <Download size={16} /> Download Registration Slip
              </button>
              <button
                onClick={() => {
                  setAuthSuccess(null);
                  setIsSignup(false);
                }}
                className={`w-full py-2 font-black uppercase text-[10px] tracking-widest transition-colors font-kumbh ${mutedClass} ${
                  isDarkMode ? "hover:text-slate-200" : "hover:text-slate-700"
                }`}
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="relative z-20 pt-3 sm:pt-6 pb-3 sm:pb-6 px-3 sm:px-6">
        {/* ── Top bar ─────────────────────────────────────────────── */}
        <div className="w-full flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
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
              <Moon size={18} className={t.primaryText} />
            )}
          </button>
        </div>

        <div className={`mx-auto w-full ${isSignup ? "max-w-6xl" : "max-w-5xl"}`}>
          {!isSignup ? (
            /* ── LOGIN VIEW ──────────────────────────────────────── */
            <div
              className={`rounded-[28px] sm:rounded-[40px] border shadow-2xl overflow-hidden backdrop-blur-2xl max-h-[calc(100dvh-6.5rem)] sm:max-h-[calc(100dvh-8rem)] overflow-y-auto custom-scrollbar ${panelClass}`}
            >
              <div className="grid lg:grid-cols-[360px_1fr]">
                {/* Sidebar */}
                <aside
                  className={`p-5 sm:p-8 lg:p-8 border-b lg:border-b-0 lg:border-r flex flex-col ${sideClass}`}
                >
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.28em] mb-6 font-kumbh ${
                      isDarkMode
                        ? "bg-emerald-900/30 text-emerald-400"
                        : `${t.primaryLight} ${t.primaryText}`
                    }`}
                  >
                    <Info size={12} /> District 5, Quezon City
                  </div>

                  <div className="mb-5 flex flex-col items-center text-center">
                    <div
                      className={`mb-3 w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 shadow-sm ${
                        isDarkMode
                          ? "border-white/20 bg-white/95"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <img
                        src={logoSrc}
                        alt="Barangay Gulod Logo"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <h2
                      className={`text-3xl sm:text-4xl font-black uppercase leading-[0.95] tracking-tight font-spartan ${t.primaryText}`}
                    >
                      Barangay
                      <br />
                      Gulod
                      <br />
                      Novaliches
                    </h2>
                    <div
                      className={`mt-2.5 w-12 h-1 rounded-full bg-gradient-to-r ${t.primaryGrad}`}
                    />
                  </div>

                  {/* Track application */}
                  <div
                    className={`rounded-[28px] p-5 border mt-6 lg:mt-auto ${
                      isDarkMode
                        ? "bg-slate-950/70 border-white/10"
                        : `${t.cardBg} border-slate-200`
                    }`}
                  >
                    <label
                      className={`text-[10px] font-black uppercase tracking-[0.25em] mb-3 block font-kumbh ${mutedClass}`}
                    >
                      Track Application
                    </label>
                    <div className="relative">
                      <Search
                        size={14}
                        className={`absolute left-4 top-1/2 -translate-y-1/2 ${mutedClass}`}
                      />
                      <input
                        type="text"
                        value={trackingNum}
                        onChange={(e) => handleTrackSearch(e.target.value)}
                        placeholder="BGN-XXXX"
                        className={`w-full pl-11 pr-4 py-3 rounded-2xl border-2 text-xs font-black uppercase tracking-widest outline-none transition-colors bg-transparent font-kumbh ${
                          isDarkMode
                            ? "border-slate-300/30 text-white"
                            : `border-slate-300 ${t.cardText}`
                        }`}
                      />
                    </div>

                    {searchResult && (
                      <div
                        className={`mt-4 rounded-2xl p-4 border ${
                          isDarkMode
                            ? "bg-slate-900/80 border-white/10"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <p
                            className={`text-[10px] font-black uppercase tracking-widest font-kumbh ${mutedClass}`}
                          >
                            Status
                          </p>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border font-kumbh ${
                              searchResult.status === "Verified"
                                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                : searchResult.status === "Rejected"
                                ? "bg-rose-100 text-rose-700 border-rose-200"
                                : searchResult.status === "For Verification"
                                ? "bg-blue-100 text-blue-700 border-blue-200"
                                : "bg-amber-100 text-amber-700 border-amber-200"
                            }`}
                          >
                            {searchResult.status}
                          </span>
                        </div>
                        <p
                          className={`text-sm font-black leading-tight mb-1 font-kumbh ${
                            isDarkMode ? "text-slate-100" : "text-slate-800"
                          }`}
                        >
                          {searchResult.message}
                        </p>
                        {searchResult.name && (
                          <p
                            className={`text-[10px] font-medium italic font-kumbh ${mutedClass}`}
                          >
                            Applicant: {searchResult.name}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </aside>

                {/* Login form */}
                <section className="p-5 sm:p-8 lg:p-8">
                  <div className="max-w-xl">
                    <h1
                      className={`text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-none mb-3 font-spartan`}
                    >
                      Sign In
                    </h1>
                    <p className={`text-sm leading-relaxed mb-6 font-kumbh ${strongMutedClass}`}>
                      Use your registered email and password to access your account.
                    </p>

                    {/* API error banner */}
                    {apiError && (
                      <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-kumbh">
                        <svg
                          className="w-5 h-5 flex-shrink-0 text-red-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {apiError}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Email field — shared InputField component */}
                      <InputField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        error={errors.email}
                        currentTheme={currentTheme}
                        icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        autoComplete="off"
                      />

                      {/* Password field — shared InputField + eye toggle overlay */}
                      <div className="relative">
                        <InputField
                          label="Password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                          error={errors.password}
                          currentTheme={currentTheme}
                          icon="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          autoComplete="current-password"
                          style={{ paddingRight: "3rem" }}
                        />
                        {/* Eye toggle — positioned to align with the input box */}
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute right-3 top-[50px] -translate-y-1/2 p-1 rounded-md transition-colors ${
                            isDarkMode
                              ? "text-slate-400 hover:text-slate-200"
                              : `${t.subtleText} hover:text-slate-900`
                          }`}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          )}
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <label
                          className={`inline-flex items-center gap-2 text-xs font-bold font-kumbh ${strongMutedClass}`}
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            style={{ accentColor: primaryCss }}
                          />
                          Remember me
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowForgotModal(true)}
                          className={`text-xs font-black uppercase tracking-wide font-kumbh ${t.primaryText}`}
                        >
                          Forgot password?
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={loginLoading}
                        className={`w-full sm:w-auto sm:min-w-[280px] py-4 px-8 bg-gradient-to-r ${t.primaryGrad} text-white rounded-[24px] font-black text-sm uppercase tracking-widest shadow-2xl disabled:opacity-30 transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto !mt-10 font-kumbh`}
                      >
                        {loginLoading ? <Loader2 className="animate-spin" size={20} /> : "Login"}
                      </button>
                    </form>

                    <div
                      className={`mt-8 text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-1.5 font-kumbh ${mutedClass}`}
                    >
                      <span>No account yet?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignup(true);
                          setAuthSuccess(null);
                        }}
                        className={`${t.primaryText} transition-colors font-black uppercase tracking-[0.05em]`}
                      >
                        Register here!
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          ) : (
            /* ── REGISTER VIEW ───────────────────────────────────── */
            <div
              className={`rounded-[28px] sm:rounded-[40px] border shadow-2xl overflow-y-auto lg:overflow-hidden backdrop-blur-2xl max-h-[calc(100dvh-6.5rem)] sm:max-h-[calc(100dvh-8rem)] lg:h-[calc(100dvh-8rem)] custom-scrollbar ${panelClass}`}
            >
              <div className="grid lg:grid-cols-[360px_1fr] lg:h-full">
                <aside
                  className={`p-5 sm:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r flex flex-col items-center text-center ${sideClass}`}
                >
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.28em] mb-8 font-kumbh ${
                      isDarkMode
                        ? "bg-emerald-900/30 text-emerald-400"
                        : `${t.primaryLight} ${t.primaryText}`
                    }`}
                  >
                    <Info size={12} /> District 5, Quezon City
                  </div>

                  <div className="mb-5 flex flex-col items-center text-center">
                    <div
                      className={`mb-3 w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 shadow-sm ${
                        isDarkMode
                          ? "border-white/20 bg-white/95"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <img
                        src={logoSrc}
                        alt="Barangay Gulod Logo"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <h2
                      className={`text-3xl sm:text-4xl font-black uppercase leading-[0.95] tracking-tight font-spartan ${t.primaryText}`}
                    >
                      Barangay
                      <br />
                      Gulod
                      <br />
                      Novaliches
                    </h2>
                    <div
                      className={`mt-2.5 w-12 h-1 rounded-full bg-gradient-to-r ${t.primaryGrad}`}
                    />
                  </div>
                </aside>

                <section className="p-5 sm:p-8 lg:p-10 lg:min-h-0">
                  <div className="max-w-3xl lg:h-full flex flex-col lg:min-h-0">
                    <h1
                      className={`text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-none mb-4 font-spartan`}
                    >
                      Register
                    </h1>
                    <p className={`text-sm leading-relaxed mb-5 font-kumbh ${strongMutedClass}`}>
                      Fill in accurate details so your account can be approved faster.
                    </p>

                    <div
                      className={`rounded-[30px] border p-4 sm:p-6 lg:p-8 lg:flex-[1.35] lg:min-h-0 overflow-visible lg:overflow-hidden ${
                        isDarkMode
                          ? "bg-slate-950/40 border-white/10"
                          : `${t.cardBg} border-slate-200`
                      }`}
                    >
                      <div className="max-h-none lg:h-full lg:min-h-0 overflow-visible lg:overflow-y-auto custom-scrollbar lg:-mr-8 lg:pr-8">
                        <form
                          id="auth-form"
                          onSubmit={(e) => e.preventDefault()}
                          className="pt-1"
                        >
                          <SignupForm
                            formData={formData}
                            handleChange={handleChange}
                            isDarkMode={isDarkMode}
                            handleSubmit={() => submitAuth(true)}
                            loading={signupLoading}
                            purokList={purokList}
                            allStreets={allStreets}
                            addressExists={addressExists}
                          />
                        </form>
                      </div>
                    </div>

                    <div
                      className={`mt-6 text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center text-center flex-wrap gap-1.5 font-kumbh ${mutedClass}`}
                    >
                      <span>Already have an account?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignup(false);
                          setAuthSuccess(null);
                        }}
                        className={`${t.primaryText} transition-colors font-black uppercase tracking-[0.05em]`}
                      >
                        Log in here!
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Dynamic CSS ──────────────────────────────────────────────── */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .full-input-sm {
            width: 100%;
            padding: 0.95rem 1rem;
            border: 2px solid ${isDarkMode ? "rgba(148,163,184,0.22)" : "rgba(15,23,42,0.25)"};
            border-radius: 16px;
            background: ${isDarkMode ? "rgba(2,6,23,0.7)" : "rgba(255,255,255,0.95)"};
            color: ${isDarkMode ? "#f8fafc" : "#0f172a"};
            outline: none;
            transition: border-color .2s ease, box-shadow .2s ease;
            font-size: 0.82rem;
            font-weight: 800;
            letter-spacing: .01em;
            text-transform: none;
          }
          .full-input-sm:focus {
            border-color: ${primaryCss};
            box-shadow: 0 0 0 4px ${primaryCss}22;
          }
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: ${primaryCss} rgba(148,163,184,0.22);
            scrollbar-gutter: stable;
          }
          .custom-scrollbar::-webkit-scrollbar { width: 10px; }
          .custom-scrollbar::-webkit-scrollbar-button { display: none; height: 0; width: 0; }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(148,163,184,0.22);
            margin-block: 8px;
            border-radius: 999px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: ${primaryCss};
            min-height: 72px;
            border-radius: 999px;
          }
        `,
        }}
      />
    </div>
  );
};

export default LoginPage;

