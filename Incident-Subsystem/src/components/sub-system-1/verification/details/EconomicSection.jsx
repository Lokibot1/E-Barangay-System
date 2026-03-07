/**
 * EconomicSection.jsx
 *
 * FIXED: `isHead` is now an explicit prop passed from VerificationDetailView
 * instead of being re-derived from details?.householdPosition.
 *
 * The old approach was fragile — string values like "Head of Family" vs "Head"
 * caused the includes('head') check to sometimes fail, leaving canModify=false
 * even for actual heads. The parent (VerificationDetailView) already computes
 * isHead correctly, so we just receive it here.
 */

import React from 'react';
import { Wallet, Home, Lock } from 'lucide-react';
import { InfoField } from '../../common/InfoField';

const EconomicSection = ({
  details,
  t,
  isIndigent,
  setIsIndigent,
  isNewHousehold,
  isHead = false,   // FIX: now received from parent, not re-derived here
}) => {

  // Head of Family can always modify indigency.
  // Non-head members of a new household cannot set it — only the Head can.
  const canModify = isHead;

  const handleToggle = (e) => {
    e.preventDefault();
    if (canModify) {
      setIsIndigent(isIndigent === 1 ? 0 : 1);
    }
  };

  return (
    <div className={`p-8 rounded-3xl border ${t.cardBorder} ${t.cardBg} space-y-8 shadow-sm relative overflow-hidden`}>
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-black ${t.cardText} uppercase tracking-tight flex items-center gap-3`}>
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
            <Wallet size={20} />
          </div>
          Socio-Economic Profile
        </h3>

        <button
          type="button"
          disabled={!canModify}
          onClick={handleToggle}
          className={`
            flex items-center gap-3 px-5 py-2.5 rounded-2xl border-2 transition-all duration-300
            ${!canModify
              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-70 pointer-events-none'
              : isIndigent
                ? 'bg-rose-500 border-rose-600 text-white shadow-lg shadow-rose-500/30 ring-4 ring-rose-500/10'
                : 'bg-transparent border-slate-200 text-slate-400 hover:border-emerald-500 hover:text-emerald-500'
            }
          `}
        >
          {!canModify && <Lock size={14} />}
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-transform
            ${!canModify ? 'border-slate-300' : isIndigent ? 'bg-white border-white scale-110' : 'border-current'}`}>
            {isIndigent === 1 && (
              <div className={`w-2 h-2 rounded-full ${!canModify ? 'bg-slate-300' : 'bg-rose-500'}`} />
            )}
          </div>
          <span className="text-xs font-black uppercase tracking-widest">
            {!canModify
              ? (isIndigent ? 'Indigent (Locked)' : 'Non-Indigent')
              : (isIndigent ? 'Tagged as Indigent' : 'Tag as Indigent')}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        <InfoField label="Employment Status"    val={details?.employmentStatus} t={t} />
        <InfoField label="Occupation"           val={details?.occupation}       t={t} />
        <InfoField label="Monthly Income"       val={details?.monthlyIncome}    t={t} />
        <InfoField label="Primary Income Source" val={details?.incomeSource}   t={t} />
      </div>

      <div className={`pt-8 border-t ${t.cardBorder}`}>
        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Home size={14} /> Housing Conditions
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <InfoField label="Tenure Status"  val={details?.tenureStatus}  t={t} />
          <InfoField label="Wall Material"  val={details?.wallMaterial}  t={t} />
          <InfoField label="Roof Material"  val={details?.roofMaterial}  t={t} />
          <InfoField label="Water Source"   val={details?.waterSource}   t={t} />
        </div>
      </div>

      {!canModify && (
        <div className="mt-4 py-2 px-4 bg-slate-50 border border-slate-100 rounded-xl">
          <p className="text-[9px] text-slate-400 italic text-center leading-tight uppercase tracking-tighter">
            ReadOnly: Status is inherited from Household Records
          </p>
        </div>
      )}
    </div>
  );
};

export default EconomicSection;