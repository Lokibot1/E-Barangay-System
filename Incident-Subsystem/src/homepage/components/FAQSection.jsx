import { ChevronDown, HelpCircle, Search } from "lucide-react";
import { useMemo, useState } from "react";
import ScrollReveal from "./ScrollReveal";

export default function FAQSection({ isDarkMode, faqItems }) {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);

  const filteredItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return faqItems;

    return faqItems.filter((item) => {
      const haystack = [
        item.question,
        item.answer,
        ...(item.tags || []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(keyword);
    });
  }, [faqItems, query]);

  return (
    <section
      id="faq"
      className={`px-6 py-12 scroll-mt-24 md:py-16 ${
        isDarkMode ? "bg-slate-900/40" : "bg-emerald-50/40"
      }`}
    >
      <div className="mx-auto max-w-4xl">
        <ScrollReveal className="mb-6 text-center md:mb-8">
          <p className="mb-2 text-[8px] font-black uppercase tracking-[0.24em] text-emerald-600 md:text-[9px]">
            Help Center
          </p>
          <h3 className="mb-3 text-2xl font-black uppercase tracking-tighter md:text-4xl">
            FAQ and Smart Search
          </h3>
          <p className="text-[0.9rem] opacity-70 md:text-[0.95rem]">
            Type a keyword like ID, clearance, requirements, or office hours.
          </p>
        </ScrollReveal>

        <ScrollReveal
          delay={80}
          className={`mb-5 flex items-center gap-3 rounded-[20px] border px-4 py-2.5 md:mb-6 md:px-4.5 md:py-3 ${
            isDarkMode ? "bg-slate-900 border-white/10" : "bg-white border-black/5"
          }`}
        >
          <Search size={16} className="shrink-0 text-emerald-600" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search FAQs..."
            className="w-full bg-transparent text-[0.9rem] outline-none md:text-[0.95rem]"
          />
        </ScrollReveal>

        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <ScrollReveal
              className={`rounded-[20px] border p-7 text-center ${
                isDarkMode ? "bg-slate-900 border-white/10" : "bg-white border-black/5"
              }`}
            >
              <HelpCircle size={24} className="mx-auto mb-3 text-emerald-600" />
              <p className="font-bold opacity-70">No FAQ matched your search.</p>
            </ScrollReveal>
          ) : (
            filteredItems.map((item, index) => {
              const isOpen = openId === item.id;
              return (
                <ScrollReveal
                  key={item.id}
                  as="article"
                  delay={110}
                  staggerIndex={index}
                  className={`overflow-hidden rounded-[20px] border ${
                    isDarkMode ? "bg-slate-900 border-white/10" : "bg-white border-black/5 shadow-sm"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenId((prev) => (prev === item.id ? null : item.id))}
                    className="flex w-full items-center justify-between gap-4 p-4 text-left md:p-5"
                  >
                    <span className="text-[0.95rem] font-black uppercase tracking-[0.02em] md:text-[1rem]">
                      {item.question}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div
                      className={`px-4 pb-5 text-[0.9rem] leading-7 md:px-5 md:text-[0.95rem] ${
                        isDarkMode ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      {item.answer}
                    </div>
                  )}
                </ScrollReveal>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
