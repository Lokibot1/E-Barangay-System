import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import themeTokens from "../../Themetokens";
import { getDefaultAuthenticatedPath } from "../../homepage/services/loginService";

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTheme = localStorage.getItem("appTheme") || "modern";
  const t = themeTokens[currentTheme] || themeTokens.modern;
  const isDark = currentTheme === "dark";

  const from = location.state?.from || "";

  return (
    <div className={`min-h-full ${t.pageBg} px-4 sm:px-6 py-10 font-kumbh`}>
      <div className="max-w-xl mx-auto">
        <div
          className={`rounded-3xl border p-6 sm:p-8 ${
            isDark ? "border-slate-800 bg-slate-900/70" : "border-slate-200 bg-white"
          }`}
        >
          <h1 className={`text-2xl font-bold font-spartan ${t.cardText}`}>
            Unauthorized
          </h1>
          <p className={`mt-2 text-sm ${t.subtleText}`}>
            You don&apos;t have permission to access this page.
          </p>
          {from ? (
            <p className={`mt-2 text-[12px] ${t.subtleText}`}>
              Blocked URL: <span className="font-semibold">{from}</span>
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate(getDefaultAuthenticatedPath(), { replace: true })}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border ${
                isDark
                  ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

