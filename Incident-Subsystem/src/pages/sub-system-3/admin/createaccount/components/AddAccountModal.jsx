import React from 'react';
import {
  AlertCircle,
  AtSign,
  Crown,
  Eye,
  EyeOff,
  Mail,
  Loader2,
  User,
  UserPlus,
  X,
} from 'lucide-react';
import { ROLES } from '../constants';
import { PasswordInput, TextInput } from './FormFields';

const AddAccountModal = ({
  open,
  isDark,
  t,
  form,
  setForm,
  submitting,
  apiError,
  canSave,
  showPass,
  setShowPass,
  isGmail,
  isEmailTaken,
  isUsernameTaken,
  isPassMatch,
  onClose,
  onSubmit,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/50 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-3xl">
          <div className={`relative flex w-full max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-[1.75rem] border shadow-[0_26px_56px_-24px_rgba(15,23,42,0.34)] animate-in zoom-in-95 duration-200 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-white/70 bg-white'}`}>
            <div className={`relative flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 sm:py-4 border-b ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isDark ? 'bg-emerald-500/15 text-emerald-300 shadow-[0_10px_24px_rgba(16,185,129,0.10)]' : 'bg-emerald-500 text-white shadow-[0_10px_24px_rgba(34,197,94,0.18)]'}`}>
                  <UserPlus size={16} />
                </div>
                <div className="min-w-0 flex-1 pt-1 text-left">
                  <h2 className={`text-[1.2rem] leading-none font-semibold font-spartan ${t.cardText}`}>Create Account</h2>
                  <p className={`mt-1 text-[10px] leading-[1.35] font-medium font-kumbh ${t.subtleText}`}>
                    Enter the full name, Gmail address, username, role and password for this user.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={onSubmit} className="relative flex min-h-0 flex-1 flex-col px-4 sm:px-5 py-4 sm:py-5">
              <div className="min-h-0 space-y-4 overflow-y-auto pr-1">
                {apiError && (
                  <div className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold font-kumbh ${isDark ? 'bg-rose-950/30 border border-rose-800 text-rose-300' : 'bg-rose-50 border border-rose-200 text-rose-600'}`}>
                    <AlertCircle size={15} className="shrink-0" /> {apiError}
                  </div>
                )}

                <div className={`overflow-hidden rounded-[1.35rem] border p-3.5 sm:p-4 lg:p-4.5 ${isDark ? 'border-slate-800 bg-slate-950/45' : 'border-slate-200 bg-slate-50/70'}`}>
                  <div className="grid gap-3 lg:grid-cols-2">
                    <div className="space-y-1.5 lg:col-span-2">
                      <label className={`text-[11px] font-semibold font-kumbh ${t.subtleText}`}>Legal Full Name</label>
                      <TextInput
                        icon={User}
                        placeholder="e.g. Juan Dela Cruz"
                        value={form.name}
                        required
                        isDark={isDark}
                        onChange={(event) => setForm({ ...form, name: event.target.value })}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={`text-[11px] font-semibold font-kumbh ${t.subtleText}`}>Gmail Address</label>
                      <TextInput
                        type="email"
                        icon={Mail}
                        placeholder="name@gmail.com"
                        value={form.email}
                        required
                        isDark={isDark}
                        onChange={(event) => setForm({ ...form, email: event.target.value })}
                        className={
                          form.email && (!isGmail || isEmailTaken)
                            ? 'border-rose-400 bg-rose-50 text-rose-700'
                            : form.email && isGmail && !isEmailTaken
                              ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                              : ''
                        }
                      />
                      <div className="min-h-[16px]">
                        {form.email && !isGmail && (
                          <p className="text-[10px] font-semibold font-kumbh text-rose-500 flex items-center gap-1">
                            <AlertCircle size={10} /> Gmail only
                          </p>
                        )}
                        {form.email && isEmailTaken && (
                          <p className="text-[10px] font-semibold font-kumbh text-rose-500 flex items-center gap-1">
                            <AlertCircle size={10} /> Already taken
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className={`text-[11px] font-semibold font-kumbh ${t.subtleText}`}>Username</label>
                      <TextInput
                        icon={AtSign}
                        placeholder="bgn00001"
                        value={form.username}
                        required
                        isDark={isDark}
                        onChange={(event) => setForm({ ...form, username: event.target.value })}
                        className={
                          form.username && isUsernameTaken
                            ? 'border-rose-400 bg-rose-50 text-rose-700'
                            : form.username && !isUsernameTaken
                              ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                              : ''
                        }
                      />
                      <div className="min-h-[16px]">
                        {form.username && isUsernameTaken && (
                          <p className="text-[10px] font-semibold font-kumbh text-rose-500 flex items-center gap-1">
                            <AlertCircle size={10} /> Username already used
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 lg:col-span-2">
                      <label className={`text-[11px] font-semibold font-kumbh ${t.subtleText}`}>Role</label>
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {ROLES.map((role) => {
                          const RoleIcon = role.value === 'admin' ? Crown : User;
                          const selected = form.role === role.value;

                          return (
                            <button
                              key={role.value}
                              type="button"
                              onClick={() => setForm({ ...form, role: role.value })}
                              className={`rounded-[1.1rem] border px-3.5 py-2.5 text-center transition-all ${
                                selected
                                  ? role.activeClass
                                  : isDark
                                    ? 'border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-500'
                                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-2.5">
                                <RoleIcon
                                  size={15}
                                  className={
                                    selected
                                      ? role.value === 'admin'
                                        ? 'text-violet-700'
                                        : 'text-emerald-700'
                                      : isDark
                                        ? 'text-slate-400'
                                        : 'text-slate-500'
                                  }
                                />
                                <p className="text-[13px] font-semibold font-kumbh">{role.label}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2 lg:col-span-2">
                      <div className="flex items-center justify-between">
                        <label className={`text-[11px] font-semibold font-kumbh ${t.subtleText}`}>Password</label>
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="inline-flex items-center gap-1.5 text-[10px] font-semibold font-kumbh text-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                          {showPass ? <><EyeOff size={11} /> Hide</> : <><Eye size={11} /> Show</>}
                        </button>
                      </div>
                      <div className="grid gap-2.5 md:grid-cols-2">
                        <PasswordInput
                          isDark={isDark}
                          placeholder="New password"
                          value={form.password}
                          onChange={(event) => setForm({ ...form, password: event.target.value })}
                          show={showPass}
                        />
                        <PasswordInput
                          isDark={isDark}
                          placeholder="Confirm password"
                          value={form.confirmPassword}
                          onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
                          show={showPass}
                          className={
                            form.confirmPassword && !isPassMatch
                              ? 'border-rose-400 bg-rose-50'
                              : form.confirmPassword && isPassMatch
                                ? 'border-emerald-400 bg-emerald-50'
                                : ''
                          }
                        />
                      </div>
                      <div className="min-h-[16px]">
                        {form.confirmPassword && !isPassMatch && (
                          <p className="text-[10px] font-semibold font-kumbh text-rose-500 flex items-center gap-1">
                            <AlertCircle size={10} /> Passwords do not match
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`mt-4 flex justify-end border-t pt-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className={`inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-[11px] font-semibold font-kumbh border transition-colors disabled:opacity-50 ${
                      isDark ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!canSave || submitting}
                    className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-semibold font-kumbh text-white transition-all active:scale-[0.98] ${
                      canSave && !submitting
                        ? `bg-gradient-to-r ${t.primaryGrad} shadow-lg hover:opacity-90`
                        : isDark ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {submitting ? <span className="flex items-center justify-center gap-2"><Loader2 size={13} className="animate-spin" /> Saving...</span> : <><UserPlus size={14} /> Save Account</>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAccountModal;
