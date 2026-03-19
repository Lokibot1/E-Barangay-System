import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

const normalizeOption = (option) => {
  if (typeof option === "object" && option !== null) {
    return {
      value: option.value,
      label: option.label ?? String(option.value ?? ""),
    };
  }

  return {
    value: option,
    label: String(option ?? ""),
  };
};

const ModernSelectField = ({
  value,
  onChange,
  options = [],
  placeholder = "Select option",
  ariaLabel,
  disabled = false,
  triggerClassName = "",
  popoverClassName = "",
  isDark = false,
  align = "auto",
}) => {
  const [open, setOpen] = useState(false);
  const [popoverAlign, setPopoverAlign] = useState("left");
  const wrapperRef = useRef(null);

  const normalizedOptions = useMemo(
    () => (options || []).map(normalizeOption),
    [options],
  );

  const selectedOption =
    normalizedOptions.find((option) => String(option.value) === String(value)) || null;

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
      const menuWidth = rect.width;
      const overflowRight = rect.left + menuWidth > window.innerWidth - margin;
      const overflowLeft = rect.right - menuWidth < margin;

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
    const handleOutside = (event) => {
      if (!wrapperRef.current || wrapperRef.current.contains(event.target)) return;
      setOpen(false);
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel || placeholder}
        className={`h-11 w-full items-center gap-3 text-left ${triggerClassName} ${
          disabled ? "cursor-not-allowed opacity-60" : ""
        } ${
          open
            ? isDark
              ? "border-emerald-500/70 ring-4 ring-emerald-500/10"
              : "border-emerald-500 ring-4 ring-emerald-500/10"
            : ""
        }`}
        style={{ display: "flex" }}
      >
        <span
          className={`min-w-0 flex-1 truncate text-left text-[12px] font-normal ${
            selectedOption
              ? isDark
                ? "text-slate-100"
                : "text-slate-900"
              : isDark
                ? "text-slate-500"
                : "text-slate-400"
          }`}
        >
          {selectedOption?.label || placeholder}
        </span>
        <span
          className={`ml-auto inline-flex h-4 w-4 shrink-0 items-center justify-center transition-all ${
            isDark ? "text-slate-300" : "text-slate-500"
          } ${open ? "rotate-180" : ""}`}
        >
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>

      {open && (
        <div
          className={`absolute top-full z-50 mt-2 max-h-64 w-full overflow-hidden rounded-[22px] border p-1.5 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl ${
            isDark
              ? "border-slate-800 bg-slate-950/95"
              : "border-slate-200 bg-white/95"
          } ${popoverAlign === "right" ? "right-0" : "left-0"} ${popoverClassName}`}
        >
          <div className="max-h-60 overflow-y-auto pr-0.5">
            {normalizedOptions.map((option) => {
              const isSelected = String(option.value) === String(selectedOption?.value ?? "");

              return (
                <button
                  key={`${option.label}-${String(option.value)}`}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2 text-left text-[11px] font-normal transition-colors ${
                    isSelected
                      ? isDark
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-emerald-50 text-emerald-700"
                      : isDark
                        ? "text-slate-200 hover:bg-slate-900"
                        : "text-slate-700 hover:bg-slate-100"
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check className="h-4 w-4 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernSelectField;
