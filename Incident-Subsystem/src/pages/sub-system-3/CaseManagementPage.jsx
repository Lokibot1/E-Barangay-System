import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import MainMenuCards from "../../components/sub-system-3/MainMenuCards";
import TabsComponent from "../../components/sub-system-3/TabsComponent";
import ReportCard from "../../components/sub-system-3/ReportCard";
import ReportDetailModal from "../../components/sub-system-3/Reportdetailmodal";
import MapComponent from "../../components/shared/MapComponent";
import Toast from "../../components/shared/modals/Toast";
import themeTokens from "../../Themetokens";
import { incidentService } from "../../services/sub-system-3/incidentService";
import { getMyComplaints } from "../../services/sub-system-3/complaintService";
import { useUserRealTime } from "../../context/UserRealTimeContext";

// ── Appointment helpers ────────────────────────────────────────────────────────
const parseApptScheduledAt = (scheduledAt) => {
  if (!scheduledAt) return { date: null, time: null };
  const [datePart, timePart] = String(scheduledAt).split(/[T ]/);
  return { date: datePart || null, time: timePart ? timePart.substring(0, 5) : null };
};

const formatApptTime = (timeStr) => {
  if (!timeStr) return "—";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const mins = m || "00";
  const ampm = hour < 12 ? "AM" : "PM";
  const disp = hour % 12 || 12;
  return `${disp}:${mins} ${ampm}`;
};

const apptStatusCfg = {
  scheduled:   { label: "Scheduled",   cls: "bg-blue-100 text-blue-700 border border-blue-200" },
  rescheduled: { label: "Rescheduled", cls: "bg-amber-100 text-amber-700 border border-amber-200" },
  completed:   { label: "Completed",   cls: "bg-green-100 text-green-700 border border-green-200" },
  cancelled:   { label: "Cancelled",   cls: "bg-gray-100 text-gray-500 border border-gray-300" },
  no_show:     { label: "No Show",     cls: "bg-red-100 text-red-700 border border-red-200" },
};

