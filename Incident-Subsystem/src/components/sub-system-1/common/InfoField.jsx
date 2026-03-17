import React from 'react';
import { Maximize2 } from 'lucide-react';

export const InfoField = ({ label, val, t }) => (
  <div className="flex flex-col items-start gap-1">
    <p className="text-[10px] text-slate-500 font-medium leading-none">
      {label}
    </p>
    <p className={`font-semibold ${t?.cardText ?? 'text-slate-200'} text-sm leading-tight`}>
      {val || '---'}
    </p>
  </div>
);

export const InfoFieldWhite = ({ label, val, icon, t }) => (
  <div className="flex flex-col items-start gap-1">
    <div className="flex items-center gap-1.5">
      {icon && <span className="text-slate-400 opacity-70">{icon}</span>}
      <p className="text-[10px] text-slate-500 font-medium leading-none">
        {label}
      </p>
    </div>
    <p className={`font-semibold ${t ? t.cardText : 'text-slate-700'} text-sm leading-tight`}>
      {val || '---'}
    </p>
  </div>
);

export const IDCard = ({ label, src, onClick }) => (
  <div className="flex flex-col gap-3">
    <span className="text-[11px] font-medium text-slate-500">{label}</span>
    <div 
      onClick={onClick} 
      className="group relative aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden cursor-zoom-in border border-slate-200 dark:border-slate-700 shadow-inner"
    >
      {src ? (
        <img src={src} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" alt={label} />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs italic">No Image</div>
      )}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
        <Maximize2 className="text-white" />
      </div>
    </div>
  </div>
);
