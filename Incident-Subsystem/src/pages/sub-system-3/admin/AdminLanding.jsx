import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import themeTokens from "../../../Themetokens";
import { getUser } from "../../../services/sub-system-3/loginService";
import { incidentService } from "../../../services/sub-system-3/incidentService";
import { getMyComplaints } from "../../../services/sub-system-3/complaintService";
import sanBartolomeImg from "../../../assets/css/images/SanBartolome.jpg";
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

const AdminLanding = () => {
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("appTheme") || "blue",
  );
  const [incidents, setIncidents] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleThemeChange = (e) => setCurrentTheme(e.detail);
    window.addEventListener("themeChange", handleThemeChange);
    return () => window.removeEventListener("themeChange", handleThemeChange);
  }, []);

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
    <div className="h-full flex flex-col overflow-y-auto">
      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <div className="relative w-full h-[420px] sm:h-[500px] overflow-hidden">
        <img
          src={sanBartolomeImg}
          alt="Barangay Gulod"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 flex flex-col justify-center h-full px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto w-full">
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

      {/* ── Analytics Dashboard ─────────────────────────────────────── */}
      <div className={`${t.pageBg} px-6 sm:px-10 lg:px-16 py-6`}>
        <div className="max-w-7xl mx-auto w-full">
          <h2
            className={`text-2xl font-bold ${t.cardText} font-spartan mb-5 text-left`}
          >
            Analytics Dashboard
          </h2>

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
              <div className={chartCardClass}>
                <h3
                  className={`text-sm font-bold ${t.cardText} font-spartan mb-4 uppercase tracking-wide`}
                >
                  Monthly Reports (Last 6 Months)
                </h3>
                <ResponsiveContainer width="100%" height={220}>
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
              </div>

              {/* Donut Chart — Status Distribution */}
              <div className={chartCardClass}>
                <h3
                  className={`text-sm font-bold ${t.cardText} font-spartan mb-4 uppercase tracking-wide`}
                >
                  Status Distribution
                </h3>
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
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
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[220px]">
                    <p className={`text-sm ${t.subtleText} font-kumbh`}>
                      No data available
                    </p>
                  </div>
                )}
              </div>

              {/* Line Chart — Daily Trend */}
              <div className={chartCardClass}>
                <h3
                  className={`text-sm font-bold ${t.cardText} font-spartan mb-4 uppercase tracking-wide`}
                >
                  Report Trend (Last 14 Days)
                </h3>
                <ResponsiveContainer width="100%" height={220}>
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
              </div>

              {/* Pie Chart — Category Breakdown */}
              <div className={chartCardClass}>
                <h3
                  className={`text-sm font-bold ${t.cardText} font-spartan mb-4 uppercase tracking-wide`}
                >
                  Report Categories
                </h3>
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
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
                  <div className="flex items-center justify-center h-[220px]">
                    <p className={`text-sm ${t.subtleText} font-kumbh`}>
                      No data available
                    </p>
                  </div>
                )}
              </div>
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
    </div>
  );
};

export default AdminLanding;
