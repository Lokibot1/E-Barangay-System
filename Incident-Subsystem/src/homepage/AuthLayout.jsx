/**
 * AuthLayout.jsx
 * Shared shell wrapper for Login and Signup pages.
 *
 * Features:
 *  - Persists isDarkMode in localStorage under "authTheme" key
 *  - Provides isDarkMode + toggle to child pages via context
 *  - Full-viewport background: barangay hall photo (bsbPic) with overlay
 *  - Unified top nav: logo (→ home), page title, dark mode toggle
 *  - No page-change flash — same shell stays mounted, child route swaps
 *
 * Usage: Wrap <Route path="/login"> and <Route path="/signup"> with this.
 *
 * Example in App.jsx / router:
 *   <Route element={<AuthLayout />}>
 *     <Route path="/login"  element={<LoginPage />} />
 *     <Route path="/signup" element={<SignupPage />} />
 *   </Route>
 */

import React, { createContext, useContext, useState, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Sun, Moon, ShieldCheck } from "lucide-react";

import bsbPic from "../assets/images/bgygulod.png";
import bgyLogo from "../assets/images/bgylogo.png";

// ── Context ──────────────────────────────────────────────────────────────────
export const AuthThemeContext = createContext({
  isDarkMode: false,
  toggleDark: () => {},
});

export const useAuthTheme = () => useContext(AuthThemeContext);

// ── Layout ───────────────────────────────────────────────────────────────────
const AuthLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    try { return localStorage.getItem("authTheme") === "dark"; }
    catch { return false; }
  });

  const toggleDark = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try { localStorage.setItem("authTheme", next ? "dark" : "light"); } catch {}
      return next;
    });
  }, []);

  // Derive page label for the nav pill
  const isSignup = location.pathname.startsWith("/signup");
  const pageLabel = isSignup ? "Public Registration" : "Resident Portal";

  return (
    <AuthThemeContext.Provider value={{ isDarkMode, toggleDark }}>
      {/* ── Full-viewport container ─────────────────────────────────────── */}
      <div className="relative min-h-screen w-screen overflow-x-hidden"
        style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

        {/* Background: Barangay Hall photo */}
        <div className="fixed inset-0 z-0">
          <img
            src={bsbPic}
            alt="Barangay Gulod Hall"
            className="w-full h-full object-cover"
            style={{ opacity: isDarkMode ? 0.18 : 0.28 }}
          />
          {/* Gradient overlay — gives depth without obscuring too much */}
          <div
            className="absolute inset-0"
            style={{
              background: isDarkMode
                ? "linear-gradient(135deg, rgba(8,12,28,0.97) 0%, rgba(10,16,38,0.94) 50%, rgba(6,10,22,0.97) 100%)"
                : "linear-gradient(135deg, rgba(240,242,247,0.97) 0%, rgba(235,239,248,0.93) 50%, rgba(238,242,250,0.97) 100%)",
            }}
          />
        </div>

        {/* ── Sticky Top Nav ──────────────────────────────────────────────── */}
        <header
          className="fixed top-0 left-0 right-0 z-50 h-[56px] flex items-center px-6"
          style={{
            background: isDarkMode
              ? "rgba(8,12,28,0.80)"
              : "rgba(255,255,255,0.80)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderBottom: isDarkMode
              ? "1px solid rgba(255,255,255,0.06)"
              : "1px solid rgba(15,22,60,0.08)",
          }}
        >
          {/* Logo → home */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 mr-auto group focus:outline-none"
            aria-label="Go to Home"
          >
            <div
              className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 border"
              style={{ borderColor: isDarkMode ? "rgba(255,255,255,0.12)" : "rgba(15,22,60,0.12)" }}
            >
              <img src={bgyLogo} alt="Barangay Gulod" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block leading-none">
              <p className={`text-[13px] font-bold tracking-tight transition-colors ${isDarkMode ? "text-white group-hover:text-emerald-400" : "text-[#0f1629] group-hover:text-emerald-700"}`}>
                Barangay Gulod
              </p>
              <p className={`text-[10px] mt-0.5 flex items-center gap-1 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                <ShieldCheck size={9} className="text-emerald-500" />
                Official Management System
              </p>
            </div>
          </button>

          {/* Page badge + dark toggle */}
          <div className="flex items-center gap-2">
            <span
              className="hidden sm:inline-flex text-[11px] font-semibold px-3 py-1.5 rounded-lg"
              style={{
                background: isDarkMode ? "rgba(52,211,153,0.1)" : "rgba(5,150,105,0.08)",
                color: isDarkMode ? "#34d399" : "#047857",
              }}
            >
              {pageLabel}
            </span>
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg transition-colors focus:outline-none"
              style={{
                background: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(15,22,60,0.06)",
                color: isDarkMode ? "#94a3b8" : "#64748b",
              }}
              aria-label="Toggle theme"
            >
              {isDarkMode
                ? <Sun size={16} className="text-yellow-400" />
                : <Moon size={16} />
              }
            </button>
          </div>
        </header>

        {/* ── Page content area ───────────────────────────────────────────── */}
        <div className="relative z-10 pt-[56px] min-h-screen">
          <Outlet />
        </div>
      </div>
    </AuthThemeContext.Provider>
  );
};

export default AuthLayout;