import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import bg from '../assets/gulodbg_hd.jpg';
import logo from '../assets/gulod_logo1.jpeg';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    const uname = email.trim();
    const pass = password;

    fetch('http://localhost/E-Barangay-System/D_S/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: uname, password: pass })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert(`Login Successful!`);

          localStorage.setItem('role', data.role);
          localStorage.setItem('username', data.username);
          localStorage.setItem('resident_id', data.resident_id);

          if (data.role === 'admin') {
            navigate('/admin'); 
          } else {
            navigate('/'); 
          }
        } else {
          alert(data.message || 'Invalid credentials');
        }
      })
      .catch(err => {
        console.error('Login error:', err);
        alert('Something went wrong.');
      });
  }

  return (
    <div className="login-bg" style={{ backgroundImage: `url(${bg})` }}>
      <div className="login-card">
        <div className="logo-wrap">
          <img src={logo} alt="logo" className="sblogo" />
        </div>

        <h1 className="title">Barangay Gulod<br />Office Services Portal</h1>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="input-label">
            <input
              type="text"
              placeholder="username or email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="input-label password">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle"
              onClick={() => setShowPassword((s) => !s)}
              aria-label="toggle password visibility"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </label>

          <div className="forgot">forgot password?</div>

          <button className="login-btn" type="submit">Login</button>
        </form>

        <div className="signup">don't have an account? <a href="#">Sign up</a></div>
      </div>
    </div>
  );
}
