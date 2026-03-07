const FACTOR_THEMES = {
  modern: {
    badgeClass: "bg-blue-50 text-blue-700 border-blue-100",
    panelClass: "border-slate-100 bg-gradient-to-b from-white to-slate-50/40",
  },
  blue: {
    badgeClass: "bg-blue-50 text-blue-700 border-blue-100",
    panelClass: "border-slate-100 bg-gradient-to-b from-white to-slate-50/40",
  },
  purple: {
    badgeClass: "bg-purple-50 text-purple-700 border-purple-100",
    panelClass: "border-purple-100/70 bg-gradient-to-b from-white to-purple-50/30",
  },
  green: {
    badgeClass: "bg-green-50 text-green-700 border-green-100",
    panelClass: "border-green-100/70 bg-gradient-to-b from-white to-green-50/30",
  },
  dark: {
    badgeClass: "bg-slate-700 text-slate-100 border-slate-600",
    panelClass: "border-slate-700 bg-slate-900/55",
  },
};

export const getFactorTheme = (currentTheme = "modern") =>
  FACTOR_THEMES[currentTheme] || FACTOR_THEMES.modern;
