import React, { useState, useRef, useMemo, useEffect } from "react";
import themeTokens from "../../Themetokens";

const isImage = (file) => file.type.startsWith("image/");
const isVideo = (file) => file.type.startsWith("video/");

// Generate stable object-URLs for preview; revoke when no longer needed
function usePreviewUrls(files) {
  const urls = useMemo(
    () =>
      files.map((file) =>
        isImage(file) || isVideo(file) ? URL.createObjectURL(file) : null,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [files],
  );

  useEffect(() => {
    return () => urls.forEach((u) => u && URL.revokeObjectURL(u));
  }, [urls]);

  return urls;
}

// ── Single thumbnail card ──────────────────────────────────────────────────────
const Thumbnail = ({ file, url, onRemove, isDark }) => {
  const ext = file.name.split(".").pop().toLowerCase();

  return (
    <div className="relative group rounded-xl overflow-hidden bg-black/10 dark:bg-white/5" style={{ aspectRatio: "4/3" }}>
      {isImage(file) && url ? (
        <img
          src={url}
          alt={file.name}
          className="w-full h-full object-cover"
          draggable={false}
        />
      ) : isVideo(file) && url ? (
        <video
          src={url}
          className="w-full h-full object-cover"
          muted
          playsInline
          preload="metadata"
          onLoadedMetadata={(e) => {
            e.currentTarget.currentTime = 0.5;
          }}
        />
      ) : (
        // Non-media fallback (PDF, doc, etc.)
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 px-2">
          <svg className={`w-8 h-8 ${isDark ? "text-slate-400" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <p className={`text-[10px] font-kumbh text-center break-all leading-tight ${isDark ? "text-slate-400" : "text-gray-500"}`}>
            {file.name}
          </p>
        </div>
      )}

      {/* Video badge */}
      {isVideo(file) && (
        <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-black/60 rounded px-1.5 py-0.5">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span className="text-[9px] text-white font-bold font-kumbh uppercase tracking-wide">Video</span>
        </div>
      )}

      {/* File size badge */}
      <div className="absolute bottom-1.5 right-1.5 bg-black/60 rounded px-1.5 py-0.5">
        <span className="text-[9px] text-white font-kumbh">{formatSize(file.size)}</span>
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
        aria-label="Remove file"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Hover overlay with filename */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 px-2 pb-2 pt-6 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <p className="text-[10px] text-white font-kumbh truncate leading-tight">{file.name}</p>
      </div>
    </div>
  );
};

function formatSize(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + " " + sizes[i];
}

// ── Main component ─────────────────────────────────────────────────────────────
const FileUpload = ({ label, description, files = [], onChange, currentTheme }) => {
  const t = themeTokens[currentTheme] || themeTokens.modern;
  const isDark = currentTheme === "dark";
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const previewUrls = usePreviewUrls(files);

  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver  = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };
  const handleFileSelect = (e) => handleFiles(Array.from(e.target.files));
  const handleFiles = (newFiles) => onChange([...files, ...newFiles]);
  const removeFile = (index) => onChange(files.filter((_, i) => i !== index));

  const hasFiles = files.length > 0;

  return (
    <div className="form-group">
      <label className={`block text-sm font-semibold ${t.labelText} mb-2 font-kumbh`}>
        {label}
      </label>
      {description && (
        <p className={`text-sm ${t.subtleText} mb-3`}>{description}</p>
      )}

      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl transition-all duration-200 ${
          isDragging
            ? `${t.dragBorder} ${t.dragBg} scale-[1.01]`
            : `${t.inputBorder} ${t.dragHoverBorder}`
        } ${hasFiles ? "p-3" : "p-8"}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx"
        />

        {hasFiles ? (
          /* ── Thumbnail grid ── */
          <div className="grid grid-cols-3 gap-2">
            {files.map((file, index) => (
              <Thumbnail
                key={index}
                file={file}
                url={previewUrls[index]}
                onRemove={() => removeFile(index)}
                isDark={isDark}
              />
            ))}

            {/* Add-more tile */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{ aspectRatio: "4/3" }}
              className={`rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                isDark
                  ? "border-slate-600 hover:border-slate-400 text-slate-500 hover:text-slate-300"
                  : "border-gray-300 hover:border-gray-400 text-gray-400 hover:text-gray-500"
              }`}
              aria-label="Add more files"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-[10px] font-bold font-kumbh uppercase tracking-wide">Add more</span>
            </button>
          </div>
        ) : (
          /* ── Empty state (original upload prompt) ── */
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer text-center"
          >
            <div className={`transition-transform duration-200 ${isDragging ? "scale-110" : ""}`}>
              <svg className={`w-12 h-12 ${t.subtleText} mx-auto mb-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className={`${t.sectionSubtitle} font-medium mb-1`}>
              {isDragging ? "Drop files here!" : "Drop files here or click to browse"}
            </p>
            <p className={`text-sm ${t.subtleText}`}>Images, Videos, PDF, Word documents</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
