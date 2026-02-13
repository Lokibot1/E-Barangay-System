import React from 'react';
import './Adm_Recent_DocReq.css';

export default function Adm_Recent_DocReq() {
  const mockData = [
    { id: 'XXXX-XX69-619', resident: '[Given Name]', type: 'Barangay ID', date: 'February 3, 2026', status: 'Pending' },
    { id: 'XXXX-XX69-566', resident: '[Given Name]', type: 'Certificate of Indigency', date: 'February 3, 2026', status: 'Pending' },
    { id: 'XXXX-XX64-677', resident: '[Given Name]', type: 'Certificate of Residency', date: 'February 3, 2026', status: 'Pending' },
    { id: 'XXXX-XX69-619', resident: 'Ronald McDonald', type: 'Barangay ID', date: 'January 31, 2026', status: 'Approved' },
    { id: 'XXXX-XX55-516', resident: 'Aiden Richards', type: 'Certificate of Residency', date: 'February 1, 2026', status: 'Approved' },
  ];

  function getStatusBadgeClass(status) {
    switch (status) {
      case 'Pending': return 'badge-pending';
      case 'Approved': return 'badge-approved';
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
            {mockData.map((row, idx) => (
              <tr key={idx}>
                <td>{row.id}</td>
                <td>{row.resident}</td>
                <td>{row.type}</td>
                <td>{row.date}</td>
                <td><span className={`badge ${getStatusBadgeClass(row.status)}`}>{row.status}</span></td>
                <td className="action-cell">
                  <button className="action-btn" title="View">👁️</button>
                  <button className="action-btn" title="Print">🖨️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
