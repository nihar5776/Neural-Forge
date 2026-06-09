import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Lock, Mail, User, AlertCircle, Loader } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const validateName = (val) => {
    if (!val) return 'Name is mandatory';
    if (val.length < 3) return 'Name must be at least 3 characters';
    if (/[^a-zA-Z0-9\s]/.test(val)) return 'Name must not contain special characters';
    return '';
  };

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

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (fieldErrors.name) {
      setFieldErrors(prev => ({ ...prev, name: validateName(val) }));
    }
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
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setFieldErrors({
      name: nameErr,
      email: emailErr,
      password: passwordErr
    });

    return !nameErr && !emailErr && !passwordErr;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/auth/register', { name, email, password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const msg = err.message || 'Registration failed. Try a different email.';
      // Map specific backend validation messages to their fields
      const msgLower = msg.toLowerCase();
      if (msgLower.includes('already exists') || msgLower.includes('email')) {
        setFieldErrors(prev => ({ ...prev, email: msg }));
      } else if (msgLower.includes('name')) {
        setFieldErrors(prev => ({ ...prev, name: msg }));
      } else if (msgLower.includes('password')) {
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
          <h2>Create Account</h2>
          <p className="auth-subtitle">Join VidyaGuide to get personalized resume coaching and real job matches</p>
        </div>

        {error && (
          <div className="auth-error-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="auth-success-alert">
            <span>Registration successful! Redirecting to login...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className={`input-with-icon ${fieldErrors.name ? 'has-error' : ''}`}>
              <User className="input-icon" size={18} />
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={handleNameChange}
                onBlur={() => {
                  const err = validateName(name);
                  setFieldErrors(prev => ({ ...prev, name: err }));
                }}
                required
              />
            </div>
            {fieldErrors.name && (
              <span className="field-error-message">
                <AlertCircle size={14} />
                {fieldErrors.name}
              </span>
            )}
          </div>

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

          <button type="submit" className="btn-primary auth-submit-btn" disabled={loading || success}>
            {loading ? (
              <>
                <Loader className="spinner" size={18} />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login" className="auth-link">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
