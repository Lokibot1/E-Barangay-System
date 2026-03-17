import React from 'react';
import Button from '../common/Button';

const VerificationActions = ({
  onApprove,
  onReject,
  onVisitBgy,
  currentStatus,
  isActionSubmitting = false,
  t,
}) => {
  const status = currentStatus?.toLowerCase() || '';
  
  const isVerified = status === 'verified';
  const isRejected = status === 'rejected';
  const isForVerification = status === 'for verification';
  const actionClass = '!rounded-[16px] px-4 py-2.5 text-[12px] !font-semibold font-kumbh !normal-case !tracking-normal shadow-[0_10px_20px_rgba(15,23,42,0.06)] active:scale-95';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-[500px]">
      
      {/* COLUMN 1: NEEDS VISIT / REQUIREMENT STATUS */}
      {!isRejected ? (
        <Button
   
          label={isForVerification ? "Pending Visit" : "Needs Visit"}
          variant="secondary"
          onClick={onVisitBgy}
    
          disabled={isForVerification || isVerified || isActionSubmitting}
          className={actionClass}
          t={t}
        />
      ) : (
        <div /> // Spacer
      )}

      {/* COLUMN 2: REJECT */}
      <Button
        label={isRejected ? "Rejected" : "Reject"}
        variant="outline"
        onClick={onReject}
        disabled={isVerified || isRejected || isActionSubmitting}
        className={actionClass}
        t={t}
      />

      {/* COLUMN 3: APPROVE */}
      <Button
        label={isVerified ? "Verified" : "Approve"}
        variant="primary"
        onClick={onApprove}
        disabled={isVerified || isActionSubmitting}
        className={actionClass}
        t={t}
      />
      
    </div>
  );
};

export default VerificationActions;
