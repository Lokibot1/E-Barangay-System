import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../../../context/LanguageContext";
import themeTokens from "../../../Themetokens";
import { getUser } from "../../../homepage/services/loginService";
import { incidentService } from "../../../services/sub-system-3/incidentService";
import { getAllComplaints } from "../../../services/sub-system-3/complaintService";
import { analyticsService } from "../../../services/sub-system-1/analytics";
import OverviewTab from "../../../components/sub-system-1/analytics/tabs/OverviewTab";
import { DonutSummaryCard } from "../../../components/sub-system-1/analytics/AnalyticsInterface";
import InsightsModal from "../../../components/sub-system-3/InsightsModal";
import VolumesFactors from "../../../components/sub-system-2/factors/VolumesFactors";
import OperationsFactors from "../../../components/sub-system-2/factors/OperationsFactors";
import SocioEconomyFactors from "../../../components/sub-system-2/factors/SocioEconomyFactors";
import Toast from "../../../components/shared/modals/Toast";
import {
  CHART_COLORS,
  STATUS_COLORS,
} from "../../../components/sub-system-2/factors/data";
import {
  ANNOUNCEMENTS_UPDATED_EVENT,
  createScheduledAnnouncement,
  deleteScheduledAnnouncement,
  getScheduledAnnouncements,
  subscribeToAnnouncementAutoPublish,
} from "../../../services/shared/announcementBoardService";
import { recordLocalActivity } from "../../../services/shared/activityStreamService";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
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

// â”€â”€â”€ Chart legend toggle helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const toTitleCase = (value) =>
  String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();

