import React from 'react';
import { ChevronLeft } from 'lucide-react';
import VerificationActions from '../VerificationActions';

const DetailHeader = ({ data, setView, onApprove, onReject, onVisitBgy }) => (
  <>
    <button
      onClick={() => setView('list')}
      className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-emerald-600 flex items-center gap-2 transition-colors"
    >
      <ChevronLeft size={18} /> Back to Queue
    </button>

    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
          {data?.name}
        </h1>
        <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest flex items-center gap-3">
          <span>Tracking: <span className="text-slate-600 dark:text-slate-200">{data?.trackingNumber}</span></span>
          <span className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
          <span>Status: <span className="text-emerald-500">{data?.status}</span></span>
        </p>
      </div>
      <VerificationActions
        onVisitBgy={onVisitBgy}
        onApprove={onApprove}
        onReject={onReject}
        currentStatus={data?.status}
      />
    </div>
  </>
);

export default DetailHeader;