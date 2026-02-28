import { CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin } from "lucide-react";
import { useMemo, useState } from "react";

const WEEK_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const parseEventDate = (value) => new Date(`${value}T00:00:00`);

export default function EventsCalendarSection({ isDarkMode, events }) {
  const [monthCursor, setMonthCursor] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const monthData = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthEvents = (events || [])
      .filter((item) => {
        const date = parseEventDate(item.date);
        return date.getFullYear() === year && date.getMonth() === month;
      })
      .sort((a, b) => parseEventDate(a.date) - parseEventDate(b.date));

    const eventMap = monthEvents.reduce((acc, item) => {
      const day = parseEventDate(item.date).getDate();
      if (!acc[day]) acc[day] = [];
      acc[day].push(item);
      return acc;
    }, {});

    const daySlots = [
      ...Array.from({ length: firstDayIndex }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];

    return { daySlots, monthEvents, eventMap };
  }, [events, monthCursor]);

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(monthCursor);

  return (
    <section
      id="events"
      className={`py-16 md:py-24 px-6 scroll-mt-24 ${
        isDarkMode ? "bg-slate-900/50" : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8 md:mb-10">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-3">
              Community Calendar
            </p>
            <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
              Upcoming Events
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() =>
                setMonthCursor(
                  (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                )
              }
              className={`p-2 rounded-xl border ${
                isDarkMode ? "border-white/10 hover:bg-white/10" : "border-black/10 hover:bg-black/5"
              }`}
            >
              <ChevronLeft size={16} />
            </button>
            <p className="text-sm md:text-base font-black uppercase tracking-widest min-w-[180px] text-center">
              {monthLabel}
            </p>
            <button
              type="button"
              aria-label="Next month"
              onClick={() =>
                setMonthCursor(
                  (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                )
              }
              className={`p-2 rounded-xl border ${
                isDarkMode ? "border-white/10 hover:bg-white/10" : "border-black/10 hover:bg-black/5"
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-8">
          <div
            className={`rounded-[28px] border p-5 md:p-7 ${
              isDarkMode ? "bg-slate-900 border-white/10" : "bg-emerald-50/60 border-black/5"
            }`}
          >
            <div className="grid grid-cols-7 gap-2 mb-3">
              {WEEK_HEADERS.map((label) => (
                <p
                  key={label}
                  className="text-center text-[10px] font-black uppercase tracking-widest opacity-60"
                >
                  {label}
                </p>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {monthData.daySlots.map((day, index) => {
                const hasEvent = day && monthData.eventMap[day]?.length > 0;
                return (
                  <div
                    key={`${day ?? "empty"}-${index}`}
                    className={`aspect-square rounded-xl border flex items-center justify-center text-xs font-black ${
                      !day
                        ? "border-transparent"
                        : hasEvent
                          ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20"
                          : isDarkMode
                            ? "border-white/10 bg-slate-800"
                            : "border-black/10 bg-white"
                    }`}
                  >
                    {day || ""}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            {monthData.monthEvents.length === 0 ? (
              <div
                className={`rounded-[28px] border p-8 text-center ${
                  isDarkMode ? "bg-slate-900 border-white/10" : "bg-white border-black/5"
                }`}
              >
                <CalendarDays size={26} className="mx-auto mb-3 text-emerald-600" />
                <p className="text-sm font-bold opacity-70">
                  No scheduled events for this month.
                </p>
              </div>
            ) : (
              monthData.monthEvents.map((event) => {
                const eventDate = parseEventDate(event.date);
                const dateLabel = new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "numeric",
                  weekday: "short",
                }).format(eventDate);

                return (
                  <article
                    key={event.id}
                    className={`rounded-[24px] border p-5 ${
                      isDarkMode ? "bg-slate-900 border-white/10" : "bg-white border-black/5 shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                        {event.category}
                      </span>
                      <span className="text-[11px] font-bold opacity-60">{dateLabel}</span>
                    </div>
                    <h4 className="text-lg font-black uppercase leading-tight mb-2">{event.title}</h4>
                    <p className="text-sm opacity-70 mb-4">{event.details}</p>
                    <div className="space-y-2 text-xs">
                      <p className="inline-flex items-center gap-2 opacity-70">
                        <Clock3 size={14} className="text-emerald-600" />
                        {event.startTime} - {event.endTime}
                      </p>
                      <p className="inline-flex items-center gap-2 opacity-70">
                        <MapPin size={14} className="text-emerald-600" />
                        {event.location}
                      </p>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
