import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './User_Req_Success.css';

export default function User_Req_Success() {
  const navigate = useNavigate();
  const location = useLocation();
  const formType = location.state?.formType || 'Barangay ID';

  const handleReturnHome = () => {
    navigate('/');
  };

  const handleTrackStatus = () => {
    navigate('/request-tracking', { state: { formType } });
  };

  return (
    <section className="request-success py-12 bg-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="breadcrumb mb-6">
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Home</a>
          <span>&gt;</span>
          <span>Request Submitted</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="card p-12 text-center">
              <div className="success-icon">
                <svg viewBox="0 0 100 100" width="120" height="120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="50" fill="#22c55e" />
                  <path d="M35 50L45 60L65 40" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <h1 className="font-bold text-3xl mb-3 mt-6">Request Submitted Successfully</h1>
              <p className="text-gray-600 mb-8">Your application for {formType} has been received and is currently under review.</p>

              <div className="request-summary">
                <h3 className="font-bold text-xl mb-4 text-left">Request Summary</h3>
                <div className="summary-item">
                  <strong>Reference Number:</strong>
                  <span>XXXX-XX99-619</span>
                </div>
                <div className="summary-item">
                  <strong>Date Submitted:</strong>
                  <span>February 7, 2026</span>
                </div>
                <div className="summary-item">
                  <strong>Document Type:</strong>
                  <span>{formType}</span>
                </div>
                <div className="summary-item">
                  <strong>Applicants Name:</strong>
                  <span>[Given Name]</span>
                </div>
              </div>

              <p className="text-gray-600 text-sm mt-8 mb-8">Please wait for an email notification regarding the status of your request. You may also track its progress.</p>

              <div className="button-group">
                <button className="btn-track" onClick={handleTrackStatus}>Track Request Status</button>
                <button className="btn-return" onClick={handleReturnHome}>Return to Home</button>
              </div>
            </div>
          </div>

          <div>
            <div className="card p-6 mb-6">
              <h3 className="font-bold text-lg mb-3">Service Information</h3>
              <p className="text-sm text-gray-600">The Barangay ID is an official identification document issued to residents. Your application for a Barangay ID has been received and is currently under review. If you have any questions or have lost your reference number, please contact our support desk.</p>
            </div>

            <div className="card p-6">
              <h4 className="font-bold mb-3">Need Help?</h4>
              <p className="text-sm mb-2">
                <strong>Mobile:</strong><br />
                0969-619-6767
              </p>
              <p className="text-sm">
                <strong>Email:</strong><br />
                helpdesk@barangaysanbartolome.gov.ph
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
