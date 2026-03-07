import React from 'react';
import { IDCard } from '../../common/InfoField';
import { ShieldCheck } from 'lucide-react';

const accentBorderMap = {
  modern: 'border-t-blue-500 border-l-blue-500 text-blue-500',
  blue: 'border-t-blue-500 border-l-blue-500 text-blue-500',
  purple: 'border-t-purple-500 border-l-purple-500 text-purple-500',
  green: 'border-t-green-500 border-l-green-500 text-green-500',
  dark: 'border-t-slate-500 border-l-slate-500 text-slate-300',
};

const IdentitySection = ({ details, onZoom, t, currentTheme = 'modern' }) => {
  const accent = accentBorderMap[currentTheme] || accentBorderMap.modern;
  const [topBorder, leftBorder, iconColor] = accent.split(' ');

  return (
  <div className={`${t.cardBg} p-8 border ${t.cardBorder} border-t-4 ${topBorder} rounded-2xl shadow-sm`}>
    <div className={`flex items-center gap-2 mb-8 border-l-4 ${leftBorder} pl-3`}>
      <ShieldCheck size={18} className={iconColor} />
      <p className={`text-xs font-black uppercase tracking-[2px] ${t.subtleText}`}>
        Identity Documents ({details?.idType || 'Not Specified'})
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <IDCard label="Front ID Photo" src={details?.idFront} onClick={() => onZoom(details?.idFront)} />
      <IDCard label="Back ID Photo" src={details?.idBack} onClick={() => onZoom(details?.idBack)} />
    </div>
  </div>
);
};

export default IdentitySection;
