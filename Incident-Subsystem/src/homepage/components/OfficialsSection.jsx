import { Award } from "lucide-react";

export default function OfficialsSection({ officials, isDarkMode, fallbackImage }) {
  return (
    <section id="officials" className="py-16 md:py-24 px-6 scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-[8px] md:text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-4">
            Serbisyo at Pamumuno
          </h2>
          <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
            Barangay Officials
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8">
          {officials.map((person) => (
            <div key={person.id} className="text-center group">
              <div
                className={`relative aspect-[3/4] rounded-[24px] md:rounded-[32px] overflow-hidden mb-4 md:mb-6 border-2 transition-all duration-500 group-hover:border-emerald-500 ${
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
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <Award className="text-white mb-2" size={16} />
                </div>
              </div>
              <h4 className="text-[10px] md:text-xs font-black uppercase tracking-tight mb-1">
                {person.name}
              </h4>
              <p className="text-[8px] md:text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">
                {person.role}
              </p>
              <p className="text-[7px] md:text-[8px] opacity-40 font-bold uppercase tracking-tighter">
                {person.committee}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
