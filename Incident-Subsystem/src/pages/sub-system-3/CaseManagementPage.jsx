import React, { useState, useEffect, useCallback, useRef } from "react";
import MainMenuCards from "../../components/sub-system-3/MainMenuCards";
import TabsComponent from "../../components/sub-system-3/TabsComponent";
import ReportCard from "../../components/sub-system-3/ReportCard";
import ReportDetailModal from "../../components/sub-system-3/Reportdetailmodal";
import MapComponent from "../../components/shared/MapComponent";
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
  const apptListRef    = useRef(null);
  const apptSentinelRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const APPT_PAGE_SIZE = 8;
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
      console.error(`Failed to fetch ${activeTab}:`, error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

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
            CASE TRACKER
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
                      My Appointments
                    </h2>
                    <p className={`text-sm sm:text-base ${t.subtleText} font-kumbh`}>
                      Barangay hearing appointments scheduled for your complaints
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
                          Appointment List
                        </span>
                        <span className={`ml-2 text-[11px] font-kumbh ${t.subtleText}`}>
                          {visibleAppts.length} {apptFilter === "all" ? "total" : apptFilter.replace(/_/g, " ")}
                        </span>
                      </div>
                      <svg
                        className={`w-4 h-4 ${t.subtleText} transition-transform duration-300 ${apptOpen ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Status filter pills */}
                    {apptOpen && (
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
                    )}

                    {/* Appointments list — scrollable, infinite */}
                    {apptOpen && (() => {
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
                              <span className={`text-[10px] font-bold uppercase tracking-widest font-kumbh ${t.subtleText}`}>Appointment</span>
                            </div>
                            <div className="flex-shrink-0 w-16 text-center hidden sm:block">
                              <span className={`text-[10px] font-bold uppercase tracking-widest font-kumbh ${t.subtleText}`}>Time</span>
                            </div>
                            <div className="flex-shrink-0 w-24 text-right">
                              <span className={`text-[10px] font-bold uppercase tracking-widest font-kumbh ${t.subtleText}`}>Status</span>
                            </div>
                          </div>

                          {/* Body */}
                          {loading ? (
                            <div className="py-10 text-center">
                              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
                              <p className={`text-sm ${t.subtleText} font-kumbh`}>Loading appointments…</p>
                            </div>
                          ) : visibleAppts.length === 0 ? (
                            <div className="py-10 text-center">
                              <svg className={`w-12 h-12 ${t.subtleText} mx-auto mb-3`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                              </svg>
                              <p className={`text-sm font-semibold ${t.cardText} font-spartan mb-1`}>No appointments found</p>
                              <p className={`text-xs ${t.subtleText} font-kumbh`}>
                                {apptFilter === "all"
                                  ? "You have no barangay appointments yet."
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
                                    {isExp && (
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
                                            <p className={`text-[10px] font-bold uppercase tracking-wide font-kumbh ${isDark ? "text-green-400" : "text-green-600"}`}>Where to Go</p>
                                            <p className={`text-sm font-bold font-spartan ${t.cardText}`}>Gulod Barangay Hall</p>
                                          </div>
                                        </div>

                                        {/* Detail rows */}
                                        <div className={`rounded-xl border ${t.cardBorder} divide-y ${isDark ? "divide-slate-700" : "divide-gray-100"} overflow-hidden`}>
                                          {[
                                            { label: "Complaint Type",     value: appt.complaint_type || "—" },
                                            { label: "Respondent",         value: appt.respondent_name || "—" },
                                            { label: "Respondent Address", value: appt.respondent_address || "—" },
                                            { label: "Appointment ID",     value: `#${appt.id}` },
                                            { label: "Complaint ID",       value: `#${appt.complaint_id || "—"}` },
                                          ].map(({ label, value }) => (
                                            <div key={label} className={`flex items-start px-4 py-2.5 ${isDark ? "bg-slate-800" : "bg-white"}`}>
                                              <span className={`text-xs font-semibold w-36 flex-shrink-0 font-kumbh ${t.subtleText} pt-0.5`}>{label}</span>
                                              <span className={`text-xs font-kumbh ${t.cardText} leading-relaxed`}>{value}</span>
                                            </div>
                                          ))}
                                          {appt.description && (
                                            <div className={`px-4 py-2.5 ${isDark ? "bg-slate-800" : "bg-white"}`}>
                                              <span className={`text-xs font-semibold font-kumbh ${t.subtleText} block mb-1`}>Notes</span>
                                              <span className={`text-xs font-kumbh ${t.cardText} leading-relaxed`}>{appt.description}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
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
                                  All {visibleAppts.length} appointment{visibleAppts.length !== 1 ? "s" : ""} shown
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </>
              );
            })()
          ) : (
            /* ── Complaints / Incidents Tabs ───────────────────────────────── */
            <>
              {/* Header */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h2 className={`text-3xl sm:text-4xl font-bold ${t.cardText} font-spartan`}>
                    {activeTab === "complaints" ? "Complaint Tracker" : "Incident Tracker"}
                  </h2>
                  <button
                    onClick={() => setShowMap(!showMap)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${t.cardBg} border ${t.cardBorder} hover:shadow-md transition-all font-kumbh`}
                  >
                    {showMap ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        <span className="hidden sm:inline">Grid View</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <span className="hidden sm:inline">Map View</span>
                      </>
                    )}
                  </button>
                </div>
                <p className={`text-sm sm:text-base ${t.subtleText} font-kumbh text-left`}>
                  {activeTab === "complaints"
                    ? "View and track your submitted complaints"
                    : "View and track your submitted incident reports"}
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className={`sr-elem ${t.cardBg} rounded-xl p-4 sm:p-6 border ${t.cardBorder} shadow-md hover:shadow-lg transition-all`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs sm:text-sm ${t.subtleText} mb-1 font-kumbh`}>On-Going</p>
                      <p className={`text-3xl sm:text-4xl font-bold ${t.cardText} font-spartan`}>{statusCounts.ongoing}</p>
                    </div>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className={`sr-elem ${t.cardBg} rounded-xl p-4 sm:p-6 border ${t.cardBorder} shadow-md hover:shadow-lg transition-all`} style={{ transitionDelay: "0.1s" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs sm:text-sm ${t.subtleText} mb-1 font-kumbh`}>Resolved</p>
                      <p className={`text-3xl sm:text-4xl font-bold ${t.cardText} font-spartan`}>{statusCounts.resolved}</p>
                    </div>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className={`sr-elem ${t.cardBg} rounded-xl p-4 sm:p-6 border ${t.cardBorder} shadow-md hover:shadow-lg transition-all sm:col-span-2 lg:col-span-1`} style={{ transitionDelay: "0.2s" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs sm:text-sm ${t.subtleText} mb-1 font-kumbh`}>Rejected</p>
                      <p className={`text-3xl sm:text-4xl font-bold ${t.cardText} font-spartan`}>{statusCounts.rejected}</p>
                    </div>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="sr-elem overflow-x-auto mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className={`inline-flex ${t.cardBg} rounded-lg p-1.5 shadow-md border ${t.cardBorder} min-w-full sm:min-w-0`}>
                  {["ongoing", "resolved", "rejected"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-md font-semibold text-xs sm:text-sm transition-all font-kumbh capitalize whitespace-nowrap ${
                        activeFilter === filter
                          ? `bg-gradient-to-r ${t.primaryGrad} text-white shadow-md`
                          : `${t.subtleText} ${isDark ? "hover:bg-slate-200 hover:text-slate-800" : "hover:bg-slate-100 hover:text-slate-800"}`
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {filter === "ongoing" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
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

              {/* Loading / Map / Grid */}
              {loading ? (
                <div className={`${t.cardBg} rounded-xl p-8 sm:p-12 text-center border ${t.cardBorder}`}>
                  <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                  <p className={`text-sm ${t.subtleText} font-kumbh`}>Loading {activeTab}...</p>
                </div>
              ) : showMap ? (
                <div className="mb-6">
                  <MapComponent mode="view" markers={getMapMarkers()} currentTheme={currentTheme} height="600px" />
                </div>
              ) : filteredReports.length > 0 ? (
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
                    No {activeFilter} {activeTab === "complaints" ? "complaints" : "incidents"}
                  </h3>
                  <p className={`text-sm sm:text-base ${t.subtleText} font-kumbh`}>
                    There are no {activeTab === "complaints" ? "complaints" : "incidents"} with this status at the moment.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Bottom Bar */}
          <div className={`pt-6 mt-8 border-t ${t.dividerBorder} text-center`}>
            <p className={`text-sm ${t.subtleText} font-kumbh`}>
              © {new Date().getFullYear()} Barangay Incident & Complaint
              Management System. All rights reserved.
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
    </>
  );
};

export default CaseManagementPage;

