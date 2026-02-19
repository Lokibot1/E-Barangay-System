import React, { useState, useEffect } from 'react';
import './Adm_DocReq.css';

export default function DocumentRequests() {
  const [resident, setResident] = useState({
    id: null,
    first_name: '',
    middle_name: '',
    last_name: '',
    birthdate: '',
    contact_number: '',
    email: '',
    temp_purok_id: '',
    temp_street_id: '',
    street_address: '',
    tracking_number: '',
    request_status: 'Not Approved',
    updated_at: ''
  });
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [currentPage, setCurrentPage] = useState(1);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // ✅ Added state for date range
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-02-01');

  const resident_id = 15;

  // Fetch resident info
  useEffect(() => {
    fetch(`http://localhost/E-Barangay-System/D_S/getResidentInfo.php?resident_id=${resident_id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setResident(data);
      })
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
      resident_id,
      first_name: resident.first_name,
      tracking_number: resident.tracking_number,
      type: 'Barangay ID',
      date: resident.updated_at
        ? new Date(resident.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'February 18, 2026',
      status: resident.request_status || 'Not Approved',
      updated_at: resident.updated_at
        ? new Date(resident.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'February 18, 2026'
    }
  ];

  function getFullName(data) {
    const parts = [data?.first_name, data?.middle_name, data?.last_name].filter(Boolean);
    return parts.length ? parts.join(' ') : data?.first_name || 'N/A';
  }

  function closePreview() {
    setIsPreviewOpen(false);
    setPreviewLoading(false);
    setPreviewError('');
    setPreviewData(null);
    setSelectedRow(null);
    setSavingStatus(false);
  }

  function openPreview(row) {
    setIsPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewError('');
    setPreviewData(null);
    setSelectedRow(row);

    fetch(`http://localhost/E-Barangay-System/D_S/getResidentInfo.php?resident_id=${row.resident_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.error) {
          setPreviewError(data.error);
          return;
        }
        setPreviewData(data);
      })
      .catch(() => setPreviewError('Unable to load preview data.'))
      .finally(() => setPreviewLoading(false));
  }

  function toggleApprovalStatus() {
    if (!previewData?.id) return;

    const nextStatus = previewData.request_status === 'Approved' ? 'Not Approved' : 'Approved';
    setSavingStatus(true);

    fetch('http://localhost/E-Barangay-System/D_S/updateRequestStatus.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resident_id: previewData.id, status: nextStatus })
    })
      .then((res) => res.json())
      .then((result) => {
        if (!result.success) {
          setPreviewError(result.message || 'Failed to update status');
          return;
        }

        setPreviewData((prev) => ({
          ...prev,
          request_status: nextStatus,
          updated_at: result.updated_at || prev.updated_at
        }));

        setResident((prev) => ({
          ...prev,
          request_status: nextStatus,
          updated_at: result.updated_at || prev.updated_at
        }));
      })
      .catch(() => setPreviewError('Unable to save status right now.'))
      .finally(() => setSavingStatus(false));
  }

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
      case 'Not Approved': return 'badge-not-approved';
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
            <option>Not Approved</option>
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
                  <button className="action-btn" title="View" onClick={() => openPreview(row)}>👁️</button>
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

      {isPreviewOpen && (
        <div className="preview-overlay" role="dialog" aria-modal="true" onClick={closePreview}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h4>Request Preview</h4>
              <button className="preview-close" onClick={closePreview} aria-label="Close preview">✕</button>
            </div>

            {previewLoading ? (
              <p className="preview-state">Loading preview...</p>
            ) : previewError ? (
              <p className="preview-state preview-error">{previewError}</p>
            ) : (
              <>
                <div className="preview-grid">
                  <div className="preview-block">
                    <h5>Personal Information</h5>
                    <p><strong>Full Name:</strong> {getFullName(previewData)}</p>
                    <p><strong>Contact Number:</strong> {previewData?.contact_number || 'N/A'}</p>
                    <p><strong>Email Address:</strong> {previewData?.email || 'N/A'}</p>
                    <p><strong>Date of Birth:</strong> {previewData?.birthdate || 'N/A'}</p>
                  </div>

                  <div className="preview-block">
                    <h5>Request Information</h5>
                    <p><strong>Tracking No.:</strong> {previewData?.tracking_number || 'N/A'}</p>
                    <p><strong>Document Type:</strong> {selectedRow?.type || 'N/A'}</p>
                    <p><strong>Status:</strong> {previewData?.request_status || 'Not Approved'}</p>
                    <p><strong>Last Updated:</strong> {previewData?.updated_at || selectedRow?.updated_at || 'N/A'}</p>
                  </div>
                </div>

                <div className="preview-actions">
                  <button
                    className="btn-approve-toggle"
                    onClick={toggleApprovalStatus}
                    disabled={savingStatus}
                  >
                    {savingStatus
                      ? 'Saving...'
                      : previewData?.request_status === 'Approved'
                      ? 'Set as Not Approved'
                      : 'Approve'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
