import React, { useState, useEffect } from "react";
import { incidentService } from "../../services/sub-system-3/incidentService";
import { updateComplaint } from "../../services/sub-system-3/complaintService";

const STATUS_CONFIG = {
  all: { label: "ALL", color: "#374151" },
  pending: { label: "NEW (PENDING)", color: "#dc2626" },
  dispatched: { label: "DISPATCHED", color: "#f59e0b" },
  active: { label: "ON-SITE (ACTIVE)", color: "#2563eb" },
  resolved: { label: "RESOLVED", color: "#16a34a" },
  rejected: { label: "REJECTED", color: "#6b7280" },
};

const AdminReportDetailsModal = ({
  incident,
  onClose,
  reportType,
  onStatusUpdate,
}) => {
  const [modalTab, setModalTab] = useState("details");
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showDispatch, setShowDispatch] = useState(false);
  const [officials, setOfficials] = useState(["", "", ""]);
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [dispatchedTeam, setDispatchedTeam] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(
    incident?.status || "pending",
  );
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateText, setUpdateText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Reset all state when a different incident is opened
  useEffect(() => {
    if (!incident) return;
    setCurrentStatus(incident.status || "pending");
    setModalTab("details");
    setPhotoIndex(0);
    setShowDispatch(false);
    setShowNotes(false);
    setShowUpdate(false);
    setOfficials(["", "", ""]);
    setNoteText("");
    setUpdateText("");
    setDispatchedTeam(null);
  }, [incident?.id]);

  if (!incident) return null;

  const isDispatched =
    currentStatus === "dispatched" ||
    currentStatus === "active" ||
    currentStatus === "resolved" ||
    dispatchedTeam;
  const statusCfg = STATUS_CONFIG[currentStatus];

  // Call the correct update API based on report type
  const updateReport = async (updates) => {
    if (reportType === "complaints") {
      return updateComplaint(incident.id, updates);
    }
    return incidentService.updateIncident(incident.id, updates);
  };

  // Handle status change via API
  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try {
      await updateReport({ status: newStatus });
      setCurrentStatus(newStatus);
      if (onStatusUpdate) onStatusUpdate(incident.id, newStatus);
    } catch (err) {
      console.error("Failed to update status:", err);
      alert(err.message || "Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle dispatch save
  const handleSaveDispatch = async () => {
    const filled = officials.filter((o) => o.trim() !== "");
    if (filled.length === 0) return;

    setIsUpdating(true);
    try {
      await updateReport({
        status: "dispatched",
        additional_notes: `Dispatch Team: ${filled.join(", ")}`,
      });
      setDispatchedTeam({
        officials: filled,
        timestamp: new Date().toISOString(),
      });
      setCurrentStatus("dispatched");
      setShowDispatch(false);
      if (onStatusUpdate) onStatusUpdate(incident.id, "dispatched");
    } catch (err) {
      console.error("Failed to dispatch:", err);
      alert(err.message || "Failed to save dispatch.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle save notes
  const handleSaveNotes = async () => {
    if (!noteText.trim()) return;
    setIsUpdating(true);
    try {
      await updateReport({ additional_notes: noteText.trim() });
      setShowNotes(false);
      setNoteText("");
    } catch (err) {
      console.error("Failed to save notes:", err);
      alert(err.message || "Failed to save notes.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle save update
  const handleSaveUpdate = async () => {
    if (!updateText.trim()) return;
    setIsUpdating(true);
    try {
      await updateReport({ additional_notes: updateText.trim() });
      setShowUpdate(false);
      setUpdateText("");
    } catch (err) {
      console.error("Failed to save update:", err);
      alert(err.message || "Failed to save update.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gray-800 text-white px-5 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
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
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            </button>
            <h2 className="text-sm font-bold font-spartan tracking-wide">
              {reportType === "complaints" ? "COMPLAINT" : "INCIDENT"} ID #{" "}
              {incident.id}
            </h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Photo Section */}
          {incident.photos && incident.photos.length > 0 ? (
            <div className="relative bg-gray-900">
              <img
                src={incident.photos[photoIndex]}
                alt={`Evidence ${photoIndex + 1}`}
                className="w-full h-56 object-cover"
              />
              {/* View Edit History badge */}
              <button className="absolute top-3 right-3 bg-gray-800/80 text-white text-xs font-bold px-3 py-1.5 rounded font-kumbh uppercase hover:bg-gray-800 transition-colors">
                View Edit History
              </button>
              {/* Photo navigation */}
              {incident.photos.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setPhotoIndex((prev) =>
                        prev > 0 ? prev - 1 : incident.photos.length - 1,
                      )
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/70"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() =>
                      setPhotoIndex((prev) =>
                        prev < incident.photos.length - 1 ? prev + 1 : 0,
                      )
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/70"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                  {/* Dots indicator */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {incident.photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPhotoIndex(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          i === photoIndex ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="bg-gray-100 h-40 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <svg
                  className="w-10 h-10 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-xs font-kumbh">No photos attached</p>
              </div>
            </div>
          )}

          {/* Type + Status Badge */}
          <div className="px-5 pt-4 pb-2 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 font-spartan uppercase">
              {incident.type}
            </h3>
            <span
              className="px-3 py-1 rounded-full text-xs font-bold text-white font-kumbh uppercase"
              style={{ backgroundColor: statusCfg?.color }}
            >
              {statusCfg?.label}
            </span>
          </div>

          {/* Last Updated */}
          <div className="px-5 pb-3 flex items-center gap-2 text-xs text-gray-500 font-kumbh">
            <svg
              className="w-4 h-4"
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
            <span>
              LAST UPDATED:{" "}
              {new Date(incident.lastUpdated).toLocaleDateString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
              })}{" "}
              {new Date(incident.lastUpdated).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>

          {/* Details / Updates Tabs */}
          <div className="px-5 flex gap-2 mb-4">
            <button
              onClick={() => {
                setModalTab("details");
                setShowDispatch(false);
                setShowNotes(false);
                setShowUpdate(false);
              }}
              className={`px-5 py-2 rounded-lg text-xs font-bold font-kumbh uppercase transition-all duration-200 ${
                modalTab === "details" &&
                !showDispatch &&
                !showNotes &&
                !showUpdate
                  ? "bg-gray-700 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              Details
            </button>
            <button
              onClick={() => {
                setModalTab("updates");
                setShowDispatch(false);
                setShowNotes(false);
                setShowUpdate(false);
              }}
              className={`px-5 py-2 rounded-lg text-xs font-bold font-kumbh uppercase transition-all duration-200 ${
                modalTab === "updates" &&
                !showDispatch &&
                !showNotes &&
                !showUpdate
                  ? "bg-gray-700 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              Updates
            </button>
          </div>

          {/* Tab / Dispatch / Notes / Update Content */}
          <div className="transition-all duration-300 ease-in-out">
            {showUpdate ? (
              /* ── Add Update Form ── */
              <div className="px-5 pb-5 animate-fadeIn">
                <h3 className="text-sm font-bold text-gray-800 font-kumbh uppercase text-center mb-3">
                  Add Update
                </h3>
                <hr className="border-gray-300 mb-4" />
                <textarea
                  value={updateText}
                  onChange={(e) => setUpdateText(e.target.value)}
                  placeholder="Enter update details here ..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm font-kumbh text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200"
                />
                <button className="w-full mt-3 py-2.5 rounded-lg border-2 border-gray-300 text-sm font-semibold text-gray-500 font-kumbh hover:bg-gray-100 active:scale-[0.98] transition-all duration-200">
                  + Add Attachment
                </button>
                <button
                  onClick={handleSaveUpdate}
                  disabled={isUpdating}
                  className="w-full mt-3 py-2.5 rounded-lg bg-green-600 text-white text-sm font-bold font-kumbh uppercase hover:bg-green-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-wait"
                >
                  {isUpdating ? "Saving..." : "Save Update"}
                </button>
              </div>
            ) : showNotes ? (
              /* ── Add Notes Form ── */
              <div className="px-5 pb-5 animate-fadeIn">
                <h3 className="text-sm font-bold text-gray-800 font-kumbh uppercase text-center mb-3">
                  Add Notes
                </h3>
                <hr className="border-gray-300 mb-4" />
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Enter your notes here ..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm font-kumbh text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
                />
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => {
                      setShowNotes(false);
                      setNoteText("");
                    }}
                    className="flex-1 py-2.5 rounded-lg border-2 border-gray-300 text-sm font-semibold text-gray-500 font-kumbh uppercase hover:bg-gray-100 active:scale-[0.98] transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    disabled={isUpdating}
                    className="flex-1 py-2.5 rounded-lg border-2 border-gray-300 text-sm font-semibold text-gray-500 font-kumbh uppercase hover:bg-gray-100 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-wait"
                  >
                    {isUpdating ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            ) : showDispatch ? (
              /* ── Dispatch Team Form ── */
              <div className="px-5 pb-5 animate-fadeIn">
                <h3 className="text-sm font-bold text-gray-800 font-kumbh uppercase text-center mb-3">
                  Dispatch Team
                </h3>
                <hr className="border-gray-300 mb-4" />
                <div className="space-y-3">
                  {officials.map((official, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={official}
                      onChange={(e) => {
                        const updated = [...officials];
                        updated[idx] = e.target.value;
                        setOfficials(updated);
                      }}
                      placeholder="+ Add Official"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-kumbh text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200"
                    />
                  ))}
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => {
                      setShowDispatch(false);
                      if (!dispatchedTeam) setOfficials(["", "", ""]);
                      else setOfficials([...dispatchedTeam.officials]);
                    }}
                    className="flex-1 py-2.5 rounded-lg border-2 border-gray-300 text-sm font-semibold text-gray-500 font-kumbh uppercase hover:bg-gray-100 active:scale-[0.98] transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveDispatch}
                    disabled={isUpdating}
                    className="flex-1 py-2.5 rounded-lg bg-amber-500 text-white text-sm font-bold font-kumbh uppercase hover:bg-amber-600 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-wait"
                  >
                    {isUpdating ? "Saving..." : "Save Dispatch"}
                  </button>
                </div>
              </div>
            ) : modalTab === "details" ? (
              /* ── Details Tab ── */
              <div className="px-5 pb-5 space-y-4 animate-fadeIn">
                {/* Address */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0"
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
                    <p className="text-xs text-gray-700 font-kumbh uppercase leading-relaxed">
                      {incident.address}
                    </p>
                  </div>
                  {incident.plusCode && (
                    <div className="flex items-start gap-2">
                      <svg
                        className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0"
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
                      </svg>
                      <p className="text-xs text-gray-500 font-kumbh uppercase">
                        {incident.plusCode}
                      </p>
                    </div>
                  )}
                </div>

                {/* Reported By */}
                <div>
                  <p className="text-xs font-bold text-gray-900 font-kumbh uppercase mb-1.5">
                    {reportType === "complaints" ? "Complaint" : "Incident"}{" "}
                    Reported By:
                  </p>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <p className="text-xs text-gray-700 font-kumbh">
                      {incident.reportedBy}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-xs font-bold text-gray-900 font-kumbh uppercase mb-1.5">
                    {reportType === "complaints" ? "Complaint" : "Incident"}{" "}
                    Description:
                  </p>
                  <p className="text-xs text-gray-600 font-kumbh leading-relaxed">
                    {incident.description}
                  </p>
                </div>

                {/* Dispatched Team – shown after save */}
                {dispatchedTeam && (
                  <div
                    onClick={() => {
                      const padded = [...dispatchedTeam.officials];
                      while (padded.length < 3) padded.push("");
                      setOfficials(padded);
                      setShowDispatch(true);
                      setShowNotes(false);
                    }}
                    className="border-t border-gray-200 pt-4 cursor-pointer hover:bg-gray-50 -mx-5 px-5 pb-1 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-gray-900 font-kumbh uppercase">
                        Dispatch Team
                      </p>
                      <span className="text-xs text-gray-500 font-kumbh">
                        {new Date(dispatchedTeam.timestamp).toLocaleDateString(
                          "en-US",
                          {
                            month: "2-digit",
                            day: "2-digit",
                            year: "numeric",
                          },
                        )}{" "}
                        {new Date(dispatchedTeam.timestamp).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          },
                        )}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {dispatchedTeam.officials.map((name, idx) => (
                        <p
                          key={idx}
                          className="text-xs text-gray-700 font-kumbh uppercase"
                        >
                          {name}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── Updates Tab ── */
              <div className="px-5 pb-5 animate-fadeIn">
                {incident.updates && incident.updates.length > 0 ? (
                  <div className="space-y-0 divide-y divide-gray-200">
                    {incident.updates.map((update, idx) => {
                      const dt = new Date(update.timestamp);
                      const dateStr = dt.toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric",
                      });
                      const timeStr = dt.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      });
                      const dayStr = dt
                        .toLocaleDateString("en-US", {
                          weekday: "long",
                        })
                        .toUpperCase();

                      return (
                        <div key={idx} className="py-3">
                          {/* Date row */}
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-kumbh">
                              <svg
                                className="w-4 h-4 flex-shrink-0"
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
                              <span className="uppercase">
                                {dateStr} &nbsp; {timeStr} &nbsp; {dayStr}
                              </span>
                            </div>
                            {update.type === "note" && (
                              <span className="text-xs font-bold text-gray-700 font-kumbh uppercase">
                                Notes
                              </span>
                            )}
                          </div>
                          {/* Description */}
                          <p className="text-xs text-gray-700 font-kumbh uppercase leading-relaxed">
                            {update.text}
                          </p>
                          {/* Author */}
                          {update.author && (
                            <div className="flex items-center gap-1.5 mt-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-700 flex-shrink-0" />
                              <p className="text-xs text-gray-600 font-kumbh uppercase">
                                {update.author}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <svg
                      className="w-10 h-10 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-xs font-kumbh">No updates yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer / Actions */}
        <div className="flex-shrink-0 border-t border-gray-200 px-5 py-4 space-y-3 bg-gray-50">
          {/* Add Notes – hidden when notes form is open */}
          {!showNotes && (
            <button
              onClick={() => {
                setShowNotes(true);
                setShowDispatch(false);
                setShowUpdate(false);
              }}
              disabled={isUpdating}
              className="w-full py-2.5 rounded-lg border-2 border-gray-300 text-sm font-semibold text-gray-500 font-kumbh hover:bg-gray-100 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
            >
              + Add Notes
            </button>
          )}

          {isDispatched ? (
            <>
              {/* + Add Update */}
              <button
                onClick={() => {
                  setShowUpdate(true);
                  setShowNotes(false);
                  setShowDispatch(false);
                }}
                disabled={isUpdating}
                className="w-full py-2.5 rounded-lg bg-green-600 text-white text-sm font-bold font-kumbh uppercase hover:bg-green-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
              >
                + Add Update
              </button>

              {/* Bottom row – post-dispatch */}
              <button
                onClick={() => handleStatusChange("active")}
                disabled={isUpdating || currentStatus === "active"}
                className="w-full py-2.5 rounded-lg bg-gray-500 text-white text-sm font-bold font-kumbh uppercase hover:bg-gray-600 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? "Updating..." : "Mark as In-Progress"}
              </button>
              <button
                onClick={() => handleStatusChange("resolved")}
                disabled={isUpdating || currentStatus === "resolved"}
                className="w-full py-2.5 rounded-lg bg-red-500 text-white text-sm font-bold font-kumbh uppercase hover:bg-red-600 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? "Updating..." : "Mark as Resolved"}
              </button>
            </>
          ) : (
            <>
              {/* Dispatch Team – hidden when dispatch form is open */}
              {!showDispatch && (
                <button
                  onClick={() => {
                    setShowDispatch(true);
                    setShowNotes(false);
                    setShowUpdate(false);
                  }}
                  disabled={isUpdating}
                  className="w-full py-2.5 rounded-lg bg-green-600 text-white text-sm font-bold font-kumbh uppercase hover:bg-green-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
                >
                  Dispatch Team
                </button>
              )}

              {/* Bottom row – pre-dispatch */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleStatusChange("rejected")}
                  disabled={isUpdating}
                  className="flex-1 py-2.5 rounded-lg bg-gray-500 text-white text-sm font-bold font-kumbh uppercase hover:bg-gray-600 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-wait"
                >
                  {isUpdating ? "Updating..." : "Mark as Invalid"}
                </button>
                <button
                  onClick={() => handleStatusChange("resolved")}
                  disabled={isUpdating}
                  className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-bold font-kumbh uppercase hover:bg-red-600 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-wait"
                >
                  {isUpdating ? "Updating..." : "Mark as Resolved"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReportDetailsModal;
