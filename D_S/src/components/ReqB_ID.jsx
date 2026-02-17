import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './ReqB_ID.css';

export default function ReqB_ID() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: null,
    contact_number: null,
    birthdate: null,
    email: null,
    purok: null,
    street_address: null,
    emergency_contact_name: null,
    emergency_contact_no: null,
    blood_type: null,
    civil_status: 'Single',
  });

  const [purokOptions, setPurokOptions] = useState([]);

  // Fetch resident data for ID 15 (replace with dynamic ID if needed)
  useEffect(() => {
    const residentId = 15; // Hardcoded for now

    fetch(`http://localhost/E-Barangay-System/D_S/getResident.php?id=${residentId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setFormData({
            full_name:
              data.first_name && data.middle_name && data.last_name
                ? `${data.first_name} ${data.middle_name} ${data.last_name}`
                : null,
            contact_number: data.contact_number || null,
            birthdate: data.birthdate || null,
            email: data.email || null,
            purok: data.temp_purok_id || null,
            street_address: data.temp_street_id || null,
            emergency_contact_name: null,
            emergency_contact_no: null,
            blood_type: null,
            civil_status: data.marital_status_id
              ? // Map numeric marital_status_id to string
                data.marital_status_id === 1
                  ? 'Single'
                  : data.marital_status_id === 2
                  ? 'Married'
                  : data.marital_status_id === 3
                  ? 'Widowed'
                  : 'Single'
              : 'Single',
          });
        } else {
          // No data found → set everything null
          setFormData({
            full_name: null,
            contact_number: null,
            birthdate: null,
            email: null,
            purok: null,
            street_address: null,
            emergency_contact_name: null,
            emergency_contact_no: null,
            blood_type: null,
            civil_status: 'Single',
          });
        }
      })
      .catch((err) => {
        console.error('Error fetching resident data:', err);
        // On error → set null
        setFormData({
          full_name: null,
          contact_number: null,
          birthdate: null,
          email: null,
          purok: null,
          street_address: null,
          emergency_contact_name: null,
          emergency_contact_no: null,
          blood_type: null,
          civil_status: 'Single',
        });
      });
  }, []);

  // Example Purok options (replace with dynamic fetch if needed)
  useEffect(() => {
    setPurokOptions(['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4']);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Updated handleSubmit with SweetAlert confirmation
  const handleSubmit = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to submit the Barangay ID request?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, submit it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // User confirmed → navigate to success page
        navigate('/request-success', { state: { formType: 'Barangay ID', formData } });

        // Optional: Show success message after navigation
        Swal.fire(
          'Submitted!',
          'Your Barangay ID request has been submitted.',
          'success'
        );
      }
    });
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <section className="request-page py-12 bg-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-8">Request for Barangay ID</h1>
        <p className="text-gray-700 mb-6">Please fill out the form below to request a certificate.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="card p-6">
              <h3 className="font-bold text-xl mb-4">Personal Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="label">Full Name:</label>
                  <input
                    className="input"
                    placeholder=""
                    name="full_name"
                    value={formData.full_name || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="label">Contact Number:</label>
                  <input
                    className="input"
                    placeholder=""
                    name="contact_number"
                    value={formData.contact_number || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="label">Date of Birth:</label>
                  <input
                    type="date"
                    className="input"
                    name="birthdate"
                    value={formData.birthdate || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="label">Civil Status:</label>
                  <select
                    className="input"
                    name="civil_status"
                    value={formData.civil_status || 'Single'}
                    onChange={handleChange}
                  >
                    <option>Single</option>
                    <option>Married</option>
                    <option>Widowed</option>
                  </select>
                </div>
                <div>
                  <label className="label">Email Address:</label>
                  <input
                    className="input"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <h3 className="font-bold text-xl mb-3">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="label">Purok/Zone:</label>
                  <select
                    className="input"
                    name="purok"
                    value={formData.purok || ''}
                    onChange={handleChange}
                  >
                    <option value="">Select Purok</option>
                    {purokOptions.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Street Address:</label>
                  <input
                    className="input"
                    name="street_address"
                    value={formData.street_address || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <h3 className="font-bold text-xl mb-3">ID Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  className="input"
                  placeholder="Emergency Contact Name"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name || ''}
                  onChange={handleChange}
                />
                <input
                  className="input"
                  placeholder="Emergency Contact No."
                  name="emergency_contact_no"
                  value={formData.emergency_contact_no || ''}
                  onChange={handleChange}
                />
                <select
                  className="input"
                  name="blood_type"
                  value={formData.blood_type || ''}
                  onChange={handleChange}
                >
                  <option>Blood Type</option>
                  <option>A+</option>
                  <option>O+</option>
                  <option>B+</option>
                  <option>AB+</option>
                </select>
              </div>

              <h3 className="font-bold text-xl mb-3">Supporting Documents</h3>
              <p className="text-sm text-gray-600 mb-2">Upload Valid ID (Government-issued):</p>
              <div className="mb-6">
                <input type="file" className="file-input" />
              </div>

              <div className="flex gap-4">
                <button className="btn-submit" onClick={handleSubmit}>
                  Submit Barangay ID Request
                </button>
                <button className="btn-cancel" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="card p-6 mb-6">
              <h3 className="font-bold text-xl mb-3">Service Information</h3>
              <p className="text-sm">
                <strong>Requirements:</strong>
                <br />
                Valid ID, Proof of Billing, Personal Appearance.
              </p>
              <p className="mt-3 text-sm">
                <strong>Fees:</strong>
                <br />
                ₱50.00
              </p>
              <p className="mt-3 text-sm">
                <strong>Validity:</strong>
                <br />
                1 Year
              </p>
            </div>

            <div className="card p-6">
              <h4 className="font-bold mb-2">Need Help?</h4>
              <p className="text-sm">
                📞 0912 345 6789
                <br />
                📞 0915 345 6549
              </p>
              <p className="mt-3 text-sm">✉ barangaysanbartolome@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
