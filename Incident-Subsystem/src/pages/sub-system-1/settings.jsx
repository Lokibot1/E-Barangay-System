import React, { useEffect, useState } from "react";
import { Image, Upload, Trash2, UserRound } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import themeTokens from "../../Themetokens";
import { isAdmin } from "../../homepage/services/loginService";
import { useBranding } from "../../context/BrandingContext";
import ProfilePage from "../shared/ProfilePage";
import {
  isSupportedLogoFile,
  readImageFileAsDataUrl,
} from "../../utils/branding";
import defaultLogo from "../../assets/images/bgylogo.png";

export default function Settings() {
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("appTheme") || "modern",
  );
  const [activeTab, setActiveTab] = useState("branding");
  const [logoError, setLogoError] = useState("");
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

  useEffect(() => {
    if (!adminAccess) {
      navigate("/profile", { replace: true });
      return;
    }

    const tab = new URLSearchParams(location.search).get("tab");
    setActiveTab(tab === "branding" ? "branding" : "profile");
  }, [adminAccess, location.search, navigate]);

  if (!adminAccess) {
    return null;
  }

  if (activeTab === "profile") {
    return <ProfilePage />;
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

  return (
    <div className={`min-h-full ${t.pageBg} p-4 sm:p-5 lg:p-6`}>
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="space-y-4 text-left">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className={`text-lg font-bold font-spartan ${t.cardText}`}>
                Settings
              </h1>
              <p className={`text-xs font-kumbh ${t.subtleText}`}>
                Manage barangay branding settings.
              </p>
            </div>
          </div>

          <div className={`flex items-center gap-5 border-b ${t.cardBorder} pt-3`}>
            <button
              type="button"
              onClick={() => {
                setActiveTab("profile");
                navigate("/admin/settings?tab=profile");
              }}
              className={`relative pb-2 text-[13px] font-semibold font-kumbh transition inline-flex items-center gap-2 ${
                activeTab === "profile"
                  ? `${t.primaryText}`
                  : `${t.subtleText} hover:opacity-80`
              }`}
            >
              <UserRound size={14} />
              View Profile
              {activeTab === "profile" && (
                <span className={`absolute left-0 right-0 -bottom-px h-0.5 ${t.primarySolid}`} />
              )}
            </button>
              <button
                type="button"
              onClick={() => {
                setActiveTab("branding");
                navigate("/admin/settings?tab=branding");
              }}
                className={`relative pb-2 text-[13px] font-semibold font-kumbh transition inline-flex items-center gap-2 ${
                  activeTab === "branding"
                    ? `${t.primaryText}`
                    : `${t.subtleText} hover:opacity-80`
                }`}
            >
              <Image size={14} />
              Barangay Logo
              {activeTab === "branding" && (
                <span className={`absolute left-0 right-0 -bottom-px h-0.5 ${t.primarySolid}`} />
              )}
            </button>
          </div>
        </div>

        {activeTab === "profile" ? (
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
                  <UserRound className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h2 className={`text-[15px] font-bold font-spartan leading-tight ${t.cardText}`}>
                    Profile Overview
                  </h2>
                  <p className={`text-[12px] font-kumbh leading-4 ${t.subtleText}`}>
                    Review your personal information and security settings.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-5 py-5">
              <div className={`rounded-2xl border px-4 py-4 ${
                isDark ? "border-slate-700 bg-slate-900/40" : "border-slate-200/70 bg-slate-50/80"
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className={`text-[13px] font-semibold font-kumbh ${t.cardText}`}>
                      Open your full profile page
                    </p>
                    <p className={`text-[12px] font-kumbh ${t.subtleText}`}>
                      View account details, residency info, and activity logs.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/admin/profile")}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold font-kumbh text-white transition ${t.primarySolid}`}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : (
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
                    Barangay Logo
                  </h2>
                  <p className={`text-[12px] font-kumbh leading-4 ${t.subtleText}`}>
                    Update the logo used across the portal.
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
      </div>
    </div>
  );
}
