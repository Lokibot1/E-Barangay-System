import React, { useEffect, useState } from 'react';
import './Adm_Recent_DocReq.css';

export default function Adm_Recent_DocReq() {

  // ✅ Add resident state (MISSING before)
  const [resident, setResident] = useState({
    first_name: '',
    tracking_number: '',
    request_status: 'Not Approved',
    updated_at: ''
  });

  // For this example, hardcode resident_id = 15
  const resident_id = 15;

  // ✅ Fetch resident info properly
  useEffect(() => {
    fetch(`http://localhost/E-Barangay-System/D_S/getResidentInfo.php?resident_id=${resident_id}`)
      .then(res => res.json())
      .then(data => setResident(data))
      .catch(err => console.error('Error fetching resident:', err));
  }, [resident_id]);

  // ✅ Format date from MySQL
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // ✅ Only ONE mockData (fixed duplicate declaration)
  const mockData = resident.tracking_number
    ? [
        {
          id: resident.tracking_number,
          resident: resident.first_name,
          type: 'Barangay ID',
          date: formatDate(resident.updated_at),
          status: resident.request_status || 'Not Approved'
        }
      ]
    : [];

  function getStatusBadgeClass(status) {
    switch (status) {
      case 'Pending': return 'badge-pending';
      case 'Approved': return 'badge-approved';
      case 'Not Approved': return 'badge-not-approved';
      case 'For Pickup': return 'badge-pickup';
      case 'Completed': return 'badge-completed';
      case 'Declined': return 'badge-declined';
      default: return '';
    }
  }

  return (
    <div className="recent-requests">
      <h3>Recent Document Requests</h3>
      <div className="recent-table-wrap">
        <table className="recent-table">
          <thead>
            <tr>
              <th>Ref No.</th>
              <th>Resident Name</th>
              <th>Document Type</th>
              <th>Date Submitted</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {mockData.length > 0 ? (
              mockData.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.id}</td>
                  <td>{row.resident}</td>
                  <td>{row.type}</td>
                  <td>February 18, 2026</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="action-cell">
                    <button className="action-btn" title="View">👁️</button>
                    <button className="action-btn" title="Print">🖨️</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
