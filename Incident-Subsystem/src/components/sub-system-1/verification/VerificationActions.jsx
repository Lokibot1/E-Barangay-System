import React from 'react';
import Button from '../common/Button';

const VerificationActions = ({ onApprove, onReject, onVisitBgy, currentStatus, t }) => {
  const status = currentStatus?.toLowerCase() || '';
  
  const isVerified = status === 'verified';
  const isRejected = status === 'rejected';
  const isForVerification = status === 'for verification';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-[500px]">
      
      {/* COLUMN 1: NEEDS VISIT / REQUIREMENT STATUS */}
      {!isRejected ? (
        <Button
   
          label={isForVerification ? "Pending Visit" : "Needs Visit"}
          variant="secondary"
          onClick={onVisitBgy}
    
          disabled={isForVerification || isVerified}
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
        disabled={isVerified || isRejected}
        t={t}
      />

      {/* COLUMN 3: APPROVE */}
      <Button
        label={isVerified ? "Verified" : "Approve"}
        variant="primary"
        onClick={onApprove}
        disabled={isVerified}
        t={t}
      />
      
    </div>
  );
};

export default VerificationActions;