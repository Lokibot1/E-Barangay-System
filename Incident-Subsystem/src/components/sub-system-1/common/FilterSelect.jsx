import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

const selectAccentMap = {
  modern: {
    activeBorder: 'border-blue-500',
    ring: 'ring-blue-500/10',
    hoverBorder: 'hover:border-blue-300',
    icon: 'text-blue-500',
    optionSelected: 'bg-blue-50 text-blue-700',
    optionHover: 'hover:bg-blue-50/70 hover:text-blue-700',
    check: 'text-blue-600',
  },
  blue: {
    activeBorder: 'border-blue-500',
    ring: 'ring-blue-500/10',
    hoverBorder: 'hover:border-blue-300',
    icon: 'text-blue-500',
    optionSelected: 'bg-blue-50 text-blue-700',
    optionHover: 'hover:bg-blue-50/70 hover:text-blue-700',
    check: 'text-blue-600',
  },
  purple: {
    activeBorder: 'border-purple-500',
    ring: 'ring-purple-500/10',
    hoverBorder: 'hover:border-purple-300',
    icon: 'text-purple-500',
    optionSelected: 'bg-purple-50 text-purple-700',
    optionHover: 'hover:bg-purple-50/70 hover:text-purple-700',
    check: 'text-purple-600',
  },
  green: {
    activeBorder: 'border-green-500',
    ring: 'ring-green-500/10',
    hoverBorder: 'hover:border-green-300',
    icon: 'text-green-500',
    optionSelected: 'bg-green-50 text-green-700',
    optionHover: 'hover:bg-green-50/70 hover:text-green-700',
    check: 'text-green-600',
  },
  dark: {
    activeBorder: 'border-slate-500',
    ring: 'ring-slate-500/15',
    hoverBorder: 'hover:border-slate-500',
    icon: 'text-slate-300',
    optionSelected: 'bg-slate-700 text-slate-100',
    optionHover: 'hover:bg-slate-700 hover:text-slate-100',
    check: 'text-slate-200',
  },
};

const FilterSelect = ({
  label,
  value,
  onChange,
  options,
  t,
  currentTheme = typeof window !== 'undefined' ? localStorage.getItem('appTheme') || 'modern' : 'modern',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const isActive = value !== 'All';
  const accent = selectAccentMap[currentTheme] || selectAccentMap.modern;

  const normalizedOptions = useMemo(() => {
    const optionList = (options || []).map((opt) => ({
      value: typeof opt === 'object' ? opt.value : opt,
      label: typeof opt === 'object' ? opt.label : opt,
    }));

    return [{ value: 'All', label: 'All' }, ...optionList];
  }, [options]);

  const selectedOption =
    normalizedOptions.find((opt) => String(opt.value) === String(value)) ||
    normalizedOptions[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const triggerClasses = isOpen || isActive
    ? `${accent.activeBorder} ring-4 ${accent.ring} shadow-md`
    : `${t.inputBorder} ${accent.hoverBorder}`;

  return (
    <div ref={containerRef} className="relative min-w-[160px] w-full lg:w-48">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`
          w-full flex items-center justify-between gap-3 pl-5 pr-4 py-3.5
          ${t.inputBg} border-2 rounded-2xl outline-none transition-all
          ${t.inputText} ${triggerClasses}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate text-sm font-medium font-kumbh">
          {label}: {selectedOption.label}
        </span>
        <ChevronDown
          size={15}
          className={`shrink-0 transition-all duration-200 ${
            isOpen || isActive ? `${accent.icon} rotate-180` : 'text-slate-400'
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`
            absolute top-full left-0 z-[70] mt-2 w-full overflow-hidden
            rounded-2xl border ${t.cardBorder} ${t.cardBg}
            shadow-2xl backdrop-blur-xl
          `}
        >
          <div className="max-h-72 overflow-y-auto p-2">
            {normalizedOptions.map((opt) => {
              const isSelected = String(opt.value) === String(selectedOption.value);

              return (
                <button
                  key={`${label}-${opt.value}`}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5
                    text-left text-sm transition-all font-kumbh
                    ${
                      isSelected
                        ? `${accent.optionSelected} shadow-sm`
                        : `${t.cardText} ${accent.optionHover}`
                    }
                  `}
                >
                  <span className="truncate font-medium">{opt.label}</span>
                  {isSelected && <Check size={15} className={`shrink-0 ${accent.check}`} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSelect;
