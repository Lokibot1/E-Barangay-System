import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ComplaintForm from "../../components/sub-system-3/Complaintform";
import ProgressIndicator from "../../components/sub-system-3/ProgressIndicator";
import Toast from "../../components/shared/modals/Toast";
import { fileComplaint } from "../../services/sub-system-3/complaintService";
import { getUser } from "../../homepage/services/loginService";
import { getAllCustomFields } from "../../services/sub-system-3/customFieldService";
import themeTokens from "../../Themetokens";
import { useLanguage } from "../../context/LanguageContext";

const COMPLAINT_DRAFT_KEY = "complaint_draft";

const getLoggedInName = () => {
  const user = getUser();
  if (!user) return "";
  const parts = [user.first_name, user.middle_name, user.last_name].filter(Boolean);
  return parts.join(" ");
};

const defaultComplaintForm = () => ({
  complaintDate: "",
  complaintTime: "",
  location: "",
  latitude: null,
  longitude: null,
  complaintType: "",
  severity: "",
  description: "",
  complainantName: getLoggedInName(),
  complainantContact: "",
  respondentName: "",
  respondentAddress: "",
  witnesses: [""],
  desiredResolution: "",
  attachments: [],
  additionalNotes: "",
  customFieldValues: {},
});

const hasComplaintDraftContent = (data) =>
  data?.complaintDate?.trim() ||
  data?.complaintType?.trim() ||
  data?.description?.trim() ||
  data?.respondentName?.trim() ||
  data?.complainantContact?.trim() ||
  data?.desiredResolution?.trim() ||
  data?.additionalNotes?.trim();

