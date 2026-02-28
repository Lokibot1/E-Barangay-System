export const getInitials = (name) => {
  if (!name || typeof name !== "string") return "??";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + (parts[parts.length - 1][0] || "")).toUpperCase();
};

export const getAvatarColor = (name) => {
  if (!name || typeof name !== "string")
    return "bg-slate-100 text-slate-400";

  const colors = [
    "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
    "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400",
    "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
    "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
    "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400",
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};
