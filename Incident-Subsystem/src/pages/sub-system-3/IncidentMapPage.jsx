import React, { useState, useEffect, useCallback } from "react";
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
import { incidentService } from "../../services/sub-system-3/incidentService";
import { getMyComplaints } from "../../services/sub-system-3/complaintService";

// Check if point is inside polygon (ray-casting algorithm)
const isPointInPolygon = (point, polygon) => {
  let inside = false;
  const x = point[0];
  const y = point[1];
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

// ── Sample zone polygons for Barangay Gulod, Novaliches ─────────
const ZONE_DATA = [
  {
    id: "zone-active-1",
    name: "Northern Gulod — Near Quirino Highway",
    status: "active",
    incidents: 12,
    positions: [
      [14.7170, 121.0390],
      [14.7185, 121.0410],
      [14.7185, 121.0430],
      [14.7165, 121.0440],
      [14.7150, 121.0430],
      [14.7155, 121.0400],
    ],
  },
  {
    id: "zone-progress-1",
    name: "Central Gulod — Near Barangay Hall",
    status: "in-progress",
    incidents: 7,
    positions: [
      [14.7100, 121.0340],
      [14.7105, 121.0370],
      [14.7095, 121.0400],
      [14.7075, 121.0415],
      [14.7060, 121.0400],
      [14.7070, 121.0360],
      [14.7085, 121.0340],
    ],
  },
  {
    id: "zone-resolved-1",
    name: "Southern Gulod — Near Geneva Gardens",
    status: "resolved",
    incidents: 4,
    positions: [
      [14.7060, 121.0420],
      [14.7055, 121.0455],
      [14.7070, 121.0470],
      [14.7090, 121.0465],
      [14.7095, 121.0445],
      [14.7075, 121.0420],
    ],
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

// ── Normalize backend status → map color key ────────────────────────────
const normalizeMapStatus = (status) => {
  if (!status) return "active";
  const s = status.toLowerCase().replace(/\s/g, "_");
  if (s === "pending") return "active";
  if (s === "in_progress" || s === "ongoing") return "in-progress";
  if (
    s === "resolved" || s === "completed" || s === "closed" ||
    s === "rejected" || s === "dismissed" || s === "denied"
  ) return "resolved";
  return "active";
};

// ── Extract a readable title from an incident record ────────────────────
const getIncidentTitle = (item) => {
  if (Array.isArray(item.types) && item.types.length > 0) {
    return item.types.map((t) => t.name).join(", ");
  }
  if (item.type) {
    try {
      const parsed = JSON.parse(item.type);
      return Array.isArray(parsed) ? parsed.join(", ") : String(parsed);
    } catch {
      return item.type;
    }
  }
  return "Incident";
};

// Map center & bounds: Barangay Gulod, Novaliches, QC (OSM Relation 270990)
const MAP_CENTER = [14.7118, 121.0404];
const MAP_ZOOM = 15;
const MAP_MIN_ZOOM = 13;
const MAP_MAX_ZOOM = 18;
const MAP_BOUNDS = [
  [14.7020, 121.0310], // Southwest corner (with padding)
  [14.7215, 121.0500], // Northeast corner (with padding)
];

// ── Barangay Gulod boundary polygon (from OpenStreetMap Relation 270990) ─
const BARANGAY_BOUNDARY = [
  [14.710492, 121.0335323],
  [14.7101886, 121.033562],
  [14.709774, 121.0338342],
  [14.7095436, 121.0339713],
  [14.7094757, 121.0345597],
  [14.7094277, 121.0350814],
  [14.7093446, 121.0362553],
  [14.7092669, 121.0363582],
  [14.709162, 121.0364442],
  [14.7089794, 121.0366244],
  [14.7089056, 121.036688],
  [14.7091458, 121.03699],
  [14.7091637, 121.0372903],
  [14.709336, 121.0375888],
  [14.7094565, 121.0382147],
  [14.709263, 121.0384845],
  [14.7091378, 121.03848],
  [14.7090308, 121.0384375],
  [14.708583, 121.0387608],
  [14.7084187, 121.0387662],
  [14.7083563, 121.0389081],
  [14.7080226, 121.0396347],
  [14.7080861, 121.0400809],
  [14.7080705, 121.0401844],
  [14.7075016, 121.0415248],
  [14.7066561, 121.0415217],
  [14.7058151, 121.0418078],
  [14.7052453, 121.0419812],
  [14.7052824, 121.0440479],
  [14.7052707, 121.0454888],
  [14.704594, 121.0455003],
  [14.7050443, 121.0468975],
  [14.7053168, 121.0474573],
  [14.7061441, 121.0472436],
  [14.7061633, 121.0472437],
  [14.7063696, 121.0471759],
  [14.7070541, 121.047172],
  [14.7074933, 121.0468812],
  [14.7079836, 121.0468267],
  [14.7084147, 121.0467387],
  [14.7087975, 121.0466027],
  [14.7088616, 121.0465728],
  [14.708988, 121.0465237],
  [14.7090729, 121.0465472],
  [14.7091216, 121.0466418],
  [14.7091885, 121.0467319],
  [14.7093433, 121.0467944],
  [14.709431, 121.0467645],
  [14.7095276, 121.0466762],
  [14.709637, 121.0464922],
  [14.7097706, 121.0459681],
  [14.7098262, 121.0459465],
  [14.7099749, 121.0459745],
  [14.7100253, 121.0459659],
  [14.7100798, 121.0460252],
  [14.7102054, 121.045984],
  [14.7104115, 121.0460574],
  [14.7105981, 121.046219],
  [14.7107014, 121.046361],
  [14.7109051, 121.0467486],
  [14.7110597, 121.0469001],
  [14.7112651, 121.0470558],
  [14.7113701, 121.0470603],
  [14.7118121, 121.0468657],
  [14.7120473, 121.04668],
  [14.7122458, 121.0463628],
  [14.7125295, 121.0461321],
  [14.712751, 121.0459071],
  [14.7128774, 121.04565],
  [14.7129189, 121.0452638],
  [14.7128681, 121.0449875],
  [14.7126643, 121.0446371],
  [14.7125356, 121.0444294],
  [14.7122657, 121.0441094],
  [14.7119655, 121.0436705],
  [14.7119718, 121.0434184],
  [14.7120946, 121.0432508],
  [14.7122324, 121.0431034],
  [14.7123962, 121.0429966],
  [14.7125755, 121.0429383],
  [14.7127791, 121.0429079],
  [14.7130402, 121.0429966],
  [14.7133731, 121.0431543],
  [14.7135, 121.0432095],
  [14.7136163, 121.0432103],
  [14.7139198, 121.0430658],
  [14.7146356, 121.0428879],
  [14.7148887, 121.0428612],
  [14.7150544, 121.0429258],
  [14.7151967, 121.0430697],
  [14.7154815, 121.0434241],
  [14.7157166, 121.0438905],
  [14.7158245, 121.0442338],
  [14.7159932, 121.0443492],
  [14.7161024, 121.0443099],
  [14.7162898, 121.0441341],
  [14.7165224, 121.0440041],
  [14.7173538, 121.0438154],
  [14.717601, 121.0437188],
  [14.7178396, 121.0436498],
  [14.7184845, 121.0434931],
  [14.7185908, 121.0434293],
  [14.7186606, 121.0433855],
  [14.718696, 121.0433491],
  [14.7187068, 121.0432445],
  [14.7186606, 121.0430669],
  [14.7184907, 121.0427013],
  [14.7184298, 121.042527],
  [14.7183594, 121.0421883],
  [14.7183753, 121.0420877],
  [14.7185368, 121.0418588],
  [14.7186873, 121.0416664],
  [14.7188422, 121.0414534],
  [14.7190733, 121.0411207],
  [14.7190759, 121.0409713],
  [14.7188598, 121.0404672],
  [14.7187086, 121.0401682],
  [14.7184233, 121.039773],
  [14.7176617, 121.0391703],
  [14.7175646, 121.0390905],
  [14.7174147, 121.0389286],
  [14.7173238, 121.0388499],
  [14.7172294, 121.0387788],
  [14.7171469, 121.0387494],
  [14.7170159, 121.0387334],
  [14.7168797, 121.0387279],
  [14.7167954, 121.0387239],
  [14.7167398, 121.0386924],
  [14.7166645, 121.0386199],
  [14.7164802, 121.0383958],
  [14.7159739, 121.0374912],
  [14.7159302, 121.0374116],
  [14.7159069, 121.0373821],
  [14.7158693, 121.0373667],
  [14.7158368, 121.0373533],
  [14.7157973, 121.0373462],
  [14.7157255, 121.0373377],
  [14.715513, 121.0373544],
  [14.7153563, 121.0373727],
  [14.7152856, 121.0373694],
  [14.7152214, 121.0373586],
  [14.7151652, 121.0373378],
  [14.71503, 121.0372433],
  [14.7148582, 121.0370918],
  [14.7146629, 121.0369087],
  [14.7146156, 121.0368524],
  [14.7145884, 121.0368115],
  [14.7145735, 121.0367752],
  [14.7145637, 121.0367116],
  [14.7145624, 121.0366505],
  [14.7145683, 121.0365533],
  [14.714615, 121.0361651],
  [14.7146798, 121.0357641],
  [14.7147687, 121.0351744],
  [14.7147602, 121.0351244],
  [14.7147391, 121.0350697],
  [14.7146952, 121.035004],
  [14.7145509, 121.0348887],
  [14.7140667, 121.0344099],
  [14.7138862, 121.0342536],
  [14.7136913, 121.0341839],
  [14.7135132, 121.0341969],
  [14.7133827, 121.0342312],
  [14.7132461, 121.0342965],
  [14.7130565, 121.0344816],
  [14.7129008, 121.0345607],
  [14.7127621, 121.0345812],
  [14.712633, 121.0345279],
  [14.7122626, 121.0341479],
  [14.712102, 121.0339345],
  [14.7118143, 121.0335527],
  [14.711682, 121.0334848],
  [14.7115454, 121.0334957],
  [14.7114846, 121.0335308],
  [14.7114333, 121.0335862],
  [14.7112641, 121.0337882],
  [14.7111092, 121.0339523],
  [14.7109148, 121.0340751],
  [14.7108099, 121.0341028],
  [14.7106753, 121.0340604],
  [14.7105621, 121.0339774],
  [14.7105114, 121.0338543],
  [14.7104859, 121.0336751],
];

const IncidentMapPage = () => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem("appTheme") || "blue";
  });
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // ── Fetch the user's own incidents and complaints for the map ──────────
  const fetchMarkers = useCallback(async () => {
    setLoading(true);
    try {
      const [incData, compData] = await Promise.all([
        incidentService.getMyIncidents(),
        getMyComplaints(),
      ]);

      const incArray = Array.isArray(incData) ? incData : incData.data || [];
      const compArray = Array.isArray(compData) ? compData : compData.data || [];

      const incMarkers = incArray
        .filter((i) => i.latitude && i.longitude)
        .map((i) => ({
          id: `inc-${i.id}`,
          lat: parseFloat(i.latitude),
          lng: parseFloat(i.longitude),
          status: normalizeMapStatus(i.status),
          title: getIncidentTitle(i),
          description: i.description || "",
          date: i.created_at?.split("T")[0] || "",
          source: "Incident",
        }));

      const compMarkers = compArray
        .filter((c) => c.latitude && c.longitude)
        .map((c) => ({
          id: `comp-${c.id}`,
          lat: parseFloat(c.latitude),
          lng: parseFloat(c.longitude),
          status: normalizeMapStatus(c.status),
          title: c.type || "Complaint",
          description: c.description || "",
          date: c.incident_date?.split("T")[0] || c.created_at?.split("T")[0] || "",
          source: "Complaint",
        }));

      setMarkers([...incMarkers, ...compMarkers]);
    } catch (err) {
      console.error("Failed to load map markers:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarkers();
  }, [fetchMarkers]);

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
                    See all the incidents and complaints you have filed, plotted
                    directly on the Barangay Gulod map. Each pin reflects the
                    current status of your report — <span className="font-semibold text-red-500">red</span> for newly
                    submitted, <span className="font-semibold text-orange-400">orange</span> for in-progress, and{" "}
                    <span className="font-semibold text-emerald-500">green</span> for resolved. Click any pin to
                    view the report title, description, and date filed.
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
              <div style={{ height: "520px" }} className="relative">
                {/* Loading overlay */}
                {loading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm">
                    <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full mb-3" />
                    <p className="text-sm font-kumbh text-slate-600">Loading your reports…</p>
                  </div>
                )}

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
                          Barangay Gulod
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

                  {/* Live markers for the user's filed incidents and complaints */}
                  {markers.map((marker) => {
                    const colors = STATUS_COLORS[marker.status] || STATUS_COLORS.active;
                    return (
                      <CircleMarker
                        key={marker.id}
                        center={[marker.lat, marker.lng]}
                        radius={8}
                        pathOptions={{
                          color: "#fff",
                          fillColor: colors.marker,
                          fillOpacity: 1,
                          weight: 2,
                        }}
                      >
                        <Popup>
                          <div className="font-kumbh" style={{ minWidth: "160px" }}>
                            <p
                              className="text-xs font-bold uppercase mb-1"
                              style={{ color: colors.marker }}
                            >
                              {marker.source}
                            </p>
                            <p className="font-bold text-sm mb-1">{marker.title}</p>
                            {marker.description && (
                              <p className="text-xs text-slate-600 mb-1" style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}>
                                {marker.description}
                              </p>
                            )}
                            <p className="text-xs text-slate-500">{marker.date}</p>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })}
                </MapContainer>
              </div>

              {/* No location data notice */}
              {!loading && markers.length === 0 && (
                <p className="text-center text-sm font-kumbh text-slate-500 mt-3">
                  None of your submitted reports include location data, so no pins are shown.
                </p>
              )}
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
