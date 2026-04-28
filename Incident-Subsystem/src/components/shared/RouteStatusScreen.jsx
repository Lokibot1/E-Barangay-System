import {
  ArrowLeft,
  Compass,
  Home,
  MapPinned,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";

const VARIANT_CONFIG = {
  "not-found": {
    badge: "Off The Grid",
    heroCode: "404",
    orbitLabel: "Route marker lost",
    Icon: Compass,
    glowClass:
      "from-emerald-300/55 via-cyan-200/30 to-sky-300/45",
    heroTextClass: "from-emerald-500 via-cyan-500 to-sky-500",
    orbClass: "bg-emerald-300/35",
    ringClass: "border-emerald-300/30",
  },
  error: {
    badge: "Recovery Mode",
    heroCode: "ERR",
    orbitLabel: "Safe fallback engaged",
    Icon: ShieldAlert,
    glowClass:
      "from-amber-300/45 via-rose-200/25 to-orange-300/40",
    heroTextClass: "from-rose-500 via-orange-500 to-amber-500",
    orbClass: "bg-orange-300/30",
    ringClass: "border-orange-300/25",
  },
};

export default function RouteStatusScreen({
  currentTheme = "modern",
  variant = "error",
  title,
  description,
  detailTitle,
  detailMessage,
  pathLabel = "/",
  primaryLabel,
  onPrimaryAction,
  secondaryLabel,
  onSecondaryAction,
  tertiaryLabel,
  onTertiaryAction,
}) {
  const isDark = currentTheme === "dark";
  const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.error;
  const { badge, heroCode, orbitLabel, Icon, glowClass, heroTextClass, orbClass, ringClass } =
    config;

  if (variant === "not-found") {
    return (
      <div
        className={`relative min-h-screen overflow-hidden ${
          isDark
            ? "bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)] text-white"
            : "bg-[linear-gradient(180deg,#f6f8fb_0%,#edf2f5_100%)] text-slate-950"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className={`absolute inset-0 ${
              isDark
                ? "bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:72px_72px]"
                : "bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:72px_72px]"
            } opacity-40`}
          />
          <div
            className={`absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl ${
              isDark ? "bg-sky-400/12" : "bg-sky-200/70"
            }`}
          />
          <div
            className={`absolute bottom-0 right-[12%] h-72 w-72 rounded-full blur-3xl ${
              isDark ? "bg-emerald-400/10" : "bg-emerald-100/90"
            }`}
          />
        </div>

        <div className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div
            className={`w-full max-w-4xl rounded-[32px] border px-6 py-12 shadow-[0_35px_90px_-40px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:px-10 sm:py-14 ${
              isDark
                ? "border-white/10 bg-slate-900/78"
                : "border-white/80 bg-white/78"
            }`}
          >
            <div className="mx-auto max-w-3xl text-center">
              <span
                className={`inline-flex items-center rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] ${
                  isDark
                    ? "border-white/12 bg-white/5 text-white/60"
                    : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
              >
                {badge}
              </span>

              <div className="relative mt-8">
                <div
                  className={`absolute inset-x-0 -top-4 select-none text-[clamp(6rem,22vw,11rem)] font-black leading-none tracking-[-0.12em] ${
                    isDark ? "text-white/[0.05]" : "text-slate-900/[0.06]"
                  }`}
                >
                  {heroCode}
                </div>
                <div
                  className={`relative text-[clamp(4.75rem,18vw,8.5rem)] font-black leading-none tracking-[-0.12em] ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {heroCode}
                </div>
              </div>

              <h1 className="mt-6 font-spartan text-4xl font-black tracking-tight sm:text-5xl">
                {title}
              </h1>

              <p
                className={`mx-auto mt-4 max-w-2xl text-sm leading-7 sm:text-base ${
                  isDark ? "text-white/70" : "text-slate-600"
                }`}
              >
                {description}
              </p>

              {detailMessage ? (
                <div
                  className={`mt-8 inline-flex flex-wrap items-center justify-center gap-3 rounded-[22px] border px-4 py-3 text-sm ${
                    isDark
                      ? "border-white/10 bg-white/5 text-white/72"
                      : "border-slate-200 bg-slate-50/90 text-slate-600"
                  }`}
                >
                  <span
                    className={`text-[11px] font-black uppercase tracking-[0.22em] ${
                      isDark ? "text-white/42" : "text-slate-500"
                    }`}
                  >
                    {detailTitle}
                  </span>
                  <span
                    className={`font-mono ${
                      isDark ? "text-white/88" : "text-slate-800"
                    }`}
                  >
                    {detailMessage}
                  </span>
                </div>
              ) : null}

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onPrimaryAction}
                  className={`inline-flex min-w-[168px] items-center justify-center gap-2 rounded-[18px] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] transition-transform hover:-translate-y-0.5 ${
                    isDark
                      ? "bg-white text-slate-950 shadow-[0_20px_40px_-20px_rgba(255,255,255,0.65)]"
                      : "bg-slate-900 text-white shadow-[0_20px_40px_-20px_rgba(15,23,42,0.45)]"
                  }`}
                >
                  <Home className="h-4 w-4" />
                  {primaryLabel}
                </button>

                <button
                  type="button"
                  onClick={onSecondaryAction}
                  className={`inline-flex min-w-[168px] items-center justify-center gap-2 rounded-[18px] border px-5 py-3 text-sm font-black uppercase tracking-[0.12em] transition-transform hover:-translate-y-0.5 ${
                    isDark
                      ? "border-white/12 bg-white/5 text-white/86 hover:bg-white/10"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <ArrowLeft className="h-4 w-4" />
                  {secondaryLabel}
                </button>

                <button
                  type="button"
                  onClick={onTertiaryAction}
                  className={`inline-flex min-w-[168px] items-center justify-center gap-2 rounded-[18px] border px-5 py-3 text-sm font-black uppercase tracking-[0.12em] transition-transform hover:-translate-y-0.5 ${
                    isDark
                      ? "border-white/10 bg-transparent text-white/70 hover:bg-white/5"
                      : "border-slate-200 bg-transparent text-slate-500 hover:bg-white/60"
                  }`}
                >
                  <RefreshCw className="h-4 w-4" />
                  {tertiaryLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative min-h-screen overflow-hidden px-4 py-8 ${
        isDark
          ? "bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.12),_transparent_28%),linear-gradient(145deg,#020617_0%,#0f172a_42%,#111827_100%)] text-white"
          : "bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.18),_transparent_24%),linear-gradient(145deg,#eef5ff_0%,#f8fbff_40%,#eef7f1_100%)] text-slate-900"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={`absolute left-[8%] top-[12%] h-52 w-52 rounded-full blur-3xl ${
            isDark ? "bg-cyan-400/12" : "bg-cyan-300/26"
          }`}
        />
        <div
          className={`absolute bottom-[12%] right-[10%] h-64 w-64 rounded-full blur-3xl ${
            isDark ? "bg-emerald-400/10" : "bg-emerald-300/22"
          }`}
        />
        <div
          className={`absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br ${glowClass} blur-3xl`}
        />
        <div
          className={`absolute inset-x-10 top-10 bottom-10 rounded-[40px] border ${
            isDark ? "border-white/5" : "border-white/70"
          }`}
        />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div
          className={`relative w-full overflow-hidden rounded-[36px] border shadow-[0_36px_90px_rgba(15,23,42,0.18)] ${
            isDark
              ? "border-white/10 bg-slate-950/72"
              : "border-white/80 bg-white/82"
          } backdrop-blur-2xl`}
        >
          <div className="pointer-events-none absolute inset-0">
            <div
              className={`absolute left-8 top-8 h-20 w-20 rounded-full ${orbClass} blur-2xl`}
            />
            <div
              className={`absolute bottom-10 right-12 h-24 w-24 rounded-full ${orbClass} blur-2xl`}
            />
          </div>

          <div className="relative grid gap-10 px-6 py-8 md:px-10 md:py-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-12 lg:px-12">
            <div className="relative">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.22em] ${
                    isDark
                      ? "border-white/10 bg-white/5 text-white/70"
                      : "border-slate-200 bg-white/80 text-slate-500"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 text-emerald-500" />
                  {badge}
                </span>
              </div>

              <div className="relative mt-8">
                <div
                  className={`select-none bg-gradient-to-r ${heroTextClass} bg-clip-text text-[clamp(5rem,16vw,9rem)] font-black uppercase leading-[0.82] tracking-[-0.08em] text-transparent`}
                >
                  {heroCode}
                </div>
                <div
                  className={`absolute left-1 top-4 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] ${
                    isDark
                      ? `border-white/10 bg-slate-900/75 text-white/55`
                      : "border-white/80 bg-white/90 text-slate-500"
                  }`}
                >
                  {orbitLabel}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div
                  className={`relative flex h-20 w-20 items-center justify-center rounded-full border ${
                    isDark ? ringClass : ringClass
                  }`}
                >
                  <div
                    className={`absolute inset-2 rounded-full border ${
                      isDark ? "border-white/10" : "border-slate-200/70"
                    }`}
                  />
                  <MapPinned className="h-8 w-8 text-emerald-500" />
                </div>
                <div>
                  <p
                    className={`text-[11px] font-black uppercase tracking-[0.22em] ${
                      isDark ? "text-white/45" : "text-slate-500"
                    }`}
                  >
                    Requested Path
                  </p>
                  <p
                    className={`mt-2 rounded-full border px-4 py-2 font-mono text-sm ${
                      isDark
                        ? "border-white/10 bg-white/5 text-white/80"
                        : "border-slate-200 bg-white/85 text-slate-700"
                    }`}
                  >
                    {pathLabel}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div
                className={`rounded-[28px] border p-5 md:p-6 ${
                  isDark
                    ? "border-white/10 bg-white/5"
                    : "border-white/80 bg-white/78"
                }`}
              >
                <h1 className="font-spartan text-3xl font-black tracking-tight md:text-4xl">
                  {title}
                </h1>
                <p
                  className={`mt-4 max-w-xl text-sm leading-7 md:text-base ${
                    isDark ? "text-white/68" : "text-slate-600"
                  }`}
                >
                  {description}
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={onPrimaryAction}
                    className="inline-flex items-center justify-center gap-2 rounded-[18px] bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_45%,#14b8a6_100%)] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_20px_40px_-18px_rgba(37,99,235,0.85)] transition-transform hover:-translate-y-0.5"
                  >
                    <Home className="h-4 w-4" />
                    {primaryLabel}
                  </button>

                  <button
                    type="button"
                    onClick={onSecondaryAction}
                    className={`inline-flex items-center justify-center gap-2 rounded-[18px] border px-4 py-3 text-sm font-black uppercase tracking-[0.12em] transition-transform hover:-translate-y-0.5 ${
                      isDark
                        ? "border-white/10 bg-slate-900/70 text-white/86 hover:bg-slate-800"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {secondaryLabel}
                  </button>

                  <button
                    type="button"
                    onClick={onTertiaryAction}
                    className={`inline-flex items-center justify-center gap-2 rounded-[18px] border px-4 py-3 text-sm font-black uppercase tracking-[0.12em] transition-transform hover:-translate-y-0.5 ${
                      isDark
                        ? "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                        : "border-slate-200 bg-white/80 text-slate-600 hover:bg-white"
                    }`}
                  >
                    <RefreshCw className="h-4 w-4" />
                    {tertiaryLabel}
                  </button>
                </div>

                {detailMessage ? (
                  <div
                    className={`mt-6 rounded-[24px] border p-4 ${
                      isDark
                        ? "border-white/10 bg-slate-900/72"
                        : "border-slate-200 bg-slate-50/90"
                    }`}
                  >
                    <p
                      className={`text-[11px] font-black uppercase tracking-[0.22em] ${
                        isDark ? "text-white/45" : "text-slate-500"
                      }`}
                    >
                      {detailTitle}
                    </p>
                    <p
                      className={`mt-3 break-words font-mono text-sm leading-6 ${
                        isDark ? "text-white/78" : "text-slate-700"
                      }`}
                    >
                      {detailMessage}
                    </p>
                  </div>
                ) : null}

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  {[
                    "Clean recovery path without a blank screen",
                    "Designed for both missing routes and failed page loads",
                    "Safe actions stay visible on mobile and desktop",
                  ].map((item) => (
                    <div
                      key={item}
                      className={`rounded-[20px] border px-4 py-3 text-sm leading-6 ${
                        isDark
                          ? "border-white/10 bg-white/5 text-white/62"
                          : "border-slate-200 bg-white/75 text-slate-600"
                      }`}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
