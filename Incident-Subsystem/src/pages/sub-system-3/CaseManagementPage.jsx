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

const CaseManagementPage = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("complaints");
  const [activeFilter, setActiveFilter] = useState("ongoing");
  const [showMap, setShowMap] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
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
      date: c.incident_date || c.created_at?.split("T")[0] || "",
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
      date: i.created_at?.split("T")[0] || "",
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
      } else {
        const data = await incidentService.getMyIncidents();
        const raw = Array.isArray(data) ? data : data.data || [];
        setIncidents(raw.map(normalizeIncident));
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
            }}
            currentTheme={currentTheme}
          />

          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-2">
              <h2
                className={`text-3xl sm:text-4xl font-bold ${t.cardText} font-spartan`}
              >
                {activeTab === "complaints"
                  ? "Complaint Management"
                  : "Incident Management"}
              </h2>
              <button
                onClick={() => setShowMap(!showMap)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${t.cardBg} border ${t.cardBorder} hover:shadow-md transition-all font-kumbh`}
              >
                {showMap ? (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                      />
                    </svg>
                    <span className="hidden sm:inline">Grid View</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
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
            <div
              className={`${t.cardBg} rounded-xl p-4 sm:p-6 border ${t.cardBorder} shadow-md hover:shadow-lg transition-all`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-xs sm:text-sm ${t.subtleText} mb-1 font-kumbh`}
                  >
                    On-Going
                  </p>
                  <p
                    className={`text-3xl sm:text-4xl font-bold ${t.cardText} font-spartan`}
                  >
                    {statusCounts.ongoing}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0`}
                >
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600"
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
                </div>
              </div>
            </div>

            <div
              className={`${t.cardBg} rounded-xl p-4 sm:p-6 border ${t.cardBorder} shadow-md hover:shadow-lg transition-all`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-xs sm:text-sm ${t.subtleText} mb-1 font-kumbh`}
                  >
                    Resolved
                  </p>
                  <p
                    className={`text-3xl sm:text-4xl font-bold ${t.cardText} font-spartan`}
                  >
                    {statusCounts.resolved}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0`}
                >
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div
              className={`${t.cardBg} rounded-xl p-4 sm:p-6 border ${t.cardBorder} shadow-md hover:shadow-lg transition-all sm:col-span-2 lg:col-span-1`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-xs sm:text-sm ${t.subtleText} mb-1 font-kumbh`}
                  >
                    Rejected
                  </p>
                  <p
                    className={`text-3xl sm:text-4xl font-bold ${t.cardText} font-spartan`}
                  >
                    {statusCounts.rejected}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0`}
                >
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="overflow-x-auto mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div
              className={`inline-flex ${t.cardBg} rounded-lg p-1.5 shadow-md border ${t.cardBorder} min-w-full sm:min-w-0`}
            >
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
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {filter === "ongoing" && (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      )}
                      {filter === "resolved" && (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      )}
                      {filter === "rejected" && (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      )}
                    </svg>
                    <span className="hidden sm:inline">{filter}</span>
                    <span
                      className={`ml-0.5 sm:ml-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${
                        activeFilter === filter
                          ? "bg-white/20"
                          : isDark
                            ? "bg-slate-600 text-slate-300"
                            : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {statusCounts[filter]}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div
              className={`${t.cardBg} rounded-xl p-8 sm:p-12 text-center border ${t.cardBorder}`}
            >
              <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className={`text-sm ${t.subtleText} font-kumbh`}>
                Loading {activeTab}...
              </p>
            </div>
          ) : showMap ? (
            <div className="mb-6">
              <MapComponent
                mode="view"
                markers={getMapMarkers()}
                currentTheme={currentTheme}
                height="600px"
              />
            </div>
          ) : (
            <>
              {/* Reports Grid */}
              {filteredReports.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredReports.map((report) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      currentTheme={currentTheme}
                      onClick={() => handleReportClick(report)}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className={`${t.cardBg} rounded-xl p-8 sm:p-12 text-center border ${t.cardBorder}`}
                >
                  <svg
                    className={`w-12 h-12 sm:w-16 sm:h-16 ${t.subtleText} mx-auto mb-4`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <h3
                    className={`text-lg sm:text-xl font-bold ${t.cardText} mb-2 font-spartan`}
                  >
                    No {activeFilter} {activeTab === "complaints" ? "complaints" : "incidents"}
                  </h3>
                  <p
                    className={`text-sm sm:text-base ${t.subtleText} font-kumbh`}
                  >
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
    </>
  );
};

export default CaseManagementPage;