const getSafeTimeValue = (value) => {
  const timestamp = new Date(value || 0).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const formatFeedDateTime = (value) => {
  const timestamp = getSafeTimeValue(value);
  if (!timestamp) return "No timestamp";

  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatAnnouncementDateTime = (value) => {
  const timestamp = getSafeTimeValue(value);
  if (!timestamp) return "Schedule pending";

  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatAnnouncementHistoryMeta = (value) => {
  const timestamp = getSafeTimeValue(value);
  if (!timestamp) return "Schedule pending";

  const diff = timestamp - Date.now();
  if (diff <= 0) {
    return "Live now";
  }

  const totalMinutes = Math.round(diff / 60000);
  if (totalMinutes < 60) {
    return `Posts in ${Math.max(totalMinutes, 1)} min`;
  }

  const totalHours = Math.round(totalMinutes / 60);
  if (totalHours < 24) {
    return `Posts in ${totalHours} hr`;
  }

  const totalDays = Math.round(totalHours / 24);
  return `Posts in ${totalDays} day${totalDays === 1 ? "" : "s"}`;
};

const toDateTimeLocalValue = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localTime.toISOString().slice(0, 16);
};

const toDateInputValue = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toTimeInputValue = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const formatEventDateLabel = (value) => {
  if (!value) return "Date to be announced";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatEventTimeLabel = (value) => {
  if (!value) return "Time to be announced";

  const [hours = "00", minutes = "00"] = String(value).split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const createAnnouncementFormState = () => {
  const defaultPublishDate = new Date();

  return {
    id: "",
    tag: "Advisory",
    title: "",
    desc: "",
    fullContent: "",
    publish_at: toDateTimeLocalValue(defaultPublishDate),
    created_at: "",
    event_date: "",
    event_start_time: "",
    event_end_time: "",
    event_location: "",
    urgent: false,
    media: null,
    clear_media: false,
  };
};

const MAX_ANNOUNCEMENT_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_ANNOUNCEMENT_VIDEO_SIZE = 100 * 1024 * 1024;

const formatFileSize = (size = 0) => {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (size >= 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${size} B`;
};

const getAnnouncementMediaKind = (file) =>
  String(file?.type || "").startsWith("video/") ? "video" : "image";

const isSupportedAnnouncementMedia = (file) => {
  const type = String(file?.type || "").toLowerCase();
  return type.startsWith("image/") || type.startsWith("video/");
};

const getAnnouncementMediaSizeLimit = (file) =>
  getAnnouncementMediaKind(file) === "video"
    ? MAX_ANNOUNCEMENT_VIDEO_SIZE
    : MAX_ANNOUNCEMENT_IMAGE_SIZE;

const revokeObjectUrl = (value) => {
  if (typeof value === "string" && value.startsWith("blob:")) {
    URL.revokeObjectURL(value);
  }
};

const isImmediatePublishTime = (value) => {
  const timestamp = new Date(value || 0).getTime();
  if (!Number.isFinite(timestamp)) {
    return true;
  }

  return timestamp <= Date.now();
};

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

// â”€â”€â”€ Shared Donut Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function DonutCard({ title, data, isDark, t, cardClass, centerLabel = "Total", tooltipStyle, tooltipTextStyle, subtitle }) {
  return (
    <DonutSummaryCard
      title={title}
      subtitle={subtitle}
      rightLabel="Distribution"
      data={data}
      centerLabel={centerLabel}
      className="h-full"
      t={t}
    />
  );
}
          





// â”€â”€â”€ Skeleton placeholders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ChartSkeleton({ height = 290, isDark, cardClass }) {
  const pulse = isDark ? "animate-pulse bg-slate-700/60 rounded-lg" : "animate-pulse bg-gray-200 rounded-lg";
  return (
    <article className={`${cardClass} p-4`}>
      <div className={`h-5 w-36 mb-3 ${pulse}`} />
      <div className={`${pulse} rounded-xl`} style={{ height }} />
    </article>
  );
}

function DonutSkeleton({ isDark, cardClass }) {
  const pulse = isDark ? "animate-pulse bg-slate-700/60" : "animate-pulse bg-gray-200";
  return (
    <article className={`${cardClass} p-5`}>
      <div className={`h-5 w-36 mb-4 rounded-lg ${pulse}`} />
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
          <div className={`w-full h-full rounded-full ${pulse}`} />
          <div className={`absolute rounded-full ${isDark ? "bg-slate-900" : "bg-white"}`} style={{ width: 72, height: 72 }} />
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {[72, 56, 64].map((w, i) => (
            <div key={i} className={`h-6 rounded-full ${pulse}`} style={{ width: w }} />
          ))}
        </div>
      </div>
    </article>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function SafeResponsiveChart({ className = "", children }) {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;

    const updateSize = () => {
      const rect = node.getBoundingClientRect();
      const nextWidth = Math.round(rect.width);
      const nextHeight = Math.round(rect.height);
      setSize((current) => {
        if (
          current.width === nextWidth &&
          current.height === nextHeight
        ) {
          return current;
        }
        return { width: nextWidth, height: nextHeight };
      });
    };

    updateSize();

    if (typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      updateSize();
    });
    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  const hasSize = size.width > 0 && size.height > 0;

  return (
    <div ref={containerRef} className={`w-full min-w-0 ${className}`}>
      {hasSize
        ? typeof children === "function"
          ? children(size)
          : children
        : <div className="h-full w-full" aria-hidden="true" />}
    </div>
  );
}

export default function AdminLanding() {
  const { tr } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("appTheme") || "modern",
  );
  const [incidents, setIncidents] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [showKebab, setShowKebab] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [showAnnouncementsPanel, setShowAnnouncementsPanel] = useState(false);
  const [announcementPanelTab, setAnnouncementPanelTab] = useState("create");
  const [scheduledAnnouncements, setScheduledAnnouncements] = useState([]);
  const [announcementForm, setAnnouncementForm] = useState(() =>
    createAnnouncementFormState(),
  );
  const [announcementSubmitting, setAnnouncementSubmitting] = useState(false);
  const [announcementMediaInputKey, setAnnouncementMediaInputKey] = useState(0);
  const [isAnnouncementMediaDragActive, setIsAnnouncementMediaDragActive] =
    useState(false);
  const [announcementFeedback, setAnnouncementFeedback] = useState({
    type: "",
    message: "",
  });
  const [announcementPendingDelete, setAnnouncementPendingDelete] = useState(null);
  const [announcementDeleteSubmitting, setAnnouncementDeleteSubmitting] =
    useState(false);

  // Per-chart legend toggle state
  const [hiddenMonthly, toggleMonthly] = useToggleSet();
  const [hiddenTrend, toggleTrend] = useToggleSet();
  const [hiddenApptMonthly, toggleApptMonthly] = useToggleSet();
  const [hiddenCombined, toggleCombined] = useToggleSet();
  const kebabRef = useRef(null);

  const addToast = useCallback((toast) => {
    setToasts((prev) => [...prev, { id: Date.now(), ...toast }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

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

  useEffect(() => {
    if (!showAnnouncementsPanel) return;

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowAnnouncementsPanel(false);
      }
    };

    setAnnouncementPanelTab("create");
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [showAnnouncementsPanel]);

  useEffect(() => {
    if (showAnnouncementsPanel) return;
    setAnnouncementPendingDelete(null);
    setAnnouncementDeleteSubmitting(false);
  }, [showAnnouncementsPanel]);

  const syncAnnouncements = useCallback(async () => {
    try {
      const items = await getScheduledAnnouncements();
      setScheduledAnnouncements(items);
    } catch {
      setScheduledAnnouncements([]);
    }
  }, []);

  useEffect(
    () => () => {
      revokeObjectUrl(announcementForm.media?.url);
    },
    [announcementForm.media?.url],
  );

  useEffect(() => {
    void syncAnnouncements();
  }, [syncAnnouncements]);

  useEffect(() => subscribeToAnnouncementAutoPublish(), []);

  useEffect(() => {
    window.addEventListener(ANNOUNCEMENTS_UPDATED_EVENT, syncAnnouncements);

    return () => {
      window.removeEventListener(ANNOUNCEMENTS_UPDATED_EVENT, syncAnnouncements);
    };
  }, [syncAnnouncements]);

  useEffect(() => {
    if (!location.state?.openAnnouncementsPanel) return;

    setShowAnnouncementsPanel(true);
    navigate(location.pathname, {
      replace: true,
      state: {
        ...(location.state || {}),
        openAnnouncementsPanel: undefined,
      },
    });
  }, [location.pathname, location.state, navigate]);

  const t = themeTokens[currentTheme] || themeTokens.modern || themeTokens.blue;
  const isDark = currentTheme === "dark";
  const accent = themeAccentMap[currentTheme] || themeAccentMap.modern;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setDataError(null);
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
      setDataError(err?.message || "Failed to fetch dashboard operational data.");
      addToast({
        type: "error",
        title: "Load Failed",
        message: "Could not load dashboard data. Please refresh.",
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const result = await analyticsService.getAllData();
      setAnalyticsData(result);
    } catch (err) {
      setAnalyticsError(err?.message || "Failed to fetch analytics data");
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const user = getUser();
  const firstName = user?.name?.split(" ")[0] || "Admin";
  const actorName = user?.name || "Admin";

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
          (monthlyAppointmentData[idx]?.Scheduled || 0) +
          (monthlyAppointmentData[idx]?.Rescheduled || 0) +
          (monthlyAppointmentData[idx]?.Completed || 0) +
          (monthlyAppointmentData[idx]?.Cancelled || 0) +
          (monthlyAppointmentData[idx]?.["No Show"] || 0),
      })),
    [monthlyData, monthlyAppointmentData],
  );

  const isEditingAnnouncement = Boolean(announcementForm.id);

  const publishActionLabel = useMemo(() => {
    if (isEditingAnnouncement) {
      return "Save announcement";
    }

    return isImmediatePublishTime(announcementForm.publish_at)
      ? "Publish announcement"
      : "Schedule announcement";
  }, [announcementForm.publish_at, isEditingAnnouncement]);

  const isEventAnnouncement = announcementForm.tag === "Event";

  const announcementHistoryItems = useMemo(
    () =>
      [...scheduledAnnouncements].sort(
        (a, b) =>
          getSafeTimeValue(a.publish_at || a.created_at) -
          getSafeTimeValue(b.publish_at || b.created_at),
      ),
    [scheduledAnnouncements],
  );

  const handleAnnouncementInputChange = (field, value) => {
    setAnnouncementForm((prev) => {
      const nextForm = {
        ...prev,
        [field]: value,
      };

      if (field === "media" && value) {
        nextForm.clear_media = false;
      }

      if (field === "tag" && value === "Event") {
        if (!nextForm.event_date) {
          nextForm.event_date = toDateInputValue(nextForm.publish_at);
        }

        if (!nextForm.event_start_time) {
          nextForm.event_start_time = toTimeInputValue(nextForm.publish_at);
        }
      }

      return nextForm;
    });

    if (announcementFeedback.message) {
      setAnnouncementFeedback({ type: "", message: "" });
    }
  };

  const clearAnnouncementMedia = () => {
    revokeObjectUrl(announcementForm.media?.url);
    setAnnouncementForm((prev) => ({
      ...prev,
      media: null,
      clear_media: Boolean(prev.media?.url),
    }));
    if (announcementFeedback.message) {
      setAnnouncementFeedback({ type: "", message: "" });
    }
    setAnnouncementMediaInputKey((current) => current + 1);
    setIsAnnouncementMediaDragActive(false);
  };

  const handleEditAnnouncement = (announcement) => {
    if (!announcement) return;

    revokeObjectUrl(announcementForm.media?.url);
    setAnnouncementForm({
      id: announcement.id || "",
      tag: announcement.tag || "Advisory",
      title: announcement.title || "",
      desc: announcement.desc || "",
      fullContent: announcement.fullContent || "",
      publish_at: toDateTimeLocalValue(
        announcement.publish_at || announcement.created_at,
      ),
      created_at: announcement.created_at || "",
      event_date:
        announcement.event_date ||
        (String(announcement.tag || "").toLowerCase() === "event"
          ? toDateInputValue(announcement.publish_at)
          : ""),
      event_start_time:
        announcement.event_start_time ||
        (String(announcement.tag || "").toLowerCase() === "event"
          ? toTimeInputValue(announcement.publish_at)
          : ""),
      event_end_time: announcement.event_end_time || "",
      event_location: announcement.event_location || "",
      urgent: Boolean(announcement.urgent),
      media: announcement.media?.url
        ? {
            kind: announcement.media.kind || announcement.media_kind || "image",
            type: announcement.media.type || announcement.media_type || "",
            name: announcement.media.name || announcement.media_name || "announcement-media",
            size: Number(
              announcement.media.size ?? announcement.media_size ?? 0,
            ),
            url: announcement.media.url,
          }
        : null,
      clear_media: false,
    });
    setAnnouncementMediaInputKey((current) => current + 1);
    setIsAnnouncementMediaDragActive(false);
    setAnnouncementFeedback({ type: "", message: "" });
    setAnnouncementPanelTab("create");
  };

  const handleAnnouncementMediaFile = async (file) => {
    if (!file) return;

    if (!isSupportedAnnouncementMedia(file)) {
      setAnnouncementFeedback({
        type: "error",
        message: "Please attach an image or video file only.",
      });
      setAnnouncementMediaInputKey((current) => current + 1);
      return;
    }

    const sizeLimit = getAnnouncementMediaSizeLimit(file);
    const kind = getAnnouncementMediaKind(file);

    if (file.size > sizeLimit) {
      setAnnouncementFeedback({
        type: "error",
        message:
          kind === "video"
            ? "Attached video must be 100 MB or smaller."
            : "Attached image must be 10 MB or smaller.",
      });
      setAnnouncementMediaInputKey((current) => current + 1);
      return;
    }

    try {
      revokeObjectUrl(announcementForm.media?.url);
      const previewUrl = URL.createObjectURL(file);
      handleAnnouncementInputChange("media", {
        kind,
        type: file.type,
        name: file.name,
        size: file.size,
        url: previewUrl,
        file,
      });
    } catch (error) {
      setAnnouncementFeedback({
        type: "error",
        message: error?.message || "Unable to attach the selected media file.",
      });
      setAnnouncementMediaInputKey((current) => current + 1);
    }
  };

  const handleAnnouncementMediaChange = async (event) => {
    const file = event.target.files?.[0];
    await handleAnnouncementMediaFile(file);
  };

  const handleAnnouncementMediaDragOver = (event) => {
    event.preventDefault();

    if (!isAnnouncementMediaDragActive) {
      setIsAnnouncementMediaDragActive(true);
    }
  };

  const handleAnnouncementMediaDragLeave = (event) => {
    event.preventDefault();

    if (event.currentTarget.contains(event.relatedTarget)) {
      return;
    }

    setIsAnnouncementMediaDragActive(false);
  };

  const handleAnnouncementMediaDrop = async (event) => {
    event.preventDefault();
    setIsAnnouncementMediaDragActive(false);
    const file = event.dataTransfer?.files?.[0];
    await handleAnnouncementMediaFile(file);
  };

  const handleScheduleAnnouncement = async (event) => {
    event.preventDefault();
    if (announcementSubmitting) return;

    const isEditing = Boolean(announcementForm.id);
    const title = announcementForm.title.trim();
    const desc = announcementForm.desc.trim();
    const fullContent = announcementForm.fullContent.trim();
    const publishAt = new Date(announcementForm.publish_at).toISOString();
    const eventLocation = announcementForm.event_location.trim();
    const publishesImmediately = isImmediatePublishTime(publishAt);

    if (!title || !desc || !fullContent || !announcementForm.publish_at) {
      setAnnouncementFeedback({
        type: "error",
        message: "Complete the title, summary, full content, and publish schedule.",
      });
      return;
    }

    if (
      announcementForm.tag === "Event" &&
      (!announcementForm.event_date || !announcementForm.event_start_time)
    ) {
      setAnnouncementFeedback({
        type: "error",
        message: "Add the event date and start time for event announcements.",
      });
      return;
    }

    setAnnouncementSubmitting(true);

    try {
      const scheduled = await createScheduledAnnouncement({
        ...announcementForm,
        id: announcementForm.id || undefined,
        title,
        desc,
        fullContent,
        created_at: announcementForm.created_at || undefined,
        event_date: announcementForm.tag === "Event" ? announcementForm.event_date : "",
        event_start_time:
          announcementForm.tag === "Event" ? announcementForm.event_start_time : "",
        event_end_time:
          announcementForm.tag === "Event" ? announcementForm.event_end_time : "",
        event_location: announcementForm.tag === "Event" ? eventLocation : "",
        media: announcementForm.media ? { ...announcementForm.media } : null,
        clear_media: announcementForm.clear_media,
        publish_at: publishAt,
      });

      recordLocalActivity({
        title: isEditing
          ? "Announcement updated"
          : publishesImmediately
            ? "Announcement published"
            : "Announcement scheduled",
        description: isEditing
          ? `${actorName} updated "${scheduled.title}" on the residents homepage.`
          : publishesImmediately
            ? `${actorName} published "${scheduled.title}" to the residents homepage.`
            : `${actorName} scheduled "${scheduled.title}" for ${formatAnnouncementDateTime(
                scheduled.publish_at,
              )}.`,
        tone: isEditing ? "info" : publishesImmediately ? "success" : "info",
        meta: formatFeedDateTime(new Date().toISOString()),
        source: "announcements",
      });

      revokeObjectUrl(announcementForm.media?.url);
      setAnnouncementForm(createAnnouncementFormState());
      setAnnouncementMediaInputKey((current) => current + 1);
      setIsAnnouncementMediaDragActive(false);
      setAnnouncementFeedback({
        type: "success",
        message: isEditing
          ? `"${scheduled.title}" was updated successfully.`
          : publishesImmediately
            ? `"${scheduled.title}" is now live on the residents homepage.`
            : `"${scheduled.title}" was scheduled and will post automatically at ${formatAnnouncementDateTime(
                scheduled.publish_at,
              )} on the residents homepage.`,
      });
    } catch (error) {
      setAnnouncementFeedback({
        type: "error",
        message:
          error?.message ||
          (isEditing
            ? "Unable to update this announcement right now."
            : "Unable to schedule this announcement right now."),
      });
    } finally {
      setAnnouncementSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = (announcement) => {
    if (!announcement) {
      return;
    }

    setAnnouncementPendingDelete(announcement);
  };

  const confirmDeleteAnnouncement = async () => {
    if (!announcementPendingDelete || announcementDeleteSubmitting) {
      return;
    }

    const announcement = announcementPendingDelete;
    setAnnouncementDeleteSubmitting(true);

    try {
      await deleteScheduledAnnouncement(announcement.id);
      recordLocalActivity({
        title:
          announcement.status === "scheduled"
            ? "Scheduled announcement removed"
            : "Announcement deleted",
        description:
          announcement.status === "scheduled"
            ? `${actorName} removed "${announcement.title}" before it went live.`
            : `${actorName} deleted the live announcement "${announcement.title}" from the residents homepage.`,
        tone: "warning",
        meta: formatFeedDateTime(new Date().toISOString()),
        source: "announcements",
      });
      if (announcementForm.id === announcement.id) {
        revokeObjectUrl(announcementForm.media?.url);
        setAnnouncementForm(createAnnouncementFormState());
        setAnnouncementMediaInputKey((current) => current + 1);
        setIsAnnouncementMediaDragActive(false);
      }
      setAnnouncementFeedback({
        type: "success",
        message:
          announcement.status === "scheduled"
            ? `"${announcement.title}" was removed from the schedule.`
            : `"${announcement.title}" was deleted successfully.`,
      });
      setAnnouncementPendingDelete(null);
      void syncAnnouncements();
    } catch (error) {
      setAnnouncementFeedback({
        type: "error",
        message:
          error?.message || "Unable to delete this announcement right now.",
      });
    } finally {
      setAnnouncementDeleteSubmitting(false);
    }
  };

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
  const announcementButtonClass = `inline-flex items-center gap-2 px-5 h-10 rounded-2xl bg-gradient-to-r ${t.primaryGrad} text-white text-sm font-medium shadow-lg transition-all cursor-pointer ${
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
              <button
                type="button"
                onClick={() => setShowAnnouncementsPanel((prev) => !prev)}
                className={announcementButtonClass}
                aria-expanded={showAnnouncementsPanel}
                aria-controls="admin-announcements-modal"
              >
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
            <div className={`${cardClass} p-4`}>
              <p className="text-sm text-red-500">{analyticsError}</p>
              <button
                type="button"
                onClick={fetchAnalytics}
                className={`mt-3 inline-flex items-center rounded-lg px-3 py-2 text-xs font-semibold ${
                  isDark
                    ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Retry overview load
              </button>
            </div>
          )}
          {!analyticsLoading && !analyticsError && analyticsData && (
            <OverviewTab raw={analyticsData} t={t} />
          )}
        </section>

        {dataError && (
          <section className="px-1 sm:px-1">
            <div className={`${cardClass} flex flex-wrap items-center justify-between gap-3 p-4`}>
              <p className="text-sm text-red-500">{dataError}</p>
              <button
                type="button"
                onClick={fetchData}
                className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                  isDark
                    ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Retry dashboard data
              </button>
            </div>
          </section>
        )}

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
              {loading ? <span className={`inline-block h-8 w-14 rounded-lg animate-pulse align-middle ${isDark ? "bg-slate-700" : "bg-gray-200"}`} /> : overview.pendingRequests}
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
              {loading ? <span className={`inline-block h-8 w-14 rounded-lg animate-pulse align-middle ${isDark ? "bg-slate-700" : "bg-gray-200"}`} /> : overview.openComplaints}
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
              {loading ? <span className={`inline-block h-8 w-14 rounded-lg animate-pulse align-middle ${isDark ? "bg-slate-700" : "bg-gray-200"}`} /> : overview.incidentReports}
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
              {loading ? <span className={`inline-block h-8 w-14 rounded-lg animate-pulse align-middle ${isDark ? "bg-slate-700" : "bg-gray-200"}`} /> : overview.pendingAppointments}
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
          {loading ? <ChartSkeleton isDark={isDark} cardClass={cardClass} height={290} /> : <article className={`${cardClass} p-4`}>
            <h3 className={`text-lg font-bold ${t.cardText} mb-3`}>
              {tr.adminLanding.monthlyReports}
            </h3>
            <SafeResponsiveChart className="h-[290px]">
              {({ width, height }) => (
              <ResponsiveContainer width={width} height={height} minWidth={0}>
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
              )}
            </SafeResponsiveChart>
          </article>}

          {loading ? <DonutSkeleton isDark={isDark} cardClass={cardClass} /> : <DonutCard
            title={tr.adminLanding.caseResolution}
            subtitle="Current distribution of ongoing, resolved, and rejected case reports."
            data={statusData}
            isDark={isDark}
            t={t}
            cardClass={cardClass}
            centerLabel="Cases"
            tooltipStyle={tooltipStyle}
            tooltipTextStyle={tooltipTextStyle}
          />}

          {loading ? <ChartSkeleton isDark={isDark} cardClass={cardClass} height={290} /> : <article className={`${cardClass} p-4`}>
            <h3 className={`text-lg font-bold ${t.cardText} mb-3`}>
              {tr.adminLanding.reportTrend}
            </h3>
            <SafeResponsiveChart className="h-[290px]">
              {({ width, height }) => (
              <ResponsiveContainer width={width} height={height} minWidth={0}>
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
              )}
            </SafeResponsiveChart>
          </article>}

          {loading ? <DonutSkeleton isDark={isDark} cardClass={cardClass} /> : <DonutCard
            title={tr.adminLanding.reportCategories}
            subtitle="Breakdown of incident and complaint types across submitted reports."
            data={categoryData}
            isDark={isDark}
            t={t}
            cardClass={cardClass}
            centerLabel="Types"
            tooltipStyle={tooltipStyle}
            tooltipTextStyle={tooltipTextStyle}
          />}

          {loading ? <DonutSkeleton isDark={isDark} cardClass={cardClass} /> : <DonutCard
            title={tr.adminLanding.appointmentStatus}
            subtitle="Scheduling mix across pending, approved, and rejected appointments."
            data={appointmentStatusData}
            isDark={isDark}
            t={t}
            cardClass={cardClass}
            centerLabel="Appts"
            tooltipStyle={tooltipStyle}
            tooltipTextStyle={tooltipTextStyle}
          />}

          {loading ? <ChartSkeleton isDark={isDark} cardClass={cardClass} height={290} /> : <article className={`${cardClass} p-4`}>
            <h3 className={`text-lg font-bold ${t.cardText} mb-1`}>
              {tr.adminLanding.monthlyAppointments}
            </h3>
            <p className={`mb-3 text-[13px] leading-6 ${t.subtleText}`}>
              Monthly breakdown of appointment statuses across scheduled, completed, and cancelled bookings.
            </p>
            <SafeResponsiveChart className="h-[290px]">
              {({ width, height }) => (
              <ResponsiveContainer width={width} height={height} minWidth={0}>
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
              )}
            </SafeResponsiveChart>
          </article>}
        </section>

        <section className="grid grid-cols-1 gap-3">
          {loading ? <ChartSkeleton isDark={isDark} cardClass={cardClass} height={280} /> : <article className={`${cardClass} p-4`}>
            <h3 className={`text-lg font-bold ${t.cardText} mb-3`}>
              {tr.adminLanding.requestsVsAppointments}
            </h3>
            <SafeResponsiveChart className="h-[280px]">
              {({ width, height }) => (
              <ResponsiveContainer width={width} height={height} minWidth={0}>
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
              )}
            </SafeResponsiveChart>
          </article>}
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

      {showAnnouncementsPanel && createPortal(
        <div
          id="admin-announcements-modal"
          className="fixed inset-0 z-[1800] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
          onClick={() => setShowAnnouncementsPanel(false)}
        >
          <div
            className={`relative w-full max-w-4xl overflow-hidden rounded-[32px] border shadow-[0_30px_70px_rgba(15,23,42,0.28)] font-kumbh ${
              isDark
                ? "border-slate-700 bg-slate-900 text-slate-100"
                : "border-[#dbe4ef] bg-white text-slate-900"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={`border-b px-5 py-4 sm:px-6 ${t.cardBorder}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={`text-[10px] font-semibold ${t.subtleText}`}>
                    Announcement Scheduler
                  </p>
                  <h2 className={`mt-2 font-spartan text-xl font-bold ${t.cardText}`}>
                    Barangay Updates Board
                  </h2>
                </div>
                <button
                  type="button"
                  aria-label="Close announcement scheduler"
                  onClick={() => setShowAnnouncementsPanel(false)}
                  className={`shrink-0 rounded-full p-2.5 transition ${
                    isDark
                      ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 5L15 15M15 5L5 15"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="max-h-[78vh] overflow-y-auto px-5 py-5 sm:px-6">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div
                    className={`grid w-full max-w-2xl grid-cols-2 overflow-hidden rounded-[22px] border ${
                      isDark
                        ? "border-slate-800 bg-slate-950/80"
                        : "border-slate-200 bg-slate-50/80"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setAnnouncementPanelTab("create")}
                      className={`relative flex items-center justify-center gap-2 px-4 py-4 text-sm font-black uppercase tracking-[0.14em] transition ${
                        announcementPanelTab === "create"
                          ? isDark
                            ? "bg-slate-900 text-emerald-300"
                            : "bg-white text-emerald-600"
                          : isDark
                            ? "bg-slate-950/40 text-slate-400 hover:text-slate-200"
                            : "bg-slate-50/80 text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path
                          d="M4.75 7.75A2.75 2.75 0 0 1 7.5 5h9a2.75 2.75 0 0 1 2.75 2.75v8.5A2.75 2.75 0 0 1 16.5 19h-9a2.75 2.75 0 0 1-2.75-2.75z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />
                        <path
                          d="M8 10h8M8 14h5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span>Create Announcement</span>
                      <span
                        className={`absolute inset-x-0 bottom-0 h-[2px] ${
                          announcementPanelTab === "create"
                            ? isDark
                              ? "bg-emerald-300"
                              : "bg-emerald-500"
                            : "bg-transparent"
                        }`}
                        aria-hidden="true"
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => setAnnouncementPanelTab("history")}
                      className={`relative flex items-center justify-center gap-2 border-l px-4 py-4 text-sm font-black uppercase tracking-[0.14em] transition ${
                        isDark ? "border-slate-800" : "border-slate-200"
                      } ${
                        announcementPanelTab === "history"
                          ? isDark
                            ? "bg-slate-900 text-emerald-300"
                            : "bg-white text-emerald-600"
                          : isDark
                            ? "bg-slate-950/40 text-slate-400 hover:text-slate-200"
                            : "bg-slate-50/80 text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path
                          d="M12 6v6l4 2"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="7.25"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />
                      </svg>
                      <span>History</span>
                      <span
                        className={`absolute inset-x-0 bottom-0 h-[2px] ${
                          announcementPanelTab === "history"
                            ? isDark
                              ? "bg-emerald-300"
                              : "bg-emerald-500"
                            : "bg-transparent"
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>

                {announcementFeedback.message && (
                  <div
                    className={`rounded-2xl border px-4 py-3 text-sm ${
                      announcementFeedback.type === "error"
                        ? isDark
                          ? "border-rose-900/50 bg-rose-950/20 text-rose-300"
                          : "border-rose-200 bg-rose-50 text-rose-700"
                        : isDark
                          ? "border-emerald-900/50 bg-emerald-950/20 text-emerald-300"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {announcementFeedback.message}
                  </div>
                )}

                {announcementPanelTab === "create" ? (
                  <article
                    className={`rounded-[26px] border p-4 sm:p-5 ${
                      isDark
                        ? "border-slate-800 bg-slate-950/80"
                        : "border-slate-200 bg-slate-50/80"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className={`font-spartan text-lg font-bold ${t.cardText}`}>
                          {isEditingAnnouncement
                            ? "Edit announcement"
                            : "Plan an announcement"}
                        </h3>
                        <p className={`mt-1 text-sm ${t.subtleText}`}>
                          {isEditingAnnouncement
                            ? "Update the details, replace the attached media, or remove it before saving the changes."
                            : "Draft homepage updates, set a publish time, and push urgent notices live."}
                        </p>
                      </div>
                    </div>

                    <form className="mt-4 space-y-4" onSubmit={handleScheduleAnnouncement}>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="space-y-2">
                          <span className={`text-[11px] font-semibold ${t.subtleText}`}>
                            Tag
                          </span>
                          <select
                            value={announcementForm.tag}
                            onChange={(event) =>
                              handleAnnouncementInputChange("tag", event.target.value)
                            }
                            className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${
                              isDark
                                ? "border-slate-700 bg-slate-900 text-slate-100"
                                : "border-slate-200 bg-white text-slate-900"
                            }`}
                          >
                            <option value="Advisory">Advisory</option>
                            <option value="Community">Community</option>
                            <option value="Health">Health</option>
                            <option value="Emergency">Emergency</option>
                            <option value="Event">Event</option>
                          </select>
                        </label>

                        <label className="space-y-2">
                          <span className={`text-[11px] font-semibold ${t.subtleText}`}>
                            Publish at
                          </span>
                          <input
                            type="datetime-local"
                            value={announcementForm.publish_at}
                            onChange={(event) =>
                              handleAnnouncementInputChange("publish_at", event.target.value)
                            }
                            className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${
                              isDark
                                ? "border-slate-700 bg-slate-900 text-slate-100"
                                : "border-slate-200 bg-white text-slate-900"
                            }`}
                          />
                        </label>
                      </div>

                      {isEventAnnouncement && (
                        <div
                          className={`rounded-2xl border p-4 ${
                            isDark
                              ? "border-slate-800 bg-slate-900/70"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <div className="mb-4">
                            <h4 className={`font-spartan text-sm font-bold ${t.cardText}`}>
                              Event details
                            </h4>
                            <p className={`mt-1 text-xs ${t.subtleText}`}>
                              These fields control how the event appears in the homepage calendar.
                            </p>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <label className="space-y-2">
                              <span className={`text-[11px] font-semibold ${t.subtleText}`}>
                                Event date
                              </span>
                              <input
                                type="date"
                                value={announcementForm.event_date}
                                onChange={(event) =>
                                  handleAnnouncementInputChange(
                                    "event_date",
                                    event.target.value,
                                  )
                                }
                                className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${
                                  isDark
                                    ? "border-slate-700 bg-slate-900 text-slate-100"
                                    : "border-slate-200 bg-white text-slate-900"
                                }`}
                              />
                            </label>

                            <label className="space-y-2">
                              <span className={`text-[11px] font-semibold ${t.subtleText}`}>
                                Location
                              </span>
                              <input
                                type="text"
                                value={announcementForm.event_location}
                                onChange={(event) =>
                                  handleAnnouncementInputChange(
                                    "event_location",
                                    event.target.value,
                                  )
                                }
                                placeholder="Barangay Hall, Covered Court, or venue"
                                className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${
                                  isDark
                                    ? "border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500"
                                    : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                                }`}
                              />
                            </label>
                          </div>

                          <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <label className="space-y-2">
                              <span className={`text-[11px] font-semibold ${t.subtleText}`}>
                                Start time
                              </span>
                              <input
                                type="time"
                                value={announcementForm.event_start_time}
                                onChange={(event) =>
                                  handleAnnouncementInputChange(
                                    "event_start_time",
                                    event.target.value,
                                  )
                                }
                                className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${
                                  isDark
                                    ? "border-slate-700 bg-slate-900 text-slate-100"
                                    : "border-slate-200 bg-white text-slate-900"
                                }`}
                              />
                            </label>

                            <label className="space-y-2">
                              <span className={`text-[11px] font-semibold ${t.subtleText}`}>
                                End time
                              </span>
                              <input
                                type="time"
                                value={announcementForm.event_end_time}
                                onChange={(event) =>
                                  handleAnnouncementInputChange(
                                    "event_end_time",
                                    event.target.value,
                                  )
                                }
                                className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${
                                  isDark
                                    ? "border-slate-700 bg-slate-900 text-slate-100"
                                    : "border-slate-200 bg-white text-slate-900"
                                }`}
                              />
                            </label>
                          </div>
                        </div>
                      )}

                      <label className="space-y-2 block">
                        <span className={`text-[11px] font-semibold ${t.subtleText}`}>
                          Title
                        </span>
                        <input
                          type="text"
                          value={announcementForm.title}
                          onChange={(event) =>
                            handleAnnouncementInputChange("title", event.target.value)
                          }
                          placeholder="Enter the headline residents should see first."
                          className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${
                            isDark
                              ? "border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500"
                              : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                          }`}
                        />
                      </label>

                      <label className="space-y-2 block">
                        <span className={`text-[11px] font-semibold ${t.subtleText}`}>
                          Summary
                        </span>
                        <textarea
                          rows={3}
                          value={announcementForm.desc}
                          onChange={(event) =>
                            handleAnnouncementInputChange("desc", event.target.value)
                          }
                          placeholder="Write the short preview that appears in the announcements cards."
                          className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${
                            isDark
                              ? "border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500"
                              : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                          }`}
                        />
                      </label>

                      <label className="space-y-2 block">
                        <span className={`text-[11px] font-semibold ${t.subtleText}`}>
                          Full content
                        </span>
                        <textarea
                          rows={6}
                          value={announcementForm.fullContent}
                          onChange={(event) =>
                            handleAnnouncementInputChange("fullContent", event.target.value)
                          }
                          placeholder="Add the full advisory, event information, or emergency instructions."
                          className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${
                            isDark
                              ? "border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500"
                              : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                          }`}
                        />
                      </label>

                      <label className="space-y-2 block">
                        <span className={`text-[11px] font-semibold ${t.subtleText}`}>
                          Attach image or video
                        </span>
                        <div
                          onDragOver={handleAnnouncementMediaDragOver}
                          onDragLeave={handleAnnouncementMediaDragLeave}
                          onDrop={handleAnnouncementMediaDrop}
                          className={`relative overflow-hidden rounded-[24px] border border-dashed transition-all duration-200 ${
                            isAnnouncementMediaDragActive
                              ? isDark
                                ? "border-emerald-400 bg-emerald-500/10 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]"
                                : "border-emerald-400 bg-emerald-50 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]"
                              : isDark
                                ? "border-slate-700 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.10),_transparent_48%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.92))]"
                                : "border-emerald-100 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.10),_transparent_52%),linear-gradient(180deg,#ffffff,#f8fafc)]"
                          }`}
                        >
                          <input
                            key={announcementMediaInputKey}
                            id="announcement-media-upload"
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleAnnouncementMediaChange}
                            className="sr-only"
                          />
                          <label
                            htmlFor="announcement-media-upload"
                            className="flex cursor-pointer flex-col items-center justify-center px-5 py-6 text-center"
                          >
                            <div
                              className={`flex h-14 w-14 items-center justify-center rounded-full border shadow-sm transition-transform duration-200 ${
                                isAnnouncementMediaDragActive ? "scale-105" : ""
                              } ${
                                isDark
                                  ? "border-emerald-400/30 bg-slate-900/80 text-emerald-300"
                                  : "border-emerald-100 bg-white text-emerald-600"
                              }`}
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                className="h-7 w-7"
                                aria-hidden="true"
                              >
                                <path
                                  d="M8.5 18.5H8a4.5 4.5 0 0 1-.48-8.974A5.5 5.5 0 0 1 18.23 8.2 4 4 0 1 1 19 16h-2.5"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M12 9.5v8m0 0-3-3m3 3 3-3"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>

                            <div className="mt-3">
                              <p className={`text-base font-bold ${t.cardText}`}>
                                Click to upload{" "}
                                <span className={isDark ? "text-emerald-300" : "text-emerald-600"}>
                                  or drag and drop
                                </span>
                              </p>
                              <p className={`mt-1 text-sm ${t.subtleText}`}>
                                Images up to 10 MB and videos up to 100 MB
                              </p>
                            </div>
                          </label>
                        </div>
                        <p className={`mt-2 text-[11px] ${t.subtleText}`}>
                          Leave the publish time as-is to publish right away, or choose a future time to post automatically later.
                        </p>
                      </label>

                      {announcementForm.media && (
                        <div
                          className={`rounded-2xl border p-4 ${
                            isDark
                              ? "border-slate-700 bg-slate-950/70"
                              : "border-slate-200 bg-slate-50"
                          }`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className={`text-sm font-semibold ${t.cardText}`}>
                                {announcementForm.media.kind === "video"
                                  ? "Video attached"
                                  : "Image attached"}
                              </p>
                              <p className={`mt-1 text-xs ${t.subtleText}`}>
                                {announcementForm.media.name} â€¢ {formatFileSize(announcementForm.media.size)}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={clearAnnouncementMedia}
                              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                                isDark
                                  ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                                  : "bg-white text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              Remove media
                            </button>
                          </div>

                          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-black/5">
                            {announcementForm.media.kind === "video" ? (
                              <video
                                src={announcementForm.media.url}
                                className="max-h-72 w-full bg-black object-contain"
                                controls
                                playsInline
                              />
                            ) : (
                              <img
                                src={announcementForm.media.url}
                                alt={announcementForm.media.name || "Announcement media"}
                                className="max-h-72 w-full object-cover"
                              />
                            )}
                          </div>
                        </div>
                      )}

                      <label className="inline-flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={announcementForm.urgent}
                          onChange={(event) =>
                            handleAnnouncementInputChange("urgent", event.target.checked)
                          }
                          className="h-4 w-4 rounded border-slate-300 text-rose-500 focus:ring-rose-500"
                        />
                        <span className={`text-sm ${t.cardText}`}>
                          Mark as urgent
                        </span>
                      </label>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="submit"
                          disabled={announcementSubmitting}
                          className={`rounded-full px-5 py-3 text-sm font-semibold text-white transition ${
                            announcementSubmitting
                              ? "cursor-not-allowed bg-slate-400"
                              : "bg-slate-900 hover:bg-slate-700"
                          }`}
                        >
                          {announcementSubmitting
                            ? "Publishing..."
                            : publishActionLabel}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            revokeObjectUrl(announcementForm.media?.url);
                            setAnnouncementForm(createAnnouncementFormState());
                            setAnnouncementMediaInputKey((current) => current + 1);
                            setIsAnnouncementMediaDragActive(false);
                            setAnnouncementFeedback({ type: "", message: "" });
                          }}
                          className={`rounded-full px-5 py-3 text-sm font-semibold ${
                            isDark
                              ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {isEditingAnnouncement ? "Cancel editing" : "Reset draft"}
                        </button>
                      </div>
                    </form>
                  </article>
                ) : (
                  <article
                    className={`rounded-[26px] border p-4 sm:p-5 ${
                      isDark
                        ? "border-slate-800 bg-slate-950/80"
                        : "border-slate-200 bg-slate-50/80"
                    }`}
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className={`font-spartan text-lg font-bold ${t.cardText}`}>
                          History
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            isDark
                              ? "bg-slate-800 text-slate-300"
                              : "bg-white text-slate-600"
                          }`}
                        >
                          {announcementHistoryItems.length}{" "}
                          {announcementHistoryItems.length === 1
                            ? "announcement"
                            : "announcements"}
                        </span>
                      </div>
                      <p className={`mt-1 text-sm ${t.subtleText}`}>
                        Review scheduled and published announcements here. You can remove an item while it is still waiting for its publish time.
                      </p>
                    </div>

                    {announcementHistoryItems.length === 0 ? (
                      <div
                        className={`mt-5 rounded-2xl border border-dashed px-4 py-6 text-center text-sm ${t.subtleText}`}
                      >
                        No announcements in the history yet.
                      </div>
                    ) : (
                      <div className="mt-5 space-y-4">
                        {announcementHistoryItems.map((item) => {
                          const isScheduled = item.status === "scheduled";

                          return (
                            <div key={item.id}>
                              <div
                                className={`rounded-[24px] border p-4 sm:p-5 ${
                                  isDark
                                    ? "border-slate-800 bg-slate-900/70"
                                    : "border-slate-200 bg-white"
                                }`}
                              >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span
                                      className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
                                        isDark
                                          ? "bg-slate-800 text-slate-300"
                                          : "bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      {item.tag}
                                    </span>
                                    <span
                                      className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
                                        isScheduled
                                          ? isDark
                                            ? "bg-amber-500/15 text-amber-300"
                                            : "bg-amber-50 text-amber-700"
                                          : isDark
                                            ? "bg-emerald-500/15 text-emerald-300"
                                            : "bg-emerald-50 text-emerald-700"
                                      }`}
                                    >
                                      {isScheduled ? "Scheduled" : "Live"}
                                    </span>
                                    {item.urgent && (
                                      <span className="rounded-full bg-red-500 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white">
                                        Urgent
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2 self-start">
                                    <button
                                      type="button"
                                      onClick={() => handleEditAnnouncement(item)}
                                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                                        isDark
                                          ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                      }`}
                                    >
                                      <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        className="h-3.5 w-3.5"
                                        aria-hidden="true"
                                      >
                                        <path
                                          d="M4 20h4l9.5-9.5a2.121 2.121 0 0 0-3-3L5 17v3Z"
                                          stroke="currentColor"
                                          strokeWidth="1.8"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                        <path
                                          d="m13.5 6.5 4 4"
                                          stroke="currentColor"
                                          strokeWidth="1.8"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                      <span>Edit</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteAnnouncement(item)}
                                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                                        isDark
                                          ? "bg-rose-500/15 text-rose-300 hover:bg-rose-500/25"
                                          : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                                      }`}
                                    >
                                      <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        className="h-3.5 w-3.5"
                                        aria-hidden="true"
                                      >
                                        <path
                                          d="M4 7h16"
                                          stroke="currentColor"
                                          strokeWidth="1.8"
                                          strokeLinecap="round"
                                        />
                                        <path
                                          d="M10 11v5M14 11v5"
                                          stroke="currentColor"
                                          strokeWidth="1.8"
                                          strokeLinecap="round"
                                        />
                                        <path
                                          d="M6 7l1 11a2 2 0 0 0 1.99 1.82h6.02A2 2 0 0 0 17 18l1-11"
                                          stroke="currentColor"
                                          strokeWidth="1.8"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                        <path
                                          d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
                                          stroke="currentColor"
                                          strokeWidth="1.8"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                </div>

                                <div className="mt-4 min-w-0">
                                  <h4 className={`font-spartan text-lg font-bold leading-tight ${t.cardText}`}>
                                    {item.title}
                                  </h4>
                                  {item.desc && (
                                    <p className={`mt-2 text-sm leading-6 ${t.subtleText}`}>
                                      {item.desc}
                                    </p>
                                  )}
                                  {String(item.tag || "").toLowerCase() === "event" && (
                                    <div
                                      className={`mt-4 flex flex-wrap gap-2 text-xs ${
                                        isDark ? "text-slate-300" : "text-slate-600"
                                      }`}
                                    >
                                      <span
                                        className={`rounded-full px-3 py-1.5 ${
                                          isDark ? "bg-slate-800" : "bg-slate-100"
                                        }`}
                                      >
                                        {formatEventDateLabel(item.event_date)}
                                      </span>
                                      <span
                                        className={`rounded-full px-3 py-1.5 ${
                                          isDark ? "bg-slate-800" : "bg-slate-100"
                                        }`}
                                      >
                                        {item.event_end_time
                                          ? `${formatEventTimeLabel(
                                              item.event_start_time,
                                            )} - ${formatEventTimeLabel(item.event_end_time)}`
                                          : formatEventTimeLabel(
                                              item.event_start_time,
                                            )}
                                      </span>
                                      {item.event_location && (
                                        <span
                                          className={`rounded-full px-3 py-1.5 ${
                                            isDark ? "bg-slate-800" : "bg-slate-100"
                                          }`}
                                        >
                                          {item.event_location}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </article>
                )}
              </div>
            </div>

            {announcementPendingDelete && (
              <div
                className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
                onClick={() => {
                  if (announcementDeleteSubmitting) return;
                  setAnnouncementPendingDelete(null);
                }}
              >
                <div
                  className={`w-full max-w-md rounded-[28px] border p-5 shadow-2xl ${
                    isDark
                      ? "border-slate-700 bg-slate-900 text-slate-100"
                      : "border-slate-200 bg-white text-slate-900"
                  }`}
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                        isDark
                          ? "bg-rose-500/15 text-rose-300"
                          : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <path
                          d="M12 8v5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                        <path
                          d="M12 16.5h.01"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                        <path
                          d="M10.29 3.86 1.82 18a2 2 0 0 0 1.72 3h16.92a2 2 0 0 0 1.72-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className={`font-spartan text-lg font-bold ${t.cardText}`}>
                        Delete announcement?
                      </h3>
                      <p className={`mt-2 text-sm leading-6 ${t.subtleText}`}>
                        This will permanently remove{" "}
                        <span className={`font-semibold ${t.cardText}`}>
                          {announcementPendingDelete.title}
                        </span>{" "}
                        from the history and residents homepage.
                      </p>
                      <p className={`mt-2 text-xs ${t.subtleText}`}>
                        You can still cancel now if this was clicked by mistake.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap justify-end gap-3">
                    <button
                      type="button"
                      disabled={announcementDeleteSubmitting}
                      onClick={() => setAnnouncementPendingDelete(null)}
                      className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                        announcementDeleteSubmitting
                          ? "cursor-not-allowed opacity-60"
                          : ""
                      } ${
                        isDark
                          ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={announcementDeleteSubmitting}
                      onClick={confirmDeleteAnnouncement}
                      className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white transition ${
                        announcementDeleteSubmitting
                          ? "cursor-not-allowed bg-rose-300"
                          : "bg-rose-600 hover:bg-rose-700"
                      }`}
                    >
                      {announcementDeleteSubmitting
                        ? "Deleting..."
                        : "Yes, delete"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body,
      )}

      <InsightsModal
        isOpen={showInsights}
        onClose={() => setShowInsights(false)}
        incidents={incidents}
        complaints={complaints}
        appointments={appointments}
      />

      <Toast
        toasts={toasts}
        onRemove={removeToast}
        currentTheme={currentTheme}
      />
    </div>
  );
}

