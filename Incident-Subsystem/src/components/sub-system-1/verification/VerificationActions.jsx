import React from 'react';
import Button from '../common/Button';

const VerificationActions = ({ onApprove, onReject, onVisitBgy, currentStatus }) => {
  const status = currentStatus?.toLowerCase() || '';
  const isDone = status === 'verified' || status === 'rejected';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-[500px]"> 
      <Button 
        label={status === 'for verification' ? "Needs Visit" : "Visit Bgy"} 
        variant="secondary" 
        onClick={onVisitBgy}
        disabled={status === 'for verification' || isDone}
      />
      <Button 
        label={status === 'rejected' ? "Rejected" : "Disapprove"} 
        variant="outline" 
        onClick={onReject} 
        disabled={isDone}
      />
      <Button 
        label={status === 'verified' ? "Verified" : "Approve"} 
        variant="primary" 
        onClick={onApprove} 
        disabled={isDone}
      />
    </div>
  );
};

export default VerificationActions