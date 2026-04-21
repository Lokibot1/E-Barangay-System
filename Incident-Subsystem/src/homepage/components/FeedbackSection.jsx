import { Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ScrollReveal from "./ScrollReveal";

const CARDS_PER_PAGE = 4;
const AUTO_SLIDE_INTERVAL = 5200;

const chunkEntries = (items = [], size = CARDS_PER_PAGE) => {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
};

const getResidentMeta = (entry = {}) => {
  const role = String(entry.role || "Resident")
    .split(",")[0]
    .trim();
  const organization = String(entry.organization || entry.category || "").trim();

  return organization ? `${role} • ${organization}` : role;
};

export default function FeedbackSection({
  isDarkMode,
  initialFeedbackEntries,
}) {
  const entries = useMemo(
    () =>
      Array.isArray(initialFeedbackEntries) ? initialFeedbackEntries : [],
    [initialFeedbackEntries],
  );
  const [activePage, setActivePage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const totalFeedback = entries.length;
  const averageRating = useMemo(
    () =>
      totalFeedback > 0
        ? entries.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
          totalFeedback
        : 0,
    [entries, totalFeedback],
  );
  const testimonialPages = useMemo(
    () => chunkEntries(entries, CARDS_PER_PAGE),
    [entries],
  );
  const visibleEntries = testimonialPages[activePage] || [];

  useEffect(() => {
    if (testimonialPages.length === 0) {
      setActivePage(0);
      return;
    }

    if (activePage > testimonialPages.length - 1) {
      setActivePage(testimonialPages.length - 1);
    }
  }, [activePage, testimonialPages.length]);

  useEffect(() => {
    if (testimonialPages.length <= 1 || isPaused) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActivePage((prev) => (prev + 1) % testimonialPages.length);
    }, AUTO_SLIDE_INTERVAL);

    return () => window.clearInterval(intervalId);
  }, [isPaused, testimonialPages.length]);

  return (
    <section
      id="feedback"
      className={`px-6 py-11 scroll-mt-24 md:py-14 ${
        isDarkMode
          ? "bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_42%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]"
          : "bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_38%),linear-gradient(180deg,#f8fbf9_0%,#eef6f1_100%)]"
      }`}
    >
      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="mb-7 flex flex-col gap-5 md:mb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-[8px] font-black uppercase tracking-[0.28em] text-emerald-600 md:text-[9px]">
              Resident Testimonials
            </p>
            <h3 className="text-2xl font-black uppercase tracking-tighter md:text-4xl">
              What Residents Say
            </h3>
          </div>

          <div className="shrink-0 lg:text-right">
            <div className="flex items-center gap-1 text-amber-400 lg:justify-end">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  size={16}
                  className={
                    index < Math.round(averageRating)
                      ? "fill-current"
                      : isDarkMode
                        ? "text-slate-700"
                        : "text-slate-300"
                  }
                />
              ))}
            </div>
            <p
              className={`mt-2 text-[0.86rem] font-medium ${
                isDarkMode ? "text-slate-300" : "text-slate-700"
              }`}
            >
              <span className="font-black">{averageRating.toFixed(1)}</span>{" "}
              average resident rating ({totalFeedback}{" "}
              {totalFeedback === 1 ? "response" : "responses"})
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-6">
          {visibleEntries.length > 0 ? (
            <ScrollReveal delay={90}>
              <div
                className="overflow-hidden"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onFocusCapture={() => setIsPaused(true)}
                onBlurCapture={() => setIsPaused(false)}
              >
                <div
                  className="flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    width: `${testimonialPages.length * 100}%`,
                    transform: `translateX(-${activePage * (100 / testimonialPages.length)}%)`,
                  }}
                >
                  {testimonialPages.map((pageEntries, pageIndex) => (
                    <div
                      key={`testimonial-page-${pageIndex}`}
                      className="w-full shrink-0"
                      style={{ width: `${100 / testimonialPages.length}%` }}
                    >
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {pageEntries.map((entry) => (
                          <article
                            key={entry.id}
                            className={`flex h-full min-h-[220px] flex-col rounded-[24px] border p-4 md:p-5 ${
                              isDarkMode
                                ? "border-white/10 bg-slate-900/95 shadow-[0_16px_36px_-28px_rgba(15,23,42,0.45)]"
                                : "border-black/5 bg-white/95 shadow-[0_16px_32px_-28px_rgba(15,23,42,0.2)]"
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="text-[0.95rem] font-black tracking-tight">
                                {entry.name}
                              </p>
                              <p
                                title={getResidentMeta(entry)}
                                className={`mt-1 truncate text-[0.74rem] font-medium leading-5 ${
                                  isDarkMode
                                    ? "text-slate-400"
                                    : "text-slate-500"
                                }`}
                              >
                                {getResidentMeta(entry)}
                              </p>
                            </div>

                            <div className="mt-4 flex items-center gap-1 text-amber-400">
                              {Array.from({ length: 5 }).map((_, starIndex) => (
                                <Star
                                  key={starIndex}
                                  size={13}
                                  className={
                                    starIndex < entry.rating
                                      ? "fill-current"
                                      : isDarkMode
                                        ? "text-slate-700"
                                        : "text-slate-300"
                                  }
                                />
                              ))}
                            </div>

                            <p
                              className={`mt-5 line-clamp-4 text-[0.8rem] leading-6 md:text-[0.84rem] ${
                                isDarkMode ? "text-slate-200" : "text-slate-700"
                              }`}
                            >
                              "{entry.comment}"
                            </p>
                          </article>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ) : (
            <ScrollReveal
              className={`rounded-[28px] border p-8 text-center ${
                isDarkMode
                  ? "border-white/10 bg-slate-900/95"
                  : "border-slate-200 bg-white"
              }`}
            >
              <p
                className={`text-[0.95rem] font-medium ${
                  isDarkMode ? "text-slate-300" : "text-slate-600"
                }`}
              >
                No testimonials available yet.
              </p>
            </ScrollReveal>
          )}

          {testimonialPages.length > 1 && (
            <ScrollReveal
              delay={120}
              className="flex items-center justify-center gap-2"
            >
              {testimonialPages.map((_, index) => {
                const active = index === activePage;

                return (
                  <button
                    key={`testimonial-page-dot-${index}`}
                    type="button"
                    onClick={() => setActivePage(index)}
                    aria-label={`Show testimonial page ${index + 1}`}
                    aria-pressed={active}
                    className={`h-2.5 rounded-full transition-all ${
                      active
                        ? "w-7 bg-emerald-500"
                        : isDarkMode
                          ? "w-2.5 bg-white/15 hover:bg-white/25"
                          : "w-2.5 bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                );
              })}
            </ScrollReveal>
          )}
        </div>
      </div>
    </section>
  );
}
