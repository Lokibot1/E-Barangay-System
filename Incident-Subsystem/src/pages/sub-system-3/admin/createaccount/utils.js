export const getRoleStyle = (role) => {
  if (role === 'admin') return 'bg-violet-100 text-violet-700 border-violet-200';
  if (role === 'staff') return 'bg-sky-100 text-sky-700 border-sky-200';
  return 'bg-slate-100 text-slate-600 border-slate-200';
};

export const normaliseActive = (value) => {
  if (
    value === null
    || value === undefined
    || value === ''
    || value === false
    || value === 0
    || value === '0'
  ) {
    return 0;
  }

  return 1;
};

export const getModalFieldClass = (isDark) => (
  isDark
    ? 'border-slate-700 bg-slate-950/40 text-slate-100 placeholder:text-slate-500 focus-within:border-emerald-500/60 focus-within:ring-4 focus-within:ring-emerald-500/10'
    : 'border-slate-200 bg-white text-slate-700 placeholder:text-slate-400 shadow-[0_1px_0_rgba(15,23,42,0.03),inset_0_1px_0_rgba(255,255,255,0.75)] focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-500/10'
);

export const getInitials = (value) => (
  (value || '?')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
);

