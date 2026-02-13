import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import "./User_Navbar.css";
import LogoutConfirm from './LogoutConfirm';

export default function User_Navbar() {
	const [role, setRole] = useState(localStorage.getItem('role'));
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		function onStorage(e) {
			if (e.key === 'role') setRole(e.newValue);
		}
		window.addEventListener('storage', onStorage);
		return () => window.removeEventListener('storage', onStorage);
	}, []);

	// update role when route changes (login sets localStorage then navigates)
	useEffect(() => {
		setRole(localStorage.getItem('role'));
	}, [location]);

	const [logoutOpen, setLogoutOpen] = useState(false);

	function handleLogout() {
		// show confirmation modal
		setLogoutOpen(true);
	}

	function doLogout() {
		localStorage.removeItem('role');
		setRole(null);
		setLogoutOpen(false);
		navigate('/login');
	}

	return (
		<nav className="ds-navbar">
			<div className="ds-navbar-inner">
				<div className="ds-left">
					<div className="ds-logo">
						<img src="/SB Logo.png" alt="SB Logo" className="ds-seal-img" />
						<div className="ds-brand">
							<div className="ds-title">Barangay San Bartolome</div>
							<div className="ds-sub">Official Services Portal</div>
						</div>
					</div>
				</div>

				<div className="ds-center">
					<div className="ds-search">
						<svg className="ds-search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M21 21l-4.35-4.35" stroke="#999" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
							<circle cx="11" cy="11" r="6" stroke="#999" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
						<input className="ds-search-input" placeholder="Search..." aria-label="Search" />
					</div>

					<ul className="ds-links">
						<li><button onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })} style={{background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit'}}>Services</button></li>
						<li>Announcements</li>
						<li>About Us</li>
						<li>Contact</li>
					</ul>
				</div>

				<div className="ds-right">
					{role === 'user' ? (
						<div className="ds-user-menu" tabIndex={0}>
							<button className="ds-user-btn" aria-haspopup="true">user ▾</button>
							<div className="ds-user-dropdown" role="menu">
								<button className="ds-user-logout" onClick={handleLogout}>Log out</button>
							</div>
						</div>
					) : (
						<Link to="/login" className="ds-login">Login / Register</Link>
					)}
				</div>
				{/* render modal at top-level so it doesn't get unmounted when dropdown closes */}
				<LogoutConfirm open={logoutOpen} onConfirm={doLogout} onCancel={() => setLogoutOpen(false)} />
			</div>
		</nav>
	);
}
