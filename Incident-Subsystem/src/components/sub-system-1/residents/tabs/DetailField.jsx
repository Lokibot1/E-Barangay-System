import React from 'react';

const DetailField = ({ label, name, val, isEdit, onChange, type = "text", options = [], max, className = "" }) => {
    const getDisplayLabel = () => {
        if (val === undefined || val === null || val === '') return '---';
        if (name === 'is_voter') return (val == 1 || val === 'Yes') ? 'Yes' : 'No';
        
        const found = (options || []).find(o => String(o.id) === String(val));
        if (found) return found.name || found.number || found;
        return val;
    };

    // Binawasan ang padding at font size para hindi magmukhang "OA" sa laki
    const inputBaseClass = `
        w-full bg-white dark:bg-slate-900 
        border border-slate-300 dark:border-slate-700 
        rounded-xl px-4 py-2.5 
        text-sm font-semibold text-slate-700 dark:text-slate-200 
        outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 
        transition-all shadow-sm
    `;

    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {/* Label: text-[11px] para malinis tingnan */}
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                {label}
            </p>
            
            {isEdit ? (
                type === "select" ? (
                    <div className="relative">
                        <select 
                            name={name} 
                            value={val || ''} 
                            onChange={onChange} 
                            className={`${inputBaseClass} appearance-none cursor-pointer`}
                        >
                            <option value="">Select...</option>
                            {(options || []).map((opt, i) => (
                                <option key={opt.id || i} value={opt.id || opt}>
                                    {opt.name || opt.number || opt}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
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
                /* Display Mode: text-base (16px) */
                <div className="min-h-[32px] flex items-center px-1">
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100 break-words leading-snug">
                        {getDisplayLabel()}
                    </p>
                </div>
            )}
        </div>
    );
};

export default DetailField;