const ComplaintModal = ({ isOpen, onClose, currentTheme }) => {
  const t = themeTokens[currentTheme] || themeTokens.modern;
  const { tr } = useLanguage();
  const cm = tr.complaintModal;
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(defaultComplaintForm);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const pendingDraftRef = useRef(null);
  const submittedRef = useRef(false);
  const bodyRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [customFieldDefs, setCustomFieldDefs] = useState([]);

  const totalSteps = 4;

  // ─── Toast helpers ──────────────────────────────────────────────────────────
  const addToast = useCallback((toast) => {
    setToasts((prev) => [...prev, { id: Date.now(), ...toast }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  // ─── Auto-fill complainant name + fetch custom fields + check draft on open ─
  useEffect(() => {
    if (isOpen) {
      const name = getLoggedInName();
      if (name) {
        setFormData((prev) => ({ ...prev, complainantName: name }));
      }

      // Check for saved draft
      try {
        const saved = localStorage.getItem(COMPLAINT_DRAFT_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (hasComplaintDraftContent(parsed.formData)) {
            pendingDraftRef.current = parsed;
            setShowDraftPrompt(true);
          } else {
            localStorage.removeItem(COMPLAINT_DRAFT_KEY);
          }
        }
      } catch {
        localStorage.removeItem(COMPLAINT_DRAFT_KEY);
      }

      getAllCustomFields()
        .then((res) => {
          const all = Array.isArray(res) ? res : res.data || [];
          setCustomFieldDefs(all.filter((f) => f.field_for === "complaint" && f.is_active));
        })
        .catch((err) => {
          console.error("Failed to fetch complaint custom fields:", err);
        });
    }
  }, [isOpen]);

  // ─── Reset on close (save draft first) ─────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      if (!submittedRef.current && hasComplaintDraftContent(formData)) {
        const serializable = { ...formData, attachments: [] };
        localStorage.setItem(
          COMPLAINT_DRAFT_KEY,
          JSON.stringify({ formData: serializable, step: currentStep })
        );
      }
      submittedRef.current = false;
      setTimeout(() => {
        setCurrentStep(1);
        setErrors({});
        setShowDraftPrompt(false);
        pendingDraftRef.current = null;
        setFormData(defaultComplaintForm());
      }, 300);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Draft actions ──────────────────────────────────────────────────────────
  const handleContinueDraft = () => {
    if (pendingDraftRef.current) {
      setFormData({ ...defaultComplaintForm(), ...pendingDraftRef.current.formData });
      setCurrentStep(pendingDraftRef.current.step || 1);
    }
    setShowDraftPrompt(false);
    pendingDraftRef.current = null;
  };

  const handleStartOver = () => {
    localStorage.removeItem(COMPLAINT_DRAFT_KEY);
    setFormData(defaultComplaintForm());
    setCurrentStep(1);
    setShowDraftPrompt(false);
    pendingDraftRef.current = null;
  };

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
          errs.complaintDate = cm.dateRequired;
        else if (formData.complaintDate > new Date().toISOString().split("T")[0])
          errs.complaintDate = cm.dateFuture;
        if (!formData.complaintTime.trim())
          errs.complaintTime = cm.timeRequired;
        if (!formData.location.trim()) errs.location = cm.locationRequired;
        if (!formData.latitude || !formData.longitude)
          errs.latitude = cm.coordinatesRequired;
        break;
      case 2:
        if (!formData.complaintType)
          errs.complaintType = cm.typeRequired;
        if (!formData.severity)
          errs.severity = cm.severityRequired;
        if (!formData.description.trim())
          errs.description = cm.descriptionRequired;
        break;
      case 3:
        if (!formData.complainantName.trim())
          errs.complainantName = cm.complainantRequired;
        if (!formData.complainantContact?.trim())
          errs.complainantContact = cm.contactRequired;
        if (!formData.respondentName.trim())
          errs.respondentName = cm.respondentRequired;
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
      bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors({});
    bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setErrors({});
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const stepErrors = validate(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setIsSubmitting(true);
    try {
      await fileComplaint(formData);
      submittedRef.current = true;
      localStorage.removeItem(COMPLAINT_DRAFT_KEY);

      addToast({
        type: "success",
        title: cm.successTitle,
        message: cm.successMessage,
        duration: 5000,
      });
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      // If not logged in, redirect to login page
      if (error.message === "You must be logged in to file a complaint.") {
        addToast({
          type: "error",
          title: cm.errorSessionTitle,
          message: cm.errorSessionMessage,
          duration: 4000,
        });
        setTimeout(() => navigate("/login", { replace: true }), 1500);
        return;
      }

      addToast({
        type: "error",
        title: cm.errorTitle,
        message: error.message || cm.errorMessage,
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
                  {cm.title}
                </h2>
              </div>
              <p className="text-sm text-white/90 mt-1 font-kumbh">
                {cm.subtitle}
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
          <div ref={bodyRef} className="relative flex-1 overflow-y-auto">
            {/* Draft restore prompt */}
            {showDraftPrompt && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className={`${t.modalBg} rounded-xl p-6 mx-4 max-w-sm w-full shadow-2xl`}>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <h3 className={`text-lg font-bold ${t.modalTitle} font-spartan`}>Unsaved Draft Found</h3>
                  </div>
                  <p className={`text-sm ${t.modalSubtext} font-kumbh mb-1`}>
                    You have a draft complaint. Would you like to continue where you left off?
                  </p>
                  <p className={`text-xs ${t.subtleText} font-kumbh mb-5`}>
                    Note: uploaded attachments are not saved in drafts and will need to be re-attached.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleStartOver}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium font-kumbh border ${t.cardBorder} ${t.modalSubtext} ${t.footerPrevActiveBg} hover:opacity-80 transition-all`}
                    >
                      Start Over
                    </button>
                    <button
                      onClick={handleContinueDraft}
                      className="flex-1 px-4 py-2 rounded-lg text-sm font-medium font-kumbh text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-lg transition-all"
                    >
                      Continue Draft
                    </button>
                  </div>
                </div>
              </div>
            )}
            <ComplaintForm
              currentStep={currentStep}
              formData={formData}
              onInputChange={handleInputChange}
              errors={errors}
              currentTheme={currentTheme}
              customFieldDefs={customFieldDefs}
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
              {cm.previous}
            </button>

            <div className={`text-sm font-medium ${t.footerStepText}`}>
              {cm.step} {currentStep} {cm.of} {totalSteps}
            </div>

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
              >
                {cm.next}
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
                {isSubmitting ? cm.submitting : cm.submit}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ComplaintModal;

