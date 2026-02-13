import React from 'react';
import './Adm_Analytics.css';

export default function Adm_Analytics() {
  return (
    <div className="analytics-container">
      <h2>Analytics Overview</h2>

      <div className="analytics-cards">
        <div className="metric-card">
          <div className="metric-label">Total Requests</div>
          <div className="metric-value">267</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Total Revenue</div>
          <div className="metric-value">₱1,000.00</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Avg. Processing Time</div>
          <div className="metric-value">1.5 Days</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Pending Requests</div>
          <div className="metric-value">40</div>
        </div>
      </div>

      <div className="analytics-charts">
        <div className="chart-placeholder">
          <p>Chart Area (Placeholder)</p>
        </div>

        <div className="chart-section">
          <h3>Requests by Document Type</h3>
          <div className="donut-chart">
            <svg viewBox="0 0 120 120" className="donut-svg">
              {/* Indigency - 50% (green) */}
              <circle cx="60" cy="60" r="45" fill="none" stroke="#15803d" strokeWidth="20" strokeDasharray="141.3 282.6" transform="rotate(-90 60 60)" />
              {/* Residency - 30% (yellow) */}
              <circle cx="60" cy="60" r="45" fill="none" stroke="#fbbf24" strokeWidth="20" strokeDasharray="84.78 282.6" strokeDashoffset="-141.3" transform="rotate(-90 60 60)" />
              {/* Barangay ID - 20% (gray) */}
              <circle cx="60" cy="60" r="45" fill="none" stroke="#d1d5db" strokeWidth="20" strokeDasharray="56.52 282.6" strokeDashoffset="-226.08" transform="rotate(-90 60 60)" />
              <text x="60" y="65" textAnchor="middle" fontSize="16" fontWeight="700">50%</text>
            </svg>
            <div className="donut-legend">
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#15803d' }}></span>
                <span>Certificate of Indigency</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#fbbf24' }}></span>
                <span>Certificate of Residency</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#d1d5db' }}></span>
                <span>Barangay ID</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-section full-width">
        <h3>Most Requested Services</h3>
        <div className="bar-chart">
          <div className="bar-item">
            <label>Indigency</label>
            <div className="bar-container">
              <div className="bar-fill" style={{ width: '85%' }}></div>
            </div>
          </div>
          <div className="bar-item">
            <label>Residency</label>
            <div className="bar-container">
              <div className="bar-fill" style={{ width: '65%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
