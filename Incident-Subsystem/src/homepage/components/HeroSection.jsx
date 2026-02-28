import { ShieldCheck } from "lucide-react";

export default function HeroSection({
  isDarkMode,
  backgroundImage,
  onGetDigitalId,
  onLatestNews,
}) {
  return (
    <section
      id="about"
      className="relative min-h-screen pt-20 flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundImage}
          alt="Barangay Hall"
          className="w-full h-full object-cover opacity-20 md:opacity-30"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-b from-transparent ${
            isDarkMode ? "to-slate-950" : "to-white"
          }`}
        />
      </div>
      <div className="relative z-10 text-center px-6 max-w-5xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 mb-6 md:mb-8 animate-fade-in">
          <ShieldCheck size={14} className="md:size-4" />
          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">
            Opisyal na Website ng Barangay Gulod
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.9] mb-8 md:mb-10 italic">
          Barangay <br /> <span className="text-emerald-600 not-italic">Gulod</span>
        </h1>
        <p
          className={`text-base md:text-lg lg:text-xl mb-10 md:mb-12 max-w-2xl mx-auto font-medium ${
            isDarkMode ? "text-slate-400" : "text-slate-600"
          }`}
        >
          Ang portal para sa mas mabilis at modernong serbisyo publiko. Register
          your profile and access documents digitally.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onGetDigitalId}
            className="w-full sm:w-auto px-10 md:px-12 py-5 md:py-6 bg-emerald-700 text-white rounded-[20px] md:rounded-[24px] font-black uppercase tracking-widest text-xs md:text-sm shadow-2xl hover:bg-emerald-800 transition-all"
          >
            Get Digital ID
          </button>
          <button
            onClick={onLatestNews}
            className={`w-full sm:w-auto px-10 md:px-12 py-5 md:py-6 rounded-[20px] md:rounded-[24px] font-black uppercase tracking-widest text-xs md:text-sm border transition-all ${
              isDarkMode
                ? "border-white/10 hover:bg-white/5"
                : "border-black/10 hover:bg-black/5"
            }`}
          >
            Latest News
          </button>
        </div>
      </div>
    </section>
  );
}
