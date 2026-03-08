import { useState, useEffect } from "react";
import { Eye, EyeOff, KeyRound, Loader2, X } from "lucide-react";
import themeTokens from "../../Themetokens";
import { changePassword } from "../../homepage/services/loginService";

const RULES = [
  { id: "len",     label: "At least 8 characters",  test: (v) => v.length >= 8 },
  { id: "upper",   label: "One uppercase letter",    test: (v) => /[A-Z]/.test(v) },
  { id: "number",  label: "One number",              test: (v) => /[0-9]/.test(v) },
  { id: "special", label: "One special character",   test: (v) => /[^A-Za-z0-9]/.test(v) },
];

const PasswordInput = ({ label, value, onChange, show, onToggle, error, isDark, t, autoComplete }) => (
  <div>
    <label className={`block text-[12px] font-semibold mb-1.5 font-kumbh ${isDark ? "text-slate-300" : t.labelText}`}>
      {label} <span className="text-red-500">*</span>
    </label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className={`w-full px-3.5 py-2.5 pr-10 rounded-xl border text-[13px] font-kumbh transition-all outline-none ${
          error
            ? "border-red-400 focus:ring-2 focus:ring-red-200"
            : isDark
            ? "border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-slate-600 focus:border-slate-500"
            : `${t.inputBg} ${t.inputText} ${t.inputPlaceholder} ${t.inputBorder} focus:ring-2 ${t.primaryRing} ${t.primaryBorder}`
        }`}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
      <button
        type="button"
        onClick={onToggle}
        className={`absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors ${
          isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-400 hover:text-slate-700"
        }`}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
    {error && (
      <p className="mt-1 text-[12px] text-red-500 font-kumbh flex items-center gap-1">
        <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </p>
    )}
  </div>
);

const StrengthChecklist = ({ password, isDark }) => {
  if (!password) return null;
  return (
    <ul className="mt-2 space-y-1">
      {RULES.map((rule) => {
        const passed = rule.test(password);
        return (
          <li key={rule.id} className={`flex items-center gap-1.5 text-[11px] font-kumbh transition-colors ${passed ? "text-emerald-500" : isDark ? "text-slate-500" : "text-slate-400"}`}>
            <span className={`inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${passed ? "border-emerald-500 bg-emerald-500 text-white" : isDark ? "border-slate-600" : "border-slate-300"}`}>
              {passed && (
                <svg className="h-2 w-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
};

const ChangePasswordModal = ({ isOpen, onClose, currentTheme, onToast, onLogout }) => {
  const [fields, setFields] = useState({ current: "", next: "", confirm: "" });
  const [show, setShow]     = useState({ current: false, next: false, confirm: false });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const t = themeTokens[currentTheme] || themeTokens.modern;
  const isDark = currentTheme === "dark";

  useEffect(() => {
    if (isOpen) {
      setFields({ current: "", next: "", confirm: "" });
      setShow({ current: false, next: false, confirm: false });
      setErrors({});
      setTouched({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (Object.keys(touched).length === 0) return;
    const errs = {};
    if (touched.current && !fields.current) errs.current = "Current password is required.";
    if (touched.next) {
      if (!fields.next) errs.next = "New password is required.";
      else if (RULES.some((r) => !r.test(fields.next))) errs.next = "Password does not meet all requirements.";
    }
    if (touched.confirm) {
      if (!fields.confirm) errs.confirm = "Please confirm your new password.";
      else if (fields.confirm !== fields.next) errs.confirm = "Passwords do not match.";
    }
    setErrors(errs);
  }, [fields, touched]);

  if (!isOpen) return null;

  const set = (key) => (e) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const toggleShow = (key) => () => setShow((s) => ({ ...s, [key]: !s[key] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ current: true, next: true, confirm: true });

    const errs = {};
    if (!fields.current) errs.current = "Current password is required.";
    if (!fields.next) errs.next = "New password is required.";
    else if (RULES.some((r) => !r.test(fields.next))) errs.next = "Password does not meet all requirements.";
    if (!fields.confirm) errs.confirm = "Please confirm your new password.";
    else if (fields.confirm !== fields.next) errs.confirm = "Passwords do not match.";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      await changePassword({
        current_password: fields.current,
        new_password: fields.next,
        new_password_confirmation: fields.confirm,
      });
      onToast({
        type: "success",
        title: "Password Changed",
        message: "Your session will be logged out now.",
        duration: 3000,
      });
      onClose();
      setTimeout(() => onLogout(), 2500);
    } catch (err) {
      setErrors({ current: err.message });
    } finally {
      setLoading(false);
    }
  };

  const allRulesPassed = RULES.every((r) => r.test(fields.next));
  const canSubmit = fields.current && fields.next && fields.confirm && allRulesPassed && !loading;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className={`w-full max-w-md rounded-[24px] border shadow-2xl ${isDark ? "bg-slate-900 border-slate-700 text-slate-100" : `bg-white border-slate-200 ${t.cardText}`}`}>

        {/* Header */}
        <div className={`flex items-center justify-between border-b px-5 py-4 ${isDark ? "border-slate-700" : "border-slate-100"}`}>
          <div className="flex items-center gap-2.5">
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <h2 className={`text-[15px] font-bold font-spartan leading-tight ${isDark ? "text-slate-100" : t.cardText}`}>
                Change Password
              </h2>
              <p className={`text-[11px] font-kumbh ${isDark ? "text-slate-400" : t.subtleText}`}>
                Update your account credentials
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={`rounded-lg p-1.5 transition-colors ${isDark ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <PasswordInput
            label="Current Password"
            value={fields.current}
            onChange={set("current")}
            show={show.current}
            onToggle={toggleShow("current")}
            error={errors.current}
            isDark={isDark}
            t={t}
            autoComplete="current-password"
          />

          <div>
            <PasswordInput
              label="New Password"
              value={fields.next}
              onChange={set("next")}
              show={show.next}
              onToggle={toggleShow("next")}
              error={errors.next}
              isDark={isDark}
              t={t}
              autoComplete="new-password"
            />
            <StrengthChecklist password={fields.next} isDark={isDark} />
          </div>

          <PasswordInput
            label="Confirm New Password"
            value={fields.confirm}
            onChange={set("confirm")}
            show={show.confirm}
            onToggle={toggleShow("confirm")}
            error={errors.confirm}
            isDark={isDark}
            t={t}
            autoComplete="new-password"
          />

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`flex-1 rounded-xl border py-2.5 text-[13px] font-semibold font-kumbh transition-colors ${isDark ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`flex-1 rounded-xl py-2.5 text-[13px] font-bold font-kumbh text-white transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r ${t.primaryGrad} shadow-md`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-1.5">
                  <Loader2 className="h-4 w-4 animate-spin" /> Updating…
                </span>
              ) : (
                "Update Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
