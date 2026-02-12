import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import themeTokens from "../../../Themetokens";
import { getUser } from "../../../services/sub-system-3/loginService";
import sanBartolomeImg from "../../../assets/css/images/SanBartolome.jpg";

const AdminLanding = () => {
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("appTheme") || "blue"
  );

  useEffect(() => {
    const handleThemeChange = (e) => setCurrentTheme(e.detail);
    window.addEventListener("themeChange", handleThemeChange);
    return () => window.removeEventListener("themeChange", handleThemeChange);
  }, []);

  const t = themeTokens[currentTheme];
  const user = getUser();
  const firstName = user?.name?.split(" ")[0] || "Admin";
  const navigate = useNavigate();

  const stats = [
    {
      count: 15,
      label: "REQUESTS",
      sublabel: "PENDING",
      borderColor: "border-green-600",
      circleBg: "bg-gray-200",
      circleText: "text-gray-700",
      arrowColor: "text-amber-500",
      link: "/admin/requests",
    },
    {
      count: 15,
      label: "COMPLAINTS",
      sublabel: "OPEN",
      borderColor: "border-green-600",
      circleBg: "bg-gray-200",
      circleText: "text-green-700",
      arrowColor: "text-amber-500",
      link: "/admin/incidents",
    },
    {
      count: 15,
      label: "REPORTS",
      sublabel: "INCIDENT",
      borderColor: "border-gray-300",
      circleBg: "bg-gray-200",
      circleText: "text-gray-700",
      arrowColor: "text-gray-400",
      link: "/admin/incidents",
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <div className="relative w-full h-[340px] sm:h-[400px] overflow-hidden">
        <img
          src={sanBartolomeImg}
          alt="Barangay Gulod"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Hero content */}
        <div className="relative z-10 flex flex-col justify-center h-full px-6 sm:px-10 lg:px-16 max-w-5xl">
          <p className="text-white/90 text-lg sm:text-xl font-semibold font-kumbh mb-2">
            Hi, {firstName}!
          </p>
          <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold font-spartan leading-tight">
            Welcome to
            <br />
            E-Barangay Integrated Services Platform of
            <br />
            Gulod
          </h1>
          <div className="mt-6">
            <button className="px-6 py-3 bg-green-700 hover:bg-green-800 text-white text-sm font-bold font-kumbh uppercase tracking-wider rounded transition-colors">
              View Announcements
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────────── */}
      <div className={`${t.pageBg} px-6 sm:px-10 lg:px-16 py-10`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`${t.cardBg} border-2 ${stat.borderColor} rounded-xl px-5 py-6 flex items-center gap-4 relative`}
            >
              {/* Circle with number */}
              <div
                className={`w-16 h-16 ${stat.circleBg} rounded-full flex items-center justify-center flex-shrink-0`}
              >
                <span
                  className={`text-2xl font-bold ${stat.circleText} font-spartan`}
                >
                  {stat.count}
                </span>
              </div>

              {/* Label */}
              <div>
                <p className={`text-xs font-medium ${t.subtleText} font-kumbh uppercase tracking-wide`}>
                  {stat.sublabel}
                </p>
                <p className={`text-lg font-bold ${t.cardText} font-spartan uppercase`}>
                  {stat.label}
                </p>
              </div>

              {/* Arrow icon */}
              <button
                onClick={() => navigate(stat.link)}
                className={`absolute top-4 right-4 ${stat.arrowColor} hover:opacity-70 transition-opacity`}
              >
                <svg
                  className="w-7 h-7"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14v-4H7v-2h4V6l5 5-5 5z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Announcement Section ─────────────────────────────────────── */}
      <div className="px-6 sm:px-10 lg:px-16 pb-10">
        <div className="max-w-5xl rounded-xl overflow-hidden shadow-md">
          {/* Header */}
          <div className="bg-green-800 px-6 py-4">
            <h2 className="text-white text-lg font-bold font-spartan uppercase tracking-wide">
              Barangay Council Meeting
            </h2>
          </div>

          {/* Content */}
          <div
            className={`${t.cardBg} border-l-4 border-green-600 px-6 py-5`}
          >
            <h3 className={`font-bold ${t.cardText} font-spartan uppercase mb-2`}>
              Regular Barangay Council Meeting
            </h3>
            <p className={`text-sm ${t.subtleText} font-kumbh leading-relaxed uppercase`}>
              All barangay officials are hereby informed that a regular barangay
              council meeting will be held on February 15, 2026 (Thursday) at
              2:00 PM at the Barangay Hall, Session Room. Attendance is required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLanding;
