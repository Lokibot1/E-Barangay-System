import React from "react";
import { useNavigate } from "react-router-dom";
import themeTokens from "../../Themetokens";

const MainMenuCards = ({ currentTheme }) => {
  const navigate = useNavigate();
  const t = themeTokens[currentTheme];

  const menuItems = [
    {
      id: "request-barangay-id",
      title: "Request Barangay ID",
      bgGradient: "from-amber-500 to-orange-500",
      image:
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
      path: "/sub-system-2/req-bid",
    },
    {
      id: "request-indigency",
      title: "Request Certificate of Indigency",
      bgGradient: "from-blue-600 to-indigo-700",
      image:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
      path: "/sub-system-2/req-coi",
    },
    {
      id: "request-residency",
      title: "Request Certificate of Residency",
      bgGradient: "from-green-500 to-emerald-600",
      image:
        "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80",
      path: "/sub-system-2/req-cor",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => navigate(item.path)}
          className={`${t.cardBg} border ${t.cardBorder} rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group text-left relative`}
        >
          <div
            className={`absolute top-4 left-4 z-10 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${item.bgGradient} rounded-2xl flex items-center justify-center shadow-xl transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
          >
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
          </div>

          <div className="relative h-48 sm:h-56 overflow-hidden">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          </div>

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