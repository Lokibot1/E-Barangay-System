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
import { Briefcase, Check, MapPin, Search, Upload, User } from 'lucide-react';
import Step1PersonalInfo from './Step1PersonalInfo';
import Step2Address from './Step2Address';
import Step3WorkEducation from './Step3WorkEducation';
import Step4Upload from './Step4Upload';
import ScreenLoader from '../../components/shared/ScreenLoader';
import ImageZoomOverlay from '../../components/sub-system-1/common/ImageZoomOverlay';

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
  currentTheme = 'modern',
  onReviewOpenChange,
}) => {
  const [step,         setStep]         = useState(1);
  const [previews,     setPreviews]     = useState({ front: null, back: null });
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [zoomedReviewImage, setZoomedReviewImage] = useState(null);

  useEffect(() => {
    if (!onReviewOpenChange) return;

    onReviewOpenChange(isReviewOpen);
  }, [isReviewOpen, onReviewOpenChange]);

  useEffect(() => {
    if (!onReviewOpenChange) return undefined;

    return () => onReviewOpenChange(false);
  }, [onReviewOpenChange]);

  // ── Indigency (staff + Head only) ─────────────────────────────────────────
  const isHead = formData.householdPosition === 'Head' || formData.householdPosition === 'Head of Family';
  const [isIndigent, setIsIndigent] = useState(0);

  useEffect(() => {
    if (!isHead) setIsIndigent(0);
  }, [isHead]);

  const accentMap = {
    modern: {
      text: 'text-blue-600',
      activeCard: 'border-blue-200 bg-blue-50/80 shadow-[0_18px_35px_rgba(37,99,235,0.14)]',
      completedCard: 'border-blue-200 bg-blue-50/40',
      activeIcon: 'bg-blue-600 text-white',
      completedIcon: 'bg-blue-100 text-blue-700',
      reviewHeading: 'text-blue-600',
      primaryButton: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    blue: {
      text: 'text-blue-600',
      activeCard: 'border-blue-200 bg-blue-50/80 shadow-[0_18px_35px_rgba(37,99,235,0.14)]',
      completedCard: 'border-blue-200 bg-blue-50/40',
      activeIcon: 'bg-blue-600 text-white',
      completedIcon: 'bg-blue-100 text-blue-700',
      reviewHeading: 'text-blue-600',
      primaryButton: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    purple: {
      text: 'text-purple-600',
      activeCard: 'border-purple-200 bg-purple-50/80 shadow-[0_18px_35px_rgba(124,58,237,0.16)]',
      completedCard: 'border-purple-200 bg-purple-50/40',
      activeIcon: 'bg-purple-600 text-white',
      completedIcon: 'bg-purple-100 text-purple-700',
      reviewHeading: 'text-purple-600',
      primaryButton: 'bg-purple-600 hover:bg-purple-700 text-white',
    },
    green: {
      text: 'text-emerald-600',
      activeCard: 'border-emerald-200 bg-emerald-50/80 shadow-[0_18px_35px_rgba(5,150,105,0.16)]',
      completedCard: 'border-emerald-200 bg-emerald-50/40',
      activeIcon: 'bg-emerald-600 text-white',
      completedIcon: 'bg-emerald-100 text-emerald-700',
      reviewHeading: 'text-emerald-600',
      primaryButton: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    dark: {
      text: 'text-slate-200',
      activeCard: 'border-slate-700 bg-slate-900/80 shadow-[0_18px_35px_rgba(15,23,42,0.4)]',
      completedCard: 'border-slate-700 bg-slate-900/50',
      activeIcon: 'bg-slate-100 text-slate-900',
      completedIcon: 'bg-slate-800 text-slate-200',
      reviewHeading: 'text-slate-200',
      primaryButton: 'bg-slate-100 hover:bg-white text-slate-900',
    },
  };

  const accent = accentMap[currentTheme] || accentMap.modern;
  const mutedTextClass = isDarkMode ? 'text-slate-400' : 'text-slate-600';
  const activeStepMaskClass = isDarkMode ? 'bg-slate-900' : 'bg-white';
  const inactiveStepLineClass = isDarkMode ? 'bg-slate-800' : 'bg-slate-200';
  const inactiveStepNodeClass = isDarkMode
    ? 'border-slate-700 bg-slate-900 text-slate-500'
    : 'border-slate-200 bg-slate-100 text-slate-400';
  const stepAccentMap = {
    modern: {
      line: 'bg-blue-400',
      completedNode: 'border-blue-200 bg-blue-100 text-blue-600',
      activeOuter: 'border-blue-300 bg-white ring-4 ring-blue-100/80',
      activeInner: 'bg-blue-500 text-white',
    },
    blue: {
      line: 'bg-blue-400',
      completedNode: 'border-blue-200 bg-blue-100 text-blue-600',
      activeOuter: 'border-blue-300 bg-white ring-4 ring-blue-100/80',
      activeInner: 'bg-blue-500 text-white',
    },
    purple: {
      line: 'bg-purple-400',
      completedNode: 'border-purple-200 bg-purple-100 text-purple-600',
      activeOuter: 'border-purple-300 bg-white ring-4 ring-purple-100/80',
      activeInner: 'bg-purple-500 text-white',
    },
    green: {
      line: 'bg-emerald-400',
      completedNode: 'border-emerald-200 bg-emerald-100 text-emerald-600',
      activeOuter: 'border-emerald-300 bg-white ring-4 ring-emerald-100/80',
      activeInner: 'bg-emerald-500 text-white',
    },
    dark: {
      line: 'bg-slate-300',
      completedNode: 'border-slate-600 bg-slate-800 text-slate-100',
      activeOuter: 'border-slate-400 bg-slate-950 ring-4 ring-white/10',
      activeInner: 'bg-slate-100 text-slate-900',
    },
  };
  const stepAccent = stepAccentMap[currentTheme] || stepAccentMap.modern;

  const workflowSteps = isStaffMode
    ? [
        {
          number: 1,
          title: 'Personal Profile',
          caption: 'Identity, birth data, and contact details.',
          description:
            'Capture the resident’s core identity records, contact information, and personal profile before proceeding to household intake.',
          icon: User,
        },
        {
          number: 2,
          title: 'Address & Household',
          caption: 'Residency, location, and housing survey.',
          description:
            'Match the resident to an existing household or create a new one with residency classification and housing details.',
          icon: MapPin,
        },
        {
          number: 3,
          title: 'Socio-Economic Review',
          caption: 'Education, work, and final confirmation.',
          description:
            'Complete education and livelihood details, then review the full record before it is saved to the Sub 1 registry.',
          icon: Briefcase,
        },
      ]
    : [
        {
          number: 1,
          title: 'Personal Info',
          caption: 'Basic resident identity details.',
          description:
            'Provide your personal details, contact information, and birth records to start the registration process.',
          icon: User,
        },
        {
          number: 2,
          title: 'Address',
          caption: 'Current residency and household data.',
          description:
            'Add your barangay address, residency type, and household information for validation.',
          icon: MapPin,
        },
        {
          number: 3,
          title: 'Work & Education',
          caption: 'Socio-economic profile.',
          description:
            'Share your education, occupation, and income information to complete the resident profile.',
          icon: Briefcase,
        },
        {
          number: 4,
          title: 'Uploads',
          caption: 'Supporting document submission.',
          description:
            'Upload the required identification documents before submitting your registration for review.',
          icon: Upload,
        },
      ];

  const confirmButtonClass = loading
    ? (isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-300 text-white')
    : accent.primaryButton;

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
        { label: 'No. of Families', value: formData.numberOfFamilies || '1' },
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
    <div className={compactMode ? "space-y-3" : "space-y-6"}>
      <ScreenLoader
        show={loading}
        title={isStaffMode ? "Saving Resident" : "Submitting Registration"}
        description={isStaffMode
          ? "Creating the resident profile. Please wait."
          : "Sending your registration details. Please wait."}
      />
      <ImageZoomOverlay
        isOpen={!!zoomedReviewImage}
        imgSrc={zoomedReviewImage}
        onClose={() => setZoomedReviewImage(null)}
      />

      {isStaffMode && (
        <div className="px-1 py-1">
          <div className="overflow-x-auto pb-1">
            <div className="mx-auto flex min-w-[640px] items-start">
              {workflowSteps.map(({ number, title, icon: Icon }, index) => {
                const isActive = number === step;
                const isCompleted = number < step;

                return (
                  <div
                    key={number}
                    className="relative flex flex-1 flex-col items-center px-2 text-center"
                  >
                    <div className="relative flex h-14 w-full items-center justify-center">
                      {index > 0 && (
                        <span
                          className={`absolute left-0 right-1/2 top-1/2 h-[2px] -translate-y-1/2 rounded-full transition-colors ${
                            isActive ? 'mr-[30px]' : 'mr-6'
                          } ${
                            step >= number ? stepAccent.line : inactiveStepLineClass
                          }`}
                        />
                      )}
                      {index < workflowSteps.length - 1 && (
                        <span
                          className={`absolute left-1/2 right-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full transition-colors ${
                            isActive ? 'ml-[30px]' : 'ml-6'
                          } ${
                            step > number ? stepAccent.line : inactiveStepLineClass
                          }`}
                        />
                      )}

                      <div className="relative z-10">
                        {isActive ? (
                          <div className={`rounded-full p-1.5 ${activeStepMaskClass}`}>
                            <div
                              className={`flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed shadow-[0_16px_28px_-18px_rgba(15,23,42,0.45)] ${stepAccent.activeOuter}`}
                            >
                              <div
                                className={`flex h-9 w-9 items-center justify-center rounded-full ${stepAccent.activeInner}`}
                              >
                                <Icon size={16} />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                              isCompleted ? stepAccent.completedNode : inactiveStepNodeClass
                            }`}
                          >
                            {isCompleted ? <Check size={15} className="stroke-[2.5]" /> : <Icon size={15} />}
                          </div>
                        )}
                      </div>
                    </div>

                    <p
                      className={`mt-2.5 flex min-h-[2.2rem] max-w-[11rem] items-start justify-center text-[12px] font-medium leading-[1.1rem] font-kumbh ${
                        isDarkMode ? 'text-slate-100' : 'text-slate-900'
                      }`}
                    >
                      {title}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {!isStaffMode && (
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
      )}

      {/* Step content */}
      <div
        className={`${compactMode ? "min-h-0" : "min-h-[400px]"} ${
          isStaffMode
            ? (isDarkMode
                ? 'rounded-[24px] border border-slate-800 bg-slate-950/10 p-3.5 sm:p-4 lg:p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]'
                : 'rounded-[24px] border border-slate-200 bg-white p-3.5 sm:p-4 lg:p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]')
            : ''
        }`}
      >
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
              <h3 className="text-3xl font-black uppercase tracking-tight font-spartan">
                {isStaffMode ? 'Finalize Registration' : 'Review Details'}
              </h3>
              <p className="text-sm opacity-60 mt-1 font-kumbh">
                Pakisuri ang lahat ng impormasyon bago i-save sa system.
              </p>
            </div>

            <div className="space-y-8 text-left">
              {reviewSections.map((section) => (
                <div key={section.title}>
                  <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 font-kumbh ${accent.reviewHeading}`}>
                    {section.title}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {section.rows.map((row) => (
                      <div key={row.label} className={`p-4 rounded-2xl border ${
                        isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-black/5'
                      }`}>
                        <p className="text-[9px] font-black uppercase opacity-40 mb-1 font-kumbh">{row.label}</p>
                        <p className="text-xs font-bold break-words font-kumbh">{row.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {!isStaffMode && (previews.front || previews.back) && (
                <div>
                  <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 font-kumbh ${accent.reviewHeading}`}>
                    Identification Documents
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {['front','back'].map((side) => previews[side] ? (
                      <div key={side} className={`group relative rounded-2xl overflow-hidden border ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
                        <button
                          type="button"
                          onClick={() => setZoomedReviewImage(previews[side])}
                          className={`relative block w-full h-36 overflow-hidden ${isDarkMode ? 'bg-slate-950/70' : 'bg-white'}`}
                          title={`Zoom ${side} image`}
                        >
                          <img
                            src={previews[side]}
                            alt={`ID ${side}`}
                            className="w-full h-full object-contain object-center"
                            loading="lazy"
                          />
                          <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-slate-950/70 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-lg">
                            <Search size={10} />
                            Zoom
                          </span>
                          <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
                            <span className="rounded-xl bg-sky-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                              View Full
                            </span>
                          </span>
                        </button>
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
                className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest font-kumbh bg-slate-100 dark:bg-slate-800 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirmSubmit}
                disabled={loading}
                className={`flex-[2] py-4 rounded-2xl font-black text-xs uppercase tracking-widest font-kumbh transition-colors ${confirmButtonClass}`}
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
