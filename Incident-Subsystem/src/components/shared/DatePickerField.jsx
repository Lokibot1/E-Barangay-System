import React, { useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const safeDateFromValue = (value) => {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatDateDisplay = (value) => {
  const d = safeDateFromValue(value);
  if (!d) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const buildDateValue = (year, monthIndex, day) =>
  `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const isWithinRange = (dateValue, min, max) => {
  if (!dateValue) return false;
  if (min && dateValue < min) return false;
  if (max && dateValue > max) return false;
  return true;
};

const DatePickerField = ({
  value,
  onChange,
  placeholder = "mm/dd/yyyy",
  ariaLabel,
  min,
  max,
  disabled = false,
  align = "auto",
  open: controlledOpen,
  onOpenChange,
  triggerClassName,
  popoverClassName,
  showClear = true,
  showToday = true,
  t,
  isDark,
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [popoverAlign, setPopoverAlign] = useState("left");
  const wrapperRef = useRef(null);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = safeDateFromValue(value) || safeDateFromValue(min) || new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = (next) => {
    if (!isControlled) setUncontrolledOpen(next);
    if (onOpenChange) onOpenChange(next);
  };

  const theme = t || {
    inputBorder: "border-slate-300",
    inputBg: "bg-white",
    inputText: "text-slate-700",
    primaryBorder: "focus:border-emerald-400",
    primarySolid: "bg-emerald-600",
    primaryLight: "bg-emerald-50",
    primaryText: "text-emerald-700",
    subtleText: "text-slate-500",
    cardText: "text-slate-700",
  };

  useEffect(() => {
    const d = safeDateFromValue(value);
    if (d) setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const updateAlign = () => {
      if (!wrapperRef.current) return;
      if (align !== "auto") {
        setPopoverAlign(align);
        return;
      }

      const rect = wrapperRef.current.getBoundingClientRect();
      const popoverWidth = 260;
      const margin = 8;
      const overflowRight = rect.left + popoverWidth > window.innerWidth - margin;
      const overflowLeft = rect.right - popoverWidth < margin;

      if (overflowRight && !overflowLeft) {
        setPopoverAlign("right");
      } else {
        setPopoverAlign("left");
      }
    };

    updateAlign();
    window.addEventListener("resize", updateAlign);
    return () => window.removeEventListener("resize", updateAlign);
  }, [open, align]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (!wrapperRef.current || wrapperRef.current.contains(e.target)) return;
      setOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMon = new Date(year, month + 1, 0).getDate();
  const todayValue = new Date().toISOString().split("T")[0];

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMon; d++) cells.push(d);

  const displayText = value ? formatDateDisplay(value) : placeholder;
  const placeholderClass = isDark ? "text-slate-500" : "text-slate-400";

  const triggerClasses =
    triggerClassName ||
    `w-full rounded-[14px] border px-3 py-2.5 text-[12px] font-kumbh outline-none transition ${theme.inputBorder} ${theme.inputBg} ${theme.primaryBorder}`;

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel || placeholder}
        className={`inline-flex items-center justify-between gap-2 ${triggerClasses} ${
          disabled ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        <span className={`truncate ${value ? theme.inputText : placeholderClass}`}>
          {displayText}
        </span>
        <Calendar className={`h-3.5 w-3.5 ${isDark ? "text-slate-400" : "text-slate-400"}`} />
      </button>

      {open && (
        <div
          className={`absolute z-30 mt-2 w-[260px] rounded-2xl border p-3 shadow-[0_20px_40px_-24px_rgba(15,23,42,0.45)] ${
            isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
          } ${popoverAlign === "right" ? "right-0" : "left-0"} ${popoverClassName || ""}`}
        >
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setViewMonth(new Date(year, month - 1, 1))}
              className={`p-1 rounded-lg transition-colors ${
                isDark ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-100 text-slate-600"
              }`}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className={`text-[12px] font-bold font-spartan ${theme.cardText}`}>
              {MONTH_NAMES[month]} {year}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth(new Date(year, month + 1, 1))}
              className={`p-1 rounded-lg transition-colors ${
                isDark ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-100 text-slate-600"
              }`}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAY_NAMES.map((d) => (
              <div
                key={d}
                className={`text-center text-[10px] font-semibold font-kumbh ${theme.subtleText}`}
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={`e${i}`} />;
              const ds = buildDateValue(year, month, day);
              const selected = value === ds;
              const isToday = ds === todayValue;
              const inRange = isWithinRange(ds, min, max);
              const dayDisabled = disabled || !inRange;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={dayDisabled}
                  onClick={() => {
                    if (dayDisabled) return;
                    onChange(ds);
                    setOpen(false);
                  }}
                  className={`w-8 h-8 rounded-lg text-[11px] font-kumbh font-medium transition-all ${
                    dayDisabled
                      ? isDark
                        ? "text-slate-700 cursor-not-allowed"
                        : "text-slate-300 cursor-not-allowed"
                      : selected
                        ? `${theme.primarySolid} text-white shadow`
                        : isToday
                          ? `${theme.primaryLight} ${theme.primaryText} font-bold border border-current`
                          : isDark
                            ? "text-slate-300 hover:bg-slate-800"
                            : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {(showClear || showToday) && (
            <div
              className={`mt-2 flex items-center justify-between border-t pt-2 ${
                isDark ? "border-slate-800" : "border-slate-100"
              }`}
            >
              {showClear ? (
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                  className={`text-[10px] font-semibold font-kumbh ${
                    isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Clear
                </button>
              ) : (
                <span />
              )}
              {showToday && (
                <button
                  type="button"
                  disabled={!isWithinRange(todayValue, min, max)}
                  onClick={() => {
                    if (!isWithinRange(todayValue, min, max)) return;
                    const today = new Date();
                    const todayValueNext = buildDateValue(
                      today.getFullYear(),
                      today.getMonth(),
                      today.getDate(),
                    );
                    onChange(todayValueNext);
                    setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                    setOpen(false);
                  }}
                  className={`text-[10px] font-semibold font-kumbh ${
                    isWithinRange(todayValue, min, max)
                      ? isDark
                        ? "text-slate-200 hover:text-white"
                        : "text-slate-700 hover:text-slate-900"
                      : "text-slate-300 cursor-not-allowed"
                  }`}
                >
                  Today
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DatePickerField;
