import React, { useState } from 'react';

const RejectionModal = ({ isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [remarks, setRemarks] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (reason) {
      onConfirm(reason, remarks);
      setReason('');
      setRemarks('');
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Reject Application</h2>
          <p className="text-sm text-slate-500 mt-1">Please specify the reason for rejection.</p>
        </div>

        <div className="space-y-5">
          {/* Dropdown for Reason */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
              Reason <span className="text-red-500">*</span>
            </label>
            <select 
              className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-red-500 transition-all cursor-pointer"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="">Select a reason...</option>
              <option value="Incomplete Documents">Incomplete Documents</option>
              <option value="Invalid Address / Not Found">Invalid Address / Not Found</option>
              <option value="Duplicate Application">Duplicate Application</option>
              <option value="Incorrect Information">Incorrect Information Provided</option>
              <option value="Failed Verification">Failed Personal Verification</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Textarea for Manual Remarks */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
              Additional Remarks (Optional)
            </label>
            <textarea
              className="w-full h-32 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none transition-all"
              placeholder="Provide more context here..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={!reason}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20 transition-all"
          >
            Confirm Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectionModal;