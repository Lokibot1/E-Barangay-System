import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  CircleMarker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import MainMenuCards from "../../components/sub-system-3/MainMenuCards";
import themeTokens from "../../Themetokens";

// ── Sample zone polygons for Barangay San Bartolome, Novaliches ─────────
const ZONE_DATA = [
  {
    id: "zone-active-1",
    name: "Purok 3 — Central Novaliches",
    status: "active",
    incidents: 12,
    positions: [
      [14.7055, 121.032],
      [14.7085, 121.042],
      [14.7045, 121.0505],
      [14.6965, 121.0525],
      [14.6885, 121.048],
      [14.6905, 121.038],
      [14.6955, 121.03],
    ],
  },
  {
    id: "zone-progress-1",
    name: "Purok 5 — West Novaliches",
    status: "in-progress",
    incidents: 7,
    positions: [
      [14.6955, 121.03],
      [14.6905, 121.038],
      [14.6885, 121.048],
      [14.6835, 121.045],
      [14.6775, 121.038],
      [14.6805, 121.028],
      [14.6875, 121.024],
    ],
  },
  {
    id: "zone-resolved-1",
    name: "Purok 8 — Southeast Novaliches",
    status: "resolved",
    incidents: 4,
    positions: [
      [14.6885, 121.048],
      [14.6965, 121.0525],
      [14.6905, 121.058],
      [14.6835, 121.06],
      [14.6775, 121.056],
      [14.6755, 121.048],
      [14.6775, 121.038],
      [14.6835, 121.045],
    ],
  },
];

// ── Sample incident markers ────────────────────────────────────────────
const INCIDENT_MARKERS = [
  {
    id: 1,
    lat: 14.7015,
    lng: 121.04,
    status: "active",
    title: "Illegal Parking — Quirino Highway",
    date: "2026-02-07",
  },
  {
    id: 2,
    lat: 14.698,
    lng: 121.045,
    status: "active",
    title: "Road Obstruction — Mindanao Ave",
    date: "2026-02-07",
  },
  {
    id: 3,
    lat: 14.695,
    lng: 121.038,
    status: "active",
    title: "Street Flooding — Purok 3",
    date: "2026-02-06",
  },
  {
    id: 4,
    lat: 14.688,
    lng: 121.035,
    status: "in-progress",
    title: "Clogged Sewer — Bagumbayan St",
    date: "2026-02-06",
  },
  {
    id: 5,
    lat: 14.685,
    lng: 121.04,
    status: "in-progress",
    title: "Stray Dogs — Near Holy Cross",
    date: "2026-02-05",
  },
  {
    id: 6,
    lat: 14.682,
    lng: 121.032,
    status: "in-progress",
    title: "Broken Street Light — Carbon Rd",
    date: "2026-02-05",
  },
  {
    id: 7,
    lat: 14.684,
    lng: 121.052,
    status: "resolved",
    title: "Illegal Dumping — Near Bagbag Creek",
    date: "2026-02-04",
  },
  {
    id: 8,
    lat: 14.68,
    lng: 121.048,
    status: "resolved",
    title: "Standing Water — Sauyo Entrance",
    date: "2026-02-04",
  },
  {
    id: 9,
    lat: 14.691,
    lng: 121.055,
    status: "resolved",
    title: "Noise Complaint — Gulod Area",
    date: "2026-02-03",
  },
  {
    id: 10,
    lat: 14.7035,
    lng: 121.036,
    status: "active",
    title: "Abandoned Vehicle — Novaliches Proper",
    date: "2026-02-07",
  },
];

// ── Color helpers ───────────────────────────────────────────────────────
const STATUS_COLORS = {
  active: {
    fill: "#e11d48",
    fillOpacity: 0.35,
    stroke: "#be123c",
    marker: "#dc2626",
  },
  "in-progress": {
    fill: "#f97316",
    fillOpacity: 0.35,
    stroke: "#ea580c",
    marker: "#f97316",
  },
  resolved: {
    fill: "#10b981",
    fillOpacity: 0.35,
    stroke: "#059669",
    marker: "#10b981",
  },
};

// Map center: Barangay San Bartolome, Novaliches, QC
const MAP_CENTER = [14.693, 121.043];
const MAP_ZOOM = 14;

