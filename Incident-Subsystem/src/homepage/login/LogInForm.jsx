/**
 * LoginForm.jsx
 * Email + password fields for the login view.
 * Props are managed externally by LoginPage.jsx (email, password, onChange, errors).
 */

import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

const LoginForm = ({ email, password, onChange, errors = {}, isDarkMode }) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputClass = `
    w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 text-sm font-bold outline-none
    transition-colors bg-transparent
    ${isDarkMode
      ? "border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500"
      : "border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500"
    }
  `;

  const iconClass = `absolute left-3.5 top-1/2 -translate-y-1/2 ${
    isDarkMode ? "text-slate-400" : "text-slate-400"
  }`;

  return (
    <div className="space-y-5">
      {/* Email */}
      <div className="space-y-2">
        <label
          className={`text-[10px] font-black uppercase tracking-widest ${
            isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          Email
        </label>
        <div className="relative">
          <Mail size={16} className={iconClass} />
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-500 font-bold">{errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label
          className={`text-[10px] font-black uppercase tracking-widest ${
            isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          Password
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
            className={`${inputClass} pr-12`}
          />
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
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-500 font-bold">{errors.password}</p>
        )}
      </div>
    </div>
  );
};

export default LoginForm;