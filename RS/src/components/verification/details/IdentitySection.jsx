import React from 'react';
import { Maximize2 } from 'lucide-react';

/**
 * Reusable ID Card component with Zoom capability
 */
export const IDCard = ({ label, src, onClick }) => (
  <div className="space-y-3">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
    <div 
      onClick={onClick} 
      className="group relative aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden cursor-zoom-in border border-slate-200 dark:border-slate-700"
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

const IdentitySection = ({ details, onZoom }) => (
  <div className="bg-white dark:bg-slate-900 p-8 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
    <p className="text-xs font-black text-slate-400 uppercase tracking-[2px] mb-8 border-l-4 border-emerald-500 pl-3">
      Identity Documents ({details?.idType || 'Not Specified'})
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Passing the onZoom function to handle the click */}
      <IDCard 
        label="Front ID Photo" 
        src={details?.idFront} 
        onClick={() => onZoom(details?.idFront)} 
      />
      <IDCard 
        label="Back ID Photo" 
        src={details?.idBack} 
        onClick={() => onZoom(details?.idBack)} 
      />
    </div>
  </div>
);

export default IdentitySection;