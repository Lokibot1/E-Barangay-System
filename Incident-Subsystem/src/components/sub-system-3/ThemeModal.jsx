import React, { useEffect, useMemo, useState } from "react";

const themes = [
  {
    id: "blue",
    name: "Ocean Blue",
    description: "Professional and calming",
    accent: "#2563eb",
    accentTo: "#4f46e5",
    soft: "#dbeafe",
    preview: {
      bg: "linear-gradient(135deg, #f1f5f9 0%, #f8fafc 45%, #eff6ff 100%)",
      card: "#ffffff",
    },
    selectedBorder: "#2563eb",
    selectedShadow: "0 14px 34px rgba(37, 99, 235, 0.14)",
    selectedBadge: "#2563eb",
    shellBg: "#ffffff",
    headerBg: "linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)",
    headerIcon: "#2563eb",
    headerText: "#0f172a",
    headerSubtext: "#475569",
    closeColor: "#475569",
    closeHoverBg: "rgba(15, 23, 42, 0.06)",
    noteBg: "#eff6ff",
    noteBorder: "#bfdbfe",
    noteIcon: "#2563eb",
    noteTitle: "#1d4ed8",
    noteText: "#1e3a8a",
    footerBg: "#f8fafc",
    footerBorder: "#e2e8f0",
    cancelText: "#475569",
    cancelHoverText: "#0f172a",
    cancelHoverBg: "#e2e8f0",
    actionBg: "linear-gradient(90deg, #2563eb 0%, #4f46e5 100%)",
    infoBg: "#ffffff",
    infoText: "#475569",
  },
  {
    id: "purple",
    name: "Royal Purple",
    description: "Creative and elegant",
    accent: "#9333ea",
    accentTo: "#db2777",
    soft: "#f3e8ff",
    preview: {
      bg: "linear-gradient(135deg, #f1f5f9 0%, #f8fafc 45%, #faf5ff 100%)",
      card: "#ffffff",
    },
    selectedBorder: "#9333ea",
    selectedShadow: "0 14px 34px rgba(147, 51, 234, 0.14)",
    selectedBadge: "#9333ea",
    shellBg: "#ffffff",
    headerBg: "linear-gradient(135deg, #ede9fe 0%, #faf5ff 100%)",
    headerIcon: "#9333ea",
    headerText: "#0f172a",
    headerSubtext: "#475569",
    closeColor: "#475569",
    closeHoverBg: "rgba(15, 23, 42, 0.06)",
    noteBg: "#faf5ff",
    noteBorder: "#d8b4fe",
    noteIcon: "#9333ea",
    noteTitle: "#7e22ce",
    noteText: "#6b21a8",
    footerBg: "#f8fafc",
    footerBorder: "#e2e8f0",
    cancelText: "#475569",
    cancelHoverText: "#0f172a",
    cancelHoverBg: "#e2e8f0",
    actionBg: "linear-gradient(90deg, #9333ea 0%, #db2777 100%)",
    infoBg: "#ffffff",
    infoText: "#475569",
  },
  {
    id: "green",
    name: "Forest Green",
    description: "Natural and refreshing",
    accent: "#16a34a",
    accentTo: "#059669",
    soft: "#dcfce7",
    preview: {
      bg: "linear-gradient(135deg, #f1f5f9 0%, #f8fafc 45%, #f0fdf4 100%)",
      card: "#ffffff",
    },
    selectedBorder: "#16a34a",
    selectedShadow: "0 14px 34px rgba(22, 163, 74, 0.14)",
    selectedBadge: "#16a34a",
    shellBg: "#ffffff",
    headerBg: "linear-gradient(135deg, #dcfce7 0%, #ecfdf5 100%)",
    headerIcon: "#16a34a",
    headerText: "#0f172a",
    headerSubtext: "#475569",
    closeColor: "#475569",
    closeHoverBg: "rgba(15, 23, 42, 0.06)",
    noteBg: "#f0fdf4",
    noteBorder: "#86efac",
    noteIcon: "#16a34a",
    noteTitle: "#15803d",
    noteText: "#166534",
    footerBg: "#f8fafc",
    footerBorder: "#e2e8f0",
    cancelText: "#475569",
    cancelHoverText: "#0f172a",
    cancelHoverBg: "#e2e8f0",
    actionBg: "linear-gradient(90deg, #16a34a 0%, #059669 100%)",
    infoBg: "#ffffff",
    infoText: "#475569",
  },
  {
    id: "dark",
    name: "Dark Mode",
    description: "Easy on the eyes",
    accent: "#475569",
    accentTo: "#0f172a",
    soft: "#334155",
    preview: {
      bg: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      card: "#1e293b",
    },
    selectedBorder: "#64748b",
    selectedShadow: "0 14px 34px rgba(15, 23, 42, 0.32)",
    selectedBadge: "#334155",
    shellBg: "#0f172a",
    headerBg: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    headerIcon: "#e2e8f0",
    headerText: "#ffffff",
    headerSubtext: "#cbd5e1",
    closeColor: "#cbd5e1",
    closeHoverBg: "rgba(226, 232, 240, 0.14)",
    noteBg: "rgba(51, 65, 85, 0.45)",
    noteBorder: "#475569",
    noteIcon: "#93c5fd",
    noteTitle: "#e2e8f0",
    noteText: "#cbd5e1",
    footerBg: "#111827",
    footerBorder: "#334155",
    cancelText: "#cbd5e1",
    cancelHoverText: "#ffffff",
    cancelHoverBg: "rgba(226, 232, 240, 0.14)",
    actionBg: "linear-gradient(90deg, #334155 0%, #0f172a 100%)",
    infoBg: "#0f172a",
    infoText: "#cbd5e1",
  },
];

