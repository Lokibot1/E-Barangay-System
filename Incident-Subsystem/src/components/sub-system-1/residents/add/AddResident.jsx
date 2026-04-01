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
 *
 * CHANGED: Added Toast for submit success and error feedback.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SignupForm from '../../../../homepage/signup/SignUpForm';
import VerificationSuccessModal from '../../verification/modals/VerificationSuccessModal';
import MinimizedSuccessCard from '../../verification/MinimizedSuccessCard';
import Toast from '../../../shared/modals/Toast';
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

  // ── Toast state ───────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((toast) => {
    setToasts((prev) => [...prev, { ...toast, id: Date.now() }]);
  }, []);
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

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
  const isDarkMode = currentTheme === 'dark';
  const accentHexMap = {
    modern: '#2563eb',
    blue: '#2563eb',
    purple: '#7c3aed',
    green: '#059669',
    dark: '#94a3b8',
  };
  const accentHex = accentHexMap[currentTheme] || accentHexMap.modern;

  const handleCloseModal = () => {
    setAuthSuccess(null);
    setIsModalExpanded(false);
    navigate('/admin/residents');
  };

  const handleMinimize = () => setIsModalExpanded(false);

  // FIX: Accept overrides as second param and forward to submitAdminEntry.
  // CHANGED: Wrapped in try/catch to show toast on error.
  const handleFormSubmit = async (e, overrides = {}) => {
    if (e?.preventDefault) e.preventDefault();
    try {
      await submitAdminEntry(e, overrides);
      // Success toast — brief, modal takes over immediately
      addToast({
        type: 'success',
        title: 'Resident Enrolled',
        message: 'The resident profile has been created successfully.',
        duration: 3000,
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Enrollment Failed',
        message: err.message || 'Failed to add resident. Please try again.',
        duration: 5000,
      });
    }
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
    <div className={`font-sans min-h-screen py-2 pb-16 px-3 sm:px-4 lg:px-4 relative ${t.pageBg} transition-colors duration-300`}>

      {/* ── TOAST ──────────────────────────────────────────────────────────── */}
      <Toast toasts={toasts} onRemove={removeToast} currentTheme={currentTheme} />

      <div className="mx-auto w-full max-w-[1600px] space-y-3 pt-1 sm:pt-2">

        <section className="flex flex-col items-start space-y-7">
          <button
            onClick={() => navigate('/admin/residents')}
            className={`inline-flex self-start h-9 w-9 items-center justify-center rounded-[14px] border ${t.cardBorder} ${t.cardBg} ${t.subtleText} shadow-[0_8px_16px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 active:scale-[0.98]`}
            title="Back to Residents"
          >
            <ArrowLeft size={17} />
          </button>

          <div className="w-full max-w-3xl self-center space-y-1 text-center">
            <h1 className={`text-[1.4rem] sm:text-[1.5rem] font-bold tracking-tight ${t.cardText} font-spartan`}>
              Resident Registration
            </h1>
            <p className={`mx-auto max-w-2xl text-[13px] leading-[1.8] ${t.subtleText} font-kumbh`}>
              Create and save a resident profile in one guided workflow.
            </p>
          </div>
        </section>

        {/* Header */}
        <div className="hidden">
          <button
            onClick={() => navigate('/admin/residents')}
            className={`p-2 rounded-xl border ${t.cardBorder} ${t.cardBg} ${t.subtleText} hover:scale-105 active:scale-95 transition-all shadow-sm`}
            title="Back to List"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className={`text-2xl font-bold font-spartan ${t.cardText} uppercase tracking-tight`}>
              Resident Registration
            </h1>
            <p className={`text-[10px] ${t.subtleText} uppercase tracking-[0.2em] font-bold mt-1`}>
              System Administrator Module
            </p>
          </div>
        </div>

        {/* Form */}
        <div className={`${t.cardBg} border ${t.cardBorder} rounded-[28px] shadow-[0_14px_34px_rgba(15,23,42,0.08)] overflow-visible`}>
          <div className="p-4 sm:p-5 lg:p-6">
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
              isDarkMode={isDarkMode}
              addressSearch={addressSearch}
              setAddressSearch={setAddressSearch}
              addressSuggestions={addressSuggestions || []}
              isSearchingAddress={isSearchingAddress}
              selectAddress={selectAddress}
              compactMode={true}
              currentTheme={currentTheme}
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

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .full-input-sm {
              width: 100%;
              min-height: 2.8rem;
              padding: 0.72rem 0.92rem;
              border: 1.5px solid ${isDarkMode ? "rgba(100,116,139,0.45)" : "rgba(148,163,184,0.32)"};
              border-radius: 16px;
              background: ${isDarkMode ? "rgba(15,23,42,0.82)" : "rgba(255,255,255,0.98)"};
              color: ${isDarkMode ? "#f8fafc" : "#0f172a"};
              outline: none;
              transition: border-color .2s ease, box-shadow .2s ease, background-color .2s ease;
              font-size: 0.82rem;
              font-weight: 400;
              letter-spacing: 0.01em;
              line-height: 1.2;
              box-sizing: border-box;
              display: block;
              box-shadow: ${isDarkMode ? "none" : "0 10px 24px rgba(15,23,42,0.06)"};
            }
            .full-input-sm::placeholder {
              color: ${isDarkMode ? "rgba(148,163,184,0.78)" : "rgba(100,116,139,0.85)"};
              font-weight: 400;
            }
            .full-input-sm:focus {
              border-color: ${accentHex};
              box-shadow: 0 0 0 4px ${isDarkMode ? "rgba(148,163,184,0.16)" : `${accentHex}1F`};
            }
            select.full-input-sm {
              cursor: pointer;
            }
            input[type="date"].full-input-sm {
              padding-right: 0.8rem;
            }
          `,
        }}
      />
    </div>
  );
};

export default AddResident;
