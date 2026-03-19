import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLanguage } from "../../../context/LanguageContext";
import themeTokens from "../../../Themetokens";
import { getUser } from "../../../homepage/services/loginService";
import { incidentService } from "../../../services/sub-system-3/incidentService";
import { getAllComplaints } from "../../../services/sub-system-3/complaintService";
import { analyticsService } from "../../../services/sub-system-1/analytics";
import OverviewTab from "../../../components/sub-system-1/analytics/tabs/OverviewTab";
import InsightsModal from "../../../components/sub-system-3/InsightsModal";
import VolumesFactors from "../../../components/sub-system-2/factors/VolumesFactors";
import OperationsFactors from "../../../components/sub-system-2/factors/OperationsFactors";
import SocioEconomyFactors from "../../../components/sub-system-2/factors/SocioEconomyFactors";
import {
  CHART_COLORS,
  STATUS_COLORS,
} from "../../../components/sub-system-2/factors/data";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

const themeAccentMap = {
  modern: {
    glow: "bg-blue-500/10",
    shadow: "shadow-blue-500/25 hover:opacity-95",
    live: "bg-blue-50 text-blue-600",
    dot: "bg-blue-500",
    primaryChip: "bg-blue-50 text-blue-600",
    barActive: "bg-blue-500",
    barIdle: "bg-blue-200",
  },
  blue: {
    glow: "bg-blue-500/10",
    shadow: "shadow-blue-500/25 hover:opacity-95",
    live: "bg-blue-50 text-blue-600",
    dot: "bg-blue-500",
    primaryChip: "bg-blue-50 text-blue-600",
    barActive: "bg-blue-500",
    barIdle: "bg-blue-200",
  },
  purple: {
    glow: "bg-purple-500/10",
    shadow: "shadow-purple-500/25 hover:opacity-95",
    live: "bg-purple-50 text-purple-600",
    dot: "bg-purple-500",
    primaryChip: "bg-purple-50 text-purple-600",
    barActive: "bg-purple-500",
    barIdle: "bg-purple-200",
  },
  green: {
    glow: "bg-green-500/10",
    shadow: "shadow-green-500/25 hover:opacity-95",
    live: "bg-green-50 text-green-600",
    dot: "bg-green-500",
    primaryChip: "bg-green-50 text-green-600",
    barActive: "bg-green-500",
    barIdle: "bg-green-200",
  },
  dark: {
    glow: "bg-slate-500/10",
    shadow: "shadow-slate-950/40",
    live: "bg-slate-700 text-slate-200",
    dot: "bg-slate-300",
    primaryChip: "bg-slate-700 text-slate-200",
    barActive: "bg-slate-300",
    barIdle: "bg-slate-600",
  },
};

const normalizeStatus = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "pending" || s === "ongoing" || s === "in_progress")
    return "ongoing";
  if (
    s === "resolved" ||
    s === "completed" ||
    s === "closed" ||
    s === "approved"
  )
    return "resolved";
  if (s === "rejected" || s === "denied" || s === "dismissed")
    return "rejected";
  return "ongoing";
};

// ─── Chart legend toggle helpers ─────────────────────────────────────────────

function useToggleSet() {
  const [hidden, setHidden] = useState(new Set());
  const toggle = useCallback((key) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);
  return [hidden, toggle];
}

