import React from 'react';
import { LockKeyhole } from 'lucide-react';
import { getModalFieldClass } from '../utils';

export const TextInput = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  icon: Icon,
  className = '',
  disabled = false,
  isDark = false,
  required = false,
}) => (
  <div className={`group flex items-center gap-2.5 rounded-[1.1rem] border px-3.5 py-2.5 transition-all disabled:opacity-50 ${getModalFieldClass(isDark)} ${className}`}>
    {Icon ? (
      <Icon
        size={14}
        className={`${isDark ? 'text-slate-500 group-focus-within:text-emerald-400' : 'text-slate-400 group-focus-within:text-emerald-600'} transition-colors`}
      />
    ) : null}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className="w-full bg-transparent outline-none text-[13px] font-kumbh font-normal disabled:cursor-not-allowed"
    />
  </div>
);

export const PasswordInput = ({
  placeholder,
  value,
  onChange,
  show,
  className = '',
  disabled = false,
  isDark = false,
}) => (
  <div className={`group flex items-center gap-2.5 rounded-[1.1rem] border px-3.5 py-2.5 transition-all disabled:opacity-50 ${getModalFieldClass(isDark)} ${className}`}>
    <LockKeyhole
      size={14}
      className={`${isDark ? 'text-slate-500 group-focus-within:text-emerald-400' : 'text-slate-400 group-focus-within:text-emerald-600'} transition-colors`}
    />
    <input
      type={show ? 'text' : 'password'}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
      disabled={disabled}
      className="w-full bg-transparent outline-none text-[13px] font-kumbh font-normal disabled:cursor-not-allowed"
    />
  </div>
);

export const StatCard = ({ label, value, icon: Icon, color, isDark }) => (
  <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl border ${color}`}>
    <div className={`p-2 rounded-xl ${isDark ? 'bg-black/20' : 'bg-white/60'}`}>
      <Icon size={16} className="opacity-70" />
    </div>
    <div>
      <p className="text-xl font-black leading-none">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-0.5">{label}</p>
    </div>
  </div>
);
