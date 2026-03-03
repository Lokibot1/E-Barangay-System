import React from 'react';
import { X } from 'lucide-react';

const ConfirmActionModal = ({ pendingAction, onClose, onConfirm, t }) => {
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

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold dark:text-white uppercase tracking-tight">Confirm Action</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20}/>
          </button>
        </div>
        <div className="space-y-5">
          <p className={`text-sm ${t.subtleText}`}>
            Are you sure you want to <strong>{pendingAction.actionText}</strong> this submission?
          </p>
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-lg text-sm font-bold text-white ${config.buttonClass}`}
            >
              {config.buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmActionModal;