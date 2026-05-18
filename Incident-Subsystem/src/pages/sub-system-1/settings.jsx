import React, { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { Image, Upload, Trash2, Users, ClipboardList } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import themeTokens from "../../Themetokens";
import { isAdmin } from "../../homepage/services/loginService";
import { useBranding } from "../../context/BrandingContext";
import CreateAccounts from "../sub-system-3/admin/CreateAccounts";
import ActivityLogsView from "../../components/shared/ActivityLogsView";
import {
  isSupportedLogoFile,
  readImageFileAsDataUrl,
} from "../../utils/branding";
import defaultLogo from "../../assets/images/bgylogo.png";
import { useRef } from "react";
import {
  Activity,
  BellRing,
  Download,
  HardDriveDownload,
  ShieldCheck,
} from "lucide-react";
import {
  disableTwoFactor,
  enableTwoFactor,
  getNotificationPreferences,
  getTwoFactorConfig,
  listCommunicationLogs,
  queueCommunicationEvent,
  saveNotificationPreferences,
} from "../../utils/securityCenter";
import {
  buildLocalBackupSnapshot,
  clearClientErrorLogs,
  listClientErrorLogs,
  restoreLocalBackupSnapshot,
} from "../../utils/systemDiagnostics";

export default function Settings() {
  const { tr } = useLanguage();
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("appTheme") || "modern",
  );
  const VALID_TABS = [
    "accounts",
    "branding",
    "logs",
  ];
  const [activeTab, setActiveTab] = useState("accounts");
  const [logoError, setLogoError] = useState("");
  const [notificationPrefs, setNotificationPrefs] = useState(
    getNotificationPreferences(),
  );
  const [twoFactorConfig, setTwoFactorConfig] = useState(getTwoFactorConfig());
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [securityMessage, setSecurityMessage] = useState("");
  const [backupMessage, setBackupMessage] = useState("");
  const [diagnosticsMessage, setDiagnosticsMessage] = useState("");
  const [communicationLogs, setCommunicationLogs] = useState([]);
  const [clientLogs, setClientLogs] = useState([]);
  const backupFileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = (e) => setCurrentTheme(e.detail);
    window.addEventListener("themeChange", handler);
    return () => window.removeEventListener("themeChange", handler);
  }, []);

  const t = themeTokens[currentTheme] || themeTokens.modern;
  const isDark = currentTheme === "dark";
  const { logoDataUrl, updateLogo, resetLogo } = useBranding();
  const adminAccess = isAdmin();
  const logoPreview = logoDataUrl || defaultLogo;
  const MAX_LOGO_SIZE = 2 * 1024 * 1024;

  const refreshSecurityState = () => {
    setNotificationPrefs(getNotificationPreferences());
    setTwoFactorConfig(getTwoFactorConfig());
    setCommunicationLogs(listCommunicationLogs().slice(0, 12));
  };

  const refreshDiagnosticsState = () => {
    setClientLogs(listClientErrorLogs().slice(0, 30));
  };

  useEffect(() => {
    if (!adminAccess) {
      navigate("/profile", { replace: true });
      return;
    }

    const tab = new URLSearchParams(location.search).get("tab");
    setActiveTab(VALID_TABS.includes(tab) ? tab : "accounts");
  }, [adminAccess, location.search, navigate]);

  useEffect(() => {
    if (!adminAccess) return;
    refreshSecurityState();
    refreshDiagnosticsState();
  }, [adminAccess]);

  if (!adminAccess) {
    return null;
  }

  const handleLogoSelect = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setLogoError("");
    if (!adminAccess) {
      setLogoError("Only admins can update the barangay logo.");
      return;
    }

    if (!isSupportedLogoFile(file)) {
      setLogoError("Please upload a PNG or JPG image.");
      return;
    }

    if (file.size > MAX_LOGO_SIZE) {
      setLogoError("Logo must be 2MB or less.");
      return;
    }

    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      await updateLogo(dataUrl);
    } catch (error) {
      setLogoError(error?.message || "Failed to save logo.");
    }
  };

  const handleLogoReset = async () => {
    setLogoError("");
    if (!adminAccess) {
      setLogoError("Only admins can update the barangay logo.");
      return;
    }

    try {
      await resetLogo();
    } catch (error) {
      setLogoError(error?.message || "Failed to remove logo.");
    }
  };

  const handleNotificationToggle = (key) => {
    const updated = saveNotificationPreferences({
      ...notificationPrefs,
      [key]: !notificationPrefs[key],
    });
    setNotificationPrefs(updated);
    setSecurityMessage("Notification preferences updated.");
  };

  const handleEnableTwoFactor = () => {
    try {
      const nextConfig = enableTwoFactor({ passcode: twoFactorCode });
      setTwoFactorConfig(nextConfig);
      setTwoFactorCode("");
      setSecurityMessage("Two-factor verification is now enabled.");
      queueCommunicationEvent({
        category: "security",
        title: "Two-factor enabled",
        message: "Admin two-factor verification was enabled from settings.",
      });
      refreshSecurityState();
    } catch (error) {
      setSecurityMessage(error?.message || "Unable to enable two-factor.");
    }
  };

  const handleDisableTwoFactor = () => {
    disableTwoFactor();
    setTwoFactorConfig(getTwoFactorConfig());
    setSecurityMessage("Two-factor verification has been disabled.");
    queueCommunicationEvent({
      category: "security",
      title: "Two-factor disabled",
      message: "Admin two-factor verification was disabled from settings.",
    });
    refreshSecurityState();
  };

  const handleExportBackup = () => {
    try {
      const snapshot = buildLocalBackupSnapshot();
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ebarangay-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setBackupMessage("Backup exported successfully.");
    } catch (error) {
      setBackupMessage(error?.message || "Unable to export backup.");
    }
  };

  const handleRestoreBackup = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const text = await file.text();
      const snapshot = JSON.parse(text);
      restoreLocalBackupSnapshot(snapshot);
      refreshSecurityState();
      refreshDiagnosticsState();
      setBackupMessage("Backup restored successfully. Refresh pages if needed.");
      queueCommunicationEvent({
        category: "security",
        title: "Local backup restored",
        message: "A local settings backup was restored from the admin panel.",
      });
    } catch (error) {
      setBackupMessage(error?.message || "Backup restore failed.");
    }
  };

  const handleClearDiagnostics = () => {
    clearClientErrorLogs();
    refreshDiagnosticsState();
    setDiagnosticsMessage("Client diagnostics logs were cleared.");
  };

  const tabItems = [
    { key: "accounts", label: "Account Management", icon: <Users size={14} /> },
    { key: "branding", label: "Barangay Logo", icon: <Image size={14} /> },
    { key: "logs", label: "Activity Logs", icon: <ClipboardList size={14} /> },
  ];

  return (
    <div className={`min-h-full ${t.pageBg} p-4 sm:p-5 lg:p-6`}>
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="space-y-4 text-left">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className={`text-lg font-bold font-spartan ${t.cardText}`}>
                Settings (CMS)
              </h1>
              <p className={`text-xs font-kumbh ${t.subtleText}`}>
                Manage official accounts, barangay branding, and system activity logs.
              </p>
            </div>
          </div>

          <div className={`flex flex-wrap items-center gap-5 border-b ${t.cardBorder} pt-3`}>
            {tabItems.map(({ key, label, icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => { setActiveTab(key); navigate(`/admin/settings?tab=${key}`); }}
                className={`relative pb-2 text-[13px] font-semibold font-kumbh transition inline-flex items-center gap-2 ${
                  activeTab === key ? `${t.primaryText}` : `${t.subtleText} hover:opacity-80`
                }`}
              >
                {icon}
                {label}
                {activeTab === key && (
                  <span className={`absolute left-0 right-0 -bottom-px h-0.5 ${t.primarySolid}`} />
                )}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "accounts" && <CreateAccounts />}

        {activeTab === "branding" && (
          <section className={`${t.cardBg} border ${t.cardBorder} rounded-[22px] overflow-hidden shadow-[0_18px_45px_-36px_rgba(15,23,42,0.35)] text-left`}>
            <div
              className={`border-b px-5 py-4 ${isDark ? "border-slate-700" : "border-slate-200"}`}
              style={{
                background: isDark
                  ? "linear-gradient(135deg, rgba(15,23,42,0.55), rgba(30,41,59,0.35))"
                  : "linear-gradient(135deg, rgba(248,250,252,0.98), rgba(241,245,249,0.88))",
              }}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  isDark ? "bg-slate-900 text-slate-200" : "bg-white text-slate-700 shadow-sm"
                }`}>
                  <Image className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h2 className={`text-[15px] font-bold font-spartan leading-tight ${t.cardText}`}>
                    {tr.sub1.barangayLogo || 'Barangay Logo'}
                  </h2>
                  <p className={`text-[12px] font-kumbh leading-4 ${t.subtleText}`}>
                    {tr.sub1.barangayLogoDesc}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-5 py-5 space-y-5">
              <div className="grid gap-4 sm:grid-cols-[96px_1fr] sm:items-center">
                <div className="flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden border border-slate-200 bg-white shadow-sm">
                    <img src={logoPreview} alt="Barangay Logo" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div>
                  <p className={`text-[9px] font-semibold uppercase tracking-[0.18em] font-kumbh ${t.subtleText}`}>
                    Current logo
                  </p>
                  <p className={`mt-1 text-[13px] font-semibold font-kumbh ${t.cardText}`}>
                    PNG or JPG, up to 2MB. Changes apply immediately.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-kumbh font-semibold border transition-all ${
                    adminAccess
                      ? `${t.primaryText} ${t.primaryBorder} hover:opacity-90 cursor-pointer bg-white`
                      : "opacity-60 cursor-not-allowed border-slate-200 text-slate-400"
                  }`}
                >
                  <Upload size={14} />
                  Upload logo
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleLogoSelect}
                    disabled={!adminAccess}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleLogoReset}
                  disabled={!logoDataUrl || !adminAccess}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-kumbh font-semibold border transition-all ${
                    logoDataUrl && adminAccess
                      ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                      : "opacity-60 cursor-not-allowed border-slate-200 text-slate-400"
                  }`}
                >
                  <Trash2 size={14} />
                  Remove custom logo
                </button>
              </div>

              {logoError && (
                <p className="text-[12px] font-kumbh text-rose-600">
                  {logoError}
                </p>
              )}
              {!adminAccess && (
                <p className={`text-[12px] font-kumbh ${t.subtleText}`}>
                  Only admins can update the barangay logo.
                </p>
              )}
            </div>
          </section>
        )}

        {activeTab === "logs" && (
          <ActivityLogsView t={t} isDark={isDark} />
        )}

        {activeTab === "security" && (
          <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <div className={`${t.cardBg} border ${t.cardBorder} rounded-[22px] p-5 text-left shadow-[0_18px_45px_-36px_rgba(15,23,42,0.35)]`}>
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isDark ? "bg-slate-900 text-slate-100" : "bg-emerald-50 text-emerald-600"}`}>
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h2 className={`text-[15px] font-bold font-spartan ${t.cardText}`}>
                    Two-Factor Verification
                  </h2>
                  <p className={`mt-1 text-[12px] font-kumbh ${t.subtleText}`}>
                    Require an extra 6-digit code before opening admin routes.
                  </p>
                </div>
              </div>

              <div className={`mt-5 rounded-[20px] border ${t.cardBorder} ${t.inputBg} p-4`}>
                <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] font-kumbh ${t.subtleText}`}>
                  Current Status
                </p>
                <p className={`mt-2 text-[15px] font-bold font-spartan ${t.cardText}`}>
                  {twoFactorConfig.enabled ? "Enabled" : "Disabled"}
                </p>
                <p className={`mt-1 text-[12px] font-kumbh ${t.subtleText}`}>
                  Backup codes available: {twoFactorConfig.backupCodes.length}
                </p>
              </div>

              <div className="mt-5 space-y-3">
                <label className="block">
                  <span className={`mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] font-kumbh ${t.subtleText}`}>
                    6-digit access code
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={twoFactorCode}
                    onChange={(event) => setTwoFactorCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    className={`w-full rounded-2xl border ${t.cardBorder} ${t.inputBg} ${t.inputText} px-4 py-3 text-sm font-spartan tracking-[0.24em] outline-none`}
                  />
                </label>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleEnableTwoFactor}
                    className="rounded-full bg-emerald-600 px-4 py-2 text-[12px] font-semibold font-kumbh text-white"
                  >
                    Enable 2FA
                  </button>
                  <button
                    type="button"
                    onClick={handleDisableTwoFactor}
                    disabled={!twoFactorConfig.enabled}
                    className={`rounded-full border px-4 py-2 text-[12px] font-semibold font-kumbh ${
                      twoFactorConfig.enabled
                        ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                        : "cursor-not-allowed border-slate-200 text-slate-400"
                    }`}
                  >
                    Disable 2FA
                  </button>
                </div>
              </div>

              {securityMessage && (
                <p className="mt-4 text-[12px] font-kumbh text-emerald-600">
                  {securityMessage}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <section className={`${t.cardBg} border ${t.cardBorder} rounded-[22px] p-5 text-left shadow-[0_18px_45px_-36px_rgba(15,23,42,0.35)]`}>
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isDark ? "bg-slate-900 text-slate-100" : "bg-sky-50 text-sky-600"}`}>
                    <BellRing size={18} />
                  </div>
                  <div>
                    <h2 className={`text-[15px] font-bold font-spartan ${t.cardText}`}>
                      Notification Preferences
                    </h2>
                    <p className={`mt-1 text-[12px] font-kumbh ${t.subtleText}`}>
                      Control which alerts are queued for document, case, appointment, and security events.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    ["inApp", "In-app alerts"],
                    ["email", "Email queue"],
                    ["sms", "SMS queue"],
                    ["documents", "Document updates"],
                    ["cases", "Case updates"],
                    ["appointments", "Appointment updates"],
                    ["security", "Security events"],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleNotificationToggle(key)}
                      className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left ${
                        notificationPrefs[key]
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : `${t.cardBorder} ${t.inputBg} ${t.cardText}`
                      }`}
                    >
                      <span className="text-[12px] font-kumbh font-semibold">{label}</span>
                      <span className="text-[11px] font-kumbh uppercase tracking-[0.16em]">
                        {notificationPrefs[key] ? "On" : "Off"}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section className={`${t.cardBg} border ${t.cardBorder} rounded-[22px] p-5 text-left shadow-[0_18px_45px_-36px_rgba(15,23,42,0.35)]`}>
                <h2 className={`text-[15px] font-bold font-spartan ${t.cardText}`}>
                  Recent Communication Queue
                </h2>
                <div className="mt-4 space-y-3">
                  {communicationLogs.length === 0 ? (
                    <p className={`text-[12px] font-kumbh ${t.subtleText}`}>
                      No queued communication events yet.
                    </p>
                  ) : (
                    communicationLogs.map((entry) => (
                      <div key={entry.id} className={`rounded-2xl border ${t.cardBorder} ${t.inputBg} px-4 py-3`}>
                        <div className="flex items-center justify-between gap-3">
                          <p className={`text-[12px] font-bold font-spartan ${t.cardText}`}>
                            {entry.title}
                          </p>
                          <span className={`text-[10px] font-kumbh font-semibold uppercase tracking-[0.16em] ${t.subtleText}`}>
                            {entry.channel}
                          </span>
                        </div>
                        <p className={`mt-2 text-[12px] font-kumbh ${t.subtleText}`}>
                          {entry.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </section>
        )}

        {activeTab === "backup" && (
          <section className="grid gap-4 xl:grid-cols-2">
            <div className={`${t.cardBg} border ${t.cardBorder} rounded-[22px] p-5 text-left shadow-[0_18px_45px_-36px_rgba(15,23,42,0.35)]`}>
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isDark ? "bg-slate-900 text-slate-100" : "bg-emerald-50 text-emerald-600"}`}>
                  <Download size={18} />
                </div>
                <div>
                  <h2 className={`text-[15px] font-bold font-spartan ${t.cardText}`}>
                    Export Local Backup
                  </h2>
                  <p className={`mt-1 text-[12px] font-kumbh ${t.subtleText}`}>
                    Download a JSON snapshot of local app settings, drafts, request receipts, and diagnostics logs.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleExportBackup}
                className="mt-5 rounded-full bg-emerald-600 px-4 py-2 text-[12px] font-semibold font-kumbh text-white"
              >
                Download Backup
              </button>
            </div>

            <div className={`${t.cardBg} border ${t.cardBorder} rounded-[22px] p-5 text-left shadow-[0_18px_45px_-36px_rgba(15,23,42,0.35)]`}>
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isDark ? "bg-slate-900 text-slate-100" : "bg-sky-50 text-sky-600"}`}>
                  <Upload size={18} />
                </div>
                <div>
                  <h2 className={`text-[15px] font-bold font-spartan ${t.cardText}`}>
                    Restore Backup
                  </h2>
                  <p className={`mt-1 text-[12px] font-kumbh ${t.subtleText}`}>
                    Restore a previously exported snapshot from this device. Existing local values with matching keys will be overwritten.
                  </p>
                </div>
              </div>

              <input
                ref={backupFileInputRef}
                type="file"
                accept="application/json"
                onChange={handleRestoreBackup}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => backupFileInputRef.current?.click()}
                className={`mt-5 rounded-full border ${t.cardBorder} ${t.inputBg} ${t.cardText} px-4 py-2 text-[12px] font-semibold font-kumbh`}
              >
                Upload Backup File
              </button>
            </div>

            {backupMessage && (
              <p className="xl:col-span-2 text-[12px] font-kumbh text-emerald-600">
                {backupMessage}
              </p>
            )}
          </section>
        )}

        {activeTab === "diagnostics" && (
          <section className={`${t.cardBg} border ${t.cardBorder} rounded-[22px] p-5 text-left shadow-[0_18px_45px_-36px_rgba(15,23,42,0.35)]`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className={`text-[15px] font-bold font-spartan ${t.cardText}`}>
                  Client Diagnostics Logs
                </h2>
                <p className={`mt-1 text-[12px] font-kumbh ${t.subtleText}`}>
                  Review frontend errors captured from HTTP failures, runtime exceptions, and unhandled rejections.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearDiagnostics}
                className="rounded-full border border-rose-200 px-4 py-2 text-[12px] font-semibold font-kumbh text-rose-600 hover:bg-rose-50"
              >
                Clear Logs
              </button>
            </div>

            {diagnosticsMessage && (
              <p className="mt-4 text-[12px] font-kumbh text-emerald-600">
                {diagnosticsMessage}
              </p>
            )}

            <div className="mt-5 space-y-3">
              {clientLogs.length === 0 ? (
                <p className={`text-[12px] font-kumbh ${t.subtleText}`}>
                  No client diagnostics captured yet.
                </p>
              ) : (
                clientLogs.map((entry) => (
                  <div key={entry.id} className={`rounded-2xl border ${t.cardBorder} ${t.inputBg} px-4 py-4`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className={`text-[12px] font-bold font-spartan ${t.cardText}`}>
                        {entry.source}
                      </p>
                      <span className={`text-[10px] font-kumbh font-semibold uppercase tracking-[0.16em] ${t.subtleText}`}>
                        {entry.severity}
                      </span>
                    </div>
                    <p className={`mt-2 text-[12px] font-kumbh ${t.cardText}`}>
                      {entry.message}
                    </p>
                    <p className={`mt-2 text-[11px] font-kumbh ${t.subtleText}`}>
                      {entry.createdAt}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
