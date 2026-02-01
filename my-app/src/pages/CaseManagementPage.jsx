import React, { useState } from "react";
import Layout from "../components/Layout";
import ReportCard from "../components/ReportCard";
import themeTokens from "../Themetokens";

// Report Detail Modal Component
const ReportDetailModal = ({ isOpen, onClose, report, currentTheme }) => {
  if (!isOpen || !report) return null;

  const t = themeTokens[currentTheme];
  const isDark = currentTheme === "dark";

  const statusConfig = {
    ongoing: {
      badge: "bg-blue-500",
      icon: (
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    resolved: {
      badge: "bg-green-500",
      icon: (
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    rejected: {
      badge: "bg-red-500",
      icon: (
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
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  };

  const config = statusConfig[report.status.toLowerCase()];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`relative ${t.modalBg} rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scaleIn`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 bg-gradient-to-r ${t.modalHeaderGrad} px-6 py-5 flex items-center justify-between border-b ${t.modalHeaderBorderBottom} rounded-t-2xl z-10`}
        >
          <div className="flex items-center gap-3">
            <div className={`${config.badge} text-white p-2 rounded-lg`}>
              {config.icon}
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${t.modalTitle} font-spartan`}>
                Report Details
              </h2>
              <p className={`text-sm ${t.modalSubtext} font-kumbh`}>
                {report.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 ${t.modalCloseBtnColor} ${t.modalCloseBtnHover} ${t.modalCloseBtnHoverBg} rounded-lg transition-all`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span
              className={`${config.badge} text-white px-4 py-2 rounded-full font-semibold font-kumbh`}
            >
              {report.status}
            </span>
            <span className={`text-sm ${t.subtleText} font-kumbh`}>
              {report.date}
            </span>
          </div>

          {/* Image */}
          {report.image && (
            <div className="rounded-xl overflow-hidden">
              <img
                src={report.image}
                alt={report.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Title & Category */}
          <div>
            <h3
              className={`text-3xl font-bold ${t.cardText} mb-2 font-spartan`}
            >
              {report.title}
            </h3>
            <p className={`text-lg ${t.subtleText} font-kumbh`}>
              {report.category}
            </p>
          </div>

          {/* Info Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <div
              className={`${isDark ? "bg-slate-700/50" : "bg-slate-50"} rounded-lg p-4`}
            >
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className={`w-5 h-5 ${t.primaryText}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span
                  className={`text-sm font-semibold ${t.subtleText} font-kumbh`}
                >
                  Location
                </span>
              </div>
              <p className={`${t.cardText} font-kumbh`}>{report.location}</p>
            </div>

            <div
              className={`${isDark ? "bg-slate-700/50" : "bg-slate-50"} rounded-lg p-4`}
            >
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className={`w-5 h-5 ${t.primaryText}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span
                  className={`text-sm font-semibold ${t.subtleText} font-kumbh`}
                >
                  Severity
                </span>
              </div>
              <p className={`${t.cardText} font-kumbh`}>{report.severity}</p>
            </div>

            <div
              className={`${isDark ? "bg-slate-700/50" : "bg-slate-50"} rounded-lg p-4`}
            >
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className={`w-5 h-5 ${t.primaryText}`}
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
                <span
                  className={`text-sm font-semibold ${t.subtleText} font-kumbh`}
                >
                  Date Submitted
                </span>
              </div>
              <p className={`${t.cardText} font-kumbh`}>{report.date}</p>
            </div>

            <div
              className={`${isDark ? "bg-slate-700/50" : "bg-slate-50"} rounded-lg p-4`}
            >
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className={`w-5 h-5 ${t.primaryText}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                <span
                  className={`text-sm font-semibold ${t.subtleText} font-kumbh`}
                >
                  Category
                </span>
              </div>
              <p className={`${t.cardText} font-kumbh`}>{report.category}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className={`text-lg font-bold ${t.cardText} mb-3 font-spartan`}>
              Description
            </h4>
            <p className={`${t.subtleText} leading-relaxed font-kumbh`}>
              {report.description}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

const CaseManagementPage = () => {
  const [currentTheme] = useState(() => {
    return localStorage.getItem("appTheme") || "blue";
  });
  const [activeTab, setActiveTab] = useState("ongoing");
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const t = themeTokens[currentTheme];
  const isDark = currentTheme === "dark";

  // Mock data - All reports are from the current user/resident
  const mockReports = {
    ongoing: [
      {
        id: "INC-2025-0127",
        title: "Ankle Deep Flooding",
        category: "Flooding",
        location: "Green Acres Subdivision, Novaliches, Quezon City",
        date: "January 27, 2025",
        severity: "Medium",
        status: "Ongoing",
        description:
          "The road at Green Acres Subdivision is currently flooded ankle-deep. Reported at 3:31 PM today.",
        image: "/api/placeholder/400/300",
      },
      {
        id: "INC-2025-0125",
        title: "Broken Streetlight",
        category: "Infrastructure",
        location: "Corner of Main St. and 5th Ave.",
        date: "January 25, 2025",
        severity: "Low",
        status: "Ongoing",
        description:
          "Streetlight has been non-functional for 3 days, creating safety concerns at night.",
        image: "/api/placeholder/400/300",
      },
      {
        id: "INC-2025-0122",
        title: "Pothole on Road",
        category: "Road Damage",
        location: "Riverside Drive, near Gate 2",
        date: "January 22, 2025",
        severity: "High",
        status: "Ongoing",
        description:
          "Large pothole causing traffic issues and potential vehicle damage. Urgent repair needed.",
        image: "/api/placeholder/400/300",
      },
    ],
    resolved: [
      {
        id: "INC-2025-0123",
        title: "Clogged Drainage",
        category: "Sanitation",
        location: "Oak Street, Block 5",
        date: "January 23, 2025",
        severity: "Medium",
        status: "Resolved",
        description:
          "Drainage system was clogged causing water backup. Issue has been resolved and cleaned.",
        image: "/api/placeholder/400/300",
      },
      {
        id: "INC-2025-0118",
        title: "Overflowing Garbage Bin",
        category: "Waste Management",
        location: "Community Park Entrance",
        date: "January 18, 2025",
        severity: "Low",
        status: "Resolved",
        description:
          "Garbage bin was overflowing. Waste has been collected and bin cleaned.",
        image: "/api/placeholder/400/300",
      },
    ],
    rejected: [
      {
        id: "INC-2025-0120",
        title: "Duplicate Report",
        category: "Infrastructure",
        location: "Main Gate Area",
        date: "January 20, 2025",
        severity: "Low",
        status: "Rejected",
        description:
          "This report was identified as a duplicate of INC-2025-0119 and has been rejected.",
        image: "/api/placeholder/400/300",
      },
      {
        id: "INC-2025-0115",
        title: "Insufficient Information",
        category: "General",
        location: "Not specified",
        date: "January 15, 2025",
        severity: "Low",
        status: "Rejected",
        description:
          "Report rejected due to insufficient details. Please resubmit with complete information including specific location and description.",
        image: "/api/placeholder/400/300",
      },
    ],
  };

  const tabs = [
    {
      id: "ongoing",
      label: "On-Going",
      count: mockReports.ongoing.length,
      icon: (
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: "resolved",
      label: "Resolved",
      count: mockReports.resolved.length,
      icon: (
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: "rejected",
      label: "Rejected",
      count: mockReports.rejected.length,
      icon: (
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
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  const handleReportClick = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const currentReports = mockReports[activeTab];

  return (
    <Layout>
      <div className="container mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-3xl font-bold ${t.cardText} mb-2 font-spartan`}>
            My Reports
          </h1>
          <p className={`text-base ${t.subtleText} font-kumbh`}>
            View and track your submitted incident reports
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`${t.cardBg} border ${t.cardBorder} rounded-lg p-4 shadow hover:shadow-lg transition-all`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${t.subtleText} mb-1 font-kumbh`}>
                    {tab.label}
                  </p>
                  <p
                    className={`text-2xl font-bold ${t.cardText} font-spartan`}
                  >
                    {tab.count}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${t.primaryGrad} rounded-lg flex items-center justify-center text-white`}
                >
                  {tab.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-5">
          <div
            className={`inline-flex ${isDark ? "bg-slate-800" : "bg-slate-100"} rounded-lg p-1 gap-1`}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all duration-200 font-kumbh text-sm ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${t.primaryGrad} text-white shadow-md`
                    : `${isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"}`
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === tab.id
                      ? "bg-white/20"
                      : isDark
                        ? "bg-slate-700"
                        : "bg-slate-200"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Reports Grid */}
        {currentReports.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentReports.map((report) => (
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
            className={`${t.cardBg} border ${t.cardBorder} rounded-xl p-12 text-center`}
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p
              className={`text-lg font-semibold ${t.cardText} mb-2 font-kumbh`}
            >
              No {tabs.find((t) => t.id === activeTab)?.label} Reports
            </p>
            <p className={`${t.subtleText} font-kumbh`}>
              You don't have any {activeTab} reports at the moment.
            </p>
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      <ReportDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        report={selectedReport}
        currentTheme={currentTheme}
      />
    </Layout>
  );
};

export default CaseManagementPage;
