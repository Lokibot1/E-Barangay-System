import { ShieldCheck } from "lucide-react";

export default function HeroSection({
  isDarkMode,
  backgroundImage,
  onLatestNews,
  onExploreServices,
}) {
  return (
    <section
      id="about"
      className={`relative flex min-h-[100svh] items-center overflow-hidden px-6 pb-14 pt-28 md:pb-16 md:pt-32 lg:pb-20 ${
        isDarkMode ? "" : "bg-[linear-gradient(180deg,#f5faf7_0%,#eef6f1_100%)]"
      }`}
    >
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundImage}
          alt="Barangay Hall"
          className={`h-full w-full object-cover ${
            isDarkMode
              ? "opacity-30 md:opacity-40"
              : "opacity-18 saturate-[0.82] md:opacity-24"
          }`}
        />
        <div
          className={`absolute inset-0 ${
            isDarkMode
              ? "bg-[linear-gradient(100deg,rgba(2,6,23,0.96)_0%,rgba(2,6,23,0.9)_44%,rgba(2,6,23,0.7)_74%,rgba(2,6,23,0.54)_100%)]"
              : "bg-[linear-gradient(100deg,rgba(244,249,245,0.9)_0%,rgba(243,248,244,0.84)_42%,rgba(238,245,241,0.78)_74%,rgba(233,241,236,0.72)_100%)]"
          }`}
        />
        <div
          className={`absolute inset-0 ${
            isDarkMode
              ? "bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_28%)]"
              : "bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.1),_transparent_30%)]"
          }`}
        />
        {!isDarkMode && (
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent to-[#f3f8f4]" />
        )}
      </div>
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="md:translate-y-2 lg:translate-y-4">
          <div className="mx-auto max-w-5xl text-center">
            <div
              className="animate-fade-up mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5 text-emerald-600 md:mb-6"
              style={{ animationDelay: "0.05s" }}
            >
              <ShieldCheck size={13} className="md:size-[14px]" />
              <span className="text-[7px] font-black uppercase tracking-[0.16em] md:text-[9px]">
                Official Website of Barangay Gulod
              </span>
            </div>
            <h1
              className="animate-fade-up mb-6 text-[clamp(3.4rem,10vw,5.8rem)] font-black uppercase italic leading-[0.9] tracking-tighter md:mb-8"
              style={{ animationDelay: "0.14s" }}
            >
              Barangay <br />{" "}
              <span className="text-emerald-600 not-italic">Gulod</span>
            </h1>
            <p
              className={`animate-fade-up mx-auto mb-8 max-w-3xl text-base font-medium leading-8 md:mb-10 md:text-[1.1rem] ${
                isDarkMode ? "text-slate-300" : "text-slate-700"
              }`}
              style={{ animationDelay: "0.22s" }}
            >
              Fast, secure, and modern public services for Gulod residents.
              Submit requests, stay updated, and access digital records in one
              place.
            </p>
            <div
              className="animate-fade-up flex flex-col justify-center gap-3 sm:flex-row"
              style={{ animationDelay: "0.3s" }}
            >
              <button
                onClick={onExploreServices}
                className="w-full rounded-[18px] bg-emerald-600 px-8 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-white transition-all hover:bg-emerald-700 hover:shadow-[0_18px_38px_-20px_rgba(5,150,105,0.95)] sm:w-auto md:rounded-[20px] md:px-10 md:py-4.5 md:text-[11px]"
              >
                Get Started
              </button>
              <button
                onClick={onLatestNews}
                className={`w-full rounded-[18px] border px-8 py-4 text-[10px] font-black uppercase tracking-[0.16em] transition-all sm:w-auto md:rounded-[20px] md:px-10 md:py-4.5 md:text-[11px] ${
                  isDarkMode
                    ? "border-white/10 bg-white/5 hover:bg-white/10"
                    : "border-slate-300/70 bg-[#f8fbf9]/85 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.16)] hover:bg-white"
                }`}
              >
                Latest News
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
