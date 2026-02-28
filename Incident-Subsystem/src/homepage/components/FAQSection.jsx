import { ChevronDown, HelpCircle, Search } from "lucide-react";
import { useMemo, useState } from "react";

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
      className={`py-16 md:py-24 px-6 scroll-mt-24 ${
        isDarkMode ? "bg-slate-900/40" : "bg-emerald-50/40"
      }`}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8 md:mb-10">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-3">
            Help Center
          </p>
          <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">
            FAQ and Smart Search
          </h3>
          <p className="text-sm md:text-base opacity-70">
            Type a keyword like ID, clearance, requirements, or office hours.
          </p>
        </div>

        <div
          className={`rounded-[24px] border px-4 md:px-5 py-3 md:py-4 mb-6 md:mb-8 flex items-center gap-3 ${
            isDarkMode ? "bg-slate-900 border-white/10" : "bg-white border-black/5"
          }`}
        >
          <Search size={18} className="text-emerald-600 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search FAQs..."
            className="w-full bg-transparent outline-none text-sm md:text-base"
          />
        </div>

        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div
              className={`rounded-[24px] border p-8 text-center ${
                isDarkMode ? "bg-slate-900 border-white/10" : "bg-white border-black/5"
              }`}
            >
              <HelpCircle size={24} className="mx-auto mb-3 text-emerald-600" />
              <p className="font-bold opacity-70">No FAQ matched your search.</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isOpen = openId === item.id;
              return (
                <article
                  key={item.id}
                  className={`rounded-[24px] border overflow-hidden ${
                    isDarkMode ? "bg-slate-900 border-white/10" : "bg-white border-black/5 shadow-sm"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenId((prev) => (prev === item.id ? null : item.id))}
                    className="w-full p-5 md:p-6 flex items-center justify-between gap-4 text-left"
                  >
                    <span className="font-black uppercase tracking-wide text-sm md:text-base">
                      {item.question}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div
                      className={`px-5 md:px-6 pb-6 text-sm md:text-base leading-relaxed ${
                        isDarkMode ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      {item.answer}
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
