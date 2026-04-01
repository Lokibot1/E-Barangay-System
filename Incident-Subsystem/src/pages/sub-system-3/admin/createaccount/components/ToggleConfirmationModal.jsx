import React from 'react';
import { AlertCircle, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { normaliseActive } from '../utils';

const ToggleConfirmationModal = ({
  pendingToggle,
  isDark,
  t,
  apiError,
  submitting,
  onConfirm,
  onClose,
}) => {
  if (!pendingToggle) return null;

  const willDeactivate = normaliseActive(pendingToggle.is_active) === 1;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className={`w-full max-w-xs rounded-[2rem] shadow-2xl p-8 text-center animate-in zoom-in-95 duration-150 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
        {apiError && (
          <div className="flex items-center gap-2 px-4 py-3 mb-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-600 font-semibold font-kumbh text-left">
            <AlertCircle size={15} className="shrink-0" /> {apiError}
          </div>
        )}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${willDeactivate ? 'bg-rose-100' : 'bg-emerald-100'}`}>
          {willDeactivate
            ? <ToggleLeft size={24} className="text-rose-600" />
            : <ToggleRight size={24} className="text-emerald-600" />}
        </div>
        <h3 className={`text-lg font-semibold font-spartan ${t.cardText}`}>
          {willDeactivate ? 'Deactivate Account?' : 'Activate Account?'}
        </h3>
        <p className={`text-xs font-medium font-kumbh mt-1 mb-6 ${t.subtleText}`}>
          @{pendingToggle.username} · {pendingToggle.name}
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className={`w-full py-3.5 rounded-2xl text-xs font-semibold font-kumbh text-white transition-all active:scale-[0.98] disabled:opacity-60 ${
              willDeactivate ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {submitting
              ? <span className="flex items-center justify-center gap-2"><Loader2 size={13} className="animate-spin" /> Processing...</span>
              : 'Yes, Proceed'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className={`w-full py-2 text-xs font-semibold font-kumbh transition-colors ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToggleConfirmationModal;

