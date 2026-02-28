import { Clock, Phone, Send } from "lucide-react";

export default function ContactSection({
  isDarkMode,
  contactData,
  formStatus,
  onContactSubmit,
  onContactChange,
}) {
  return (
    <section id="contact" className="py-16 md:py-24 px-6 scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-[8px] md:text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-4">
            Official Contact
          </h2>
          <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
            Barangay Hall
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-6 md:space-y-8 order-2 lg:order-1">
            <div
              className={`p-6 md:p-8 rounded-[32px] md:rounded-[40px] border ${
                isDarkMode ? "bg-slate-900 border-white/5" : "bg-slate-50 border-black/5"
              }`}
            >
              <form onSubmit={onContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    required
                    placeholder="Your Name"
                    className={`w-full p-4 rounded-xl text-[10px] uppercase font-black tracking-widest outline-none border transition-all ${
                      isDarkMode ? "bg-black/40 border-white/10" : "bg-white border-black/10"
                    }`}
                    value={contactData.name}
                    onChange={(e) => onContactChange("name", e.target.value)}
                  />
                  <input
                    required
                    type="email"
                    placeholder="Email Address"
                    className={`w-full p-4 rounded-xl text-[10px] uppercase font-black tracking-widest outline-none border transition-all ${
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
                  className={`w-full p-4 rounded-xl text-[10px] uppercase font-black tracking-widest outline-none border transition-all ${
                    isDarkMode ? "bg-black/40 border-white/10" : "bg-white border-black/10"
                  }`}
                  value={contactData.message}
                  onChange={(e) => onContactChange("message", e.target.value)}
                />
                <button className="w-full py-4 bg-emerald-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-800 transition-all flex items-center justify-center gap-2">
                  {formStatus === "submitting" ? (
                    "Sending..."
                  ) : formStatus === "success" ? (
                    "Message Sent!"
                  ) : (
                    <>
                      <Send size={14} /> Submit Message
                    </>
                  )}
                </button>
              </form>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-5 rounded-2xl ${isDarkMode ? "bg-slate-900" : "bg-emerald-50"}`}>
                <Clock className="text-emerald-600 mb-2" size={16} />
                <p className="text-[9px] font-black uppercase tracking-widest">Mon - Fri</p>
                <p className="text-[9px] font-bold opacity-60">8 AM - 5 PM</p>
              </div>
              <div className={`p-5 rounded-2xl ${isDarkMode ? "bg-slate-900" : "bg-emerald-50"}`}>
                <Phone className="text-emerald-600 mb-2" size={16} />
                <p className="text-[9px] font-black uppercase tracking-widest">Hotline</p>
                <p className="text-[9px] font-bold opacity-60">8-920-0000</p>
              </div>
            </div>
          </div>

          <div className="h-[300px] md:h-[500px] rounded-[32px] md:rounded-[40px] overflow-hidden border border-emerald-500/20 relative order-1 lg:order-2">
            <iframe
              title="Map"
              src="https://www.google.com/maps?q=Villareal%20St.%2C%20Gulod%2C%20Quezon%20City&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, filter: isDarkMode ? "invert(90%)" : "none" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="absolute bottom-4 left-4 right-4 p-4 md:p-6 bg-emerald-800/90 backdrop-blur-md text-white rounded-[24px]">
              <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                Barangay Hall Location
              </p>
              <p className="text-[10px] md:text-xs opacity-80 uppercase font-bold">
                Villareal St., Gulod, Quezon City
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
