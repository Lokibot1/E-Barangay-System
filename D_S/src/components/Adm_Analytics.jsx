import React from 'react';
import './Adm_Analytics.css';

export default function Adm_Analytics() {
  return (
    <div className="analytics-container">
      <h2>Analytics Overview</h2>

      <div className="analytics-cards">
        <div className="metric-card">
          <div className="metric-label">Total Requests</div>
          <div className="metric-value">1</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Total Revenue</div>
          <div className="metric-value">₱0.00</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Avg. Processing Time</div>
          <div className="metric-value">0 Days</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Pending Requests</div>
          <div className="metric-value">1</div>
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
              
              {/* Indigency - 0% (kept but invisible) */}
              <circle 
                cx="60" 
                cy="60" 
                r="45" 
                fill="none" 
                stroke="#15803d" 
                strokeWidth="20" 
                strokeDasharray="0 282.6" 
                transform="rotate(-90 60 60)" 
              />

              {/* Residency - 0% (kept but invisible) */}
              <circle 
                cx="60" 
                cy="60" 
                r="45" 
                fill="none" 
                stroke="#fbbf24" 
                strokeWidth="20" 
                strokeDasharray="0 282.6" 
                transform="rotate(-90 60 60)" 
              />

              {/* Barangay ID - 100% (gray) */}
              <circle 
                cx="60" 
                cy="60" 
                r="45" 
                fill="none" 
                stroke="#d1d5db" 
                strokeWidth="20" 
                strokeDasharray="282.6 282.6" 
                transform="rotate(-90 60 60)" 
              />

              <text 
                x="60" 
                y="65" 
                textAnchor="middle" 
                fontSize="16" 
                fontWeight="700"
              >
                100%
              </text>
            </svg>

            <div className="donut-legend">
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#15803d' }}></span>
                <span>Certificate of Indigency (0%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#fbbf24' }}></span>
                <span>Certificate of Residency (0%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#d1d5db' }}></span>
                <span>Barangay ID (100%)</span>
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
              <div className="bar-fill" style={{ width: '0%' }}></div>
            </div>
          </div>
          <div className="bar-item">
            <label>Residency</label>
            <div className="bar-container">
              <div className="bar-fill" style={{ width: '0%' }}></div>
            </div>
          </div>
          <div className="bar-item">
            <label>Barangay ID</label>
            <div className="bar-container">
              <div className="bar-fill" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
