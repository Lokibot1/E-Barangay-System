import React from 'react';
import { ChevronLeft } from 'lucide-react';
import VerificationActions from '../VerificationActions';

const DetailHeader = ({ data, setView, onApprove, onReject, onVisitBgy, t }) => (
  <>
    <button
      onClick={() => setView('list')}
      className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-emerald-600 flex items-center gap-2 transition-colors"
    >
      <ChevronLeft size={18} /> Back to Queue
    </button>

    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 border-b ${t.cardBorder} pb-8`}>
      <div>
        <h1 className={`text-3xl font-black ${t.cardText} uppercase tracking-tighter`}>
          {data?.name}
        </h1>
        <p className={`text-xs ${t.subtleText} mt-2 font-bold uppercase tracking-widest flex items-center gap-3`}>
          <span>Tracking: <span className={t.cardText}>{data?.trackingNumber}</span></span>
          <span className={`h-4 w-px ${t.cardBorder} bg-current`} />
          <span>Status: <span className="text-emerald-500">{data?.status}</span></span>
        </p>
      </div>
      <VerificationActions
        onVisitBgy={onVisitBgy}
        onApprove={onApprove}
        onReject={onReject}
        currentStatus={data?.status}
        t={t}
      />
    </div>
  </>
);

export default DetailHeader;