import React, { useState, useRef, useMemo, useEffect } from "react";
import themeTokens from "../../Themetokens";
import MapComponent from "../shared/MapComponent";

const TwoStepIncidentForm = ({
  currentStep,
  formData,
  onInputChange,
  errors,
  currentTheme,
  incidentTypeOptions = [],
  typesLoading = false,
  customFieldDefs = [],
}) => {
  const t = themeTokens[currentTheme] || themeTokens.modern;
  const isDark = currentTheme === "dark";

  const [customTypeInput, setCustomTypeInput] = useState("");

  const handleLocationSelect = (lat, lng, address) => {
    onInputChange("latitude", lat);
    onInputChange("longitude", lng);
    const isCoordinateString =
      address && /^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(address.trim());
    onInputChange("location", address && !isCoordinateString ? address : "");
  };

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    onInputChange("attachments", [...(formData.attachments || []), ...newFiles]);
    // Reset so the same file can be re-selected if removed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index) => {
    onInputChange("attachments", (formData.attachments || []).filter((_, i) => i !== index));
  };

  // Object URLs for image/video previews
  const attachments = formData.attachments || [];
  const previewUrls = useMemo(
    () => attachments.map((f) =>
      f.type?.startsWith("image/") || f.type?.startsWith("video/")
        ? URL.createObjectURL(f)
        : null,
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attachments],
  );
  useEffect(() => {
    return () => previewUrls.forEach((u) => u && URL.revokeObjectURL(u));
  }, [previewUrls]);

  const handleAddCustomType = () => {
    const trimmed = customTypeInput.trim();
    if (trimmed && !formData.customTypes?.includes(trimmed)) {
      onInputChange("customTypes", [...(formData.customTypes || []), trimmed]);
      setCustomTypeInput("");
    }
  };

  const handleRemoveCustomType = (typeToRemove) => {
    onInputChange(
      "customTypes",
      (formData.customTypes || []).filter((ct) => ct !== typeToRemove),
    );
  };

  const handleCustomTypeKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustomType();
    }
  };

  const handleCustomFieldChange = (fieldName, value) => {
    onInputChange("customFieldValues", {
      ...(formData.customFieldValues || {}),
      [fieldName]: value,
    });
  };

  const renderCustomField = (field) => {
    const value = (formData.customFieldValues || {})[field.field_name];
    const baseInput = `w-full px-4 py-2.5 rounded-lg border ${t.cardBorder} ${t.cardBg} ${t.cardText} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-kumbh text-sm`;

    switch (field.field_type) {
      case "textarea":
        return (
          <textarea
            value={value || ""}
            onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value)}
            placeholder={field.field_description || ""}
            rows={3}
            className={`${baseInput} resize-none`}
          />
        );
      case "select":
        return (
          <select
            value={value || ""}
            onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value)}
            className={baseInput}
          >
            <option value="">Select an option</option>
            {(field.field_options || []).map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case "radio":
        return (
          <div className="flex flex-wrap gap-4 mt-1">
            {(field.field_options || []).map((opt) => (
              <label key={opt} className={`flex items-center gap-2 text-sm font-kumbh ${t.cardText} cursor-pointer`}>
                <input
                  type="radio"
                  name={field.field_name}
                  value={opt}
                  checked={value === opt}
                  onChange={() => handleCustomFieldChange(field.field_name, opt)}
                  className="w-4 h-4 accent-blue-600"
                />
                {opt}
              </label>
            ))}
          </div>
        );
      case "checkbox":
        if (field.field_options && field.field_options.length > 0) {
          const checked = Array.isArray(value) ? value : [];
          return (
            <div className="flex flex-wrap gap-3 mt-1">
              {field.field_options.map((opt) => (
                <label key={opt} className={`flex items-center gap-2 text-sm font-kumbh ${t.cardText} cursor-pointer`}>
                  <input
                    type="checkbox"
                    checked={checked.includes(opt)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...checked, opt]
                        : checked.filter((v) => v !== opt);
                      handleCustomFieldChange(field.field_name, next);
                    }}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                  {opt}
                </label>
              ))}
            </div>
          );
        }
        return (
          <label className={`flex items-center gap-2 text-sm font-kumbh ${t.cardText} cursor-pointer mt-1`}>
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleCustomFieldChange(field.field_name, e.target.checked)}
              className="w-4 h-4 accent-blue-600 rounded"
            />
            {field.field_description || field.field_label}
          </label>
        );
      case "number":
        return (
          <input
            type="number"
            value={value || ""}
            onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value)}
            placeholder={field.field_description || ""}
            className={baseInput}
          />
        );
      default:
        return (
          <input
            type={field.field_type || "text"}
            value={value || ""}
            onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value)}
            placeholder={field.field_description || ""}
            className={baseInput}
          />
        );
    }
  };

  // Step 1: Incident Details
  if (currentStep === 1) {
    return (
      <div className="px-6 py-6 space-y-6">
        {/* Types of Incident */}
        <div>
          <label
            className={`block text-sm font-semibold ${t.cardText} mb-3 font-kumbh`}
          >
            Types of Incident <span className="text-red-500">*</span>
            <span className={`text-xs font-normal ${t.subtleText} ml-2`}>
              (Check all that apply)
            </span>
          </label>

          {typesLoading ? (
            <div
              className={`text-sm ${t.subtleText} font-kumbh py-4 text-center`}
            >
              Loading incident types...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {incidentTypeOptions.map((type) => (
                <label
                  key={type.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    formData.incidentTypes?.includes(type.id)
                      ? isDark
                        ? "bg-slate-200 border-slate-400"
                        : "bg-blue-50 border-blue-500"
                      : `${t.cardBorder} ${t.cardBg}`
                  } cursor-pointer ${isDark ? "hover:bg-slate-700" : "hover:shadow-md"} transition-all`}
                >
                  <input
                    type="checkbox"
                    checked={formData.incidentTypes?.includes(type.id) || false}
                    onChange={(e) => {
                      const currentTypes = formData.incidentTypes || [];
                      const newTypes = e.target.checked
                        ? [...currentTypes, type.id]
                        : currentTypes.filter((id) => id !== type.id);
                      onInputChange("incidentTypes", newTypes);
                    }}
                    className={`w-4 h-4 ${t.checkboxAccent} rounded focus:ring-2 ${t.checkboxRing}`}
                  />
                  <span
                    className={`text-sm ${
                      formData.incidentTypes?.includes(type.id) && isDark
                        ? "text-slate-800"
                        : t.cardText
                    } font-kumbh`}
                  >
                    {type.name}
                  </span>
                </label>
              ))}
            </div>
          )}

          {/* Custom type input for "Others" */}
          <div className="mt-4">
            <label
              className={`block text-xs font-medium ${t.subtleText} mb-2 font-kumbh`}
            >
              Other type not listed? Add it here:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customTypeInput}
                onChange={(e) => setCustomTypeInput(e.target.value)}
                onKeyDown={handleCustomTypeKeyDown}
                placeholder="Enter custom incident type..."
                className={`flex-1 px-4 py-2.5 rounded-lg border ${t.cardBorder} ${t.cardBg} ${t.cardText} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-kumbh text-sm`}
              />
              <button
                type="button"
                onClick={handleAddCustomType}
                disabled={!customTypeInput.trim()}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  customTypeInput.trim()
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : `${isDark ? "bg-slate-600 text-slate-400" : "bg-gray-200 text-gray-400"} cursor-not-allowed`
                } font-kumbh`}
              >
                Add
              </button>
            </div>

            {/* Display custom types as chips */}
            {formData.customTypes && formData.customTypes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.customTypes.map((ct, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-kumbh ${
                      isDark
                        ? "bg-slate-200 text-slate-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {ct}
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomType(ct)}
                      className={`${isDark ? "hover:text-red-600" : "hover:text-red-500"} transition-colors`}
                    >
                      <svg
                        className="w-3.5 h-3.5"
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
                  </span>
                ))}
              </div>
            )}
          </div>

          {errors.incidentTypes && (
            <p className="text-red-500 text-sm mt-2 font-kumbh">
              {errors.incidentTypes}
            </p>
          )}
        </div>

        {/* Proof, Evidence, Attachments */}
        <div>
          <label
            className={`block text-sm font-semibold ${t.cardText} mb-3 font-kumbh`}
          >
            Proof, Evidence, Attachments <span className="text-red-500">*</span>
            <span className={`text-xs font-normal ${t.subtleText} ml-2`}>
              (Max 100mb)
            </span>
          </label>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            className={`border-2 border-dashed rounded-lg transition-all ${t.cardBorder} ${isDark ? "hover:border-slate-400" : "hover:border-blue-500"} ${attachments.length > 0 ? "p-3" : "p-6"}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const dropped = Array.from(e.dataTransfer.files).filter(
                (f) => f.type.startsWith("image/") || f.type.startsWith("video/"),
              );
              if (dropped.length) onInputChange("attachments", [...attachments, ...dropped]);
            }}
          >
            {attachments.length > 0 ? (
              /* ── Thumbnail grid ── */
              <div className="grid grid-cols-3 gap-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="relative group rounded-lg overflow-hidden bg-black/10"
                    style={{ aspectRatio: "4/3" }}
                  >
                    {file.type?.startsWith("image/") && previewUrls[index] ? (
                      <img
                        src={previewUrls[index]}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    ) : file.type?.startsWith("video/") && previewUrls[index] ? (
                      <video
                        src={previewUrls[index]}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                        onLoadedMetadata={(e) => { e.currentTarget.currentTime = 0.5; }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1 px-2">
                        <svg className={`w-8 h-8 ${t.subtleText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <p className={`text-[10px] font-kumbh text-center break-all leading-tight ${t.subtleText}`}>{file.name}</p>
                      </div>
                    )}

                    {/* Video badge */}
                    {file.type?.startsWith("video/") && (
                      <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-black/60 rounded px-1.5 py-0.5">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        <span className="text-[9px] text-white font-bold font-kumbh uppercase tracking-wide">Video</span>
                      </div>
                    )}

                    {/* File size */}
                    <div className="absolute bottom-1.5 right-1.5 bg-black/60 rounded px-1.5 py-0.5">
                      <span className="text-[9px] text-white font-kumbh">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    {/* Hover overlay + filename */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-lg pointer-events-none" />
                    <div className="absolute bottom-0 left-0 right-0 px-2 pb-2 pt-6 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <p className="text-[10px] text-white font-kumbh truncate">{file.name}</p>
                    </div>
                  </div>
                ))}

                {/* Add-more tile */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ aspectRatio: "4/3" }}
                  className={`rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-colors ${isDark ? "border-slate-600 hover:border-slate-400 text-slate-500 hover:text-slate-300" : "border-gray-300 hover:border-blue-400 text-gray-400 hover:text-blue-500"}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-[10px] font-bold font-kumbh uppercase tracking-wide">Add more</span>
                </button>
              </div>
            ) : (
              /* ── Empty state ── */
              <div
                className="text-center cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg className={`w-12 h-12 ${t.subtleText} mx-auto mb-3 group-hover:text-blue-500 transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className={`text-sm ${t.cardText} font-semibold mb-1 font-kumbh`}>Click to upload or drag and drop</p>
                <p className={`text-xs ${t.subtleText} font-kumbh`}>Images & Videos up to 100MB</p>
              </div>
            )}
          </div>

          {errors.attachments && (
            <p className="text-red-500 text-sm mt-2 font-kumbh">
              {errors.attachments}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            className={`block text-sm font-semibold ${t.cardText} mb-3 font-kumbh`}
          >
            Brief Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description || ""}
            onChange={(e) => onInputChange("description", e.target.value)}
            placeholder="Provide a detailed description of the incident..."
            rows={4}
            className={`w-full px-4 py-3 rounded-lg border ${t.cardBorder} ${t.cardBg} ${t.cardText} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none font-kumbh`}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-2 font-kumbh">
              {errors.description}
            </p>
          )}
        </div>

        {/* Custom Fields */}
        {customFieldDefs.length > 0 && customFieldDefs.map((field) => (
          <div key={field.id}>
            <label className={`block text-sm font-semibold ${t.cardText} mb-3 font-kumbh`}>
              {field.field_label}
              {field.field_rules === "required" && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderCustomField(field)}
          </div>
        ))}
      </div>
    );
  }

  // Step 2: Location Mapping
  if (currentStep === 2) {
    return (
      <div className="px-6 py-6 space-y-4">
        <div className="mb-4">
          <h3 className={`text-lg font-bold ${t.cardText} mb-2 font-spartan`}>
            Pin the Incident Location
          </h3>
          <p className={`text-sm ${t.subtleText} font-kumbh`}>
            Click on the map to mark where the incident occurred, or use the GPS
            button to use your current location.
          </p>
        </div>

        <MapComponent
          mode="pin"
          onLocationSelect={handleLocationSelect}
          currentTheme={currentTheme}
          enableGPS={true}
          height="450px"
        />

        {errors.location && (
          <p className="text-red-500 text-sm mt-2 font-kumbh">
            {errors.location}
          </p>
        )}

        {/* Additional Details (Optional) */}
        <div className="pt-4 border-t" style={{ borderColor: t.cardBorder }}>
          <button
            type="button"
            onClick={() => {
              const section = document.getElementById("additional-details");
              if (section) {
                section.classList.toggle("hidden");
              }
            }}
            className={`flex items-center gap-2 text-sm font-semibold ${t.cardText} hover:text-blue-600 transition-colors font-kumbh`}
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add Additional Details (Optional)
          </button>

          <div id="additional-details" className="hidden mt-4 space-y-4">
            <div>
              <label
                className={`block text-sm font-semibold ${t.cardText} mb-2 font-kumbh`}
              >
                Additional Notes
              </label>
              <textarea
                value={formData.additionalNotes || ""}
                onChange={(e) =>
                  onInputChange("additionalNotes", e.target.value)
                }
                placeholder="Any additional information..."
                rows={3}
                className={`w-full px-4 py-3 rounded-lg border ${t.cardBorder} ${t.cardBg} ${t.cardText} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none font-kumbh`}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default TwoStepIncidentForm;

