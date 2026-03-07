import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Save } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { getInitials, getAvatarColor } from '../../utils/avatar';
import themeTokens from '../../Themetokens';

export default function Settings() {
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem('appTheme') || 'modern'
  );

  useEffect(() => {
    const handler = (e) => setCurrentTheme(e.detail);
    window.addEventListener('themeChange', handler);
    return () => window.removeEventListener('themeChange', handler);
  }, []);

  const t = themeTokens[currentTheme];

  const { user, updateUser } = useUser();
  const [name, setName] = useState(user.name);
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = () => updateUser({ name });

  return (
    <div className="p-6 sm:p-8">
      <div className="max-w-xl space-y-6">
        {/* Page Header */}
        <div>
          <h1 className={`text-2xl font-spartan font-bold ${t.cardText}`}>
            Profile Settings
          </h1>
          <p className={`text-sm font-kumbh ${t.subtleText} mt-1`}>
            Update your personal information
          </p>
        </div>

        <div className={`${t.cardBg} border ${t.cardBorder} p-6 rounded-xl space-y-6 shadow-sm`}>
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-spartan font-bold ${getAvatarColor(name)}`}
            >
              {getInitials(name)}
            </div>
            <div>
              <p className={`text-sm font-kumbh font-medium ${t.cardText}`}>
                Profile picture
              </p>
              <p className={`text-xs font-kumbh ${t.subtleText}`}>
                Generated from your name
              </p>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <label className={`text-xs font-kumbh font-medium ${t.subtleText}`}>
              Full name
            </label>
            <div className="relative">
              <User size={16} className={`absolute left-3 top-3 ${t.subtleText}`} />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full pl-10 p-3 text-sm font-kumbh ${t.inlineBg} ${t.inputText} border ${t.inputBorder} rounded-lg focus:ring-2 ${t.primaryRing} ${t.primaryBorder} outline-none`}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className={`text-xs font-kumbh font-medium ${t.subtleText}`}>
              Email address
            </label>
            <div className="relative">
              <Mail size={16} className={`absolute left-3 top-3 ${t.subtleText}`} />
              <input
                defaultValue={user?.email || 'admin@email.com'}
                readOnly
                className={`w-full pl-10 p-3 text-sm font-kumbh ${t.inlineBg} ${t.inputText} border ${t.inputBorder} rounded-lg opacity-70 cursor-not-allowed`}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className={`text-xs font-kumbh font-medium ${t.subtleText}`}>
              Password
            </label>
            <div className="relative">
              <Lock size={16} className={`absolute left-3 top-3 ${t.subtleText}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 p-3 text-sm font-kumbh ${t.inlineBg} ${t.inputText} border ${t.inputBorder} rounded-lg focus:ring-2 ${t.primaryRing} ${t.primaryBorder} outline-none`}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-3 ${t.subtleText}`}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${t.primaryGrad} text-white p-3 rounded-lg text-sm font-kumbh font-bold hover:opacity-90 transition-all`}
          >
            <Save size={16} /> Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
