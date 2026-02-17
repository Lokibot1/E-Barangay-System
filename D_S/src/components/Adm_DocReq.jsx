import React, { useState, useEffect } from 'react';
import './Adm_DocReq.css';

export default function DocumentRequests() {
  const [resident, setResident] = useState({ first_name: '', tracking_number: '' });
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Added state for date range
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-02-01');

  const resident_id = 15;

  // Fetch resident info
  useEffect(() => {
    fetch(`http://localhost/E-Barangay-System/D_S/getResidentInfo.php?resident_id=${resident_id}`)
      .then(res => res.json())
      .then(data => setResident(data))
      .catch(err => console.error('Error fetching resident:', err));
  }, [resident_id]);

  // ✅ NEW: Function for filtering by status
  function filterByStatus(data) {
    if (statusFilter === 'All Statuses') return data;
    return data.filter(item => item.status === statusFilter);
  }

  // Mock document data using fetched resident info
  const mockData = [
    {
      id: resident.tracking_number,
      first_name: resident.first_name,
      tracking_number: resident.tracking_number,
      type: 'Barangay ID',
      date: 'February 18, 2026',
      status: 'Pending',
      updated_at: 'February 18, 2026'
    }
  ];

  const itemsPerPage = 10;

  // ✅ Apply status filter function + date filter
  const filteredData = filterByStatus(mockData)
    .filter(item => {
      const itemDate = new Date(item.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return itemDate >= start && itemDate <= end;
    });

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
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
          />
          <span>-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Ref No.</th>
              <th>Resident Name</th>
              <th>Tracking No.</th>
              <th>Document Type</th>
              <th>Date Submitted</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr key={idx}>
                <td>{row.id}</td>
                <td>{row.first_name}</td>
                <td>{row.tracking_number}</td>
                <td>{row.type}</td>
                <td>{row.date}</td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(row.status)}`}>
                    {row.status}
                  </span>
                </td>
                <td>{row.updated_at}</td>
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
        <p>
          Showing {filteredData.length === 0 ? 0 : startIdx + 1}-
          {Math.min(startIdx + itemsPerPage, filteredData.length)} of {filteredData.length} entries
        </p>
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
