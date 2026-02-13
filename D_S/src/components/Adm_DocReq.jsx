import React, { useState } from 'react';
import './Adm_DocReq.css';

export default function DocumentRequests() {
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [currentPage, setCurrentPage] = useState(1);

  const mockData = [
    { id: 'XXXX-XX69-619', resident: '[Given Name]', type: 'Barangay ID', date: 'February 3, 2026', status: 'Pending' },
    { id: 'XXXX-XX69-566', resident: '[Given Name]', type: 'Certificate of Indigency', date: 'February 3, 2026', status: 'Pending' },
    { id: 'XXXX-XX64-677', resident: '[Given Name]', type: 'Certificate of Residency', date: 'February 3, 2026', status: 'Pending' },
    { id: 'XXXX-XX69-619', resident: 'Ronald McDonald', type: 'Barangay ID', date: 'January 31, 2026', status: 'Approved' },
    { id: 'XXXX-XX55-516', resident: 'Aiden Richards', type: 'Certificate of Residency', date: 'February 1, 2026', status: 'Approved' },
    { id: 'XXXX-XX69-619', resident: 'Robin Padilla', type: 'Barangay ID', date: 'January 16, 2026', status: 'For Pickup' },
    { id: 'XXXX-XX69-619', resident: 'Bato Dela Rosa', type: 'Certificate of Residency', date: 'January 25, 2026', status: 'Completed' },
    { id: 'XXXX-XX69-619', resident: 'Jose Rizal', type: 'Certificate of Residency', date: 'January 13, 2026', status: 'Approved' },
    { id: 'XXXX-XX69-619', resident: 'Andres Bonifacio', type: 'Certificate of Indigency', date: 'January 18, 2026', status: 'Declined' },
    { id: 'XXXX-XX69-619', resident: 'John Cena', type: 'Barangay ID', date: 'Januaryh, 2026', status: 'Approved' },
  ];

  const itemsPerPage = 10;
  const filteredData = statusFilter === 'All Statuses' 
    ? mockData 
    : mockData.filter(item => item.status === statusFilter);

  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIdx, startIdx + itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

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
    <div className="doc-requests-container">
      <h2>Document Requests</h2>

      <div className="doc-filters">
        <div className="filter-group">
          <label className="filter-label">Filter by Status</label>
          <p className="showing-text">Showing: {statusFilter}</p>
          <select 
            className="status-dropdown" 
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option>All Statuses</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>For Pickup</option>
            <option>Completed</option>
            <option>Declined</option>
          </select>
        </div>

        <div className="filter-group date-range">
          <input type="date" defaultValue="2026-02-01" />
          <span>-</span>
          <input type="date" defaultValue="2026-01-01" />
        </div>
      </div>

      <div className="doc-table-wrap">
        <table className="doc-table">
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
            {paginatedData.map((row, idx) => (
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

      <div className="doc-pagination">
        <p>Showing {startIdx + 1}-{Math.min(startIdx + itemsPerPage, filteredData.length)} of {filteredData.length} entries</p>
        <div className="pagination-buttons">
          {Array.from({ length: totalPages }, (_, i) => (
            <button 
              key={i + 1}
              className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          {totalPages > 5 && <button className="page-btn">›</button>}
        </div>
      </div>
    </div>
  );
}
