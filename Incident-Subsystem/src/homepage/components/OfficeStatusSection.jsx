import { Clock3, Dot, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

const WEEKDAY_ORDER = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const parseTimeToMinutes = (value) => {
  const [hour, minute] = String(value).split(":").map(Number);
  return hour * 60 + minute;
};

const formatMinutes = (minutes) => {
  const hour24 = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const hour12 = hour24 % 12 || 12;
  const period = hour24 >= 12 ? "PM" : "AM";
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
};

const toManilaClock = (timezone, dateValue) => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(dateValue);
  const day = parts.find((part) => part.type === "weekday")?.value ?? "Monday";
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  return { day, minutesOfDay: hour * 60 + minute };
};

const nextDayName = (dayName) => {
  const index = WEEKDAY_ORDER.indexOf(dayName);
  if (index === -1) return "Monday";
  return WEEKDAY_ORDER[(index + 1) % WEEKDAY_ORDER.length];
};

const getNextOpenLabel = ({ day, minutesOfDay, weekdayOpen, saturdayOpen }) => {
  if (day === "Sunday") return `Opens Monday at ${formatMinutes(weekdayOpen)}`;
  if (day === "Saturday") return `Opens Monday at ${formatMinutes(weekdayOpen)}`;

  if (day === "Friday" && minutesOfDay >= parseTimeToMinutes("17:00")) {
    return `Opens Saturday at ${formatMinutes(saturdayOpen)}`;
  }

  const tomorrow = nextDayName(day);
  if (tomorrow === "Saturday") return `Opens Saturday at ${formatMinutes(saturdayOpen)}`;
  if (tomorrow === "Sunday") return `Opens Monday at ${formatMinutes(weekdayOpen)}`;
  return `Opens tomorrow at ${formatMinutes(weekdayOpen)}`;
};

export default function OfficeStatusSection({ isDarkMode, officeHours }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 30 * 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const status = (() => {
    const timezone = officeHours?.timezone || "Asia/Manila";
    const weekdayOpen = parseTimeToMinutes(officeHours?.weekday?.open || "08:00");
    const weekdayClose = parseTimeToMinutes(officeHours?.weekday?.close || "17:00");
    const saturdayOpen = parseTimeToMinutes(officeHours?.saturday?.open || "08:00");
    const saturdayClose = parseTimeToMinutes(officeHours?.saturday?.close || "12:00");
    const currentDate = new Date(now);
    const { day, minutesOfDay } = toManilaClock(timezone, currentDate);

    let isOpen = false;
    let nextChange = "";

    if (day === "Sunday") {
      isOpen = false;
      nextChange = `Opens Monday at ${formatMinutes(weekdayOpen)}`;
    } else if (day === "Saturday") {
      isOpen = minutesOfDay >= saturdayOpen && minutesOfDay < saturdayClose;
      nextChange = isOpen
        ? `Closes today at ${formatMinutes(saturdayClose)}`
        : getNextOpenLabel({ day, minutesOfDay, weekdayOpen, saturdayOpen });
    } else {
      isOpen = minutesOfDay >= weekdayOpen && minutesOfDay < weekdayClose;
      nextChange = isOpen
        ? `Closes today at ${formatMinutes(weekdayClose)}`
        : minutesOfDay < weekdayOpen
          ? `Opens today at ${formatMinutes(weekdayOpen)}`
          : getNextOpenLabel({ day, minutesOfDay, weekdayOpen, saturdayOpen });
    }

    const liveTime = new Intl.DateTimeFormat("en-PH", {
      timeZone: timezone,
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(currentDate);

    return { isOpen, nextChange, liveTime };
  })();

  return (
    <section
      id="office-hours"
      className={`py-16 md:py-20 px-6 scroll-mt-24 ${
        isDarkMode ? "bg-slate-900/40" : "bg-emerald-50/60"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch">
          <div
            className={`flex-1 rounded-[28px] border p-6 md:p-8 ${
              isDarkMode ? "bg-slate-900 border-white/10" : "bg-white border-black/5 shadow-sm"
            }`}
          >
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-3">
              Office Status
            </p>
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-4">
              Barangay Hall
            </h3>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                  status.isOpen ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                }`}
              >
                <Dot size={14} /> {status.isOpen ? "Open Now" : "Closed Now"}
              </span>
              <span className="text-xs opacity-70 inline-flex items-center gap-2">
                <Clock3 size={14} />
                Manila Time: {status.liveTime}
              </span>
            </div>
            <p className="text-sm md:text-base font-semibold mb-2">{status.nextChange}</p>
            <p className="text-xs md:text-sm opacity-70">
              Monday-Friday: 8:00 AM - 5:00 PM | Saturday: 8:00 AM - 12:00 PM
            </p>
          </div>

          <div
            className={`lg:w-[360px] rounded-[28px] border p-6 md:p-8 ${
              isDarkMode ? "bg-slate-900 border-white/10" : "bg-white border-black/5 shadow-sm"
            }`}
          >
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-4">
              Service Counter
            </p>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-black uppercase text-[10px] tracking-widest opacity-60 mb-1">
                  Walk-in Services
                </p>
                <p className="font-semibold">8:00 AM - 4:00 PM (Mon-Fri)</p>
              </div>
              <div>
                <p className="font-black uppercase text-[10px] tracking-widest opacity-60 mb-1">
                  Online Requests
                </p>
                <p className="font-semibold">24/7 Submission | Processing on office hours</p>
              </div>
              <p className="inline-flex items-center gap-2 text-xs opacity-70">
                <MapPin size={14} className="text-emerald-600" />
                Villareal St., Barangay Gulod, Quezon City
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
