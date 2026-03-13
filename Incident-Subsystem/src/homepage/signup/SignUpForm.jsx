/**
 * SignupForm.jsx
 *
 * FIX 1 — Step 3 "Next" routing (public registration bug):
 *   BEFORE: onNext={() => setIsReviewOpen(true)}  ← palagi, kahit public
 *   AFTER:  onNext={() => isStaffMode ? setIsReviewOpen(true) : setStep(4)}
 *   Public users can now reach Step 4 (upload) correctly.
 *
 * FIX 2 — isIndigent not reaching backend:
 *   BEFORE: handleChange({ name: 'isIndigent', value }) + setTimeout(submit)
 *           → React state flush is async; submitAdminEntry reads stale formData
 *   AFTER:  handleSubmit(e, { isIndigent }) — value passed as direct override,
 *           merged synchronously inside useAuthLogic before the API call.
 *   No setTimeout. No race condition.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Step1PersonalInfo from './Step1PersonalInfo';
import Step2Address from './Step2Address';
import Step3WorkEducation from './Step3WorkEducation';
import Step4Upload from './Step4Upload';
import ScreenLoader from '../../components/shared/ScreenLoader';

const SignupForm = ({
  formData,
  handleChange,
  isDarkMode,
  handleSubmit,       // (e, overrides?) — staff mode passes { isIndigent }
  loading = false,
  purokList = [],
  allStreets = [],
  addressExists,
  householdHeadData,
  isStaffMode = false,
  addressSearch,
  setAddressSearch,
  addressSuggestions = [],
  isSearchingAddress,
  selectAddress,
  compactMode = false,
}) => {
  const [step,         setStep]         = useState(1);
  const [previews,     setPreviews]     = useState({ front: null, back: null });
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // ── Indigency (staff + Head only) ─────────────────────────────────────────
  const isHead = formData.householdPosition === 'Head' || formData.householdPosition === 'Head of Family';
  const [isIndigent, setIsIndigent] = useState(0);

  useEffect(() => {
    if (!isHead) setIsIndigent(0);
  }, [isHead]);

  // ── Street filtering ───────────────────────────────────────────────────────
  const filteredStreets = useMemo(() => {
    if (!formData.purok || allStreets.length === 0) return [];
    return allStreets.filter((s) => s.purok_id?.toString() === formData.purok.toString());
  }, [formData.purok, allStreets]);

  useEffect(() => {
    if (!formData.street || filteredStreets.length === 0) return;
    const still = filteredStreets.some((s) => s.id.toString() === formData.street?.toString());
    if (!still) handleChange({ target: { name: 'street', value: '' } });
  }, [filteredStreets, formData.street, handleChange]);

  // ── File handler ───────────────────────────────────────────────────────────
  const handleHouseNumberChange = (e) =>
    handleChange({ target: { name: e.target.name, value: e.target.value } });

  const processSelectedFile = (file, side) => {
    if (isStaffMode) return;
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Maximum file size is 5MB.');
      return;
    }
    if (previews[side]) URL.revokeObjectURL(previews[side]);
    const url = URL.createObjectURL(file);
    setPreviews((prev) => ({ ...prev, [side]: url }));
    handleChange({ target: { name: side === 'front' ? 'idFront' : 'idBack', value: file } });
  };

  const handleFile = (e, side) => {
    processSelectedFile(e.target.files[0], side);
    if (e.target) e.target.value = '';
  };

  const handleCapturedFile = (file, side) => {
    processSelectedFile(file, side);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  // FIX 2: Pass isIndigent as a direct override argument — not via handleChange.
  // useAuthLogic.submitAdminEntry(e, overrides) merges overrides synchronously
  // before calling authService.adminEntry(), so the value is always current.
  const handleConfirmSubmit = (e) => {
    if (e?.preventDefault) e.preventDefault();
    setIsReviewOpen(false);
    if (isStaffMode && isHead) {
      handleSubmit(e, { isIndigent });
    } else {
      handleSubmit(e);
    }
  };

  // ── Label maps ─────────────────────────────────────────────────────────────
  const sectorLabels  = { 1:'Solo Parent', 2:'PWD', 3:'Senior Citizen', 4:'LGBTQIA+', 5:'Kasambahay', 6:'OFW', 7:'General Population' };
  const maritalLabels = { 1:'Single', 2:'Married', 3:'Living-In', 4:'Widowed', 5:'Separated', 6:'Divorced' };
  const incomeLabels  = {
    'No Income':'No Income','Below 5,000':'Below ₱5,000','5,001-10,000':'₱5,001–10,000',
    '10,001-20,000':'₱10,001–20,000','20,001-40,000':'₱20,001–40,000','40,001-70,000':'₱40,001–70,000',
    '70,001-100,000':'₱70,001–100,000','Above 100,000':'Above ₱100,000',
  };
  const formatDate = (v) => {
    if (!v) return '—';
    const d = new Date(v);
    return isNaN(d.getTime()) ? v : d.toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' });
  };
  const val = (v) => v || '—';

  const fullName    = [formData.firstName, formData.middleName, formData.lastName, formData.suffix].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
  const selPurok    = purokList.find((p)  => p.id?.toString() === formData.purok?.toString());
  const selStreet   = allStreets.find((s) => s.id?.toString() === formData.street?.toString());
  const purokLabel  = selPurok  ? (selPurok.name  || `Purok ${selPurok.number}`)  : '—';
  const streetLabel = selStreet ? selStreet.name : '—';

  const reviewSections = [
    { title:'Personal Information', rows:[
      { label:'Full Name',          value: val(fullName) },
      { label:'Birthdate',          value: formatDate(formData.birthdate) },
      { label:'Age',                value: val(formData.age) },
      { label:'Gender',             value: val(formData.gender) },
      { label:'Civil Status',       value: val(maritalLabels[formData.maritalStatus]) },
      { label:'Nationality',        value: val(formData.nationality) },
      { label:'Sector',             value: val(sectorLabels[formData.sector]) },
      { label:'Birth Registration', value: val(formData.birthRegistration) },
      { label:'Registered Voter',   value: formData.isVoter ? 'Yes' : 'No' },
    ]},
    { title:'Contact Information', rows:[
      { label:'Contact Number', value: val(formData.contact) },
      { label:'Email Address',  value: val(formData.email) },
    ]},
    { title:'Address & Residency', rows:[
      { label:'Purok',                  value: purokLabel },
      { label:'Street',                 value: streetLabel },
      { label:'House No.',              value: val(formData.houseNumber) },
      { label:'Household Position',     value: val(formData.householdPosition) },
      { label:'Residency Type',         value: val(formData.residencyStatus) },
      { label:'Date Started Residency', value: formatDate(formData.residencyStartDate) },
      ...(isHead && !addressExists ? [
        { label:'Housing Status', value: val(formData.tenureStatus) },
        { label:'Wall Material',  value: val(formData.wallMaterial) },
        { label:'Roof Material',  value: val(formData.roofMaterial) },
      ] : []),
    ]},
    { title:'Education', rows:[
      { label:'Educational Status', value: val(formData.educationalStatus) },
      { label:'School Type',        value: val(formData.schoolType) },
      { label:'School Level',       value: val(formData.schoolLevel) },
      { label:'Highest Grade',      value: val(formData.highestGrade) },
    ]},
    { title:'Employment & Income', rows:[
      { label:'Work Status',    value: val(formData.employmentStatus) },
      { label:'Occupation',     value: val(formData.occupation) },
      { label:'Income Source',  value: val(formData.incomeSource) },
      { label:'Monthly Income', value: val(incomeLabels[formData.monthlyIncome] || formData.monthlyIncome) },
    ]},
    ...(isStaffMode && isHead ? [{
      title:'Household Classification',
      rows:[{ label:'Indigent Status', value: isIndigent ? 'Indigent' : 'Non-Indigent' }],
    }] : []),
  ];

  const commonProps = { formData, handleChange, isDarkMode, setStep, isStaffMode };

  return (
    <div className={compactMode ? "space-y-4" : "space-y-6"}>
      <ScreenLoader
        show={loading}
        title={isStaffMode ? "Saving Resident" : "Submitting Registration"}
        description={isStaffMode
          ? "Creating the resident profile. Please wait."
          : "Sending your registration details. Please wait."}
      />

      {/* Step indicator */}
      <div className={`flex items-center justify-between px-2 max-w-xl mx-auto ${compactMode ? "mb-5" : "mb-8"}`}>
        {(isStaffMode ? [1,2,3] : [1,2,3,4]).map((num) => (
          <div key={num} className="flex items-center flex-1 last:flex-none">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black transition-all duration-500
              ${step >= num ? 'bg-emerald-600 text-white shadow-lg scale-110' : 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600'}`}>
              {num}
            </div>
            {num < (isStaffMode ? 3 : 4) && (
              <div className={`h-[2px] flex-1 mx-2 transition-colors duration-500 ${step > num ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className={compactMode ? "min-h-0" : "min-h-[400px]"}>
        {step === 1 && <Step1PersonalInfo {...commonProps} />}

        {step === 2 && (
          <Step2Address
            {...commonProps}
            addressExists={addressExists}
            householdHeadData={householdHeadData}
            streets={filteredStreets}
            purokList={purokList}
            handleHouseNumberChange={handleHouseNumberChange}
            addressSearch={addressSearch}
            setAddressSearch={setAddressSearch}
            addressSuggestions={addressSuggestions}
            isSearchingAddress={isSearchingAddress}
            selectAddress={selectAddress}
          />
        )}

        {step === 3 && (
          <Step3WorkEducation
            {...commonProps}
            // FIX 1: Staff → open review; Public → go to Step 4
            onNext={() => isStaffMode ? setIsReviewOpen(true) : setStep(4)}
            isHead={isHead}
            isIndigent={isIndigent}
            setIsIndigent={setIsIndigent}
          />
        )}

        {/* Step 4 only exists for public registration */}
        {!isStaffMode && step === 4 && (
          <Step4Upload
            {...commonProps}
            previews={previews}
            handleFile={handleFile}
            handleCapturedFile={handleCapturedFile}
            onReviewSubmit={() => setIsReviewOpen(true)}
            loading={loading}
          />
        )}
      </div>

      {/* Review Modal */}
      {isReviewOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border shadow-2xl p-6 sm:p-10 ${
            isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-black/10 text-slate-900'
          }`}>

            <div className="mb-8">
              <h3 className="text-3xl font-black uppercase tracking-tight">
                {isStaffMode ? 'Finalize Registration' : 'Review Details'}
              </h3>
              <p className="text-sm opacity-60 mt-1">
                Pakisuri ang lahat ng impormasyon bago i-save sa system.
              </p>
            </div>

            <div className="space-y-8 text-left">
              {reviewSections.map((section) => (
                <div key={section.title}>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-4">
                    {section.title}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {section.rows.map((row) => (
                      <div key={row.label} className={`p-4 rounded-2xl border ${
                        isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-black/5'
                      }`}>
                        <p className="text-[9px] font-black uppercase opacity-40 mb-1">{row.label}</p>
                        <p className="text-xs font-bold break-words">{row.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {!isStaffMode && (previews.front || previews.back) && (
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-4">
                    Identification Documents
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {['front','back'].map((side) => previews[side] ? (
                      <div key={side} className={`rounded-2xl overflow-hidden border ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
                        <img src={previews[side]} alt={`ID ${side}`} className="w-full h-36 object-cover" loading="lazy" />
                        <p className={`text-center text-[9px] font-black uppercase tracking-widest py-2 ${
                          isDarkMode ? 'bg-white/5 text-slate-400' : 'bg-slate-50 text-slate-400'
                        }`}>{side === 'front' ? 'Front' : 'Back'} Side</p>
                      </div>
                    ) : null)}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => { setIsReviewOpen(false); if (!isStaffMode) setStep(4); }}
                className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-slate-100 dark:bg-slate-800 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirmSubmit}
                disabled={loading}
                className={`flex-[2] py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white transition-colors ${
                  loading ? 'bg-slate-400' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {loading ? 'Saving...' : isStaffMode ? 'Confirm & Register' : 'Submit Registration'}
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
