import { ArrowUp, Bell, Search } from "lucide-react";
import { useMemo, useState } from "react";

export default function AnnouncementsSection({
  isDarkMode,
  announcements,
  fallbackImage,
  onReadMore,
}) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [query, setQuery] = useState("");

  const filterOptions = useMemo(() => {
    const tags = Array.from(new Set((announcements || []).map((item) => item.tag)));
    return ["All", "Urgent", ...tags];
  }, [announcements]);

  const filteredAnnouncements = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return (announcements || []).filter((item) => {
      const matchesFilter =
        activeFilter === "All"
          ? true
          : activeFilter === "Urgent"
            ? item.urgent
            : item.tag === activeFilter;

      const haystack = [item.title, item.desc, item.fullContent, item.tag]
        .join(" ")
        .toLowerCase();
      const matchesKeyword = keyword ? haystack.includes(keyword) : true;

      return matchesFilter && matchesKeyword;
    });
  }, [activeFilter, announcements, query]);

  return (
    <section id="news" className="px-6 py-12 scroll-mt-20 md:py-16">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col justify-between gap-4 md:mb-10 md:flex-row md:items-end">
          <div>
            <h2 className="mb-2 text-[8px] font-black uppercase tracking-[0.32em] text-emerald-600 md:mb-3 md:text-[9px]">
              Live Updates
            </h2>
            <h3 className="text-3xl font-black uppercase tracking-tighter md:text-4xl">
              Announcements
            </h3>
          </div>
          <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] opacity-50 md:text-[10px]">
            <Bell size={12} className="animate-pulse text-red-500" /> Stay updated
            with community news
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-3 lg:mb-7 lg:flex-row lg:gap-4">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setActiveFilter(option)}
                className={`rounded-full border px-3.5 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] transition-all ${
                  activeFilter === option
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : isDarkMode
                      ? "border-white/10 hover:bg-white/10"
                      : "border-black/10 hover:bg-black/5"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <div
            className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 lg:ml-auto ${
              isDarkMode ? "bg-slate-900 border-white/10" : "bg-white border-black/10"
            }`}
          >
            <Search size={13} className="text-emerald-600" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search announcements..."
              className="w-full bg-transparent text-[0.8rem] outline-none md:w-[210px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredAnnouncements.length === 0 ? (
            <div
              className={`col-span-full rounded-[24px] border p-8 text-center ${
                isDarkMode ? "bg-slate-900 border-white/10" : "bg-white border-black/5"
              }`}
            >
              <p className="text-sm font-bold opacity-70">
                No announcements matched your filter.
              </p>
            </div>
          ) : (
            filteredAnnouncements.map((news) => {
              const hasVisualMedia = Boolean(news.media?.url || news.image);

              return (
                <div
                  key={news.id}
                  className={`group overflow-hidden rounded-[28px] border transition-all hover:-translate-y-2 md:rounded-[32px] ${
                    isDarkMode
                      ? "bg-slate-900 border-white/5"
                      : "bg-white border-black/5 shadow-sm hover:shadow-xl"
                  }`}
                >
                  <div className="h-36 overflow-hidden md:h-44">
                    {news.media?.kind === "video" && news.media?.url ? (
                      <video
                        src={news.media.url}
                        poster={fallbackImage}
                        className="w-full h-full object-cover"
                        muted
                        autoPlay
                        loop
                        playsInline
                        preload="metadata"
                      />
                    ) : hasVisualMedia ? (
                      <img
                        src={news.media?.url || news.image}
                        alt={news.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = fallbackImage;
                        }}
                      />
                    ) : (
                      <div
                        className={`flex h-full w-full flex-col justify-end bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_45%),linear-gradient(180deg,#f8fafc,#e2e8f0)] p-4 ${
                          isDarkMode
                            ? "bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.18),_transparent_42%),linear-gradient(180deg,#0f172a,#020617)]"
                            : ""
                        }`}
                      >
                        <span className="inline-flex w-fit rounded-full bg-white/80 px-3 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-emerald-700 shadow-sm">
                          {news.tag || "Announcement"}
                        </span>
                        <p
                          className={`mt-2.5 max-w-[220px] text-base font-black uppercase leading-tight ${
                            isDarkMode ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {news.title}
                        </p>
                        <p
                          className={`mt-1.5 text-[0.78rem] ${
                            isDarkMode ? "text-slate-300" : "text-slate-600"
                          }`}
                        >
                          No media attached yet
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="p-5 text-left md:p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <span
                        className={`rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-[0.14em] md:text-[8px] ${
                          news.urgent
                            ? "bg-red-500 text-white"
                            : "bg-emerald-500/20 text-emerald-600"
                        }`}
                      >
                        {news.tag}
                      </span>
                      <span className="text-[8px] font-bold tracking-[0.14em] opacity-40 md:text-[9px]">
                        {news.date}
                      </span>
                    </div>
                    <h4 className="mb-3 text-left text-base font-black uppercase leading-tight transition-colors group-hover:text-emerald-600 md:text-[1.35rem]">
                      {news.title}
                    </h4>
                    <p className="mb-6 text-left text-[0.82rem] leading-7 opacity-60 md:text-[0.9rem]">
                      {news.desc}
                    </p>
                    <button
                      type="button"
                      onClick={() => onReadMore(news)}
                      className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.18em] text-emerald-600 transition-all hover:gap-4 md:text-[9px]"
                    >
                      Read More <ArrowUp size={12} className="rotate-45" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
