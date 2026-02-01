import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import ReportCard from "../components/ReportCard";
import ReportDetailModal from "../components/modals/Reportdetailmodal";
import themeTokens from "../Themetokens";

const CaseManagementPage = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ongoing");
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem("appTheme") || "blue";
  });

  // Listen for theme changes
  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentTheme(localStorage.getItem("appTheme") || "blue");
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom theme change event
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

  const mockReports = [
    {
      id: "INC-2025-0127",
      title: "Ankle Deep Flooding",
      category: "Flooding",
      location: "Green Acres Subdivision, Novaliches, Quezon City",
      description:
        "The road at Green Acres Subdivision is currently flooded ankle-deep. Reported at 3:31 PM today.",
      date: "January 27, 2025",
      status: "Ongoing",
      severity: "Medium",
      submittedBy: "Juan Dela Cruz",
      image: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=500",
    },
    {
      id: "INC-2025-0125",
      title: "Broken Streetlight",
      category: "Infrastructure",
      location: "Corner of Main St. and 5th Ave.",
      description:
        "Streetlight has been non-functional for 3 days, creating safety concerns at night.",
      date: "January 25, 2025",
      status: "Ongoing",
      severity: "Low",
      submittedBy: "Maria Santos",
      image:
        "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=500",
    },
    {
      id: "INC-2025-0122",
      title: "Pothole on Road",
      category: "Road Damage",
      location: "Riverside Drive, near Gate 2",
      description:
        "Large pothole causing traffic issues and potential vehicle damage. Urgent repair needed.",
      date: "January 22, 2025",
      status: "Ongoing",
      severity: "High",
      submittedBy: "Pedro Reyes",
      image:
        "https://images.unsplash.com/photo-1625935229727-b3089e3fc1ce?w=500",
    },
    {
      id: "INC-2025-0120",
      title: "Tree Branch Blocking Path",
      category: "Obstruction",
      location: "City Park, Main Walkway",
      description:
        "Fallen tree branch blocking the main walking path in City Park. Resolved on January 21, 2025.",
      date: "January 20, 2025",
      status: "Resolved",
      severity: "Medium",
      submittedBy: "Ana Lopez",
      image:
        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500",
    },
    {
      id: "INC-2025-0118",
      title: "Graffiti on Public Wall",
      category: "Vandalism",
      location: "City Hall Building, East Wall",
      description:
        "Graffiti found on the east wall of City Hall. Cleaned on January 19, 2025.",
      date: "January 18, 2025",
      status: "Resolved",
      severity: "Low",
      submittedBy: "Carlos Mendoza",
      image:
        "https://images.unsplash.com/photo-1618609378039-b572f64c5b42?w=500",
    },
    {
      id: "INC-2025-0115",
      title: "Water Leak on Street",
      category: "Infrastructure",
      location: "Elm Street, near House #45",
      description:
        "Water leak reported near House #45 on Elm Street. Rejected due to insufficient evidence.",
      date: "January 15, 2025",
      status: "Rejected",
      severity: "Medium",
      submittedBy: "Sofia Garcia",
      image:
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500",
    },
    {
      id: "INC-2025-0112",
      title: "Stray Animals in Park",
      category: "Public Safety",
      location: "Sunset Park, Near Playground",
      description:
        "Multiple stray animals reported near the playground area. Rejected as no evidence provided.",
      date: "January 12, 2025",
      status: "Rejected",
      severity: "Low",
      submittedBy: "Elena Flores",
      image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500",
    },
  ];

  const filteredReports = mockReports.filter(
    (r) => r.status.toLowerCase() === activeFilter,
  );

  const statusCounts = {
    ongoing: mockReports.filter((r) => r.status.toLowerCase() === "ongoing")
      .length,
    resolved: mockReports.filter((r) => r.status.toLowerCase() === "resolved")
      .length,
    rejected: mockReports.filter((r) => r.status.toLowerCase() === "rejected")
      .length,
  };

  const handleReportClick = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedReport(null), 300);
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold ${t.cardText} mb-2 font-spartan`}>
            Case Management
          </h1>
          <p className={`${t.subtleText} font-kumbh`}>
            View and track your submitted incident reports
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            className={`${t.cardBg} rounded-xl p-6 border ${t.cardBorder} shadow-md hover:shadow-lg transition-all`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${t.subtleText} mb-1 font-kumbh`}>
                  On-Going
                </p>
                <p className={`text-4xl font-bold ${t.cardText} font-spartan`}>
                  {statusCounts.ongoing}
                </p>
              </div>
              <div
                className={`w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center`}
              >
                <svg
                  className="w-7 h-7 text-blue-600"
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
            className={`${t.cardBg} rounded-xl p-6 border ${t.cardBorder} shadow-md hover:shadow-lg transition-all`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${t.subtleText} mb-1 font-kumbh`}>
                  Resolved
                </p>
                <p className={`text-4xl font-bold ${t.cardText} font-spartan`}>
                  {statusCounts.resolved}
                </p>
              </div>
              <div
                className={`w-14 h-14 bg-green-100 rounded-full flex items-center justify-center`}
              >
                <svg
                  className="w-7 h-7 text-green-600"
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
            className={`${t.cardBg} rounded-xl p-6 border ${t.cardBorder} shadow-md hover:shadow-lg transition-all`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${t.subtleText} mb-1 font-kumbh`}>
                  Rejected
                </p>
                <p className={`text-4xl font-bold ${t.cardText} font-spartan`}>
                  {statusCounts.rejected}
                </p>
              </div>
              <div
                className={`w-14 h-14 bg-red-100 rounded-full flex items-center justify-center`}
              >
                <svg
                  className="w-7 h-7 text-red-600"
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
        <div
          className={`inline-flex ${t.cardBg} rounded-lg p-1.5 shadow-md border ${t.cardBorder} mb-6`}
        >
          {["ongoing", "resolved", "rejected"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2.5 rounded-md font-semibold text-sm transition-all font-kumbh capitalize ${
                activeFilter === filter
                  ? `bg-gradient-to-r ${t.primaryGrad} text-white shadow-md`
                  : `${t.subtleText} hover:${t.cardText}`
              }`}
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
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
                {filter}
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeFilter === filter
                      ? "bg-white/20"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {statusCounts[filter]}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Reports Grid */}
        {filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            className={`${t.cardBg} rounded-xl p-12 text-center border ${t.cardBorder}`}
          >
            <svg
              className={`w-16 h-16 ${t.subtleText} mx-auto mb-4`}
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
            <h3 className={`text-xl font-bold ${t.cardText} mb-2 font-spartan`}>
              No {activeFilter} reports
            </h3>
            <p className={`${t.subtleText} font-kumbh`}>
              There are no reports with this status at the moment.
            </p>
          </div>
        )}
      </div>

      <ReportDetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        report={selectedReport}
        currentTheme={currentTheme}
      />
    </Layout>
  );
};

export default CaseManagementPage;
