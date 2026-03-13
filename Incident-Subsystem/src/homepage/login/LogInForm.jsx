/**
 * LoginForm.jsx
 *
 * CHANGES:
 * 1. input type="text" for username/email (case-sensitive, no browser email normalization)
 * 2. Caps Lock detection on the password field via onKeyUp + onMouseDown
 *    — shows a warning badge when CapsLock is active
 * 3. Label updated to "Username or Email"
 */

import React, { useState } from "react";
import { Eye, EyeOff, User, Lock, AlertTriangle } from "lucide-react";

const LoginForm = ({ email, password, onChange, errors = {}, isDarkMode }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn,   setCapsLockOn]   = useState(false);

  // Detect CapsLock state from any key event on the password field
  const handlePasswordKeyEvent = (e) => {
    if (e.getModifierState) {
      setCapsLockOn(e.getModifierState("CapsLock"));
    }
  };

  const inputClass = `
    w-full pl-11 pr-4 py-3.5 rounded-2xl border text-sm font-normal outline-none
    transition-colors bg-transparent placeholder:font-normal
    ${isDarkMode
      ? "border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500"
      : "border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500"
    }
  `;

  const iconClass = `absolute left-3.5 top-1/2 -translate-y-1/2 ${
    isDarkMode ? "text-slate-400" : "text-slate-400"
  }`;

  return (
    <div className="space-y-5 text-left">

      {/* ── Username or Email ─────────────────────────────────────────── */}
      <div className="space-y-2">
        <label className={`text-sm font-semibold tracking-normal ${
          isDarkMode ? "text-slate-400" : "text-slate-500"
        }`}>
          <span>Username or Email</span>
          <span className="text-red-500 ml-1" aria-hidden="true">*</span>
          <span className="sr-only">required</span>
        </label>
        <div className="relative">
          <User size={16} className={iconClass} />
          {/* type="text" — preserves exact casing; no email-format enforcement */}
          <input
            type="text"
            name="email"
            value={email}
            onChange={onChange}
            required
            autoComplete="username"
            placeholder="Username or email address"
            className={inputClass}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-500 font-bold">{errors.email}</p>
        )}
      </div>

      {/* ── Password ──────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <label className={`text-sm font-semibold tracking-normal ${
          isDarkMode ? "text-slate-400" : "text-slate-500"
        }`}>
          <span>Password</span>
          <span className="text-red-500 ml-1" aria-hidden="true">*</span>
          <span className="sr-only">required</span>
        </label>
        <div className="relative">
          <Lock size={16} className={iconClass} />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={password}
            onChange={onChange}
            required
            autoComplete="current-password"
            placeholder="Enter your password"
            onKeyUp={handlePasswordKeyEvent}
            onMouseDown={handlePasswordKeyEvent}
            className={`${inputClass} pr-12`}
          />
          {password?.length > 0 && (
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors ${
                isDarkMode
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          )}
        </div>

        {/* Caps Lock warning */}
        {capsLockOn && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
            isDarkMode
              ? "bg-amber-900/30 border-amber-700/50 text-amber-400"
              : "bg-amber-50 border-amber-200 text-amber-700"
          }`}>
            <AlertTriangle size={12} className="shrink-0" />
            Caps Lock is ON — password is case-sensitive
          </div>
        )}

        {errors.password && (
          <p className="text-xs text-red-500 font-bold">{errors.password}</p>
        )}
      </div>

    </div>
  );
};

export default LoginForm;
