import { Mail, MapPin, Phone } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

export default function HomeFooter({
  isDarkMode,
  logoSrc,
  socialLinks,
  onAboutClick,
  onNewsClick,
  onCitizenPortalClick,
  onServicesClick,
  onOfficialsClick,
  onFeedbackClick,
  onContactClick,
}) {
  const footerShell = isDarkMode
    ? "border-white/10 bg-slate-950 text-white"
    : "border-slate-200 bg-[#f7f8f7] text-slate-900";

  const headingClass = isDarkMode
    ? "text-[0.98rem] font-extrabold text-white"
    : "text-[0.98rem] font-extrabold text-slate-900";

  const linkClass = isDarkMode
    ? "block text-left text-[12px] text-slate-300 transition-colors duration-300 hover:text-emerald-300"
    : "block text-left text-[12px] text-slate-500 transition-colors duration-300 hover:text-emerald-600";

  const contactTextClass = isDarkMode ? "text-slate-300" : "text-slate-500";
  const contactIconClass = isDarkMode
    ? "text-emerald-300"
    : "text-emerald-600";

  return (
    <footer className={`border-t px-6 pb-8 pt-10 md:pb-10 md:pt-12 ${footerShell}`}>
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 text-left md:grid-cols-2 md:gap-10 lg:grid-cols-[minmax(0,1.12fr)_0.78fr_0.88fr_0.95fr] lg:gap-10">
          <ScrollReveal className="lg:pr-3">
            <div className="flex items-center gap-2.5">
              <img
                src={logoSrc}
                className={`h-8 w-8 shrink-0 rounded-full object-cover md:h-9 md:w-9 ${
                  isDarkMode ? "grayscale opacity-60" : "opacity-90"
                }`}
                alt="Barangay Gulod logo"
              />
              <p
                className={`text-[0.95rem] font-black uppercase italic tracking-tight md:text-[1.25rem] ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Barangay Gulod
              </p>
            </div>

            <p
              className={`mt-5 max-w-[20rem] text-[12px] leading-6 ${
                isDarkMode ? "text-slate-300/75" : "text-slate-500"
              }`}
            >
              Official Digital Portal of Barangay Gulod, District 5, Quezon
              City. Providing efficient, transparent, and modern governance for
              every resident.
            </p>

            <div className="mt-6 flex gap-3">
              {socialLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.id}
                    href={item.href}
                    aria-label={item.label}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 hover:-translate-y-1 ${
                      isDarkMode
                        ? "border-white/10 bg-white/5 text-white hover:border-emerald-300/35 hover:bg-emerald-500 hover:text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white"
                    }`}
                  >
                    <Icon size={15} />
                  </a>
                );
              })}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={80}>
            <h5 className={headingClass}>Barangay</h5>
            <div className="mt-4 space-y-2.5">
              <button onClick={onAboutClick} className={linkClass}>
                About Us
              </button>
              <button onClick={onServicesClick} className={linkClass}>
                Services
              </button>
              <button onClick={onOfficialsClick} className={linkClass}>
                Local Leaders
              </button>
              <button onClick={onFeedbackClick} className={linkClass}>
                Testimonials
              </button>
              <button onClick={onContactClick} className={linkClass}>
                Contact
              </button>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={140}>
            <h5 className={headingClass}>Navigation</h5>
            <div className="mt-4 space-y-2.5 text-left">
              <button onClick={onNewsClick} className={linkClass}>
                Announcements
              </button>
              <button onClick={onCitizenPortalClick} className={linkClass}>
                Citizen Portal
              </button>
              <button onClick={onServicesClick} className={linkClass}>
                Online Services
              </button>
              <button onClick={onFeedbackClick} className={linkClass}>
                Resident Testimonials
              </button>
              <button onClick={onOfficialsClick} className={linkClass}>
                Local Leaders
              </button>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <h5 className={headingClass}>Contact</h5>
            <div className="mt-4 space-y-3.5 text-left">
              <div className="flex items-center justify-start gap-3">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                    isDarkMode
                      ? "border-white/10 bg-white/5"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <Mail size={14} className={contactIconClass} />
                </span>
                <span className={`text-[12px] ${contactTextClass}`}>
                  contact@gulod.gov.ph
                </span>
              </div>
              <div className="flex items-center justify-start gap-3">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                    isDarkMode
                      ? "border-white/10 bg-white/5"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <Phone size={14} className={contactIconClass} />
                </span>
                <span className={`text-[12px] ${contactTextClass}`}>
                  +63 2 8-920-0000
                </span>
              </div>
              <div className="flex items-center justify-start gap-3">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                    isDarkMode
                      ? "border-white/10 bg-white/5"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <MapPin size={14} className={contactIconClass} />
                </span>
                <span className={`text-[12px] ${contactTextClass}`}>
                  Villareal St., Gulod, Quezon City
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>

        <div
          className={`mt-8 border-t pt-5 text-center text-[11px] font-semibold tracking-[0.06em] md:mt-10 md:text-[12px] ${
            isDarkMode
              ? "border-white/10 text-slate-400"
              : "border-slate-200 text-slate-500"
          }`}
        >
          &copy; 2026 Barangay Gulod Government Office. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
