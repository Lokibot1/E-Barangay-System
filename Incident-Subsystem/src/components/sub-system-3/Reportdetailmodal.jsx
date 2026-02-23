import React, { useState, useRef } from "react";
import themeTokens from "../../Themetokens";
import defaultImage from "../../assets/images/defaultImage.png";

// ─── Media helpers ────────────────────────────────────────────────────────────
const isVideoUrl = (url) => {
  if (!url) return false;
  const ext = url.split("?")[0].split(".").pop().toLowerCase();
  return ["mp4", "mov", "webm", "avi", "mkv", "ogg", "m4v"].includes(ext);
};

// ─── VideoPlayer ──────────────────────────────────────────────────────────────
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

  React.useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);

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

// ─── ReportDetailModal ────────────────────────────────────────────────────────
const ReportDetailModal = ({ isOpen, onClose, report, currentTheme }) => {
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
  const [mediaViewerType, setMediaViewerType] = useState("image");

  if (!isOpen || !report) return null;

  const t = themeTokens[currentTheme];
  const isDark = currentTheme === "dark";

  const openMediaViewer = () => {
    if (!report.image) return;
    setMediaViewerType(isVideoUrl(report.image) ? "video" : "image");
    setMediaViewerOpen(true);
  };

  const statusConfig = {
    ongoing: {
      badge: "bg-blue-500",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    resolved: {
      badge: "bg-green-500",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    rejected: {
      badge: "bg-red-500",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  };

  const config = statusConfig[report.status.toLowerCase()];

  return (
    <>
      {/* ── Media Viewer Overlay ── */}
      {mediaViewerOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setMediaViewerOpen(false)}
        >
          <button
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
            onClick={() => setMediaViewerOpen(false)}
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
              <VideoPlayer url={report.image} />
            ) : (
              <div className="flex items-center justify-center">
                <img
                  src={report.image}
                  alt="Evidence full view"
                  className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Main Modal ── */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
        <div className="absolute inset-0" onClick={onClose} />

        <div className={`relative ${t.modalBg} rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scaleIn`}>
          {/* Header */}
          <div className={`sticky top-0 bg-gradient-to-r ${t.modalHeaderGrad} px-6 py-5 flex items-center justify-between border-b ${t.modalHeaderBorderBottom} rounded-t-2xl z-10`}>
            <div className="flex items-center gap-3">
              <div className={`${config.badge} text-white p-2 rounded-lg`}>
                {config.icon}
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${t.modalTitle} font-spartan`}>
                  Report Details
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 ${t.modalCloseBtnColor} ${t.modalCloseBtnHover} ${t.modalCloseBtnHoverBg} rounded-lg transition-all`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <span className={`${config.badge} text-white px-4 py-2 rounded-full font-semibold font-kumbh capitalize`}>
                {report.status}
              </span>
              <span className={`text-sm ${t.subtleText} font-kumbh`}>
                {report.date}
              </span>
            </div>

            {/* Evidence — image or video */}
            {isVideoUrl(report.image) ? (
              <div
                className="relative w-full rounded-xl overflow-hidden bg-gray-900 flex items-center justify-center cursor-pointer group"
                onClick={openMediaViewer}
              >
                <video
                  src={report.image}
                  className="w-full max-h-80 object-cover opacity-60"
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
              <div
                className="rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center cursor-zoom-in"
                onClick={openMediaViewer}
              >
                <img
                  src={report.image || defaultImage}
                  alt={report.title}
                  className="w-full max-h-80 object-contain hover:opacity-90 transition-opacity"
                />
              </div>
            )}

            {/* Title & Category */}
            <div>
              <h3 className={`text-3xl font-bold ${t.cardText} mb-2 font-spartan`}>
                {report.title}
              </h3>
              <p className={`text-lg ${t.subtleText} font-kumbh`}>
                {report.category}
              </p>
            </div>

            {/* Info Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`${isDark ? "bg-slate-700/50" : "bg-slate-50"} rounded-lg p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <svg className={`w-5 h-5 ${t.primaryText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className={`text-sm font-semibold ${t.subtleText} font-kumbh`}>Location</span>
                </div>
                <p className={`${t.cardText} font-kumbh`}>{report.location}</p>
              </div>

              <div className={`${isDark ? "bg-slate-700/50" : "bg-slate-50"} rounded-lg p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <svg className={`w-5 h-5 ${t.primaryText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className={`text-sm font-semibold ${t.subtleText} font-kumbh`}>Date Submitted</span>
                </div>
                <p className={`${t.cardText} font-kumbh`}>{report.date}</p>
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
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
          .animate-scaleIn { animation: scaleIn 0.2s ease-out; }
        `}</style>
      </div>
    </>
  );
};

export default ReportDetailModal;
