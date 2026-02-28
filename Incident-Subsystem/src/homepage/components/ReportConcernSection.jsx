import { AlertTriangle, Send } from "lucide-react";
import { useMemo, useState } from "react";

const createTicketId = () =>
  `GRV-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

export default function ReportConcernSection({ isDarkMode, categories }) {
  const [form, setForm] = useState({
    name: "",
    contact: "",
    category: categories?.[0] || "Other",
    location: "",
    message: "",
  });
  const [status, setStatus] = useState("idle");
  const [ticketId, setTicketId] = useState("");

  const canSubmit = useMemo(() => {
    return (
      form.name.trim().length > 1 &&
      form.contact.trim().length > 4 &&
      form.message.trim().length > 9
    );
  }, [form]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit || status === "submitting") return;

    setStatus("submitting");
    window.setTimeout(() => {
      const nextTicket = createTicketId();
      setTicketId(nextTicket);
      setStatus("success");
      setForm({
        name: "",
        contact: "",
        category: categories?.[0] || "Other",
        location: "",
        message: "",
      });
    }, 1200);
  };

  return (
    <section id="report-concern" className="py-16 md:py-24 px-6 scroll-mt-24">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-8">
        <div
          className={`rounded-[28px] border p-6 md:p-8 ${
            isDarkMode ? "bg-slate-900 border-white/10" : "bg-emerald-50/60 border-black/5"
          }`}
        >
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-3">
            Community Desk
          </p>
          <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4">
            Report a Concern
          </h3>
          <p className="text-sm md:text-base opacity-70 mb-5">
            Send issues like streetlight outage, drainage, sanitation, and safety concerns.
          </p>
          <div className="space-y-3 text-sm">
            <p className="inline-flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-500" />
              For emergencies, call hotline directly.
            </p>
            <p className="opacity-70">
              Reports submitted here are logged and forwarded to the assigned committee.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`rounded-[28px] border p-6 md:p-8 space-y-4 ${
            isDarkMode ? "bg-slate-900 border-white/10" : "bg-white border-black/5 shadow-sm"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={form.name}
              onChange={(event) => handleChange("name", event.target.value)}
              placeholder="Full Name"
              className={`w-full px-4 py-3 rounded-xl border text-sm outline-none ${
                isDarkMode
                  ? "bg-slate-800 border-white/10 placeholder:text-slate-400"
                  : "bg-white border-black/10 placeholder:text-slate-400"
              }`}
            />
            <input
              type="text"
              value={form.contact}
              onChange={(event) => handleChange("contact", event.target.value)}
              placeholder="Contact Number"
              className={`w-full px-4 py-3 rounded-xl border text-sm outline-none ${
                isDarkMode
                  ? "bg-slate-800 border-white/10 placeholder:text-slate-400"
                  : "bg-white border-black/10 placeholder:text-slate-400"
              }`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={form.category}
              onChange={(event) => handleChange("category", event.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-sm outline-none ${
                isDarkMode ? "bg-slate-800 border-white/10" : "bg-white border-black/10"
              }`}
            >
              {(categories || []).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={form.location}
              onChange={(event) => handleChange("location", event.target.value)}
              placeholder="Location / Landmark"
              className={`w-full px-4 py-3 rounded-xl border text-sm outline-none ${
                isDarkMode
                  ? "bg-slate-800 border-white/10 placeholder:text-slate-400"
                  : "bg-white border-black/10 placeholder:text-slate-400"
              }`}
            />
          </div>

          <textarea
            value={form.message}
            onChange={(event) => handleChange("message", event.target.value)}
            placeholder="Describe the concern..."
            rows={4}
            className={`w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none ${
              isDarkMode
                ? "bg-slate-800 border-white/10 placeholder:text-slate-400"
                : "bg-white border-black/10 placeholder:text-slate-400"
            }`}
          />

          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 pt-2">
            <button
              type="submit"
              disabled={!canSubmit || status === "submitting"}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                !canSubmit || status === "submitting"
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-emerald-700 text-white hover:bg-emerald-800"
              }`}
            >
              <Send size={14} />
              {status === "submitting" ? "Submitting..." : "Submit Report"}
            </button>

            {status === "success" && (
              <p className="text-xs font-bold text-emerald-600">
                Report sent. Ticket ID: {ticketId}
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
