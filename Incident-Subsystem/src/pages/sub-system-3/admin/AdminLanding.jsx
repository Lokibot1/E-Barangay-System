import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../../../context/LanguageContext";
import themeTokens from "../../../Themetokens";
import { getUser } from "../../../homepage/services/loginService";
import { incidentService } from "../../../services/sub-system-3/incidentService";
import { getAllComplaints } from "../../../services/sub-system-3/complaintService";
import InsightsModal from "../../../components/sub-system-3/InsightsModal";
import VolumesFactors from "../../../components/sub-system-2/factors/VolumesFactors";
import OperationsFactors from "../../../components/sub-system-2/factors/OperationsFactors";
import SocioEconomyFactors from "../../../components/sub-system-2/factors/SocioEconomyFactors";
import { CHART_COLORS, STATUS_COLORS } from "../../../components/sub-system-2/factors/data";
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
  if (s === "pending" || s === "ongoing" || s === "in_progress") return "ongoing";
  if (s === "resolved" || s === "completed" || s === "closed" || s === "approved") return "resolved";
  if (s === "rejected" || s === "denied" || s === "dismissed") return "rejected";
  return "ongoing";
};

export default function AdminLanding() {
  const { tr } = useLanguage();
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem("appTheme") || "modern");
  const [incidents, setIncidents] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showKebab, setShowKebab] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
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
      const incidentsArray = Array.isArray(incData) ? incData : incData?.data || [];
      const complaintsArray = Array.isArray(compData) ? compData : compData?.data || [];
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
      const status = String(a?.status || "").toLowerCase().replace(/-/g, "_");
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
      const target = months.find((m) => m.monthNum === d.getMonth() && m.year === d.getFullYear());
      if (target) target.Incidents += 1;
    });

    complaints.forEach((item) => {
      const d = new Date(item.created_at || item.incident_date);
      const target = months.find((m) => m.monthNum === d.getMonth() && m.year === d.getFullYear());
      if (target) target.Complaints += 1;
    });

    return months.map(({ name, Incidents, Complaints }) => ({ name, Incidents, Complaints }));
  }, [incidents, complaints]);

  const statusData = useMemo(() => {
    const all = [...incidents, ...complaints].map((r) => normalizeStatus(r.status));
    const counts = { ongoing: 0, resolved: 0, rejected: 0 };
    all.forEach((s) => {
      counts[s] += 1;
    });
    return [
      { name: "Ongoing", value: counts.ongoing, color: STATUS_COLORS.ongoing },
      { name: "Resolved", value: counts.resolved, color: STATUS_COLORS.resolved },
      { name: "Rejected", value: counts.rejected, color: STATUS_COLORS.rejected },
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

    return days.map(({ date, Incidents, Complaints }) => ({ date, Incidents, Complaints }));
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
      const label = item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : "Other";
      bucket[label] = (bucket[label] || 0) + 1;
    });

    return Object.entries(bucket).map(([name, value]) => ({ name, value }));
  }, [incidents, complaints]);

  const appointmentStatusData = useMemo(() => {
    const counts = { Pending: 0, Approved: 0, Rejected: 0 };
    appointments.forEach((a) => {
      const s = String(a.status || "scheduled").toLowerCase().replace(/-/g, "_");
      if (s === "completed") counts.Approved += 1;
      else if (s === "cancelled" || s === "no_show") counts.Rejected += 1;
      else counts.Pending += 1;
    });

    return [
      { name: "Pending", value: counts.Pending, color: STATUS_COLORS.pending },
      { name: "Approved", value: counts.Approved, color: STATUS_COLORS.approved },
      { name: "Rejected", value: counts.Rejected, color: STATUS_COLORS.rejected },
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
        Pending: 0,
        Approved: 0,
        Rejected: 0,
      });
    }

    appointments.forEach((a) => {
      const d = new Date(a.date || a.created_at);
      const m = months.find((x) => x.monthNum === d.getMonth() && x.year === d.getFullYear());
      if (!m) return;
      const s = String(a.status || "scheduled").toLowerCase().replace(/-/g, "_");
      if (s === "completed") m.Approved += 1;
      else if (s === "cancelled" || s === "no_show") m.Rejected += 1;
      else m.Pending += 1;
    });

    return months.map(({ name, Pending, Approved, Rejected }) => ({ name, Pending, Approved, Rejected }));
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
    [monthlyData, monthlyAppointmentData]
  );

  const cardClass = `${t.cardBg} border ${isDark ? "border-slate-700" : "border-[#e6e8f1]"} rounded-2xl`;
  const tooltipStyle = {
    backgroundColor: isDark ? "#1f2937" : "#ffffff",
    border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
    borderRadius: "10px",
    fontSize: "12px",
    color: isDark ? "#e2e8f0" : "#1e293b",
  };
  const heroClass = isDark
    ? `${cardClass} relative overflow-hidden p-5 sm:p-6 bg-slate-800/80`
    : `${cardClass} relative overflow-hidden p-5 sm:p-6 bg-gradient-to-r from-white via-white to-slate-50/60`;
  const heroGlowClass = accent.glow;
  const heroChipClass = isDark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-500";
  const announcementButtonClass = `inline-flex items-center gap-2 px-5 h-10 rounded-2xl bg-gradient-to-r ${t.primaryGrad} text-white text-sm font-medium shadow-lg transition-all cursor-default ${
    accent.shadow
  }`;
  const liveBadgeClass = isDark ? accent.live : `${t.primaryLight} ${t.primaryText}`;
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
          <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none ${heroGlowClass}`} />
          <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] items-start gap-4 sm:gap-6">
            <div className="space-y-2 text-left justify-self-start">
              <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-medium ${heroChipClass}`}>
                {tr.adminLanding.overview}
              </div>
              <h1 className={`font-spartan text-[2.2rem] sm:text-[2.8rem] font-bold leading-none tracking-tight ${t.cardText}`}>
                {tr.adminLanding.welcomeBack} {firstName}
              </h1>
              <p className={`text-[11px] sm:text-[13px] font-kumbh ${t.subtleText}`}>
                {tr.adminLanding.monitorDesc}
              </p>
            </div>
            <div className="flex items-start self-start justify-self-start lg:justify-self-end">
              <button
                type="button"
                className={announcementButtonClass}
              >
                <span className="inline-flex w-5 h-5 rounded-full bg-white/20 items-center justify-center">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20l-6-3-6 3V5a2 2 0 012-2h8a2 2 0 012 2v15z" />
                  </svg>
                </span>
                {tr.adminLanding.viewAnnouncements}
              </button>
            </div>
          </div>
        </section>

        <section className="px-1 sm:px-1 pt-6 sm:pt-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className={`font-spartan text-lg sm:text-2xl font-semibold tracking-tight leading-none ${t.cardText}`}>
                {tr.adminLanding.analyticsDashboard}
              </h2>
              <span className={`inline-flex items-center gap-1 h-5 px-2 rounded-full text-[10px] font-medium font-kumbh ${liveBadgeClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${liveDotClass}`} />
                {tr.adminLanding.live}
              </span>
            </div>
            <div className="relative" ref={kebabRef}>
              <button
                type="button"
                onClick={() => setShowKebab((prev) => !prev)}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                  isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              </button>
              {showKebab && (
                <div
                  className={`absolute right-0 top-full mt-2 w-52 rounded-xl border shadow-lg z-20 overflow-hidden ${
                    isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowKebab(false);
                      setShowInsights(true);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-kumbh font-medium transition-colors ${
                      isDark ? "text-slate-200 hover:bg-slate-700" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <svg className="h-4 w-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
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
              <p className={`text-[13px] sm:text-[14px] font-normal ${t.cardText}`}>{tr.adminLanding.pendingRequests}</p>
              <span className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-md" style={iconChipStyles.pendingRequests}>
                <svg className="h-[14px] w-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V9m-6-4h6m0 0v6m0-6L10 14" />
                </svg>
              </span>
            </div>
            <p className={`mt-2 text-[2rem] font-semibold leading-none ${t.cardText}`}>{loading ? "..." : overview.pendingRequests}</p>
            <div className="mt-2.5">
              <span className={`text-[10px] sm:text-[11px] font-medium ${t.subtleText}`}>{tr.adminLanding.awaitingReview}</span>
            </div>
          </article>

          <article className={`${cardClass} p-3.5`}>
            <div className="flex items-start justify-between">
              <p className={`text-[13px] sm:text-[14px] font-normal ${t.cardText}`}>{tr.adminLanding.openComplaints}</p>
              <span className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-md" style={iconChipStyles.openComplaints}>
                <svg className="h-[14px] w-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
            <p className={`mt-2 text-[2rem] font-semibold leading-none ${t.cardText}`}>{loading ? "..." : overview.openComplaints}</p>
            <div className="mt-2.5">
              <span className={`text-[10px] sm:text-[11px] font-medium ${t.subtleText}`}>{tr.adminLanding.activeUnresolved}</span>
            </div>
          </article>

          <article className={`${cardClass} p-3.5`}>
            <div className="flex items-start justify-between">
              <p className={`text-[13px] sm:text-[14px] font-normal ${t.cardText}`}>{tr.adminLanding.incidentReports}</p>
              <span className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-md" style={iconChipStyles.incidentReports}>
                <svg className="h-[14px] w-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
            <p className={`mt-2 text-[2rem] font-semibold leading-none ${t.cardText}`}>{loading ? "..." : overview.incidentReports}</p>
            <div className="mt-2.5">
              <span className={`text-[10px] sm:text-[11px] font-medium ${t.subtleText}`}>{tr.adminLanding.filedReports}</span>
            </div>
          </article>

          <article className={`${cardClass} p-3.5`}>
            <div className="flex items-start justify-between">
              <p className={`text-[13px] sm:text-[14px] font-normal ${t.cardText}`}>{tr.adminLanding.pendingAppointments}</p>
              <span className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-md" style={iconChipStyles.pendingAppointments}>
                <svg className="h-[14px] w-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
            </div>
            <p className={`mt-2 text-[2rem] font-semibold leading-none ${t.cardText}`}>{loading ? "..." : overview.pendingAppointments}</p>
            <div className="mt-2.5">
              <span className={`text-[10px] sm:text-[11px] font-medium ${t.subtleText}`}>{tr.adminLanding.waitingSlot}</span>
            </div>
          </article>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          <article className={`${cardClass} p-4`}>
            <h3 className={`text-lg font-bold ${t.cardText} mb-3`}>{tr.adminLanding.monthlyReports}</h3>
            <div className="h-[290px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Incidents" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Complaints" fill="#14B8A6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className={`${cardClass} p-4`}>
            <h3 className={`text-lg font-bold ${t.cardText} mb-3`}>{tr.adminLanding.caseResolution}</h3>
            <div className="h-[290px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={62} outerRadius={96} paddingAngle={4}>
                    {statusData.map((entry, idx) => (
                      <Cell key={`${entry.name}-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className={`${cardClass} p-4`}>
            <h3 className={`text-lg font-bold ${t.cardText} mb-3`}>{tr.adminLanding.reportTrend}</h3>
            <div className="h-[290px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="Incidents" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="Complaints" stroke="#14B8A6" strokeWidth={2.5} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className={`${cardClass} p-4`}>
            <h3 className={`text-lg font-bold ${t.cardText} mb-3`}>{tr.adminLanding.reportCategories}</h3>
            <div className="h-[290px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={96} paddingAngle={2}>
                    {categoryData.map((entry, idx) => (
                      <Cell key={`${entry.name}-${idx}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className={`${cardClass} p-4`}>
            <h3 className={`text-lg font-bold ${t.cardText} mb-3`}>{tr.adminLanding.appointmentStatus}</h3>
            <div className="h-[290px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={appointmentStatusData} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={62} outerRadius={96} paddingAngle={4}>
                    {appointmentStatusData.map((entry, idx) => (
                      <Cell key={`${entry.name}-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className={`${cardClass} p-4`}>
            <h3 className={`text-lg font-bold ${t.cardText} mb-3`}>{tr.adminLanding.monthlyAppointments}</h3>
            <div className="h-[290px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyAppointmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Pending" fill={STATUS_COLORS.pending} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Approved" fill={STATUS_COLORS.approved} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Rejected" fill={STATUS_COLORS.rejected} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-3">
          <article className={`${cardClass} p-4`}>
            <h3 className={`text-lg font-bold ${t.cardText} mb-3`}>{tr.adminLanding.requestsVsAppointments}</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={combinedLoadData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area
                    type="monotone"
                    dataKey="Requests"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.18}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="Appointments"
                    stroke="#14B8A6"
                    fill="#14B8A6"
                    fillOpacity={0.14}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>

        <section className={`${cardClass} p-4 sm:p-5 space-y-4`}>
          <div>
            <h2 className={`text-2xl font-bold ${t.cardText}`}>{tr.adminLanding.issuanceFactors}</h2>
            <p className={`text-sm mt-1 ${t.subtleText}`}>{tr.adminLanding.issuanceFactorsDesc}</p>
          </div>

          <div>
            <h3 className={`text-lg font-bold ${t.cardText} mb-3`}>{tr.adminLanding.volumes}</h3>
            <VolumesFactors t={t} isDark={isDark} currentTheme={currentTheme} />
          </div>

          <div>
          
            <OperationsFactors t={t} isDark={isDark} currentTheme={currentTheme} />
          </div>

          <div>
            <h3 className={`text-lg font-bold ${t.cardText} mb-3`}>{tr.adminLanding.socioEconomy}</h3>
            <SocioEconomyFactors t={t} isDark={isDark} currentTheme={currentTheme} />
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
