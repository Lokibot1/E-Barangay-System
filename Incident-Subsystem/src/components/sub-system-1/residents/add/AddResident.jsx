/**
 * AddResident.jsx
 *
 * FIX: handleFormSubmit now accepts and forwards the `overrides` argument.
 *
 * SignupForm calls: handleSubmit(e, { isIndigent })
 * Before:  handleFormSubmit(e)            → submitAdminEntry(e)
 *          ↑ overrides dropped here, isIndigent never reached the API
 * After:   handleFormSubmit(e, overrides) → submitAdminEntry(e, overrides)
 *          ↑ { isIndigent } flows through correctly
 */

import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SignupForm from '../../../../homepage/signup/SignUpForm';
import VerificationSuccessModal from '../../verification/modals/VerificationSuccessModal';
import MinimizedSuccessCard from '../../verification/MinimizedSuccessCard';
import { useAuthLogic } from '../../../../homepage/hooks/useAuthLogic';
import themeTokens from '../../../../Themetokens';

const AddResident = () => {
  const navigate = useNavigate();

  const {
    formData,
    setFormData,
    handleChange,
    submitAdminEntry,
    loading,
    authSuccess,
    setAuthSuccess,
    purokList,
    allStreets,
    addressExists,
    householdHeadData,
    addressSearch,
    setAddressSearch,
    addressSuggestions,
    isSearchingAddress,
    selectAddress,
  } = useAuthLogic();

  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem('appTheme') || 'blue'
  );

  const [isModalExpanded, setIsModalExpanded] = useState(false);

  useEffect(() => {
    if (authSuccess) setIsModalExpanded(true);
  }, [authSuccess]);

  useEffect(() => {
    const registerAutofill = () => {
      if (setFormData) {
        window.dispatchEvent(new CustomEvent('REGISTER_SETTER', { detail: setFormData }));
      }
    };
    registerAutofill();
    const timeoutId = setTimeout(registerAutofill, 500);
    return () => {
      clearTimeout(timeoutId);
      window.dispatchEvent(new CustomEvent('REGISTER_SETTER', { detail: null }));
    };
  }, [setFormData]);

  useEffect(() => {
    const handler = (e) => setCurrentTheme(e.detail);
    window.addEventListener('themeChange', handler);
    return () => window.removeEventListener('themeChange', handler);
  }, []);

  const t = themeTokens[currentTheme] || themeTokens.blue;

  const handleCloseModal = () => {
    setAuthSuccess(null);
    setIsModalExpanded(false);
    navigate('/admin/residents');
  };

  const handleMinimize = () => setIsModalExpanded(false);

  // FIX: Accept overrides as second param and forward to submitAdminEntry.
  // SignupForm calls handleSubmit(e, { isIndigent }) for staff + Head residents.
  // Without forwarding overrides, isIndigent was always 0 in the payload.
  const handleFormSubmit = async (e, overrides = {}) => {
    if (e?.preventDefault) e.preventDefault();
    await submitAdminEntry(e, overrides);
  };

  const getFormattedSuccessData = () => {
    if (!authSuccess) return null;
    return {
      name:  authSuccess.name  || 'N/A',
      id:    authSuccess.id    || 'N/A',
      user:  authSuccess.user  || 'N/A',
      pass:  authSuccess.pass  || 'N/A',
      token: authSuccess.token || '',
    };
  };

  return (
    <div className={`p-6 sm:p-8 min-h-screen ${t.pageBg} transition-colors duration-300 pb-24`}>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/residents')}
            className={`p-2 rounded-xl border ${t.cardBorder} ${t.cardBg} ${t.subtleText} hover:scale-105 active:scale-95 transition-all shadow-sm`}
            title="Back to List"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className={`text-2xl font-bold font-spartan ${t.cardText} uppercase tracking-tight`}>
              Resident Enrollment
            </h1>
            <p className={`text-[10px] ${t.subtleText} uppercase tracking-[0.2em] font-bold mt-1`}>
              System Administrator Module
            </p>
          </div>
        </div>

        {/* Form */}
        <div className={`${t.cardBg} border ${t.cardBorder} rounded-[2.5rem] shadow-2xl overflow-hidden`}>
          <div className="p-1 sm:p-8">
            <SignupForm
              isStaffMode={true}
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleFormSubmit}
              loading={loading}
              purokList={purokList}
              allStreets={allStreets}
              addressExists={addressExists}
              householdHeadData={householdHeadData}
              isDarkMode={currentTheme === 'dark'}
              addressSearch={addressSearch}
              setAddressSearch={setAddressSearch}
              addressSuggestions={addressSuggestions || []}
              isSearchingAddress={isSearchingAddress}
              selectAddress={selectAddress}
            />
          </div>
        </div>
      </div>

      {/* Expanded modal */}
      {authSuccess && isModalExpanded && (
        <VerificationSuccessModal
          isOpen={isModalExpanded}
          data={getFormattedSuccessData()}
          onClose={handleCloseModal}
          onMinimize={handleMinimize}
          t={t}
          currentTheme={currentTheme}
        />
      )}

      {/* Minimized floating card */}
      {authSuccess && !isModalExpanded && (
        <MinimizedSuccessCard
          data={getFormattedSuccessData()}
          onExpand={() => setIsModalExpanded(true)}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default AddResident;