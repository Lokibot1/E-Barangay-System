import React from 'react';
import { X, AlertCircle } from 'lucide-react';

const ConfirmActionModal = ({ pendingAction, onClose, onConfirm, isSubmitting = false, t }) => {
  if (!pendingAction) return null;

  const getActionConfig = (status) => {
    if (status === 'Verified' || status === 'Approved') {
      return { actionText: 'APPROVE', buttonText: 'Approve', buttonClass: 'bg-emerald-600 hover:bg-emerald-700' };
    }
    if (status === 'For Verification') {
      return { actionText: 'SET FOR VISIT', buttonText: 'Set for Visit', buttonClass: 'bg-amber-500 hover:bg-amber-600' };
    }
    return { actionText: 'REJECT', buttonText: 'Reject', buttonClass: 'bg-red-600 hover:bg-red-700' };
  };

  const config = getActionConfig(pendingAction.status);
  const isRejecting = pendingAction.status === 'Rejected';

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold dark:text-white uppercase tracking-tight flex items-center gap-2">
            {isRejecting && <AlertCircle className="text-red-500" size={20} />}
            Confirm Action
          </h3>
          <button onClick={onClose} disabled={isSubmitting} className="text-slate-400 hover:text-slate-600 disabled:opacity-50">
            <X size={20}/>
          </button>
        </div>

        <div className="space-y-5">
          <div className={`p-4 rounded-xl ${isRejecting ? 'bg-red-50 dark:bg-red-950/20' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
            <p className={`text-sm ${t.subtleText}`}>
              Are you sure you want to <strong>{config.actionText}</strong> this submission?
            </p>
            
            {/* DISPLAY REASON AND REMARKS IF REJECTING */}
            {isRejecting && pendingAction.additionalData?.rejection_reason && (
              <div className="mt-3 pt-3 border-t border-red-100 dark:border-red-900/30 space-y-1">
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Reason for Rejection:</p>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {pendingAction.additionalData.rejection_reason}
                </p>
                {pendingAction.additionalData.rejection_remarks && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                    "{pendingAction.additionalData.rejection_remarks}"
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-sm font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-60 disabled:cursor-not-allowed shadow-lg transition-all active:scale-95 ${config.buttonClass}`}
            >
              {isSubmitting ? 'Processing...' : config.buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmActionModal;