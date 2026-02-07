import React from "react";
import InputField from "../../components/shared/InputField";
import TextAreaField from "../../components/shared/TextAreaField";
import SelectField from "../../components/shared/SelectField";
import FileUpload from "../../components/shared/FileUpload";
import CheckboxField from "../../components/shared/CheckboxField";
import themeTokens from "../../Themetokens";

const IncidentForm = ({
  currentStep,
  formData,
  onInputChange,
  errors,
  currentTheme,
}) => {
  const t = themeTokens[currentTheme] || themeTokens.blue;

  const renderStep = () => {
    switch (currentStep) {
      // ════════════════════════════════════════════════════════ STEP 1
      case 1:
        return (
          <div className="space-y-6 animate-fadeIn p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div
                className={`w-10 h-10 ${t.step1Bg} rounded-lg flex items-center justify-center`}
              >
                <svg
                  className={`w-5 h-5 ${t.step1Icon}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3
                className={`text-2xl font-bold ${t.sectionTitle} font-spartan`}
              >
                Basic Information
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6 font-kumbh">
              <InputField
                label="Date of Incident"
                type="date"
                value={formData.incidentDate}
                onChange={(e) => onInputChange("incidentDate", e.target.value)}
                required
                error={errors.incidentDate}
                currentTheme={currentTheme}
              />
              <InputField
                label="Time of Incident"
                type="time"
                value={formData.incidentTime}
                onChange={(e) => onInputChange("incidentTime", e.target.value)}
                required
                error={errors.incidentTime}
                currentTheme={currentTheme}
              />
            </div>

            <InputField
              label="Location of Incident"
              type="text"
              placeholder="Building, floor, room number, or specific area"
              value={formData.location}
              onChange={(e) => onInputChange("location", e.target.value)}
              required
              error={errors.location}
              currentTheme={currentTheme}
            />
          </div>
        );

      // ════════════════════════════════════════════════════════ STEP 2
      case 2:
        return (
          <div className="space-y-6 animate-fadeIn p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div
                className={`w-10 h-10 ${t.step2Bg} rounded-lg flex items-center justify-center`}
              >
                <svg
                  className={`w-5 h-5 ${t.step2Icon}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3
                className={`text-2xl font-bold ${t.sectionTitle} font-spartan`}
              >
                Incident Details
              </h3>
            </div>

            <SelectField
              label="Type of Incident"
              value={formData.incidentType}
              onChange={(e) => onInputChange("incidentType", e.target.value)}
              options={[
                { value: "", label: "Select incident type" },
                { value: "safety", label: "⚠️ Safety Incident" },
                { value: "security", label: "🔒 Security Breach" },
                { value: "environmental", label: "🌍 Environmental Hazard" },
                { value: "equipment", label: "⚙️ Equipment Failure" },
                { value: "workplace-violence", label: "🚨 Workplace Violence" },
                { value: "fire", label: "🔥 Fire / Evacuation" },
                { value: "accident", label: "🩹 Accident / Injury" },
                { value: "near-miss", label: "⚡ Near Miss" },
                { value: "other", label: "📋 Other" },
              ]}
              required
              error={errors.incidentType}
              currentTheme={currentTheme}
            />

            <SelectField
              label="Severity Level"
              value={formData.severity}
              onChange={(e) => onInputChange("severity", e.target.value)}
              options={[
                { value: "", label: "Select severity level" },
                { value: "low", label: "🟢 Low - Minor incident, no injuries" },
                {
                  value: "medium",
                  label: "🟡 Medium - Moderate impact, minor injuries",
                },
                {
                  value: "high",
                  label: "🟠 High - Serious incident, significant damage",
                },
                {
                  value: "critical",
                  label: "🔴 Critical - Life-threatening, major damage",
                },
              ]}
              required
              error={errors.severity}
              currentTheme={currentTheme}
            />

            <TextAreaField
              label="Detailed Description"
              placeholder="Describe what happened, including the sequence of events, circumstances, and any contributing factors..."
              value={formData.description}
              onChange={(e) => onInputChange("description", e.target.value)}
              rows={6}
              required
              error={errors.description}
              currentTheme={currentTheme}
            />
            <TextAreaField
              label="Immediate Action Taken"
              placeholder="Describe any immediate actions taken to address the incident..."
              value={formData.immediateAction}
              onChange={(e) => onInputChange("immediateAction", e.target.value)}
              rows={4}
              currentTheme={currentTheme}
            />
          </div>
        );

      // ════════════════════════════════════════════════════════ STEP 3
      case 3:
        return (
          <div className="space-y-6 animate-fadeIn p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div
                className={`w-10 h-10 ${t.step3Bg} rounded-lg flex items-center justify-center`}
              >
                <svg
                  className={`w-5 h-5 ${t.step3Icon}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3
                className={`text-2xl font-bold ${t.sectionTitle} font-spartan`}
              >
                People Involved
              </h3>
            </div>

            {/* Persons Involved */}
            <div>
              <label
                className={`block text-sm font-semibold mb-2 font-kumbh ${errors.personsInvolved ? "text-red-600" : t.labelText}`}
              >
                Persons Involved <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {formData.personsInvolved.map((person, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 font-kumbh"
                  >
                    <input
                      type="text"
                      value={person}
                      placeholder={`Person ${index + 1} — e.g. John Doe, Security Officer`}
                      onChange={(e) => {
                        const updated = [...formData.personsInvolved];
                        updated[index] = e.target.value;
                        onInputChange("personsInvolved", updated);
                      }}
                      className={`flex-1 px-4 py-3 border rounded-lg transition-all duration-200 ${t.inputBg} ${t.inputText} ${t.inputPlaceholder} ${
                        errors.personsInvolved
                          ? "border-red-400 focus:ring-2 focus:ring-red-300 focus:border-red-400 hover:border-red-400"
                          : `${t.inputBorder} focus:ring-2 ${t.primaryRing} ${t.primaryBorder} ${t.primaryHoverBorder}`
                      }`}
                    />
                    {formData.personsInvolved.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          onInputChange(
                            "personsInvolved",
                            formData.personsInvolved.filter(
                              (_, i) => i !== index,
                            ),
                          )
                        }
                        className={`p-2.5 ${t.removeBtn} rounded-lg transition-all`}
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
                    )}
                  </div>
                ))}
              </div>
              {errors.personsInvolved && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.personsInvolved}
                </p>
              )}
              <button
                type="button"
                onClick={() =>
                  onInputChange("personsInvolved", [
                    ...formData.personsInvolved,
                    "",
                  ])
                }
                className={`mt-3 flex items-center gap-2 px-4 py-2 text-sm font-medium ${t.addBtnText} ${t.addBtnHoverText} ${t.addBtnHoverBg} rounded-lg transition-all font-kumbh`}
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Person
              </button>
            </div>

            {/* Witnesses */}
            <div>
              <label
                className={`block text-sm font-semibold mb-2 font-kumbh ${errors.witnesses ? "text-red-600" : t.labelText}`}
              >
                Witnesses <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {formData.witnesses.map((witness, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 font-kumbh"
                  >
                    <input
                      type="text"
                      value={witness}
                      placeholder={`Witness ${index + 1} — e.g. Jane Doe, +63 912 345 6789`}
                      onChange={(e) => {
                        const updated = [...formData.witnesses];
                        updated[index] = e.target.value;
                        onInputChange("witnesses", updated);
                      }}
                      className={`flex-1 px-4 py-3 border rounded-lg transition-all duration-200 ${t.inputBg} ${t.inputText} ${t.inputPlaceholder} ${
                        errors.witnesses
                          ? "border-red-400 focus:ring-2 focus:ring-red-300 focus:border-red-400 hover:border-red-400"
                          : `${t.inputBorder} focus:ring-2 ${t.primaryRing} ${t.primaryBorder} ${t.primaryHoverBorder}`
                      }`}
                    />
                    {formData.witnesses.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          onInputChange(
                            "witnesses",
                            formData.witnesses.filter((_, i) => i !== index),
                          )
                        }
                        className={`p-2.5 ${t.removeBtn} rounded-lg transition-all`}
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
                    )}
                  </div>
                ))}
              </div>
              {errors.witnesses && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.witnesses}
                </p>
              )}
              <button
                type="button"
                onClick={() =>
                  onInputChange("witnesses", [...formData.witnesses, ""])
                }
                className={`mt-3 flex items-center gap-2 px-4 py-2 text-sm font-medium ${t.addBtnText} ${t.addBtnHoverText} ${t.addBtnHoverBg} rounded-lg transition-all font-kumbh`}
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Witness
              </button>
            </div>

            {/* Impact Assessment */}
            <div className={`pt-6 border-t ${t.dividerBorder}`}>
              <h4
                className={`text-lg font-semibold ${t.sectionSubtitle} mb-4 flex items-center font-kumbh`}
              >
                <svg
                  className={`w-5 h-5 mr-2 ${t.step3Icon}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Impact Assessment
              </h4>
              <div
                className={`space-y-4 ${t.inlineBg} p-4 rounded-lg font-kumbh`}
              >
                <CheckboxField
                  label="Were there any injuries?"
                  checked={formData.injuries}
                  onChange={(e) => onInputChange("injuries", e.target.checked)}
                  currentTheme={currentTheme}
                />
                <CheckboxField
                  label="Was there property damage?"
                  checked={formData.propertyDamage}
                  onChange={(e) =>
                    onInputChange("propertyDamage", e.target.checked)
                  }
                  currentTheme={currentTheme}
                />
                <CheckboxField
                  label="Was medical attention required?"
                  checked={formData.medicalAttention}
                  onChange={(e) =>
                    onInputChange("medicalAttention", e.target.checked)
                  }
                  currentTheme={currentTheme}
                />
              </div>
            </div>
          </div>
        );

      // ════════════════════════════════════════════════════════ STEP 4
      case 4:
        return (
          <div className="space-y-6 animate-fadeIn p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div
                className={`w-10 h-10 ${t.step4Bg} rounded-lg flex items-center justify-center`}
              >
                <svg
                  className={`w-5 h-5 ${t.step4Icon}`}
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
              <h3
                className={`text-2xl font-bold ${t.sectionTitle} font-spartan`}
              >
                Additional Information
              </h3>
            </div>

            <FileUpload
              label="Attachments"
              description="Upload photos, videos, or documents related to the incident (Max 10MB per file)"
              files={formData.attachments}
              onChange={(files) => onInputChange("attachments", files)}
              currentTheme={currentTheme}
            />
            <TextAreaField
              label="Additional Notes"
              placeholder="Any other relevant information, recommendations, or comments..."
              value={formData.additionalNotes}
              onChange={(e) => onInputChange("additionalNotes", e.target.value)}
              rows={6}
              currentTheme={currentTheme}
            />

            {/* Info banner */}
            <div
              className={`${t.bannerBg} border-l-4 ${t.bannerBorder} rounded-lg p-4 mt-6`}
            >
              <div className="flex items-start">
                <svg
                  className={`w-5 h-5 ${t.bannerIcon} mt-0.5 mr-3 flex-shrink-0`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h4
                    className={`font-semibold ${t.bannerTitle} mb-1 font-kumbh`}
                  >
                    Review Before Submitting
                  </h4>
                  <p className={`text-sm ${t.bannerText} font-kumbh`}>
                    Please review all information carefully. Once submitted,
                    this report will be sent to the safety team for
                    investigation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return renderStep();
};

export default IncidentForm;
