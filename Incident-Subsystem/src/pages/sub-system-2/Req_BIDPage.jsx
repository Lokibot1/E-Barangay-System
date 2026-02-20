import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import themeTokens from "../../Themetokens";

const Req_BIDPage = () => {
  const navigate = useNavigate();
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    contactNumber: "",
    dateOfBirth: "",
    civilStatus: "Single",
    emailAddress: "",
    purokZone: "Purok/Zone 1",
    streetAddress: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
    bloodType: "A+",
  });

  const currentTheme = localStorage.getItem("appTheme") || "blue";
  const t = themeTokens[currentTheme];

  useEffect(() => {
    const hasShownInfoModal = sessionStorage.getItem("req_bid_info_modal_shown") === "true";
    if (hasShownInfoModal) return;

    const timer = setTimeout(() => {
      setShowInfoModal(true);
      sessionStorage.setItem("req_bid_info_modal_shown", "true");
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenPreview = () => {
    setShowConfirmModal(false);
    setShowPreviewModal(true);
  };

  const handleConfirmSubmit = () => {
    setShowPreviewModal(false);
    setShowSuccessModal(true);
  };

  const handleSuccessContinue = () => {
    setShowSuccessModal(false);
    navigate("/sub-system-2/req-sub-bid");
  };

  const handleExitPage = () => {
    setShowExitModal(false);
    navigate("/sub-system-2");
  };

  return (
    <div className={`${t.pageBg} min-h-full p-4 sm:p-6 lg:p-8`}>
      <div className="max-w-7xl mx-auto">
        <h1 className={`font-spartan text-4xl sm:text-5xl font-bold ${t.cardText}`}>
          Request for Barangay ID
        </h1>
        <p className={`font-kumbh text-lg ${t.subtleText} mt-2 mb-6`}>
          Please fill out the form below to request a certificate.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`${t.cardBg} ${t.cardBorder} border rounded-2xl p-6 lg:col-span-2`}>
            <h2 className={`font-spartan text-4xl font-bold ${t.cardText} mb-4`}>
              Personal Information
            </h2>

            <div className="grid grid-cols-1 gap-4 text-left">
              <Field label="Full Name:" name="fullName" value={formData.fullName} onChange={handleFieldChange} t={t} />
              <Field label="Contact Number:" name="contactNumber" value={formData.contactNumber} onChange={handleFieldChange} t={t} />
              <Field label="Date of Birth:" type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleFieldChange} t={t} />
              <SelectField
                label="Civil Status:"
                name="civilStatus"
                options={["Single", "Married", "Widowed", "Separated"]}
                value={formData.civilStatus}
                onChange={handleFieldChange}
                t={t}
              />
              <Field label="Email Address:" name="emailAddress" value={formData.emailAddress} onChange={handleFieldChange} t={t} />
            </div>

            <h3 className={`font-spartan text-4xl font-bold ${t.cardText} mt-8 mb-4`}>
              Address Information
            </h3>

            <div className="grid grid-cols-1 gap-4 text-left">
              <SelectField
                label="Purok/Zone:"
                name="purokZone"
                options={["Purok/Zone 1", "Purok/Zone 2", "Purok/Zone 3", "Purok/Zone 4"]}
                value={formData.purokZone}
                onChange={handleFieldChange}
                t={t}
              />
              <Field label="Street Address:" name="streetAddress" value={formData.streetAddress} onChange={handleFieldChange} t={t} />
            </div>

            <h3 className={`font-spartan text-4xl font-bold ${t.cardText} mt-8 mb-4`}>
              ID Details
            </h3>

            <div className="grid grid-cols-1 gap-4 text-left">
              <Field label="Emergency Contact Name:" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleFieldChange} t={t} />
              <Field label="Emergency Contact No.:" name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleFieldChange} t={t} />
              <SelectField
                label="Blood Type:"
                name="bloodType"
                options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
                value={formData.bloodType}
                onChange={handleFieldChange}
                t={t}
              />
            </div>

            <h3 className={`font-spartan text-4xl font-bold ${t.cardText} mt-8 mb-4`}>
              Supporting Documents
            </h3>

            <div>
              <label className={`font-kumbh text-2xl font-medium ${t.cardText} block mb-2`}>
                Upload Valid ID (Government-issued):
              </label>
              <div className="flex items-center gap-2">
                <button className="bg-green-500 hover:bg-green-600 text-white font-kumbh text-lg px-4 py-1.5 rounded-lg transition-colors">
                  Upload file
                </button>
                <span className={`font-kumbh text-xl ${t.subtleText}`}>File list</span>
              </div>
            </div>

            <div className="mt-8 space-y-2">
              <button
                onClick={() => setShowConfirmModal(true)}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-kumbh text-2xl py-3 rounded-full transition-colors"
              >
                Submit Barangay ID Request
              </button>
              <button
                onClick={() => setShowExitModal(true)}
                className={`w-full ${t.inputBg} ${t.cardText} font-kumbh text-2xl py-3 rounded-full`}
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`${t.cardBg} ${t.cardBorder} border rounded-2xl p-6`}>
              <h3 className={`font-spartan text-4xl font-bold ${t.cardText} mb-4`}>
                Service Information
              </h3>
              <p className={`font-kumbh text-3xl font-bold ${t.cardText}`}>Requirements:</p>
              <p className={`font-kumbh text-2xl ${t.cardText} mt-1`}>
                Valid ID, Proof of Billing,
                <br />
                Personal Appearance.
              </p>

              <p className={`font-kumbh text-3xl font-bold ${t.cardText} mt-4`}>Fees:</p>
              <p className={`font-kumbh text-2xl ${t.cardText} mt-1`}>₱20.00 (Voter)</p>
              <p className={`font-kumbh text-2xl ${t.cardText} mt-1`}>₱30.00 (Non-voter)</p>

              <p className={`font-kumbh text-3xl font-bold ${t.cardText} mt-4`}>Validity:</p>
              <p className={`font-kumbh text-2xl ${t.cardText} mt-1`}>1 Year</p>
            </div>

            <div className={`${t.cardBg} ${t.cardBorder} border rounded-2xl p-6`}>
              <h3 className={`font-spartan text-3xl font-bold ${t.cardText} mb-2`}>
                Need Help?
              </h3>
              <p className={`font-kumbh text-2xl ${t.cardText}`}>8-3663-198</p>
              <p className={`font-kumbh text-2xl ${t.cardText} mt-2`}>teamtolentino@gmail.com</p>
            </div>
          </div>
        </div>
      </div>

      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div className={`${t.cardBg} ${t.cardBorder} border rounded-2xl w-full max-w-md p-6 text-center`}>
            <div className="mx-auto mb-4 w-16 h-16 rounded-full border-4 border-amber-500 text-amber-500 flex items-center justify-center font-spartan text-4xl font-bold">
              !
            </div>
            <p className={`font-kumbh text-xl ${t.cardText}`}>
              Please fill out the necessary or changeable information.
            </p>
            <button
              onClick={() => setShowInfoModal(false)}
              className="mt-5 px-5 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-kumbh text-lg"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div className={`${t.cardBg} ${t.cardBorder} border rounded-2xl w-full max-w-md p-6 text-center`}>
            <div className="mx-auto mb-4 w-16 h-16 rounded-full border-4 border-red-500 text-red-500 flex items-center justify-center font-spartan text-4xl font-bold">
              ×
            </div>
            <h3 className={`font-spartan text-3xl font-bold ${t.cardText}`}>Do you want to exit?</h3>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setShowExitModal(false)}
                className={`px-5 py-2 rounded-lg ${t.inputBg} ${t.cardText} font-kumbh text-lg`}
              >
                No
              </button>
              <button
                onClick={handleExitPage}
                className="px-5 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-kumbh text-lg"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div className={`${t.cardBg} ${t.cardBorder} border rounded-2xl w-full max-w-md p-6`}>
            <h3 className={`font-spartan text-3xl font-bold ${t.cardText}`}>
              Confirm Submission
            </h3>
            <p className={`font-kumbh text-xl ${t.subtleText} mt-2`}>
              Please confirm that all information provided is correct.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className={`px-4 py-2 rounded-lg ${t.inputBg} ${t.cardText} font-kumbh text-lg`}
              >
                Cancel
              </button>
              <button
                onClick={handleOpenPreview}
                className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-kumbh text-lg"
              >
                Review
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div className={`${t.cardBg} ${t.cardBorder} border rounded-2xl w-full max-w-2xl p-6 max-h-[85vh] overflow-y-auto`}>
            <h3 className={`font-spartan text-3xl font-bold ${t.cardText}`}>Review Information</h3>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PreviewItem label="Full Name" value={formData.fullName} t={t} />
              <PreviewItem label="Contact Number" value={formData.contactNumber} t={t} />
              <PreviewItem label="Date of Birth" value={formData.dateOfBirth} t={t} />
              <PreviewItem label="Civil Status" value={formData.civilStatus} t={t} />
              <PreviewItem label="Email Address" value={formData.emailAddress} t={t} />
              <PreviewItem label="Purok/Zone" value={formData.purokZone} t={t} />
              <PreviewItem label="Street Address" value={formData.streetAddress} t={t} />
              <PreviewItem label="Emergency Contact Name" value={formData.emergencyContactName} t={t} />
              <PreviewItem label="Emergency Contact No." value={formData.emergencyContactNumber} t={t} />
              <PreviewItem label="Blood Type" value={formData.bloodType} t={t} />
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowPreviewModal(false)}
                className={`px-4 py-2 rounded-lg ${t.inputBg} ${t.cardText} font-kumbh text-lg`}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-kumbh text-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div className={`${t.cardBg} ${t.cardBorder} border rounded-2xl w-full max-w-md p-6 text-center`}>
            <div className="relative w-24 h-24 mx-auto mb-4">
              <span className="absolute inset-0 rounded-full bg-green-400/40 animate-ping" />
              <div className="relative w-24 h-24 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className={`font-spartan text-3xl font-bold ${t.cardText}`}>Requested Successfully!</h3>
            <button
              onClick={handleSuccessContinue}
              className="mt-5 px-5 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-kumbh text-lg"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Field = ({ label, type = "text", className = "", name, value, onChange, t }) => (
  <div className={`${className} text-left`}>
    <label className={`font-kumbh text-2xl font-medium ${t.cardText} block mb-1 text-left`}>
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full border ${t.cardBorder} rounded-xl px-3 py-2 text-xl font-kumbh ${t.inputBg} ${t.inputText} text-left`}
    />
  </div>
);

const SelectField = ({ label, options, name, value, onChange, t }) => (
  <div className="text-left">
    <label className={`font-kumbh text-2xl font-medium ${t.cardText} block mb-1 text-left`}>
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full border ${t.cardBorder} rounded-xl px-3 py-2 text-xl font-kumbh ${t.inputBg} ${t.inputText} text-left`}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

const PreviewItem = ({ label, value, t }) => (
  <div className={`border ${t.cardBorder} rounded-lg p-3 ${t.inputBg}`}>
    <p className={`font-kumbh text-sm ${t.subtleText}`}>{label}</p>
    <p className={`font-kumbh text-lg ${t.cardText}`}>{value || "-"}</p>
  </div>
);

export default Req_BIDPage;
