import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';

const ProgressSection = ({ data, formatDate }) => {
  const status = data?.status?.toLowerCase();

  return (
    <div className="bg-[#0b1224] p-8 rounded-3xl mt-3 border-t border-slate-800 shadow-2xl text-white">
      <div className="flex items-center gap-2 mb-6">
        <Clock size={16} className="text-blue-400" />
        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
          Application Timeline
        </p>
      </div>

      <div className="space-y-6">
        {/* Step 1: Date Submitted */}
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <div className="w-px h-10 bg-slate-800 mt-1" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Date Submitted</p>
            <p className="text-xs font-semibold text-slate-200">
              {/* Prioritize 'date' from service, fallback to created_at */}
              {(data?.date && data.date !== 'N/A') ? data.date : (formatDate(data?.created_at) || 'Pending')}
            </p>
          </div>
        </div>

     {/* Verification Visit Step */}
{(data?.details?.visit_set_at && data.details.visit_set_at !== 'N/A') && (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
      <div className="w-px h-10 bg-slate-800 mt-1" />
    </div>
    <div>
      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">
        Visit Set By: {data.details.visit_set_by_name} 
        <span className="ml-1 opacity-50 lowercase">({data.details.visit_set_by_role})</span>
      </p>
      
      <p className="text-xs font-black text-blue-200">
        {data.details.visit_set_at}
      </p>
    </div>
  </div>
)}

   {/* Step 3: Rejected Box */}
{status === 'rejected' && (
  <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-3">
    <div>
      <p className="text-[10px] text-rose-500 font-black uppercase flex items-center gap-1 mb-1">
        <AlertCircle size={12} /> Reason for Rejection
      </p>
      <p className="text-xs text-rose-100 font-bold leading-relaxed">
        {data?.details?.rejection_reason}
      </p>
    </div>

    {data?.details?.rejection_remarks && (
      <div>
        <p className="text-[9px] text-rose-400/60 font-bold uppercase">Additional Remarks</p>
        <p className="text-xs text-rose-200/80 italic">
          "{data.details.rejection_remarks}"
        </p>
      </div>
    )}

<div className="pt-2 border-t border-rose-500/10 flex justify-between items-end">
  <div>
    <p className="text-[9px] text-rose-400/60 font-bold uppercase tracking-tighter">Rejected By</p>
    <div className="flex items-center gap-1.5">
      <p className="text-[10px] text-rose-200 font-black italic">
        {data?.details?.rejected_by_name}
      </p>
      {/* ROLE BADGE */}
      <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-black uppercase">
        {data?.details?.rejected_by_role}
      </span>
    </div>
  </div>
  
  <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">
    {data?.details?.rejected_at}
  </p>
</div>
  </div>
)}
      </div>
    </div>
  );
};

export default ProgressSection;