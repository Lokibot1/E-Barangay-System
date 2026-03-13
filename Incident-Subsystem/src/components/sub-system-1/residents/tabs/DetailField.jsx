import React from 'react';

const inputAccentMap = {
    modern: { border: 'focus:border-blue-500',   ring: 'focus:ring-blue-500/10',   icon: 'group-hover:text-blue-500'   },
    blue:   { border: 'focus:border-blue-500',   ring: 'focus:ring-blue-500/10',   icon: 'group-hover:text-blue-500'   },
    purple: { border: 'focus:border-purple-500', ring: 'focus:ring-purple-500/10', icon: 'group-hover:text-purple-500' },
    green:  { border: 'focus:border-green-500',  ring: 'focus:ring-green-500/10',  icon: 'group-hover:text-green-500'  },
    dark:   { border: 'focus:border-slate-500',  ring: 'focus:ring-slate-500/10',  icon: 'group-hover:text-slate-300'  },
};

const DetailField = ({
    label,
    name,
    val,
    isEdit,
    onChange,
    type      = 'text',
    options   = [],
    max,
    className = '',
    error,
    placeholder,
    t,
    currentTheme = 'modern',
}) => {
    const accent = inputAccentMap[currentTheme] || inputAccentMap.modern;

    // ── Display value (view mode) ─────────────────────────────────────────────
    const getDisplayLabel = () => {
        if (val === undefined || val === null || val === '') return '---';

        if (name === 'is_voter') {
            return (val == 1 || val === 'Yes' || val === true) ? 'Yes' : 'No';
        }

        if (typeof val === 'object' && !Array.isArray(val)) {
            return val.name || val.label || val.number || val.text || 'Data Error';
        }

        if (options && options.length > 0) {
            const strVal = String(val);
            const found  = options.find(o => {
                const oVal =
                    o?.id    != null ? String(o.id)    :
                    o?.value != null ? String(o.value) :
                    String(o);
                return oVal === strVal;
            });
            if (found) {
                return typeof found === 'object'
                    ? (found.name || found.label || found.number || strVal)
                    : String(found);
            }
        }

        return String(val);
    };

    const inputBaseClass = `
        w-full
        ${t?.inputBg || 'bg-white dark:bg-slate-900'}
        border rounded-xl px-4 py-2.5
        text-sm font-semibold
        ${t?.inputText || 'text-slate-700 dark:text-slate-200'}
        outline-none transition-all shadow-sm
        ${error
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
            : `${t?.inputBorder || 'border-slate-300 dark:border-slate-700'} ${accent.border} focus:ring-2 ${accent.ring}`
        }
    `;

    // ── Select value: MUST be a string so React matches <option value="3"> ───
    // React controlled-select matching is strict equality. If val is 3 (number)
    // and option value is "3" (string) they will NOT match → shows "Select...".
    const selectControlledValue = val != null ? String(val) : '';

    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            <div className="flex justify-between items-center px-1">
                <label className={`text-[11px] font-bold ${t?.subtleText || 'text-slate-400 dark:text-slate-500'} uppercase tracking-widest`}>
                    {label}
                </label>
                {isEdit && error && (
                    <span className="text-[10px] font-bold text-red-500 uppercase animate-pulse">
                        Invalid
                    </span>
                )}
            </div>

            {isEdit ? (
                <div className="relative">
                    {type === 'select' ? (
                        <div className="relative group">
                            <select
                                name={name}
                                value={selectControlledValue}
                                onChange={onChange}
                                className={`${inputBaseClass} appearance-none cursor-pointer pr-10`}
                            >
                                <option value="">Select...</option>
                                {(options || []).map((opt, i) => {
                                    // Both key and value MUST be strings
                                    const optVal = opt?.id    != null ? String(opt.id)    :
                                                   opt?.value != null ? String(opt.value) :
                                                   String(opt);
                                    const optLabel = opt?.name || opt?.label || opt?.number || opt;
                                    return (
                                        <option key={optVal || i} value={optVal}>
                                            {optLabel}
                                        </option>
                                    );
                                })}
                            </select>
                            <div className={`absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 transition-colors ${accent.icon}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    ) : (
                        <input
                            type={type}
                            name={name}
                            placeholder={placeholder}
                            value={val != null ? val : ''}
                            onChange={onChange}
                            max={max}
                            className={inputBaseClass}
                        />
                    )}
                    {error && <p className="mt-1 ml-1 text-[10px] font-medium text-red-500">{error}</p>}
                </div>
            ) : (
                <div className="min-h-[45px] flex items-center px-1 group">
                    <p className={`text-base font-bold ${t?.cardText || 'text-slate-800 dark:text-white'} break-words leading-tight group-hover:text-blue-600 transition-colors`}>
                        {getDisplayLabel()}
                    </p>
                </div>
            )}
        </div>
    );
};

export default DetailField;