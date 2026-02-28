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
    <section id="news" className="py-16 md:py-24 px-6 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-12 gap-4">
          <div>
            <h2 className="text-[8px] md:text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-3 md:mb-4">
              Live Updates
            </h2>
            <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
              Announcements
            </h3>
          </div>
          <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest flex items-center gap-2">
            <Bell size={12} className="animate-pulse text-red-500" /> Stay updated
            with community news
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setActiveFilter(option)}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
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
            className={`lg:ml-auto flex items-center gap-2 px-4 py-2 rounded-full border ${
              isDarkMode ? "bg-slate-900 border-white/10" : "bg-white border-black/10"
            }`}
          >
            <Search size={14} className="text-emerald-600" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search announcements..."
              className="bg-transparent outline-none text-xs w-full md:w-[230px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnnouncements.length === 0 ? (
            <div
              className={`col-span-full rounded-[28px] border p-10 text-center ${
                isDarkMode ? "bg-slate-900 border-white/10" : "bg-white border-black/5"
              }`}
            >
              <p className="text-sm font-bold opacity-70">
                No announcements matched your filter.
              </p>
            </div>
          ) : (
            filteredAnnouncements.map((news) => (
              <div
                key={news.id}
                className={`group rounded-[32px] md:rounded-[40px] border overflow-hidden transition-all hover:-translate-y-2 ${
                  isDarkMode
                    ? "bg-slate-900 border-white/5"
                    : "bg-white border-black/5 shadow-sm hover:shadow-xl"
                }`}
              >
                <div className="h-44 md:h-52 overflow-hidden">
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = fallbackImage;
                    }}
                  />
                </div>
                <div className="p-6 md:p-8">
                  <div className="flex justify-between items-center mb-6">
                    <span
                      className={`text-[8px] md:text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                        news.urgent
                          ? "bg-red-500 text-white"
                          : "bg-emerald-500/20 text-emerald-600"
                      }`}
                    >
                      {news.tag}
                    </span>
                    <span className="text-[9px] md:text-[10px] opacity-40 font-bold tracking-widest">
                      {news.date}
                    </span>
                  </div>
                  <h4 className="text-lg md:text-xl font-black uppercase mb-4 leading-tight group-hover:text-emerald-600 transition-colors">
                    {news.title}
                  </h4>
                  <p className="text-xs md:text-sm opacity-60 leading-relaxed mb-8">
                    {news.desc}
                  </p>
                  <button
                    type="button"
                    onClick={() => onReadMore(news)}
                    className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-emerald-600 hover:gap-4 transition-all"
                  >
                    Read More <ArrowUp size={12} className="rotate-45" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
