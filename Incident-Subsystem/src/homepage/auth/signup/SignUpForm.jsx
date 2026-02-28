import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Step1PersonalInfo from './Step1PersonalInfo';
import Step2Address from './Step2Address';
import Step3WorkEducation from './Step3WorkEducation';
import Step4Upload from './Step4Upload';

const SignupForm = ({ 
  formData, 
  handleChange, 
  isDarkMode, 
  handleSubmit, 
  loading = false,
  purokList = [], 
  allStreets = [],
  addressExists 
}) => {
  const [step, setStep] = useState(1);
  const [previews, setPreviews] = useState({ front: null, back: null });
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const filteredStreets = useMemo(() => {
    if (!formData.purok || allStreets.length === 0) return [];
    return allStreets.filter((s) => s.purok_id?.toString() === formData.purok.toString());
  }, [formData.purok, allStreets]);

  useEffect(() => {
    if (!formData.street || filteredStreets.length === 0) return;
    const isStillValid = filteredStreets.some((s) => s.id.toString() === formData.street?.toString());
    if (!isStillValid) {
      handleChange({ target: { name: 'street', value: '' } });
    }
  }, [filteredStreets, formData.street, handleChange]);

  useEffect(() => {
    if (step !== 4) setIsReviewOpen(false);
  }, [step]);

  // Keep house number as typed by the user.
  const handleHouseNumberChange = (e) => {
    const { name, value } = e.target;
    handleChange({ target: { name, value } });
  };

  // Handle File Upload & Previews
  const handleFile = (e, side) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Max size of file is 5MB only.");
        e.target.value = "";
        return;
      }
      if (previews[side]) URL.revokeObjectURL(previews[side]);
      setPreviews(prev => ({ ...prev, [side]: URL.createObjectURL(file) }));

      handleChange({ 
        target: { 
          name: side === 'front' ? 'idFront' : 'idBack', 
          files: [file] 
        } 
      });
    }
  };

  const commonProps = { formData, handleChange, isDarkMode, setStep };
  const handleConfirmSubmit = () => {
    // Close review overlay first so success modal is visible after submit.
    setIsReviewOpen(false);
    handleSubmit();
  };

  const sectorLabels = {
    1: "Solo Parent",
    2: "PWD",
    3: "Senior Citizen",
    4: "LGBTQIA+",
    5: "Kasambahay",
    6: "OFW",
    7: "General Population",
  };

  const maritalStatusLabels = {
    1: "Single",
    2: "Married",
    3: "Living-In",
    4: "Widowed",
    5: "Separated",
    6: "Divorced",
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  const fullName = [formData.firstName, formData.middleName, formData.lastName, formData.suffix]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  const selectedPurok = purokList.find((p) => p.id?.toString() === formData.purok?.toString());
  const selectedStreet = allStreets.find((s) => s.id?.toString() === formData.street?.toString());
  const purokLabel = selectedPurok ? (selectedPurok.name || `Purok ${selectedPurok.number}`) : formData.purok || "-";
  const streetLabel = selectedStreet?.name || formData.street || "-";

  const reviewSections = [
    {
      title: "Personal Information",
      rows: [
        { label: "Full Name", value: fullName || "-" },
        { label: "Birthdate", value: formatDate(formData.birthdate) },
        { label: "Age", value: formData.age ? `${formData.age} years old` : "-" },
        { label: "Gender", value: formData.gender || "-" },
        { label: "Marital Status", value: maritalStatusLabels[formData.maritalStatus] || "-" },
        { label: "Nationality", value: formData.nationality || "-" },
        { label: "Sector", value: sectorLabels[formData.sector] || "-" },
        { label: "Household Position", value: formData.householdPosition || "-" },
        { label: "Birth Registration", value: formData.birthRegistration || "-" },
        { label: "Registered Voter", value: formData.isVoter ? "Yes" : "No" },
      ],
    },
    {
  title: "Residency and Housing Details",
  rows: [
    { label: "Residency Type", value: formData.residencyStatus || "-" },
    { label: "House No.", value: formData.houseNumber || "-" },
    { label: "Street", value: streetLabel },
    { label: "Purok", value: purokLabel },
{ label: "Housing Status", value: formData.tenureStatus || "-" }, 
{ label: "Wall Material", value: formData.wallMaterial || "-" }, 
{ label: "Roof Material", value: formData.roofMaterial || "-" }, 
// { label: "Water Source", value: formData.water_source || "-" },
  ],
},
    {
      title: "Contact Information",
      rows: [
        { label: "Contact Number", value: formData.contact || "-" },
        { label: "Email", value: formData.email || "-" },
        // { label: "Username", value: formData.username || "-" },
      ],
    },
    {
      title: "Work and Education",
      rows: [
        { label: "Employment Status", value: formData.employmentStatus || "-" },
        { label: "Occupation", value: formData.occupation || "-" },
        { label: "Income Source", value: formData.incomeSource || "-" },
        { label: "Monthly Income", value: formData.monthlyIncome || "-" },
        { label: "Educational Status", value: formData.educationalStatus || "-" },
        { label: "School Type", value: formData.schoolType || "-" },
        { label: "School Level", value: formData.schoolLevel || "-" },
        { label: "Highest Grade", value: formData.highestGrade || "-" },
      ],
    },
    {
      title: "Uploaded Requirements",
      rows: [
        { label: "Front ID Uploaded", value: formData.idFront ? "Yes" : "No" },
        { label: "Back ID Uploaded", value: formData.idBack ? "Yes" : "No" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* STEP INDICATOR */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 px-0 sm:px-2">
        {[1, 2, 3, 4].map((num) => (
          <div key={num} className="flex items-center flex-1 last:flex-none">
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500 
              ${step >= num 
                ? 'bg-green-600 text-white shadow-lg scale-110' 
                : 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600'}`}>
              {num}
            </div>
            {num < 4 && (
              <div className={`h-[2px] flex-1 mx-1 sm:mx-2 transition-colors duration-500 ${step > num ? 'bg-green-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
            )}
          </div>
        ))}
      </div>

      {/* FORM STEPS CONTENT */}
      <div className="min-h-[300px]">
        {step === 1 && <Step1PersonalInfo {...commonProps} />}
        
        {step === 2 && (
  <Step2Address 
    {...commonProps} 
    addressExists={addressExists} 
    streets={filteredStreets} 
    purokList={purokList} 
    handleHouseNumberChange={handleHouseNumberChange} 
  />
)}
        
        {step === 3 && <Step3WorkEducation {...commonProps} />}
        
        {step === 4 && (
          <Step4Upload 
            {...commonProps} 
            previews={previews} 
            handleFile={handleFile} 
            onReviewSubmit={() => setIsReviewOpen(true)}
            loading={loading}
          />
        )}
      </div>

      {isReviewOpen && createPortal(
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl border p-5 sm:p-7 ${
            isDarkMode ? "bg-slate-900 border-white/10 text-white" : "bg-white border-black/10 text-slate-900"
          }`}>
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-2">Review Your Information</h3>
            <p className={`text-xs sm:text-sm mb-5 ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
              Confirm that all details are correct before final submission.
            </p>

            <div className="space-y-4">
              {reviewSections.map((section) => (
                <div
                  key={section.title}
                  className={`rounded-2xl border p-3 sm:p-4 ${isDarkMode ? "border-white/10 bg-slate-950/35" : "border-black/10 bg-slate-50/80"}`}
                >
                  <h4 className={`text-[11px] font-black uppercase tracking-[0.2em] mb-3 ${isDarkMode ? "text-emerald-400" : "text-emerald-700"}`}>
                    {section.title}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {section.rows.map((row) => (
                      <div key={`${section.title}-${row.label}`} className={`rounded-xl border p-3 ${isDarkMode ? "border-white/10" : "border-black/10"}`}>
                        <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                          {row.label}
                        </p>
                        <p className={`text-[11px] sm:text-xs font-bold break-words ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>
                          {row.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                disabled={loading}
                onClick={() => setIsReviewOpen(false)}
                className={`sm:flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border transition-colors ${
                  isDarkMode
                    ? "bg-slate-900 border-white/10 text-slate-200 hover:bg-slate-800"
                    : "bg-slate-100 border-black/10 text-slate-700 hover:bg-slate-200"
                } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                Back to Edit
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirmSubmit}
                className={`sm:flex-[1.35] py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-colors ${
                  loading
                    ? "bg-emerald-600 text-white opacity-70 cursor-not-allowed"
                    : "bg-emerald-700 text-white hover:bg-emerald-800"
                }`}
              >
                {loading ? "Submitting..." : "Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SignupForm;