const IncidentMapPage = () => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem("appTheme") || "blue";
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentTheme(localStorage.getItem("appTheme") || "blue");
    };

    window.addEventListener("storage", handleStorageChange);

    const handleThemeChange = (e) => {
      setCurrentTheme(e.detail);
    };
    window.addEventListener("themeChange", handleThemeChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("themeChange", handleThemeChange);
    };
  }, []);

  const t = themeTokens[currentTheme];

  return (
    <>
      <div className="h-full flex flex-col overflow-y-auto">
        {/* White Space */}
        <div className={`${t.pageBg} py-8 sm:py-10 text-center px-4`}>
          <h1
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${t.cardText} mb-2 sm:mb-3 font-spartan uppercase tracking-tight`}
          >
            INCIDENT & COMPLAINT MANAGEMENT
          </h1>
        </div>

        {/* Dynamic Theme Section with MainMenuCards */}
        <div
          className={`bg-gradient-to-r ${t.primaryGrad} py-12 sm:py-16 px-4`}
        >
          <div className="container mx-auto px-4 sm:px-6">
            <MainMenuCards currentTheme={currentTheme} />
          </div>
        </div>

        {/* Incident Map Content Section */}
        <div className="flex-1 container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Header with illustration */}
          <div className="mb-8 sm:mb-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 flex-shrink-0">
                <svg
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                >
                  <path
                    d="M32 4C22.06 4 14 12.06 14 22c0 14 18 36 18 36s18-22 18-36c0-9.94-8.06-18-18-18z"
                    fill="#16a34a"
                  />
                  <circle cx="32" cy="22" r="8" fill="white" />
                  <circle cx="32" cy="22" r="4" fill="#16a34a" />
                </svg>
              </div>
              <div className="flex-1">
                <h2
                  className={`text-2xl sm:text-3xl font-bold ${t.cardText} mb-2 font-spartan`}
                >
                  INCIDENT MAPPING
                </h2>
                <div className="w-20 h-1 bg-green-600 rounded-full"></div>
              </div>
            </div>

            <div
              className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-6 sm:p-8 shadow-lg`}
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Illustration */}
                <div className="flex-shrink-0 md:w-48">
                  <svg
                    viewBox="0 0 240 180"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-auto"
                  >
                    {/* Background circles */}
                    <circle
                      cx="120"
                      cy="100"
                      r="70"
                      fill="#dcfce7"
                      opacity="0.5"
                    />
                    <circle
                      cx="90"
                      cy="80"
                      r="40"
                      fill="#bbf7d0"
                      opacity="0.4"
                    />
                    {/* Small colored dots */}
                    <circle
                      cx="40"
                      cy="60"
                      r="8"
                      fill="#f43f5e"
                      opacity="0.7"
                    />
                    <circle
                      cx="55"
                      cy="75"
                      r="5"
                      fill="#fb923c"
                      opacity="0.7"
                    />
                    <circle
                      cx="30"
                      cy="80"
                      r="4"
                      fill="#a78bfa"
                      opacity="0.7"
                    />
                    {/* Buildings */}
                    <rect
                      x="70"
                      y="90"
                      width="30"
                      height="50"
                      rx="2"
                      fill="#94a3b8"
                    />
                    <rect
                      x="75"
                      y="96"
                      width="8"
                      height="8"
                      rx="1"
                      fill="#e2e8f0"
                    />
                    <rect
                      x="87"
                      y="96"
                      width="8"
                      height="8"
                      rx="1"
                      fill="#e2e8f0"
                    />
                    <rect
                      x="75"
                      y="108"
                      width="8"
                      height="8"
                      rx="1"
                      fill="#e2e8f0"
                    />
                    <rect
                      x="87"
                      y="108"
                      width="8"
                      height="8"
                      rx="1"
                      fill="#e2e8f0"
                    />
                    <rect
                      x="75"
                      y="120"
                      width="8"
                      height="8"
                      rx="1"
                      fill="#e2e8f0"
                    />
                    <rect
                      x="87"
                      y="120"
                      width="8"
                      height="8"
                      rx="1"
                      fill="#e2e8f0"
                    />
                    <rect
                      x="108"
                      y="70"
                      width="35"
                      height="70"
                      rx="2"
                      fill="#64748b"
                    />
                    <rect
                      x="114"
                      y="76"
                      width="8"
                      height="8"
                      rx="1"
                      fill="#e2e8f0"
                    />
                    <rect
                      x="126"
                      y="76"
                      width="8"
                      height="8"
                      rx="1"
                      fill="#e2e8f0"
                    />
                    <rect
                      x="114"
                      y="88"
                      width="8"
                      height="8"
                      rx="1"
                      fill="#e2e8f0"
                    />
                    <rect
                      x="126"
                      y="88"
                      width="8"
                      height="8"
                      rx="1"
                      fill="#e2e8f0"
                    />
                    <rect
                      x="114"
                      y="100"
                      width="8"
                      height="8"
                      rx="1"
                      fill="#e2e8f0"
                    />
                    <rect
                      x="126"
                      y="100"
                      width="8"
                      height="8"
                      rx="1"
                      fill="#e2e8f0"
                    />
                    <rect
                      x="114"
                      y="112"
                      width="8"
                      height="8"
                      rx="1"
                      fill="#e2e8f0"
                    />
                    <rect
                      x="126"
                      y="112"
                      width="8"
                      height="8"
                      rx="1"
                      fill="#e2e8f0"
                    />
                    <rect
                      x="114"
                      y="124"
                      width="8"
                      height="8"
                      rx="1"
                      fill="#e2e8f0"
                    />
                    <rect
                      x="126"
                      y="124"
                      width="8"
                      height="8"
                      rx="1"
                      fill="#e2e8f0"
                    />
                    <rect
                      x="150"
                      y="100"
                      width="25"
                      height="40"
                      rx="2"
                      fill="#94a3b8"
                    />
                    <rect
                      x="155"
                      y="106"
                      width="6"
                      height="6"
                      rx="1"
                      fill="#e2e8f0"
                    />
                    <rect
                      x="164"
                      y="106"
                      width="6"
                      height="6"
                      rx="1"
                      fill="#e2e8f0"
                    />
                    <rect
                      x="155"
                      y="116"
                      width="6"
                      height="6"
                      rx="1"
                      fill="#e2e8f0"
                    />
                    <rect
                      x="164"
                      y="116"
                      width="6"
                      height="6"
                      rx="1"
                      fill="#e2e8f0"
                    />
                    {/* Leaves */}
                    <ellipse
                      cx="185"
                      cy="110"
                      rx="12"
                      ry="6"
                      transform="rotate(-30 185 110)"
                      fill="#22c55e"
                      opacity="0.6"
                    />
                    <ellipse
                      cx="195"
                      cy="100"
                      rx="10"
                      ry="5"
                      transform="rotate(15 195 100)"
                      fill="#4ade80"
                      opacity="0.5"
                    />
                    <ellipse
                      cx="50"
                      cy="100"
                      rx="10"
                      ry="5"
                      transform="rotate(-20 50 100)"
                      fill="#22c55e"
                      opacity="0.5"
                    />
                    {/* Large Map Pin */}
                    <path
                      d="M125 10C115.06 10 107 18.06 107 28c0 14 18 30 18 30s18-16 18-30c0-9.94-8.06-18-18-18z"
                      fill="#16a34a"
                    />
                    <circle cx="125" cy="28" r="7" fill="white" />
                    <circle cx="125" cy="28" r="3.5" fill="#16a34a" />
                    {/* Ground line */}
                    <line
                      x1="55"
                      y1="140"
                      x2="190"
                      y2="140"
                      stroke="#cbd5e1"
                      strokeWidth="2"
                    />
                  </svg>
                </div>

                {/* Text content */}
                <div className="flex-1">
                  <h3
                    className={`text-lg font-bold ${t.cardText} mb-3 font-spartan text-green-600`}
                  >
                    EXPLORE THE LIVE INCIDENT MAP
                  </h3>
                  <p
                    className={`text-sm ${t.subtleText} font-kumbh leading-relaxed`}
                  >
                    Stay informed and stay safe. View a real-time overview of
                    public reports, road obstructions, and environmental alerts
                    across our Barangay. Check which issues are currently being
                    addressed by our response teams.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Legend */}
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </div>
              <h3
                className={`text-xl sm:text-2xl font-bold ${t.cardText} font-spartan`}
              >
                MAP LEGEND
              </h3>
            </div>

            <div
              className={`${t.cardBg} border ${t.cardBorder} rounded-xl p-5 sm:p-6 shadow-md`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* NEW/ACTIVE */}
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-500 flex-shrink-0 mt-0.5 shadow-sm" />
                  <div>
                    <h4
                      className={`text-sm font-bold ${t.cardText} font-spartan mb-1`}
                    >
                      NEW/ACTIVE
                    </h4>
                    <p
                      className={`text-xs ${t.subtleText} font-kumbh leading-relaxed`}
                    >
                      Issue recently reported and awaiting dispatch.
                    </p>
                  </div>
                </div>

                {/* IN-PROGRESS */}
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-400 flex-shrink-0 mt-0.5 shadow-sm" />
                  <div>
                    <h4
                      className={`text-sm font-bold ${t.cardText} font-spartan mb-1`}
                    >
                      IN-PROGRESS
                    </h4>
                    <p
                      className={`text-xs ${t.subtleText} font-kumbh leading-relaxed`}
                    >
                      Barangay officials or maintenance teams are on-site.
                    </p>
                  </div>
                </div>

                {/* RESOLVED */}
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex-shrink-0 mt-0.5 shadow-sm" />
                  <div>
                    <h4
                      className={`text-sm font-bold ${t.cardText} font-spartan mb-1`}
                    >
                      RESOLVED
                    </h4>
                    <p
                      className={`text-xs ${t.subtleText} font-kumbh leading-relaxed`}
                    >
                      Issue has been cleared or fixed (displayed for the last 24
                      hours).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="mb-8">
            <div
              className={`${t.cardBg} border ${t.cardBorder} rounded-2xl overflow-hidden shadow-xl`}
            >
              <div style={{ height: "520px" }}>
                <MapContainer
                  center={MAP_CENTER}
                  zoom={MAP_ZOOM}
                  scrollWheelZoom={true}
                  style={{ height: "100%", width: "100%" }}
                  className="z-0"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Zone polygons */}
                  {ZONE_DATA.map((zone) => {
                    const colors = STATUS_COLORS[zone.status];
                    return (
                      <Polygon
                        key={zone.id}
                        positions={zone.positions}
                        pathOptions={{
                          color: colors.stroke,
                          fillColor: colors.fill,
                          fillOpacity: colors.fillOpacity,
                          weight: 2,
                        }}
                      >
                        <Popup>
                          <div className="font-kumbh">
                            <p className="font-bold text-sm mb-1">
                              {zone.name}
                            </p>
                            <p className="text-xs text-slate-600">
                              Status:{" "}
                              <span
                                className="font-semibold capitalize"
                                style={{ color: colors.marker }}
                              >
                                {zone.status === "in-progress"
                                  ? "In-Progress"
                                  : zone.status === "active"
                                    ? "New / Active"
                                    : "Resolved"}
                              </span>
                            </p>
                            <p className="text-xs text-slate-600">
                              Reported incidents: {zone.incidents}
                            </p>
                          </div>
                        </Popup>
                      </Polygon>
                    );
                  })}

                  {/* Incident markers */}
                  {INCIDENT_MARKERS.map((marker) => {
                    const colors = STATUS_COLORS[marker.status];
                    return (
                      <CircleMarker
                        key={marker.id}
                        center={[marker.lat, marker.lng]}
                        radius={7}
                        pathOptions={{
                          color: "#fff",
                          fillColor: colors.marker,
                          fillOpacity: 1,
                          weight: 2,
                        }}
                      >
                        <Popup>
                          <div className="font-kumbh">
                            <p className="font-bold text-sm mb-1">
                              {marker.title}
                            </p>
                            <p className="text-xs text-slate-500">
                              {marker.date}
                            </p>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })}
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className={`pt-6 mt-8 border-t ${t.dividerBorder} text-center`}>
            <p className={`text-sm ${t.subtleText} font-kumbh`}>
              © {new Date().getFullYear()} Barangay Incident & Complaint Management System. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default IncidentMapPage;
