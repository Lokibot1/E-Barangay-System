import React, { useState } from "react";
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
}) => {
  const t = themeTokens[currentTheme] || themeTokens.blue;
  const isDark = currentTheme === "dark";

  const [customTypeInput, setCustomTypeInput] = useState("");

  const handleLocationSelect = (lat, lng, address) => {
    onInputChange("latitude", lat);
    onInputChange("longitude", lng);
    const isCoordinateString =
      address && /^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(address.trim());
    onInputChange("location", address && !isCoordinateString ? address : "");
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    onInputChange("attachments", files);
  };

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
                  } cursor-pointer ${isDark ? "hover:bg-slate-200 hover:text-slate-800" : "hover:shadow-md"} transition-all`}
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

          <div
            className={`relative border-2 border-dashed ${t.cardBorder} rounded-lg p-6 ${t.cardBg} ${isDark ? "hover:border-slate-400 hover:bg-slate-200/10" : "hover:border-blue-500"} transition-all cursor-pointer group`}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="text-center">
              <svg
                className={`w-12 h-12 ${t.subtleText} mx-auto mb-3 group-hover:text-blue-500 transition-colors`}
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
              <p
                className={`text-sm ${t.cardText} font-semibold mb-1 font-kumbh`}
              >
                Click to upload or drag and drop
              </p>
              <p className={`text-xs ${t.subtleText} font-kumbh`}>
                PNG, JPG up to 100MB
              </p>
            </div>
          </div>

          {/* Display selected files */}
          {formData.attachments && formData.attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {formData.attachments.map((file, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${t.cardBorder} ${t.cardBg}`}
                >
                  <svg
                    className="w-5 h-5 text-blue-600 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span
                    className={`text-sm ${t.cardText} flex-1 truncate font-kumbh`}
                  >
                    {file.name}
                  </span>
                  <span className={`text-xs ${t.subtleText} font-kumbh`}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <button
                    onClick={() => {
                      const newFiles = formData.attachments.filter(
                        (_, i) => i !== index,
                      );
                      onInputChange("attachments", newFiles);
                    }}
                    className="text-red-500 hover:text-red-700 p-1"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

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
