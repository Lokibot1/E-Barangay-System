import React from 'react';
import { ChevronLeft } from 'lucide-react';
import VerificationActions from '../VerificationActions';

const DetailHeader = ({
  data,
  setView,
  onApprove,
  onRejectClick,
  onVisitBgy,
  isActionSubmitting,
  t,
}) => {
  const status = String(data?.status || '').toLowerCase().trim();
  const isForVisit =
    status === 'for verification' ||
    status === 'for visit' ||
    status === 'needs visit' ||
    status.includes('verification');
  const statusColor =
    status === 'pending' ? '#f97316' : // orange-500
    status === 'rejected' ? '#ef4444' : // red-500
    isForVisit ? '#3b82f6' : // blue-500
    '#10b981'; // emerald-500

  return (
    <>
      <button
        onClick={() => setView('list')}
        disabled={isActionSubmitting}
        className="text-xs font-semibold text-slate-500 hover:text-emerald-600 flex items-center gap-2 transition-colors"
      >
        <ChevronLeft size={18} /> Back to Queue
      </button>

      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 border-b ${t.cardBorder} pb-8`}>
        <div className="text-left">
          <h1 className={`text-3xl font-bold ${t.cardText} text-left`}>
            {data?.name}
          </h1>
          <p className={`text-xs ${t.subtleText} mt-2 font-medium flex items-center gap-3 text-left`}>
            <span>Tracking: <span className={t.cardText}>{data?.trackingNumber}</span></span>
            <span className={`h-4 w-px ${t.cardBorder} bg-current`} />
            <span>
              Status:{' '}
              <span className="font-semibold" style={{ color: statusColor }}>
                {data?.status}
              </span>
            </span>
          </p>
        </div>
        <VerificationActions
          onVisitBgy={onVisitBgy}
          onApprove={onApprove}
          onReject={onRejectClick}
          currentStatus={data?.status}
          isActionSubmitting={isActionSubmitting}
          t={t}
        />
      </div>
    </>
  );
};

export default DetailHeader;
