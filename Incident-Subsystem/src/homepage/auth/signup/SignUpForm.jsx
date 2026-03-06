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
  
  // --- LOGIC: STREET FILTERING ---
  const filteredStreets = useMemo(() => {
    if (!formData.purok || allStreets.length === 0) return [];
    return allStreets.filter((s) => s.purok_id?.toString() === formData.purok.toString());
  }, [formData.purok, allStreets]);

  // --- LOGIC: AUTO-RESET STREET IF PUROK CHANGES ---
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

  const handleHouseNumberChange = (e) => {
    const { name, value } = e.target;
    handleChange({ target: { name, value } });
  };

  // --- LOGIC: FILE UPLOAD ---
  const handleFile = (e, side) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Maximum file size is 5MB.");
        e.target.value = "";
        return;
      }
      if (previews[side]) URL.revokeObjectURL(previews[side]);
      const objectUrl = URL.createObjectURL(file);
      setPreviews(prev => ({ ...prev, [side]: objectUrl }));

      const fieldName = side === 'front' ? 'idFront' : 'idBack';
      handleChange({ target: { name: fieldName, value: file } });
    }
  };

  const commonProps = { formData, handleChange, isDarkMode, setStep };

  const handleConfirmSubmit = () => {
    setIsReviewOpen(false);
    handleSubmit();
  };

  // --- MAPPINGS ---
  const sectorLabels = { 1: "Solo Parent", 2: "PWD", 3: "Senior Citizen", 4: "LGBTQIA+", 5: "Kasambahay", 6: "OFW", 7: "General Population" };
  const maritalStatusLabels = { 1: "Single", 2: "Married", 3: "Living-In", 4: "Widowed", 5: "Separated", 6: "Divorced" };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  const fullName = [formData.firstName, formData.middleName, formData.lastName, formData.suffix]
    .filter(Boolean).join(" ").replace(/\s+/g, " ").trim();

  const selectedPurok = purokList.find((p) => p.id?.toString() === formData.purok?.toString());
  const selectedStreet = allStreets.find((s) => s.id?.toString() === formData.street?.toString());
  const purokLabel = selectedPurok ? (selectedPurok.name || `Purok ${selectedPurok.number}`) : "-";
  const streetLabel = selectedStreet?.name || "-";

  // REVIEW SECTIONS 
  const reviewSections = [
    {
      title: "Personal Information",
      rows: [
        { label: "Full Name", value: fullName || "-" },
        { label: "Birthdate", value: formatDate(formData.birthdate) },
        { label: "Age", value: formData.age ? `${formData.age} yrs old` : "-" },
        { label: "Gender", value: formData.gender || "-" },
        { label: "Marital Status", value: maritalStatusLabels[formData.maritalStatus] || "-" },
        { label: "Nationality", value: formData.nationality || "-" },
        { label: "Sector", value: sectorLabels[formData.sector] || "-" },
        { label: "Household Position", value: formData.householdPosition || "-" },
        { label: "Birth Registration", value: formData.birthRegistration || "-" },
        { label: "Voter Status", value: formData.isVoter ? "Yes" : "No" },
      ],
    },
    {
      title: "Residency & Housing Details",
      rows: [
        { label: "Residency Type", value: formData.residencyStatus || "-" },
        { label: "House No.", value: formData.houseNumber || "-" },
        { label: "Street", value: streetLabel },
        { label: "Purok", value: purokLabel },
        { label: "Housing Status", value: formData.tenureStatus || "-" }, 
        { label: "Wall Material", value: formData.wallMaterial || "-" }, 
        { label: "Roof Material", value: formData.roofMaterial || "-" }, 
      ],
    },
    {
      title: "Contact Information",
      rows: [
        { label: "Contact Number", value: formData.contact || "-" },
        { label: "Email Address", value: formData.email || "-" },
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
  ];

  return (
    <div className="space-y-6">
      {/* 1. STEP INDICATOR */}
      <div className="flex items-center justify-between mb-8 px-2 max-w-xl mx-auto">
        {[1, 2, 3, 4].map((num) => (
          <div key={num} className="flex items-center flex-1 last:flex-none">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black transition-all duration-500 
              ${step >= num ? 'bg-emerald-600 text-white shadow-lg scale-110' : 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600'}`}>
              {num}
            </div>
            {num < 4 && <div className={`h-[2px] flex-1 mx-2 ${step > num ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'}`} />}
          </div>
        ))}
      </div>

      {/* 2. STEPS */}
      <div className="min-h-[400px]">
        {step === 1 && <Step1PersonalInfo {...commonProps} />}
        {step === 2 && <Step2Address {...commonProps} addressExists={addressExists} streets={filteredStreets} purokList={purokList} handleHouseNumberChange={handleHouseNumberChange} />}
        {step === 3 && <Step3WorkEducation {...commonProps} />}
        {step === 4 && <Step4Upload {...commonProps} previews={previews} handleFile={handleFile} onReviewSubmit={() => setIsReviewOpen(true)} loading={loading} />}
      </div>

      {/* 3. REVIEW MODAL */}
      {isReviewOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border shadow-2xl p-6 sm:p-10 ${isDarkMode ? "bg-slate-900 border-white/10 text-white" : "bg-white border-black/10 text-slate-900"}`}>
            <div className="mb-8">
              <h3 className="text-3xl font-black uppercase tracking-tight">Review Your Data</h3>
              <p className="text-sm opacity-60">Paki-check kung tama lahat bago i-submit.</p>
            </div>

            <div className="space-y-8">
              {reviewSections.map((section) => (
                <div key={section.title}>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-4">{section.title}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {section.rows.map((row) => (
                      <div key={row.label} className={`p-4 rounded-2xl border ${isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-black/5"}`}>
                        <p className="text-[9px] font-black uppercase opacity-40 mb-1">{row.label}</p>
                        <p className="text-xs font-bold break-words">{row.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button onClick={() => setIsReviewOpen(false)} className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-slate-100 dark:bg-slate-800">Back to Edit</button>
              <button onClick={handleConfirmSubmit} className="flex-[2] py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-emerald-600 text-white">Confirm Submission</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SignupForm;