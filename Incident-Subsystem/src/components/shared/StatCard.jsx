import React from "react";

const TONE_ALIASES = {
  primary: "blue",
  success: "emerald",
  warning: "amber",
  danger: "rose",
  purple: "violet",
  green: "emerald",
  red: "rose",
  gray: "slate",
  secondary: "indigo",
};

const TONE_MAP = {
  emerald: {
    card: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: "text-emerald-700",
    trend: "border-emerald-200/60 bg-white/70 text-emerald-700",
  },
  rose: {
    card: "border-rose-200 bg-rose-50 text-rose-800",
    icon: "text-rose-700",
    trend: "border-rose-200/60 bg-white/70 text-rose-700",
  },
  violet: {
    card: "border-violet-200 bg-violet-50 text-violet-800",
    icon: "text-violet-700",
    trend: "border-violet-200/60 bg-white/70 text-violet-700",
  },
  blue: {
    card: "border-blue-200 bg-blue-50 text-blue-800",
    icon: "text-blue-700",
    trend: "border-blue-200/60 bg-white/70 text-blue-700",
  },
  amber: {
    card: "border-amber-200 bg-amber-50 text-amber-800",
    icon: "text-amber-700",
    trend: "border-amber-200/60 bg-white/70 text-amber-700",
  },
  indigo: {
    card: "border-indigo-200 bg-indigo-50 text-indigo-800",
    icon: "text-indigo-700",
    trend: "border-indigo-200/60 bg-white/70 text-indigo-700",
  },
  teal: {
    card: "border-teal-200 bg-teal-50 text-teal-800",
    icon: "text-teal-700",
    trend: "border-teal-200/60 bg-white/70 text-teal-700",
  },
  slate: {
    card: "border-slate-200 bg-slate-50 text-slate-700",
    icon: "text-slate-600",
    trend: "border-slate-200/60 bg-white/70 text-slate-600",
  },
};

const TONE_MAP_DARK = {
  emerald: {
    card: "border-emerald-900/40 bg-emerald-900/25 text-emerald-100",
    icon: "text-emerald-200",
    trend: "border-emerald-900/60 bg-emerald-950/40 text-emerald-100",
  },
  rose: {
    card: "border-rose-900/40 bg-rose-900/25 text-rose-100",
    icon: "text-rose-200",
    trend: "border-rose-900/60 bg-rose-950/40 text-rose-100",
  },
  violet: {
    card: "border-violet-900/40 bg-violet-900/25 text-violet-100",
    icon: "text-violet-200",
    trend: "border-violet-900/60 bg-violet-950/40 text-violet-100",
  },
  blue: {
    card: "border-blue-900/40 bg-blue-900/25 text-blue-100",
    icon: "text-blue-200",
    trend: "border-blue-900/60 bg-blue-950/40 text-blue-100",
  },
  amber: {
    card: "border-amber-900/40 bg-amber-900/25 text-amber-100",
    icon: "text-amber-200",
    trend: "border-amber-900/60 bg-amber-950/40 text-amber-100",
  },
  indigo: {
    card: "border-indigo-900/40 bg-indigo-900/25 text-indigo-100",
    icon: "text-indigo-200",
    trend: "border-indigo-900/60 bg-indigo-950/40 text-indigo-100",
  },
  teal: {
    card: "border-teal-900/40 bg-teal-900/25 text-teal-100",
    icon: "text-teal-200",
    trend: "border-teal-900/60 bg-teal-950/40 text-teal-100",
  },
  slate: {
    card: "border-slate-800 bg-slate-900/60 text-slate-200",
    icon: "text-slate-200",
    trend: "border-slate-700 bg-slate-900/80 text-slate-200",
  },
};

const resolveTheme = (currentTheme) => {
  if (currentTheme) return currentTheme;
  if (typeof window === "undefined") return "modern";
  return localStorage.getItem("appTheme") || "modern";
};

const resolveTone = (tone) => TONE_ALIASES[tone] || tone || "slate";

const StatCard = ({
  label,
  value,
  subtitle,
  icon: Icon,
  tone = "slate",
  trend,
  className = "",
  currentTheme,
}) => {
  const resolvedTheme = resolveTheme(currentTheme);
  const isDark = resolvedTheme === "dark";
  const resolvedTone = resolveTone(tone);
  const palette = isDark
    ? TONE_MAP_DARK[resolvedTone] || TONE_MAP_DARK.slate
    : TONE_MAP[resolvedTone] || TONE_MAP.slate;
  const isComponentIcon =
    typeof Icon === "function" || (typeof Icon === "object" && Icon !== null);
  const displayValue =
    typeof value === "number" ? value.toLocaleString() : value ?? "-";

  return (
    <div
      className={`flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border ${palette.card} shadow-[0_10px_25px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(15,23,42,0.08)] transition-all ${className}`}
    >
      <div className="flex items-center gap-4 min-w-0">
        {Icon && (
          <div
            className={`p-2.5 rounded-xl ${isDark ? "bg-slate-900/40" : "bg-white/70"} shadow-sm`}
          >
            {isComponentIcon ? (
              <Icon size={17} className={`${palette.icon} opacity-80`} />
            ) : (
              <span className={`${palette.icon} text-sm`}>{Icon}</span>
            )}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-2xl font-semibold leading-none">{displayValue}</p>
          <p className="text-[11px] font-semibold opacity-70 mt-0.5 leading-tight">
            {label}
          </p>
          {subtitle && (
            <p className="text-[11px] font-medium opacity-60 mt-1 leading-snug">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {trend && (
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${palette.trend}`}
        >
          {trend}
        </span>
      )}
    </div>
  );
};

export default StatCard;
