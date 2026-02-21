import React, { useEffect, useMemo, useState } from "react";
import themeTokens from "../../Themetokens";

const summaryCards = [
  {
    title: "Pending Verification",
    value: 67,
    subtitle: "Successfully verified documents",
    icon: "!",
    iconClass: "text-amber-500 border-amber-500",
  },
  {
    title: "Verified",
    value: 20,
    subtitle: "Registered documents",
    icon: "✓",
    iconClass: "text-green-500 border-green-500",
  },
  {
    title: "Rejected",
    value: 9,
    subtitle: "Rejected documents",
    icon: "✕",
    iconClass: "text-red-500 border-red-500",
  },
];

const documentCards = [
  {
    id: 1,
    residentName: "Mateo Dela Cruz",
    status: "Pending",
    documentType: "Barangay ID",
    referenceNumber: "1110-2364-7968",
    dateSubmitted: "January 31, 2026",
  },
  {
    id: 2,
    residentName: "Brian Dajamco",
    status: "Completed",
    documentType: "Certificate of Residency",
    referenceNumber: "2210-1842-4471",
    dateSubmitted: "January 30, 2026",
  },
  {
    id: 3,
    residentName: "Luna Reyes",
    status: "Rejected",
    documentType: "Certificate of Indigency",
    referenceNumber: "3190-9084-2236",
    dateSubmitted: "January 29, 2026",
  },
  {
    id: 4,
    residentName: "Ariel Santos",
    status: "Pending",
    documentType: "Barangay ID",
    referenceNumber: "4441-2204-1109",
    dateSubmitted: "January 28, 2026",
  },
  {
    id: 5,
    residentName: "Mia Flores",
    status: "Completed",
    documentType: "Certificate of Residency",
    referenceNumber: "5152-7712-3340",
    dateSubmitted: "January 28, 2026",
  },
  {
    id: 6,
    residentName: "Kris Mendoza",
    status: "Pending",
    documentType: "Certificate of Indigency",
    referenceNumber: "6891-3022-7745",
    dateSubmitted: "January 27, 2026",
  },
];

const statusTabs = ["All", "Pending", "Completed", "Rejected"];

const toStartOfDay = (dateText) => {
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  date.setHours(0, 0, 0, 0);
  return date;
};

