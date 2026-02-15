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
    newWitnesses[index] = value;
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
            />
            <InputField
              label={cf.timeOfIncident}
              type="time"
              value={formData.complaintTime}
              onChange={(e) => onInputChange("complaintTime", e.target.value)}
              error={errors.complaintTime}
              required
              currentTheme={currentTheme}
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
            />

            <SelectField
              label={cf.severity}
              value={formData.severity}
              onChange={(e) => onInputChange("severity", e.target.value)}
              options={severityLevels}
              error={errors.severity}
              required
              currentTheme={currentTheme}
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
                  onChange={(e) =>
                    onInputChange("complainantName", e.target.value)
                  }
                  placeholder={cf.yourFullName}
                  error={errors.complainantName}
                  required
                  currentTheme={currentTheme}
                />
                <InputField
                  label={cf.contactNumber}
                  type="tel"
                  value={formData.complainantContact}
                  onChange={(e) =>
                    onInputChange("complainantContact", e.target.value)
                  }
                  placeholder="09XX XXX XXXX"
                  currentTheme={currentTheme}
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
                  onChange={(e) =>
                    onInputChange("respondentName", e.target.value)
                  }
                  placeholder={cf.respondentName}
                  error={errors.respondentName}
                  required
                  currentTheme={currentTheme}
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
                  <input
                    type="text"
                    value={witness}
                    onChange={(e) => handleWitnessChange(index, e.target.value)}
                    placeholder={`${cf.witnessPlaceholder} ${index + 1}`}
                    className={`flex-1 px-4 py-3 border rounded-lg ${t.inputBg} ${t.inputText} ${t.inputBorder} font-kumbh`}
                  />
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
            />

            <TextAreaField
              label={cf.additionalNotes}
              value={formData.additionalNotes}
              onChange={(e) => onInputChange("additionalNotes", e.target.value)}
              placeholder={cf.additionalNotesPlaceholder}
              rows={3}
              currentTheme={currentTheme}
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
