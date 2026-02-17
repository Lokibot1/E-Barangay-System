import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  CircleMarker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import themeTokens from "../../../Themetokens";
import AdminReportDetailsModal from "../../../components/sub-system-3/AdminReportDetailsModal";
import InsightsModal from "../../../components/sub-system-3/InsightsModal";
import Toast from "../../../components/shared/modals/Toast";
import { incidentService } from "../../../services/sub-system-3/incidentService";
import { getAllComplaints } from "../../../services/sub-system-3/complaintService";
import { useRealTime } from "../../../context/RealTimeContext";

// ── Barangay Gulod boundary (OSM Relation 270990) ──────────────────────
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

const MAP_CENTER = [14.7118, 121.0404];

// Point-in-polygon check
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

// ── Helpers to normalize API responses into the shape the UI expects ───
const parseIncidentTypes = (types) => {
  if (!types || !Array.isArray(types) || types.length === 0) return "Other";
  return types.map((t) => t.name).join(", ");
};

const normalizeIncident = (item) => ({
  id: String(item.id),
  type: parseIncidentTypes(item.types),
  details: item.description || "",
  description: item.additional_notes || item.description || "",
  date: (item.created_at || "").split("T")[0],
  lastUpdated: item.updated_at || item.created_at || "",
  reportedBy: item.user
    ? `${item.user.last_name || ""}, ${item.user.first_name || ""} ${item.user.middle_name ? item.user.middle_name.charAt(0) + "." : ""}`.toUpperCase()
    : item.reported_by
      ? item.reported_by.toUpperCase()
      : "UNKNOWN",
  status: (item.status || "pending").toLowerCase(),
  lat: parseFloat(item.latitude) || 0,
  lng: parseFloat(item.longitude) || 0,
  address: item.location || "",
  plusCode: "",
  photos: item.evidence ? [item.evidence] : [],
  updates: [],
});

const normalizeComplaint = (item) => ({
  id: String(item.id),
  type: COMPLAINT_TYPE_MAP[(item.type || "").toLowerCase()] || "Other",
  details: item.description || "",
  description: item.additional_notes || item.description || "",
  date: item.incident_date || (item.created_at || "").split("T")[0],
  lastUpdated: item.updated_at || item.created_at || "",
  reportedBy: item.user
    ? `${item.user.last_name || ""}, ${item.user.first_name || ""} ${item.user.middle_name ? item.user.middle_name.charAt(0) + "." : ""}`.toUpperCase()
    : item.complainant_name
      ? item.complainant_name.toUpperCase()
      : "UNKNOWN",
  status: (item.status || "pending").toLowerCase(),
  lat: parseFloat(item.latitude) || 0,
  lng: parseFloat(item.longitude) || 0,
  address: item.location || "",
  plusCode: "",
  photos: item.evidence ? [item.evidence] : [],
  updates: [],
});

// ── Status config ──────────────────────────────────────────────────────
const STATUS_CONFIG = {
  all: {
    label: "ALL",
    color: "#374151",
    bg: "bg-gray-700",
    tabBg: "bg-gray-700",
    tabText: "text-white",
    tabBorder: "border-gray-700",
  },
  pending: {
    label: "NEW (PENDING)",
    color: "#dc2626",
    bg: "bg-red-600",
    tabBg: "bg-red-600",
    tabText: "text-white",
    tabBorder: "border-red-600",
  },
  dispatched: {
    label: "DISPATCHED",
    color: "#f59e0b",
    bg: "bg-amber-400",
    tabBg: "bg-amber-500",
    tabText: "text-white",
    tabBorder: "border-amber-500",
  },
  active: {
    label: "ON-SITE (ACTIVE)",
    color: "#2563eb",
    bg: "bg-blue-600",
    tabBg: "bg-blue-600",
    tabText: "text-white",
    tabBorder: "border-blue-600",
  },
  resolved: {
    label: "RESOLVED",
    color: "#16a34a",
    bg: "bg-green-500",
    tabBg: "bg-green-600",
    tabText: "text-white",
    tabBorder: "border-green-600",
  },
  rejected: {
    label: "REJECTED",
    color: "#6b7280",
    bg: "bg-gray-500",
    tabBg: "bg-gray-500",
    tabText: "text-white",
    tabBorder: "border-gray-500",
  },
};

