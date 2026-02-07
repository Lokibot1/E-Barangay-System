import React, { useState, useRef } from "react";
import themeTokens from "../../Themetokens";

const FileUpload = ({
  label,
  description,
  files = [],
  onChange,
  currentTheme,
}) => {
  const t = themeTokens[currentTheme] || themeTokens.blue;
  const isDark = currentTheme === "dark";
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };
  const handleFileSelect = (e) => handleFiles(Array.from(e.target.files));
  const handleFiles = (newFiles) => onChange([...files, ...newFiles]);
  const removeFile = (index) => onChange(files.filter((_, i) => i !== index));

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "🖼️";
    if (["pdf"].includes(ext)) return "📄";
    if (["doc", "docx"].includes(ext)) return "📝";
    if (["mp4", "mov", "avi"].includes(ext)) return "🎥";
    return "📎";
  };

  return (
    <div className="form-group">
      <label
        className={`block text-sm font-semibold ${t.labelText} mb-2 font-kumbh`}
      >
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
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? `${t.dragBorder} ${t.dragBg} scale-105`
            : `${t.inputBorder} ${t.dragHoverBorder}`
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx"
        />

        <div
          className={`transition-transform duration-200 ${isDragging ? "scale-110" : ""}`}
        >
          <svg
            className={`w-12 h-12 ${t.subtleText} mx-auto mb-4`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        <p className={`${t.sectionSubtitle} font-medium mb-1`}>
          {isDragging
            ? "Drop files here!"
            : "Drop files here or click to browse"}
        </p>
        <p className={`text-sm ${t.subtleText}`}>
          Images, Videos, PDF, Word documents
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 ${t.inlineBg} rounded-lg border ${t.dividerBorder} ${isDark ? "hover:bg-slate-600" : "hover:bg-slate-100"} transition-colors group`}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <span className="text-2xl flex-shrink-0">
                  {getFileIcon(file.name)}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${t.sectionSubtitle} truncate`}
                  >
                    {file.name}
                  </p>
                  <p className={`text-xs ${t.subtleText}`}>
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className={`ml-3 ${t.removeBtn} transition-colors p-1 opacity-0 group-hover:opacity-100`}
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
