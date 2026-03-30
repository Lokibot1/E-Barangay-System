import { Award } from "lucide-react";

export default function OfficialsSection({ officials, isDarkMode, fallbackImage }) {
  return (
    <section id="officials" className="px-6 py-12 scroll-mt-24 md:py-16">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center md:mb-10">
          <h2 className="mb-3 text-[8px] font-black uppercase tracking-[0.28em] text-emerald-600 md:text-[9px]">
            Serbisyo at Pamumuno
          </h2>
          <h3 className="text-3xl font-black uppercase tracking-tighter md:text-4xl">
            Barangay Officials
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-5">
          {officials.map((person) => (
            <div key={person.id} className="text-center group">
              <div
                className={`relative aspect-[3/4] overflow-hidden rounded-[20px] border-2 mb-3 transition-all duration-500 group-hover:border-emerald-500 md:mb-4 md:rounded-[24px] ${
                  isDarkMode
                    ? "border-white/5 bg-slate-900"
                    : "border-black/5 bg-slate-50"
                }`}
              >
                <img
                  src={person.image}
                  alt={person.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = fallbackImage;
                  }}
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-emerald-900/80 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <Award className="mb-1 text-white" size={14} />
                </div>
              </div>
              <h4 className="mb-1 text-[9px] font-black uppercase tracking-tight md:text-[10px]">
                {person.name}
              </h4>
              <p className="mb-1 text-[7px] font-black uppercase tracking-[0.14em] text-emerald-600 md:text-[8px]">
                {person.role}
              </p>
              <p className="text-[6px] font-bold uppercase tracking-tight opacity-40 md:text-[7px]">
                {person.committee}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