const normalizeTheme = (theme) => (theme === "modern" ? "blue" : theme || "blue");

const ThemeModal = ({ isOpen, onClose, currentTheme, onThemeChange }) => {
  const [selectedTheme, setSelectedTheme] = useState(normalizeTheme(currentTheme));

  useEffect(() => {
    setSelectedTheme(normalizeTheme(currentTheme));
  }, [currentTheme]);

  const selectedThemeConfig = useMemo(() => {
    return themes.find((theme) => theme.id === selectedTheme) || themes[0];
  }, [selectedTheme]);

  const modalChrome = useMemo(
    () => ({
      shellBg: "#ffffff",
      headerBg: `linear-gradient(135deg, ${selectedThemeConfig.soft} 0%, #f8fafc 100%)`,
      headerIcon: selectedThemeConfig.accent,
      headerText: "#0f172a",
      headerSubtext: "#475569",
      closeColor: "#475569",
      closeHoverBg: "rgba(15, 23, 42, 0.06)",
      noteBg: "#f8fafc",
      noteBorder: selectedThemeConfig.soft,
      noteIcon: selectedThemeConfig.accent,
      noteTitle: "#0f172a",
      noteText: "#475569",
      footerBg: "#ffffff",
      footerBorder: "#e2e8f0",
      cancelText: "#475569",
      cancelHoverText: "#0f172a",
      cancelHoverBg: "#f1f5f9",
    }),
    [selectedThemeConfig],
  );

  if (!isOpen) return null;

  const handleApply = () => {
    onThemeChange(selectedTheme);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1600] flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scaleIn flex flex-col"
        style={{ backgroundColor: modalChrome.shellBg }}
      >
        <div
          className="px-6 py-5 flex items-center justify-between shrink-0"
          style={{ background: modalChrome.headerBg }}
        >
          <div>
            <div className="flex items-center space-x-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 48 48"
                className="flex-shrink-0"
                style={{ color: modalChrome.headerIcon }}
              >
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M44.492 3.506c-1.29-1.287-3.083-2.308-4.983-2.765c-1.903-.458-4.134-.392-6.069.841l-14.322 9.132c-1.333.85-2.444 2.082-3.08 3.62a47 47 0 0 0-1.588 4.401c-.445 1.489-.843 3.176-.91 4.708c-5.192.402-8.145 2.324-9.814 4.963c-1.831 2.895-2.038 6.55-2.209 9.555l-.003.063c-.099 1.736-.186 3.222-.516 4.328c-.038.126-.085.269-.134.42c-.097.294-.204.62-.274.919c-.114.482-.172 1.024-.007 1.582c.22.74.637 1.323 1.28 1.71c.629.376 1.424.537 2.36.537c5.99 0 11.084-.578 14.684-2.791c3.236-1.99 5.188-5.249 5.598-10.33c1.494-.064 3.152-.428 4.631-.84a50 50 0 0 0 4.419-1.485c1.636-.63 2.951-1.79 3.842-3.202l9.032-14.317c1.22-1.934 1.287-4.16.83-6.063c-.455-1.9-1.474-3.695-2.767-4.986M24.356 30.173c.985-.045 2.263-.302 3.643-.687a46 46 0 0 0 4.035-1.357c.712-.275 1.337-.8 1.787-1.513l9.032-14.317c.443-.703.569-1.678.295-2.822c-.275-1.147-.91-2.246-1.643-2.979c-.736-.734-1.837-1.37-2.985-1.646c-1.143-.275-2.11-.148-2.807.296L21.391 14.28c-.675.43-1.174 1.013-1.448 1.672a43 43 0 0 0-1.442 3.996c-.413 1.38-.688 2.66-.736 3.647c1.5.419 2.94 1.337 4.094 2.488s2.077 2.589 2.497 4.09"
                  clipRule="evenodd"
                />
              </svg>
              <h2
                className="text-2xl font-bold font-spartan"
                style={{ color: modalChrome.headerText }}
              >
                Choose Your Theme
              </h2>
            </div>
            <p
              className="text-sm font-kumbh mt-1 ml-11"
              style={{ color: modalChrome.headerSubtext }}
            >
              Customize the appearance of your workspace
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors"
            style={{ color: modalChrome.closeColor }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = modalChrome.closeHoverBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
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

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 pb-28 pr-4">
          <div className="grid md:grid-cols-2 gap-6">
            {themes.map((theme) => (
              <div
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
              className={`relative cursor-pointer rounded-xl border-2 transition-all duration-300 overflow-hidden group ${
                  selectedTheme === theme.id
                    ? "shadow-xl scale-[1.02]"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-lg"
                }`}
                style={
                  selectedTheme === theme.id
                    ? {
                        borderColor: theme.selectedBorder,
                        boxShadow: theme.selectedShadow,
                      }
                    : undefined
                }
              >
                {selectedTheme === theme.id && (
                  <div
                    className="absolute top-3 right-3 z-10 text-white px-3 py-1 rounded-full text-xs font-bold font-kumbh flex items-center space-x-1 animate-slideDown"
                    style={{ backgroundColor: theme.selectedBadge }}
                  >
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

                <div className="p-6 h-48 relative" style={{ background: theme.preview.bg }}>
                  <div
                    className="rounded-lg p-3 mb-3 shadow-md"
                    style={{ backgroundColor: theme.preview.card }}
                  >
                    <div
                      className="w-20 h-2 rounded-full mb-2"
                      style={{
                        background: `linear-gradient(90deg, ${theme.accent} 0%, ${theme.accentTo} 100%)`,
                      }}
                    />
                    <div
                      className="w-32 h-1.5 rounded-full"
                      style={{ backgroundColor: theme.soft }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[0, 1].map((i) => (
                      <div
                        key={i}
                        className="rounded-lg p-3 shadow-md"
                        style={{ backgroundColor: theme.preview.card }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg mb-2"
                          style={{
                            background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentTo} 100%)`,
                          }}
                        />
                        <div
                          className="w-16 h-1.5 rounded-full mb-1"
                          style={{ backgroundColor: theme.soft }}
                        />
                        <div
                          className="w-12 h-1 rounded-full"
                          style={{ backgroundColor: theme.soft }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="p-4"
                  style={{ backgroundColor: theme.infoBg }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3
                      className="text-lg font-bold font-spartan"
                      style={{ color: theme.id === "dark" ? "#ffffff" : "#0f172a" }}
                    >
                      {theme.name}
                    </h3>
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${theme.id === "dark" ? "border-slate-800" : "border-white"} shadow-sm`}
                      style={{
                        background: `linear-gradient(90deg, ${theme.accent} 0%, ${theme.accentTo} 100%)`,
                      }}
                    />
                  </div>
                  <p
                    className="text-sm font-kumbh"
                    style={{ color: theme.id === "dark" ? "#cbd5e1" : theme.infoText }}
                  >
                    {theme.description}
                  </p>
                </div>

                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `linear-gradient(90deg, ${theme.accent} 0%, ${theme.accentTo} 100%)`,
                  }}
                />
              </div>
            ))}
          </div>

          <div
            className="mt-6 p-4 border rounded-xl"
            style={{
              backgroundColor: modalChrome.noteBg,
              borderColor: modalChrome.noteBorder,
            }}
          >
            <div className="flex items-start space-x-3">
              <svg
                className="w-5 h-5 mt-0.5 flex-shrink-0"
                style={{ color: modalChrome.noteIcon }}
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
                  className="text-sm font-semibold font-kumbh"
                  style={{ color: modalChrome.noteTitle }}
                >
                  Theme Preview
                </p>
                <p
                  className="text-xs font-kumbh mt-1"
                  style={{ color: modalChrome.noteText }}
                >
                  The selected theme will be applied to your entire workspace,
                  including buttons, cards, and navigation elements.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="px-6 py-4 flex items-center justify-between border-t shrink-0 relative z-10 shadow-[0_-10px_24px_rgba(15,23,42,0.08)]"
          style={{
            backgroundColor: modalChrome.footerBg,
            borderColor: modalChrome.footerBorder,
          }}
        >
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg font-semibold font-kumbh transition-colors"
            style={{ color: modalChrome.cancelText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = modalChrome.cancelHoverBg;
              e.currentTarget.style.color = modalChrome.cancelHoverText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = modalChrome.cancelText;
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2.5 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 font-kumbh flex items-center space-x-2"
            style={{ background: selectedThemeConfig.actionBg }}
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
