import React from 'react';
import { X } from 'lucide-react';

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
  const actionVerb = (config.buttonText || pendingAction.actionText || '').toLowerCase();

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className={`${t?.cardBg || 'bg-white'} w-full max-w-md rounded-2xl border ${t?.cardBorder || 'border-slate-200'} shadow-2xl p-6`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-semibold ${t?.cardText || 'text-slate-900'}`}>Confirm Action</h3>
          <button onClick={onClose} disabled={isSubmitting} className={`${t?.subtleText || 'text-slate-400'} hover:text-slate-600 disabled:opacity-50`}>
            <X size={20}/>
          </button>
        </div>
        <div className="space-y-5 text-left">
          <p className={`text-sm ${t?.subtleText || 'text-slate-500'} text-left`}>
            Are you sure you want to <span className={`font-semibold ${t?.cardText || 'text-slate-900'}`}>{actionVerb}</span> this submission?
          </p>
          {isRejecting && pendingAction.additionalData?.rejection_reason && (
            <div className={`rounded-xl border ${t?.cardBorder || 'border-slate-200'} p-3 ${t?.cardBg ? '' : 'bg-slate-50'}`}>
              <p className={`text-[11px] font-medium ${t?.subtleText || 'text-slate-500'} mb-1`}>Reason for rejection</p>
              <p className={`text-sm font-semibold ${t?.cardText || 'text-slate-900'}`}>
                {pendingAction.additionalData.rejection_reason}
              </p>
              {pendingAction.additionalData.rejection_remarks && (
                <p className={`text-xs ${t?.subtleText || 'text-slate-500'} mt-1`}>
                  "{pendingAction.additionalData.rejection_remarks}"
                </p>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border ${t?.cardBorder || 'border-slate-200'} ${t?.subtleText || 'text-slate-600'} disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed ${config.buttonClass}`}
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
