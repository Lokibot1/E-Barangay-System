import React from "react";
import { useNavigate } from "react-router-dom";
import themeTokens from "../../Themetokens";

const MainMenuCards = ({ currentTheme }) => {
  const navigate = useNavigate();
  const t = themeTokens[currentTheme];

  const menuItems = [
    {
      id: "file-complaint",
      title: "FILE A COMPLAINT",
      icon: (
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      bgGradient: "from-amber-500 to-orange-500",
      image:
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
      path: "/incident-complaint/file-complaint",
    },
    {
      id: "report-incident",
      title: "REPORT AN INCIDENT",
      icon: (
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
      bgGradient: "from-blue-600 to-indigo-700",
      image:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
      path: "/incident-complaint/incident-report",
    },
    {
      id: "incident-map",
      title: "INCIDENT MAP",
      icon: (
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
      ),
      bgGradient: "from-green-500 to-emerald-600",
      image:
        "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80",
      path: "/incident-complaint/incident-map",
    },
    {
      id: "incident-status",
      title: "INCIDENT & COMPLAINT STATUS",
      icon: (
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      bgGradient: "from-slate-500 to-slate-700",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      path: "/incident-complaint/case-management",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => navigate(item.path)}
          className={`${t.cardBg} border ${t.cardBorder} rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group text-left relative`}
        >
          {/* Icon in top-left corner */}
          <div
            className={`absolute top-4 left-4 z-10 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${item.bgGradient} rounded-2xl flex items-center justify-center shadow-xl transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
          >
            {item.icon}
          </div>

          {/* Image */}
          <div className="relative h-48 sm:h-56 overflow-hidden">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          </div>

          {/* Title at bottom */}
          <div className="p-4 sm:p-6">
            <h3
              className={`text-sm sm:text-base font-bold ${t.cardText} font-spartan uppercase tracking-tight leading-tight`}
            >
              {item.title}
            </h3>
          </div>
        </button>
      ))}
    </div>
  );
};

export default MainMenuCards;
