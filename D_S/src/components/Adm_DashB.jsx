import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Adm_DashB.css';
import LogoutConfirm from './LogoutConfirm';
import logo2 from '../assets/sblogo2.png';
import Adm_DocReq from './Adm_DocReq';
import Adm_Analytics from './Adm_Analytics';
import Adm_Recent_DocReq from './Adm_Recent_DocReq';

export default function AdminDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const navigate = useNavigate();

  const [logoutOpen, setLogoutOpen] = useState(false);

  function handleLogout() {
    // show confirmation
    setLogoutOpen(true);
  }

  function doLogout() {
    localStorage.removeItem('role');
    setMenuOpen(false);
    setLogoutOpen(false);
    navigate('/login');
  }

  return (
    <div className="admin-root">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src={logo2} alt="logo" className="admin-logo" />
          <div>
            <div className="admin-title">Barangay San Bartolome</div>
            <div className="admin-sub">Admin Portal</div>
          </div>
        </div>

        <nav className="admin-nav">
          <button 
            className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`nav-item ${currentPage === 'documents' ? 'active' : ''}`}
            onClick={() => setCurrentPage('documents')}
          >
            Document Requests
          </button>
          <button 
            className={`nav-item ${currentPage === 'analytics' ? 'active' : ''}`}
            onClick={() => setCurrentPage('analytics')}
          >
            Analytics
          </button>
          <button className="nav-item">Transactions</button>
          <button className="nav-item">Settings</button>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div className="search-placeholder">Search...</div>

          <div className="admin-actions-wrap">
            <button className="admin-actions" onClick={() => setMenuOpen((s) => !s)} aria-haspopup="true" aria-expanded={menuOpen}>
              Admin: Aggabao▾
            </button>

            {menuOpen && (
              <div className="admin-menu" role="menu">
                  <button className="menu-item" onClick={handleLogout}>Log out</button>
              </div>
            )}
            {/* render modal outside the floating menu so it stays mounted */}
            <LogoutConfirm open={logoutOpen} onConfirm={doLogout} onCancel={() => setLogoutOpen(false)} />
          </div>
        </header>

        <section className="admin-content">
          {currentPage === 'dashboard' ? (
            <>
              <h2>Dashboard</h2>

              <div className="cards">
                <div className="card">Pending Requests<br/><strong>1</strong></div>
                <div className="card">Total Revenue<br/><strong>₱500.00</strong></div>
                <div className="card">Processed Today<br/><strong>1</strong></div>
                <div className="card">Registered ID's<br/><strong>0</strong></div>
              </div>

              <Adm_Recent_DocReq />
            </>
          ) : currentPage === 'documents' ? (
            <Adm_DocReq />
          ) : currentPage === 'analytics' ? (
            <Adm_Analytics />
          ) : null}
        </section>
      </main>
    </div>
  );
}
