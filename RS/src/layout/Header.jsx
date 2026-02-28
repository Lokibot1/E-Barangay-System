import React, { useState, useEffect } from "react";
import { Moon, Sun, Menu } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";
import { getInitials, getAvatarColor } from "../utils/avatar";

const Header = ({ toggleSidebar }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useUser();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!user) return <header className="h-[89px] bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800" />;

  const datePart = currentTime.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const timePart = currentTime.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const dateTime = `${datePart} | ${timePart}`;

  return (
    <header className="h-[89px] bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-6 sticky top-0 z-40 transition-colors duration-300">
      <button 
        onClick={toggleSidebar} 
        className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
      >
        <Menu size={22} />
      </button>

      <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 text-sm font-medium tracking-wide text-slate-500 dark:text-slate-400">
        {dateTime}
      </div>

      <div className="ml-auto flex items-center gap-6">
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 hidden xs:block">
             {isDark ? "Dark" : "Light"}
           </span>
           <button
            onClick={toggleTheme}
            className="relative w-14 h-7 flex items-center bg-slate-200 dark:bg-emerald-900/30 rounded-full p-1 transition-colors duration-300 focus:outline-none border border-slate-300 dark:border-emerald-500/30"
          >
            <div className={`bg-white dark:bg-emerald-400 w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${isDark ? "translate-x-7" : "translate-x-0"}`}>
              {isDark ? <Moon size={12} className="text-emerald-950" /> : <Sun size={12} className="text-amber-500" />}
            </div>
          </button>
        </div>

        <div className="flex items-center gap-3 border-l pl-6 border-slate-200 dark:border-slate-700">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {user?.name || "User"}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-tighter text-emerald-600 dark:text-emerald-400">
              {user?.role || "Staff"}
            </p>
          </div>

          <div className={`w-10 h-10 rounded-xl shadow-sm flex items-center justify-center text-xs font-bold ring-2 ring-white dark:ring-slate-800 ${getAvatarColor(user?.name || "U")}`}>
            {getInitials(user?.name || "U")}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
