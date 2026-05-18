import React from "react";
import themeTokens from "../../Themetokens";
import RegistryPageLoadingShell from "./RegistryPageLoadingShell";

export default function RouteLoadingFallback({
  message = "Loading page...",
}) {
  const currentTheme =
    typeof window !== "undefined"
      ? localStorage.getItem("appTheme") || "modern"
      : "modern";
  const t = themeTokens[currentTheme] || themeTokens.modern;
  const isDark = currentTheme === "dark";
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";

  const isResidentsRoute =
    pathname === "/residents" ||
    pathname === "/admin/residents" ||
    pathname === "/staff/residents";
  const isHouseholdsRoute =
    pathname === "/households" ||
    pathname === "/admin/households" ||
    pathname === "/staff/households";
  const isVerificationRoute =
    pathname === "/verification" ||
    pathname === "/admin/user-management" ||
    pathname === "/staff/user-management";

  if (isResidentsRoute || isHouseholdsRoute || isVerificationRoute) {
    const tableCols = isHouseholdsRoute ? 5 : isResidentsRoute ? 6 : 7;
    return (
      <RegistryPageLoadingShell
        t={t}
        isDark={isDark}
        tableCols={tableCols}
      />
    );
  }

  return (
    <div className={`min-h-screen ${t.pageBg} flex items-center justify-center px-4 py-8`}>
      <div className={`w-full max-w-sm rounded-[24px] border ${t.cardBorder} ${t.cardBg} p-6 text-center shadow-[0_18px_45px_rgba(15,23,42,0.12)]`}>
        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${t.primaryLight}`}>
          <div className={`h-6 w-6 animate-spin rounded-full border-[3px] border-slate-300 border-t-transparent`} />
        </div>
        <h2 className={`mt-4 font-spartan text-lg font-bold ${t.cardText}`}>
          Loading
        </h2>
        <p className={`mt-2 text-sm ${t.subtleText} font-kumbh`}>
          {message}
        </p>
      </div>
    </div>
  );
}
