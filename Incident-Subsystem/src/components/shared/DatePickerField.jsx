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
const POPOVER_WIDTH = 262;

// ── YEAR/MONTH PICKER COMPONENT ───────────────────────────────────────────
const YearMonthPicker = ({
  currentYear,
  currentMonth,
  min,
  max,
  isDark,
  theme,
  onSelectYearMonth,
  onBack,
}) => {
  const minYear = min ? new Date(min).getFullYear() : 1900;
  const maxYear = max ? new Date(max).getFullYear() : new Date().getFullYear();
  
  const yearList = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => maxYear - i
  );

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className={`inline-flex h-7 w-7 items-center justify-center rounded-xl transition-colors ${
            isDark
              ? "bg-slate-900 text-slate-300 hover:bg-slate-800"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
          aria-label="Back to calendar"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <select
          value={currentYear}
          onChange={(e) => {
            const newYear = parseInt(e.target.value);
            onSelectYearMonth(newYear, currentMonth);
          }}
          className={`flex-1 mx-2 text-center text-[12px] font-semibold rounded-lg border outline-none transition cursor-pointer ${
            isDark
              ? "bg-slate-900 border-slate-700 text-white"
              : "bg-slate-100 border-slate-300 text-slate-900"
          }`}
        >
          {yearList.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-1">
        {MONTH_NAMES.map((name, idx) => {
          const isDisabled = min || max
            ? (() => {
                const testDate = `${currentYear}-${String(idx + 1).padStart(2, "0")}-15`;
                if (min && testDate < min) return true;
                if (max && testDate > max) return true;
                return false;
              })()
            : false;

          return (
            <button
              key={idx}
              type="button"
              disabled={isDisabled}
              onClick={() => {
                if (!isDisabled) onSelectYearMonth(currentYear, idx);
              }}
              className={`py-2 px-1 rounded-lg text-[11px] font-semibold transition ${
                isDisabled
                  ? isDark
                    ? "text-slate-600 cursor-not-allowed"
                    : "text-slate-300 cursor-not-allowed"
                  : idx === currentMonth
                    ? `${theme.primarySolid} text-white`
                    : isDark
                      ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {name.slice(0, 3)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const safeDateFromValue = (value) => {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatDateDisplay = (value) => {
  const d = safeDateFromValue(value);
  if (!d) return "";
  return [
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
    String(d.getFullYear()),
  ].join("/");
};

const buildDateValue = (year, monthIndex, day) =>
  `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const normalizeTypedDate = (rawValue) => {
  const digits = String(rawValue || "").replace(/\D/g, "").slice(0, 8);
  if (!digits) return "";
  const month = digits.slice(0, 2);
  const day = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  return [month, day, year].filter(Boolean).join("/");
};

const parseDisplayDate = (displayValue) => {
  const match = String(displayValue || "").match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || year < 1) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return buildDateValue(year, month - 1, day);
};

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
  const inputRef = useRef(null);
  const [draftText, setDraftText] = useState(null);
  const [showYearMonth, setShowYearMonth] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const d =
      safeDateFromValue(value) ||
      safeDateFromValue(max) ||
      safeDateFromValue(min) ||
      new Date();
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
      const margin = 8;
      const overflowRight = rect.left + POPOVER_WIDTH > window.innerWidth - margin;
      const overflowLeft = rect.right - POPOVER_WIDTH < margin;

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

  const displayText = draftText ?? formatDateDisplay(value);
  const placeholderClass = isDark ? "text-slate-500" : "text-slate-400";

  const triggerClasses =
    triggerClassName ||
    `w-full rounded-[18px] border px-3 py-2.5 text-[12px] font-kumbh outline-none transition ${
      theme.inputBorder
    } ${theme.inputBg} ${theme.primaryBorder} ${
      isDark ? "shadow-[0_10px_25px_-20px_rgba(15,23,42,0.95)]" : "shadow-[0_14px_30px_-24px_rgba(15,23,42,0.35)]"
    }`;

  const commitTypedValue = (rawValue) => {
    const formatted = normalizeTypedDate(rawValue);

    if (!formatted) {
      setDraftText(null);
      onChange("");
      return;
    }

    setDraftText(formatted);

    const parsed = parseDisplayDate(formatted);
    if (!parsed || !isWithinRange(parsed, min, max)) {
      if (value) onChange("");
      return;
    }

    onChange(parsed);
    setDraftText(null);
    const parsedDate = safeDateFromValue(parsed);
    if (parsedDate) {
      setViewMonth(new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1));
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        role="group"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel || placeholder}
        className={`h-11 items-center gap-3 text-left ${triggerClasses} ${
          disabled ? "opacity-60 cursor-not-allowed" : ""
        } ${
          open
            ? isDark
              ? "border-emerald-500/70 ring-4 ring-emerald-500/10"
              : "border-emerald-500 ring-4 ring-emerald-500/10"
            : ""
        }`}
        style={{ display: "flex" }}
        onClick={() => {
          if (!disabled) inputRef.current?.focus();
        }}
      >
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          disabled={disabled}
          value={displayText}
          placeholder={placeholder}
          aria-label={ariaLabel || placeholder}
          onChange={(e) => commitTypedValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" && !open) {
              e.preventDefault();
              setOpen(true);
            }
            if (e.key === "Enter") {
              e.preventDefault();
              const parsed = parseDisplayDate(displayText);
              if (parsed && isWithinRange(parsed, min, max)) {
                onChange(parsed);
                setDraftText(null);
                setOpen(false);
              }
            }
          }}
          className={`min-w-0 flex-1 border-0 bg-transparent text-left text-[12px] font-normal outline-none ${
            displayText ? theme.inputText : placeholderClass
          }`}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) setOpen(!open);
          }}
          aria-label={open ? "Close calendar" : "Open calendar"}
          className={`ml-auto inline-flex h-4 w-4 shrink-0 items-center justify-center bg-transparent transition-colors ${
            isDark ? "text-slate-300" : "text-slate-500"
          }`}
        >
          <Calendar className="h-4 w-4" />
        </button>
      </div>

      {open && (
        <div
          className={`absolute z-30 mt-2 w-[262px] rounded-[22px] border p-2.5 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl ${
            isDark
              ? "bg-slate-950/95 border-slate-800"
              : "bg-white/95 border-slate-200"
          } ${popoverAlign === "right" ? "right-0" : "left-0"} ${popoverClassName || ""}`}
        >
          {!showYearMonth ? (
            <>
              <div className="mb-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setViewMonth(new Date(year, month - 1, 1))}
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-xl transition-colors ${
                    isDark
                      ? "bg-slate-900 text-slate-300 hover:bg-slate-800"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowYearMonth(true)}
                  className={`min-w-0 flex-1 truncate text-center text-[12px] font-normal font-spartan px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    isDark
                      ? "text-slate-100 hover:bg-slate-800"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {MONTH_NAMES[month]} {year}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMonth(new Date(year, month + 1, 1))}
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-xl transition-colors ${
                    isDark
                      ? "bg-slate-900 text-slate-300 hover:bg-slate-800"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                  aria-label="Next month"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mb-1 grid grid-cols-7 gap-0.5">
                {DAY_NAMES.map((d) => (
                  <div
                    key={d}
                    className={`text-center text-[7px] font-normal tracking-[0.08em] font-kumbh ${theme.subtleText}`}
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5">
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
                        setDraftText(null);
                        onChange(ds);
                        setOpen(false);
                      }}
                      className={`h-7 w-7 rounded-xl text-[9px] font-kumbh font-normal transition-all ${
                        dayDisabled
                          ? isDark
                            ? "text-slate-700 cursor-not-allowed"
                            : "text-slate-300 cursor-not-allowed"
                          : selected
                            ? `${theme.primarySolid} text-white shadow-[0_16px_30px_-18px_rgba(5,150,105,0.95)] scale-[1.03]`
                            : isToday
                              ? `${theme.primaryLight} ${theme.primaryText} border border-emerald-500/25`
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
            </>
          ) : (
            <YearMonthPicker
              currentYear={year}
              currentMonth={month}
              min={min}
              max={max}
              isDark={isDark}
              theme={theme}
              onSelectYearMonth={(newYear, newMonth) => {
                setViewMonth(new Date(newYear, newMonth, 1));
                setShowYearMonth(false);
              }}
              onBack={() => setShowYearMonth(false)}
            />
          )}

          {!showYearMonth && (showClear || showToday) && (
            <div
              className={`mt-2.5 flex items-center justify-between border-t pt-2.5 ${
                isDark ? "border-slate-800" : "border-slate-100"
              }`}
            >
              {showClear ? (
                <button
                  type="button"
                  onClick={() => {
                    setDraftText(null);
                    onChange("");
                    setOpen(false);
                  }}
                  className={`text-[8px] font-normal tracking-[0.08em] font-kumbh transition-colors ${
                    isDark
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-500 hover:text-slate-900"
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
                    setDraftText(null);
                    onChange(todayValueNext);
                    setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                    setOpen(false);
                  }}
                  className={`text-[8px] font-normal tracking-[0.08em] font-kumbh transition-colors ${
                    isWithinRange(todayValue, min, max)
                      ? isDark
                        ? "text-emerald-300 hover:text-emerald-200"
                        : "text-emerald-700 hover:text-emerald-800"
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
