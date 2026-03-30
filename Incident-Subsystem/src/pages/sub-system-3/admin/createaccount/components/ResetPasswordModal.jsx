import React from 'react';
import { AlertCircle, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { getInitials, getRoleStyle } from '../utils';
import { PasswordInput } from './FormFields';

const ResetPasswordModal = ({
  resetTarget,
  isDark,
  t,
  apiError,
  showResetPass,
  setShowResetPass,
  resetForm,
  setResetForm,
  canReset,
  submitting,
  onClose,
  onSubmit,
}) => {
  if (!resetTarget) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className={`w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
        <div className={`flex items-center justify-between px-7 py-5 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
          <div>
            <p className={`text-[10px] font-semibold font-kumbh ${t.subtleText}`}>Account Security</p>
            <h3 className={`text-base font-semibold font-spartan ${t.cardText}`}>Reset Password</h3>
          </div>
          <button type="button" onClick={onClose} className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}>
            <X size={16} />
          </button>
        </div>

        <div className={`mx-7 mt-5 flex items-center gap-3 px-4 py-3 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-semibold shrink-0 border ${getRoleStyle(resetTarget.role)}`}>
            {getInitials(resetTarget.name || resetTarget.username)}
          </div>
          <div>
            <p className={`text-sm font-bold leading-tight font-kumbh ${t.cardText}`}>{resetTarget.name}</p>
            <p className={`text-[10px] font-medium font-kumbh ${t.subtleText}`}>
              @{resetTarget.username} · <span className="capitalize">{resetTarget.role}</span>
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="px-7 py-5 space-y-3">
          {apiError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-600 font-semibold font-kumbh">
              <AlertCircle size={15} className="shrink-0" /> {apiError}
            </div>
          )}
          <div className="flex items-center justify-between mb-1">
            <label className={`text-[10px] font-semibold font-kumbh ${t.subtleText}`}>New Password</label>
            <button
              type="button"
              onClick={() => setShowResetPass(!showResetPass)}
              className="flex items-center gap-1 text-[9px] font-semibold font-kumbh text-sky-500 hover:text-sky-700 transition-colors"
            >
              {showResetPass ? <><EyeOff size={10} /> Hide</> : <><Eye size={10} /> Show</>}
            </button>
          </div>
          <PasswordInput
            isDark={isDark}
            placeholder="New password"
            value={resetForm.pass}
            onChange={(event) => setResetForm({ ...resetForm, pass: event.target.value })}
            show={showResetPass}
          />
          <PasswordInput
            isDark={isDark}
            placeholder="Confirm new password"
            value={resetForm.confirm}
            onChange={(event) => setResetForm({ ...resetForm, confirm: event.target.value })}
            show={showResetPass}
            className={resetForm.confirm && resetForm.pass !== resetForm.confirm ? 'border-rose-400 bg-rose-50' : resetForm.confirm && canReset ? 'border-emerald-400 bg-emerald-50' : ''}
          />
          {resetForm.confirm && !canReset && (
            <p className="text-[9px] font-semibold font-kumbh text-rose-500 flex items-center gap-1"><AlertCircle size={9} /> Passwords do not match</p>
          )}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className={`flex-1 py-3 rounded-2xl text-xs font-semibold font-kumbh border transition-colors disabled:opacity-50 ${
                isDark ? 'border-slate-600 text-slate-400 hover:bg-slate-800' : 'text-slate-400 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canReset || submitting}
              className={`flex-[2] py-3 rounded-2xl text-xs font-semibold font-kumbh text-white transition-all active:scale-[0.98] ${
                canReset && !submitting ? 'bg-sky-600 hover:bg-sky-700 shadow-lg' : isDark ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {submitting ? <span className="flex items-center justify-center gap-2"><Loader2 size={13} className="animate-spin" /> Resetting...</span> : 'Confirm Reset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordModal;