const INCIDENT_TYPES = [
  "All Types",
  "Traffic & Parking",
  "Waste Management",
  "Roads & Infrastructure",
  "Draining & Flooding",
  "Pollution",
  "Stray Animals",
];

const COMPLAINT_TYPES = [
  "All Types",
  "Noise",
  "Property",
  "Harassment",
  "Trespassing",
  "Parking",
  "Garbage",
  "Boundary",
  "Unpaid",
  "Other",
];

const COMPLAINT_TYPE_MAP = {
  noise: "Noise",
  property: "Property",
  harassment: "Harassment",
  trespassing: "Trespassing",
  parking: "Parking",
  garbage: "Garbage",
  boundary: "Boundary",
  unpaid: "Unpaid",
  other: "Other",
};

// ── Memoized table row ─────────────────────────────────────────────────
const TableRow = memo(
  ({ inc, index, currentPage, ROWS_PER_PAGE, onClick, t, isDark }) => (
    <tr
      onClick={() => onClick(inc)}
      className={`border-b ${t.cardBorder} ${isDark ? "hover:bg-slate-600" : "hover:bg-gray-50"} transition-colors cursor-pointer`}
    >
      <td className={`text-center px-3 py-3 ${t.cardText}`}>
        {(currentPage - 1) * ROWS_PER_PAGE + index + 1}
      </td>
      <td
        className={`text-left px-4 py-3 ${t.cardText} truncate capitalize`}
      >
        {inc.type}
      </td>
      <td className={`text-left px-4 py-3 ${t.cardText} whitespace-nowrap`}>
        {new Date(inc.date).toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        })}
      </td>
      <td className={`text-left px-4 py-3 ${t.cardText} truncate`}>
        {inc.reportedBy}
      </td>
      <td className={`text-left px-4 py-3 font-bold ${t.cardText}`}>
        {inc.id}
      </td>
    </tr>
  ),
);

