import { CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import ScrollReveal from "./ScrollReveal";

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
      className={`py-10 scroll-mt-24 md:py-14 ${
        isDarkMode ? "bg-slate-900/50" : "bg-white"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end md:mb-8">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-3">
              Community Calendar
            </p>
            <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">
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
              className={`rounded-xl border p-2 ${
                isDarkMode ? "border-white/10 hover:bg-white/10" : "border-black/10 hover:bg-black/5"
              }`}
            >
              <ChevronLeft size={16} />
            </button>
            <p className="min-w-[150px] text-center text-[0.85rem] font-black uppercase tracking-[0.16em] md:text-[0.95rem]">
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
              className={`rounded-xl border p-2 ${
                isDarkMode ? "border-white/10 hover:bg-white/10" : "border-black/10 hover:bg-black/5"
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.78fr]">
          <ScrollReveal
            className={`rounded-[24px] border p-4 md:p-5 ${
              isDarkMode ? "bg-slate-900 border-white/10" : "bg-emerald-50/60 border-black/5"
            }`}
          >
            <div className="mb-3 grid grid-cols-7 gap-2">
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
                    className={`flex aspect-square items-center justify-center rounded-xl border text-xs font-black ${
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
          </ScrollReveal>

          <div className="space-y-3 self-start xl:max-w-[640px]">
            {monthData.monthEvents.length === 0 ? (
              <ScrollReveal
                className={`rounded-[24px] border p-7 text-center ${
                  isDarkMode ? "bg-slate-900 border-white/10" : "bg-white border-black/5"
                }`}
              >
                <CalendarDays size={26} className="mx-auto mb-3 text-emerald-600" />
                <p className="text-sm font-bold opacity-70">
                  No scheduled events for this month.
                </p>
              </ScrollReveal>
            ) : (
              monthData.monthEvents.map((event, index) => {
                const eventDate = parseEventDate(event.date);
                const dateLabel = new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "numeric",
                  weekday: "short",
                }).format(eventDate);
                const timeLabel =
                  event.startTime && event.endTime
                    ? `${event.startTime} - ${event.endTime}`
                    : event.startTime || "Time to be announced";
                const locationLabel =
                  event.location || "Location to be announced";

                return (
                  <ScrollReveal
                    key={event.id}
                    as="article"
                    delay={120}
                    staggerIndex={index}
                    className={`rounded-[18px] border px-4 py-3.5 text-left ${
                      isDarkMode ? "bg-slate-900 border-white/10" : "bg-white border-black/5 shadow-sm"
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <span className="text-[8px] font-black uppercase tracking-[0.18em] text-emerald-600">
                        {event.category}
                      </span>
                      <span className="text-[9px] font-bold opacity-60">{dateLabel}</span>
                    </div>
                    <h4 className="mb-1.5 text-left text-[0.88rem] font-black uppercase leading-snug md:text-[0.95rem]">
                      {event.title}
                    </h4>
                    <p className="mb-2.5 line-clamp-2 text-left text-[0.78rem] leading-6 opacity-70">
                      {event.details}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-left text-[0.74rem]">
                      <p className="flex items-center gap-2 opacity-70">
                        <Clock3 size={11} className="text-emerald-600" />
                        <span>{timeLabel}</span>
                      </p>
                      <p className="flex items-center gap-2 opacity-70">
                        <MapPin size={11} className="shrink-0 text-emerald-600" />
                        <span>{locationLabel}</span>
                      </p>
                    </div>
                  </ScrollReveal>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
