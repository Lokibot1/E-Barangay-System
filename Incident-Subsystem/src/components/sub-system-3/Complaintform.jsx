import React from "react";
import InputField from "../../components/shared/InputField";
import TextAreaField from "../../components/shared/TextAreaField";
import SelectField from "../../components/shared/SelectField";
import FileUpload from "../../components/shared/FileUpload";
import MapComponent from "../shared/MapComponent";
import { useLanguage } from "../../context/LanguageContext";
import themeTokens from "../../Themetokens";

const ComplaintForm = ({
  currentStep,
  formData,
  onInputChange,
  errors,
  currentTheme,
}) => {
  const t = themeTokens[currentTheme] || themeTokens.blue;
  const { tr } = useLanguage();
  const cf = tr.complaintForm;

  const today = new Date().toISOString().split("T")[0];

  const complaintTypes = [
    { value: "", label: cf.selectComplaintType },
    { value: "noise", label: cf.noise },
    { value: "property", label: cf.property },
    { value: "harassment", label: cf.harassment },
    { value: "trespassing", label: cf.trespassing },
    { value: "parking", label: cf.parking },
    { value: "garbage", label: cf.garbage },
    { value: "boundary", label: cf.boundary },
    { value: "unpaid", label: cf.unpaid },
    { value: "other", label: cf.other },
  ];

  const severityLevels = [
    { value: "", label: cf.selectSeverity },
    { value: "low", label: cf.severityLow },
    { value: "medium", label: cf.severityMedium },
    { value: "high", label: cf.severityHigh },
  ];

  const handleLocationSelect = (lat, lng, address) => {
    onInputChange("latitude", lat);
    onInputChange("longitude", lng);
    onInputChange("location", address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
  };

  const handleWitnessChange = (index, value) => {
    const newWitnesses = [...formData.witnesses];
    newWitnesses[index] = value.replace(/[0-9]/g, "");
    onInputChange("witnesses", newWitnesses);
  };

  const addWitness = () => {
    onInputChange("witnesses", [...formData.witnesses, ""]);
  };

  const removeWitness = (index) => {
    const newWitnesses = formData.witnesses.filter((_, i) => i !== index);
    onInputChange("witnesses", newWitnesses.length ? newWitnesses : [""]);
  };

  return (
    <div className="px-6 py-6">
      {/* Step 1: Basic Information */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h3
              className={`text-xl font-bold ${t.sectionTitle} mb-1 font-spartan`}
            >
              {cf.step1Title}
            </h3>
            <p className={`text-sm ${t.sectionSubtitle} font-kumbh`}>
              {cf.step1Subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label={cf.dateOfIncident}
              type="date"
              value={formData.complaintDate}
              onChange={(e) => onInputChange("complaintDate", e.target.value)}
              error={errors.complaintDate}
              required
              max={today}
              currentTheme={currentTheme}
              icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
            <InputField
              label={cf.timeOfIncident}
              type="time"
              value={formData.complaintTime}
              onChange={(e) => onInputChange("complaintTime", e.target.value)}
              error={errors.complaintTime}
              required
              currentTheme={currentTheme}
              icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </div>

          <InputField
            label={cf.location}
            type="text"
            value={formData.location}
            onChange={(e) => onInputChange("location", e.target.value)}
            placeholder={cf.locationPlaceholder}
            error={errors.location}
            required
            currentTheme={currentTheme}
            icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />

          <div>
            <label
              className={`block text-sm font-semibold ${t.labelText || t.cardText} mb-2 font-kumbh`}
            >
              Pin Location on Map
            </label>
            <p className={`text-xs ${t.sectionSubtitle || t.subtleText} mb-3 font-kumbh`}>
              Click on the map to pin the location, or it will auto-pin to your current location.
            </p>
            <MapComponent
              mode="pin"
              onLocationSelect={handleLocationSelect}
              currentTheme={currentTheme}
              enableGPS={true}
              height="300px"
            />
          </div>
        </div>
      )}

      {/* Step 2: Complaint Details */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h3
              className={`text-xl font-bold ${t.sectionTitle} mb-1 font-spartan`}
            >
              {cf.step2Title}
            </h3>
            <p className={`text-sm ${t.sectionSubtitle} font-kumbh`}>
              {cf.step2Subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label={cf.complaintType}
              value={formData.complaintType}
              onChange={(e) => onInputChange("complaintType", e.target.value)}
              options={complaintTypes}
              error={errors.complaintType}
              required
              currentTheme={currentTheme}
              icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />

            <SelectField
              label={cf.severity}
              value={formData.severity}
              onChange={(e) => onInputChange("severity", e.target.value)}
              options={severityLevels}
              error={errors.severity}
              required
              currentTheme={currentTheme}
              icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </div>

          <TextAreaField
            label={cf.description}
            value={formData.description}
            onChange={(e) => onInputChange("description", e.target.value)}
            placeholder={cf.descriptionPlaceholder}
            rows={4}
            error={errors.description}
            required
            currentTheme={currentTheme}
            icon="M4 6h16M4 12h16M4 18h7"
          />
        </div>
      )}

      {/* Step 3: Parties Involved */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h3
              className={`text-xl font-bold ${t.sectionTitle} mb-1 font-spartan`}
            >
              {cf.step3Title}
            </h3>
            <p className={`text-sm ${t.sectionSubtitle} font-kumbh`}>
              {cf.step3Subtitle}
            </p>
          </div>

          {/* Complainant + Respondent side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Complainant Section */}
            <div
              className={`${t.inlineBg} border ${t.dividerBorder} rounded-lg p-4`}
            >
              <h4
                className={`text-lg font-semibold ${t.cardText} mb-4 font-spartan`}
              >
                {cf.complainantYou}
              </h4>
              <div className="space-y-4">
                <InputField
                  label={cf.fullName}
                  type="text"
                  value={formData.complainantName}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[0-9]/g, "");
                    onInputChange("complainantName", val);
                  }}
                  placeholder={cf.yourFullName}
                  error={errors.complainantName}
                  required
                  currentTheme={currentTheme}
                  icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
                <InputField
                  label={cf.contactNumber}
                  type="tel"
                  value={formData.complainantContact}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9+ ]/g, "");
                    onInputChange("complainantContact", val);
                  }}
                  placeholder="09XX XXX XXXX"
                  currentTheme={currentTheme}
                  icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </div>
            </div>

            {/* Respondent Section */}
            <div
              className={`${t.inlineBg} border ${t.dividerBorder} rounded-lg p-4`}
            >
              <h4
                className={`text-lg font-semibold ${t.cardText} mb-4 font-spartan`}
              >
                {cf.respondent}
              </h4>
              <div className="space-y-4">
                <InputField
                  label={cf.fullName}
                  type="text"
                  value={formData.respondentName}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[0-9]/g, "");
                    onInputChange("respondentName", val);
                  }}
                  placeholder={cf.respondentName}
                  error={errors.respondentName}
                  required
                  currentTheme={currentTheme}
                  icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
                <TextAreaField
                  label={cf.respondentAddress}
                  value={formData.respondentAddress}
                  onChange={(e) =>
                    onInputChange("respondentAddress", e.target.value)
                  }
                  placeholder={cf.respondentAddressPlaceholder}
                  rows={2}
                  currentTheme={currentTheme}
                  icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </div>
            </div>
          </div>

          {/* Witnesses */}
          <div>
            <label
              className={`block text-sm font-semibold ${t.labelText} mb-3 font-kumbh`}
            >
              {cf.witnesses}
            </label>
            <div className="space-y-3">
              {formData.witnesses.map((witness, index) => (
                <div key={index} className="flex gap-2">
                  <div className="relative flex-1">
                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.subtleText} pointer-events-none`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={witness}
                      onChange={(e) => handleWitnessChange(index, e.target.value)}
                      placeholder={`${cf.witnessPlaceholder} ${index + 1}`}
                      className={`w-full pl-9 pr-4 py-3 border rounded-lg ${t.inputBg} ${t.inputText} ${t.inputBorder} font-kumbh`}
                    />
                  </div>
                  {formData.witnesses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeWitness(index)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addWitness}
                className={`text-sm ${t.primaryText} hover:opacity-80 font-medium font-kumbh`}
              >
                {cf.addWitness}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Additional Information */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h3
              className={`text-xl font-bold ${t.sectionTitle} mb-1 font-spartan`}
            >
              {cf.step4Title}
            </h3>
            <p className={`text-sm ${t.sectionSubtitle} font-kumbh`}>
              {cf.step4Subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextAreaField
              label={cf.desiredResolution}
              value={formData.desiredResolution}
              onChange={(e) => onInputChange("desiredResolution", e.target.value)}
              placeholder={cf.desiredResolutionPlaceholder}
              rows={3}
              currentTheme={currentTheme}
              icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />

            <TextAreaField
              label={cf.additionalNotes}
              value={formData.additionalNotes}
              onChange={(e) => onInputChange("additionalNotes", e.target.value)}
              placeholder={cf.additionalNotesPlaceholder}
              rows={3}
              currentTheme={currentTheme}
              icon="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </div>

          <FileUpload
            label={cf.supportingDocuments}
            description={cf.supportingDocumentsDesc}
            files={formData.attachments}
            onChange={(files) => onInputChange("attachments", files)}
            currentTheme={currentTheme}
          />
        </div>
      )}
    </div>
  );
};

export default ComplaintForm;
