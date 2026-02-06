import React, { useState, useEffect, useCallback } from "react";
import ComplaintForm from "../Complaintform";
import ProgressIndicator from "../ProgressIndicator";
import Toast from "../modals/Toast";
import themeTokens from "../../Themetokens";

const ComplaintModal = ({ isOpen, onClose, currentTheme }) => {
  const t = themeTokens[currentTheme] || themeTokens.blue;

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    complaintDate: "",
    complaintTime: "",
    location: "",
    complaintType: "",
    severity: "",
    description: "",
    complainantName: "",
    complainantContact: "",
    respondentName: "",
    respondentAddress: "",
    witnesses: [""],
    desiredResolution: "",
    attachments: [],
    additionalNotes: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState([]);

  const totalSteps = 4;

  // ─── Toast helpers ──────────────────────────────────────────────────────────
  const addToast = useCallback((toast) => {
    setToasts((prev) => [...prev, { id: Date.now(), ...toast }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  // ─── Reset on close ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setCurrentStep(1);
        setErrors({});
        setFormData({
          complaintDate: "",
          complaintTime: "",
          location: "",
          complaintType: "",
          severity: "",
          description: "",
          complainantName: "",
          complainantContact: "",
          respondentName: "",
          respondentAddress: "",
          witnesses: [""],
          desiredResolution: "",
          attachments: [],
          additionalNotes: "",
        });
      }, 300);
    }
  }, [isOpen]);

  // ─── Body scroll lock ───────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // ─── ESC key ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose, isSubmitting]);

  // ─── Input change — clears its own error ────────────────────────────────────
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

  // ─── Validation ─────────────────────────────────────────────────────────────
  const validate = (step) => {
    const errs = {};
    switch (step) {
      case 1:
        if (!formData.complaintDate.trim())
          errs.complaintDate = "Date of complaint is required.";
        if (!formData.complaintTime.trim())
          errs.complaintTime = "Time of complaint is required.";
        if (!formData.location.trim()) errs.location = "Location is required.";
        break;
      case 2:
        if (!formData.complaintType)
          errs.complaintType = "Please select a complaint type.";
        if (!formData.severity)
          errs.severity = "Please select a severity level.";
        if (!formData.description.trim())
          errs.description = "A detailed description is required.";
        break;
      case 3:
        if (!formData.complainantName.trim())
          errs.complainantName = "Complainant name is required.";
        if (!formData.respondentName.trim())
          errs.respondentName = "Respondent name is required.";
        break;
      default:
        break;
    }
    return errs;
  };

  // ─── Navigation ─────────────────────────────────────────────────────────────
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

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      addToast({
        type: "success",
        title: "Complaint Submitted!",
        message:
          "Your complaint has been recorded and will be processed by the Barangay.",
        duration: 5000,
      });
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error("Error submitting complaint:", error);
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
            className={`flex items-start justify-between px-6 py-4 border-b ${t.modalHeaderBorderBottom} flex-shrink-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-2xl`}
          >
            <div>
              <div className="flex items-center space-x-3">
                <svg
                  className="w-8 h-8 text-white"
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
                <h2 className="text-2xl font-bold text-white font-spartan">
                  File a Complaint
                </h2>
              </div>
              <p className="text-sm text-white/90 mt-1 font-kumbh">
                Submit your complaint for barangay mediation
              </p>
            </div>

            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 text-white hover:text-white hover:bg-white/20 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
            <ComplaintForm
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
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isSubmitting
                    ? "bg-gray-400 text-white cursor-wait"
                    : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-xl hover:scale-105"
                }`}
              >
                {isSubmitting ? "Submitting..." : "✓ Submit Complaint"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ComplaintModal;
