import { Clock, Phone, Send } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

export default function ContactSection({
  isDarkMode,
  contactData,
  formStatus,
  onContactSubmit,
  onContactChange,
}) {
  return (
    <section id="contact" className="px-6 py-12 scroll-mt-24 md:py-16">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="mb-8 text-center md:mb-10">
          <h2 className="mb-3 text-[8px] font-black uppercase tracking-[0.26em] text-emerald-600 md:text-[9px]">
            Official Contact
          </h2>
          <h3 className="text-3xl font-black uppercase tracking-tighter md:text-4xl">
            Barangay Hall
          </h3>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2">
          <div className="order-2 space-y-5 md:space-y-6 lg:order-1">
            <ScrollReveal
              className={`rounded-[24px] border p-5 md:rounded-[28px] md:p-6 ${
                isDarkMode ? "bg-slate-900 border-white/5" : "bg-slate-50 border-black/5"
              }`}
            >
              <form onSubmit={onContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    required
                    placeholder="Your Name"
                    className={`w-full rounded-xl border p-3 text-[9px] font-black uppercase tracking-[0.14em] outline-none transition-all ${
                      isDarkMode ? "bg-black/40 border-white/10" : "bg-white border-black/10"
                    }`}
                    value={contactData.name}
                    onChange={(e) => onContactChange("name", e.target.value)}
                  />
                  <input
                    required
                    type="email"
                    placeholder="Email Address"
                    className={`w-full rounded-xl border p-3 text-[9px] font-black uppercase tracking-[0.14em] outline-none transition-all ${
                      isDarkMode ? "bg-black/40 border-white/10" : "bg-white border-black/10"
                    }`}
                    value={contactData.email}
                    onChange={(e) => onContactChange("email", e.target.value)}
                  />
                </div>
                <textarea
                  required
                  rows="4"
                  placeholder="Message to the Barangay Office"
                  className={`w-full rounded-xl border p-3 text-[9px] font-black uppercase tracking-[0.14em] outline-none transition-all ${
                    isDarkMode ? "bg-black/40 border-white/10" : "bg-white border-black/10"
                  }`}
                  value={contactData.message}
                  onChange={(e) => onContactChange("message", e.target.value)}
                />
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-[9px] font-black uppercase tracking-[0.14em] text-white transition-all hover:bg-emerald-800">
                  {formStatus === "submitting" ? (
                    "Sending..."
                  ) : formStatus === "success" ? (
                    "Message Sent!"
                  ) : (
                    <>
                      <Send size={13} /> Submit Message
                    </>
                  )}
                </button>
              </form>
            </ScrollReveal>
            <div className="grid grid-cols-2 gap-4">
              <ScrollReveal
                delay={90}
                className={`rounded-2xl p-4 ${isDarkMode ? "bg-slate-900" : "bg-emerald-50"}`}
              >
                <Clock className="mb-2 text-emerald-600" size={15} />
                <p className="text-[8px] font-black uppercase tracking-[0.14em]">Mon - Fri</p>
                <p className="text-[8px] font-bold opacity-60">8 AM - 5 PM</p>
              </ScrollReveal>
              <ScrollReveal
                delay={150}
                className={`rounded-2xl p-4 ${isDarkMode ? "bg-slate-900" : "bg-emerald-50"}`}
              >
                <Phone className="mb-2 text-emerald-600" size={15} />
                <p className="text-[8px] font-black uppercase tracking-[0.14em]">Hotline</p>
                <p className="text-[8px] font-bold opacity-60">8-920-0000</p>
              </ScrollReveal>
            </div>
          </div>

          <ScrollReveal
            delay={120}
            className="relative order-1 h-[260px] overflow-hidden rounded-[24px] border border-emerald-500/20 md:h-[420px] md:rounded-[28px] lg:order-2"
          >
            <iframe
              title="Map"
              src="https://www.google.com/maps?q=Villareal%20St.%2C%20Gulod%2C%20Quezon%20City&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, filter: isDarkMode ? "invert(90%)" : "none" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="absolute bottom-3 left-3 right-3 rounded-[20px] bg-emerald-800/90 p-4 text-white backdrop-blur-md md:bottom-4 md:left-4 md:right-4 md:p-5">
              <p className="mb-1 text-[8px] font-black uppercase tracking-[0.16em] md:text-[9px]">
                Barangay Hall Location
              </p>
              <p className="text-[9px] font-bold uppercase opacity-80 md:text-[10px]">
                Villareal St., Gulod, Quezon City
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
