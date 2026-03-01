import React from 'react';
import { IDCard } from '../../common/InfoField';
import { ShieldCheck } from 'lucide-react';

const IdentitySection = ({ details, onZoom, t }) => (
  <div className={`${t.cardBg} p-8 border ${t.cardBorder} border-t-4 border-t-blue-500 rounded-2xl shadow-sm`}>
    <div className="flex items-center gap-2 mb-8 border-l-4 border-blue-500 pl-3">
      <ShieldCheck size={18} className="text-blue-500" />
      <p className="text-xs font-black text-slate-400 uppercase tracking-[2px]">
        Identity Documents ({details?.idType || 'Not Specified'})
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <IDCard label="Front ID Photo" src={details?.idFront} onClick={() => onZoom(details?.idFront)} />
      <IDCard label="Back ID Photo" src={details?.idBack} onClick={() => onZoom(details?.idBack)} />
    </div>
  </div>
);

export default IdentitySection;