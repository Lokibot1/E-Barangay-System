import React, { useState } from "react";
import { Eye, EyeOff, User, Lock } from "lucide-react";

const LoginForm = ({ formData, handleChange, isDarkMode }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <label
          className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
        >
          Username
        </label>
        <div className="relative">
          <User
            size={16}
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
              isDarkMode ? "text-slate-400" : "text-slate-500"
            }`}
          />
          <input
            type="text"
            name="username"
            value={formData.username || ""}
            onChange={handleChange}
            required
            autoComplete="username"
            className="signin-input"
            style={{ paddingLeft: "2.75rem" }}
            placeholder="Enter your username"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label
          className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
        >
          Password
        </label>
        <div className="relative">
          <Lock
            size={16}
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
              isDarkMode ? "text-slate-400" : "text-slate-500"
            }`}
          />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password || ""}
            onChange={handleChange}
            required
            autoComplete="current-password"
            className="signin-input"
            style={{ paddingLeft: "2.75rem", paddingRight: "3rem" }}
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors ${
              isDarkMode
                ? "text-slate-400 hover:text-slate-200"
                : "text-slate-500 hover:text-slate-700"
            }`}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
