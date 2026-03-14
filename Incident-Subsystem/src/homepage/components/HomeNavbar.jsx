import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, LogIn, LayoutDashboard, Sun, Moon } from "lucide-react";
import { isAuthenticated, isAdmin } from "../services/loginService";
import { useBranding } from "../../context/BrandingContext";
import logoPic from "../../assets/images/bgylogo.png";

const NAV_LINKS = [
  { label: "About", id: "about" },
  { label: "Announcements", id: "news" },
  { label: "Services", id: "services" },
  { label: "Officials", id: "officials" },
  { label: "FAQ", id: "faq" },
  { label: "Contact", id: "contact" },
];

export default function HomeNavbar({ isDarkMode, onScrollTo }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loggedIn, setLoggedIn] = useState(isAuthenticated());
  const { logoDataUrl } = useBranding();
  const navigate = useNavigate();
  const logoSrc = logoDataUrl || logoPic;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Re-check auth whenever the component is focused (e.g. returning from login)
  useEffect(() => {
    const handleFocus = () => setLoggedIn(isAuthenticated());
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const handlePortalClick = () => {
    if (isAdmin()) navigate("/admin");
    else navigate("/sub-system-2");
  };

  const handleThemeToggle = () => {
    const next = isDarkMode ? "blue" : "dark";
    localStorage.setItem("appTheme", next);
    window.dispatchEvent(new CustomEvent("themeChange", { detail: next }));
  };

  const handleNavClick = (id) => {
    onScrollTo(id);
    setMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? isDarkMode
            ? "bg-slate-950/95 backdrop-blur-xl border-b border-white/10 shadow-xl"
            : "bg-white/95 backdrop-blur-xl border-b border-black/5 shadow-xl"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => onScrollTo("about")}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img src={logoSrc} alt="Barangay Gulod Logo" className="w-8 h-8" />
          <span
            className={`font-black text-sm uppercase italic tracking-tight ${
              isDarkMode ? "text-white" : "text-slate-900"
            }`}
          >
            Barangay <span className="text-emerald-600">Gulod</span>
          </span>
        </button>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`text-[10px] font-black uppercase tracking-widest hover:text-emerald-600 transition-colors ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={handleThemeToggle}
            aria-label="Toggle dark mode"
            className={`p-2.5 rounded-xl transition-all active:scale-95 ${
              isDarkMode
                ? "bg-white/10 text-yellow-300 hover:bg-white/20"
                : "bg-black/5 text-slate-600 hover:bg-black/10"
            }`}
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {loggedIn ? (
            <button
              onClick={handlePortalClick}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 active:scale-95 transition-all"
            >
              <LayoutDashboard size={14} />
              Go to Portal
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 active:scale-95 transition-all"
            >
              <LogIn size={14} />
              Login
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className={`lg:hidden p-2 rounded-lg transition-colors ${
            isDarkMode ? "hover:bg-white/10" : "hover:bg-black/5"
          }`}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <X size={22} className={isDarkMode ? "text-white" : "text-slate-900"} />
          ) : (
            <Menu size={22} className={isDarkMode ? "text-white" : "text-slate-900"} />
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className={`lg:hidden px-6 py-4 border-t space-y-1 ${
            isDarkMode
              ? "bg-slate-950/98 border-white/10"
              : "bg-white/98 border-black/5"
          }`}
        >
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`block w-full text-left text-[10px] font-black uppercase tracking-widest py-3 hover:text-emerald-600 transition-colors ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {link.label}
            </button>
          ))}
          <div
            className={`pt-3 mt-2 border-t flex flex-col gap-2 ${
              isDarkMode ? "border-white/10" : "border-black/5"
            }`}
          >
            <button
              onClick={handleThemeToggle}
              className={`flex items-center gap-2 w-full px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                isDarkMode
                  ? "bg-white/10 text-yellow-300 hover:bg-white/20"
                  : "bg-black/5 text-slate-600 hover:bg-black/10"
              }`}
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </button>

            {loggedIn ? (
              <button
                onClick={handlePortalClick}
                className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all"
              >
                <LayoutDashboard size={14} />
                Go to Portal
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all"
              >
                <LogIn size={14} />
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
