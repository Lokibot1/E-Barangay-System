import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './User_Req_Track.css';

export default function User_Req_Track() {
  const navigate = useNavigate();
  const location = useLocation();
  const [referenceNumber, setReferenceNumber] = useState('XXXX-XX99-619');
  const [trackingData, setTrackingData] = useState({
    status: 'Under Review',
    currentStep: 2,
    dateSubmitted: 'February 3, 2026',
    documentType: location.state?.formType || 'Barangay ID',
    applicantName: '[Given Name]'
  });

  const handleTrack = () => {
    // Placeholder for actual tracking logic
    console.log('Tracking reference:', referenceNumber);
  };

  const handleReturnHome = () => {
    navigate('/');
  };

  const steps = [
    { number: 1, label: 'Request Submitted', status: 'completed', date: 'February 3, 2026' },
    { number: 2, label: 'Under Review', status: 'current', date: 'Current Step' },
    { number: 3, label: 'Ready for Pick-Up', status: 'pending', date: 'Pending' },
    { number: 4, label: 'Completed', status: 'pending', date: 'Pending' }
  ];

  return (
    <section className="tracking-page py-12 bg-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="breadcrumb mb-6">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="breadcrumb-link">Home</a>
          <span className="breadcrumb-separator">&gt;</span>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate(-1); }} className="breadcrumb-link">Request Submitted</a>
          <span className="breadcrumb-separator">&gt;</span>
          <span className="breadcrumb-current">Track Request Status</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold mb-8">Track Request Status</h1>

        <div className="grid">
          <div>
            {/* Reference Number Input Card */}
            <div className="card ref-card p-6 mb-6">
              <div className="flex flex-col gap-3">
                <label className="label">Reference No.:</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    className="input flex-1"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                  />
                  <button className="btn-track" onClick={handleTrack}>Track</button>
                </div>
              </div>
            </div>

            {/* Status and Timeline Card */}
            <div className="card status-card p-0 mb-6">
              <div className="status-box mb-0">
                <div className="flex items-center gap-3">
                  <div className="status-icon">⏱</div>
                  <h3 className="text-xl font-bold">Status: {trackingData.status}</h3>
                </div>
              </div>

              {/* Timeline Steps - Horizontal */}
              <div className="timeline-container-horizontal p-6">
                <div className="flex justify-between items-start">
                  {steps.map((step, index) => (
                    <div key={step.number} className="timeline-step-horizontal">
                      <div className={`step-circle ${step.status}`}>
                        {step.status === 'completed' ? '✓' : step.number}
                      </div>
                      <div className="step-content-horizontal">
                        <p className="font-bold">{step.label}</p>
                        <p className="text-xs text-gray-600">{step.date}</p>
                      </div>
                      {index < steps.length - 1 && <div className={`step-connector-horizontal ${step.status}`}></div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Request Details - Inside same container */}
              <div className="request-details-section p-6 border-t border-gray-200">
                <h3 className="font-bold text-xl mb-4">Request Details</h3>
                <div className="space-y-3">
                  <p><strong>Reference Number:</strong> {trackingData.referenceNumber || referenceNumber}</p>
                  <p><strong>Date Submitted:</strong> {trackingData.dateSubmitted}</p>
                  <p><strong>Document Type:</strong> {trackingData.documentType}</p>
                  <p><strong>Applicants Name:</strong> {trackingData.applicantName}</p>
                </div>
                <button className="btn-return" onClick={handleReturnHome}>Return to Home</button>
              </div>
            </div>
          </div>

          {/* Right Side Cards */}
          <div className="right-column">
            <div className="card">
              <h3 className="font-bold text-xl mb-3">Service Information</h3>
              <p className="text-sm">The {trackingData.documentType} is an official identification document issued to residents. Your application for a {trackingData.documentType} has been received and is currently under review. If you have any questions or have lost your reference number, please contact our support desk.</p>
            </div>

            <div className="card">
              <h4 className="font-bold mb-3">Need Help?</h4>
              <p className="text-sm"><strong>Mobile:</strong><br />0969-819-8767</p>
              <p className="mt-3 text-sm"><strong>Email:</strong><br />helpdesk@barangaysanbartolome.gov.ph</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
