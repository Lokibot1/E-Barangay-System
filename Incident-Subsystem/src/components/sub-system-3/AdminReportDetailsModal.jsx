import React, { useState, useEffect, useRef } from "react";
import { incidentService } from "../../services/sub-system-3/incidentService";
import {
  updateComplaint,
  getComplaintUpdates,
  addComplaintUpdate,
} from "../../services/sub-system-3/complaintService";

// ─── Media helpers ────────────────────────────────────────────────────────────
const isVideoUrl = (url) => {
  if (!url) return false;
  const ext = url.split("?")[0].split(".").pop().toLowerCase();
  return ["mp4", "mov", "webm", "avi", "mkv", "ogg", "m4v"].includes(ext);
};

const VideoPlayer = ({ url }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hideTimer = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const fmt = (s) => {
    if (isNaN(s) || s < 0) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const resetHideTimer = () => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setShowControls(false);
    }, 3000);
  };

  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(console.error);
    } else {
      videoRef.current.pause();
      setShowControls(true);
    }
    resetHideTimer();
  };

  const handleSeek = (e) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    videoRef.current.currentTime = pos * duration;
    setCurrentTime(pos * duration);
    resetHideTimer();
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) videoRef.current.volume = vol;
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      const v = volume > 0 ? volume : 0.5;
      videoRef.current.volume = v;
      setVolume(v);
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-xl overflow-hidden w-full select-none"
      onMouseMove={resetHideTimer}
      onMouseEnter={resetHideTimer}
    >
      <video
        ref={videoRef}
        src={url}
        className="w-full max-h-[65vh] object-contain"
        preload="metadata"
        playsInline
        onPlay={() => { setIsPlaying(true); setIsLoading(false); }}
        onPause={() => { setIsPlaying(false); setIsLoading(false); }}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onCanPlayThrough={() => setIsLoading(false)}
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onEnded={() => { setIsPlaying(false); setShowControls(true); }}
        onClick={togglePlay}
      />

      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
          <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Center play overlay when paused */}
      {!isPlaying && !isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={togglePlay}
        >
          <div className="bg-black/50 rounded-full p-4 hover:bg-black/70 transition-colors">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Controls bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pb-4 pt-10 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        {/* Progress bar */}
        <div
          className="w-full h-1.5 bg-white/30 rounded-full cursor-pointer mb-3 relative group/progress"
          onClick={handleSeek}
        >
          <div
            className="absolute top-0 left-0 h-full bg-white rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full -translate-x-1/2 shadow opacity-0 group-hover/progress:opacity-100 transition-opacity"
            style={{ left: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-3 text-white">
          {/* Play/Pause */}
          <button onClick={togglePlay} className="hover:text-white/70 transition-colors flex-shrink-0">
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Time */}
          <span className="text-xs font-mono text-white/80 flex-shrink-0 tabular-nums">
            {fmt(currentTime)} / {fmt(duration)}
          </span>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Volume */}
          <button onClick={toggleMute} className="hover:text-white/70 transition-colors flex-shrink-0">
            {isMuted || volume === 0 ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            ) : volume < 0.5 ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 h-1 accent-white cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Fullscreen */}
          <button onClick={toggleFullscreen} className="hover:text-white/70 transition-colors flex-shrink-0">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

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
  const [localUpdates, setLocalUpdates] = useState([]);
  const [loadingUpdates, setLoadingUpdates] = useState(false);
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
  const [mediaViewerUrl, setMediaViewerUrl] = useState("");
  const [mediaViewerType, setMediaViewerType] = useState("image");

  // Reset all state and load updates when a different incident is opened
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
    setLocalUpdates([]);

    const loadUpdates = async () => {
      setLoadingUpdates(true);
      try {
        const data =
          reportType === "complaints"
            ? await getComplaintUpdates(incident.id)
            : await incidentService.getIncidentUpdates(incident.id);
        const arr = Array.isArray(data) ? data : data?.data || [];
        setLocalUpdates(
          arr.map((u) => ({
            timestamp: u.created_at || u.timestamp || new Date().toISOString(),
            text: u.text || u.description || u.notes || "",
            type: u.type || "update",
            author: u.author || u.admin_name || "",
          })),
        );
      } catch {
        // Endpoint may not exist yet; fail silently
        setLocalUpdates([]);
      } finally {
        setLoadingUpdates(false);
      }
    };

    loadUpdates();
  }, [incident?.id, reportType]);

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

  // Optimistically add an update entry to local state, then persist to backend
  const pushUpdate = async (entry) => {
    const newUpdate = { ...entry, timestamp: new Date().toISOString() };
    setLocalUpdates((prev) => [newUpdate, ...prev]);
    try {
      if (reportType === "complaints") {
        await addComplaintUpdate(incident.id, entry);
      } else {
        await incidentService.addIncidentUpdate(incident.id, entry);
      }
    } catch (err) {
      console.error("Failed to persist update entry:", err);
    }
  };

  const openMediaViewer = (url) => {
    setMediaViewerUrl(url);
    setMediaViewerType(isVideoUrl(url) ? "video" : "image");
    setMediaViewerOpen(true);
  };

  // Handle status change via API
  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try {
      await updateReport({ status: newStatus });
      setCurrentStatus(newStatus);
      if (onStatusUpdate) onStatusUpdate(incident.id, newStatus);
      await pushUpdate({
        text: `Status updated to: ${STATUS_CONFIG[newStatus]?.label || newStatus.toUpperCase()}`,
        type: "status",
        author: "Admin",
      });
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
      await pushUpdate({
        text: `Dispatch Team assigned: ${filled.join(", ")}`,
        type: "dispatch",
        author: "Admin",
      });
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
      await pushUpdate({
        text: noteText.trim(),
        type: "note",
        author: "Admin",
      });
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
      await pushUpdate({
        text: updateText.trim(),
        type: "update",
        author: "Admin",
      });
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
    <>
      {/* ── Media Viewer Overlay ── */}
      {mediaViewerOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setMediaViewerOpen(false)}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
            onClick={() => setMediaViewerOpen(false)}
            aria-label="Close viewer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            className="relative w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {mediaViewerType === "video" ? (
              <VideoPlayer url={mediaViewerUrl} />
            ) : (
              <div className="flex items-center justify-center">
                <img
                  src={mediaViewerUrl}
                  alt="Evidence full view"
                  className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Main Modal ── */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
      <div
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gray-800 dark:bg-gray-950 text-white px-5 py-3 flex items-center justify-between flex-shrink-0">
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
          {/* Photo / Video Section */}
          {incident.photos && incident.photos.length > 0 ? (
            <div className="relative bg-gray-900">
              {isVideoUrl(incident.photos[photoIndex]) ? (
                /* Video thumbnail with play overlay */
                <div
                  className="relative w-full h-56 bg-gray-900 flex items-center justify-center cursor-pointer group"
                  onClick={() => openMediaViewer(incident.photos[photoIndex])}
                >
                  <video
                    src={incident.photos[photoIndex]}
                    className="w-full h-56 object-cover opacity-60"
                    muted
                    preload="metadata"
                    onLoadedMetadata={(e) => { e.currentTarget.currentTime = 0.1; }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/50 rounded-full p-4 group-hover:bg-black/70 transition-colors">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  <span className="absolute bottom-3 left-3 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded font-kumbh uppercase tracking-wide">
                    VIDEO — Click to play
                  </span>
                </div>
              ) : (
                /* Clickable image */
                <img
                  src={incident.photos[photoIndex]}
                  alt={`Evidence ${photoIndex + 1}`}
                  className="w-full h-56 object-cover cursor-zoom-in hover:opacity-90 transition-opacity"
                  onClick={() => openMediaViewer(incident.photos[photoIndex])}
                />
              )}
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
            <div className="bg-gray-100 dark:bg-gray-800 h-40 flex items-center justify-center">
              <div className="text-center text-gray-400 dark:text-gray-500">
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
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 font-spartan uppercase">
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
          <div className="px-5 pb-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-kumbh">
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
                  ? "bg-gray-700 dark:bg-gray-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
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
                  ? "bg-gray-700 dark:bg-gray-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
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
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 font-kumbh uppercase text-center mb-3">
                  Add Update
                </h3>
                <hr className="border-gray-300 dark:border-gray-700 mb-4" />
                <textarea
                  value={updateText}
                  onChange={(e) => setUpdateText(e.target.value)}
                  placeholder="Enter update details here ..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-kumbh text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200"
                />
                <button className="w-full mt-3 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-500 dark:text-gray-400 font-kumbh hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-[0.98] transition-all duration-200">
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
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 font-kumbh uppercase text-center mb-3">
                  Add Notes
                </h3>
                <hr className="border-gray-300 dark:border-gray-700 mb-4" />
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Enter your notes here ..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-kumbh text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
                />
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => {
                      setShowNotes(false);
                      setNoteText("");
                    }}
                    className="flex-1 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-500 dark:text-gray-400 font-kumbh uppercase hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-[0.98] transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    disabled={isUpdating}
                    className="flex-1 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-500 dark:text-gray-400 font-kumbh uppercase hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-wait"
                  >
                    {isUpdating ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            ) : showDispatch ? (
              /* ── Dispatch Team Form ── */
              <div className="px-5 pb-5 animate-fadeIn">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 font-kumbh uppercase text-center mb-3">
                  Dispatch Team
                </h3>
                <hr className="border-gray-300 dark:border-gray-700 mb-4" />
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
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-kumbh text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200"
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
                    className="flex-1 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-500 dark:text-gray-400 font-kumbh uppercase hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-[0.98] transition-all duration-200"
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
                      className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0"
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
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-kumbh uppercase leading-relaxed">
                      {incident.address}
                    </p>
                  </div>
                  {incident.plusCode && (
                    <div className="flex items-start gap-2">
                      <svg
                        className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0"
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
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-kumbh uppercase">
                        {incident.plusCode}
                      </p>
                    </div>
                  )}
                </div>

                {/* Reported By */}
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100 font-kumbh uppercase mb-1.5">
                    {reportType === "complaints" ? "Complaint" : "Incident"}{" "}
                    Reported By:
                  </p>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-gray-400 dark:text-gray-500"
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
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-kumbh">
                      {incident.reportedBy}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100 font-kumbh uppercase mb-1.5">
                    {reportType === "complaints" ? "Complaint" : "Incident"}{" "}
                    Description:
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-kumbh leading-relaxed">
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
                    className="border-t border-gray-200 dark:border-gray-700 pt-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60 -mx-5 px-5 pb-1 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-gray-900 dark:text-gray-100 font-kumbh uppercase">
                        Dispatch Team
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-kumbh">
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
                          className="text-xs text-gray-700 dark:text-gray-300 font-kumbh uppercase"
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
                {loadingUpdates ? (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                    <svg
                      className="w-6 h-6 mx-auto mb-2 animate-spin"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <p className="text-xs font-kumbh">Loading updates...</p>
                  </div>
                ) : localUpdates.length > 0 ? (
                  <div className="space-y-0 divide-y divide-gray-200 dark:divide-gray-700">
                    {localUpdates.map((update, idx) => {
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
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-kumbh">
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
                              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 font-kumbh uppercase px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                                Note
                              </span>
                            )}
                            {update.type === "dispatch" && (
                              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 font-kumbh uppercase px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 rounded">
                                Dispatch
                              </span>
                            )}
                            {update.type === "status" && (
                              <span className="text-xs font-bold text-blue-700 dark:text-blue-400 font-kumbh uppercase px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 rounded">
                                Status
                              </span>
                            )}
                          </div>
                          {/* Description */}
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-kumbh uppercase leading-relaxed">
                            {update.text}
                          </p>
                          {/* Author */}
                          {update.author && (
                            <div className="flex items-center gap-1.5 mt-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-700 dark:bg-gray-400 flex-shrink-0" />
                              <p className="text-xs text-gray-600 dark:text-gray-400 font-kumbh uppercase">
                                {update.author}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-500">
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
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 px-5 py-4 space-y-3 bg-gray-50 dark:bg-gray-800">
          {/* Add Notes – hidden when notes form is open */}
          {!showNotes && (
            <button
              onClick={() => {
                setShowNotes(true);
                setShowDispatch(false);
                setShowUpdate(false);
              }}
              disabled={isUpdating}
              className="w-full py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-500 dark:text-gray-400 font-kumbh hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
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
    </>
  );
};

export default AdminReportDetailsModal;
