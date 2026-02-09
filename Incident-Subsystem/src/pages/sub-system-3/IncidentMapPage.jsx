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
    name: "Northern San Bartolome — Near Novaliches Proper",
    status: "active",
    incidents: 12,
    positions: [
      [14.7140, 121.0230],
      [14.7155, 121.0260],
      [14.7145, 121.0290],
      [14.7110, 121.0305],
      [14.7100, 121.0270],
      [14.7110, 121.0230],
    ],
  },
  {
    id: "zone-progress-1",
    name: "Central San Bartolome — Near SM Novaliches",
    status: "in-progress",
    incidents: 7,
    positions: [
      [14.7080, 121.0260],
      [14.7090, 121.0340],
      [14.7070, 121.0395],
      [14.7040, 121.0410],
      [14.7010, 121.0360],
      [14.7020, 121.0290],
      [14.7040, 121.0240],
    ],
  },
  {
    id: "zone-resolved-1",
    name: "Eastern San Bartolome — Near Gulod",
    status: "resolved",
    incidents: 4,
    positions: [
      [14.7040, 121.0410],
      [14.7045, 121.0450],
      [14.7020, 121.0470],
      [14.6995, 121.0430],
      [14.6990, 121.0380],
      [14.7010, 121.0360],
    ],
  },
];

