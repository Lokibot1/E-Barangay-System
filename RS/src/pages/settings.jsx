import React, { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, Save } from "lucide-react";
import { useUser } from "../context/UserContext";
import { getInitials, getAvatarColor } from "../utils/avatar";

export default function Settings() {
  const { user, updateUser } = useUser();
  const [name, setName] = useState(user.name);
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = () => updateUser({ name });

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Profile Settings
        </h1>
        <p className="text-sm text-slate-500">
          Update your personal information
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-semibold ${getAvatarColor(
              name
            )}`}
          >
            {getInitials(name)}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              Profile picture
            </p>
            <p className="text-xs text-slate-500">
              Generated from your name
            </p>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">
            Full name
          </label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 p-3 text-sm bg-slate-50 dark:bg-slate-800 border rounded-lg focus:ring-2 focus:ring-emerald-500 dark:text-white"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">
            Email address
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              defaultValue="admin@email.com"
              className="w-full pl-10 p-3 text-sm bg-slate-50 dark:bg-slate-800 border rounded-lg dark:text-white"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">
            Password
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 p-3 text-sm bg-slate-50 dark:bg-slate-800 border rounded-lg dark:text-white"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-400"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-lg text-sm font-semibold"
        >
          <Save size={16} /> Save changes
        </button>
      </div>
    </div>
  );
}
