import React from 'react';

const DetailField = ({ label, name, val, isEdit, onChange, type = "text", options = [], max, className = "", t }) => {
    
    const getDisplayLabel = () => {

        if (val === undefined || val === null || val === '') return '---';
        
        if (name === 'is_voter') {
            return (val == 1 || val === 'Yes' || val === true) ? 'Yes' : 'No';
        }

        if (typeof val === 'object' && !Array.isArray(val)) {
            return val.name || val.label || val.number || val.text || "Data Error";
        }

        if (options && options.length > 0) {
         
            const found = options.find(o => {
                const optId = o?.id !== undefined ? String(o.id) : (o?.value !== undefined ? String(o.value) : String(o));
                return optId === String(val);
            });
            
            if (found) {
             
                if (typeof found === 'object') {
                    return found.name || found.label || found.number || String(val);
                }
                return String(found);
            }
        }

     
        return String(val);
    };

    const inputBaseClass = `
        w-full 
        ${t?.inputBg || 'bg-white dark:bg-slate-900'}
        border ${t?.inputBorder || 'border-slate-300 dark:border-slate-700'}
        rounded-xl px-4 py-2.5
        text-sm font-semibold 
        ${t?.inputText || 'text-slate-700 dark:text-slate-200'}
        outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10
        transition-all shadow-sm
    `;

    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            <p className={`text-[11px] font-bold ${t?.subtleText || 'text-slate-400 dark:text-slate-500'} uppercase tracking-widest ml-1`}>
                {label}
            </p>

            {isEdit ? (
                type === "select" ? (
                    <div className="relative group">
                        <select
                            name={name}
                            value={val && typeof val === 'object' ? (val.id || '') : (val || '')}
                            onChange={onChange}
                            className={`${inputBaseClass} appearance-none cursor-pointer pr-10`}
                        >
                            <option value="">Select...</option>
                            {(options || []).map((opt, i) => {
                                // Siguraduhin na ang ID at Label ay tama kahit anong format ng options array
                                const optId = opt?.id !== undefined ? opt.id : (opt?.value !== undefined ? opt.value : opt);
                                const optLabel = opt?.name || opt?.label || opt?.number || opt;
                                return (
                                    <option key={optId || i} value={optId}>
                                        {optLabel}
                                    </option>
                                );
                            })}
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 group-hover:text-blue-500 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                ) : (
                    <input
                        type={type}
                        name={name}
                        value={val || ''}
                        onChange={onChange}
                        max={max}
                        className={inputBaseClass}
                    />
                )
            ) : (
                <div className="min-h-[40px] flex items-center px-1">
                    <p className={`text-base font-bold ${t?.cardText || 'text-slate-800 dark:text-slate-100'} break-words leading-tight`}>
                        {getDisplayLabel()}
                    </p>
                </div>
            )}
        </div>
    );
};

export default DetailField;