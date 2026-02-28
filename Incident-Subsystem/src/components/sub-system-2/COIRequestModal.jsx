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
    purposeOfRequest: "",
    specificPurpose: "",
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  // File handling
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      addToast({ type: "error", title: "Invalid File Type", message: "Please upload JPG, PNG, or PDF.", duration: 4000 });
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast({ type: "error", title: "File Too Large", message: "File must not exceed 5MB.", duration: 4000 });
      e.target.value = "";
      return;
    }
    setUploadedFile(file);
    addToast({ type: "success", title: "File Uploaded", message: `${file.name} attached successfully.`, duration: 3000 });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      addToast({ type: "error", title: "Invalid File Type", message: "Please upload JPG, PNG, or PDF.", duration: 4000 });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast({ type: "error", title: "File Too Large", message: "File must not exceed 5MB.", duration: 4000 });
      return;
    }
    setUploadedFile(file);
    addToast({ type: "success", title: "File Uploaded", message: `${file.name} attached successfully.`, duration: 3000 });
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

  // Modal open/close effects
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else {
      document.body.style.overflow = "";
      setStep(1);
      setShowPreview(false);
      setShowSuccess(false);
      setUploadedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    return () => { document.body.style.overflow = ""; };
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
    const phoneFields = ["contactNumber", "emergencyContactNumber"];
    if (phoneFields.includes(name)) {
      setFormData((prev) => ({ ...prev, [name]: value.replace(/[^0-9]/g, "").slice(0, 11) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!formData.fullName.trim() || !formData.contactNumber.trim() || !formData.dateOfBirth) {
          addToast({ type: "error", title: "Missing Required Fields", message: "Please fill in your full name, contact number, and date of birth.", duration: 4000 });
          return false;
        }
        if (formData.contactNumber.length !== 11) {
          addToast({
            type: "error",
            title: "Invalid Contact Number",
            message: "Contact number must be exactly 11 digits.",
            duration: 4000,
          });
          return false;
        }
        return true;
      case 2:
        if (!formData.streetAddress.trim() || !formData.purposeOfRequest.trim()) {
          addToast({ type: "error", title: "Missing Required Fields", message: "Please provide your address and purpose.", duration: 4000 });
          return false;
        }
        return true;
      case 3:
        return true;
      default:
        return true;
    }
  };

  const totalSteps = 3;

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < totalSteps) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = () => setShowPreview(true);

  const handleConfirmSubmit = async () => {
    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    if (uploadedFile) data.append("uploaded_file", uploadedFile);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/coi-requests", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      let result = {};
      try { result = await res.json(); } catch { result = { success: false, message: "Server returned invalid JSON" }; }

      if (res.ok && result.success) {
        setShowPreview(false);
        setShowSuccess(true);
        addToast({ type: "success", title: "Request Submitted", message: result.message || "Your request has been recorded.", duration: 5000 });
      } else {
        addToast({ type: "error", title: "Submission Error", message: result.message || "Please check your inputs." });
        console.error(result.errors);
      }
    } catch (err) {
      console.error(err);
      addToast({ type: "error", title: "Network Error", message: "Could not connect to the server." });
    }
  };

  const handleSuccessContinue = () => {
    setShowSuccess(false);
    onClose();
    navigate("/sub-system-2/req-sub-coi");
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h3 className={`font-spartan text-lg font-bold ${t.cardText} mb-4`}>Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" name="fullName" value={formData.fullName} onChange={handleFieldChange} t={t} placeholder="Juan Dela Cruz" required />
              <Field label="Contact Number" name="contactNumber" value={formData.contactNumber} onChange={handleFieldChange} t={t} placeholder="09XX-XXX-XXXX" required />
              <Field label="Date of Birth" type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleFieldChange} t={t} required />
              <SelectField label="Civil Status" name="civilStatus" value={formData.civilStatus} onChange={handleFieldChange} options={["Single","Married","Widowed","Separated"]} t={t} />
              <Field label="Email Address" name="emailAddress" value={formData.emailAddress} onChange={handleFieldChange} t={t} placeholder="example@email.com" />
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h3 className={`font-spartan text-lg font-bold ${t.cardText} mb-4`}>Address & Purpose</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField label="Purok/Zone" name="purokZone" value={formData.purokZone} onChange={handleFieldChange} options={["Purok/Zone 1","Purok/Zone 2","Purok/Zone 3","Purok/Zone 4"]} t={t} />
              <Field label="Street Address" name="streetAddress" value={formData.streetAddress} onChange={handleFieldChange} t={t} placeholder="House No., Street Name" required />
              <Field label="Purpose of Request" name="purposeOfRequest" value={formData.purposeOfRequest} onChange={handleFieldChange} t={t} placeholder="E.g., Scholarship" required />
              <Field label="Specific Purpose (Optional)" name="specificPurpose" value={formData.specificPurpose} onChange={handleFieldChange} t={t} placeholder="Optional details" />
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h3 className={`font-spartan text-lg font-bold ${t.cardText} mb-4`}>Upload Valid ID</h3>
            <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="hidden" />
            {uploadedFile ? (
              <div className={`border ${t.cardBorder} rounded-xl p-4 flex items-center gap-3 ${t.inputBg}`}>
                <div className="flex-1 min-w-0">
                  <p className={`font-kumbh text-sm font-medium ${t.cardText} truncate`}>{uploadedFile.name}</p>
                  <p className={`font-kumbh text-xs ${t.subtleText}`}>{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                </div>
                <button onClick={removeFile} className="text-red-500 hover:text-red-600">
                  Remove
                </button>
              </div>
            ) : (
              <div className={`border-2 border-dashed ${t.cardBorder} rounded-xl p-6 text-center cursor-pointer`} onClick={() => fileInputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
                <p>Drag & drop your file here, or click to browse</p>
              </div>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Toast toasts={toasts} onRemove={removeToast} currentTheme={currentTheme} />

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col`}>
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b">
            <div>
              <h2 className={`font-spartan text-xl font-bold ${t.cardText}`}>Request Certificate of Indigency</h2>
              <p className={`font-kumbh text-xs ${t.subtleText}`}>Step {step} of {totalSteps}</p>
            </div>
            <button onClick={onClose}>X</button>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto p-5">{renderStepContent()}</div>

          {/* Footer */}
          <div className="flex items-center justify-between p-5 border-t">
            <button onClick={() => (step > 1 ? setStep(step - 1) : onClose())}>Back</button>
            <button onClick={handleNext}>{step < totalSteps ? "Next" : "Submit Request"}</button>
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
            <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl w-full max-w-2xl p-6 max-h-[85vh] overflow-y-auto`}>
              <h3 className={`font-spartan text-xl font-bold ${t.cardText} mb-2`}>Review Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.keys(formData).map((key) => (
                  <PreviewItem key={key} label={key} value={formData[key]} t={t} />
                ))}
                {uploadedFile && <PreviewItem label="Uploaded File" value={uploadedFile.name} t={t} />}
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button onClick={() => setShowPreview(false)}>Go Back</button>
                <button onClick={handleConfirmSubmit}>Confirm & Submit</button>
              </div>
            </div>
          </div>
        )}

        {/* Success */}
        {showSuccess && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
            <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl w-full max-w-md p-8 text-center`}>
              <h3 className={`font-spartan text-2xl font-bold ${t.cardText}`}>Request Submitted!</h3>
              <p className={`font-kumbh text-sm ${t.subtleText}`}>Your COI request has been submitted successfully.</p>
              <button onClick={handleSuccessContinue}>Continue</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const Field = ({ label, type = "text", name, value, onChange, t, placeholder, required }) => (
  <div>
    <label className={`font-kumbh text-sm font-medium ${t.cardText} block mb-1.5`}>{label}{required && "*"}</label>
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className={`w-full border ${t.cardBorder} rounded-lg py-2 px-3`} />
  </div>
);

const SelectField = ({ label, options, name, value, onChange, t }) => (
  <div>
    <label className={`font-kumbh text-sm font-medium ${t.cardText} block mb-1.5`}>{label}</label>
    <select name={name} value={value} onChange={onChange} className={`w-full border ${t.cardBorder} rounded-lg py-2 px-3`}>
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  </div>
);

const PreviewItem = ({ label, value, t }) => (
  <div className={`border ${t.cardBorder} rounded-lg p-3`}>
    <p className={`font-kumbh text-xs ${t.subtleText}`}>{label}</p>
    <p className={`font-kumbh text-sm font-medium ${t.cardText} mt-0.5`}>{value || "-"}</p>
  </div>
);

export default COIRequestModal;