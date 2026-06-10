import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Lock, Mail, AlertCircle, Loader, Radio } from 'lucide-react';
import { PageTransition, TiltCard, NeuralDecodeText, MagneticButton } from '../components/MotionWrappers';

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
      if (data.token) {
        sessionStorage.setItem('token', data.token);
      }
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
    <PageTransition className="auth-page animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'transparent' }}>
      <TiltCard className="auth-card" style={{ padding: '48px', maxWidth: '440px', width: '100%', borderTop: '2px solid hsla(var(--primary), 0.5)' }}>
        <div className="auth-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'hsla(var(--primary), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid hsla(var(--primary), 0.3)', boxShadow: '0 0 30px hsla(var(--primary), 0.2)' }}>
            <Radio size={32} color="hsl(var(--primary))" />
          </div>
          <h2 style={{ fontSize: '28px', margin: 0, textShadow: '0 0 20px hsla(var(--primary), 0.5)' }}>
            <NeuralDecodeText text="Neural Sync Active" />
          </h2>
          <p className="auth-subtitle" style={{ color: 'hsl(var(--text-muted))', margin: 0 }}>Establish secure connection to resume operations</p>
        </div>

        {error && (
          <div className="auth-error-alert" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'hsla(var(--danger), 0.1)', color: 'hsl(var(--danger))', borderRadius: '8px', border: '1px solid hsla(var(--danger), 0.3)' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'hsl(var(--text-main))' }}>Email Address</label>
            <div className={`input-with-icon ${fieldErrors.email ? 'has-error' : ''}`} style={{ position: 'relative' }}>
              <Mail className="input-icon" size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
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
                style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', background: 'hsla(0,0%,100%,0.02)', border: '1px solid hsla(0,0%,100%,0.05)', color: 'hsl(var(--text-main))', fontSize: '15px', outline: 'none' }}
              />
            </div>
            {fieldErrors.email && (
              <span className="field-error-message" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'hsl(var(--danger))', fontSize: '12px', marginTop: '6px' }}>
                <AlertCircle size={14} />
                {fieldErrors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'hsl(var(--text-main))' }}>Password</label>
            <div className={`input-with-icon ${fieldErrors.password ? 'has-error' : ''}`} style={{ position: 'relative' }}>
              <Lock className="input-icon" size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
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
                style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', background: 'hsla(0,0%,100%,0.02)', border: '1px solid hsla(0,0%,100%,0.05)', color: 'hsl(var(--text-main))', fontSize: '15px', outline: 'none' }}
              />
            </div>
            {fieldErrors.password && (
              <span className="field-error-message" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'hsl(var(--danger))', fontSize: '12px', marginTop: '6px' }}>
                <AlertCircle size={14} />
                {fieldErrors.password}
              </span>
            )}
          </div>

          <MagneticButton type="submit" className="btn-primary auth-submit-btn" disabled={loading} style={{ padding: '16px', borderRadius: '100px', fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
            {loading ? (
              <>
                <Loader className="spinner" size={18} />
                Connecting...
              </>
            ) : (
              'Establish Link'
            )}
          </MagneticButton>
        </form>

        <div className="auth-footer" style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'hsl(var(--text-muted))' }}>
          <p>
            No active profile? <Link to="/register" className="auth-link" style={{ color: 'hsl(var(--primary))', textDecoration: 'none', fontWeight: '600' }}>Initialize here</Link>
          </p>
        </div>
      </TiltCard>
    </PageTransition>
  );
}
