import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../shared/modals/Toast";
import themeTokens from "../../Themetokens";

const COIRequestModal = ({ isOpen, onClose, currentTheme }) => {
  const navigate = useNavigate();
  const t = themeTokens[currentTheme];
  const [step, setStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [formData, setFormData] = useState({
    fullName: "",
    contactNumber: "",
    dateOfBirth: "",
    civilStatus: "Single",
    emailAddress: "",
    purokZone: "Purok/Zone 1",
    streetAddress: "",
    purposeOfRequest: "Medical Assistance",
    specificPurpose: "",
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      addToast({ type: "error", title: "Invalid File Type", message: "Please upload a JPG, PNG, or PDF file.", duration: 4000 });
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast({ type: "error", title: "File Too Large", message: "File size must not exceed 5MB.", duration: 4000 });
      e.target.value = "";
      return;
    }
    setUploadedFile(file);
    addToast({ type: "success", title: "File Uploaded", message: `${file.name} has been attached successfully.`, duration: 3000 });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      addToast({ type: "error", title: "Invalid File Type", message: "Please upload a JPG, PNG, or PDF file.", duration: 4000 });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast({ type: "error", title: "File Too Large", message: "File size must not exceed 5MB.", duration: 4000 });
      return;
    }
    setUploadedFile(file);
    addToast({ type: "success", title: "File Uploaded", message: `${file.name} has been attached successfully.`, duration: 3000 });
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addToast = useCallback((toast) => {
    setToasts((prev) => [...prev, { id: Date.now(), ...toast }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setStep(1);
      setShowPreview(false);
      setShowSuccess(false);
      setUploadedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen && !showPreview && !showSuccess) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose, showPreview, showSuccess]);

  if (!isOpen) return null;

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!formData.fullName.trim() || !formData.contactNumber.trim() || !formData.dateOfBirth) {
          addToast({
            type: "error",
            title: "Missing Required Fields",
            message: "Please fill in your full name, contact number, and date of birth.",
            duration: 4000,
          });
          return false;
        }
        return true;
      case 2:
        if (!formData.streetAddress.trim()) {
          addToast({
            type: "error",
            title: "Missing Required Fields",
            message: "Please provide your street address.",
            duration: 4000,
          });
          return false;
        }
        return true;
      case 3:
        if (formData.purposeOfRequest === "Other" && !formData.specificPurpose.trim()) {
          addToast({
            type: "error",
            title: "Missing Required Fields",
            message: "Please specify the purpose of your request.",
            duration: 4000,
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    setShowPreview(true);
  };

  const handleConfirmSubmit = () => {
    setShowPreview(false);
    addToast({
      type: "success",
      title: "Request Submitted",
      message: "Your Certificate of Indigency request has been submitted successfully.",
      duration: 5000,
    });
    setShowSuccess(true);
  };

  const handleSuccessContinue = () => {
    setShowSuccess(false);
    onClose();
    navigate("/sub-system-2/req-sub-coi");
  };

  const totalSteps = 3;

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h3 className={`font-spartan text-lg font-bold ${t.cardText} mb-4`}>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" name="fullName" value={formData.fullName} onChange={handleFieldChange} t={t} placeholder="Juan Dela Cruz" required icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              <Field label="Contact Number" name="contactNumber" value={formData.contactNumber} onChange={handleFieldChange} t={t} placeholder="09XX-XXX-XXXX" required icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              <Field label="Date of Birth" type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleFieldChange} t={t} required icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              <SelectField
                label="Civil Status"
                name="civilStatus"
                options={["Single", "Married", "Widowed", "Separated"]}
                value={formData.civilStatus}
                onChange={handleFieldChange}
                t={t}
                icon="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
              <div className="sm:col-span-2">
                <Field label="Email Address" name="emailAddress" value={formData.emailAddress} onChange={handleFieldChange} t={t} placeholder="example@email.com" icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </div>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h3 className={`font-spartan text-lg font-bold ${t.cardText} mb-4`}>
              Address Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                label="Purok/Zone"
                name="purokZone"
                options={["Purok/Zone 1", "Purok/Zone 2", "Purok/Zone 3", "Purok/Zone 4"]}
                value={formData.purokZone}
                onChange={handleFieldChange}
                t={t}
                icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <Field label="Street Address" name="streetAddress" value={formData.streetAddress} onChange={handleFieldChange} t={t} placeholder="House No., Street Name" required icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h3 className={`font-spartan text-lg font-bold ${t.cardText} mb-4`}>
              Request Details
            </h3>
            <div className="grid grid-cols-1 gap-4 mb-6">
              <SelectField
                label="Purpose of Request"
                name="purposeOfRequest"
                options={["Medical Assistance", "Scholarship", "Legal Aid", "Financial Assistance", "Other"]}
                value={formData.purposeOfRequest}
                onChange={handleFieldChange}
                t={t}
                icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
              {formData.purposeOfRequest === "Other" && (
                <Field label="Specify Purpose" name="specificPurpose" value={formData.specificPurpose} onChange={handleFieldChange} t={t} placeholder="Please specify the purpose of your request" required icon="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              )}
            </div>

            <div>
              <label className={`font-kumbh text-sm font-medium ${t.cardText} block mb-2`}>
                Upload Valid ID (Government-issued)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              {uploadedFile ? (
                <div className={`border ${t.cardBorder} rounded-xl p-4 flex items-center gap-3 ${t.inputBg}`}>
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-kumbh text-sm font-medium ${t.cardText} truncate`}>{uploadedFile.name}</p>
                    <p className={`font-kumbh text-xs ${t.subtleText}`}>{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={removeFile} className="flex-shrink-0 text-red-500 hover:text-red-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div
                  className={`border-2 border-dashed ${t.cardBorder} rounded-xl p-6 text-center cursor-pointer hover:border-green-400 transition-colors`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  <svg className={`w-10 h-10 mx-auto mb-2 ${t.subtleText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className={`font-kumbh text-sm ${t.subtleText} mb-2`}>
                    Drag & drop your file here, or
                  </p>
                  <span className="bg-green-500 hover:bg-green-600 text-white font-kumbh text-sm px-4 py-2 rounded-lg transition-colors inline-block">
                    Browse Files
                  </span>
                  <p className={`font-kumbh text-xs ${t.subtleText} mt-2`}>
                    Accepted formats: JPG, PNG, PDF (max 5MB)
                  </p>
                </div>
              )}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Toast toasts={toasts} onRemove={removeToast} currentTheme={currentTheme} />

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
        <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl`}>
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200/20 flex-shrink-0">
            <div>
              <h2 className={`font-spartan text-xl font-bold ${t.cardText}`}>
                Request Certificate of Indigency
              </h2>
              <p className={`font-kumbh text-xs ${t.subtleText} mt-0.5`}>
                Step {step} of {totalSteps}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${t.subtleText} hover:bg-gray-200/20 transition-colors`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-5 pt-4 flex-shrink-0">
            <div className="flex gap-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    i + 1 <= step ? "bg-green-500" : "bg-gray-300/30"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {renderStepContent()}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-5 border-t border-gray-200/20 flex-shrink-0">
            <button
              onClick={() => (step > 1 ? setStep(step - 1) : onClose())}
              className={`px-5 py-2.5 rounded-lg font-kumbh text-sm font-medium ${t.inputBg} ${t.cardText} hover:opacity-80 transition-colors`}
            >
              {step > 1 ? "Back" : "Cancel"}
            </button>
            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-kumbh text-sm font-medium transition-colors"
            >
              {step < totalSteps ? "Next" : "Submit Request"}
            </button>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className={`${t.cardBg} ${t.cardBorder} border rounded-2xl w-full max-w-2xl p-6 max-h-[85vh] overflow-y-auto shadow-2xl`}>
              <h3 className={`font-spartan text-xl font-bold ${t.cardText} mb-1`}>Review Your Information</h3>
              <p className={`font-kumbh text-sm ${t.subtleText} mb-4`}>Please confirm that all details are correct before submitting.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PreviewItem label="Full Name" value={formData.fullName} t={t} />
                <PreviewItem label="Contact Number" value={formData.contactNumber} t={t} />
                <PreviewItem label="Date of Birth" value={formData.dateOfBirth} t={t} />
                <PreviewItem label="Civil Status" value={formData.civilStatus} t={t} />
                <PreviewItem label="Email Address" value={formData.emailAddress} t={t} />
                <PreviewItem label="Purok/Zone" value={formData.purokZone} t={t} />
                <PreviewItem label="Street Address" value={formData.streetAddress} t={t} />
                <PreviewItem label="Purpose of Request" value={formData.purposeOfRequest} t={t} />
                {formData.purposeOfRequest === "Other" && (
                  <PreviewItem label="Specific Purpose" value={formData.specificPurpose} t={t} />
                )}
              </div>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className={`px-5 py-2.5 rounded-lg ${t.inputBg} ${t.cardText} font-kumbh text-sm font-medium`}
                >
                  Go Back
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  className="px-5 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-kumbh text-sm font-medium"
                >
                  Confirm & Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className={`${t.cardBg} ${t.cardBorder} border rounded-2xl w-full max-w-md p-8 text-center shadow-2xl`}>
              <div className="relative w-20 h-20 mx-auto mb-5">
                <span className="absolute inset-0 rounded-full bg-green-400/40 animate-ping" />
                <div className="relative w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className={`font-spartan text-2xl font-bold ${t.cardText}`}>Request Submitted!</h3>
              <p className={`font-kumbh text-sm ${t.subtleText} mt-2`}>
                Your Certificate of Indigency request has been submitted successfully. You will be notified once it is ready for pickup.
              </p>
              <button
                onClick={handleSuccessContinue}
                className="mt-6 px-6 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-kumbh text-sm font-medium transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const Field = ({ label, type = "text", name, value, onChange, t, placeholder, required, icon }) => (
  <div>
    <label className={`font-kumbh text-sm font-medium ${t.cardText} block mb-1.5`}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.subtleText} pointer-events-none`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full border ${t.cardBorder} rounded-lg ${icon ? "pl-9 pr-3" : "px-3"} py-2.5 text-sm font-kumbh ${t.inputBg} ${t.inputText} focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none transition-all`}
      />
    </div>
  </div>
);

const SelectField = ({ label, options, name, value, onChange, t, icon }) => (
  <div>
    <label className={`font-kumbh text-sm font-medium ${t.cardText} block mb-1.5`}>
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.subtleText} pointer-events-none`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full border ${t.cardBorder} rounded-lg ${icon ? "pl-9 pr-3" : "px-3"} py-2.5 text-sm font-kumbh ${t.inputBg} ${t.inputText} focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none transition-all`}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const PreviewItem = ({ label, value, t }) => (
  <div className={`border ${t.cardBorder} rounded-lg p-3 ${t.inputBg}`}>
    <p className={`font-kumbh text-xs ${t.subtleText}`}>{label}</p>
    <p className={`font-kumbh text-sm font-medium ${t.cardText} mt-0.5`}>{value || "-"}</p>
  </div>
);

export default COIRequestModal;
