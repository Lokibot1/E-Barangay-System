import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Req_Form.css';

export default function Req_Form({ onSubmit, onCancel }) {
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit();
    } else {
      navigate('/request-success', { state: { formType: 'Barangay ID' } });
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/');
    }
  };

  return (
    <section className="request-page py-12 bg-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-2">Request for Barangay ID</h1>
        <p className="text-gray-700 mb-6">Please fill out the form below to request a certificate.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="card p-6">
              <h3 className="font-bold text-xl mb-4">Personal Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="label">Full Name:</label>
                  <input className="input" placeholder="" />
                </div>
                <div>
                  <label className="label">Contact Number:</label>
                  <input className="input" placeholder="" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="label">Date of Birth:</label>
                  <input type="date" className="input" />
                </div>
                <div>
                  <label className="label">Civil Status:</label>
                  <select className="input">
                    <option>Single</option>
                    <option>Married</option>
                    <option>Widowed</option>
                  </select>
                </div>
                <div>
                  <label className="label">Email Address:</label>
                  <input className="input" />
                </div>
              </div>

              <h3 className="font-bold text-xl mb-3">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="label">Purok/Zone:</label>
                  <select className="input">
                    <option>Purok/Zone</option>
                  </select>
                </div>
                <div>
                  <label className="label">Street Address:</label>
                  <input className="input" />
                </div>
              </div>

              <h3 className="font-bold text-xl mb-3">ID Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input className="input" placeholder="Emergency Contact Name" />
                <input className="input" placeholder="Emergency Contact No." />
                <select className="input">
                  <option>Blood Type</option>
                  <option>A+</option>
                  <option>O+</option>
                </select>
              </div>

              <h3 className="font-bold text-xl mb-3">Supporting Documents</h3>
              <p className="text-sm text-gray-600 mb-2">Upload Valid ID (Government-issued):</p>
              <div className="mb-6">
                <input type="file" className="file-input" />
              </div>

              <div className="flex gap-4">
                <button type="button" className="btn-submit" onClick={handleSubmit}>Submit Barangay ID Request</button>
                <button type="button" className="btn-cancel" onClick={handleCancel}>Cancel</button>
              </div>
            </div>
          </div>

          <div>
            <div className="card p-6 mb-6">
              <h3 className="font-bold text-xl mb-3">Service Information</h3>
              <p className="text-sm"><strong>Requirements:</strong><br />Valid ID, Proof of Billing, Personal Appearance.</p>
              <p className="mt-3 text-sm"><strong>Fees:</strong><br />₱50.00</p>
              <p className="mt-3 text-sm"><strong>Validity:</strong><br />1 Year</p>
            </div>

            <div className="card p-6">
              <h4 className="font-bold mb-2">Need Help?</h4>
              <p className="text-sm">📞 0912 345 6789<br />📞 0915 345 6549</p>
              <p className="mt-3 text-sm">✉ barangaysanbartolome@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
