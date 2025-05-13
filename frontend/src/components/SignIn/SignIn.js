import React, { useState } from 'react';
import './SignIn.css';
import { signIn } from '../../api/auth';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function SignIn({ onSignIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await signIn(email, password);
      
      // Check if we have both token and user data
      if (!response.token || !response.user) {
        throw new Error('Invalid response from server');
      }

      // Store token and user data in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // If "Remember me" is not checked, use sessionStorage instead
      if (!rememberMe) {
        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('user', JSON.stringify(response.user));
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }

      // Pass the user data to parent component
      if (onSignIn) onSignIn(response);
    } catch (err) {
      if (err.name === 'TypeError') {
        setError('Cannot connect to backend. Is the server running?');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-content">
        <div className="signin-header">
          <div className="signin-logo">
            <span className="signin-logo-text">FB</span>
          </div>
          <h1 className="signin-title">FinBooks</h1>
          <p className="signin-subtitle">Financial Management Platform</p>
        </div>

        <div className="signin-card">
          <h2 className="signin-card-title">Welcome back</h2>
          <p className="signin-card-subtitle">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="signin-form">
            <div className="signin-input-group">
              <label className="signin-label" htmlFor="email">Email address</label>
              <div className="signin-input-wrapper">
                <FiMail className="signin-input-icon" />
                <input
                  id="email"
                  type="email"
                  className="signin-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="signin-input-group">
              <label className="signin-label" htmlFor="password">Password</label>
              <div className="signin-input-wrapper">
                <FiLock className="signin-input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="signin-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="signin-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="signin-options">
              <label className="signin-checkbox-wrapper">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="signin-checkbox"
                />
                <span className="signin-checkbox-label">Remember me</span>
              </label>
              <a href="#" className="signin-forgot-link">Forgot password?</a>
            </div>

            {error && <div className="signin-error">{error}</div>}

            <button 
              type="submit" 
              className="signin-button"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <footer className="signin-footer">
          <p>© 2025 FinBooks. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
