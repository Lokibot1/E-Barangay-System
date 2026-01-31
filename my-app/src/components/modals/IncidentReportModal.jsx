import React, { useState, useEffect, useCallback } from "react";
import IncidentForm from "../Incidentform";
import ProgressIndicator from "../ProgressIndicator";
import Toast from "../modals/Toast";
import themeTokens from "../../Themetokens";
import { incidentService } from "../../services/incidentService";

const IncidentReportModal = ({ isOpen, onClose, currentTheme }) => {
  const t = themeTokens[currentTheme] || themeTokens.blue;

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    incidentDate: "",
    incidentTime: "",
    location: "",
    incidentType: "",
    severity: "",
    description: "",
    immediateAction: "",
    personsInvolved: [""],
    witnesses: [""],
    injuries: false,
    propertyDamage: false,
    medicalAttention: false,
    attachments: [],
    additionalNotes: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState([]);

  const totalSteps = 4;

  // ─── Toast helpers ──────────────────────────────────────────────────────
  const addToast = useCallback((toast) => {
    setToasts((prev) => [...prev, { id: Date.now(), ...toast }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  // ─── Reset on close ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setCurrentStep(1);
        setErrors({});
        setFormData({
          incidentDate: "",
          incidentTime: "",
          location: "",
          incidentType: "",
          severity: "",
          description: "",
          immediateAction: "",
          personsInvolved: [""],
          witnesses: [""],
          injuries: false,
          propertyDamage: false,
          medicalAttention: false,
          attachments: [],
          additionalNotes: "",
        });
      }, 300);
    }
  }, [isOpen]);

  // ─── Body scroll lock ───────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // ─── ESC key ────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose, isSubmitting]);

  // ─── Input change – clears its own error ────────────────────────────────
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // ─── Validation ─────────────────────────────────────────────────────────
  const validate = (step) => {
    const errs = {};
    switch (step) {
      case 1:
        if (!formData.incidentDate.trim())
          errs.incidentDate = "Date of incident is required.";
        if (!formData.incidentTime.trim())
          errs.incidentTime = "Time of incident is required.";
        if (!formData.location.trim()) errs.location = "Location is required.";
        break;
      case 2:
        if (!formData.incidentType)
          errs.incidentType = "Please select an incident type.";
        if (!formData.severity)
          errs.severity = "Please select a severity level.";
        if (!formData.description.trim())
          errs.description = "A detailed description is required.";
        break;
      case 3:
        if (formData.personsInvolved.every((p) => !p.trim()))
          errs.personsInvolved = "At least one person involved is required.";
        if (formData.witnesses.every((w) => !w.trim()))
          errs.witnesses = "At least one witness is required.";
        break;
      default:
        break;
    }
    return errs;
  };

  // ─── Navigation ─────────────────────────────────────────────────────────
  const handleNext = () => {
    const stepErrors = validate(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setErrors({});
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // ─── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await incidentService.submitReport(formData);
      addToast({
        type: "success",
        title: "Report Submitted!",
        message:
          "Your incident report has been recorded and will be reviewed shortly.",
        duration: 5000,
      });
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error("Error submitting report:", error);
      addToast({
        type: "error",
        title: "Submission Failed",
        message: "Something went wrong. Please try again.",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <Toast
        toasts={toasts}
        onRemove={removeToast}
        currentTheme={currentTheme}
      />

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={handleBackdropClick}
      >
        <div
          className={`relative ${t.modalBg} rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-scaleIn`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className={`flex items-start justify-between px-6 py-4 border-b ${t.modalHeaderBorderBottom} flex-shrink-0 bg-gradient-to-r ${t.modalHeaderGrad} rounded-t-2xl`}
          >
            <div>
              <div className="flex items-center space-x-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  className={`${t.modalHeaderIcon} flex-shrink-0`}
                >
                  <g
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                  >
                    <path d="M11.5 16.5L10 18l1.5 1.5l1.499-1.5zm.5-2h-1l-1-8h3z" />
                    <path d="m21.5 18l-10 5.5l-10-5.5V7l10-5.5l10 5.5z" />
                  </g>
                </svg>
                <h2
                  className={`text-2xl font-bold ${t.modalTitle} font-spartan`}
                >
                  Incident Report
                </h2>
              </div>
              <p className={`text-sm ${t.modalSubtext} mt-1 font-kumbh`}>
                Provide detailed information about the incident
              </p>
            </div>

            <button
              onClick={onClose}
              disabled={isSubmitting}
              className={`p-2 ${t.modalCloseBtnColor} ${t.modalCloseBtnHover} ${t.modalCloseBtnHoverBg} rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6"
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

          {/* Progress */}
          <div
            className={`px-6 py-4 border-b ${t.progressSectionBorder} flex-shrink-0 ${t.progressSectionBg}`}
          >
            <ProgressIndicator
              currentStep={currentStep}
              totalSteps={totalSteps}
              currentTheme={currentTheme}
            />
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            <IncidentForm
              currentStep={currentStep}
              formData={formData}
              onInputChange={handleInputChange}
              errors={errors}
              currentTheme={currentTheme}
            />
          </div>

          {/* Footer */}
          <div
            className={`px-6 py-4 ${t.footerBg} border-t ${t.footerBorder} flex justify-between items-center flex-shrink-0 rounded-b-2xl font-kumbh`}
          >
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                currentStep === 1
                  ? `${t.footerPrevDisabledBg} ${t.footerPrevDisabledText} cursor-not-allowed`
                  : `${t.footerPrevActiveBg} ${t.footerPrevActiveText} ${t.footerPrevActiveHover} hover:shadow-md`
              }`}
            >
              ← Previous
            </button>

            <div className={`text-sm font-medium ${t.footerStepText}`}>
              Step {currentStep} of {totalSteps}
            </div>

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className={`px-6 py-3 ${t.nextBtnBg} text-white rounded-lg font-medium ${t.nextBtnHover} hover:shadow-lg transition-all duration-200`}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isSubmitting
                    ? `${t.submitDisabled} text-white cursor-wait`
                    : `bg-gradient-to-r ${t.submitGrad} text-white hover:shadow-xl hover:scale-105`
                }`}
              >
                {isSubmitting ? "Submitting..." : "✓ Submit Report"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default IncidentReportModal;
