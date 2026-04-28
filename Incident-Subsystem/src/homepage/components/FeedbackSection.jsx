import { Star } from "lucide-react";
import { useMemo } from "react";
import ScrollReveal from "./ScrollReveal";

const MARQUEE_ROW_DURATIONS = ["34s", "38s"];

const AVATAR_THEMES = [
  {
    background: "linear-gradient(135deg, #fde68a 0%, #fb7185 100%)",
    color: "#312e81",
  },
  {
    background: "linear-gradient(135deg, #bfdbfe 0%, #a7f3d0 100%)",
    color: "#0f172a",
  },
  {
    background: "linear-gradient(135deg, #86efac 0%, #0f766e 100%)",
    color: "#ffffff",
  },
  {
    background: "linear-gradient(135deg, #c4b5fd 0%, #f9a8d4 100%)",
    color: "#312e81",
  },
];

const getResidentMeta = (entry = {}) => {
  const role = String(entry.role || "Resident")
    .split(",")[0]
    .trim();
  const organization = String(entry.organization || entry.category || "").trim();

  return organization ? `${role} - ${organization}` : role;
};

const getInitials = (name = "Resident") => {
  const initials = String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase();

  return initials || "R";
};

const getAvatarTheme = (name = "") => {
  const hash = Array.from(String(name)).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0,
  );

  return AVATAR_THEMES[hash % AVATAR_THEMES.length];
};

const buildFeedbackRows = (items = []) => {
  if (items.length <= 1) {
    return [items, items];
  }

  const firstRow = [];
  const secondRow = [];

  items.forEach((item, index) => {
    if (index % 2 === 0) {
      firstRow.push(item);
      return;
    }

    secondRow.push(item);
  });

  return [firstRow, secondRow.length ? secondRow : firstRow];
};

function FeedbackCard({ entry, isDarkMode }) {
  const avatarTheme = getAvatarTheme(entry.name);

  return (
    <article
      className={`flex min-h-[192px] w-[min(78vw,280px)] shrink-0 flex-col rounded-[24px] border px-5 py-4 md:w-[280px] ${
        isDarkMode
          ? "border-white/10 bg-slate-900/92 shadow-[0_22px_44px_-30px_rgba(2,6,23,0.72)]"
          : "border-slate-200/85 bg-white/94 shadow-[0_22px_44px_-30px_rgba(15,23,42,0.2)]"
      }`}
    >
      <span className="text-[2.2rem] font-black leading-none text-blue-600">
        "
      </span>

      <p
        className={`mt-2 text-[0.82rem] font-normal leading-6 tracking-tight md:text-[0.86rem] ${
          isDarkMode ? "text-white" : "text-slate-900"
        }`}
      >
        {entry.comment}
      </p>

      <div className="mt-auto pt-4">
        <div className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.66rem] font-black uppercase shadow-[0_12px_24px_-18px_rgba(15,23,42,0.32)]"
            style={avatarTheme}
          >
            {getInitials(entry.name)}
          </div>

          <div className="min-w-0 text-left">
            <p
              className={`truncate text-[0.86rem] font-black tracking-tight ${
                isDarkMode ? "text-white" : "text-slate-900"
              }`}
            >
              {entry.name}
            </p>
            <p
              title={getResidentMeta(entry)}
              className={`truncate text-[0.68rem] leading-4 ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {getResidentMeta(entry)}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function FeedbackSection({
  isDarkMode,
  initialFeedbackEntries,
}) {
  const entries = useMemo(
    () =>
      Array.isArray(initialFeedbackEntries) ? initialFeedbackEntries : [],
    [initialFeedbackEntries],
  );

  const totalFeedback = entries.length;
  const averageRating = useMemo(
    () =>
      totalFeedback > 0
        ? entries.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
          totalFeedback
        : 0,
    [entries, totalFeedback],
  );

  const feedbackRows = useMemo(() => buildFeedbackRows(entries), [entries]);

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

        {entries.length > 0 ? (
          <ScrollReveal delay={90}>
            <div className="space-y-5">
              {feedbackRows.map((rowEntries, rowIndex) => (
                <div
                  key={`feedback-row-${rowIndex}`}
                  className="feedback-marquee-row relative overflow-hidden py-1"
                >
                  <div
                    className={`feedback-marquee-track ${
                      rowIndex === 0
                        ? "feedback-marquee-track--ltr"
                        : "feedback-marquee-track--rtl"
                    }`}
                    style={{
                      animationDuration:
                        MARQUEE_ROW_DURATIONS[rowIndex] || "34s",
                    }}
                  >
                    {[0, 1].map((copyIndex) => (
                      <div
                        key={`feedback-row-${rowIndex}-copy-${copyIndex}`}
                        className="feedback-marquee-group"
                        aria-hidden={copyIndex === 1 ? "true" : undefined}
                      >
                        {rowEntries.map((entry) => (
                          <FeedbackCard
                            key={`${entry.id}-${copyIndex}`}
                            entry={entry}
                            isDarkMode={isDarkMode}
                          />
                        ))}
                      </div>
                    ))}
                  </div>

                  <div
                    className={`pointer-events-none absolute inset-y-0 left-0 w-16 md:w-24 ${
                      isDarkMode
                        ? "bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent"
                        : "bg-gradient-to-r from-[#eef6f1] via-[#eef6f1]/88 to-transparent"
                    }`}
                  />
                  <div
                    className={`pointer-events-none absolute inset-y-0 right-0 w-16 md:w-24 ${
                      isDarkMode
                        ? "bg-gradient-to-l from-slate-950 via-slate-950/90 to-transparent"
                        : "bg-gradient-to-l from-[#eef6f1] via-[#eef6f1]/88 to-transparent"
                    }`}
                  />
                </div>
              ))}
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
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            #feedback .feedback-marquee-track {
              display: flex;
              width: max-content;
              will-change: transform;
              animation-timing-function: linear;
              animation-iteration-count: infinite;
            }

            #feedback .feedback-marquee-track--ltr {
              animation-name: feedback-marquee-ltr;
            }

            #feedback .feedback-marquee-track--rtl {
              animation-name: feedback-marquee-rtl;
            }

            #feedback .feedback-marquee-group {
              display: flex;
              flex-shrink: 0;
              gap: 1rem;
              padding-right: 1rem;
            }

            #feedback .feedback-marquee-row:hover .feedback-marquee-track,
            #feedback .feedback-marquee-row:focus-within .feedback-marquee-track {
              animation-play-state: paused;
            }

            @keyframes feedback-marquee-rtl {
              from {
                transform: translateX(0);
              }

              to {
                transform: translateX(-50%);
              }
            }

            @keyframes feedback-marquee-ltr {
              from {
                transform: translateX(-50%);
              }

              to {
                transform: translateX(0);
              }
            }

            @media (max-width: 767px) {
              #feedback .feedback-marquee-group {
                gap: 0.85rem;
                padding-right: 0.85rem;
              }

              #feedback .feedback-marquee-track {
                animation-duration: 28s !important;
              }
            }
          `,
        }}
      />
    </section>
  );
}
