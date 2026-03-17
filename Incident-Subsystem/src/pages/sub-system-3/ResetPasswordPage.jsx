import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, Sun, Moon } from "lucide-react";
import themeTokens from "../../Themetokens";
import InputField from "../../components/shared/InputField";
import Toast from "../../components/shared/modals/Toast";
import { useBranding } from "../../context/BrandingContext";
import { resetPassword } from "../../homepage/services/loginService";
import bsbPic from "../../assets/images/bgygulod.png";
import bgyLogo from "../../assets/images/bgylogo.png";

const THEME_PRIMARY_CSS = {
  blue: "#2563eb",
  purple: "#9333ea",
  green: "#16a34a",
  dark: "#475569",
};

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [currentTheme] = useState(() => localStorage.getItem("appTheme") || "modern");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const { logoDataUrl } = useBranding();
  const logoSrc = logoDataUrl || bgyLogo;

  // Always show light mode on public pages
  useEffect(() => { setIsDarkMode(false); }, []);

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const t = themeTokens[currentTheme];
  const primaryCss = THEME_PRIMARY_CSS[currentTheme] || THEME_PRIMARY_CSS.blue;
  const mutedClass = isDarkMode ? "text-slate-400" : t.subtleText;
  const strongMutedClass = isDarkMode ? "text-slate-300" : "text-slate-700";
  const panelClass = isDarkMode
    ? "bg-slate-900/95 border-white/10 text-white"
    : `${t.cardBg} border-slate-200 ${t.cardText}`;
  const sideClass = isDarkMode ? "bg-slate-950/40 border-white/10" : "bg-slate-100/95 border-slate-200";

  const addToast = (toast) =>
    setToasts((prev) => [...prev, { ...toast, id: Date.now() }]);
  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  const validate = () => {
    const errs = {};
    if (!password) errs.password = "New password is required.";
    else if (password.length < 8) errs.password = "Password must be at least 8 characters.";
    if (!confirmPassword) errs.confirmPassword = "Please confirm your password.";
    else if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return; }
    setErrors({});

    if (!token || !email) {
      addToast({ type: "error", title: "Invalid Link", message: "Reset link is missing token or email." });
      return;
    }

    setLoading(true);
    try {
      const data = await resetPassword({
        token,
        email,
        password,
        password_confirmation: confirmPassword,
      });
      addToast({
        type: "success",
        title: "Password Reset",
        message: data.message || "Your password has been updated. You can now log in.",
        duration: 5000,
      });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      addToast({ type: "error", title: "Reset Failed", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const EyeToggle = ({ show, onToggle, label }) => (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      className={`absolute right-3 top-[50px] -translate-y-1/2 p-1 rounded-md transition-colors ${
        isDarkMode ? "text-slate-400 hover:text-slate-200" : `${t.subtleText} hover:text-slate-900`
      }`}
    >
      {show ? (
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
  );

  return (
    <div className={`min-h-screen w-screen relative overflow-x-hidden ${isDarkMode ? "bg-slate-950" : t.pageBg}`}>
      {/* Toast */}
      <Toast toasts={toasts} onRemove={removeToast} currentTheme={currentTheme} />

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
              ? "bg-gradient-to-b from-slate-950/95 via-slate-950/85 to-slate-950/95"
              : "bg-gradient-to-b from-white/60 via-white/38 to-white/65"
          }`}
        />
      </div>

      <main className="relative z-20 pt-3 sm:pt-6 pb-3 sm:pb-6 px-3 sm:px-6">
        {/* Top bar */}
        <div className="w-full flex items-center justify-between mb-4">
          <button
            onClick={() => navigate("/login")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-[11px] font-black uppercase tracking-widest transition-colors font-kumbh ${
              isDarkMode
                ? "border-white/10 hover:bg-white/5 text-white"
                : "border-black/10 hover:bg-black/5 text-slate-900"
            }`}
          >
            <ArrowLeft size={14} /> Back to Login
          </button>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2.5 rounded-xl border transition-colors ${
              isDarkMode ? "border-white/10 bg-slate-900/70" : "border-black/10 bg-white/80"
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

        <div className="mx-auto w-full max-w-5xl">
          <div
            className={`rounded-[28px] sm:rounded-[40px] border shadow-2xl overflow-hidden backdrop-blur-2xl max-h-[calc(100dvh-6.5rem)] sm:max-h-[calc(100dvh-8rem)] overflow-y-auto custom-scrollbar ${panelClass}`}
          >
            <div className="grid lg:grid-cols-[360px_1fr]">
              {/* Sidebar */}
              <aside className={`p-5 sm:p-8 lg:p-8 border-b lg:border-b-0 lg:border-r flex flex-col ${sideClass}`}>
                <div className="mb-5 flex flex-col items-center text-center mt-4">
                  <div
                    className={`mb-3 w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 shadow-sm ${
                      isDarkMode ? "border-white/20 bg-white/95" : "border-slate-200 bg-white"
                    }`}
                  >
                    <img src={logoSrc} alt="Barangay Gulod Logo" className="w-full h-full object-cover rounded-full" />
                  </div>
                  <h2 className={`text-3xl sm:text-4xl font-black uppercase leading-[0.95] tracking-tight font-spartan ${t.primaryText}`}>
                    Barangay<br />Gulod<br />Novaliches
                  </h2>
                  <div className={`mt-2.5 w-12 h-1 rounded-full bg-gradient-to-r ${t.primaryGrad}`} />
                </div>

                <div className={`rounded-2xl p-4 sm:p-5 border mt-6 lg:mt-auto ${isDarkMode ? "bg-slate-950/70 border-white/10" : `${t.cardBg} border-slate-200`}`}>
                  <p className={`text-[10px] font-black uppercase tracking-widest font-kumbh mb-2 ${mutedClass}`}>
                    Instructions
                  </p>
                  <p className={`text-xs font-medium font-kumbh leading-relaxed ${strongMutedClass}`}>
                    Enter a new password for <span className={`font-black ${t.primaryText}`}>{email || "your account"}</span>. Make sure it's at least 8 characters long.
                  </p>
                </div>
              </aside>

              {/* Form */}
              <section className="p-5 sm:p-8 lg:p-8">
                <div className="max-w-xl">
                  <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-none mb-3 font-spartan">
                    Reset Password
                  </h1>
                  <p className={`text-sm leading-relaxed mb-6 font-kumbh ${strongMutedClass}`}>
                    Choose a strong new password for your account.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* New password */}
                    <div className="relative">
                      <InputField
                        label="New Password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        required
                        error={errors.password}
                        currentTheme={currentTheme}
                        icon="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        style={{ paddingRight: "3rem" }}
                      />
                      <EyeToggle
                        show={showPassword}
                        onToggle={() => setShowPassword((p) => !p)}
                        label={showPassword ? "Hide password" : "Show password"}
                      />
                    </div>

                    {/* Confirm password */}
                    <div className="relative">
                      <InputField
                        label="Confirm Password"
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your new password"
                        required
                        error={errors.confirmPassword}
                        currentTheme={currentTheme}
                        icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        style={{ paddingRight: "3rem" }}
                      />
                      <EyeToggle
                        show={showConfirm}
                        onToggle={() => setShowConfirm((p) => !p)}
                        label={showConfirm ? "Hide password" : "Show password"}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full sm:w-auto sm:min-w-[280px] py-4 px-8 bg-gradient-to-r ${t.primaryGrad} text-white rounded-[24px] font-black text-sm uppercase tracking-widest shadow-2xl disabled:opacity-30 transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto !mt-10 font-kumbh`}
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : "Reset Password"}
                    </button>
                  </form>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          .custom-scrollbar { scrollbar-width: thin; scrollbar-color: ${primaryCss} rgba(148,163,184,0.22); }
          .custom-scrollbar::-webkit-scrollbar { width: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: ${primaryCss}; border-radius: 999px; }
        `,
        }}
      />
    </div>
  );
};

export default ResetPasswordPage;