// ════════════════════════════════════════════════════════════════════════
const AdminIncidentReports = () => {
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("appTheme") || "blue",
  );

  useEffect(() => {
    const handler = (e) => setCurrentTheme(e.detail);
    window.addEventListener("themeChange", handler);
    return () => window.removeEventListener("themeChange", handler);
  }, []);

  const t = themeTokens[currentTheme] || themeTokens.blue;
  const isDark = currentTheme === "dark";

  // ── Page tab state (Incidents vs Complaints) ───────────────────────
  const [pageTab, setPageTab] = useState("incidents");

  // ── API data state ────────────────────────────────────────────────
  const [incidents, setIncidents] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [incData, compData] = await Promise.all([
        incidentService.getAllIncidents(),
        getAllComplaints(),
      ]);
      const incArray = Array.isArray(incData) ? incData : incData.data || [];
      const compArray = Array.isArray(compData) ? compData : compData.data || [];
      console.log("[DEBUG] Raw complaint data sample:", compArray[0]);
      console.log("[DEBUG] Raw complaint fields:", compArray[0] ? Object.keys(compArray[0]) : "no data");
      console.log("[DEBUG] Raw incident data sample:", incArray[0]);
      setIncidents(incArray.map(normalizeIncident));
      const normalizedComplaints = compArray.map(normalizeComplaint);
      console.log("[DEBUG] Normalized complaint sample:", normalizedComplaints[0]);
      console.log("[DEBUG] Complaint count:", normalizedComplaints.length);
      console.log("[DEBUG] Complaints with valid coords:", normalizedComplaints.filter(c => c.lat && c.lng).length);
      setComplaints(normalizedComplaints);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Real-time: auto-refresh when new events arrive ────────────────────
  const { latestBatch, eventVersion } = useRealTime();
  const [toasts, setToasts] = useState([]);
  const prevEventVersionRef = useRef(0);

  useEffect(() => {
    // Only fire when eventVersion actually increments (new batch arrived)
    if (eventVersion === 0 || eventVersion === prevEventVersionRef.current)
      return;
    prevEventVersionRef.current = eventVersion;

    fetchData();

    if (latestBatch.length > 0) {
      const latestEvent = latestBatch[0];
      setToasts((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "success",
          title: `New ${latestEvent.source === "incident" ? "Incident" : "Complaint"} Received`,
          message: `${latestBatch.length} new report(s) detected. Table refreshed.`,
          duration: 4000,
        },
      ]);
    }
  }, [eventVersion, latestBatch, fetchData]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Modal state ─────────────────────────────────────────────────────
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showKebab, setShowKebab] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const kebabRef = useRef(null);

  // Close kebab on outside click
  useEffect(() => {
    if (!showKebab) return;
    const handler = (e) => {
      if (kebabRef.current && !kebabRef.current.contains(e.target)) setShowKebab(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showKebab]);

  // ── Filter state ───────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 10;

  // ── Map legend filter state ────────────────────────────────────────
  const [mapType, setMapType] = useState("All Types");
  const [mapStartDate, setMapStartDate] = useState("");
  const [mapEndDate, setMapEndDate] = useState("");
  const [visibleStatuses, setVisibleStatuses] = useState({
    resolved: true,
    dispatched: true,
    active: true,
    pending: true,
    rejected: true,
  });

  const toggleStatus = (status) => {
    setVisibleStatuses((prev) => ({ ...prev, [status]: !prev[status] }));
  };

  // ── Dynamic data source based on page tab ─────────────────────────
  const dataSource = pageTab === "incidents" ? incidents : complaints;
  const typeOptions = pageTab === "incidents" ? INCIDENT_TYPES : COMPLAINT_TYPES;

  // Reset filters when switching page tabs
  useEffect(() => {
    setActiveTab("all");
    setSearchQuery("");
    setCurrentPage(1);
    setMapType("All Types");
  }, [pageTab]);

  // ── Filtered data for table ────────────────────────────────────────
  const filteredTableData = useMemo(() => {
    return dataSource.filter((inc) => {
      if (activeTab !== "all" && inc.status !== activeTab) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          (inc.type || "").toLowerCase().includes(q) ||
          (inc.details || "").toLowerCase().includes(q) ||
          (inc.reportedBy || "").toLowerCase().includes(q) ||
          String(inc.id).toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      if (startDate && inc.date < startDate) return false;
      if (endDate && inc.date > endDate) return false;
      return true;
    });
  }, [activeTab, searchQuery, startDate, endDate, dataSource]);

  // ── Pagination ─────────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredTableData.length / ROWS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredTableData.slice(start, start + ROWS_PER_PAGE);
  }, [filteredTableData, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, startDate, endDate, dataSource]);

  // ── Filtered data for map ──────────────────────────────────────────
  const filteredMapData = useMemo(() => {
    return dataSource.filter((inc) => {
      // For known statuses, respect the toggle; for unknown statuses, show by default
      if (visibleStatuses[inc.status] === false) return false;
      if (mapType !== "All Types" && inc.type !== mapType) return false;
      if (mapStartDate && inc.date < mapStartDate) return false;
      if (mapEndDate && inc.date > mapEndDate) return false;
      // Skip items without valid coordinates
      if (!inc.lat || !inc.lng) return false;
      if (!isPointInPolygon([inc.lat, inc.lng], BARANGAY_BOUNDARY))
        return false;
      return true;
    });
  }, [visibleStatuses, mapType, mapStartDate, mapEndDate, dataSource]);

  // ── Status tab counts ──────────────────────────────────────────────
  const statusCounts = useMemo(() => {
    const counts = { all: 0, pending: 0, dispatched: 0, active: 0, resolved: 0, rejected: 0 };
    dataSource.forEach((inc) => {
      counts.all++;
      if (counts[inc.status] !== undefined) counts[inc.status]++;
    });
    return counts;
  }, [dataSource]);

  return (
    <div className={`min-h-full ${t.pageBg} pb-10`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ── Page Header ─────────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-12 h-12 ${isDark ? "bg-slate-700" : "bg-gray-200"} rounded-lg flex items-center justify-center`}>
            <svg
              className={`w-7 h-7 ${isDark ? "text-slate-300" : "text-gray-600"}`}
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
          <h1
            className={`text-2xl sm:text-3xl font-bold ${t.cardText} font-spartan uppercase flex-1`}
          >
            Incident & Complaints Report Management
          </h1>
          <div className="relative" ref={kebabRef}>
            <button
              onClick={() => setShowKebab((prev) => !prev)}
              className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-slate-700 text-slate-300" : "hover:bg-gray-200 text-gray-600"}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
            {showKebab && (
              <div className={`absolute right-0 top-full mt-1 w-52 rounded-xl shadow-lg border z-20 overflow-hidden ${isDark ? "bg-slate-700 border-slate-600" : "bg-white border-gray-200"}`}>
                <button
                  onClick={() => { setShowKebab(false); setShowInsights(true); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-kumbh font-semibold transition-colors ${isDark ? "text-slate-200 hover:bg-slate-600" : "text-gray-700 hover:bg-gray-100"}`}
                >
                  <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Generate Insights
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Page Tabs (Incidents / Complaints) ─────────────────── */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setPageTab("incidents")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold font-kumbh uppercase tracking-wide transition-all duration-200 ${
              pageTab === "incidents"
                ? isDark
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-gray-800 text-white shadow-md"
                : isDark
                  ? "bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600"
                  : "bg-white text-gray-500 border border-gray-300 hover:bg-gray-100"
            }`}
          >
            Incidents
          </button>
          <button
            onClick={() => setPageTab("complaints")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold font-kumbh uppercase tracking-wide transition-all duration-200 ${
              pageTab === "complaints"
                ? isDark
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-gray-800 text-white shadow-md"
                : isDark
                  ? "bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600"
                  : "bg-white text-gray-500 border border-gray-300 hover:bg-gray-100"
            }`}
          >
            Complaints
          </button>
        </div>

        {/* ── Table Section ────────────────────────────────────────── */}
        <div
          className={`${t.cardBg} border ${t.cardBorder} rounded-2xl shadow-lg mb-8 overflow-hidden`}
        >
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2 px-5 pt-5">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-lg text-xs font-bold font-kumbh uppercase tracking-wide border-2 transition-all ${
                  activeTab === key
                    ? `${cfg.tabBg} ${cfg.tabText} ${cfg.tabBorder} shadow-md`
                    : isDark
                      ? "bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-200 hover:text-slate-800 hover:border-slate-400"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                }`}
              >
                {cfg.label} ({statusCounts[key]})
              </button>
            ))}
          </div>

          {/* Search + Date Filters */}
          <div className="px-5 pt-5 pb-3">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <label
                  className={`block text-xs font-semibold ${t.subtleText} mb-1.5 font-kumbh uppercase`}
                >
                  Search
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by type, details, reporter..."
                  className={`w-full px-4 py-2.5 rounded-lg border ${t.cardBorder} ${t.cardBg} ${t.cardText} text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-kumbh`}
                />
              </div>
              <div>
                <label
                  className={`block text-xs font-semibold ${t.subtleText} mb-1.5 font-kumbh uppercase`}
                >
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`px-4 py-2.5 rounded-lg border ${t.cardBorder} ${t.cardBg} ${t.cardText} text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-kumbh`}
                />
              </div>
              <div>
                <label
                  className={`block text-xs font-semibold ${t.subtleText} mb-1.5 font-kumbh uppercase`}
                >
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`px-4 py-2.5 rounded-lg border ${t.cardBorder} ${t.cardBg} ${t.cardText} text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-kumbh`}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto px-5 pb-5">
            <table className="w-full text-sm font-kumbh table-fixed">
              <thead>
                <tr className={`${isDark ? "bg-slate-700 border-y border-slate-600" : "bg-gray-100 border-y border-gray-200"}`}>
                  <th className={`text-center px-3 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase w-[6%]`}>
                    #
                  </th>
                  <th className={`text-left px-4 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase w-[24%]`}>
                    {pageTab === "incidents" ? "Type of Incident" : "Type of Complaint"}
                  </th>
                  <th className={`text-left px-4 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase w-[18%]`}>
                    Date
                  </th>
                  <th className={`text-left px-4 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase w-[28%]`}>
                    Reported By
                  </th>
                  <th className={`text-left px-4 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase w-[24%]`}>
                    {pageTab === "incidents" ? "Incident ID" : "Complaint ID"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((inc, index) => (
                    <TableRow
                      key={inc.id}
                      inc={inc}
                      index={index}
                      currentPage={currentPage}
                      ROWS_PER_PAGE={ROWS_PER_PAGE}
                      onClick={setSelectedIncident}
                      t={t}
                      isDark={isDark}
                    />
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className={`px-4 py-8 text-center ${t.subtleText}`}
                    >
                      {loading ? "Loading reports..." : "No reports found for the selected filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={`flex items-center justify-between pt-4 border-t ${isDark ? "border-slate-700" : "border-gray-100"} mt-2`}>
                <p className={`text-xs ${t.subtleText} font-kumbh`}>
                  Showing {(currentPage - 1) * ROWS_PER_PAGE + 1}–
                  {Math.min(currentPage * ROWS_PER_PAGE, filteredTableData.length)}{" "}
                  of {filteredTableData.length} results
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 rounded-lg text-xs font-kumbh font-semibold transition-colors ${
                      currentPage === 1
                        ? isDark ? "text-slate-600 cursor-not-allowed" : "text-gray-300 cursor-not-allowed"
                        : isDark ? "text-slate-300 hover:bg-slate-200 hover:text-slate-800" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-xs font-kumbh font-bold transition-colors ${
                          page === currentPage
                            ? "bg-green-700 text-white"
                            : isDark ? "text-slate-300 hover:bg-slate-200 hover:text-slate-800" : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1.5 rounded-lg text-xs font-kumbh font-semibold transition-colors ${
                      currentPage === totalPages
                        ? isDark ? "text-slate-600 cursor-not-allowed" : "text-gray-300 cursor-not-allowed"
                        : isDark ? "text-slate-300 hover:bg-slate-200 hover:text-slate-800" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Map Section ──────────────────────────────────────────── */}
        <div
          className={`${t.cardBg} border ${t.cardBorder} rounded-2xl shadow-lg overflow-hidden`}
        >
          <div className="flex flex-col lg:flex-row">
            {/* Map Legend / Filters */}
            <div className={`lg:w-[300px] flex-shrink-0 p-5 border-b lg:border-b-0 lg:border-r ${isDark ? "border-slate-700" : "border-gray-200"} relative z-10`}>
              {/* Legend header */}
              <div className="flex items-center gap-2 mb-5">
                <svg
                  className={`w-6 h-6 ${isDark ? "text-green-400" : "text-green-600"}`}
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
                <h3 className={`text-lg font-bold ${isDark ? "text-green-400" : "text-green-700"} font-spartan uppercase`}>
                  Map Legend
                </h3>
              </div>

              {/* Type Filter */}
              <div className="mb-4">
                <label className={`block text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} mb-1.5 font-kumbh uppercase`}>
                  {pageTab === "incidents" ? "Type of Incident" : "Type of Complaint"}
                </label>
                <select
                  value={mapType}
                  onChange={(e) => setMapType(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${t.cardBorder} ${isDark ? "bg-slate-700 text-slate-200" : "bg-white text-gray-800"} text-sm font-kumbh focus:outline-none focus:ring-2 focus:ring-green-500`}
                >
                  {typeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div className="mb-6">
                <label className={`block text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} mb-1.5 font-kumbh uppercase`}>
                  Date
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={mapStartDate}
                    onChange={(e) => setMapStartDate(e.target.value)}
                    className={`flex-1 px-2 py-2 rounded-lg border ${t.cardBorder} ${isDark ? "bg-slate-700 text-slate-200" : "bg-white text-gray-800"} text-xs font-kumbh focus:outline-none focus:ring-2 focus:ring-green-500`}
                  />
                  <span className={`text-xs ${t.subtleText}`}>-</span>
                  <input
                    type="date"
                    value={mapEndDate}
                    onChange={(e) => setMapEndDate(e.target.value)}
                    className={`flex-1 px-2 py-2 rounded-lg border ${t.cardBorder} ${isDark ? "bg-slate-700 text-slate-200" : "bg-white text-gray-800"} text-xs font-kumbh focus:outline-none focus:ring-2 focus:ring-green-500`}
                  />
                </div>
              </div>

              {/* Status toggles */}
              <div className="space-y-3">
                {/* Resolved */}
                <div
                  className={`p-3 rounded-lg border ${visibleStatuses.resolved ? (isDark ? "border-green-500 bg-green-900/30" : "border-green-300 bg-green-50") : (isDark ? "border-slate-600" : "border-gray-200")} transition-colors`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-500" />
                      <span className={`text-sm font-bold ${isDark ? "text-green-400" : "text-green-700"} font-kumbh`}>
                        RESOLVED
                      </span>
                    </div>
                    <button
                      onClick={() => toggleStatus("resolved")}
                      className={`${isDark ? "text-slate-400 hover:text-slate-200 hover:bg-slate-600" : "text-gray-400 hover:text-gray-600"} rounded p-0.5 transition-colors`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {visibleStatuses.resolved ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18"
                          />
                        )}
                      </svg>
                    </button>
                  </div>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"} font-kumbh`}>
                    Issue has been cleared or fixed
                  </p>
                </div>

                {/* Dispatched */}
                <div
                  className={`p-3 rounded-lg border ${visibleStatuses.dispatched ? (isDark ? "border-amber-500 bg-amber-900/30" : "border-amber-300 bg-amber-50") : (isDark ? "border-slate-600" : "border-gray-200")} transition-colors`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-amber-400" />
                      <span className={`text-sm font-bold ${isDark ? "text-amber-400" : "text-amber-700"} font-kumbh`}>
                        DISPATCHED
                      </span>
                    </div>
                    <button
                      onClick={() => toggleStatus("dispatched")}
                      className={`${isDark ? "text-slate-400 hover:text-slate-200 hover:bg-slate-600" : "text-gray-400 hover:text-gray-600"} rounded p-0.5 transition-colors`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {visibleStatuses.dispatched ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18"
                          />
                        )}
                      </svg>
                    </button>
                  </div>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"} font-kumbh`}>
                    Barangay officials dispatched on the site to check.
                  </p>
                </div>

                {/* In-Progress / Active */}
                <div
                  className={`p-3 rounded-lg border ${visibleStatuses.active ? (isDark ? "border-blue-500 bg-blue-900/30" : "border-blue-300 bg-blue-50") : (isDark ? "border-slate-600" : "border-gray-200")} transition-colors`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-blue-600" />
                      <span className={`text-sm font-bold ${isDark ? "text-blue-400" : "text-blue-700"} font-kumbh`}>
                        IN-PROGRESS
                      </span>
                    </div>
                    <button
                      onClick={() => toggleStatus("active")}
                      className={`${isDark ? "text-slate-400 hover:text-slate-200 hover:bg-slate-600" : "text-gray-400 hover:text-gray-600"} rounded p-0.5 transition-colors`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {visibleStatuses.active ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18"
                          />
                        )}
                      </svg>
                    </button>
                  </div>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"} font-kumbh`}>
                    Barangay officials or maintenance teams are on-site.
                  </p>
                </div>

                {/* New / Active (pending) */}
                <div
                  className={`p-3 rounded-lg border ${visibleStatuses.pending ? (isDark ? "border-red-500 bg-red-900/30" : "border-red-300 bg-red-50") : (isDark ? "border-slate-600" : "border-gray-200")} transition-colors`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-500" />
                      <span className={`text-sm font-bold ${isDark ? "text-red-400" : "text-red-700"} font-kumbh`}>
                        NEW/ACTIVE
                      </span>
                    </div>
                    <button
                      onClick={() => toggleStatus("pending")}
                      className={`${isDark ? "text-slate-400 hover:text-slate-200 hover:bg-slate-600" : "text-gray-400 hover:text-gray-600"} rounded p-0.5 transition-colors`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {visibleStatuses.pending ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18"
                          />
                        )}
                      </svg>
                    </button>
                  </div>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"} font-kumbh`}>
                    Issue recently reported and awaiting dispatch.
                  </p>
                </div>

                {/* Rejected */}
                <div
                  className={`p-3 rounded-lg border ${visibleStatuses.rejected ? (isDark ? "border-gray-500 bg-gray-700/50" : "border-gray-300 bg-gray-50") : (isDark ? "border-slate-600" : "border-gray-200")} transition-colors`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gray-500" />
                      <span className={`text-sm font-bold ${isDark ? "text-gray-300" : "text-gray-700"} font-kumbh`}>
                        REJECTED
                      </span>
                    </div>
                    <button
                      onClick={() => toggleStatus("rejected")}
                      className={`${isDark ? "text-slate-400 hover:text-slate-200 hover:bg-slate-600" : "text-gray-400 hover:text-gray-600"} rounded p-0.5 transition-colors`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {visibleStatuses.rejected ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18"
                          />
                        )}
                      </svg>
                    </button>
                  </div>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"} font-kumbh`}>
                    Report was rejected or deemed invalid.
                  </p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="flex-1 min-h-[450px]">
              <MapContainer
                center={MAP_CENTER}
                zoom={15}
                minZoom={13}
                maxZoom={18}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%", minHeight: "450px" }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Barangay boundary */}
                <Polygon
                  positions={BARANGAY_BOUNDARY}
                  pathOptions={{
                    color: "#1d4ed8",
                    fillColor: "#3b82f6",
                    fillOpacity: 0.05,
                    weight: 3,
                    dashArray: "8 4",
                  }}
                />

                {/* Incident/Complaint markers */}
                {filteredMapData.map((inc) => {
                  const cfg = STATUS_CONFIG[inc.status] || STATUS_CONFIG.pending;
                  return (
                    <CircleMarker
                      key={inc.id}
                      center={[inc.lat, inc.lng]}
                      radius={8}
                      pathOptions={{
                        color: "#fff",
                        fillColor: cfg.color,
                        fillOpacity: 1,
                        weight: 2,
                      }}
                    >
                      <Popup>
                        <div className="font-kumbh" style={{ minWidth: 180 }}>
                          <p className="font-bold text-sm mb-1">{inc.type}</p>
                          <p className="text-xs text-gray-600 mb-1">
                            {inc.details}
                          </p>
                          <p className="text-xs text-gray-500">
                            {inc.date} &middot;{" "}
                            <span
                              className="font-semibold"
                              style={{ color: cfg.color }}
                            >
                              {cfg.label}
                            </span>
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            ID: {inc.id}
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
      </div>

      {/* ── Incident Detail Modal ───────────────────────────────────── */}
      <AdminReportDetailsModal
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        reportType={pageTab}
        onStatusUpdate={(id, newStatus) => {
          const updateList = (list, setList) =>
            setList(list.map((item) =>
              item.id === String(id) ? { ...item, status: newStatus } : item
            ));
          if (pageTab === "incidents") updateList(incidents, setIncidents);
          else updateList(complaints, setComplaints);
          setSelectedIncident((prev) =>
            prev && prev.id === String(id) ? { ...prev, status: newStatus } : prev
          );
        }}
      />

      {/* Real-time toasts */}
      <Toast toasts={toasts} onRemove={removeToast} currentTheme={currentTheme} />

      {/* Insights Modal */}
      <InsightsModal
        isOpen={showInsights}
        onClose={() => setShowInsights(false)}
        incidents={incidents}
        complaints={complaints}
        context="management"
      />
    </div>
  );
};

export default AdminIncidentReports;
