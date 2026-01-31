import React, { useState, useEffect } from "react";

const ThemeModal = ({ isOpen, onClose, currentTheme, onThemeChange }) => {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);

  useEffect(() => {
    setSelectedTheme(currentTheme);
  }, [currentTheme]);

  if (!isOpen) return null;

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

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-900 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white font-spartan">
              Choose Your Theme
            </h2>
            <p className="text-slate-300 text-sm font-kumbh mt-1">
              Customize the appearance of your workspace
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
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
                    : "border-slate-200 hover:border-slate-300 hover:shadow-lg"
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
                <div className="p-4 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-slate-800 font-spartan">
                      {theme.name}
                    </h3>
                    <div
                      className={`w-4 h-4 bg-gradient-to-r ${theme.colors.primary} rounded-full border-2 border-white shadow-sm`}
                    />
                  </div>
                  <p className="text-sm text-slate-600 font-kumbh">
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
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
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
                <p className="text-sm font-semibold text-blue-900 font-kumbh">
                  Theme Preview
                </p>
                <p className="text-xs text-blue-700 font-kumbh mt-1">
                  The selected theme will be applied to your entire workspace,
                  including buttons, cards, and navigation elements.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg font-semibold font-kumbh transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 font-kumbh flex items-center space-x-2"
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
