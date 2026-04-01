import React from "react";
import themeTokens from "../../Themetokens";

const TONE_STYLES = {
  success: {
    light: "bg-emerald-50 border-emerald-200 text-emerald-700",
    dark: "bg-emerald-900/20 border-emerald-800/40 text-emerald-300",
    dot: "bg-emerald-500",
  },
  warning: {
    light: "bg-amber-50 border-amber-200 text-amber-700",
    dark: "bg-amber-900/20 border-amber-800/40 text-amber-300",
    dot: "bg-amber-500",
  },
  danger: {
    light: "bg-rose-50 border-rose-200 text-rose-700",
    dark: "bg-rose-900/20 border-rose-800/40 text-rose-300",
    dot: "bg-rose-500",
  },
  info: {
    light: "bg-sky-50 border-sky-200 text-sky-700",
    dark: "bg-sky-900/20 border-sky-800/40 text-sky-300",
    dot: "bg-sky-500",
  },
  neutral: {
    light: "bg-slate-50 border-slate-200 text-slate-700",
    dark: "bg-slate-900/20 border-slate-700 text-slate-300",
    dot: "bg-slate-400",
  },
};

const getToneStyle = (tone, isDark) => {
  const style = TONE_STYLES[tone] || TONE_STYLES.neutral;
  return isDark ? style.dark : style.light;
};

export default function RecordTimeline({
  items = [],
  currentTheme = "modern",
  title = "Activity Timeline",
  emptyMessage = "No activity is available for this record yet.",
  compact = false,
}) {
  const t = themeTokens[currentTheme] || themeTokens.modern;
  const isDark = currentTheme === "dark";
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];

  return (
    <section
      className={`rounded-[20px] border ${t.cardBorder} ${t.cardBg} ${
        compact ? "p-3.5 sm:p-4" : "p-4 sm:p-5"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-left">
          <h3 className={`font-spartan ${compact ? "text-[13px]" : "text-sm"} font-bold ${t.cardText}`}>
            {title}
          </h3>
          <p className={`mt-1 ${compact ? "text-[11px]" : "text-xs"} font-kumbh ${t.subtleText}`}>
            Review the latest record events and status changes.
          </p>
        </div>
        <span
          className={`rounded-full ${compact ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]"} font-semibold font-kumbh ${
            isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"
          }`}
        >
          {safeItems.length} event{safeItems.length === 1 ? "" : "s"}
        </span>
      </div>

      {safeItems.length === 0 ? (
        <div
          className={`mt-4 rounded-2xl border border-dashed ${compact ? "px-3 py-4 text-xs" : "px-4 py-6 text-sm"} text-center ${t.subtleText}`}
        >
          {emptyMessage}
        </div>
      ) : (
        <div className={`${compact ? "mt-4 space-y-2.5" : "mt-5 space-y-3"}`}>
          {safeItems.map((item, index) => {
            const tone = item.tone || "neutral";
            const toneStyle = getToneStyle(tone, isDark);
            const dotStyle = (TONE_STYLES[tone] || TONE_STYLES.neutral).dot;

            return (
              <div key={item.id || `${item.title}-${index}`} className={`flex ${compact ? "gap-2.5" : "gap-3"}`}>
                <div className={`flex flex-col items-center ${compact ? "pt-0.5" : "pt-1"}`}>
                  <span className={`${compact ? "h-2.5 w-2.5" : "h-2.5 w-2.5"} rounded-full ${dotStyle}`} />
                  {index < safeItems.length - 1 && (
                    <span
                      className={`${compact ? "mt-0.5" : "mt-1"} w-px flex-1 ${
                        isDark ? "bg-slate-700" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
                <article
                  className={`flex-1 rounded-2xl border text-left ${toneStyle} ${
                    compact ? "px-3 py-2.5" : "px-4 py-3"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className={`font-kumbh ${compact ? "text-[13px]" : "text-sm"} font-semibold`}>{item.title}</h4>
                    {item.meta && (
                      <span className={`${compact ? "text-[10px]" : "text-[11px]"} font-medium opacity-80`}>
                        {item.meta}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className={`${compact ? "mt-0.5 text-[11px] leading-[1.125rem]" : "mt-1 text-xs leading-5"} opacity-90`}>
                      {item.description}
                    </p>
                  )}
                </article>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
