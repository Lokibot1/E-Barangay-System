import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import InputField from "./InputField";
import themeTokens from "../../Themetokens";

const ForgotPasswordModal = ({
  isOpen,
  onClose,
  email: initialEmail,
  currentTheme,
  isDarkMode,
  onToast,
}) => {
  const [email, setEmail] = useState(initialEmail || "");
  const [loading, setLoading] = useState(false);

  const t = themeTokens[currentTheme] || themeTokens.blue;

  // Sync pre-filled email every time the modal opens
  useEffect(() => {
    if (isOpen) setEmail(initialEmail || "");
  }, [isOpen, initialEmail]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { forgotPassword } = await import("../../services/sub-system-3/loginService");
      const data = await forgotPassword(email.trim());
      onToast({
        type: "success",
        title: "Email Sent",
        message: data.message || "Password reset link sent to your email.",
      });
      onClose();
    } catch (err) {
      onToast({
        type: "error",
        title: "Failed",
        message: err.message || "Could not send reset email. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const overlayBg = isDarkMode
    ? "bg-slate-900 border-white/10 text-white"
    : `bg-white border-black/10 ${t.cardText}`;
  const mutedClass = isDarkMode ? "text-slate-400" : t.subtleText;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div className={`w-full max-w-md rounded-[28px] border shadow-2xl p-8 ${overlayBg}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter font-spartan">
              Forgot Password
            </h2>
            <p className={`text-sm mt-1 font-kumbh ${mutedClass}`}>
              Enter your email and we'll send you a reset link.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isDarkMode
                ? "hover:bg-white/10 text-slate-400 hover:text-white"
                : "hover:bg-slate-100 text-slate-500 hover:text-slate-800"
            }`}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            currentTheme={currentTheme}
            icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            autoComplete="email"
          />

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className={`w-full py-3.5 rounded-2xl text-white font-black text-sm uppercase tracking-widest font-kumbh transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r ${t.primaryGrad} shadow-lg`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" /> Sending…
              </span>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
