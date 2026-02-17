import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import themeTokens from "../../../Themetokens";
import { getUser } from "../../../services/sub-system-3/loginService";
import { incidentService } from "../../../services/sub-system-3/incidentService";
import { getMyComplaints } from "../../../services/sub-system-3/complaintService";
import InsightsModal from "../../../components/sub-system-3/InsightsModal";
import sanBartolomeImg from "../../../assets/css/images/SanBartolome.jpg";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#EF4444",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#F97316",
];
const STATUS_COLORS = {
  ongoing: "#3B82F6",
  resolved: "#10B981",
  rejected: "#EF4444",
};

// ── Reusable chart card with kebab export menu ───────────────────────
const ChartCard = ({ title, className, isDark, children }) => {
  const cardRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const captureChart = async () => {
    if (!cardRef.current) return null;
    // Wait for dropdown to unmount after setOpen(false)
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    // Hide the kebab button and any Recharts tooltips/popovers during capture
    if (menuRef.current) menuRef.current.style.display = "none";
    const tooltips = cardRef.current.querySelectorAll(".recharts-tooltip-wrapper, .recharts-active-dot");
    tooltips.forEach((el) => { el.dataset.prevDisplay = el.style.display; el.style.display = "none"; });
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
      scale: 2,
      useCORS: true,
    });
    if (menuRef.current) menuRef.current.style.display = "";
    tooltips.forEach((el) => { el.style.display = el.dataset.prevDisplay || ""; delete el.dataset.prevDisplay; });
    return canvas;
  };

  const handleSaveImage = async () => {
    setOpen(false);
    setExporting(true);
    try {
      const canvas = await captureChart();
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = `${title.replace(/[^a-zA-Z0-9]/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setExporting(false);
    }
  };

  const handleSavePDF = async () => {
    setOpen(false);
    setExporting(true);
    try {
      const canvas = await captureChart();
      if (!canvas) return;
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const isLandscape = imgWidth > imgHeight * 1.3;
      const doc = new jsPDF({ orientation: isLandscape ? "landscape" : "portrait" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;
      const availW = pageWidth - margin * 2;
      const ratio = imgHeight / imgWidth;
      const drawW = availW;
      const drawH = drawW * ratio;
      const finalH = Math.min(drawH, pageHeight - margin * 2 - 20);
      const finalW = finalH === drawH ? drawW : finalH / ratio;

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(title, pageWidth / 2, margin + 4, { align: "center" });
      doc.addImage(imgData, "PNG", (pageWidth - finalW) / 2, margin + 10, finalW, finalH);

      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.text("E-Barangay Integrated Services Platform", pageWidth / 2, pageHeight - 8, { align: "center" });

      doc.save(`${title.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className={className} ref={cardRef}>
      <div className="flex items-center justify-between mb-4">
        <h3
          className={`text-sm font-bold ${isDark ? "text-slate-200" : "text-gray-900"} font-spartan uppercase tracking-wide`}
        >
          {title}
        </h3>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((p) => !p)}
            disabled={exporting}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? "hover:bg-slate-600 text-slate-400" : "hover:bg-gray-200 text-gray-400"} ${exporting ? "opacity-50 cursor-wait" : ""}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>
          {open && (
            <div className={`absolute right-0 top-full mt-1 w-44 rounded-xl shadow-lg border z-20 overflow-hidden ${isDark ? "bg-slate-700 border-slate-600" : "bg-white border-gray-200"}`}>
              <button
                onClick={handleSaveImage}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-kumbh font-semibold transition-colors ${isDark ? "text-slate-200 hover:bg-slate-600" : "text-gray-700 hover:bg-gray-100"}`}
              >
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Save as Image
              </button>
              <button
                onClick={handleSavePDF}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-kumbh font-semibold transition-colors ${isDark ? "text-slate-200 hover:bg-slate-600" : "text-gray-700 hover:bg-gray-100"}`}
              >
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Save as PDF
              </button>
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};

const AdminLanding = () => {
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("appTheme") || "blue",
  );
  const [incidents, setIncidents] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showKebab, setShowKebab] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const kebabRef = useRef(null);

  useEffect(() => {
    const handleThemeChange = (e) => setCurrentTheme(e.detail);
    window.addEventListener("themeChange", handleThemeChange);
    return () => window.removeEventListener("themeChange", handleThemeChange);
  }, []);

  // Close kebab on outside click
  useEffect(() => {
    if (!showKebab) return;
    const handler = (e) => {
      if (kebabRef.current && !kebabRef.current.contains(e.target)) setShowKebab(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showKebab]);

  const t = themeTokens[currentTheme];
  const isDark = currentTheme === "dark";
  const user = getUser();
  const firstName = user?.name?.split(" ")[0] || "Admin";
  const navigate = useNavigate();

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [incData, compData] = await Promise.all([
        incidentService.getMyIncidents(),
        getMyComplaints(),
      ]);
      setIncidents(Array.isArray(incData) ? incData : incData.data || []);
      setComplaints(Array.isArray(compData) ? compData : compData.data || []);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Normalize status ──
  const normalizeStatus = (status) => {
    if (!status) return "ongoing";
    const s = status.toLowerCase();
    if (s === "pending" || s === "ongoing" || s === "in_progress")
      return "ongoing";
    if (s === "resolved" || s === "completed" || s === "closed")
      return "resolved";
    if (s === "rejected" || s === "dismissed" || s === "denied")
      return "rejected";
    return "ongoing";
  };

  // ── Chart Data Processors ──

  // Monthly bar chart data (last 6 months)
  const getMonthlyData = () => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: d.toLocaleString("default", { month: "short" }),
        year: d.getFullYear(),
        monthNum: d.getMonth(),
        incidents: 0,
        complaints: 0,
      });
    }

    incidents.forEach((item) => {
      const d = new Date(item.created_at);
      const entry = months.find(
        (m) => m.monthNum === d.getMonth() && m.year === d.getFullYear(),
      );
      if (entry) entry.incidents++;
    });

    complaints.forEach((item) => {
      const d = new Date(item.created_at || item.incident_date);
      const entry = months.find(
        (m) => m.monthNum === d.getMonth() && m.year === d.getFullYear(),
      );
      if (entry) entry.complaints++;
    });

    return months.map((m) => ({
      name: m.month,
      Incidents: m.incidents,
      Complaints: m.complaints,
    }));
  };

  // Status distribution (pie/donut)
  const getStatusData = () => {
    const all = [
      ...incidents.map((i) => normalizeStatus(i.status)),
      ...complaints.map((c) => normalizeStatus(c.status)),
    ];
    const counts = { ongoing: 0, resolved: 0, rejected: 0 };
    all.forEach((s) => {
      if (counts[s] !== undefined) counts[s]++;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: STATUS_COLORS[name],
      }));
  };

  // Daily trend (last 14 days)
  const getTrendData = () => {
    const days = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days.push({
        date: d.toLocaleDateString("default", {
          month: "short",
          day: "numeric",
        }),
        dateStr: d.toISOString().split("T")[0],
        Incidents: 0,
        Complaints: 0,
      });
    }

    incidents.forEach((item) => {
      const dateStr = (item.created_at || "").split("T")[0];
      const entry = days.find((d) => d.dateStr === dateStr);
      if (entry) entry.Incidents++;
    });

    complaints.forEach((item) => {
      const dateStr = (item.created_at || item.incident_date || "").split(
        "T",
      )[0];
      const entry = days.find((d) => d.dateStr === dateStr);
      if (entry) entry.Complaints++;
    });

    return days.map(({ date, Incidents, Complaints }) => ({
      date,
      Incidents,
      Complaints,
    }));
  };

  // Category breakdown (pie)
  const getCategoryData = () => {
    const counts = {};

    incidents.forEach((item) => {
      let types = [];
      try {
        const parsed = JSON.parse(item.type);
        types = Array.isArray(parsed) ? parsed : [String(parsed)];
      } catch {
        types = [item.type || "Other"];
      }
      types.forEach((t) => {
        const label = t.charAt(0).toUpperCase() + t.slice(1);
        counts[label] = (counts[label] || 0) + 1;
      });
    });

    complaints.forEach((item) => {
      const label = item.type
        ? item.type.charAt(0).toUpperCase() + item.type.slice(1)
        : "Other";
      counts[label] = (counts[label] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  // ── Stat card counts ──
  const totalIncidents = incidents.length;
  const totalComplaints = complaints.length;
  const totalPending = [...incidents, ...complaints].filter(
    (r) => normalizeStatus(r.status) === "ongoing",
  ).length;

  const stats = [
    {
      count: totalPending,
      label: "REQUESTS",
      sublabel: "PENDING",
      borderColor: "border-green-600",
      circleBg: "bg-gray-200",
      circleText: "text-gray-700",
      arrowColor: "text-amber-500",
      link: "/admin/requests",
    },
    {
      count: totalComplaints,
      label: "COMPLAINTS",
      sublabel: "OPEN",
      borderColor: "border-green-600",
      circleBg: "bg-gray-200",
      circleText: "text-green-700",
      arrowColor: "text-amber-500",
      link: "/admin/incidents",
    },
    {
      count: totalIncidents,
      label: "REPORTS",
      sublabel: "INCIDENT",
      borderColor: "border-gray-300",
      circleBg: "bg-gray-200",
      circleText: "text-gray-700",
      arrowColor: "text-gray-400",
      link: "/admin/incidents",
    },
  ];

  const monthlyData = getMonthlyData();
  const statusData = getStatusData();
  const trendData = getTrendData();
  const categoryData = getCategoryData();

  const chartCardClass = `${t.cardBg} border ${isDark ? "border-slate-700" : "border-gray-200"} rounded-xl p-4 shadow-md`;

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <div className="relative w-full h-[420px] sm:h-[500px] overflow-hidden">
        <img
          src={sanBartolomeImg}
          alt="Barangay Gulod"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 flex flex-col justify-center items-start h-full px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto w-full">
          <p className="text-white/90 text-lg sm:text-xl font-semibold font-kumbh mb-2">
            Hi, {firstName}!
          </p>
          <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold font-spartan leading-tight text-left">
            Welcome to
            <br />
            E-Barangay Integrated Services
            <br />
            Platform of Gulod
          </h1>
          <div className="mt-6">
            <button className="px-6 py-3 bg-green-700 hover:bg-green-800 text-white text-sm font-bold font-kumbh uppercase tracking-wider rounded transition-colors">
              View Announcements
            </button>
          </div>
        </div>
      </div>

      {/* ── Analytics Dashboard ─────────────────────────────────────── */}
      <div className={`${t.pageBg} px-6 sm:px-10 lg:px-16 py-6`}>
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between mb-5">
            <h2
              className={`text-2xl font-bold ${t.cardText} font-spartan text-left`}
            >
              Analytics Dashboard
            </h2>
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

          {/* Stat Cards - compact inline */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {stats.map((stat, i) => (
              <div
                key={i}
                onClick={() => navigate(stat.link)}
                className={`${t.cardBg} border-l-4 ${stat.borderColor} rounded-lg px-4 py-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition-all`}
              >
                <div
                  className={`w-11 h-11 ${stat.circleBg} rounded-full flex items-center justify-center flex-shrink-0`}
                >
                  <span
                    className={`text-lg font-bold ${stat.circleText} font-spartan`}
                  >
                    {loading ? "..." : stat.count}
                  </span>
                </div>
                <div>
                  <p
                    className={`text-[10px] font-medium ${t.subtleText} font-kumbh uppercase tracking-wide leading-tight`}
                  >
                    {stat.sublabel}
                  </p>
                  <p
                    className={`text-sm font-bold ${t.cardText} font-spartan uppercase`}
                  >
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {loading ? (
            <div
              className={`${chartCardClass} flex items-center justify-center py-20`}
            >
              <div className="text-center">
                <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className={`text-sm ${t.subtleText} font-kumbh`}>
                  Loading analytics...
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart — Monthly Reports */}
              <ChartCard title="Monthly Reports (Last 6 Months)" className={chartCardClass} isDark={isDark}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDark ? "#374151" : "#E5E7EB"}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{
                        fontSize: 12,
                        fill: isDark ? "#9CA3AF" : "#6B7280",
                      }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fontSize: 12,
                        fill: isDark ? "#9CA3AF" : "#6B7280",
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? "#1F2937" : "#FFF",
                        border: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
                        borderRadius: "8px",
                        fontSize: "13px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Bar
                      dataKey="Incidents"
                      fill="#3B82F6"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="Complaints"
                      fill="#F59E0B"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Donut Chart — Status Distribution */}
              <ChartCard title="Status Distribution" className={chartCardClass} isDark={isDark}>
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="45%"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? "#1F2937" : "#FFF",
                          border: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
                          borderRadius: "8px",
                          fontSize: "13px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px]">
                    <p className={`text-sm ${t.subtleText} font-kumbh`}>
                      No data available
                    </p>
                  </div>
                )}
              </ChartCard>

              {/* Line Chart — Daily Trend */}
              <ChartCard title="Report Trend (Last 14 Days)" className={chartCardClass} isDark={isDark}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDark ? "#374151" : "#E5E7EB"}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{
                        fontSize: 11,
                        fill: isDark ? "#9CA3AF" : "#6B7280",
                      }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fontSize: 12,
                        fill: isDark ? "#9CA3AF" : "#6B7280",
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? "#1F2937" : "#FFF",
                        border: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
                        borderRadius: "8px",
                        fontSize: "13px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Line
                      type="monotone"
                      dataKey="Incidents"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Complaints"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Pie Chart — Category Breakdown */}
              <ChartCard title="Report Categories" className={chartCardClass} isDark={isDark}>
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="45%"
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {categoryData.map((_, index) => (
                          <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? "#1F2937" : "#FFF",
                          border: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
                          borderRadius: "8px",
                          fontSize: "13px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px]">
                    <p className={`text-sm ${t.subtleText} font-kumbh`}>
                      No data available
                    </p>
                  </div>
                )}
              </ChartCard>
            </div>
          )}
        </div>
      </div>

      {/* ── Announcement Section ───────────────────────────────────────
      <div className="px-6 sm:px-10 lg:px-16 pb-10">
        <div className="max-w-5xl rounded-xl overflow-hidden shadow-md">
          <div className="bg-green-800 px-6 py-4">
            <h2 className="text-white text-lg font-bold font-spartan uppercase tracking-wide">
              Barangay Council Meeting
            </h2>
          </div>

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
      </div> */}

      {/* Insights Modal */}
      <InsightsModal
        isOpen={showInsights}
        onClose={() => setShowInsights(false)}
        incidents={incidents}
        complaints={complaints}
      />
    </div>
  );
};

export default AdminLanding;
