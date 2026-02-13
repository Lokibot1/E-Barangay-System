import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import bg from '../assets/sanbartolome.png';
import logo from '../assets/sblogo.png';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    const uname = email.trim().toLowerCase();

    if (uname === 'admin' && password === 'password') {
      localStorage.setItem('role', 'admin');
      navigate('/admin');
      return;
    }

    if (uname === 'user' && password === 'password') {
      localStorage.setItem('role', 'user');
      navigate('/');
      return;
    }

    console.log('login attempt', { email, password });
    alert('Invalid credentials');
  }

  return (
    <div className="login-bg" style={{ backgroundImage: `url(${bg})` }}>
      <div className="login-card">
        <div className="logo-wrap">
          <img src={logo} alt="logo" className="sblogo" />
        </div>

        <h1 className="title">Barangay San Bartolome<br/>Office Services Portal</h1>

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
