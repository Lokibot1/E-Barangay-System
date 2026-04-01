import React from "react";
import themeTokens from "../../Themetokens";

export default function RouteLoadingFallback({
  message = "Loading page...",
}) {
  const currentTheme =
    typeof window !== "undefined"
      ? localStorage.getItem("appTheme") || "modern"
      : "modern";
  const t = themeTokens[currentTheme] || themeTokens.modern;

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