// ── Sample incident markers ────────────────────────────────────────────
const INCIDENT_MARKERS = [
  {
    id: 1,
    lat: 14.7135,
    lng: 121.025,
    status: "active",
    title: "Illegal Parking — Quirino Highway",
    date: "2026-02-07",
  },
  {
    id: 2,
    lat: 14.712,
    lng: 121.028,
    status: "active",
    title: "Road Obstruction — Mindanao Ave Extension",
    date: "2026-02-07",
  },
  {
    id: 3,
    lat: 14.706,
    lng: 121.03,
    status: "active",
    title: "Street Flooding — Purok 3",
    date: "2026-02-06",
  },
  {
    id: 4,
    lat: 14.705,
    lng: 121.035,
    status: "in-progress",
    title: "Clogged Sewer — San Bartolome Proper",
    date: "2026-02-06",
  },
  {
    id: 5,
    lat: 14.703,
    lng: 121.039,
    status: "in-progress",
    title: "Stray Dogs — Near SM City Novaliches",
    date: "2026-02-05",
  },
  {
    id: 6,
    lat: 14.7065,
    lng: 121.037,
    status: "in-progress",
    title: "Broken Street Light — Katipunan Ave",
    date: "2026-02-05",
  },
  {
    id: 7,
    lat: 14.7035,
    lng: 121.044,
    status: "resolved",
    title: "Illegal Dumping — Near Bagbag Creek",
    date: "2026-02-04",
  },
  {
    id: 8,
    lat: 14.701,
    lng: 121.042,
    status: "resolved",
    title: "Standing Water — Near Sauyo Road",
    date: "2026-02-04",
  },
  {
    id: 9,
    lat: 14.702,
    lng: 121.046,
    status: "resolved",
    title: "Noise Complaint — Gulod Area",
    date: "2026-02-03",
  },
  {
    id: 10,
    lat: 14.7145,
    lng: 121.0265,
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

// Map center & bounds: Barangay San Bartolome, Novaliches, QC (OSM relation 271002)
const MAP_CENTER = [14.708, 121.033];
const MAP_ZOOM = 14;
const MAP_MIN_ZOOM = 13;
const MAP_MAX_ZOOM = 18;
const MAP_BOUNDS = [
  [14.694, 121.012], // Southwest corner (with padding)
  [14.722, 121.054], // Northeast corner (with padding)
];

// ── Barangay San Bartolome boundary polygon (from OpenStreetMap) ────────
const BARANGAY_BOUNDARY = [
  [14.7105, 121.0175],
  [14.7096, 121.0177],
  [14.7082, 121.0185],
  [14.7072, 121.0187],
  [14.7067, 121.0188],
  [14.7058, 121.0184],
  [14.7053, 121.0180],
  [14.7047, 121.0176],
  [14.7043, 121.0177],
  [14.7040, 121.0178],
  [14.7037, 121.0179],
  [14.7034, 121.0180],
  [14.7036, 121.0185],
  [14.7036, 121.0199],
  [14.7037, 121.0205],
  [14.7039, 121.0210],
  [14.7038, 121.0221],
  [14.7031, 121.0224],
  [14.7024, 121.0227],
  [14.7023, 121.0236],
  [14.7023, 121.0245],
  [14.7023, 121.0251],
  [14.7023, 121.0260],
  [14.7018, 121.0263],
  [14.7011, 121.0270],
  [14.7007, 121.0271],
  [14.7003, 121.0276],
  [14.7003, 121.0283],
  [14.6991, 121.0289],
  [14.6992, 121.0295],
  [14.6990, 121.0305],
  [14.6994, 121.0314],
  [14.6993, 121.0317],
  [14.6994, 121.0322],
  [14.6993, 121.0325],
  [14.6996, 121.0325],
  [14.6997, 121.0327],
  [14.6998, 121.0331],
  [14.6998, 121.0337],
  [14.6998, 121.0345],
  [14.6997, 121.0348],
  [14.6996, 121.0354],
  [14.6995, 121.0356],
  [14.6992, 121.0358],
  [14.6993, 121.0366],
  [14.6994, 121.0371],
  [14.6995, 121.0374],
  [14.6996, 121.0380],
  [14.6997, 121.0387],
  [14.6995, 121.0393],
  [14.6994, 121.0398],
  [14.6996, 121.0399],
  [14.6999, 121.0408],
  [14.6998, 121.0410],
  [14.6998, 121.0414],
  [14.6994, 121.0415],
  [14.6993, 121.0416],
  [14.6991, 121.0417],
  [14.6989, 121.0419],
  [14.6986, 121.0421],
  [14.6987, 121.0423],
  [14.6986, 121.0427],
  [14.6986, 121.0433],
  [14.6986, 121.0436],
  [14.6992, 121.0442],
  [14.6995, 121.0441],
  [14.6997, 121.0447],
  [14.6998, 121.0446],
  [14.7006, 121.0461],
  [14.7005, 121.0463],
  [14.7002, 121.0467],
  [14.7002, 121.0468],
  [14.7001, 121.0469],
  [14.7000, 121.0470],
  [14.7000, 121.0470],
  [14.6996, 121.0474],
  [14.6996, 121.0478],
  [14.6997, 121.0479],
  [14.6997, 121.0478],
  [14.7000, 121.0482],
  [14.7001, 121.0483],
  [14.7003, 121.0482],
  [14.7003, 121.0482],
  [14.7005, 121.0481],
  [14.7009, 121.0480],
  [14.7016, 121.0475],
  [14.7017, 121.0475],
  [14.7019, 121.0474],
  [14.7021, 121.0473],
  [14.7021, 121.0473],
  [14.7024, 121.0474],
  [14.7024, 121.0477],
  [14.7025, 121.0479],
  [14.7032, 121.0475],
  [14.7033, 121.0469],
  [14.7041, 121.0468],
  [14.7046, 121.0455],
  [14.7053, 121.0455],
  [14.7053, 121.0440],
  [14.7052, 121.0420],
  [14.7058, 121.0418],
  [14.7067, 121.0415],
  [14.7075, 121.0415],
  [14.7081, 121.0402],
  [14.7081, 121.0401],
  [14.7080, 121.0396],
  [14.7084, 121.0389],
  [14.7084, 121.0388],
  [14.7086, 121.0388],
  [14.7090, 121.0384],
  [14.7091, 121.0385],
  [14.7093, 121.0385],
  [14.7095, 121.0382],
  [14.7094, 121.0376],
  [14.7092, 121.0373],
  [14.7091, 121.0370],
  [14.7089, 121.0367],
  [14.7090, 121.0366],
  [14.7092, 121.0364],
  [14.7093, 121.0364],
  [14.7094, 121.0363],
  [14.7094, 121.0351],
  [14.7095, 121.0346],
  [14.7095, 121.0340],
  [14.7098, 121.0338],
  [14.7102, 121.0336],
  [14.7105, 121.0332],
  [14.7106, 121.0332],
  [14.7107, 121.0329],
  [14.7108, 121.0326],
  [14.7108, 121.0321],
  [14.7107, 121.0316],
  [14.7105, 121.0312],
  [14.7104, 121.0311],
  [14.7105, 121.0309],
  [14.7106, 121.0309],
  [14.7107, 121.0309],
  [14.7108, 121.0308],
  [14.7110, 121.0308],
  [14.7115, 121.0308],
  [14.7120, 121.0304],
  [14.7122, 121.0303],
  [14.7123, 121.0302],
  [14.7125, 121.0301],
  [14.7127, 121.0301],
  [14.7129, 121.0301],
  [14.7131, 121.0301],
  [14.7135, 121.0299],
  [14.7142, 121.0295],
  [14.7144, 121.0293],
  [14.7148, 121.0293],
  [14.7154, 121.0292],
  [14.7156, 121.0290],
  [14.7157, 121.0287],
  [14.7158, 121.0283],
  [14.7158, 121.0281],
  [14.7158, 121.0279],
  [14.7162, 121.0271],
  [14.7163, 121.0266],
  [14.7166, 121.0263],
  [14.7166, 121.0263],
  [14.7168, 121.0258],
  [14.7169, 121.0253],
  [14.7169, 121.0251],
  [14.7168, 121.0251],
  [14.7167, 121.0249],
  [14.7165, 121.0247],
  [14.7164, 121.0245],
  [14.7164, 121.0244],
  [14.7164, 121.0240],
  [14.7165, 121.0238],
  [14.7166, 121.0236],
  [14.7166, 121.0234],
  [14.7164, 121.0233],
  [14.7163, 121.0232],
  [14.7162, 121.0231],
  [14.7160, 121.0227],
  [14.7158, 121.0222],
  [14.7157, 121.0222],
  [14.7156, 121.0220],
  [14.7154, 121.0219],
  [14.7152, 121.0219],
  [14.7148, 121.0218],
  [14.7144, 121.0218],
  [14.7141, 121.0218],
  [14.7139, 121.0216],
  [14.7135, 121.0215],
  [14.7129, 121.0214],
  [14.7128, 121.0213],
  [14.7127, 121.0213],
  [14.7125, 121.0210],
  [14.7121, 121.0208],
  [14.7121, 121.0203],
  [14.7120, 121.0200],
  [14.7121, 121.0199],
  [14.7122, 121.0197],
  [14.7122, 121.0196],
  [14.7124, 121.0194],
  [14.7124, 121.0192],
  [14.7124, 121.0189],
  [14.7124, 121.0187],
  [14.7124, 121.0187],
  [14.7123, 121.0185],
  [14.7120, 121.0182],
  [14.7119, 121.0180],
  [14.7115, 121.0179],
  [14.7112, 121.0177],
  [14.7109, 121.0176],
  [14.7105, 121.0175],
];

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
        <div id="main-content" className="flex-1 container mx-auto px-4 sm:px-6 py-8 sm:py-12">
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
                  minZoom={MAP_MIN_ZOOM}
                  maxZoom={MAP_MAX_ZOOM}
                  maxBounds={MAP_BOUNDS}
                  maxBoundsViscosity={1.0}
                  scrollWheelZoom={true}
                  style={{ height: "100%", width: "100%" }}
                  className="z-0"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Barangay boundary outline */}
                  <Polygon
                    positions={BARANGAY_BOUNDARY}
                    pathOptions={{
                      color: "#1d4ed8",
                      fillColor: "#3b82f6",
                      fillOpacity: 0.05,
                      weight: 3,
                      dashArray: "8 4",
                    }}
                  >
                    <Popup>
                      <div className="font-kumbh">
                        <p className="font-bold text-sm mb-1">
                          Barangay San Bartolome
                        </p>
                        <p className="text-xs text-slate-600">
                          Novaliches, Quezon City
                        </p>
                      </div>
                    </Popup>
                  </Polygon>

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
