import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import themeTokens from "../../Themetokens";
import {
  canAccessAdminPanel,
  canAccessStaffPanel,
  canManageSystemSettings,
  getDefaultAuthenticatedPath,
  getUser,
  isAuthenticated,
} from "../../homepage/services/loginService";
import {
  getTwoFactorConfig,
  queueCommunicationEvent,
  requiresSecondFactor,
  verifySecondFactorCode,
} from "../../utils/securityCenter";

const SecondFactorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("appTheme") || "modern",
  );
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const user = getUser();
  const adminAccess = canAccessAdminPanel();
  const backOfficeAccess = canAccessStaffPanel();
  const t = themeTokens[currentTheme] || themeTokens.modern;
  const config = getTwoFactorConfig(
    user?.id ?? user?.resident_id ?? user?.residentId ?? user?.email,
  );
  const fromPath = location.state?.from || getDefaultAuthenticatedPath();

  useEffect(() => {
    const handleThemeChange = (event) => {
      setCurrentTheme(event.detail);
    };

    window.addEventListener("themeChange", handleThemeChange);
    return () => window.removeEventListener("themeChange", handleThemeChange);
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login", { replace: true });
      return;
    }

    if (!backOfficeAccess) {
      navigate(getDefaultAuthenticatedPath(), { replace: true });
      return;
    }

    if (!requiresSecondFactor(user)) {
      navigate(fromPath, { replace: true });
    }
  }, [backOfficeAccess, fromPath, navigate, user]);

  const handleVerify = async (event) => {
    event.preventDefault();
    setError("");

    const normalizedCode = String(code || "").trim().toUpperCase();
    if (!normalizedCode) {
      setError("Enter your 6-digit code or one backup code.");
      return;
    }

    setSubmitting(true);
    try {
      const result = verifySecondFactorCode(
        normalizedCode,
        user?.id ?? user?.resident_id ?? user?.residentId ?? user?.email,
      );

      if (!result.success) {
        setError("That verification code is invalid.");
        return;
      }

      queueCommunicationEvent({
        category: "security",
        title: adminAccess ? "Admin access verified" : "Staff access verified",
        message: result.backupUsed
          ? "A back-office session was verified using a backup security code."
          : "A back-office session passed second-step verification.",
        metadata: {
          route: fromPath,
          backupUsed: result.backupUsed,
        },
      });

      navigate(fromPath, { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`${t.pageBg} min-h-screen flex items-center justify-center px-4 py-8`}>
      <div className={`w-full max-w-lg rounded-[28px] border ${t.cardBorder} ${t.cardBg} shadow-2xl overflow-hidden`}>
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-7 text-white">
          <p className="text-[11px] font-kumbh font-semibold uppercase tracking-[0.24em] text-white/75">
            Portal Security
          </p>
          <h1 className="mt-2 text-3xl font-bold font-spartan leading-none">
            Second-Step Verification
          </h1>
          <p className="mt-3 text-sm font-kumbh text-white/85">
            Enter your back-office access code before opening the control panel.
          </p>
        </div>

        <form onSubmit={handleVerify} className="px-8 py-7 space-y-6">
          <div className={`rounded-2xl border ${t.cardBorder} ${t.inlineBg} px-5 py-4`}>
            <p className={`text-[11px] font-kumbh font-semibold uppercase tracking-[0.16em] ${t.subtleText}`}>
              Signed in as
            </p>
            <p className={`mt-2 text-lg font-semibold font-spartan ${t.cardText}`}>
              {user?.name || user?.email || "Administrator"}
            </p>
            <p className={`mt-1 text-sm font-kumbh ${t.subtleText}`}>
              Destination: {fromPath}
            </p>
          </div>

          <div>
            <label className={`block text-[11px] font-kumbh font-semibold uppercase tracking-[0.16em] ${t.subtleText} mb-2`}>
              Verification Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(event) => {
                setCode(event.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12));
                setError("");
              }}
              placeholder="Enter 6-digit code"
              className={`w-full rounded-2xl border ${t.cardBorder} ${t.inputBg} ${t.inputText} px-4 py-4 text-center text-xl font-spartan tracking-[0.35em] outline-none`}
            />
            {error && (
              <p className="mt-2 text-sm font-kumbh text-rose-600">{error}</p>
            )}
          </div>

          <div className={`rounded-2xl border ${t.cardBorder} ${t.inlineBg} px-5 py-4 space-y-2`}>
            <p className={`text-[11px] font-kumbh font-semibold uppercase tracking-[0.16em] ${t.subtleText}`}>
              Backup Codes Remaining
            </p>
            <p className={`text-sm font-kumbh ${t.cardText}`}>
              {config.backupCodes.length} available
            </p>
            <p className={`text-xs font-kumbh ${t.subtleText}`}>
              Backup codes can be used once each if the main 6-digit code is not available.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {canManageSystemSettings() && (
              <button
                type="button"
                onClick={() => navigate("/admin/settings?tab=security", { replace: true })}
                className={`flex-1 rounded-2xl border ${t.cardBorder} ${t.inputBg} ${t.cardText} px-5 py-3 text-sm font-kumbh font-semibold`}
              >
                Open Security Settings
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-kumbh font-semibold text-white disabled:opacity-60"
            >
              {submitting ? "Verifying..." : "Verify Access"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SecondFactorPage;
