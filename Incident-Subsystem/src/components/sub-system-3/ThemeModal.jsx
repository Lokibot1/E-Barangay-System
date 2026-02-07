import React, { useState, useEffect } from "react";
import themeTokens from "../../Themetokens";

const ThemeModal = ({ isOpen, onClose, currentTheme, onThemeChange }) => {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);

  useEffect(() => {
    setSelectedTheme(currentTheme);
  }, [currentTheme]);

  if (!isOpen) return null;

  const t = themeTokens[currentTheme] || themeTokens.blue;
  const isDark = currentTheme === "dark";

  const themes = [
    {
      id: "blue",
      name: "Ocean Blue",
      description: "Professional and calming",
      colors: { primary: "from-blue-600 to-indigo-600", light: "bg-blue-50" },
      preview: {
        bg: "bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50",
        card: "bg-white",
      },
    },
    {
      id: "purple",
      name: "Royal Purple",
      description: "Creative and elegant",
      colors: { primary: "from-purple-600 to-pink-600", light: "bg-purple-50" },
      preview: {
        bg: "bg-gradient-to-br from-slate-100 via-slate-50 to-purple-50",
        card: "bg-white",
      },
    },
    {
      id: "green",
      name: "Forest Green",
      description: "Natural and refreshing",
      colors: {
        primary: "from-green-600 to-emerald-600",
        light: "bg-green-50",
      },
      preview: {
        bg: "bg-gradient-to-br from-slate-100 via-slate-50 to-green-50",
        card: "bg-white",
      },
    },
    {
      id: "dark",
      name: "Dark Mode",
      description: "Easy on the eyes",
      colors: { primary: "from-slate-700 to-slate-900", light: "bg-slate-800" },
      preview: {
        bg: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
        card: "bg-slate-800",
      },
    },
  ];

  const handleApply = () => {
    onThemeChange(selectedTheme);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={`relative ${t.cardBg} rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scaleIn`}
      >
        {/* Header */}
        <div
          className={`bg-gradient-to-r ${t.modalHeaderGrad} px-6 py-5 flex items-center justify-between`}
        >
          <div>
            <div className="flex items-center space-x-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 48 48"
                className={`${isDark ? "text-white" : t.modalHeaderIcon} flex-shrink-0`}
              >
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M44.492 3.506c-1.29-1.287-3.083-2.308-4.983-2.765c-1.903-.458-4.134-.392-6.069.841l-14.322 9.132c-1.333.85-2.444 2.082-3.08 3.62a47 47 0 0 0-1.588 4.401c-.445 1.489-.843 3.176-.91 4.708c-5.192.402-8.145 2.324-9.814 4.963c-1.831 2.895-2.038 6.55-2.209 9.555l-.003.063c-.099 1.736-.186 3.222-.516 4.328c-.038.126-.085.269-.134.42c-.097.294-.204.62-.274.919c-.114.482-.172 1.024-.007 1.582c.22.74.637 1.323 1.28 1.71c.629.376 1.424.537 2.36.537c5.99 0 11.084-.578 14.684-2.791c3.236-1.99 5.188-5.249 5.598-10.33c1.494-.064 3.152-.428 4.631-.84a50 50 0 0 0 4.419-1.485c1.636-.63 2.951-1.79 3.842-3.202l9.032-14.317c1.22-1.934 1.287-4.16.83-6.063c-.455-1.9-1.474-3.695-2.767-4.986M24.356 30.173c.985-.045 2.263-.302 3.643-.687a46 46 0 0 0 4.035-1.357c.712-.275 1.337-.8 1.787-1.513l9.032-14.317c.443-.703.569-1.678.295-2.822c-.275-1.147-.91-2.246-1.643-2.979c-.736-.734-1.837-1.37-2.985-1.646c-1.143-.275-2.11-.148-2.807.296L21.391 14.28c-.675.43-1.174 1.013-1.448 1.672a43 43 0 0 0-1.442 3.996c-.413 1.38-.688 2.66-.736 3.647c1.5.419 2.94 1.337 4.094 2.488s2.077 2.589 2.497 4.09"
                  clipRule="evenodd"
                />
              </svg>
              <h2
                className={`text-2xl font-bold ${isDark ? "text-white" : t.cardText} font-spartan`}
              >
                Choose Your Theme
              </h2>
            </div>
            <p
              className={`text-sm ${isDark ? "text-slate-300" : t.subtleText} font-kumbh mt-1 ml-11`}
            >
              Customize the appearance of your workspace
            </p>
          </div>
          <button
            onClick={onClose}
            className={`${isDark ? "text-white hover:bg-white/10" : `${t.subtleText} hover:bg-black/5`} p-2 rounded-full transition-colors`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid md:grid-cols-2 gap-6">
            {themes.map((theme) => (
              <div
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`relative cursor-pointer rounded-xl border-2 transition-all duration-300 overflow-hidden group ${
                  selectedTheme === theme.id
                    ? "border-blue-600 shadow-xl scale-105"
                    : `${isDark ? "border-slate-600" : "border-slate-200"} hover:border-slate-300 hover:shadow-lg`
                }`}
              >
                {/* Selected Badge */}
                {selectedTheme === theme.id && (
                  <div className="absolute top-3 right-3 z-10 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold font-kumbh flex items-center space-x-1 animate-slideDown">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Selected</span>
                  </div>
                )}

                {/* Preview */}
                <div className={`${theme.preview.bg} p-6 h-48 relative`}>
                  <div
                    className={`${theme.preview.card} rounded-lg p-3 mb-3 shadow-md`}
                  >
                    <div
                      className={`w-20 h-2 bg-gradient-to-r ${theme.colors.primary} rounded-full mb-2`}
                    />
                    <div
                      className={`w-32 h-1.5 ${theme.colors.light} rounded-full`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[0, 1].map((i) => (
                      <div
                        key={i}
                        className={`${theme.preview.card} rounded-lg p-3 shadow-md`}
                      >
                        <div
                          className={`w-8 h-8 bg-gradient-to-br ${theme.colors.primary} rounded-lg mb-2`}
                        />
                        <div
                          className={`w-16 h-1.5 ${theme.colors.light} rounded-full mb-1`}
                        />
                        <div
                          className={`w-12 h-1 ${theme.colors.light} rounded-full`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info */}
                <div className={`p-4 ${t.cardBg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3
                      className={`text-lg font-bold ${t.cardText} font-spartan`}
                    >
                      {theme.name}
                    </h3>
                    <div
                      className={`w-4 h-4 bg-gradient-to-r ${theme.colors.primary} rounded-full border-2 ${isDark ? "border-slate-800" : "border-white"} shadow-sm`}
                    />
                  </div>
                  <p className={`text-sm ${t.subtleText} font-kumbh`}>
                    {theme.description}
                  </p>
                </div>

                <div
                  className={`absolute inset-0 bg-gradient-to-r ${theme.colors.primary} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}
                />
              </div>
            ))}
          </div>

          {/* Note */}
          <div
            className={`mt-6 p-4 ${isDark ? "bg-slate-700 border-slate-500" : "bg-blue-50 border-blue-200"} border rounded-xl`}
          >
            <div className="flex items-start space-x-3">
              <svg
                className={`w-5 h-5 ${isDark ? "text-slate-300" : "text-blue-600"} mt-0.5 flex-shrink-0`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p
                  className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-blue-900"} font-kumbh`}
                >
                  Theme Preview
                </p>
                <p
                  className={`text-xs ${isDark ? "text-slate-400" : "text-blue-700"} font-kumbh mt-1`}
                >
                  The selected theme will be applied to your entire workspace,
                  including buttons, cards, and navigation elements.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`${isDark ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200"} px-6 py-4 flex items-center justify-between border-t`}
        >
          <button
            onClick={onClose}
            className={`px-5 py-2.5 ${isDark ? "text-slate-300 hover:text-slate-100 hover:bg-slate-700" : "text-slate-600 hover:text-slate-800 hover:bg-slate-200"} rounded-lg font-semibold font-kumbh transition-colors`}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className={`px-6 py-2.5 bg-gradient-to-r ${t.submitGrad} text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 font-kumbh flex items-center space-x-2`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>Apply Theme</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ThemeModal;