// Custom Recharts <Legend content={}> renderer with click-to-toggle
function ChartLegend({ payload = [], hidden, onToggle, isDark }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 pt-2">
      {payload.map((entry) => {
        const key = entry.dataKey ?? entry.value;
        const isHidden = hidden.has(key);
        return (
          <button
            key={key}
            type="button"
            onClick={() => onToggle(key)}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium font-kumbh transition-all select-none ${
              isHidden ? "opacity-40" : "opacity-100"
            } ${isDark ? "text-slate-300 hover:bg-slate-700/60" : "text-slate-600 hover:bg-slate-100"}`}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full transition-opacity"
              style={{ backgroundColor: isHidden ? (isDark ? "#475569" : "#cbd5e1") : entry.color }}
            />
            <span className={isHidden ? "line-through" : ""}>{entry.value}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Shared Donut Card ────────────────────────────────────────────────────────

const CHART_W = 268;
const CHART_H = 236;
const INNER_R = 56;
const OUTER_R = 96;
// Disk must fully cover the inner hole; cornerRadius={6} rounds segment inner
// corners inward by ~6 px so add that as buffer: INNER_R*2 - 6 overlap budget
const CENTER_DISK = INNER_R * 2 + 4; // 116px — slightly larger than the hole

function DonutCard({ title, data, isDark, t, cardClass, centerLabel = "Total", tooltipStyle, tooltipTextStyle }) {
  const [hidden, toggleHidden] = useToggleSet();
  const visibleData = data.filter((d) => !hidden.has(d.name));
  const total = visibleData.reduce((sum, d) => sum + Number(d.value ?? 0), 0);

  return (
    <article className={`${cardClass} p-5`}>
      <h3 className={`text-lg font-bold font-spartan ${t.cardText} mb-3`}>{title}</h3>

      <div className="flex flex-col gap-4">
        {/* Chart + centre disk
            Use w-full h-[236px] so the absolute overlay spans the same box
            the PieChart SVG is centred in — mirrors AnalyticsInterface exactly. */}
        <div className="relative mx-auto h-[236px] w-full min-w-0 flex justify-center overflow-visible">
          <PieChart width={CHART_W} height={CHART_H}>
            <Pie
              data={visibleData}
              cx={CHART_W / 2}
              cy={CHART_H / 2}
              innerRadius={INNER_R}
              outerRadius={OUTER_R}
              paddingAngle={3}
              cornerRadius={6}
              dataKey="value"
              labelLine={false}
              label={({ percent, cx, cy, midAngle, innerRadius: ir, outerRadius: or }) => {
                if (!percent || percent < 0.07) return null;
                const rad = (-midAngle * Math.PI) / 180;
                const label = `${Math.round(percent * 100)}%`;
                const pw = Math.max(30, label.length * 7 + 10);
                const ph = 20;
                const halfExtent =
                  Math.abs(Math.cos(rad)) * (pw / 2) + Math.abs(Math.sin(rad)) * (ph / 2);
                const minR = ir + halfExtent + 4;
                const maxR = or - halfExtent - 4;
                if (minR >= maxR) return null;
                const r = Math.min(maxR, Math.max(ir + (or - ir) * 0.5, minR));
                const x = cx + r * Math.cos(rad);
                const y = cy + r * Math.sin(rad);
                return (
                  <g>
                    <rect
                      x={x - pw / 2}
                      y={y - ph / 2}
                      width={pw}
                      height={ph}
                      rx={ph / 2}
                      fill={isDark ? "rgba(15,23,42,0.78)" : "rgba(255,255,255,0.85)"}
                      stroke={isDark ? "rgba(148,163,184,0.2)" : "rgba(148,163,184,0.3)"}
                      strokeWidth={1}
                    />
                    <text
                      x={x}
                      y={y}
                      fill={isDark ? "#e2e8f0" : "#1f2937"}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={11}
                      fontWeight={700}
                    >
                      {label}
                    </text>
                  </g>
                );
              }}
            >
              {data.map((entry, i) => (
                <Cell key={`${entry.name}-${i}`} fill={entry.color} />
              ))}
            </Pie>
            {/* zIndex 50 so the tooltip renders above the z-10 disk overlay */}
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={tooltipTextStyle}
              itemStyle={tooltipTextStyle}
              wrapperStyle={{ zIndex: 50, outline: "none" }}
            />
          </PieChart>

          {/* Centre disk — pointer-events-none so hover still reaches the SVG.
              top-1/2 left-1/2 -translate centres on the PieChart's cx/cy. */}
          <div
            className={`pointer-events-none absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full border text-center shadow-[0_8px_24px_rgba(15,23,42,0.12)] ${
              isDark ? "border-slate-700 bg-slate-900/95" : "border-white bg-white/95"
            }`}
            style={{ width: CENTER_DISK, height: CENTER_DISK }}
          >
            <div className="px-2">
              <p className={`font-spartan font-bold leading-none ${
                String(total).length > 4 ? "text-[1.1rem]" : "text-[1.5rem]"
              } ${t.cardText}`}>
                {total}
              </p>
              <p className={`mt-1 text-[8px] font-black uppercase tracking-[0.14em] ${t.subtleText}`}>
                {centerLabel}
              </p>
            </div>
          </div>
        </div>

        {/* Legend — click to toggle slices */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
          {data.map((item, i) => {
            const isHidden = hidden.has(item.name);
            return (
              <button
                key={i}
                type="button"
                onClick={() => toggleHidden(item.name)}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium font-kumbh transition-all select-none ${
                  isHidden ? "opacity-40" : "opacity-100"
                } ${isDark ? "text-slate-300 hover:bg-slate-700/60" : "text-slate-600 hover:bg-slate-100"}`}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: isHidden ? (isDark ? "#475569" : "#cbd5e1") : item.color }}
                />
                <span className={isHidden ? "line-through" : ""}>{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AdminLanding() {
  const { tr } = useLanguage();
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("appTheme") || "modern",
  );
  const [incidents, setIncidents] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [showKebab, setShowKebab] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  // Per-chart legend toggle state
  const [hiddenMonthly, toggleMonthly] = useToggleSet();
  const [hiddenTrend, toggleTrend] = useToggleSet();
  const [hiddenApptMonthly, toggleApptMonthly] = useToggleSet();
  const [hiddenCombined, toggleCombined] = useToggleSet();
  const kebabRef = useRef(null);

  useEffect(() => {
    const handleThemeChange = (e) => setCurrentTheme(e.detail);
    window.addEventListener("themeChange", handleThemeChange);
    return () => window.removeEventListener("themeChange", handleThemeChange);
  }, []);

  useEffect(() => {
    if (!showKebab) return;
    const handleOutsideClick = (e) => {
      if (kebabRef.current && !kebabRef.current.contains(e.target)) {
        setShowKebab(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showKebab]);

  const t = themeTokens[currentTheme] || themeTokens.modern || themeTokens.blue;
  const isDark = currentTheme === "dark";
  const accent = themeAccentMap[currentTheme] || themeAccentMap.modern;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [incData, compData] = await Promise.all([
        incidentService.getAllIncidents(),
        getAllComplaints(),
      ]);
      const incidentsArray = Array.isArray(incData)
        ? incData
        : incData?.data || [];
      const complaintsArray = Array.isArray(compData)
        ? compData
        : compData?.data || [];
      const appointmentArray = [];

      complaintsArray.forEach((complaint) => {
        (complaint.appointments || []).forEach((appointment) => {
          appointmentArray.push({
            ...appointment,
            complaint_id: appointment.complaint_id ?? complaint.id,
          });
        });
      });

      setIncidents(incidentsArray);
      setComplaints(complaintsArray);
      setAppointments(appointmentArray);
    } catch (err) {
      console.error("Failed to fetch admin dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const fetchAnalytics = async () => {
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      try {
        const result = await analyticsService.getAllData();
        if (active) setAnalyticsData(result);
      } catch (err) {
        if (active)
          setAnalyticsError(err?.message || "Failed to fetch analytics data");
      } finally {
        if (active) setAnalyticsLoading(false);
      }
    };
    fetchAnalytics();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const user = getUser();
  const firstName = user?.name?.split(" ")[0] || "Admin";

  const overview = useMemo(() => {
    const totalRequests = incidents.length + complaints.length;
    const pendingRequests = [...incidents, ...complaints].filter((r) => {
      const s = String(r?.status || "").toLowerCase();
      return s === "pending" || s === "ongoing" || s === "in_progress";
    }).length;

    const openComplaints = complaints.filter((c) => {
      const s = String(c?.status || "").toLowerCase();
      return s === "pending" || s === "ongoing" || s === "in_progress";
    }).length;
    const incidentReports = incidents.length;
    const pendingAppointments = appointments.filter((a) => {
      const status = String(a?.status || "")
        .toLowerCase()
        .replace(/-/g, "_");
      return status === "scheduled" || status === "rescheduled";
    }).length;

    return {
      totalRequests,
      pendingRequests,
      openComplaints,
      incidentReports,
      pendingAppointments,
    };
  }, [incidents, complaints, appointments]);

  const monthlyData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        name: d.toLocaleString("default", { month: "short" }),
        monthNum: d.getMonth(),
        year: d.getFullYear(),
        Incidents: 0,
        Complaints: 0,
      });
    }

    incidents.forEach((item) => {
      const d = new Date(item.created_at);
      const target = months.find(
        (m) => m.monthNum === d.getMonth() && m.year === d.getFullYear(),
      );
      if (target) target.Incidents += 1;
    });

    complaints.forEach((item) => {
      const d = new Date(item.created_at || item.incident_date);
      const target = months.find(
        (m) => m.monthNum === d.getMonth() && m.year === d.getFullYear(),
      );
      if (target) target.Complaints += 1;
    });

    return months.map(({ name, Incidents, Complaints }) => ({
      name,
      Incidents,
      Complaints,
    }));
  }, [incidents, complaints]);

  const statusData = useMemo(() => {
    const all = [...incidents, ...complaints].map((r) =>
      normalizeStatus(r.status),
    );
    const counts = { ongoing: 0, resolved: 0, rejected: 0 };
    all.forEach((s) => {
      counts[s] += 1;
    });
    return [
      { name: "Ongoing", value: counts.ongoing, color: STATUS_COLORS.ongoing },
      {
        name: "Resolved",
        value: counts.resolved,
        color: STATUS_COLORS.resolved,
      },
      {
        name: "Rejected",
        value: counts.rejected,
        color: STATUS_COLORS.rejected,
      },
    ].filter((x) => x.value > 0);
  }, [incidents, complaints]);

  const trendData = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days.push({
        key: d.toISOString().split("T")[0],
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        Incidents: 0,
        Complaints: 0,
      });
    }

    incidents.forEach((i) => {
      const key = String(i.created_at || "").split("T")[0];
      const target = days.find((d) => d.key === key);
      if (target) target.Incidents += 1;
    });

    complaints.forEach((c) => {
      const key = String(c.created_at || c.incident_date || "").split("T")[0];
      const target = days.find((d) => d.key === key);
      if (target) target.Complaints += 1;
    });

    return days.map(({ date, Incidents, Complaints }) => ({
      date,
      Incidents,
      Complaints,
    }));
  }, [incidents, complaints]);

  const categoryData = useMemo(() => {
    const bucket = {};

    incidents.forEach((item) => {
      let types = [];
      try {
        const parsed = JSON.parse(item.type);
        types = Array.isArray(parsed) ? parsed : [String(parsed)];
      } catch {
        types = [item.type || "Other"];
      }
      types.forEach((tpe) => {
        const label = tpe.charAt(0).toUpperCase() + tpe.slice(1);
        bucket[label] = (bucket[label] || 0) + 1;
      });
    });

    complaints.forEach((item) => {
      const label = item.type
        ? item.type.charAt(0).toUpperCase() + item.type.slice(1)
        : "Other";
      bucket[label] = (bucket[label] || 0) + 1;
    });

    return Object.entries(bucket).map(([name, value], idx) => ({
      name,
      value,
      color: CHART_COLORS[idx % CHART_COLORS.length],
    }));
  }, [incidents, complaints]);

  const appointmentStatusData = useMemo(() => {
    const counts = { Pending: 0, Approved: 0, Rejected: 0 };
    appointments.forEach((a) => {
      const s = String(a.status || "scheduled")
        .toLowerCase()
        .replace(/-/g, "_");
      if (s === "completed") counts.Approved += 1;
      else if (s === "cancelled" || s === "no_show") counts.Rejected += 1;
      else counts.Pending += 1;
    });

    return [
      { name: "Pending", value: counts.Pending, color: STATUS_COLORS.pending },
      {
        name: "Approved",
        value: counts.Approved,
        color: STATUS_COLORS.approved,
      },
      {
        name: "Rejected",
        value: counts.Rejected,
        color: STATUS_COLORS.rejected,
      },
    ].filter((x) => x.value > 0);
  }, [appointments]);

  const monthlyAppointmentData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        name: d.toLocaleString("default", { month: "short" }),
        monthNum: d.getMonth(),
        year: d.getFullYear(),
        Scheduled: 0,
        Rescheduled: 0,
        Completed: 0,
        Cancelled: 0,
        "No Show": 0,
      });
    }

    appointments.forEach((a) => {
      const d = new Date(a.date || a.created_at);
      const m = months.find(
        (x) => x.monthNum === d.getMonth() && x.year === d.getFullYear(),
      );
      if (!m) return;
      const s = String(a.status || "scheduled")
        .toLowerCase()
        .replace(/-/g, "_");
      if (s === "scheduled") m.Scheduled += 1;
      else if (s === "rescheduled") m.Rescheduled += 1;
      else if (s === "completed") m.Completed += 1;
      else if (s === "cancelled") m.Cancelled += 1;
      else if (s === "no_show") m["No Show"] += 1;
    });

    return months.map(({ name, Scheduled, Rescheduled, Completed, Cancelled, "No Show": noShow }) => ({
      name,
      Scheduled,
      Rescheduled,
      Completed,
      Cancelled,
      "No Show": noShow,
    }));
  }, [appointments]);

  const combinedLoadData = useMemo(
    () =>
      monthlyData.map((m, idx) => ({
        name: m.name,
        Requests: m.Incidents + m.Complaints,
        Appointments:
          (monthlyAppointmentData[idx]?.Pending || 0) +
          (monthlyAppointmentData[idx]?.Approved || 0) +
          (monthlyAppointmentData[idx]?.Rejected || 0),
      })),
    [monthlyData, monthlyAppointmentData],
  );

  const cardClass = `${t.cardBg} border ${isDark ? "border-slate-700" : "border-[#e6e8f1]"} rounded-2xl min-w-0`;
  const tooltipStyle = {
    backgroundColor: isDark ? "#1f2937" : "#ffffff",
    border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
    borderRadius: "10px",
    fontSize: "12px",
    color: isDark ? "#e2e8f0" : "#1e293b",
  };
  const tooltipTextStyle = { color: isDark ? "#e2e8f0" : "#1e293b" };
  const heroClass = isDark
    ? `${cardClass} relative overflow-hidden p-5 sm:p-6 bg-slate-800/80`
    : `${cardClass} relative overflow-hidden p-5 sm:p-6 bg-gradient-to-r from-white via-white to-slate-50/60`;
  const heroGlowClass = accent.glow;
  const heroChipClass = isDark
    ? "bg-slate-700 text-slate-300"
    : "bg-slate-100 text-slate-500";
  const announcementButtonClass = `inline-flex items-center gap-2 px-5 h-10 rounded-2xl bg-gradient-to-r ${t.primaryGrad} text-white text-sm font-medium shadow-lg transition-all cursor-default ${
    accent.shadow
  }`;
  const liveBadgeClass = isDark
    ? accent.live
    : `${t.primaryLight} ${t.primaryText}`;
  const liveDotClass = accent.dot;
  const iconChipStyles = {
    pendingRequests: {
      backgroundColor: isDark ? "rgba(22, 163, 74, 0.16)" : "#ecfdf5",
      color: "#16a34a",
    },
    openComplaints: {
      backgroundColor: isDark ? "rgba(22, 163, 74, 0.16)" : "#ecfdf5",
      color: "#16a34a",
    },
    incidentReports: {
      backgroundColor: isDark ? "rgba(148, 163, 184, 0.18)" : "#f1f5f9",
      color: "#64748b",
    },
    pendingAppointments: {
      backgroundColor: isDark ? "rgba(245, 158, 11, 0.16)" : "#fffbeb",
      color: "#d97706",
    },
  };

  return (
    <div className={`min-h-full ${t.pageBg}`}>
      <div className="w-full px-4 sm:px-5 py-4 sm:py-6 space-y-5">
        <section className={heroClass}>
          <div
            className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none ${heroGlowClass}`}
          />
          <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] items-start gap-4 sm:gap-6">
            <div className="space-y-2 text-left justify-self-start">
              <div
                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-medium ${heroChipClass}`}
              >
                {tr.adminLanding.overview}
              </div>
              <h1
                className={`font-spartan text-[2.2rem] sm:text-[2.8rem] font-bold leading-none tracking-tight ${t.cardText}`}
              >
                {tr.adminLanding.welcomeBack} {firstName}
              </h1>
              <p
                className={`text-[11px] sm:text-[13px] font-kumbh ${t.subtleText}`}
              >
                {tr.adminLanding.monitorDesc}
              </p>
            </div>
            <div className="flex items-start self-start justify-self-start lg:justify-self-end">
              <button type="button" className={announcementButtonClass}>
                <span className="inline-flex w-5 h-5 rounded-full bg-white/20 items-center justify-center">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 20l-6-3-6 3V5a2 2 0 012-2h8a2 2 0 012 2v15z"
                    />
                  </svg>
                </span>
                {tr.adminLanding.viewAnnouncements}
              </button>
            </div>
          </div>
        </section>

        <section className="px-1 sm:px-1">
          {analyticsLoading && (
            <div className={`${cardClass} p-4 text-sm ${t.subtleText}`}>
              Loading barangay overview...
            </div>
          )}
          {!analyticsLoading && analyticsError && (
            <div className={`${cardClass} p-4 text-sm text-red-500`}>
              {analyticsError}
            </div>
          )}
          {!analyticsLoading && !analyticsError && analyticsData && (
            <OverviewTab raw={analyticsData} t={t} />
          )}
        </section>

        <section className="px-1 sm:px-1 pt-6 sm:pt-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2
                className={`font-spartan text-lg sm:text-2xl font-semibold tracking-tight leading-none ${t.cardText}`}
              >
                {tr.adminLanding.analyticsDashboard}
              </h2>
              <span
                className={`inline-flex items-center gap-1 h-5 px-2 rounded-full text-[10px] font-medium font-kumbh ${liveBadgeClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${liveDotClass}`} />
                {tr.adminLanding.live}
              </span>
            </div>
            <div className="relative" ref={kebabRef}>
              <button
                type="button"
                onClick={() => setShowKebab((prev) => !prev)}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                  isDark
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              </button>
              {showKebab && (
                <div
                  className={`absolute right-0 top-full mt-2 w-52 rounded-xl border shadow-lg z-20 overflow-hidden ${
                    isDark
                      ? "bg-slate-800 border-slate-700"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowKebab(false);
                      setShowInsights(true);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-kumbh font-medium transition-colors ${
                      isDark
                        ? "text-slate-200 hover:bg-slate-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <svg
                      className="h-4 w-4 text-amber-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    {tr.adminLanding.generateInsights}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2.5">
          <article className={`${cardClass} p-3.5`}>
            <div className="flex items-start justify-between">
              <p
                className={`text-[13px] sm:text-[14px] font-normal ${t.cardText}`}
              >
                {tr.adminLanding.pendingRequests}
              </p>
              <span
                className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-md"
                style={iconChipStyles.pendingRequests}
              >
                <svg
                  className="h-[14px] w-[14px]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V9m-6-4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </span>
            </div>
            <p
              className={`mt-2 text-[2rem] font-semibold leading-none ${t.cardText}`}
            >
              {loading ? "..." : overview.pendingRequests}
            </p>
            <div className="mt-2.5">
              <span
                className={`text-[10px] sm:text-[11px] font-medium ${t.subtleText}`}
              >
                {tr.adminLanding.awaitingReview}
              </span>
            </div>
          </article>

          <article className={`${cardClass} p-3.5`}>
            <div className="flex items-start justify-between">
              <p
                className={`text-[13px] sm:text-[14px] font-normal ${t.cardText}`}
              >
                {tr.adminLanding.openComplaints}
              </p>
              <span
                className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-md"
                style={iconChipStyles.openComplaints}
              >
                <svg
                  className="h-[14px] w-[14px]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </span>
            </div>
            <p
              className={`mt-2 text-[2rem] font-semibold leading-none ${t.cardText}`}
            >
              {loading ? "..." : overview.openComplaints}
            </p>
            <div className="mt-2.5">
              <span
                className={`text-[10px] sm:text-[11px] font-medium ${t.subtleText}`}
              >
                {tr.adminLanding.activeUnresolved}
              </span>
            </div>
          </article>

          <article className={`${cardClass} p-3.5`}>
            <div className="flex items-start justify-between">
              <p
                className={`text-[13px] sm:text-[14px] font-normal ${t.cardText}`}
              >
                {tr.adminLanding.incidentReports}
              </p>
              <span
                className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-md"
                style={iconChipStyles.incidentReports}
              >
                <svg
                  className="h-[14px] w-[14px]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </span>
            </div>
            <p
              className={`mt-2 text-[2rem] font-semibold leading-none ${t.cardText}`}
            >
              {loading ? "..." : overview.incidentReports}
            </p>
            <div className="mt-2.5">
              <span
                className={`text-[10px] sm:text-[11px] font-medium ${t.subtleText}`}
              >
                {tr.adminLanding.filedReports}
              </span>
            </div>
          </article>

          <article className={`${cardClass} p-3.5`}>
            <div className="flex items-start justify-between">
              <p
                className={`text-[13px] sm:text-[14px] font-normal ${t.cardText}`}
              >
                {tr.adminLanding.pendingAppointments}
              </p>
              <span
                className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-md"
                style={iconChipStyles.pendingAppointments}
              >
                <svg
                  className="h-[14px] w-[14px]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </span>
            </div>
            <p
              className={`mt-2 text-[2rem] font-semibold leading-none ${t.cardText}`}
            >
              {loading ? "..." : overview.pendingAppointments}
            </p>
            <div className="mt-2.5">
              <span
                className={`text-[10px] sm:text-[11px] font-medium ${t.subtleText}`}
              >
                {tr.adminLanding.waitingSlot}
              </span>
            </div>
          </article>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          <article className={`${cardClass} p-4`}>
            <h3 className={`text-lg font-bold ${t.cardText} mb-3`}>
              {tr.adminLanding.monthlyReports}
            </h3>
            <div className="h-[290px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={monthlyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? "#374151" : "#e5e7eb"}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 11,
                      fill: isDark ? "#94a3b8" : "#64748b",
                    }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fontSize: 11,
                      fill: isDark ? "#94a3b8" : "#64748b",
                    }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipTextStyle}
                    itemStyle={tooltipTextStyle}
                  />
                  <Legend content={(props) => <ChartLegend {...props} hidden={hiddenMonthly} onToggle={toggleMonthly} isDark={isDark} />} />
                  <Bar dataKey="Incidents" fill="#3B82F6" radius={[6, 6, 0, 0]} hide={hiddenMonthly.has("Incidents")} />
                  <Bar dataKey="Complaints" fill="#14B8A6" radius={[6, 6, 0, 0]} hide={hiddenMonthly.has("Complaints")} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <DonutCard
            title={tr.adminLanding.caseResolution}
            data={statusData}
            isDark={isDark}
            t={t}
            cardClass={cardClass}
            centerLabel="Cases"
            tooltipStyle={tooltipStyle}
            tooltipTextStyle={tooltipTextStyle}
          />

          <article className={`${cardClass} p-4`}>
            <h3 className={`text-lg font-bold ${t.cardText} mb-3`}>
              {tr.adminLanding.reportTrend}
            </h3>
            <div className="h-[290px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <LineChart data={trendData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? "#374151" : "#e5e7eb"}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{
                      fontSize: 11,
                      fill: isDark ? "#94a3b8" : "#64748b",
                    }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fontSize: 11,
                      fill: isDark ? "#94a3b8" : "#64748b",
                    }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipTextStyle}
                    itemStyle={tooltipTextStyle}
                  />
                  <Legend content={(props) => <ChartLegend {...props} hidden={hiddenTrend} onToggle={toggleTrend} isDark={isDark} />} />
                  <Line
                    type="monotone"
                    dataKey="Incidents"
                    stroke="#3B82F6"
                    strokeWidth={2.5}
                    dot={{ r: 2 }}
                    hide={hiddenTrend.has("Incidents")}
                  />
                  <Line
                    type="monotone"
                    dataKey="Complaints"
                    stroke="#14B8A6"
                    strokeWidth={2.5}
                    dot={{ r: 2 }}
                    hide={hiddenTrend.has("Complaints")}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <DonutCard
            title={tr.adminLanding.reportCategories}
            data={categoryData}
            isDark={isDark}
            t={t}
            cardClass={cardClass}
            centerLabel="Types"
            tooltipStyle={tooltipStyle}
            tooltipTextStyle={tooltipTextStyle}
          />

          <DonutCard
            title={tr.adminLanding.appointmentStatus}
            data={appointmentStatusData}
            isDark={isDark}
            t={t}
            cardClass={cardClass}
            centerLabel="Appts"
            tooltipStyle={tooltipStyle}
            tooltipTextStyle={tooltipTextStyle}
          />

          <article className={`${cardClass} p-4`}>
            <h3 className={`text-lg font-bold ${t.cardText} mb-3`}>
              {tr.adminLanding.monthlyAppointments}
            </h3>
            <div className="h-[290px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={monthlyAppointmentData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? "#374151" : "#e5e7eb"}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 11,
                      fill: isDark ? "#94a3b8" : "#64748b",
                    }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fontSize: 11,
                      fill: isDark ? "#94a3b8" : "#64748b",
                    }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipTextStyle}
                    itemStyle={tooltipTextStyle}
                  />
                  <Legend content={(props) => <ChartLegend {...props} hidden={hiddenApptMonthly} onToggle={toggleApptMonthly} isDark={isDark} />} />
                  <Bar dataKey="Scheduled" fill="#2563eb" radius={[6, 6, 0, 0]} hide={hiddenApptMonthly.has("Scheduled")} />
                  <Bar dataKey="Rescheduled" fill="#f59e0b" radius={[6, 6, 0, 0]} hide={hiddenApptMonthly.has("Rescheduled")} />
                  <Bar dataKey="Completed" fill="#16a34a" radius={[6, 6, 0, 0]} hide={hiddenApptMonthly.has("Completed")} />
                  <Bar dataKey="Cancelled" fill="#dc2626" radius={[6, 6, 0, 0]} hide={hiddenApptMonthly.has("Cancelled")} />
                  <Bar dataKey="No Show" fill="#64748b" radius={[6, 6, 0, 0]} hide={hiddenApptMonthly.has("No Show")} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-3">
          <article className={`${cardClass} p-4`}>
            <h3 className={`text-lg font-bold ${t.cardText} mb-3`}>
              {tr.adminLanding.requestsVsAppointments}
            </h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={combinedLoadData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? "#374151" : "#e5e7eb"}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 11,
                      fill: isDark ? "#94a3b8" : "#64748b",
                    }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fontSize: 11,
                      fill: isDark ? "#94a3b8" : "#64748b",
                    }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipTextStyle}
                    itemStyle={tooltipTextStyle}
                  />
                  <Legend content={(props) => <ChartLegend {...props} hidden={hiddenCombined} onToggle={toggleCombined} isDark={isDark} />} />
                  <Area
                    type="monotone"
                    dataKey="Requests"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.18}
                    strokeWidth={2}
                    hide={hiddenCombined.has("Requests")}
                  />
                  <Area
                    type="monotone"
                    dataKey="Appointments"
                    stroke="#14B8A6"
                    fill="#14B8A6"
                    fillOpacity={0.14}
                    strokeWidth={2}
                    hide={hiddenCombined.has("Appointments")}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>

        <section className={`${cardClass} p-4 sm:p-5 space-y-4`}>
          <div>
            <h2 className={`text-2xl font-bold ${t.cardText}`}>
              {tr.adminLanding.issuanceFactors}
            </h2>
            <p className={`text-sm mt-1 ${t.subtleText}`}>
              {tr.adminLanding.issuanceFactorsDesc}
            </p>
          </div>

          <div>
            <h3 className={`text-lg font-bold ${t.cardText} mb-3`}>
              {tr.adminLanding.volumes}
            </h3>
            <VolumesFactors t={t} isDark={isDark} currentTheme={currentTheme} />
          </div>

          <div>
            <OperationsFactors
              t={t}
              isDark={isDark}
              currentTheme={currentTheme}
            />
          </div>

          <div>
            <h3 className={`text-lg font-bold ${t.cardText} mb-3`}>
              {tr.adminLanding.socioEconomy}
            </h3>
            <SocioEconomyFactors
              t={t}
              isDark={isDark}
              currentTheme={currentTheme}
            />
          </div>
        </section>
      </div>

      <InsightsModal
        isOpen={showInsights}
        onClose={() => setShowInsights(false)}
        incidents={incidents}
        complaints={complaints}
        appointments={appointments}
      />
    </div>
  );
}
