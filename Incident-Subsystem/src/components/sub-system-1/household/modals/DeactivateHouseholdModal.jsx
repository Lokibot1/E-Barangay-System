import React from 'react';
import { AlertTriangle, Loader2, HomeIcon, Users2 } from 'lucide-react';
import ModalWrapper from '../../common/ModalWrapper';

const DeactivateHouseholdModal = ({
  isOpen,
  onClose,
  onConfirm,
  household,
  loading = false,
  t,
  currentTheme = 'modern',
}) => {
  if (!household) return null;

  const isDark = currentTheme === 'dark';
  const head = household?.head || 'Unknown Head';
  const householdId = household?.id || '—';
  const memberCount = household?.members ?? 0;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Deactivate Household"
      maxWidth="max-w-md"
      t={t}
    >
      <div className="space-y-6 pt-2">
        {/* Warning banner - Adaptive colors */}
        <div className={`flex items-start gap-4 rounded-2xl px-5 py-5 border ${
          isDark 
            ? 'bg-rose-500/10 border-rose-500/20' 
            : 'bg-rose-50 border-rose-100'
        }`}>
          <div className={`p-2 rounded-xl ${isDark ? 'bg-rose-500/20' : 'bg-white shadow-sm'}`}>
            <AlertTriangle size={22} className="text-rose-500 shrink-0" />
          </div>
          <div>
            <p className={`text-[13px] font-black uppercase tracking-tight ${isDark ? 'text-rose-400' : 'text-rose-700'} font-spartan`}>
              Destructive Action
            </p>
            <p className={`mt-1 text-[11px] leading-relaxed font-medium font-kumbh ${isDark ? 'text-rose-300/70' : 'text-rose-600/80'}`}>
              The household record and all <span className="font-bold underline">{memberCount} linked resident{memberCount !== 1 ? 's' : ''}</span> will be marked as <strong className={isDark ? 'text-rose-300' : 'text-rose-800'}>inactive</strong>. This is used specifically for "Moved Out" scenarios.
            </p>
          </div>
        </div>

        {/* Household Summary Card */}
        <div className={`rounded-3xl border-2 p-5 relative overflow-hidden ${t.cardBorder} ${t.inlineBg}`}>
          <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-1">
               <div className="flex items-center gap-1.5 opacity-50 mb-2">
                  <HomeIcon size={12} className={t.cardText} />
                  <span className={`text-[9px] font-black uppercase tracking-widest ${t.cardText} font-spartan`}>Target Household</span>
               </div>
               <p className={`text-lg font-black ${t.cardText} font-spartan tracking-tight leading-tight`}>{head}</p>
               <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-md ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                    ID: {householdId}
                  </span>
                  <span className={`text-[10px] font-bold font-kumbh flex items-center gap-1 ${t.subtleText}`}>
                    <Users2 size={10} /> {memberCount} member{memberCount !== 1 ? 's' : ''}
                  </span>
               </div>
            </div>
          </div>
          {/* Subtle Background Icon */}
          <HomeIcon className={`absolute -right-4 -bottom-4 opacity-[0.03] ${t.cardText}`} size={100} />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className={`flex-1 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all font-spartan disabled:opacity-40 ${
              isDark 
                ? 'border-slate-700 text-slate-400 hover:bg-slate-800' 
                : 'border-slate-100 text-slate-500 hover:bg-slate-50'
            }`}
          >
            Cancel
          </button>
          
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-[1.5] inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-rose-600 text-white hover:bg-rose-700 active:scale-95 transition-all shadow-lg shadow-rose-600/20 font-spartan disabled:opacity-60`}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing
              </>
            ) : (
              'Confirm Deactivation'
            )}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default DeactivateHouseholdModal;