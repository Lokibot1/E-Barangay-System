import { Mail, Phone } from "lucide-react";

export default function HomeFooter({
  isDarkMode,
  logoSrc,
  socialLinks,
  onNewsClick,
  onCitizenPortalClick,
  onOfficialsClick,
}) {
  return (
    <footer
      className={`py-12 md:py-20 px-6 border-t ${
        isDarkMode ? "border-white/10" : "border-black/5"
      }`}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <img src={logoSrc} className="w-8 h-8 grayscale opacity-50" alt="logo" />
            <span className="font-black text-lg md:text-xl uppercase italic">
              Barangay Gulod
            </span>
          </div>
          <p className="text-[10px] md:text-xs opacity-50 max-w-sm mb-8 font-bold leading-relaxed">
            Official Digital Portal of Barangay Gulod, District 5, Quezon City.
            Providing efficient, transparent, and modern governance for every
            resident.
          </p>
          <div className="flex gap-4">
            {socialLinks.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  aria-label={item.label}
                  className="w-10 h-10 rounded-xl bg-emerald-600/10 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"
                >
                  <Icon size={18} />
                </a>
              );
            })}
          </div>
        </div>
        <div>
          <h5 className="font-black uppercase text-[10px] tracking-widest mb-6 opacity-40">
            Resources
          </h5>
          <div className="space-y-3 text-[10px] font-bold uppercase">
            <button onClick={onNewsClick} className="block hover:text-emerald-600">
              Announcements
            </button>
            <button
              onClick={onCitizenPortalClick}
              className="block hover:text-emerald-600"
            >
              Citizen Portal
            </button>
            <button onClick={onOfficialsClick} className="block hover:text-emerald-600">
              Local Leaders
            </button>
          </div>
        </div>
        <div>
          <h5 className="font-black uppercase text-[10px] tracking-widest mb-6 opacity-40">
            Inquiries
          </h5>
          <div className="space-y-3 text-[10px] font-bold uppercase">
            <div className="flex items-center gap-3">
              <Mail size={12} className="text-emerald-600" /> contact@gulod.gov.ph
            </div>
            <div className="flex items-center gap-3">
              <Phone size={12} className="text-emerald-600" /> (02) 8-920-0000
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 md:mt-20 pt-8 border-t border-emerald-500/10 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] opacity-30 text-center">
        Copyright 2026 Barangay Gulod Government Office.
      </div>
    </footer>
  );
}
