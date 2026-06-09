import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Lock, Mail, AlertCircle, Loader } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const validateEmail = (val) => {
    if (!val) return 'Email address is mandatory';
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(val)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (val) => {
    if (!val) return 'Password is mandatory';
    if (val.length < 6) return 'Password must contain at least 6 characters';
    return '';
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (fieldErrors.email) {
      setFieldErrors(prev => ({ ...prev, email: validateEmail(val) }));
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (fieldErrors.password) {
      setFieldErrors(prev => ({ ...prev, password: validatePassword(val) }));
    }
  };

  const validateForm = () => {
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setFieldErrors({
      email: emailErr,
      password: passwordErr
    });

    return !emailErr && !passwordErr;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const data = await api.post('/api/auth/login', { email, password });
      onLoginSuccess(data.user);
      navigate('/');
    } catch (err) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      const msgLower = msg.toLowerCase();
      if (msgLower.includes('no account') || msgLower.includes('email') || msgLower.includes('register')) {
        setFieldErrors(prev => ({ ...prev, email: msg }));
      } else if (msgLower.includes('password') || msgLower.includes('invalid password')) {
        setFieldErrors(prev => ({ ...prev, password: msg }));
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page animate-fade-in">
      <div className="auth-card card">
        <div className="auth-header">
          <div className="logo-accent">VG</div>
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Log in to resume your career mentoring sessions</p>
        </div>

        {error && (
          <div className="auth-error-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className={`input-with-icon ${fieldErrors.email ? 'has-error' : ''}`}>
              <Mail className="input-icon" size={18} />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={handleEmailChange}
                onBlur={() => {
                  const err = validateEmail(email);
                  setFieldErrors(prev => ({ ...prev, email: err }));
                }}
                required
              />
            </div>
            {fieldErrors.email && (
              <span className="field-error-message">
                <AlertCircle size={14} />
                {fieldErrors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className={`input-with-icon ${fieldErrors.password ? 'has-error' : ''}`}>
              <Lock className="input-icon" size={18} />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => {
                  const err = validatePassword(password);
                  setFieldErrors(prev => ({ ...prev, password: err }));
                }}
                required
              />
            </div>
            {fieldErrors.password && (
              <span className="field-error-message">
                <AlertCircle size={14} />
                {fieldErrors.password}
              </span>
            )}
          </div>

          <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader className="spinner" size={18} />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register" className="auth-link">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
