import React, { useState } from "react";
import "./FormSelectorModal.css";
import { useNavigate } from 'react-router-dom';

export default function FormSelectorModal({ onClose }) {
  const navigate = useNavigate();
  const [confirmForm, setConfirmForm] = useState(null);

  const handleCardClick = (formName, formPath) => {
    setConfirmForm({ name: formName, path: formPath });
  };

  const handleConfirm = () => {
    if (confirmForm) {
      onClose && onClose();
      navigate(confirmForm.path);
      setConfirmForm(null);
    }
  };

  const handleCancel = () => {
    setConfirmForm(null);
  };

  return (
    <div className="fsm-overlay" role="dialog" aria-modal="true">
      <div className="fsm-modal">
        <div className="fsm-header">
          <h2>Select a Form</h2>
          <button className="fsm-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="fsm-options">
          <div 
            className="fsm-option-card"
            onClick={() => handleCardClick("Request for Barangay ID", "/forms/request-barangay")}
          >
            <div className="fsm-option-icon" aria-hidden>
              <svg viewBox="0 0 64 64" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32 36c6.627 0 12-5.373 12-12S38.627 12 32 12 20 17.373 20 24s5.373 12 12 12z" stroke="#22c55e" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 52c0-8.837 10.745-16 24-16s24 7.163 24 16" stroke="#22c55e" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="fsm-option-body">
              <h3>Request for Barangay ID</h3>
              <p className="fsm-option-desc">Fill out the barangay ID request form.</p>
            </div>
          </div>

          <div 
            className="fsm-option-card"
            onClick={() => handleCardClick("Request for Certificate of Indigency", "/forms/request-indigency")}
          >
            <div className="fsm-option-icon" aria-hidden>
              <svg viewBox="0 0 64 64" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32 36c6.627 0 12-5.373 12-12S38.627 12 32 12 20 17.373 20 24s5.373 12 12 12z" stroke="#22c55e" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 52c0-8.837 10.745-16 24-16s24 7.163 24 16" stroke="#22c55e" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="fsm-option-body">
              <h3>Request for Certificate of Indigency</h3>
              <p className="fsm-option-desc">Fill out the certificate of indigency request form.</p>
            </div>
          </div>

          <div 
            className="fsm-option-card"
            onClick={() => handleCardClick("Request for Certificate of Residency", "/forms/request-residency")}
          >
            <div className="fsm-option-icon" aria-hidden>
              <svg viewBox="0 0 64 64" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32 36c6.627 0 12-5.373 12-12S38.627 12 32 12 20 17.373 20 24s5.373 12 12 12z" stroke="#22c55e" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 52c0-8.837 10.745-16 24-16s24 7.163 24 16" stroke="#22c55e" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="fsm-option-body">
              <h3>Request for Certificate of Residency</h3>
              <p className="fsm-option-desc">Fill out the certificate of residency request form.</p>
            </div>
          </div>
        </div>
      </div>

      {confirmForm && (
        <div className="fsm-confirmation-overlay">
          <div className="fsm-confirmation-modal">
            <h3>Confirm Your Selection</h3>
            <p>Are you sure you want to proceed with <strong>{confirmForm.name}</strong>?</p>
            <div className="fsm-confirmation-actions">
              <button className="btn-confirm" onClick={handleConfirm}>Yes, Proceed</button>
              <button className="btn-cancel-confirm" onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
