import { BarChart3, MessageSquare, Send, Star } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "gulod_feedback_entries";

const createEntryId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function FeedbackSection({
  isDarkMode,
  feedbackCategories,
  initialFeedbackEntries,
}) {
  const [entries, setEntries] = useState(() => {
    if (typeof window === "undefined") return initialFeedbackEntries;

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return initialFeedbackEntries;

      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length ? parsed : initialFeedbackEntries;
    } catch {
      return initialFeedbackEntries;
    }
  });
  const [formData, setFormData] = useState({
    name: "",
    category: feedbackCategories[0] || "",
    rating: 5,
    comment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const totalFeedback = entries.length;
  const averageRating =
    totalFeedback > 0
      ? entries.reduce((sum, item) => sum + Number(item.rating || 0), 0) / totalFeedback
      : 0;
  const fiveStarCount = entries.filter((item) => Number(item.rating) === 5).length;
  const satisfactionRate =
    totalFeedback > 0 ? Math.round((fiveStarCount / totalFeedback) * 100) : 0;
  const latestEntries = entries.slice(0, 3);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (submitState !== "idle") {
      setSubmitState("idle");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitState("idle");

    window.setTimeout(() => {
      const nextEntry = {
        id: createEntryId(),
        name: formData.name.trim() || "Anonymous Resident",
        category: formData.category,
        rating: Number(formData.rating),
        comment: formData.comment.trim(),
        submittedAt: new Date().toLocaleDateString("en-PH", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };

      setEntries((prev) => [nextEntry, ...prev]);
      setFormData({
        name: "",
        category: feedbackCategories[0] || "",
        rating: 5,
        comment: "",
      });
      setSubmitState("success");
      setIsSubmitting(false);
    }, 700);
  };

  return (
    <section
      id="feedback"
      className={`px-6 py-12 scroll-mt-24 md:py-16 ${
        isDarkMode ? "bg-slate-950" : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-[8px] font-black uppercase tracking-[0.26em] text-emerald-600 md:text-[9px]">
              Resident Feedback
            </p>
            <h3 className="text-2xl font-black uppercase tracking-tighter md:text-4xl">
              Service Satisfaction Pulse
            </h3>
            <p className={`mt-3 max-w-2xl text-[0.9rem] md:text-[0.95rem] ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
              Collect quick impressions from residents after transactions so the barangay can
              spot strong services and improve weak points faster.
            </p>
          </div>
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] ${
              isDarkMode
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            <BarChart3 size={13} />
            Browser-saved demo feedback
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div
                className={`rounded-[22px] border p-5 ${
                  isDarkMode ? "border-white/10 bg-slate-900" : "border-black/5 bg-emerald-50"
                }`}
              >
                <p className="mb-2 text-[8px] font-black uppercase tracking-[0.18em] text-emerald-600">
                  Average Rating
                </p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black">{averageRating.toFixed(1)}</span>
                  <span className={`pb-1 text-[0.7rem] font-bold ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                    / 5.0
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      size={14}
                      className={
                        index < Math.round(averageRating)
                          ? "fill-current"
                          : "text-slate-300 dark:text-slate-700"
                      }
                    />
                  ))}
                </div>
              </div>

              <div
                className={`rounded-[22px] border p-5 ${
                  isDarkMode ? "border-white/10 bg-slate-900" : "border-black/5 bg-sky-50"
                }`}
              >
                <p className="mb-2 text-[8px] font-black uppercase tracking-[0.18em] text-sky-600">
                  Responses
                </p>
                <p className="text-3xl font-black">{totalFeedback}</p>
                <p className={`mt-3 text-[0.75rem] font-bold leading-5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                  Entries currently saved on this browser
                </p>
              </div>

              <div
                className={`rounded-[22px] border p-5 ${
                  isDarkMode ? "border-white/10 bg-slate-900" : "border-black/5 bg-amber-50"
                }`}
              >
                <p className="mb-2 text-[8px] font-black uppercase tracking-[0.18em] text-amber-600">
                  5-Star Share
                </p>
                <p className="text-3xl font-black">{satisfactionRate}%</p>
                <p className={`mt-3 text-[0.75rem] font-bold leading-5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                  Residents giving the highest satisfaction score
                </p>
              </div>
            </div>

            <div
              className={`rounded-[26px] border p-5 md:p-6 ${
                isDarkMode ? "border-white/10 bg-slate-900" : "border-black/5 bg-slate-50"
              }`}
            >
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-600 p-2.5 text-white">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.18em] text-emerald-600">
                    Recent Voices
                  </p>
                  <h4 className="text-lg font-black uppercase tracking-tight md:text-xl">
                    What residents are saying
                  </h4>
                </div>
              </div>

              <div className="space-y-3">
                {latestEntries.map((entry) => (
                  <article
                    key={entry.id}
                    className={`rounded-[20px] border p-4 ${
                      isDarkMode ? "border-white/10 bg-black/20" : "border-black/5 bg-white"
                    }`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-[0.95rem] font-black uppercase tracking-wide">{entry.name}</p>
                        <p className={`mt-1 text-[9px] font-black uppercase tracking-[0.16em] ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                          {entry.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-amber-400">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              size={13}
                              className={index < entry.rating ? "fill-current" : "text-slate-300 dark:text-slate-700"}
                            />
                          ))}
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-[0.12em] ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                          {entry.submittedAt}
                        </span>
                      </div>
                    </div>
                    <p className={`mt-3 text-[0.9rem] leading-7 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                      {entry.comment}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div
            className={`rounded-[26px] border p-5 md:p-6 ${
              isDarkMode
                ? "border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 to-slate-900"
                : "border-emerald-200 bg-gradient-to-b from-emerald-50 to-white"
            }`}
          >
            <p className="mb-2 text-[8px] font-black uppercase tracking-[0.22em] text-emerald-600">
              Submit Feedback
            </p>
            <h4 className="mb-3 text-xl font-black uppercase tracking-tight md:text-2xl">
              Rate your latest barangay service
            </h4>
            <p className={`mb-5 text-[0.9rem] leading-7 ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
              Share a quick rating after document processing, verification, complaint handling,
              or general assistance.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={formData.name}
                onChange={(event) => handleFieldChange("name", event.target.value)}
                className={`w-full rounded-2xl border px-4 py-3 text-[0.9rem] font-bold outline-none transition-all ${
                  isDarkMode
                    ? "border-white/10 bg-black/30 text-white placeholder:text-slate-500"
                    : "border-black/10 bg-white text-slate-900 placeholder:text-slate-400"
                }`}
              />

              <select
                value={formData.category}
                onChange={(event) => handleFieldChange("category", event.target.value)}
                className={`w-full rounded-2xl border px-4 py-3 text-[0.9rem] font-bold outline-none transition-all ${
                  isDarkMode
                    ? "border-white/10 bg-black/30 text-white"
                    : "border-black/10 bg-white text-slate-900"
                }`}
              >
                {feedbackCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <div>
                <p className="mb-2 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-600">
                  Rating
                </p>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const value = index + 1;
                    const active = value <= formData.rating;

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleFieldChange("rating", value)}
                        className={`rounded-2xl border p-2.5 transition-all ${
                          active
                            ? "border-amber-300 bg-amber-100 text-amber-500"
                            : isDarkMode
                              ? "border-white/10 bg-black/20 text-slate-600 hover:text-amber-400"
                              : "border-black/10 bg-white text-slate-300 hover:text-amber-400"
                        }`}
                        aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                      >
                        <Star size={16} className={active ? "fill-current" : ""} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <textarea
                required
                rows="5"
                placeholder="Tell us what worked well or what should be improved."
                value={formData.comment}
                onChange={(event) => handleFieldChange("comment", event.target.value)}
                className={`w-full rounded-2xl border px-4 py-3 text-[0.9rem] outline-none transition-all ${
                  isDarkMode
                    ? "border-white/10 bg-black/30 text-white placeholder:text-slate-500"
                    : "border-black/10 bg-white text-slate-900 placeholder:text-slate-400"
                }`}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white transition-all hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-400"
              >
                {isSubmitting ? "Saving Feedback..." : (
                  <>
                    <Send size={14} />
                    Submit Feedback
                  </>
                )}
              </button>

              {submitState === "success" && (
                <div
                  className={`rounded-2xl border px-4 py-3 text-[0.8rem] font-bold ${
                    isDarkMode
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  Thank you. Your feedback has been added to the resident satisfaction panel.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