const CaseManagementPage = () => {
  const { tr } = useLanguage();
  const location = useLocation();
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("complaints");
  const [activeFilter, setActiveFilter] = useState("ongoing");
  const [showMap, setShowMap] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [apptFilter, setApptFilter] = useState("all");
  const [apptOpen, setApptOpen] = useState(true);
  const [expandedAppt, setExpandedAppt] = useState(null);
  const [apptPage, setApptPage] = useState(1);
  const [viewMode, setViewMode] = useState("cards");
  const [tablePage, setTablePage] = useState(1);
  const [tableSearchInput, setTableSearchInput] = useState("");
  const [tableSearch, setTableSearch] = useState("");
  const [tableSort, setTableSort] = useState("desc");

  // Debounce search input → tableSearch (300 ms)
  const searchDebounceRef = useRef(null);
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => setTableSearch(tableSearchInput), 300);
    return () => clearTimeout(searchDebounceRef.current);
  }, [tableSearchInput]);

  const apptListRef    = useRef(null);
  const apptSentinelRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((toast) => {
    setToasts((prev) => [...prev, { id: Date.now(), ...toast }]);
  }, []);
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const APPT_PAGE_SIZE = 8;
  const TABLE_PAGE_SIZE = 8;
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem("appTheme") || "modern";
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentTheme(localStorage.getItem("appTheme") || "modern");
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
  const isDark = currentTheme === "dark";

  // Map API status values to frontend filter keys
  // API records have no status field — default to "ongoing"
  const normalizeStatus = (status) => {
    if (!status) return "ongoing";
    const s = status.toLowerCase();
    if (s === "pending" || s === "ongoing" || s === "in_progress" || s === "in progress") return "ongoing";
    if (s === "resolved" || s === "completed" || s === "closed") return "resolved";
    if (s === "rejected" || s === "dismissed" || s === "denied") return "rejected";
    return "ongoing";
  };

  // Capitalize first letter of each word
  const capitalize = (str) =>
    str.replace(/\b\w/g, (c) => c.toUpperCase());

  // Format a YYYY-MM-DD (or ISO) date string into a readable form, e.g. "February 21, 2026"
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    // Append time to avoid UTC-to-local timezone shift when parsing date-only strings
    const raw = dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00`;
    const d = new Date(raw);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Parse incident type which comes as a JSON string e.g. "[\"waste\",\"draining\"]"
  const parseIncidentType = (type) => {
    if (!type) return "Incident";
    try {
      const parsed = JSON.parse(type);
      if (Array.isArray(parsed)) return parsed.map(capitalize).join(", ");
      return capitalize(String(parsed));
    } catch {
      return capitalize(String(type));
    }
  };

  // Normalize complaint from API to ReportCard format
  const normalizeComplaint = (c) => {
    const typeLabel = capitalize(c.type || "Complaint");
    return {
      ...c,
      id: c.id,
      title: typeLabel,
      category: typeLabel,
      status: normalizeStatus(c.status),
      location: c.location || "N/A",
      description: c.description || "",
      date: formatDate(c.incident_date || c.created_at?.split("T")[0]),
      severity: c.severity ? capitalize(c.severity) : "N/A",
      image: c.evidence || null,
      submittedBy: c.complainant_name || "",
    };
  };

  // Normalize incident from API to ReportCard format
  const normalizeIncident = (i) => {
    const typeLabel = parseIncidentType(i.type);
    return {
      ...i,
      id: i.id,
      title: typeLabel,
      category: typeLabel,
      status: normalizeStatus(i.status),
      location: i.location || "N/A",
      description: i.description || "",
      date: formatDate(i.created_at?.split("T")[0]),
      severity: i.severity || "N/A",
      image: i.evidence || null,
      latitude: i.latitude,
      longitude: i.longitude,
    };
  };

  // Fetch data when tab changes
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "complaints") {
        const data = await getMyComplaints();
        const raw = Array.isArray(data) ? data : data.data || [];
        setComplaints(raw.map(normalizeComplaint));
      } else if (activeTab === "incidents") {
        const data = await incidentService.getMyIncidents();
        const raw = Array.isArray(data) ? data : data.data || [];
        setIncidents(raw.map(normalizeIncident));
      } else if (activeTab === "appointments") {
        // Complaints carry nested appointments + respondent data — flatten them
        const compData = await getMyComplaints();
        const compArray = Array.isArray(compData) ? compData : compData.data || [];

        const allAppts = [];
        compArray.forEach((complaint) => {
          if (!Array.isArray(complaint.appointments) || !complaint.appointments.length) return;
          complaint.appointments.forEach((appt) => {
            const { date: parsedDate, time: parsedTime } = parseApptScheduledAt(appt.scheduled_at);
            allAppts.push({
              ...appt,
              complaint_id:       appt.complaint_id ?? complaint.id,
              complaint_type:     capitalize(complaint.type || "Complaint"),
              respondent_name:    complaint.respondent_name    || "—",
              respondent_address: complaint.respondent_address || "—",
              date:               appt.date || parsedDate,
              time:               appt.time || parsedTime,
            });
          });
        });
        setAppointments(allAppts);
      }
    } catch (error) {
      addToast({ type: "error", title: "Load Failed", message: `Could not load your ${activeTab}. Please try again.` });
    } finally {
      setLoading(false);
    }
  }, [activeTab, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Bidirectional scroll reveal ────────────────────────────────────────────
  const containerRef = useRef(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let lastScrollY = container.scrollTop;
    const handleScroll = () => {
      const currentScrollY = container.scrollTop;
      container.classList.toggle("scrolling-up", currentScrollY < lastScrollY);
      lastScrollY = currentScrollY;
    };
    container.addEventListener("scroll", handleScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("visible", entry.isIntersecting);
        });
      },
      { root: container, threshold: 0.1 }
    );

    container
      .querySelectorAll(".sr-elem, .sr-elem-left, .sr-elem-scale")
      .forEach((el) => observer.observe(el));

    return () => {
      container.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  // ── Infinite scroll for appointments list ──────────────────────────────────
  useEffect(() => {
    const sentinel  = apptSentinelRef.current;
    const container = apptListRef.current;
    if (!sentinel || !container) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setApptPage((p) => p + 1); },
      { root: container, threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [apptOpen, apptFilter]); // re-wire when list is toggled or filter changes

  // Auto-refresh when user receives status-change notifications
  const { eventVersion } = useUserRealTime();
  const prevEventVersionRef = useRef(0);

  useEffect(() => {
    if (eventVersion === 0 || eventVersion === prevEventVersionRef.current)
      return;
    prevEventVersionRef.current = eventVersion;
    fetchData();
  }, [eventVersion, fetchData]);

  useEffect(() => {
    const { openId, openType } = location.state || {};
    if (!openId || loading) return;

    const targetTab = openType === "incident" ? "incidents" : "complaints";
    const sourceList = openType === "incident" ? incidents : complaints;
    const matchedReport = sourceList.find(
      (report) => String(report.id) === String(openId),
    );

    if (!matchedReport) return;

    setActiveTab(targetTab);
    setSelectedReport(matchedReport);
    setIsModalOpen(true);

    window.history.replaceState({}, "");
  }, [complaints, incidents, loading, location.state]);

  const currentReports = activeTab === "complaints" ? complaints : incidents;

  const filteredReports = currentReports.filter(
    (r) => r.status === activeFilter,
  );

  const statusCounts = {
    ongoing: currentReports.filter((r) => r.status === "ongoing").length,
    resolved: currentReports.filter((r) => r.status === "resolved").length,
    rejected: currentReports.filter((r) => r.status === "rejected").length,
  };

  const handleReportClick = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedReport(null), 300);
  };

  // Convert reports to map markers
  const getMapMarkers = () => {
    const severityColors = {
      High: "#EF4444",
      Medium: "#F59E0B",
      Low: "#10B981",
    };

    return filteredReports
      .filter((r) => r.coordinates || (r.latitude && r.longitude))
      .map((report) => ({
        lat: report.coordinates?.lat || parseFloat(report.latitude),
        lng: report.coordinates?.lng || parseFloat(report.longitude),
        title: report.title || report.type || "Report",
        color: severityColors[report.severity] || "#3B82F6",
        data: {
          description: report.description,
          severity: report.severity,
          id: report.id,
        },
      }));
  };

  return (
    <>
      <div ref={containerRef} className="h-full flex flex-col overflow-y-auto">
        {/* White Space */}
        <div className={`${t.pageBg} py-8 sm:py-10 text-center px-4`}>
          <h1
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${t.cardText} mb-2 sm:mb-3 font-spartan uppercase tracking-tight`}
          >
            {tr.caseManagement.title}
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

        {/* Case Management Content */}
        <div
          id="main-content"
          className="container mx-auto px-4 sm:px-6 py-6 sm:py-8"
        >
          {/* Tabs */}
          <TabsComponent
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setActiveFilter("ongoing");
              setApptFilter("all");
              setApptPage(1);
              setTablePage(1);
              setTableSearch("");
              setExpandedAppt(null);
            }}
            currentTheme={currentTheme}
          />

          {activeTab === "appointments" ? (
            /* ── Appointments Tab ─────────────────────────────────────────── */
            (() => {
              const apptStatusKey = (a) => (a.status || "scheduled").toLowerCase().replace(/-/g, "_");
              const apptCounts = ["all","scheduled","rescheduled","completed","cancelled","no_show"].reduce((acc, k) => {
                acc[k] = k === "all" ? appointments.length : appointments.filter((a) => apptStatusKey(a) === k).length;
                return acc;
              }, {});

              const visibleAppts = apptFilter === "all"
                ? appointments
                : appointments.filter((a) => apptStatusKey(a) === apptFilter);

              return (
                <>
                  {/* Header */}
                  <div className="mb-6 sm:mb-8">
                    <h2 className={`text-3xl sm:text-4xl font-bold ${t.cardText} font-spartan mb-1`}>
                      {tr.adminAppointments.title}
                    </h2>
                    <p className={`text-sm sm:text-base ${t.subtleText} font-kumbh`}>
                      {tr.caseManagement.appointmentsSubtitle}
                    </p>
                  </div>

                  {/* Collapsible appointments section */}
                  <div className={`${t.cardBg} rounded-2xl border ${t.cardBorder} shadow-md overflow-hidden`}>

                    {/* Section header / toggle */}
                    <button
                      onClick={() => setApptOpen((v) => !v)}
                      className={`w-full flex items-center gap-3 px-5 py-4 ${isDark ? "hover:bg-slate-700" : "hover:bg-gray-50"} transition-colors`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? "bg-slate-700" : "bg-blue-100"}`}>
                        <svg className={`w-4 h-4 ${isDark ? "text-slate-300" : "text-blue-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 text-left">
                        <span className={`text-sm font-bold font-spartan ${t.cardText}`}>
                          {tr.caseManagement.appointmentList}
                        </span>
                        <span className={`ml-2 text-[11px] font-kumbh ${t.subtleText}`}>
                          {visibleAppts.length} {apptFilter === "all" ? tr.caseManagement.total : apptFilter.replace(/_/g, " ")}
                        </span>
                      </div>
                      <svg
                        className={`w-4 h-4 ${t.subtleText} transition-transform duration-300 ${apptOpen ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Collapsible body — filter pills + list */}
                    <div
                      className="overflow-hidden transition-all duration-300 ease-in-out"
                      style={{ maxHeight: apptOpen ? "660px" : "0px" }}
                    >
                    {/* Status filter pills */}
                      <div className={`px-5 pb-3 flex flex-wrap gap-2 border-b ${isDark ? "border-slate-700" : "border-gray-100"}`}>
                        {[
                          { key: "all",         label: "All" },
                          { key: "scheduled",   label: "Scheduled" },
                          { key: "rescheduled", label: "Rescheduled" },
                          { key: "completed",   label: "Completed" },
                          { key: "cancelled",   label: "Cancelled" },
                          { key: "no_show",     label: "No Show" },
                        ].map((f) => (
                          <button
                            key={f.key}
                            onClick={() => { setApptFilter(f.key); setApptPage(1); setExpandedAppt(null); }}
                            className={`px-3 py-1 rounded-full text-[11px] font-semibold font-kumbh transition-all ${
                              apptFilter === f.key
                                ? `bg-gradient-to-r ${t.primaryGrad} text-white shadow-sm`
                                : isDark
                                  ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {f.label}
                            {apptCounts[f.key] !== undefined && (
                              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${apptFilter === f.key ? "bg-white/20" : isDark ? "bg-slate-600" : "bg-white"}`}>
                                {apptCounts[f.key] ?? appointments.filter((a) => (a.status || "").toLowerCase().replace(/-/g,"_") === f.key).length}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>

                    {/* Appointments list — scrollable, infinite */}
                    {(() => {
                      const pagedAppts = visibleAppts.slice(0, apptPage * APPT_PAGE_SIZE);
                      const hasMore    = pagedAppts.length < visibleAppts.length;

                      return (
                        <div
                          ref={apptListRef}
                          className="overflow-y-auto custom-scrollbar"
                          style={{ maxHeight: "520px" }}
                        >
                          {/* Sticky column header */}
                          <div className={`sticky top-0 z-10 flex items-center gap-4 px-4 py-2.5 border-b ${
                            isDark ? "bg-slate-900 border-slate-700" : "bg-gray-50 border-gray-200"
                          }`}>
                            <div className="flex-shrink-0 w-12" />
                            <div className="flex-1 min-w-0">
                              <span className={`text-[10px] font-bold uppercase tracking-widest font-kumbh ${t.subtleText}`}>{tr.caseManagement.appointment}</span>
                            </div>
                            <div className="flex-shrink-0 w-16 text-center hidden sm:block">
                              <span className={`text-[10px] font-bold uppercase tracking-widest font-kumbh ${t.subtleText}`}>{tr.caseManagement.time}</span>
                            </div>
                            <div className="flex-shrink-0 w-24 text-right">
                              <span className={`text-[10px] font-bold uppercase tracking-widest font-kumbh ${t.subtleText}`}>{tr.caseManagement.status}</span>
                            </div>
                          </div>

                          {/* Body */}
                          {loading ? (
                            <div className="divide-y divide-transparent">
                              {Array.from({ length: 6 }, (_, i) => {
                                const pulse = isDark
                                  ? "animate-pulse bg-slate-700/60 rounded"
                                  : "animate-pulse bg-gray-200/80 rounded";
                                return (
                                  <div key={i} className={`flex items-center gap-4 px-4 py-3.5 border-b ${isDark ? "border-slate-700" : "border-gray-100"}`}>
                                    {/* Date block skeleton */}
                                    <div className={`flex-shrink-0 w-12 h-[52px] rounded-lg ${pulse}`} />
                                    {/* Info skeleton */}
                                    <div className="flex-1 min-w-0 space-y-2">
                                      <div className={`h-3.5 w-3/4 ${pulse}`} />
                                      <div className={`h-2.5 w-1/3 ${pulse}`} />
                                    </div>
                                    {/* Time skeleton */}
                                    <div className={`flex-shrink-0 w-16 hidden sm:block`}>
                                      <div className={`h-3 w-12 mx-auto ${pulse}`} />
                                    </div>
                                    {/* Status pill skeleton */}
                                    <div className={`flex-shrink-0 w-24 flex justify-end`}>
                                      <div className={`h-5 w-20 rounded-full ${pulse}`} />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : visibleAppts.length === 0 ? (
                            <div className="py-10 text-center">
                              <svg className={`w-12 h-12 ${t.subtleText} mx-auto mb-3`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                              </svg>
                              <p className={`text-sm font-semibold ${t.cardText} font-spartan mb-1`}>{tr.caseManagement.noAppointmentsFound}</p>
                              <p className={`text-xs ${t.subtleText} font-kumbh`}>
                                {apptFilter === "all"
                                  ? tr.caseManagement.noAppointmentsYet
                                  : `No ${apptFilter.replace(/_/g, " ")} appointments.`}
                              </p>
                            </div>
                          ) : (
                            <div className="divide-y divide-transparent">
                              {pagedAppts.map((appt) => {
                                const status = (appt.status || "scheduled").toLowerCase().replace(/-/g, "_");
                                const cfg    = apptStatusCfg[status] || apptStatusCfg.scheduled;
                                const isExp  = expandedAppt === appt.id;
                                const apptDate = appt.date
                                  ? new Date(appt.date + "T00:00:00").toLocaleDateString("en-US", {
                                      weekday: "long", month: "long", day: "numeric", year: "numeric",
                                    })
                                  : "—";

                                return (
                                  <div
                                    key={appt.id}
                                    className={`border-b ${isDark ? "border-slate-700" : "border-gray-100"} last:border-b-0`}
                                  >
                                    {/* Row — click to expand */}
                                    <button
                                      onClick={() => setExpandedAppt(isExp ? null : appt.id)}
                                      className={`w-full flex items-center gap-4 px-4 py-3.5 ${isDark ? "hover:bg-slate-700" : "hover:bg-gray-50"} transition-colors text-left`}
                                    >
                                      {/* Date block */}
                                      <div className={`flex-shrink-0 w-12 text-center rounded-lg px-1 py-1.5 ${isDark ? "bg-slate-700" : "bg-blue-50"}`}>
                                        <p className={`text-[9px] font-bold uppercase font-kumbh ${isDark ? "text-slate-400" : "text-blue-500"}`}>
                                          {appt.date ? new Date(appt.date + "T00:00:00").toLocaleDateString("en-US", { month: "short" }) : "—"}
                                        </p>
                                        <p className={`text-xl font-bold font-spartan leading-none ${isDark ? "text-slate-100" : "text-blue-700"}`}>
                                          {appt.date ? new Date(appt.date + "T00:00:00").getDate() : "—"}
                                        </p>
                                      </div>

                                      {/* Info */}
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-bold font-spartan ${t.cardText} truncate`}>
                                          {appt.title || appt.complaint_type || `Appointment #${appt.id}`}
                                        </p>
                                        <p className={`text-xs font-kumbh ${t.subtleText}`}>
                                          Complaint #{appt.complaint_id}
                                        </p>
                                      </div>

                                      {/* Time (desktop) */}
                                      <div className="flex-shrink-0 w-16 text-center hidden sm:block">
                                        <span className={`text-xs font-semibold font-kumbh ${t.cardText}`}>{formatApptTime(appt.time)}</span>
                                      </div>

                                      {/* Status + chevron */}
                                      <div className="flex items-center gap-2 flex-shrink-0 w-24 justify-end">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-kumbh uppercase ${cfg.cls}`}>
                                          {cfg.label}
                                        </span>
                                        <svg
                                          className={`w-4 h-4 ${t.subtleText} transition-transform duration-200 ${isExp ? "rotate-180" : ""}`}
                                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                        >
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      </div>
                                    </button>

                                    {/* Expanded details */}
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExp ? "max-h-[400px]" : "max-h-0"}`}>
                                      <div className={`px-5 pb-5 pt-1 space-y-3 ${isDark ? "bg-slate-800/60" : "bg-gray-50/80"}`}>
                                        {/* Date & time row */}
                                        <div className={`flex gap-3 p-3 rounded-xl ${isDark ? "bg-slate-700" : "bg-blue-50"} border ${isDark ? "border-slate-600" : "border-blue-100"}`}>
                                          <div className="flex-1">
                                            <p className={`text-[10px] font-bold uppercase tracking-wide mb-0.5 font-kumbh ${isDark ? "text-slate-400" : "text-blue-500"}`}>Date</p>
                                            <p className={`text-sm font-bold font-spartan ${t.cardText}`}>{apptDate}</p>
                                          </div>
                                          <div className={`w-px ${isDark ? "bg-slate-600" : "bg-blue-200"}`} />
                                          <div className="flex-shrink-0 text-right">
                                            <p className={`text-[10px] font-bold uppercase tracking-wide mb-0.5 font-kumbh ${isDark ? "text-slate-400" : "text-blue-500"}`}>Time</p>
                                            <p className={`text-sm font-bold font-spartan ${t.cardText}`}>{formatApptTime(appt.time)}</p>
                                          </div>
                                        </div>

                                        {/* Where to go */}
                                        <div className={`flex items-center gap-3 p-3 rounded-xl border ${isDark ? "bg-slate-700 border-slate-600" : "bg-green-50 border-green-200"}`}>
                                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? "bg-slate-600" : "bg-green-100"}`}>
                                            <svg className={`w-4 h-4 ${isDark ? "text-green-400" : "text-green-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                          </div>
                                          <div>
                                            <p className={`text-[10px] font-bold uppercase tracking-wide font-kumbh ${isDark ? "text-green-400" : "text-green-600"}`}>{tr.caseManagement.whereToGo}</p>
                                            <p className={`text-sm font-bold font-spartan ${t.cardText}`}>{tr.caseManagement.gulodBarangayHall}</p>
                                          </div>
                                        </div>

                                        {/* Detail rows */}
                                        <div className={`rounded-xl border ${t.cardBorder} divide-y ${isDark ? "divide-slate-700" : "divide-gray-100"} overflow-hidden`}>
                                          {[
                                            { label: tr.caseManagement.complaintType,     value: appt.complaint_type || "—" },
                                            { label: tr.caseManagement.respondent,         value: appt.respondent_name || "—" },
                                            { label: tr.caseManagement.respondentAddress, value: appt.respondent_address || "—" },
                                            { label: tr.caseManagement.appointmentId,     value: `#${appt.id}` },
                                            { label: tr.caseManagement.complaintId,       value: `#${appt.complaint_id || "—"}` },
                                          ].map(({ label, value }) => (
                                            <div key={label} className={`flex items-start px-4 py-2.5 ${isDark ? "bg-slate-800" : "bg-white"}`}>
                                              <span className={`text-xs font-semibold w-36 flex-shrink-0 font-kumbh ${t.subtleText} pt-0.5`}>{label}</span>
                                              <span className={`text-xs font-kumbh ${t.cardText} leading-relaxed`}>{value}</span>
                                            </div>
                                          ))}
                                          {appt.description && (
                                            <div className={`px-4 py-2.5 ${isDark ? "bg-slate-800" : "bg-white"}`}>
                                              <span className={`text-xs font-semibold font-kumbh ${t.subtleText} block mb-1`}>{tr.caseManagement.notes}</span>
                                              <span className={`text-xs font-kumbh ${t.cardText} leading-relaxed`}>{appt.description}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>{/* end expanded details */}
                                  </div>
                                );
                              })}

                              {/* Infinite scroll sentinel — only rendered when more items exist */}
                              {hasMore && (
                                <div ref={apptSentinelRef} className="flex justify-center py-4">
                                  <div className="animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full" />
                                </div>
                              )}

                              {/* End-of-list note */}
                              {!hasMore && visibleAppts.length > 0 && (
                                <p className={`text-center text-[11px] font-kumbh ${t.subtleText} py-3`}>
                                  {tr.caseManagement.allShown.replace("{n}", visibleAppts.length)}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    </div>{/* end collapsible body */}
                  </div>
                </>
              );
            })()
          ) : (
            /* ── Complaints / Incidents Tabs ───────────────────────────────── */
            (() => {
              const statusBadgeCls = {
                ongoing:  "bg-blue-100 text-blue-700 border border-blue-200",
                resolved: "bg-green-100 text-green-700 border border-green-200",
                rejected: "bg-red-100 text-red-700 border border-red-200",
              };
              // Search + sort applied only in table view
              const searchedReports = tableSearch.trim()
                ? filteredReports.filter((r) =>
                    r.title.toLowerCase().includes(tableSearch.toLowerCase()) ||
                    r.location.toLowerCase().includes(tableSearch.toLowerCase())
                  )
                : filteredReports;
              const sortedReports = [...searchedReports].sort((a, b) => {
                const da = new Date(a.date || 0);
                const db = new Date(b.date || 0);
                return tableSort === "asc" ? da - db : db - da;
              });
              const tablePaged = sortedReports.slice((tablePage - 1) * TABLE_PAGE_SIZE, tablePage * TABLE_PAGE_SIZE);
              const tableTotalPages = Math.ceil(sortedReports.length / TABLE_PAGE_SIZE);
              const pulse = isDark ? "animate-pulse bg-slate-700/60 rounded" : "animate-pulse bg-gray-200/80 rounded";

              return (
                <>
                  {/* Header */}
                  <div className="mb-6 sm:mb-8">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className={`text-3xl sm:text-4xl font-bold ${t.cardText} font-spartan`}>
                        {activeTab === "complaints" ? tr.caseManagement.myComplaints : tr.caseManagement.myIncidents}
                      </h2>
                      <div className="flex items-center gap-2">
                        {/* Cards / Table toggle — hidden when map is showing */}
                        {!showMap && (
                          <div className={`flex items-center rounded-lg border ${t.cardBorder} ${t.cardBg} overflow-hidden shadow-sm`}>
                            <button
                              onClick={() => { setViewMode("cards"); setTablePage(1); }}
                              title="Card view"
                              className={`p-2 transition-colors ${viewMode === "cards" ? `bg-gradient-to-r ${t.primaryGrad} text-white` : `${t.subtleText} ${isDark ? "hover:bg-slate-700" : "hover:bg-gray-100"}`}`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => { setViewMode("table"); setTablePage(1); }}
                              title="Table view"
                              className={`p-2 transition-colors ${viewMode === "table" ? `bg-gradient-to-r ${t.primaryGrad} text-white` : `${t.subtleText} ${isDark ? "hover:bg-slate-700" : "hover:bg-gray-100"}`}`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M10 6h4M10 18h4M3 6h4M17 6h4M3 18h4M17 18h4" />
                              </svg>
                            </button>
                          </div>
                        )}
                        {/* Map toggle */}
                        <button
                          onClick={() => setShowMap(!showMap)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${t.cardBg} border ${t.cardBorder} hover:shadow-md transition-all font-kumbh`}
                        >
                          {showMap ? (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                              </svg>
                              <span className="hidden sm:inline">{tr.caseManagement.gridView}</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                              </svg>
                              <span className="hidden sm:inline">{tr.caseManagement.mapView}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <p className={`text-sm sm:text-base ${t.subtleText} font-kumbh text-left`}>
                      {activeTab === "complaints"
                        ? tr.caseManagement.myComplaints
                        : tr.caseManagement.myIncidents}
                    </p>
                  </div>

                  {/* Filter Tabs */}
                  <div className="sr-elem overflow-x-auto mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className={`inline-flex ${t.cardBg} rounded-lg p-1.5 shadow-md border ${t.cardBorder} min-w-full sm:min-w-0`}>
                      {["ongoing", "resolved", "rejected"].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => { setActiveFilter(filter); setTablePage(1); }}
                          className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-md font-semibold text-xs sm:text-sm transition-all font-kumbh capitalize whitespace-nowrap ${
                            activeFilter === filter
                              ? `bg-gradient-to-r ${t.primaryGrad} text-white shadow-md`
                              : `${t.subtleText} ${isDark ? "hover:bg-slate-200 hover:text-slate-800" : "hover:bg-slate-100 hover:text-slate-800"}`
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {filter === "ongoing"  && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                              {filter === "resolved" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                              {filter === "rejected" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                            </svg>
                            <span className="hidden sm:inline">{filter}</span>
                            <span className={`ml-0.5 sm:ml-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${
                              activeFilter === filter ? "bg-white/20" : isDark ? "bg-slate-600 text-slate-300" : "bg-slate-200 text-slate-700"
                            }`}>
                              {statusCounts[filter]}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Loading / Map / Cards / Table */}
                  {showMap ? (
                    <div className="mb-6">
                      <MapComponent mode="view" markers={getMapMarkers()} currentTheme={currentTheme} height="600px" />
                    </div>
                  ) : loading ? (
                    viewMode === "table" ? (
                      /* Table skeleton */
                      <div className={`${t.cardBg} rounded-2xl border ${t.cardBorder} shadow-sm overflow-hidden`}>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm font-kumbh table-fixed">
                            <thead>
                              <tr className={`${isDark ? "bg-slate-700 border-y border-slate-600" : "bg-gray-100 border-y border-gray-200"}`}>
                                {["w-[6%]","w-[28%]","w-[18%]","w-[28%]","w-[20%]"].map((w, i) => (
                                  <th key={i} className={`px-4 py-3 ${w}`}>
                                    <div className={`h-3 w-3/4 mx-auto rounded ${pulse}`} />
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {Array.from({ length: 8 }, (_, i) => (
                                <tr key={i} className={`border-b ${isDark ? "border-slate-700/60" : "border-gray-100"}`}>
                                  <td className="text-center px-3 py-3.5"><div className={`h-3 w-5 mx-auto ${pulse}`} /></td>
                                  <td className="px-4 py-3.5"><div className={`h-3 w-4/5 ${pulse}`} /></td>
                                  <td className="px-4 py-3.5"><div className={`h-3 w-24 ${pulse}`} /></td>
                                  <td className="px-4 py-3.5"><div className={`h-3 w-3/4 ${pulse}`} /></td>
                                  <td className="px-4 py-3.5"><div className={`h-5 w-20 rounded-full ${pulse}`} /></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      /* Cards skeleton */
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {Array.from({ length: 6 }, (_, i) => {
                          const cardPulse = isDark ? "animate-pulse bg-slate-700/60 rounded-lg" : "animate-pulse bg-gray-200/80 rounded-lg";
                          return (
                            <div key={i} className={`${t.cardBg} rounded-xl border ${t.cardBorder} p-4 sm:p-5 space-y-3`}>
                              <div className={`h-36 w-full rounded-lg ${cardPulse}`} />
                              <div className="flex items-center gap-2">
                                <div className={`h-5 w-16 rounded-full ${cardPulse}`} />
                                <div className={`h-5 w-12 rounded-full ${cardPulse}`} />
                              </div>
                              <div className={`h-4 w-3/4 ${cardPulse}`} />
                              <div className="space-y-1.5">
                                <div className={`h-3 w-full ${cardPulse}`} />
                                <div className={`h-3 w-5/6 ${cardPulse}`} />
                              </div>
                              <div className="flex justify-between pt-1">
                                <div className={`h-3 w-1/3 ${cardPulse}`} />
                                <div className={`h-3 w-1/4 ${cardPulse}`} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )
                  ) : viewMode === "table" ? (
                    /* ── Table view ── */
                    <>
                      {/* Search + Sort controls */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
                        {/* Search */}
                        <div className={`relative flex-1 flex items-center rounded-xl border ${t.cardBorder} ${t.cardBg} overflow-hidden shadow-sm`}>
                          <svg className={`absolute left-3 w-4 h-4 ${t.subtleText} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <input
                            type="text"
                            value={tableSearchInput}
                            onChange={(e) => { setTableSearchInput(e.target.value); setTablePage(1); }}
                            placeholder={`Search by type or location…`}
                            className={`w-full pl-9 pr-4 py-2.5 text-sm font-kumbh bg-transparent outline-none ${t.cardText} placeholder:${t.subtleText}`}
                          />
                          {tableSearchInput && (
                            <button onClick={() => { setTableSearchInput(""); setTableSearch(""); setTablePage(1); }} className={`pr-3 ${t.subtleText} hover:opacity-70`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                        {/* Sort */}
                        <div className={`flex items-center rounded-xl border ${t.cardBorder} ${t.cardBg} shadow-sm overflow-hidden`}>
                          <span className={`pl-3 pr-2 text-xs font-semibold font-kumbh ${t.subtleText} whitespace-nowrap`}>Sort:</span>
                          <button
                            onClick={() => { setTableSort("desc"); setTablePage(1); }}
                            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold font-kumbh transition-colors ${
                              tableSort === "desc"
                                ? `bg-gradient-to-r ${t.primaryGrad} text-white`
                                : `${t.subtleText} ${isDark ? "hover:bg-slate-700" : "hover:bg-gray-100"}`
                            }`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                            </svg>
                            Newest
                          </button>
                          <button
                            onClick={() => { setTableSort("asc"); setTablePage(1); }}
                            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold font-kumbh transition-colors ${
                              tableSort === "asc"
                                ? `bg-gradient-to-r ${t.primaryGrad} text-white`
                                : `${t.subtleText} ${isDark ? "hover:bg-slate-700" : "hover:bg-gray-100"}`
                            }`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                            </svg>
                            Oldest
                          </button>
                        </div>
                      </div>

                      {sortedReports.length === 0 ? (
                        <div className={`${t.cardBg} rounded-xl p-8 sm:p-12 text-center border ${t.cardBorder}`}>
                          <svg className={`w-12 h-12 sm:w-16 sm:h-16 ${t.subtleText} mx-auto mb-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <h3 className={`text-lg sm:text-xl font-bold ${t.cardText} mb-2 font-spartan`}>
                            {tableSearch ? "No results found" : activeTab === "complaints" ? tr.caseManagement.noComplaints : tr.caseManagement.noIncidents}
                          </h3>
                        </div>
                      ) : (
                      <div className={`${t.cardBg} rounded-2xl border ${t.cardBorder} shadow-sm overflow-hidden`}>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm font-kumbh">
                            <thead>
                              <tr className={`${isDark ? "bg-slate-700 border-y border-slate-600" : "bg-gray-100 border-y border-gray-200"}`}>
                                <th className={`text-center px-4 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase w-12`}>#</th>
                                <th className={`text-left px-4 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase`}>
                                  {activeTab === "complaints" ? "Type of Complaint" : "Type of Incident"}
                                </th>
                                <th className={`text-left px-4 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase w-44`}>Date</th>
                                <th className={`text-left px-4 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase w-64`}>Location</th>
                                <th className={`text-left px-4 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase w-28`}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {tablePaged.map((report, index) => (
                                <tr
                                  key={report.id}
                                  onClick={() => handleReportClick(report)}
                                  className={`border-b ${t.cardBorder} ${isDark ? "hover:bg-slate-700" : "hover:bg-gray-50"} transition-colors cursor-pointer`}
                                >
                                  <td className={`text-center px-4 py-3.5 text-sm ${t.cardText}`}>
                                    {(tablePage - 1) * TABLE_PAGE_SIZE + index + 1}
                                  </td>
                                  <td className={`text-left px-4 py-3.5 ${t.cardText} truncate capitalize`}>{report.title}</td>
                                  <td className={`text-left px-4 py-3.5 ${t.cardText} whitespace-nowrap`}>{report.date}</td>
                                  <td className={`text-left px-4 py-3.5 ${t.cardText} truncate`}>{report.location}</td>
                                  <td className="text-left px-4 py-3.5">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold font-kumbh capitalize ${statusBadgeCls[report.status] || statusBadgeCls.ongoing}`}>
                                      {report.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination */}
                        {tableTotalPages > 1 && (
                          <div className={`flex items-center justify-between px-5 py-3.5 border-t ${isDark ? "border-slate-700" : "border-gray-100"}`}>
                            <p className={`text-xs ${t.subtleText} font-kumbh`}>
                              Showing {(tablePage - 1) * TABLE_PAGE_SIZE + 1}–{Math.min(tablePage * TABLE_PAGE_SIZE, sortedReports.length)} of {sortedReports.length}
                            </p>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                                disabled={tablePage === 1}
                                className={`px-3 py-1.5 rounded-lg text-xs font-kumbh font-semibold transition-colors ${
                                  tablePage === 1
                                    ? isDark ? "text-slate-600 cursor-not-allowed" : "text-gray-300 cursor-not-allowed"
                                    : isDark ? "text-slate-300 hover:bg-slate-700" : "text-gray-600 hover:bg-gray-100"
                                }`}
                              >
                                Prev
                              </button>
                              {Array.from({ length: tableTotalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                  key={page}
                                  onClick={() => setTablePage(page)}
                                  className={`w-8 h-8 rounded-lg text-xs font-kumbh font-bold transition-colors ${
                                    page === tablePage
                                      ? `${isDark ? "bg-slate-500" : t.primarySolid} text-white`
                                      : isDark
                                        ? "text-slate-300 hover:bg-slate-700"
                                        : `${t.primaryText} hover:bg-gray-100`
                                  }`}
                                >
                                  {page}
                                </button>
                              ))}
                              <button
                                onClick={() => setTablePage((p) => Math.min(tableTotalPages, p + 1))}
                                disabled={tablePage === tableTotalPages}
                                className={`px-3 py-1.5 rounded-lg text-xs font-kumbh font-semibold transition-colors ${
                                  tablePage === tableTotalPages
                                    ? isDark ? "text-slate-600 cursor-not-allowed" : "text-gray-300 cursor-not-allowed"
                                    : isDark ? "text-slate-300 hover:bg-slate-700" : "text-gray-600 hover:bg-gray-100"
                                }`}
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      )}
                    </>
                  ) : filteredReports.length > 0 ? (
                    /* ── Cards view ── */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {filteredReports.map((report) => (
                        <ReportCard
                          key={report.id}
                          report={report}
                          currentTheme={currentTheme}
                          onClick={() => handleReportClick(report)}
                          showSeverity={activeTab !== "incidents"}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className={`${t.cardBg} rounded-xl p-8 sm:p-12 text-center border ${t.cardBorder}`}>
                      <svg className={`w-12 h-12 sm:w-16 sm:h-16 ${t.subtleText} mx-auto mb-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <h3 className={`text-lg sm:text-xl font-bold ${t.cardText} mb-2 font-spartan`}>
                        {activeTab === "complaints" ? tr.caseManagement.noComplaints : tr.caseManagement.noIncidents}
                      </h3>
                      <p className={`text-sm sm:text-base ${t.subtleText} font-kumbh`}>
                        {activeTab === "complaints" ? tr.caseManagement.noComplaints : tr.caseManagement.noIncidents}
                      </p>
                    </div>
                  )}
                </>
              );
            })()
          )}

          {/* Bottom Bar */}
          <div className={`pt-6 mt-8 border-t ${t.dividerBorder} text-center`}>
            <p className={`text-sm ${t.subtleText} font-kumbh`}>
              © {new Date().getFullYear()} {tr.caseManagement.footer}
            </p>
          </div>
        </div>
      </div>

      <ReportDetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        report={selectedReport}
        currentTheme={currentTheme}
      />

      <style>{`
        .sr-elem {
          opacity: 0;
          transform: translateY(36px);
          transition: opacity 0.55s cubic-bezier(0.4, 0, 0.2, 1),
                      transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sr-elem.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .scrolling-up .sr-elem:not(.visible) {
          transform: translateY(-36px);
        }
        .sr-elem-left {
          opacity: 0;
          transform: translateX(-36px);
          transition: opacity 0.55s cubic-bezier(0.4, 0, 0.2, 1),
                      transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sr-elem-left.visible {
          opacity: 1;
          transform: translateX(0);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
      <Toast toasts={toasts} onRemove={removeToast} currentTheme={currentTheme} />
    </>
  );
};

export default CaseManagementPage;

