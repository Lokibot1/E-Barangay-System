import React from "react";
import SkeletonLoader from "../sub-system-1/common/SkeletonLoader";

const SkeletonBar = ({ className = "", isDark = false }) => (
  <div
    className={`animate-pulse rounded-xl ${
      isDark ? "bg-slate-700/60" : "bg-slate-200/80"
    } ${className}`}
  />
);

export default function RegistryPageLoadingShell({
  t,
  isDark = false,
  tableCols = 7,
  statCount = 4,
}) {
  return (
    <div className={`min-h-screen ${t.pageBg} px-3 py-4 sm:px-4 lg:px-5`}>
      <div className="mx-auto w-full max-w-[1600px] space-y-6 pt-4 sm:pt-5">
        <section className="max-w-3xl space-y-3 text-left">
          <SkeletonBar className="h-10 w-64" isDark={isDark} />
          <SkeletonBar className="h-3.5 w-full max-w-2xl" isDark={isDark} />
          <SkeletonBar className="h-3.5 w-4/5 max-w-xl" isDark={isDark} />
        </section>

        <SkeletonLoader variant="stat" count={statCount} isDark={isDark} />

        <div
          className={`${t.cardBg} overflow-hidden rounded-[30px] border ${t.cardBorder} shadow-[0_18px_45px_rgba(15,23,42,0.08)]`}
        >
          <div
            className={`border-b px-5 py-5 sm:px-6 ${t.cardBorder} ${
              isDark ? "bg-slate-950/70" : "bg-white/70"
            }`}
          >
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 rounded-[18px] border px-5 py-3 ${
                    isDark ? "border-slate-700 bg-slate-900/70" : "border-slate-200 bg-white"
                  }`}
                >
                  <SkeletonBar className="h-5 w-5 rounded-full" isDark={isDark} />
                  <SkeletonBar className="h-3 w-24" isDark={isDark} />
                </div>
              ))}
            </div>
          </div>

          <div
            className={`border-b px-5 py-5 sm:px-6 ${t.cardBorder} ${
              isDark ? "bg-slate-950/40" : "bg-slate-50/80"
            }`}
          >
            <SkeletonBar className="h-14 w-full max-w-xl rounded-[18px]" isDark={isDark} />
          </div>

          <div className="w-full overflow-x-auto">
            <table className="min-w-[1040px] w-full border-separate border-spacing-0">
              <thead className={`${isDark ? "bg-slate-900/80" : "bg-slate-50/80"} backdrop-blur-sm`}>
                <tr>
                  {Array.from({ length: tableCols }).map((_, index) => (
                    <th key={index} className={`border-b px-6 py-4 text-left ${t.cardBorder}`}>
                      <SkeletonBar className="h-3 w-20" isDark={isDark} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={t.cardBg}>
                <SkeletonLoader variant="table" rows={7} cols={tableCols} isDark={isDark} />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