const DocumentsInquiryPage = () => {
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("appTheme") || "blue"
  );
  const [activeStatus, setActiveStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("card");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const handleThemeChange = (e) => setCurrentTheme(e.detail);
    window.addEventListener("themeChange", handleThemeChange);
    return () => window.removeEventListener("themeChange", handleThemeChange);
  }, []);

  const t = themeTokens[currentTheme];

  const statusCounts = useMemo(() => {
    const counts = { All: documentCards.length, Pending: 0, Completed: 0, Rejected: 0 };
    documentCards.forEach((item) => {
      if (counts[item.status] !== undefined) {
        counts[item.status] += 1;
      }
    });
    return counts;
  }, []);

  const filteredCards = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const start = startDate ? toStartOfDay(startDate) : null;
    const end = endDate ? toStartOfDay(endDate) : null;

    return documentCards.filter((card) => {
      const matchesStatus = activeStatus === "All" || card.status === activeStatus;
      const matchesSearch =
        query.length === 0 ||
        card.residentName.toLowerCase().includes(query) ||
        card.documentType.toLowerCase().includes(query) ||
        card.referenceNumber.toLowerCase().includes(query);
      const submittedDate = toStartOfDay(card.dateSubmitted);
      const matchesStart = !start || (submittedDate && submittedDate >= start);
      const matchesEnd = !end || (submittedDate && submittedDate <= end);

      return matchesStatus && matchesSearch && matchesStart && matchesEnd;
    });
  }, [activeStatus, searchTerm, startDate, endDate]);

  return (
    <div className={`${t.pageBg} min-h-full p-4 sm:p-6 lg:p-8`}>
      <div className="max-w-6xl mx-auto space-y-4">
        <h1 className={`font-spartan text-4xl sm:text-5xl font-bold ${t.cardText}`}>
          Issuance Application
        </h1>

        <h2 className="font-spartan text-xl font-bold text-gray-700">
          Document Submission
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {summaryCards.map((card) => (
            <div key={card.title} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-spartan text-sm font-semibold text-gray-700">{card.title}</p>
                  <p className="font-spartan text-5xl font-bold text-gray-700 mt-2">{card.value}</p>
                  <p className="font-kumbh text-sm text-gray-500 mt-2">{card.subtitle}</p>
                </div>
                <span className={`h-7 w-7 rounded-full border-2 flex items-center justify-center text-sm font-bold ${card.iconClass}`}>
                  {card.icon}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {statusTabs.map((tab) => {
              const active = tab === activeStatus;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveStatus(tab)}
                  className={`rounded-md border px-3 py-1.5 text-[11px] font-spartan font-bold uppercase tracking-wide ${active ? "border-slate-700 bg-slate-700 text-white" : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"}`}
                >
                  {tab} ({statusCounts[tab] ?? 0})
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("card")}
              className={`rounded-md border px-3 py-1.5 text-[11px] font-spartan font-bold uppercase tracking-wide ${viewMode === "card" ? "border-slate-700 bg-slate-700 text-white" : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"}`}
            >
              Card View
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`rounded-md border px-3 py-1.5 text-[11px] font-spartan font-bold uppercase tracking-wide ${viewMode === "table" ? "border-slate-700 bg-slate-700 text-white" : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"}`}
            >
              Table View
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <div className="md:col-span-2">
            <p className="mb-1 text-[10px] font-spartan font-bold uppercase tracking-wide text-gray-500">Search</p>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, type, reference number..."
              className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm font-kumbh text-gray-700 outline-none focus:border-gray-400"
            />
          </div>

          <div>
            <p className="mb-1 text-[10px] font-spartan font-bold uppercase tracking-wide text-gray-500">Filter By Status</p>
            <select
              value={activeStatus}
              onChange={(e) => setActiveStatus(e.target.value)}
              className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm font-kumbh text-gray-700 outline-none focus:border-gray-400"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <p className="mb-1 text-[10px] font-spartan font-bold uppercase tracking-wide text-gray-500">Start Date</p>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm font-kumbh text-gray-700 outline-none focus:border-gray-400"
            />
          </div>

          <div>
            <p className="mb-1 text-[10px] font-spartan font-bold uppercase tracking-wide text-gray-500">End Date</p>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm font-kumbh text-gray-700 outline-none focus:border-gray-400"
            />
          </div>
        </div>

        {viewMode === "card" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredCards.map((card) => (
              <div key={card.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <p className="font-spartan text-sm font-semibold text-gray-700">{card.residentName}</p>
                  <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 text-xs font-kumbh">
                    {card.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <InfoRow label="Document Type:" value={card.documentType} subtle="text-gray-500" text="text-gray-700" />
                  <InfoRow label="Reference Number:" value={card.referenceNumber} subtle="text-gray-500" text="text-gray-700" />
                  <InfoRow label="Date Submitted:" value={card.dateSubmitted} subtle="text-gray-500" text="text-gray-700" />
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex-1 h-8 rounded-full border border-slate-700 bg-slate-700 text-white font-kumbh text-xs hover:bg-slate-800">Accept</button>
                  <button className="flex-1 h-8 rounded-full border border-gray-300 bg-gray-100 text-gray-700 font-kumbh text-xs hover:bg-gray-200">Preview</button>
                  <button className="flex-1 h-8 rounded-full border border-gray-300 bg-white text-gray-700 font-kumbh text-xs hover:bg-gray-100">Decline</button>
                </div>
              </div>
            ))}

            {filteredCards.length === 0 && (
              <div className="md:col-span-2 xl:col-span-3 rounded-xl border border-dashed border-gray-300 bg-white px-4 py-10 text-center text-sm font-kumbh text-gray-500">
                No document inquiries found.
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full min-w-[860px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2.5 text-left text-[11px] font-spartan font-bold uppercase tracking-wide text-gray-500">Name</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-spartan font-bold uppercase tracking-wide text-gray-500">Type</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-spartan font-bold uppercase tracking-wide text-gray-500">Reference Number</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-spartan font-bold uppercase tracking-wide text-gray-500">Date Submitted</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-spartan font-bold uppercase tracking-wide text-gray-500">Status</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-spartan font-bold uppercase tracking-wide text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCards.map((card) => (
                  <tr key={card.id}>
                    <td className="px-4 py-3 text-sm font-kumbh text-gray-700 border-b border-gray-200">{card.residentName}</td>
                    <td className="px-4 py-3 text-sm font-kumbh text-gray-700 border-b border-gray-200">{card.documentType}</td>
                    <td className="px-4 py-3 text-sm font-kumbh text-gray-700 border-b border-gray-200">{card.referenceNumber}</td>
                    <td className="px-4 py-3 text-sm font-kumbh text-gray-700 border-b border-gray-200">{card.dateSubmitted}</td>
                    <td className="px-4 py-3 text-sm font-kumbh border-b border-gray-200">
                      <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 text-xs">
                        {card.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <button className="h-7 rounded-full border border-slate-700 bg-slate-700 px-3 text-white font-kumbh text-xs hover:bg-slate-800">Accept</button>
                        <button className="h-7 rounded-full border border-gray-300 bg-gray-100 px-3 text-gray-700 font-kumbh text-xs hover:bg-gray-200">Preview</button>
                        <button className="h-7 rounded-full border border-gray-300 bg-white px-3 text-gray-700 font-kumbh text-xs hover:bg-gray-100">Decline</button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredCards.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm font-kumbh text-gray-500">
                      No document inquiries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, subtle, text }) => (
  <div className="grid grid-cols-2 gap-2">
    <p className={`font-kumbh text-xs ${subtle}`}>{label}</p>
    <p className={`font-kumbh text-xs ${text}`}>{value}</p>
  </div>
);

export default DocumentsInquiryPage;
